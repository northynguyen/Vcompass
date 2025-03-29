import fs from "fs";
import mongoose from "mongoose";
import Accommodation from "../models/accommodation.js";
import userModel from "../models/user.js";
import partnerModel from "../models/partner.js";
import { createNotification } from "./notiController.js";
import { uploadToCloudinaryV2, deleteImageFromCloudinary } from './videoController.js';

export const getListAccomm = async (req, res) => {
  try {

    const { name, minPrice, maxPrice, city, status, filterData } = req.query;
    const query = {};

    if (name) {
      const regex = new RegExp(name.split('').join('.*'), 'i'); 
      query.$or = [
        { name: { $regex: regex } },
        { city: { $regex: regex } }
      ];
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    if (status) {
      query.status = status.toLowerCase();
    }
    if (filterData) {
      console.log(filterData);
    }
    // Fetch accommodations based on the constructed query
    let accommodations = await Accommodation.find(query);

    // If minPrice and maxPrice are provided, filter the accommodations by price
    if (minPrice && maxPrice) {
      accommodations = accommodations
        .map(accommodation => {
          const prices = accommodation.roomTypes.map(room => room.pricePerNight);
          const minRoomPrice = Math.min(...prices);
          const maxRoomPrice = Math.max(...prices);

          return {
            ...accommodation.toObject(),
            price: { minPrice: minRoomPrice, maxPrice: maxRoomPrice }
          };
        })
        .filter(accommodation => {
          // Apply minPrice and maxPrice filters if they exist
          const { minPrice: accommodationMinPrice, maxPrice: accommodationMaxPrice } = accommodation.price;

          const meetsMinPrice = minPrice ? accommodationMaxPrice >= Number(minPrice) : true;
          const meetsMaxPrice = maxPrice ? accommodationMinPrice <= Number(maxPrice) : true;

          return meetsMinPrice && meetsMaxPrice;
        });
    }

    res.json({
      success: true,
      message: "Get data accommodation success",
      accommodations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving accommodations",
      error,
    });
  }
};

export const getAccommodationById = async (req, res) => {
  const { id } = req.params; // Lấy id từ params
  try {
    // Kiểm tra xem id có hợp lệ hay không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    const accommodation = await Accommodation.findById(id); // Tìm accommodation theo id

    // Nếu không tìm thấy accommodation, trả về thông báo lỗi
    if (!accommodation) {
      return res
        .status(404)
        .json({ success: false, message: "Accommodation not found" });
    }

    // Trả về thông tin accommodation dưới dạng JSON
    res.json({
      success: true,
      message: "Get accommodation success",
      accommodation,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Error retrieving accommodation",
      error,
    });
  }
};

export const getListAccommbyPartner = async (req, res) => {
  const { partnerId } = req.params;
  try {
    const accommodations = await Accommodation.find({ idPartner: partnerId });
    res.json({ success: true, accommodations });
  } catch (error) {
    res.json({
      success: false,
      message: "Error retrieving accommodations",
      error,
    });
  }
};

export const addNew = async (req, res) => {
  const { partnerId } = req.params;
  let accommodationData;
  
  try {
    console.log("Request body keys:", Object.keys(req.body));
    console.log("Files received:", req.files ? req.files.map(f => f.originalname) : 'No files');
    
    // Parse the JSON data if it's a string
    if (req.body.hotelData) {
      try {
        accommodationData = typeof req.body.hotelData === 'string' 
          ? JSON.parse(req.body.hotelData) 
          : req.body.hotelData;
      } catch (parseError) {
        console.error("Error parsing hotelData:", parseError);
        return res.status(400).json({
          success: false,
          message: "Invalid hotel data format",
          error: parseError.message
        });
      }
    } else {
      // If hotelData is not provided, use the entire body
      accommodationData = req.body;
    }

    console.log("Parsed accommodation data:", accommodationData);

    // Create new accommodation object
    const newAccommodation = new Accommodation({
      ...accommodationData,
      idPartner: partnerId,
      status: "pending" // Default status
    });

    // Initialize images array if it doesn't exist
    if (!newAccommodation.images) {
      newAccommodation.images = [];
    }

    // Handle image uploads to Cloudinary
    if (req.files && req.files.length > 0) {
      console.log("Uploading images to Cloudinary...");
      const imagePromises = req.files.map(async (file) => {
        try {
          // Check if file buffer is valid
          if (!file.buffer || file.buffer.length === 0) {
            console.error("Empty file buffer detected:", file.originalname);
            return null;
          }
          
          console.log(`Uploading file ${file.originalname} with buffer size ${file.buffer.length}`);
          
          const result = await uploadToCloudinaryV2(file.buffer, 'images', [
            { width: 800, crop: 'scale' },
            { quality: 'auto' }
          ]);

          console.log("Image upload result:", result);
          
          if (!result || !result.secure_url) {
            console.error("Invalid Cloudinary result:", result);
            return null;
          }
          
          return result.secure_url;
        } catch (err) {
          console.error(`Error uploading file ${file.originalname}:`, err);
          return null;
        }
      });
      
      try {
        const uploadedImages = await Promise.all(imagePromises);
        console.log("Uploaded images:", uploadedImages);
        
        // Filter out any null values from failed uploads
        const validImages = uploadedImages.filter(img => img !== null);
        console.log("Valid images to add:", validImages);
        
        // Add the new images to the accommodation
        if (validImages.length > 0) {
          newAccommodation.images = newAccommodation.images.concat(validImages);
        }
      } catch (uploadError) {
        console.error("Error processing uploaded images:", uploadError);
        // Continue without images if there's an error
      }
    }

    console.log("Final accommodation data to save:", {
      name: newAccommodation.name,
      images: newAccommodation.images.length,
      roomTypes: newAccommodation.roomTypes?.length || 0
    });

    // Save the accommodation
    const savedAccommodation = await newAccommodation.save();
    console.log("Saved accommodation with ID:", savedAccommodation._id);

    // Create notification
    try {
      const partner = await partnerModel.findById(partnerId);
      if (partner) {
        const notificationData = {
          idSender: partnerId,
          idReceiver: "admin",
          type: "admin",
          content: `Partner ${partner.name} vừa thêm một dịch vụ: ${newAccommodation.name}`,
          nameSender: partner.name,
          imgSender: partner.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        };

        await createNotification(global.io, notificationData);
      }
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Continue even if notification fails
    }
    
    res.json({
      success: true,
      message: "Add new accommodation successfully",
      accommodation: savedAccommodation,
    });
  } catch (error) {
    console.error("Error in addNew:", error);
    res.status(500).json({
      success: false,
      message: "Error adding new accommodation: " + (error.message || "Unknown error"),
      error: error.message || "Unknown error",
    });
  }
};

// Update an accommodation by partnerId and accommodationId
export const updateAccommodation = async (req, res) => {
  const { partnerId, id } = req.params;
  let updateData;
  
  try {
    // Parse the JSON data if it's a string
    if (typeof req.body.hotelData === 'string') {
      updateData = JSON.parse(req.body.hotelData);
    } else {
      updateData = req.body;
    }

    const accommodation = await Accommodation.findOne({
      _id: id,
      idPartner: partnerId,
    });
    
    if (!accommodation) {
      return res.status(404).json({
        success: false,
        message: "Accommodation not found or partner mismatch",
      });
    }

    // Ensure updateData.images is an array
    const updatedImages = updateData.images ? 
      (Array.isArray(updateData.images) ? updateData.images : [updateData.images]) 
      : [];

    // Handle new uploaded images, if any
    if (req.files && req.files.length > 0) {
      console.log("Uploading new images to Cloudinary...");
      const imagePromises = req.files.map(async (file) => {
        try {
          // Check if file buffer is valid
          if (!file.buffer || file.buffer.length === 0) {
            console.error("Empty file buffer detected:", file.originalname);
            return null;
          }
          
          const result = await uploadToCloudinaryV2(file.buffer, 'images', [
            { width: 800, crop: 'scale' },
            { quality: 'auto' }
          ]);
          console.log("Image result:", result);
          
          if (!result || !result.secure_url) {
            console.error("Invalid Cloudinary result:", result);
            return null;
          }
          
          return result.secure_url;
        } catch (err) {
          console.error(`Error uploading file ${file.originalname}:`, err);
          return null;
        }
      });
      
      const newImageUrls = await Promise.all(imagePromises);
      console.log("Uploaded new images:", newImageUrls);
      
      // Filter out any null values from failed uploads
      const validNewImages = newImageUrls.filter(img => img !== null);
      updatedImages.push(...validNewImages);
    }

    // Ensure existingImages is an array
    const existingImages = accommodation.images ? 
      (Array.isArray(accommodation.images) ? accommodation.images : [accommodation.images]) 
      : [];

    // Filter out images that should be removed
    const imagesToRemove = existingImages.filter(
      (img) => !updatedImages.includes(img)
    );

    // Update accommodation images
    updateData.images = updatedImages;

    // Parse location if it's a string
    if (typeof updateData.location === "string") {
      updateData.location = JSON.parse(updateData.location);
    }

    // Parse contact if it's a string
    if (typeof updateData.contact === "string") {
      updateData.contact = JSON.parse(updateData.contact);
    }

    // Merge updated data into the existing accommodation
    Object.assign(accommodation, updateData);

    // Delete old images from Cloudinary
    if (imagesToRemove.length > 0) {
      console.log("Deleting old images from Cloudinary:", imagesToRemove);
      const deletePromises = imagesToRemove.map(async (imageUrl) => {
        try {
          // Extract public_id from the Cloudinary URL
          const urlParts = imageUrl.split('/');
          const filenameWithExtension = urlParts[urlParts.length - 1];
          const publicId = filenameWithExtension.split('.')[0];
          
          // Use the new function that doesn't require req/res
          await deleteImageFromCloudinary(`images/${publicId}`);
          console.log(`Successfully deleted image: ${publicId}`);
        } catch (err) {
          console.error(`Failed to delete image ${imageUrl}:`, err);
        }
      });

      await Promise.all(deletePromises);
    }

    // Save the updated accommodation
    await accommodation.save();

    res.json({
      success: true,
      message: "Accommodation updated successfully",
      accommodation,
    });
  } catch (error) {
    console.error("Error in updateAccommodation:", error);
    res.status(500).json({
      success: false,
      message: "Error updating accommodation",
      error: error.message,
    });
  }
};

export const updateAccommodationStatusByAdmin = async (req, res) => {
  const { id } = req.params; // ID của accommodation cần cập nhật
  const { status, adminId } = req.body;// Trạng thái mới từ request body
  try {
    const accommodation = await Accommodation.findById(id);
    if (!accommodation) {
      return res.json({
        success: false,
        message: "Accommodation not found",
      });
    }
    accommodation.status = status;
    await accommodation.save();
    // const notificationData = {
    //   idSender: adminId,
    //   idReceiver: accommodation.idPartner,
    //   type: "partner",
    //   content: `Admin vừa ${status === "active" ? "duyệt" : status=== "block" ? "khóa" : "huy"} dịch vụ: ${accommodation.name} `,
    //   nameSender: "Admin",
    //   imgSender: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    // }

    // await createNotification(global.io, notificationData);
    res.json({
      success: true,
      message: "Accommodation status updated successfully",
      accommodation,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Error updating accommodation status",
      error,
    });

    console.error(error);
  }
};

// Add a new room type to an accommodation by partnerId and accommodationId
export const addNewRoom = async (req, res) => {
  const { accommodationId } = req.params;

  try {
    console.log("Adding new room to accommodation:", accommodationId);
    console.log("Request body keys:", Object.keys(req.body));
    console.log("Files received:", req.files ? req.files.map(f => f.originalname) : 'No files');

    // Find the accommodation by ID
    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation) {
      return res.status(404).json({ 
        success: false, 
        message: "Accommodation not found." 
      });
    }

    // Parse the room data
    let roomData;
    try {
      roomData = typeof req.body.roomData === 'string' 
        ? JSON.parse(req.body.roomData) 
        : req.body.roomData;
      
      console.log("Parsed room data:", roomData);
    } catch (parseError) {
      console.error("Error parsing roomData:", parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid room data format",
        error: parseError.message
      });
    }

    // Initialize the room with the provided data
    const newRoom = {
      ...roomData,
      images: []
    };

    // Handle image uploads to Cloudinary
    if (req.files && req.files.length > 0) {
      console.log("Uploading room images to Cloudinary...");
      const imagePromises = req.files.map(async (file) => {
        try {
          // Check if file buffer is valid
          if (!file.buffer || file.buffer.length === 0) {
            console.error("Empty file buffer detected:", file.originalname);
            return null;
          }
          
          console.log(`Uploading file ${file.originalname} with buffer size ${file.buffer.length}`);
          
          const result = await uploadToCloudinaryV2(file.buffer, 'images', [
            { width: 800, crop: 'scale' },
            { quality: 'auto' }
          ]);

          console.log("Room image upload result:", result);
          
          if (!result || !result.secure_url) {
            console.error("Invalid Cloudinary result:", result);
            return null;
          }
          
          return result.secure_url;
        } catch (err) {
          console.error(`Error uploading file ${file.originalname}:`, err);
          return null;
        }
      });
      
      try {
        const uploadedImages = await Promise.all(imagePromises);
        console.log("Uploaded room images:", uploadedImages);
        
        // Filter out any null values from failed uploads
        const validImages = uploadedImages.filter(img => img !== null);
        console.log("Valid room images to add:", validImages);
        
        // Add the new images to the room
        if (validImages.length > 0) {
          newRoom.images = validImages;
        }
      } catch (uploadError) {
        console.error("Error processing uploaded room images:", uploadError);
        // Continue without images if there's an error
      }
    }

    // Add the new room to the accommodation's roomTypes array
    accommodation.roomTypes.push(newRoom);
    
    // Save the updated accommodation
    const updatedAccommodation = await accommodation.save();
    console.log("Added new room to accommodation:", updatedAccommodation._id);

    res.json({
      success: true,
      message: "Room type added successfully.",
      rooms: updatedAccommodation.roomTypes,
    });
  } catch (error) {
    console.error("Error adding new room:", error);
    res.status(500).json({
      success: false,
      message: "Error adding new room: " + (error.message || "Unknown error"),
      error: error.message || "Unknown error",
    });
  }
};

export const deleteRoom = async (req, res) => {
  const { accommodationId, roomTypeId } = req.params;

  try {
    const accommodation = await Accommodation.findOne({ _id: accommodationId });
    if (!accommodation) {
      return res.json({
        success: false,
        message: "Accommodation not found or partner mismatch",
      });
    }
    console.log(roomTypeId);
    const roomType = accommodation.roomTypes.find(rt => rt._id.toString() === roomTypeId);
    if (!roomType) {
      return res.json({ success: false, message: "Room type not found" });
    }

    // Remove images from server before deleting room type
    roomType.images.forEach((image) => {
      fs.unlink(`uploads/${image}`, (err) => {
        if (err) console.error("Error deleting old image:", err);
        else console.log(`Successfully deleted old image: ${image}`);
      });
    });

    accommodation.roomTypes = accommodation.roomTypes.filter(rt => rt._id.toString() !== roomTypeId); // Delete the room type
    await accommodation.save();

    res.json({
      success: true,
      message: "Room type deleted successfully",
      rooms: accommodation.roomTypes,
    });
  } catch (error) {
    res.json({ success: false, message: "Error deleting room type", error });
    console.error(error);
  }
};


export const listRooms = async (req, res) => {
  const { accommodationId } = req.params;
  try {
    const accommodation = await Accommodation.findOne({ _id: accommodationId });
    if (!accommodation) {
      return res.json({
        success: false,
        message: "Accommodation not found or partner mismatch",
      });
    }
    res.json({ success: true, rooms: accommodation.roomTypes, accommodation: accommodation });
  } catch (error) {
    res.json({ success: false, message: "Error getting rooms", error });
  }
};

export const updateRoomType = async (req, res) => {
  const { accommodationId, roomTypeId } = req.params;

  try {
    // Fetch the accommodation by ID
    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation) {
      return res
        .status(404)
        .json({ success: false, message: "Accommodation not found." });
    }

    // Find the specific room type within the accommodation
    const roomType = accommodation.roomTypes.find(rt => rt._id.toString() === roomTypeId);
    if (!roomType) {
      return res.json({ success: false, message: "Room type not found" });
    }

    // Parse the room type update data
    let roomTypeUpdate;
    try {
      roomTypeUpdate = typeof req.body.roomTypeUpdate === 'string' 
        ? JSON.parse(req.body.roomTypeUpdate) 
        : req.body.roomTypeUpdate;
    } catch (err) {
      console.error("Error parsing roomTypeUpdate:", err);
      return res.status(400).json({ 
        success: false, 
        message: "Invalid room type data format" 
      });
    }

    // Ensure images array exists
    let updatedImages = roomTypeUpdate.images || [];
    if (!Array.isArray(updatedImages)) {
      updatedImages = [updatedImages].filter(Boolean);
    }

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      console.log("Uploading room images to Cloudinary...");
      console.log("Files to upload:", req.files.map(f => ({ name: f.originalname, size: f.size })));
      
      const imagePromises = req.files.map(async (file) => {
        try {
          // Check if file buffer is valid
          if (!file.buffer || file.buffer.length === 0) {
            console.error("Empty file buffer detected:", file.originalname);
            return null;
          }
          
          console.log(`Uploading file ${file.originalname} with buffer size ${file.buffer.length}`);
          
          const result = await uploadToCloudinaryV2(file.buffer, 'images', [
            { width: 800, crop: 'scale' },
            { quality: 'auto' }
          ]);
          
          console.log("Room image upload result:", result);
          
          if (!result || !result.secure_url) {
            console.error("Invalid Cloudinary result:", result);
            return null;
          }
          
          return result.secure_url;
        } catch (err) {
          console.error(`Error uploading file ${file.originalname}:`, err);
          return null;
        }
      });
      
      const newImageUrls = await Promise.all(imagePromises);
      console.log("Uploaded room images:", newImageUrls);
      
      // Filter out any null values from failed uploads
      const validNewImages = newImageUrls.filter(img => img !== null);
      updatedImages = updatedImages.concat(validNewImages);
    }

    // Get existing images
    const existingImages = roomType.images || [];
    
    // Find images to remove
    const imagesToRemove = existingImages.filter(
      (img) => !updatedImages.includes(img)
    );

    // Update the room type data
    roomTypeUpdate.images = updatedImages;
    Object.assign(roomType, roomTypeUpdate);

    // Delete old images from Cloudinary
    if (imagesToRemove.length > 0) {
      console.log("Deleting old room images from Cloudinary:", imagesToRemove);
      const deletePromises = imagesToRemove.map(async (imageUrl) => {
        try {
          // Extract public_id from the Cloudinary URL
          const urlParts = imageUrl.split('/');
          const filenameWithExtension = urlParts[urlParts.length - 1];
          const publicId = filenameWithExtension.split('.')[0];
          
          // Use the new function that doesn't require req/res
          await deleteImageFromCloudinary(`images/${publicId}`);
          console.log(`Successfully deleted room image: ${publicId}`);
        } catch (err) {
          console.error(`Failed to delete image ${imageUrl}:`, err);
        }
      });

      await Promise.all(deletePromises);
    }

    // Save the updated accommodation
    await accommodation.save();

    res.json({
      success: true,
      message: "Room type updated successfully.",
      rooms: accommodation.roomTypes,
    });
  } catch (error) {
    console.error("Error updating room type:", error);
    res.status(500).json({
      success: false,
      message: "Error updating room type.",
      error: error.message,
    });
  }
};

export const addReview = async (req, res) => {
  try {
    const { id } = req.params; // ID of the accommodation
    const reviewData = req.body; // Data for the new review
    console.log(reviewData);
    // Validate the required fields for the rating
    if (!reviewData.idUser || !reviewData.userName || !reviewData.userImage || !reviewData.rate || !reviewData.content) {
      return res.status(400).json({ success: false, message: "Required fields are missing." });
    }

    // Find the accommodation by ID and add the review to the ratings array
    const accommodation = await Accommodation.findByIdAndUpdate(
      id,
      { $push: { ratings: reviewData } },
      { new: true }
    );

    if (!accommodation) {
      return res.status(404).json({ success: false, message: "Accommodation not found." });
    }

    const notificationData = {
      idSender: reviewData.idUser,
      idReceiver: accommodation.idPartner,
      type: "partner",
      nameSender: reviewData.userName,
      imgSender: reviewData.userImage,
      content: `${reviewData.userName} đã đánh giá khach san của bạn với điểm ${reviewData.rate} sao.`,
    };

    await createNotification(global.io, notificationData);

    res.status(200).json({ success: true, message: "Review added successfully.", accommodation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while adding the review." });
  }
};
export const updateRatingResponse = async (req, res) => {
  const { accommodationId, ratingId } = req.params; // Nhận accommodationId và ratingId từ URL
  const { response, responseTime } = req.body; // Nhận dữ liệu phản hồi từ body

  try {
      // Tìm accommodation theo accommodationId
      const accommodation = await Accommodation.findById(accommodationId);

      if (!accommodation) {
          return res.status(404).json({ error: 'Accommodation not found' });
      }

      // Tìm rating trong mảng ratings của accommodation
      const rating = accommodation.ratings.id(ratingId); // Sử dụng phương thức `id()` của Mongoose để tìm rating theo ratingId

      if (!rating) {
          return res.status(404).json({ error: 'Rating not found' });
      }

      // Cập nhật phản hồi và thời gian phản hồi
      rating.response = response;
      rating.responseTime = responseTime || new Date();

      // Lưu thay đổi vào cơ sở dữ liệu
      await accommodation.save();

      // Trả về kết quả thành công
      res.status(200).json({ message: 'Phản hồi thành công' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
  }
};

export const getAccommWishList = async (req, res) => {
  const { userId } = req.body; 

  try {
      const user = await userModel.findById(userId);
      if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
      }

      const accomms = await Accommodation.find({ _id: { $in: user.favorites.accommodation } });
      if (!accomms.length) {
          return res.json({ success: true, message: "No accommodations found in wishlist" , accommodations: []});
      }

      return res.json({
          success: true,
          message: "Wishlist accommodations retrieved successfully",
          accommodations: accomms,
      });
  } catch (error) {
      console.error("Error retrieving wishlist accommodations:", error);
      res.status(500).json({
          success: false,
          message: "Error retrieving wishlist accommodations",
      })
    }
}

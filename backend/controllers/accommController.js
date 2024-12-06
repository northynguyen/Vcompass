import fs from "fs";
import mongoose from "mongoose";
import Accommodation from "../models/accommodation.js";
import userModel from "../models/user.js";
import partnerModel from "../models/partner.js";
import { createNotification } from "./notiController.js";
export const getListAccomm = async (req, res) => {
  try {
    const { name, minPrice, maxPrice, city, status , rating} = req.query;

    const query = {};

    // Filter by name if provided (case-insensitive search)
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    // Filter by city if provided
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    if (status) {
      query.status = status.toLowerCase();
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
  const accommodationData = req.body;
  if (typeof accommodationData.location === "string") {
    accommodationData.location = JSON.parse(accommodationData.location);
  }

  // Parse contact if it's a string
  if (typeof accommodationData.contact === "string") {
    accommodationData.contact = JSON.parse(accommodationData.contact);
  }

  try {
    const newAccommodation = new Accommodation({
      ...accommodationData,
      idPartner: partnerId,
      images: req.files ? req.files.map((file) => file.filename) : [], // Store uploaded images
    });

    await newAccommodation.save();
    const partner = await partnerModel.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found" });
    }

    const notificationData = {
      idSender: partnerId,
      idReceiver: "admin",
      type: "admin",
      content: `Partner ${partner.name} vừa thêm một dịch vụ: ${newAccommodation.name}`,
      nameSender: partner.name,
      imgSender: partner.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    }

    await createNotification(global.io, notificationData);
    res.json({
      success: true,
      message: "Accommodation added successfully",
      accommodation: newAccommodation,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Error adding new accommodation",
      error,
    });
    console.error(error);
  }
};

// Update an accommodation by partnerId and accommodationId
export const updateAccommodation = async (req, res) => {
  const { partnerId, id } = req.params;
  const updateData = req.body;

  try {
    const accommodation = await Accommodation.findOne({
      _id: id,
      idPartner: partnerId,
    });
    if (!accommodation) {
      return res.json({
        success: false,
        message: "Accommodation not found or partner mismatch",
      });
    }

    // Ensure updateData.images is an array
    const updatedImages = updateData.images ? updateData.images : [];

    // Handle new uploaded images, if any
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map((file) => file.filename);
      updatedImages.push(...newImagePaths);
    }

    // Ensure existingImages is an array
    const existingImages = accommodation.images ? accommodation.images : [];

    // Filter out images that should be removed
    const imagesToRemove = existingImages.filter(
      (img) => updatedImages.includes(img) === false
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

    // Function to delete an image from the server
    const deleteImage = (imageName) => {
      return new Promise((resolve, reject) => {
        fs.unlink(`uploads/${imageName}`, (err) => {
          if (err) {
            console.error(`Failed to delete image ${imageName}:`, err);
            resolve(); // Continue even if one image fails to delete
          } else {
            resolve();
          }
        });
      });
    };

    // Delete all images that are no longer associated with the accommodation
    await Promise.all(imagesToRemove.map((image) => deleteImage(image)));

    // Save the updated accommodation
    await accommodation.save();

    res.json({
      success: true,
      message: "Accommodation updated successfully",
      accommodation,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Error updating accommodation",
      error,
    });
    console.error(error);
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
  const roomTypeData = JSON.parse(req.body.roomTypeUpdate);

  console.log(roomTypeData);


  try {
    const accommodation = await Accommodation.findOne({ _id: accommodationId });
    if (!accommodation) {
      return res.json({
        success: false,
        message: "Accommodation not found or partner mismatch",
      });
    }

    const existingRoomType = accommodation.roomTypes.find(
      (room) =>
        room.nameRoomType.toLowerCase() ===
        roomTypeData.nameRoomType.toLowerCase()
    );
    if (existingRoomType) {
      return res.json({ success: false, message: "Room type already exists" });
    }

    const newRoomType = {
      idRoomType: new mongoose.Types.ObjectId(),
      ...roomTypeData,
      images: req.files ? req.files.map((file) => file.filename) : [], // Store uploaded images
    };

    accommodation.roomTypes.push(newRoomType); // Add new room type
    await accommodation.save();

    res.json({
      success: true,
      message: "Room type added successfully",
      rooms: accommodation.roomTypes,
    });
  } catch (error) {
    console.error("Error adding new room type:", error);
    res.json({ success: false, message: "Error adding new room type" });
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

    const roomTypeUpdate = JSON.parse(req.body.roomTypeUpdate);
    let updatedImages = roomTypeUpdate.images || [];

    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map((file) => file.filename);
      updatedImages = updatedImages.concat(newImagePaths);
    }

    const existingImages = roomType.images || [];
    const imagesToRemove = existingImages.filter(
      (img) => !roomTypeUpdate.images.includes(img)
    );

    roomTypeUpdate.images = updatedImages;

    Object.assign(roomType, roomTypeUpdate);

    const deleteImage = (imageName) => {
      return new Promise((resolve, reject) => {
        fs.unlink(`uploads/${imageName}`, (err) => {
          if (err) {
            console.error(`Failed to delete image ${imageName}:`, err);
            // Decide whether to reject or resolve based on your needs
            // Here, we resolve to continue even if one image fails to delete
            resolve();
          } else {
            resolve();
          }
        });
      });
    };

    // Delete all images that are no longer associated with the room
    await Promise.all(imagesToRemove.map((image) => deleteImage(image)));
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

import fs from "fs";
import mongoose from "mongoose";
import FoodService from "../models/foodService.js";
import userModel from "../models/user.js";
import partnerModel from "../models/partner.js";
import { name } from "@cloudinary/url-gen/actions/namedTransformation";
import { createNotification } from "./notiController.js";
import { uploadToCloudinaryV2, deleteImage } from './videoController.js';

const getListFoodService = async (req, res) => {
  try {
    const { name, minPrice, maxPrice, city, status } = req.query;
    // Build query object
    const query = {};

    // Add name filter if provided
    if (name) {
      query.$or = [
        { "foodServiceName": { $regex: name, $options: 'i' } }, // Tìm kiếm trong tên địa điểm
        { "city": { $regex: name, $options: 'i' } }, // Tìm kiếm trong tên tính
      ];
    }

    // Add price range filter if provided
    if (minPrice && maxPrice) {
      query["price.minPrice"] = minPrice ? { $gte: Number(minPrice) } : undefined;
      query["price.maxPrice"] = maxPrice ? { $lte: Number(maxPrice) } : undefined;
    }

    // Add city filter if provided
    if (city) {
      query.city = { $regex: city, $options: "i" };
    }
    if (status) {
      query.status = status.toLowerCase();
    }
    
    // Execute query with population
    const foodService = await FoodService.find(query)
      .populate({
        path: 'ratings.idUser',
        model: 'user',
        select: 'name avatar email'
      });

    res.status(200).json({
      success: true,
      message: "Get list food service successfully",
      foodService: foodService,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "Error getting food service",
    });
    console.log(error);
  }
};
export const getFoodServiceById = async (req, res) => {
  const { id } = req.params; // Lấy id từ params
  try {
    // Kiểm tra xem id có hợp lệ hay không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    // Tìm food service theo id và populate thông tin người dùng trong ratings
    const foodService = await FoodService.findById(id)
      .populate({
        path: 'ratings.idUser',
        model: 'user',
        select: 'name avatar email'
      });

    // Nếu không tìm thấy food service, trả về thông báo lỗi
    if (!foodService) {
      return res
        .status(404)
        .json({ success: false, message: "Food service not found" });
    }

    // Trả về thông tin food service dưới dạng JSON
    res
      .status(200)
      .json({
        success: true,
        message: "Get food service successfully",
        foodService,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error getting food service", error });
    console.log(error);
  }
};

const getListByPartner = async (req, res) => {
  const partnerId = req.params.partnerId;
  try {
    const foodService = await FoodService.find({ idPartner: partnerId });
    if (!foodService) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Food service not found or partner mismatch",
        });
    }
    
    res
      .status(200)
      .json({
        success: true,
        message: "Get list food service successfully",
        foodService: foodService,
      });
  } catch (error) {
    res
      .status(404)
      .json({ success: false, message: "Error getting food service" });
    console.log(error);
  }
};
const getAdminGetListByPartner = async (req, res) => {
  const partnerId = req.params.partnerId;
  try {
    const foodService = await FoodService.find({ idPartner: partnerId });
    if (!foodService) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Food service not found or partner mismatch",
        });
    }
    res
      .status(200)
      .json({
        success: true,
        message: "Get list food service successfully",
        foodServices: foodService,
      });
  } catch (error) {
    res
      .status(404)
      .json({ success: false, message: "Error getting food service" });
    console.log(error);
  }
};

const createFoodService = async (req, res) => {
  const idPartner = req.userId;
  try {
    const newFoodService = new FoodService(
      JSON.parse(req.body.foodServiceData)
    );
    newFoodService.idPartner = idPartner;
    console.log("newFoodService:", newFoodService);

    // Check and save images if present
    if (req.files) {
      if (req.files.images) {
        const imagePromises = req.files.images.map(async (file) => {
          const result = await uploadToCloudinaryV2(file.buffer, 'foodServices', [
            { width: 800, crop: 'scale' },
            { quality: 'auto' }
          ]);
          return result.secure_url;
        });
        
        const images = await Promise.all(imagePromises);
        newFoodService.images = images;
      }

      // Check and save menuImages if present
      if (req.files.menuImages) {
        const menuImagePromises = req.files.menuImages.map(async (file) => {
          const result = await uploadToCloudinaryV2(file.buffer, 'foodServicesMenu', [
            { width: 800, crop: 'scale' },
            { quality: 'auto' }
          ]);
          return result.secure_url;
        });
        
        const menuImages = await Promise.all(menuImagePromises);
        newFoodService.menuImages = menuImages;
      }
    }

    await newFoodService.save();
    
    const partner = await partnerModel.findById(idPartner);
    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found" });
    }

    const notificationData = {
      idSender: idPartner,
      idReceiver: "admin",
      type: "admin",
      content: `Partner ${partner.name} vừa thêm một dịch vụ ăn uống: ${newFoodService.name}`,
      nameSender: partner.name || "Partner",
      imgSender: partner.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    };


    await createNotification(global.io, notificationData);
    res.status(201).json({
      success: true,
      message: "Create food service successfully",
      newFoodService: newFoodService,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating food service",
    });
    console.log(error);
  }
};

const updateFoodService = async (req, res) => {
  const foodServiceId = req.body.Id;
  
  try {
    console.log("Updating food service:", foodServiceId);
    console.log("Request body keys:", Object.keys(req.body));
    console.log("Files received:", req.files ? (Array.isArray(req.files) ? req.files.length : Object.keys(req.files)) : 'No files');
    
    let updateData;
    try {
      updateData = typeof req.body.foodServiceData === 'string' 
        ? JSON.parse(req.body.foodServiceData) 
        : req.body.foodServiceData;
    } catch (parseError) {
      console.error("Error parsing foodServiceData:", parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid food service data format",
        error: parseError.message
      });
    }

    const foodService = await FoodService.findById(foodServiceId);
    if (!foodService) {
      return res
        .status(404)
        .json({ success: false, message: "Food service not found" });
    }

    // Handle images and menuImages
    let updatedImages = updateData.images || [];
    if (!Array.isArray(updatedImages)) {
      updatedImages = [updatedImages].filter(Boolean);
    }
    
    let updatedMenuImages = updateData.menuImages || [];
    if (!Array.isArray(updatedMenuImages)) {
      updatedMenuImages = [updatedMenuImages].filter(Boolean);
    }

    // Process uploaded files
    if (req.files) {
      // Check if req.files is an array or an object with named properties
      if (Array.isArray(req.files)) {
        // Handle array of files (all treated as regular images)
        console.log("Processing array of files:", req.files.length);
        
        const imagePromises = req.files.map(async (file) => {
          try {
            if (!file.buffer || file.buffer.length === 0) {
              console.error("Empty file buffer detected:", file.originalname);
              return null;
            }
            
            console.log(`Uploading file ${file.originalname} with buffer size ${file.buffer.length}`);
            
            const result = await uploadToCloudinaryV2(file.buffer, 'images', [
              { width: 800, crop: 'scale' },
              { quality: 'auto' }
            ]);
            
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
        
        const uploadedImages = await Promise.all(imagePromises);
        const validImages = uploadedImages.filter(img => img !== null);
        
        if (validImages.length > 0) {
          updatedImages = updatedImages.concat(validImages);
        }
      } else {
        // Handle object with named properties
        // Process regular images
        if (req.files.images) {
          console.log("Processing images:", req.files.images.length);
          
          const imagePromises = req.files.images.map(async (file) => {
            try {
              if (!file.buffer || file.buffer.length === 0) {
                console.error("Empty file buffer detected:", file.originalname);
                return null;
              }
              
              const result = await uploadToCloudinaryV2(file.buffer, 'images', [
                { width: 800, crop: 'scale' },
                { quality: 'auto' }
              ]);
              
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
          
          const uploadedImages = await Promise.all(imagePromises);
          const validImages = uploadedImages.filter(img => img !== null);
          
          if (validImages.length > 0) {
            updatedImages = updatedImages.concat(validImages);
          }
        }
        
        // Process menu images
        if (req.files.menuImages) {
          console.log("Processing menu images:", req.files.menuImages.length);
          
          const menuImagePromises = req.files.menuImages.map(async (file) => {
            try {
              if (!file.buffer || file.buffer.length === 0) {
                console.error("Empty file buffer detected:", file.originalname);
                return null;
              }
              
              const result = await uploadToCloudinaryV2(file.buffer, 'images', [
                { width: 800, crop: 'scale' },
                { quality: 'auto' }
              ]);
              
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
          
          const uploadedMenuImages = await Promise.all(menuImagePromises);
          const validMenuImages = uploadedMenuImages.filter(img => img !== null);
          
          if (validMenuImages.length > 0) {
            updatedMenuImages = updatedMenuImages.concat(validMenuImages);
          }
        }
      }
    }

    console.log("Updated images:", updatedImages.length);
    console.log("Updated menu images:", updatedMenuImages.length);

    // Find images to remove
    const imagesToRemove = foodService.images.filter(
      (img) => !updatedImages.includes(img)
    );
    
    const menuImagesToRemove = foodService.menuImages.filter(
      (img) => !updatedMenuImages.includes(img)
    );

    // Update the food service data
    updateData.images = updatedImages;
    updateData.menuImages = updatedMenuImages;

    // Merge updated data into the existing food service
    Object.assign(foodService, updateData);

    // Delete old images from Cloudinary
    if (imagesToRemove.length > 0) {
      console.log("Deleting old images from Cloudinary:", imagesToRemove);
      const deleteImagePromises = imagesToRemove.map(async (imageUrl) => {
        try {
          // Extract public_id from the Cloudinary URL
          const urlParts = imageUrl.split('/');
          const filenameWithExtension = urlParts[urlParts.length - 1];
          const publicId = filenameWithExtension.split('.')[0];
          
          await deleteImageFromCloudinary(`images/${publicId}`);
          console.log(`Successfully deleted image: ${publicId}`);
        } catch (err) {
          console.error(`Failed to delete image ${imageUrl}:`, err);
        }
      });
      
      await Promise.all(deleteImagePromises);
    }

    if (menuImagesToRemove.length > 0) {
      console.log("Deleting old menu images from Cloudinary:", menuImagesToRemove);
      const deleteMenuImagePromises = menuImagesToRemove.map(async (imageUrl) => {
        try {
          // Extract public_id from the Cloudinary URL
          const urlParts = imageUrl.split('/');
          const filenameWithExtension = urlParts[urlParts.length - 1];
          const publicId = filenameWithExtension.split('.')[0];
          
          await deleteImageFromCloudinary(`images/${publicId}`);
          console.log(`Successfully deleted menu image: ${publicId}`);
        } catch (err) {
          console.error(`Failed to delete menu image ${imageUrl}:`, err);
        }
      });
      
      await Promise.all(deleteMenuImagePromises);
    }

    // Save the updated food service
    await foodService.save();
    console.log("Food service updated successfully");

    res.status(200).json({
      success: true,
      message: "Updated food service successfully",
      updatedFoodService: foodService,
    });
  } catch (error) {
    console.error("Error updating food service:", error);
    res.status(400).json({ 
      success: false, 
      message: "Error updating food service: " + (error.message || "Unknown error"),
      error: error.message || "Unknown error"
    });
  }
};

const updateStatusFoodServiceAdmin = async (req, res) => {
  const foodServiceId = req.params.foodServiceId;
  const { status, adminId } = req.body; // Nhận dữ liệu từ request body
  console.log("foodServiceId:", foodServiceId);
  try {
    // Tìm foodService theo ID
    const foodService = await FoodService.findById(foodServiceId);

    if (!foodService) {
      return res
        .status(404)
        .json({ success: false, message: "Food service not found" });
    }

    // Cập nhật trạng thái và adminId
    foodService.status = status;
    foodService.adminId = adminId;

    // Lưu thay đổi vào database
    await foodService.save();

    res.status(200).json({
      success: true,
      message: "Updated food service status successfully",
      updatedFoodService: foodService,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: "Error updating food service status" });
    console.error("Error updating food service status:", error);
  }
};

const deleteFoodService = async (req, res) => {
  const { foodServiceId } = req.body; // Corrected
  const userId = req.userId;

  try {
    const foodService = await FoodService.find({
      _id: foodServiceId,
      idPartner: userId,
    });
    if (!foodService) {
      return res
        .status(404)
        .json({ success: false, message: "Food service not found" });
    }

    // Function to delete images from the file system
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

    // Delete all associated images and menuImages from the file system
    await Promise.all(foodService.images.map((image) => deleteImage(image)));
    await Promise.all(
      foodService.menuImages.map((image) => deleteImage(image))
    );

    // Remove the food service from the database
    await foodService.remove();

    res.status(200).json({
      success: true,
      message: "Delete food service successfully",
      deletedFoodService: foodService, // You can return the deleted service if needed
    });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: "Error deleting food service" });
    console.log(error);
  }
};

const addReview = async (req, res) => {
  const id = req.params.id;
  try {
    const reviewData = req.body; // Data for the new review
    console.log(reviewData);
    
    // Validate the required fields for the rating
    if (!reviewData.idUser || !reviewData.rate || !reviewData.content) {
      return res
        .status(400)
        .json({ success: false, message: "Required fields are missing." });
    }

    // Get user information from database
    const user = await userModel.findById(reviewData.idUser);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Create a complete rating object with all fields
    const newRating = {
      idUser: reviewData.idUser,
      rate: reviewData.rate,
      content: reviewData.content,
      createdAt: new Date(),
      serviceRate: reviewData.serviceRate || 0,
      foodRate: reviewData.foodRate || 0,
    };

    // Find the food service by ID and add the review to the ratings array
    const foodService = await FoodService.findByIdAndUpdate(
      id,
      { $push: { ratings: newRating } },
      { new: true }
    );

    if (!foodService) {
      return res
        .status(404)
        .json({ success: false, message: "Food service not found." });
    }
    
    const notificationData = {
      idSender: reviewData.idUser,
      idReceiver: foodService.idPartner,
      nameSender: user.name,
      type: "partner",
      imgSender: user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      content: `${user.name} đã đánh giá dịch vụ ăn uống của bạn với điểm ${reviewData.rate} sao.`,
    }

    await createNotification(global.io, notificationData);

    res.status(200).json({ success: true, message: "Review added successfully.", foodService });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while adding the review." });
  }
};
export const updateRatingResponse = async (req, res) => {
  const { foodServiceId, ratingId } = req.params; // Nhận accommodationId và ratingId từ URL
  const { response, responseTime } = req.body; // Nhận dữ liệu phản hồi từ body

  try {
    // Tìm accommodation theo accommodationId
    const foodService = await FoodService.findById(foodServiceId);

    if (!foodService) {
      return res.status(404).json({ error: "foodService not found" });
    }

    // Tìm rating trong mảng ratings của accommodation
    const rating = foodService.ratings.id(ratingId); // Sử dụng phương thức `id()` của Mongoose để tìm rating theo ratingId

    if (!rating) {
      return res.status(404).json({ error: "Rating not found" });
    }

    // Cập nhật phản hồi và thời gian phản hồi
    rating.response = response;
    rating.responseTime = responseTime || new Date();

    // Lưu thay đổi vào cơ sở dữ liệu
    await foodService.save();

    // Trả về kết quả thành công
    res.status(200).json({ message: "Phản hồi thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const getWishlist = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const wishlist = await FoodService.find({ _id: { $in: user.favorites.foodService } });
    if (!wishlist.length) {
      return res.status(200).json({ success: true, message: "No food services found in wishlist", foodServices: [] });
    }

    res.status(200).json({ success: true, foodServices: wishlist });
  } catch (error) {
    console.error("Error retrieving wishlist:", error);
    res.status(500).json({ success: false, message: "Error retrieving wishlist" });
  }
};
export const searchFoodServices = async (req, res) => {
  try {
    const {
      amenities,
      minRating,
      minPrice,
      maxPrice,
      serviceType,
      status,
      keyword,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    // Tìm theo tiện ích (amenities)
    if (amenities) {
      const amenitiesArray = amenities.split(",");
      query.amenities = { $all: amenitiesArray };
    }

    if (keyword) {
      query.$or = [
        { foodServiceName: { $regex: keyword, $options: "i" } }, // Tìm trong tên
        { city: { $regex: keyword, $options: "i" } }             // Tìm trong thành phố
      ];
    }


    // Lọc theo loại dịch vụ (restaurant, cafe, bar, etc.)
    if (serviceType) {
      query.serviceType = serviceType;
    }



    // Lọc theo trạng thái (active, pending, block, unActive)
    if (status) {
      query.status = status;
    }

    // Lọc theo khoảng giá
    if (minPrice || maxPrice) {
      query["price.minPrice"] = { $gte: Number(minPrice) || 0 };
      query["price.maxPrice"] = { $lte: Number(maxPrice) || Infinity };
    }

    // Lọc theo rating lớn hơn mức tối thiểu
    if (minRating) {
      query["ratings.rating"] = { $gte: Number(minRating) };
    }

    // Phân trang
    const skip = (Number(page) - 1) * Number(limit);

    // Tìm kiếm food services phù hợp
    const foodServices = await FoodService.find(query)
      .skip(skip)
      .limit(Number(limit));

    // Tổng số kết quả tìm thấy
    const total = await FoodService.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: foodServices,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server!", error: error.message });
  }
};

export { getListFoodService, getListByPartner, createFoodService, updateFoodService, deleteFoodService, addReview, getAdminGetListByPartner, updateStatusFoodServiceAdmin, getWishlist };
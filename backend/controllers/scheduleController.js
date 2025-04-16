import mongoose from "mongoose";
import Schedule from "../models/schedule.js";
import User from "../models/user.js";
import { upload } from '../middleware/upload.js'
import multer from 'multer';
import { createNotification } from "./notiController.js";
import { ObjectId } from "mongodb";
import { uploadToCloudinaryV2 } from './videoController.js';

export const addSchedule = async (req, res) => {
  try {
    const { userId, schedule } = req.body;
    let newSchedule
    if (userId){
      newSchedule = new Schedule({ ...schedule, idUser: userId });
    } else{
      newSchedule = new Schedule({ ...schedule});
    }
    console.log(newSchedule);
    await newSchedule.save();
    res.json({
      success: true,
      message: "Schedule added successfully",
      schedule: newSchedule,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error adding Schedule" });
  }
};
export const getScheduleById = async (req, res) => {
  const { id } = req.params;
  const { activityId } = req.query;
  const userId = req.user?._id; // Giả sử bạn có middleware auth để lấy user

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    // Lấy thông tin schedule
    const schedule = await Schedule.findById(id)
      .populate("idUser")
      .populate("idInvitee", "name avatar email");

    if (!schedule) {
      return res
        .status(404)
        .json({ success: false, message: "Schedule not found" });
    }

    // Kiểm tra quyền chỉnh sửa
    const canEdit = schedule.idUser.equals(userId) || 
                   schedule.idInvitee.some(invitee => invitee._id.equals(userId));

    // Nếu có activityId, tìm activity cụ thể trong schedule.activities
    if (activityId) {
      const activity = schedule.activities
        .flatMap((day) => day.activity)
        .find((act) => act._id.toString() === activityId);

      if (!activity) {
        return res
          .status(404)
          .json({ success: false, message: "Activity not found" });
      }

      return res.json({
        success: true,
        message: "Activity retrieved successfully",
        other: activity,
      });
    }

    // Trả về toàn bộ schedule nếu không có activityId
    res.json({
      success: true,
      message: "Get schedule success",
      schedule,
      canEdit // Thêm flag này vào response
    });
  } catch (error) {
    console.error("Error retrieving schedule:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving schedule",
      error,
    });
  }
};

export const updateSchedule = async (req, res) => {
  const { id } = req.params ;

  const scheduleData = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    console.log("scheduleData", scheduleData);
    const updatedSchedule = await Schedule.findByIdAndUpdate(id, scheduleData, {
      new: true,
    });
    if (!updatedSchedule) {
      return res
        .status(404)
        .json({ success: false, message: "Schedule not found" });
    }

    res.json({
      success: true,
      message: "Schedule updated successfully",
      schedule: updatedSchedule,
    });
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({
      success: false,
      message: "Error updating schedule",
      error: error.message,
    });
  }
};


export const getSchedulesByIdUser = async (req, res) => {
  const { userId } = req.body; // Replace with user ID extraction from token, if needed.
  const { type, id } = req.query;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    if (type === "group") {
      console.log("type group -------");
      const schedules = await Schedule.find({ 
        idInvitee: new mongoose.Types.ObjectId(userId) 
    });
      if (!schedules.length) {
        return res.json({
          success: false,
          message: "No schedules found for this user",
        });
      }

      return res.json({
        success: true,
        message: "Schedules retrieved successfully",
        schedules,
      })
    }
    if (type === "wishlist") {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const schedules = await Schedule.find({ _id: { $in: user.favorites.schedule } }).populate("idUser");
      if (!schedules.length) {
        return res.json({ success: true, message: "No schedules found in wishlist", schedules: [] });
      }

      return res.json({
        success: true,
        message: "Wishlist schedules retrieved successfully",
        schedules,
      });
    }
     else {
      const idUserFind = type === "follower" ? id : userId;
      console.log("idUserFind : ", idUserFind);
      if (!idUserFind) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const schedules = await Schedule.find({ idUser: idUserFind }).populate("idUser");
      if (!schedules.length) {
        return res.status(404).json({
          success: false,
          message: "No schedules found for this user",
        });
      }

      return res.json({
        success: true,
        message: "Schedules retrieved successfully",
        schedules,
      });
    }
  } catch (error) {
    console.error("Error retrieving schedules:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving schedules",
      error,
    });
  }
};

export const getAllSchedule = async (req, res) => {
  try {
    // Lấy các query từ request
    const {
      cities, // Danh sách thành phố (truyền dưới dạng mảng hoặc chuỗi phân tách bởi dấu phẩy)
      sortBy = "likes", // Default to "likes"
      page = 1, // Trang hiện tại
      limit = 10, // Số lượng mỗi trang
      forHomePage = false, // Cờ chỉ định request đến từ trang Home
      userId = null, // ID của user hiện tại để loại trừ
    } = req.query;

    // Xử lý cities thành mảng nếu được truyền dưới dạng chuỗi
    const cityList = cities ? cities.split(",") : [];

    // Tạo điều kiện tìm kiếm - luôn lấy isPublic=true
    const query = { isPublic: true };
    
    // Loại bỏ lịch trình của user hiện tại nếu có userId được cung cấp
    if (userId) {
      query.idUser = { $ne: userId }; // Không lấy lịch trình của user hiện tại
    }
    
    if (cityList.length > 0) {
      query.address = { $in: cityList }; // Tìm kiếm lịch trình có địa chỉ thuộc danh sách thành phố
    }

    // Lựa chọn sắp xếp
    let sortOptions = {};
    if (sortBy === "likes") {
      sortOptions = { "likes.length": -1 }; // Sắp xếp theo số lượng lượt thích giảm dần
    } else if (sortBy === "comments") {
      sortOptions = { "comments.length": -1 }; // Sắp xếp theo số lượng bình luận giảm dần
    } else {
      sortOptions = { createdAt: -1 }; // Mặc định sắp xếp theo ngày tạo mới nhất
    }

    // Nếu request từ trang Home, xử lý theo yêu cầu đặc biệt
    if (forHomePage === 'true') {
      if (cityList.length > 0) {
        // Lấy schedule được like nhiều nhất cho mỗi thành phố
        const schedulesByCity = [];
        
        // Lấy schedule phổ biến nhất cho mỗi thành phố
        for (const city of cityList) {
          const cityQuery = { address: city, isPublic: true };
          
          // Loại bỏ lịch trình của user hiện tại
          if (userId) {
            cityQuery.idUser = { $ne: userId };
          }
          
          const citySchedule = await Schedule.findOne(cityQuery)
            .populate("idUser")
            .sort(sortOptions)
            .limit(1);
            
          if (citySchedule) {
            schedulesByCity.push(citySchedule);
          }
        }
        
        if (schedulesByCity.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy lịch trình phù hợp.",
          });
        }
        
        return res.json({
          success: true,
          message: "Lấy danh sách lịch trình thành công.",
          schedules: schedulesByCity,
        });
      } else {
        // Nếu không có danh sách thành phố, lấy 6 lịch trình được like nhiều nhất
        const homeQuery = { isPublic: true };
        
        // Loại bỏ lịch trình của user hiện tại
        if (userId) {
          homeQuery.idUser = { $ne: userId };
        }
        
        const schedules = await Schedule.find(homeQuery)
          .populate("idUser")
          .sort(sortOptions)
          .limit(6);

        if (!schedules || schedules.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy lịch trình phù hợp.",
          });
        }

        return res.json({
          success: true,
          message: "Lấy danh sách lịch trình thành công.",
          schedules,
        });
      }
    } else {
      // Phân trang như cũ nếu không phải request từ trang Home
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Tìm kiếm với điều kiện và phân trang
      const schedules = await Schedule.find(query)
        .populate("idUser") // Populate thông tin người dùng
        .sort(sortOptions) // Sắp xếp
        .skip(skip) // Bỏ qua các bản ghi trước đó
        .limit(parseInt(limit)); // Giới hạn số bản ghi trả về

      // Đếm tổng số lịch trình
      const total = await Schedule.countDocuments(query);

      if (!schedules || schedules.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy lịch trình phù hợp.",
        });
      }

      res.json({
        success: true,
        message: "Lấy danh sách lịch trình thành công.",
        total, // Tổng số lịch trình
        currentPage: parseInt(page), // Trang hiện tại
        totalPages: Math.ceil(total / limit), // Tổng số trang
        schedules, // Dữ liệu lịch trình
      });
    }
  } catch (error) {
    console.error("Error retrieving schedule:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách lịch trình.",
      error,
    });
  }
};


export const getTopAddressSchedule = async (req, res) => {
  try {
    const result = await Schedule.aggregate([
      {
        $group: {
          _id: "$address",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    if (result.length > 0) {
      const addresses = result.map((item) => ({
        name: item._id,
        count: item.count,
      }));

      return res.status(200).json({
        success: true,
        message: "Top addresses found",
        addresses,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No address data found.",
      });
    }
  } catch (error) {
    console.error("Error retrieving top address:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving top address",
      error,
    });
  }
};

export const updateLikeComment = async (req, res) => {
  const { scheduleId, userId, action, content, commentId } = req.body;
  const user = await User.findById(userId);
  try {
    // Find the schedule by its ID
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res
        .status(404)
        .json({ success: false, message: "Schedule not found" });
    }
    if (action === "unlike") {
      // Remove a like
      schedule.likes = schedule.likes.filter((like) => like.idUser !== userId);
    }
    if (action === "like") {
      // Add a like
      if (!schedule.likes.some((like) => like.idUser === userId)) {
        schedule.likes.push({ idUser: userId });
      }

      if (!schedule.idUser.equals(new ObjectId(userId))) {
        console.log("schedule.idUser", schedule.idUser);
        console.log("userId", userId);
        const notificationData = {
          idSender: userId,
          idReceiver: schedule.idUser,
          type: "user",
          content: `${user.name} thích lịch trình: ${schedule.scheduleName}`,
          createdAt: new Date(),
          nameSender: user.name || "Unknown",
          imgSender: user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        }
        await createNotification(global.io, notificationData);
      }

    } else if (action === "comment") {
      // Add a comment
      const newComment = {
        idUser: userId,
        userName: user.name,
        avatar: user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        content,
        createdAt: new Date(),
        replies: []
      };
      schedule.comments.push(newComment);
      if (!schedule.idUser.equals(new ObjectId(userId))) {
        const notificationData = {
          idSender: userId,
          idReceiver: schedule.idUser,
          type: "user",
          content: `${user.name} đã bình luận lịch trình: ${schedule.scheduleName}`,
          createdAt: new Date(),
          nameSender: user.name || "Unknown",
          imgSender: user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        }

        await createNotification(global.io, notificationData);
      }
    } else if (action === "reply") {
      // Find the comment to add a reply to
      const comment = schedule.comments.id(commentId);
      if (!comment) {
        return res
          .status(404)
          .json({ success: false, message: "Comment not found" });
      }
      comment.replies.push({
        idUser: userId,
        userName: user.name,
        avatar: user.avatar,
        content,
        createdAt: new Date(),
      });

      if (!schedule.idUser.equals(new ObjectId(userId))) {
        const notificationData = {
          idSender: userId,
          idReceiver: schedule.idUser,
          type: "user",
          content: `${user.name} đã bình luận lịch trình: ${schedule.scheduleName}`,
          createdAt: new Date(),
          nameSender: user.name || "Unknown",
          imgSender: user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        }
        await createNotification(global.io, notificationData);
      }

      if (comment.idUser !== userId) {

        const notificationData2 = {
          idSender: userId,
          idReceiver: comment.idUser,
          type: "user",
          content: `${user.name} đã trả lời bình luận của bạn: ${schedule.scheduleName}`,
          createdAt: new Date(),
          nameSender: user.name || "Unknown",
          imgSender: user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        }


        await createNotification(global.io, notificationData2);
      }
    }


    // Save the updated schedule
    await schedule.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Schedule updated successfully",
        schedule,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update schedule" });
  }
};


export const deleteActivity = async (req, res) => {
  const { id, activityId } = req.params; // Lấy scheduleId và activityId từ params

  try {
    // Tìm lịch trình dựa trên ID
    const schedule = await Schedule.findById(id);

    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }

    // Lọc các hoạt động để loại bỏ activity có id là activityId
    schedule.activities = schedule.activities.map((day) => {
      return {
        ...day,
        activity: day.activity.filter((activity) => activity._id.toString() !== activityId),
      };
    });

    // Lưu lại lịch trình đã chỉnh sửa
    await schedule.save();

    res.status(200).json({ success: true, message: "Activity deleted successfully", schedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete activity", error: error.message });
  }
};

export const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded!' });
    }

    const uploadPromises = req.files.map(async (file) => {
      try {
        const result = await uploadToCloudinaryV2(file.buffer, 'schedule_images');
        return {
          filename: file.originalname,
          path: result.secure_url,
          size: file.size,
          public_id: result.public_id
        };
      } catch (error) {
        console.error('Error uploading file to Cloudinary:', error);
        throw error;
      }
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully!',
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('Error in uploadFiles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading files',
      error: error.message 
    });
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByIdAndDelete(id);

    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }

    res.status(200).json({ success: true, message: "Schedule deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete schedule" });
  }
};

export const getFollowingSchedules = async (req, res) => {
  try {
    const { userId } = req.body;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4; // Default to 4 items per page
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Find the user to get their following list
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get total count for pagination
    const totalSchedules = await Schedule.countDocuments({
      idUser: { $in: user.following },
      isPublic: true
    });

    // Get paginated schedules from followed users
    const schedules = await Schedule.find({
      idUser: { $in: user.following },
      isPublic: true // Only get public schedules
    })
      .populate("idUser", "name avatar")
      .sort({createdAt: -1})
      .skip(skip)
      .limit(limit);

    if (!schedules.length) {
      return res.json({
        success: true,
        message: "No schedules found from followed users",
        schedules: [],
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalSchedules / limit),
          totalItems: totalSchedules,
          itemsPerPage: limit
        }
      });
    }

    return res.json({
      success: true,
      message: "Schedules retrieved successfully",
      schedules,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalSchedules / limit),
        totalItems: totalSchedules,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error("Error retrieving following schedules:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving following schedules",
      error,
    });
  }
};

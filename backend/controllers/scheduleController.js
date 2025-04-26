import mongoose from "mongoose";
import Schedule from "../models/schedule.js";
import User from "../models/user.js";
import Accommodation from "../models/accommodation.js"
import FoodService from "../models/foodService.js"
import Attraction from "../models/attraction.js"
import { createNotification } from "./notiController.js";
import { ObjectId } from "mongodb";
import keyword_extractor from "keyword-extractor";
import { uploadToCloudinaryV2 } from './videoController.js';

import Log from "../models/logActivity.js";
import fs from 'fs';
import { exec } from 'child_process';
import path from "path";

export const addSchedule = async (req, res) => {
  try {
    const { userId, schedule } = req.body;
    let newSchedule
    const tags = generateTagsFromSchedule(schedule);

    if (userId) {
      newSchedule = new Schedule({ ...schedule, idUser: userId, tags });
    } else {
      newSchedule = new Schedule({ ...schedule });
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
  const { id } = req.params;

  const scheduleData = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }
    // ✅ Tự động tạo tags nếu có activities mới
    if (scheduleData.activities) {
      scheduleData.tags = generateTagsFromSchedule(scheduleData);
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
const generateTagsFromSchedule = (schedule) => {
  const tags = new Set();
  const ignoredTags = new Set(['khách sạn', 'chỗ ở', 'địa điểm', 'tham quan', 'hoạt động khác']);

  // 1. Địa điểm
  if (schedule.address) {
    tags.add(schedule.address);

    const beachPlaces = ['Vũng Tàu', 'Phú Quốc', 'Nha Trang', 'Đà Nẵng', 'Côn Đảo'];
    if (beachPlaces.some(place => schedule.address.includes(place))) {
      tags.add('biển');
      tags.add('nghỉ dưỡng');
    }
  }

  // 2. Thời lượng chuyến đi
  if (schedule.numDays) {
    const nights = schedule.numDays - 1;
    tags.add(`${schedule.numDays} ngày`);
    tags.add(`${nights} đêm`);
    tags.add(`${schedule.numDays}N${nights}Đ`);

    if (schedule.numDays <= 2) tags.add('ngắn ngày');
    else if (schedule.numDays >= 5) tags.add('dài ngày');
  }

  // 3. Hoạt động trong lịch trình
  let hasSeafood = false;
  let hasCafe = false;
  let hasResort = false;
  let hasStreetFood = false;
  let hasBuffet = false;

  for (const day of schedule.activities || []) {
    for (const activity of day.activity || []) {
      const lowerName = activity.name?.toLowerCase() || '';
      const lowerDesc = activity.description?.toLowerCase() || '';

      // Loại hoạt động cụ thể
      if (lowerName.includes('hải sản') || lowerDesc.includes('hải sản')) hasSeafood = true;
      if (lowerName.includes('cà phê') || lowerDesc.includes('view đẹp') || lowerDesc.includes('sống ảo')) hasCafe = true;
      if (lowerName.includes('resort') || lowerDesc.includes('hồ bơi')) hasResort = true;
      if (lowerName.includes('đường phố') || lowerDesc.includes('đường phố')) hasStreetFood = true;
      if (lowerName.includes('buffet') || lowerDesc.includes('buffet')) hasBuffet = true;

      // Gợi ý tag từ loại activity
      switch (activity.activityType) {
        case 'Accommodation':
        case 'Other':
          break; // bỏ qua
        case 'Attraction':
          tags.add('check-in');
          break;
        case 'FoodService':
          tags.add('ẩm thực');
          break;
        default:
          tags.add(activity.activityType.toLowerCase());
      }
    }
  }

  // 4. Từ khóa bổ sung theo đặc điểm
  if (hasSeafood) tags.add('hải sản');
  if (hasCafe) {
    tags.add('view đẹp');
    tags.add('cafe chill');
    tags.add('sống ảo');
  }
  if (hasResort) tags.add('nghỉ dưỡng');
  if (hasStreetFood) tags.add('ẩm thực đường phố');
  if (hasBuffet) tags.add('buffet');

  // 5. Gợi ý kiểu chuyến đi từ tên lịch trình
  const lowerName = schedule.scheduleName?.toLowerCase() || '';
  if (lowerName.includes('team')) tags.add('team building');
  if (lowerName.includes('family') || lowerName.includes('gia đình')) tags.add('gia đình');
  if (lowerName.includes('honey moon') || lowerName.includes('trăng mật')) tags.add('honey moon');
  if (lowerName.includes('một mình') || lowerName.includes('solo')) tags.add('du lịch một mình');

  // 6. Gợi ý theo người dùng (tuổi và giới tính)
  if (schedule.idUser?.date_of_birth) {
    const age = calculateAge(schedule.idUser.date_of_birth);
    const gender = schedule.idUser.gender;

    if (gender === 'male' || gender === 'female') tags.add(gender);

    if (age <= 25) tags.add('trẻ');
    else if (age <= 50) tags.add('trung niên');
    else tags.add('cao tuổi');

    if (age <= 30 && hasCafe) tags.add('giới trẻ');
  }

  // 7. Trích xuất từ tên và mô tả
  const nameTags = extractTagsFromName(schedule.scheduleName);
  nameTags.forEach(tag => tags.add(tag));

  const descriptionTags = extractTagsFromName(schedule.description);
  descriptionTags.forEach(tag => tags.add(tag));

  // 8. Bắt buộc tag nền tảng
  tags.add('du lịch');
  tags.add('lịch trình');

  // 9. Lọc bỏ tag quá phổ thông
  const filteredTags = Array.from(tags).filter(tag => !ignoredTags.has(tag));

  return filteredTags;
};
// Hàm tính tuổi từ ngày sinh
const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const extractTagsFromName = (name) => {
  const keywords = keyword_extractor.extract(name, {
    language: "vi", // hoặc "english" nếu cần
    remove_digits: true,
    return_changed_case: true,
    remove_duplicates: true
  });

  return keywords; // Trả về mảng các từ khóa
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

      .sort({ createdAt: -1 })

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

// 🔧 Hàm tính top tags từ cả lịch trình cá nhân và lịch trình đã tương tác
const getTopTags = (personalSchedules, interactedSchedules, limit = 10) => {
  const tagFrequency = {};

  // Tags từ lịch trình người dùng tạo
  personalSchedules.forEach(schedule => {
    (schedule.tags || []).forEach(tag => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });
  });

  // Tags từ lịch trình người dùng đã tương tác
  interactedSchedules.forEach(item => {
    (item.tags || []).forEach(tag => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });
  });

  return Object.entries(tagFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
};

export const scheduleAI = async (req, res) => {
  try {
    const { userId } = req.params;
    let schedules = [];
    let interactionSummary = [];
    let user = {};
    let topTags = [];

    if (userId) {
      schedules = await Schedule.find({ idUser: userId });
      const logs = await Log.find({ userId });
      user = await User.findById(userId);

      // Tính thống kê tương tác
      const logStats = {};
      logs.forEach(log => {
        const id = log.scheduleId.toString();
        if (!logStats[id]) logStats[id] = { viewCount: 0, editCount: 0 };
        if (log.actionType === 'view') logStats[id].viewCount++;
        if (log.actionType === 'edit') logStats[id].editCount++;
      });

      const scheduleIds = Object.keys(logStats);
      const interactedSchedules = await Schedule.find(
        { _id: { $in: scheduleIds } },
        { tags: 1, address: 1 }
      );

      interactedSchedules.forEach(schedule => {
        const id = schedule._id.toString();
        if (logStats[id]) {
          logStats[id].tags = schedule.tags || [];
          logStats[id].address = schedule.address || '';
        }
      });

      interactionSummary = scheduleIds.map(id => ({
        scheduleId: id,
        ...logStats[id],
      }));

      // ✅ Tính topTags từ cả lịch trình cá nhân và tương tác
      topTags = getTopTags(schedules, interactionSummary);
    }
    // Huấn luyện nếu đủ điều kiện
    const allSchedules = await Schedule.find().populate("idUser", "name avatar");
    topTags = getTopTags(allSchedules, []);

    // ✅ Chuẩn hóa thông tin người dùng
    const exportData = {
      user,
      schedules,
      interactionSummary,
      topTags,
    };

    fs.writeFileSync('../Schedule_AI/user.json', JSON.stringify(exportData, null, 2));



    const shouldTrain = allSchedules.length % 1 === 0;

    if (shouldTrain) {
      fs.writeFileSync('../Schedule_AI/All_schedules.json', JSON.stringify(allSchedules, null, 2));
      exec('python ../Schedule_AI/train.py', (err, stdout, stderr) => {
        if (err) {
          console.error("Lỗi khi train AI:", err.message);
          return res.status(500).json({ success: false, message: "AI training error" });
        }
        if (stderr) console.warn("Train stderr:", stderr);
        callPredictAndRespond(res);
      });
    } else {
      callPredictAndRespond(res);
    }

  } catch (error) {
    console.error("Lỗi trong scheduleAI:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xử lý dữ liệu lịch trình",
      error: error.message,
    });
  }
};


// Hàm tách riêng xử lý predict và trả kết quả
const callPredictAndRespond = (res) => {
  exec('python ../Schedule_AI/predict.py', (predictError, _, predictStderr, stdout) => {
    if (predictError) {
      console.error(`Lỗi predict AI: ${predictError.message}`);
      return res.status(500).json({ success: false, message: "AI prediction error" });
    }
    if (predictStderr) console.error(`Predict stderr: ${predictStderr}`);
    console.log("Predict output:", stdout);
    fs.readFile('recommend.json', 'utf-8', (err, data) => {
      if (err) {
        console.error("Lỗi đọc file kết quả predict:", err);
        return res.status(500).json({ success: false, message: "Lỗi đọc kết quả AI" });
      }
      try {
        const result = JSON.parse(data);
        res.status(200).json({
          success: true,
          message: "Gợi ý lịch trình thành công",
          recommendedSchedules: result
        });
      } catch (parseError) {
        console.error("Lỗi phân tích JSON:", parseError);
        res.status(500).json({ success: false, message: "Lỗi phân tích kết quả AI" });
      }
    });
  });
};


//// Application

const models = {
  Accommodation,
  Attraction,
  FoodService,
};


export const getScheduleByIdForMobile = async (req, res) => {
  const { id } = req.params;
  const { activityId } = req.query;
  const userId = req.user?._id;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    // Lấy schedule gốc (không populate idDestination ở đây)
    const schedule = await Schedule.findById(id)
      .populate("idUser")
      .populate("idInvitee", "name avatar email")
      .lean(); // dùng lean để thao tác dễ hơn

    if (!schedule) {
      return res
        .status(404)
        .json({ success: false, message: "Schedule not found" });
    }

    // ✅ Populate thủ công cho từng activity nếu cần
    await Promise.all(
      schedule.activities.map(async (day) => {
        await Promise.all(
          day.activity.map(async (act) => {
            if (
              act.activityType !== "Other" &&
              models[act.activityType] &&
              mongoose.Types.ObjectId.isValid(act.idDestination)
            ) {
              const doc = await models[act.activityType]
                .findById(act.idDestination)
                .lean();
              act.destination = doc || null; // thêm field mới
            }
          })
        );
      })
    );

    // ✅ Check quyền chỉnh sửa
    const canEdit =
      schedule.idUser.toString() === userId ||
      (schedule.idInvitee || []).some((invitee) =>
        invitee._id.toString() === userId
      );

    // ✅ Nếu có activityId: trả về activity cụ thể
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

    // ✅ Trả toàn bộ schedule
    return res.json({
      success: true,
      message: "Get schedule success",
      schedule,
      canEdit,
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


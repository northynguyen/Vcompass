import axios from "axios";
import { exec } from "child_process";
import fs from "fs";
import keyword_extractor from "keyword-extractor";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import Accommodation from "../models/accommodation.js";
import Attraction from "../models/attraction.js";
import FoodService from "../models/foodService.js";
import Log from "../models/logActivity.js";
import Schedule from "../models/schedule.js";
import User from "../models/user.js";
import { createNotification } from "./notiController.js";
import { uploadToCloudinaryV2 } from "./videoController.js";
import { successResponse, errorResponse } from "../utils/response.js";

// ✅ Utility function để populate attractions nhanh chóng
const populateAttractionsOptimized = async (schedules) => {
  if (!schedules || schedules.length === 0) return;

  // Thu thập tất cả attraction IDs
  const attractionIds = new Set();
  schedules.forEach((schedule) => {
    schedule.activities.forEach((day) => {
      day.activity.forEach((act) => {
        if (
          act.activityType === "Attraction" &&
          mongoose.Types.ObjectId.isValid(act.idDestination)
        ) {
          attractionIds.add(act.idDestination.toString());
        }
      });
    });
  });

  if (attractionIds.size === 0) return;

  // Query tất cả attractions một lần
  const attractions = await Attraction.find({
    _id: { $in: Array.from(attractionIds) }
  }).lean();

  // Tạo Map để lookup nhanh
  const attractionMap = new Map();
  attractions.forEach(attraction => {
    attractionMap.set(attraction._id.toString(), attraction);
  });

  // Map attractions vào activities
  schedules.forEach((schedule) => {
    schedule.activities.forEach((day) => {
      day.activity.forEach((act) => {
        if (
          act.activityType === "Attraction" &&
          mongoose.Types.ObjectId.isValid(act.idDestination)
        ) {
          act.destination = attractionMap.get(act.idDestination.toString()) || null;
        }
      });
    });
  });
};

// ✅ Utility function để populate tất cả loại destination nhanh chóng
const populateAllDestinationsOptimized = async (schedules) => {
  if (!schedules || schedules.length === 0) return;

  const models = { Accommodation, Attraction, FoodService };

  // Thu thập IDs theo từng loại
  const idsByType = {
    Accommodation: new Set(),
    Attraction: new Set(),
    FoodService: new Set()
  };

  schedules.forEach((schedule) => {
    schedule.activities.forEach((day) => {
      day.activity.forEach((act) => {
        if (
          act.activityType !== "Other" &&
          models[act.activityType] &&
          mongoose.Types.ObjectId.isValid(act.idDestination)
        ) {
          idsByType[act.activityType].add(act.idDestination.toString());
        }
      });
    });
  });

  // Query tất cả destinations theo từng loại
  const destinationMaps = {};
  await Promise.all(
    Object.entries(idsByType).map(async ([type, ids]) => {
      if (ids.size === 0) return;

      const destinations = await models[type].find({
        _id: { $in: Array.from(ids) }
      }).lean();

      destinationMaps[type] = new Map();
      destinations.forEach(dest => {
        destinationMaps[type].set(dest._id.toString(), dest);
      });
    })
  );

  // Map destinations vào activities
  schedules.forEach((schedule) => {
    schedule.activities.forEach((day) => {
      day.activity.forEach((act) => {
        if (
          act.activityType !== "Other" &&
          models[act.activityType] &&
          mongoose.Types.ObjectId.isValid(act.idDestination) &&
          destinationMaps[act.activityType]
        ) {
          act.destination = destinationMaps[act.activityType].get(act.idDestination.toString()) || null;
        }
      });
    });
  });
};

export const addSchedule = async (req, res) => {
  try {
    const { userId, schedule } = req.body;
    let newSchedule;
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
    const canEdit =
      schedule.idUser.equals(userId) ||
      schedule.idInvitee.some((invitee) => invitee._id.equals(userId));

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
      canEdit, // Thêm flag này vào response
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
  const { type, page = 1, limit = 10, search } = req.query;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Create search condition
    let searchCondition = {};
    if (search && search.trim()) {
      searchCondition = {
        $or: [
          { scheduleName: { $regex: search.trim(), $options: 'i' } },
          { address: { $regex: search.trim(), $options: 'i' } }
        ]
      };
    }

    if (type === "group") {
      console.log("type group -------");

      const baseCondition = {
        idInvitee: new mongoose.Types.ObjectId(userId),
      };

      // Combine base condition with search condition
      const finalCondition = search && search.trim()
        ? { ...baseCondition, ...searchCondition }
        : baseCondition;

      const total = await Schedule.countDocuments(finalCondition);

      const schedules = await Schedule.find(finalCondition)
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 });

      const totalPages = Math.ceil(total / limitNum);

      return res.json({
        success: true,
        message: "Group schedules retrieved successfully",
        schedules,
        total,
        currentPage: pageNum,
        totalPages,
      });
    }

    if (type === "wishlist") {
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const baseCondition = {
        _id: { $in: user.favorites.schedule || [] },
      };

      // Combine base condition with search condition
      const finalCondition = search && search.trim()
        ? { ...baseCondition, ...searchCondition }
        : baseCondition;

      // Đếm số schedules thực sự tồn tại trong wishlist
      const total = await Schedule.countDocuments(finalCondition);

      const schedules = await Schedule.find(finalCondition)
        .populate("idUser")
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 });

      const totalPages = Math.ceil(total / limitNum);

      return res.json({
        success: true,
        message: "Wishlist schedules retrieved successfully",
        schedules,
        total,
        currentPage: pageNum,
        totalPages,
      });
    } else {
      // Default case - user's own schedules
      const baseCondition = { idUser: userId };

      // Combine base condition with search condition
      const finalCondition = search && search.trim()
        ? { ...baseCondition, ...searchCondition }
        : baseCondition;

      const total = await Schedule.countDocuments(finalCondition);
      const totalPages = Math.ceil(total / limitNum);

      const schedules = await Schedule.find(finalCondition)
        .populate("idUser")
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        message: "Schedules retrieved successfully",
        schedules,
        total,
        currentPage: pageNum,
        totalPages,
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
      scheduleName, // Tìm kiếm theo tên lịch trình
      activityType, // Lọc theo loại hoạt động
      priceMin, // Giá tối thiểu
      priceMax, // Giá tối đa
      numDays, // Số ngày
      hasVideo, // Có video hay không
      hasImage, // Có ảnh hay không
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
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.idUser = { $ne: new mongoose.Types.ObjectId(userId) };
      console.log("Excluding schedules from userId:", userId);
    }

    // Lọc theo địa chỉ
    if (cityList.length > 0) {
      query.address = { $in: cityList };
    }

    // Lọc theo tên lịch trình
    if (scheduleName) {
      query.scheduleName = { $regex: scheduleName, $options: "i" };
    }

    // Lọc theo số ngày
    if (numDays && numDays !== "0") {
      query.numDays = parseInt(numDays);
    }

    // Lọc theo media
    if (hasVideo === "true") {
      query.videoSrc = { $exists: true, $ne: null };
    }

    if (hasImage === "true") {
      query.imgSrc = { $exists: true, $ne: [], $not: { $size: 0 } };
    }

    // Lựa chọn sắp xếp
    let sortOptions = {};
    if (sortBy === "likes") {
      sortOptions = { "likes.length": -1 };
    } else if (sortBy === "comments") {
      sortOptions = { "comments.length": -1 };
    } else {
      sortOptions = { createdAt: -1 };
    }

    // Nếu request từ trang Home, xử lý theo yêu cầu đặc biệt
    if (forHomePage === "true") {
      const homeQuery = { isPublic: true };

      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        homeQuery.idUser = { $ne: new mongoose.Types.ObjectId(userId) };
      }

      const schedules = await Schedule.aggregate([
        { $match: homeQuery },
        {
          $addFields: {
            likesCount: { $size: "$likes" },
            commentsCount: { $size: "$comments" },
            popularityScore: {
              $add: [
                { $multiply: [{ $size: "$likes" }, 2] },
                { $size: "$comments" },
              ],
            },
          },
        },
        { $sort: { popularityScore: -1, createdAt: -1 } },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "users",
            localField: "idUser",
            foreignField: "_id",
            as: "idUser",
          },
        },
        { $unwind: "$idUser" },
      ]);

      if (!schedules || schedules.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy lịch trình phù hợp.",
        });
      }

      await populateAttractionsOptimized(schedules);

      return res.json({
        success: true,
        message: "Lấy danh sách lịch trình thành công.",
        schedules,
      });
    } else {
      // Phân trang như cũ nếu không phải request từ trang Home
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Tìm kiếm với điều kiện và phân trang
      let schedules = await Schedule.find(query)
        .populate("idUser")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // ✅ Lọc server-side theo activityType và priceRange
      if (activityType || priceMin || priceMax) {
        schedules = schedules.filter((schedule) => {
          // Lọc theo loại hoạt động
          if (activityType) {
            const hasActivityType = schedule.activities.some((day) =>
              day.activity.some(
                (act) =>
                  act.activityType.toLowerCase() === activityType.toLowerCase()
              )
            );
            if (!hasActivityType) return false;
          }

          // Lọc theo giá
          if (priceMin || priceMax) {
            const totalCost = schedule.activities.reduce((sum, day) => {
              return sum + day.activity.reduce((acc, act) => acc + (act.cost || 0), 0);
            }, 0);

            if (priceMin && totalCost < parseInt(priceMin)) return false;
            if (priceMax && totalCost > parseInt(priceMax)) return false;
          }

          return true;
        });
      }

      // Đếm tổng số lịch trình phù hợp (trước khi phân trang)
      let totalQuery = Schedule.find(query);
      let allSchedules = await totalQuery.lean();

      // Áp dụng cùng filter cho count
      if (activityType || priceMin || priceMax) {
        allSchedules = allSchedules.filter((schedule) => {
          if (activityType) {
            const hasActivityType = schedule.activities.some((day) =>
              day.activity.some(
                (act) =>
                  act.activityType.toLowerCase() === activityType.toLowerCase()
              )
            );
            if (!hasActivityType) return false;
          }

          if (priceMin || priceMax) {
            const totalCost = schedule.activities.reduce((sum, day) => {
              return sum + day.activity.reduce((acc, act) => acc + (act.cost || 0), 0);
            }, 0);

            if (priceMin && totalCost < parseInt(priceMin)) return false;
            if (priceMax && totalCost > parseInt(priceMax)) return false;
          }

          return true;
        });
      }

      const total = allSchedules.length;

      if (!schedules || schedules.length === 0) {
        return res.json({
          success: true,
          message: "Không tìm thấy lịch trình phù hợp.",
          total: 0,
          currentPage: parseInt(page),
          totalPages: 0,
          schedules: [],
        });
      }

      await populateAttractionsOptimized(schedules);

      res.json({
        success: true,
        message: "Lấy danh sách lịch trình thành công.",
        total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        schedules,
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
        $match: {
          isPublic: true,
        },
      },
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
          imgSender:
            user.avatar ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        };
        await createNotification(global.io, notificationData);
      }
    } else if (action === "comment") {
      // Add a comment
      const newComment = {
        idUser: userId,
        userName: user.name,
        avatar:
          user.avatar ||
          "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        content,
        createdAt: new Date(),
        replies: [],
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
          imgSender:
            user.avatar ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        };

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
          imgSender:
            user.avatar ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        };
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
          imgSender:
            user.avatar ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        };

        await createNotification(global.io, notificationData2);
      }
    }

    // Save the updated schedule
    await schedule.save();
    res.status(200).json({
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
      return res
        .status(404)
        .json({ success: false, message: "Schedule not found" });
    }

    // Lọc các hoạt động để loại bỏ activity có id là activityId
    schedule.activities = schedule.activities.map((day) => {
      return {
        ...day,
        activity: day.activity.filter(
          (activity) => activity._id.toString() !== activityId
        ),
      };
    });

    // Lưu lại lịch trình đã chỉnh sửa
    await schedule.save();

    res.status(200).json({
      success: true,
      message: "Activity deleted successfully",
      schedule,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete activity",
      error: error.message,
    });
  }
};

export const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded!" });
    }

    const uploadPromises = req.files.map(async (file) => {
      try {
        const result = await uploadToCloudinaryV2(
          file.buffer,
          "schedule_images"
        );
        return {
          filename: file.originalname,
          path: result.secure_url,
          size: file.size,
          public_id: result.public_id,
        };
      } catch (error) {
        console.error("Error uploading file to Cloudinary:", error);
        throw error;
      }
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      message: "Files uploaded successfully!",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error in uploadFiles:", error);

    res.status(500).json({
      success: false,
      message: "Error uploading files",
      error: error.message,
    });
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByIdAndDelete(id);

    if (!schedule) {
      return res
        .status(404)
        .json({ success: false, message: "Schedule not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Schedule deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete schedule" });
  }
};
const generateTagsFromSchedule = (schedule) => {
  const tags = new Set();

  // 1. Địa điểm
  if (schedule.address) {
    tags.add(schedule.address);

    const beachPlaces = [
      "Vũng Tàu",
      "Phú Quốc",
      "Nha Trang",
      "Đà Nẵng",
      "Côn Đảo",
    ];
    if (beachPlaces.some((place) => schedule.address.includes(place))) {
      tags.add("biển");
      tags.add("nghỉ dưỡng");
    }
  }

  // 2. Tag số ngày
  if (schedule.numDays) {
    const nights = schedule.numDays - 1;
    tags.add(`${schedule.numDays} ngày`);
    tags.add(`${nights} đêm`);
    tags.add(`${schedule.numDays}N${nights}Đ`);
  }

  // 3. Hoạt động trong lịch trình
  const activityTypes = new Set();
  let hasSeafood = false;
  let hasCafe = false;
  let hasResort = false;

  for (const day of schedule.activities || []) {
    for (const activity of day.activity || []) {
      activityTypes.add(activity.activityType);

      const lowerName = activity.name?.toLowerCase() || "";
      const lowerDesc = activity.description?.toLowerCase() || "";

      if (lowerName.includes("hải sản") || lowerDesc.includes("hải sản")) {
        hasSeafood = true;
      }

      if (lowerName.includes("cà phê") || lowerDesc.includes("view đẹp")) {
        hasCafe = true;
      }

      if (lowerName.includes("resort") || lowerDesc.includes("hồ bơi")) {
        hasResort = true;
      }
    }
  }

  activityTypes.forEach((type) => {
    switch (type) {
      case "Accommodation":
        tags.add("khách sạn");
        tags.add("chỗ ở");
        break;
      case "Attraction":
        tags.add("địa điểm");
        tags.add("tham quan");
        break;
      case "FoodService":
        tags.add("ẩm thực");
        tags.add("ăn uống");
        break;
      case "Other":
        tags.add("hoạt động khác");
        break;
      default:
        tags.add(type.toLowerCase());
    }
  });

  // 4. Từ khóa bổ sung
  tags.add("du lịch");
  tags.add("phượt");
  tags.add("lịch trình");

  // 5. Gợi ý thêm theo cảm xúc/xu hướng
  if (hasSeafood) tags.add("ẩm thực");
  if (hasCafe) tags.add("sống ảo");
  if (hasResort) tags.add("nghỉ dưỡng");

  if (schedule.numDays <= 3 && (hasCafe || hasResort)) {
    tags.add("giới trẻ");
  }

  // // 6. Tag từ người dùng (tuổi + giới tính)
  // if (schedule.idUser.date_of_birth) {
  //   const age = calculateAge(schedule.idUser.date_of_birth);
  //   const gender = schedule.idUser.gender; // "male" | "female" | "other"

  //   // Giới tính
  //   if (gender === "male" || gender === "female") {
  //     tags.add(gender); // thêm "male" hoặc "female"
  //   }

  //   // Nhóm tuổi
  //   if (age <= 25) tags.add("trẻ");
  //   else if (age <= 50) tags.add("trung niên");
  //   else tags.add("cao tuổi");
  // }

  // Lọc và loại bỏ các từ không cần thiết như "hà", "nội", "a"
  const filteredTags = Array.from(tags).filter(
    (tag) => !/^[a-zA-Z]{1,2}$/.test(tag)
  ); // Loại bỏ từ ngắn, ký tự 1-2 chữ

  // Lấy từ khóa từ tên và mô tả lịch trình
  const nameTags = extractTagsFromName(schedule.scheduleName);
  nameTags.forEach((tag) => {
    if (!/^[a-zA-Z]{1,2}$/.test(tag)) tags.add(tag); // Lọc từ không cần thiết từ tên
  });

  const descriptionTags = extractTagsFromName(schedule.description);
  descriptionTags.forEach((tag) => {
    if (!/^[a-zA-Z]{1,2}$/.test(tag)) tags.add(tag); // Lọc từ không cần thiết từ mô tả
  });

  console.log(filteredTags);
  return filteredTags; // Trả về kết quả đã lọc
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
    remove_duplicates: true,
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
      isPublic: true,
    });

    // Get paginated schedules from followed users
    const schedules = await Schedule.find({
      idUser: { $in: user.following },
      isPublic: true, // Only get public schedules
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
          itemsPerPage: limit,
        },
      });
    }

    // ✅ Populate chỉ các activity có activityType là "Attraction"
    await populateAttractionsOptimized(schedules);

    return res.json({
      success: true,
      message: "Schedules retrieved successfully",
      schedules,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalSchedules / limit),
        totalItems: totalSchedules,
        itemsPerPage: limit,
      },
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
  personalSchedules.forEach((schedule) => {
    (schedule.tags || []).forEach((tag) => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });
  });

  // Tags từ lịch trình người dùng đã tương tác
  interactedSchedules.forEach((item) => {
    (item.tags || []).forEach((tag) => {
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
      schedules = await Schedule.find({ idUser: userId })
        .select("idUser numDays address tags activities") // Chọn các trường của Schedule
        .lean() // Chuyển sang object thuần để dễ xử lý
        .then((schedules) => {
          schedules.forEach((schedule) => {
            schedule.activities.forEach((day) => {
              day.activity = day.activity.map((act) => ({
                activityType: act.activityType,
                idDestination: act.idDestination,
                cost: act.cost,
              }));
            });
          });
          return schedules;
        });
      const logs = await Log.find({ userId });
      user = await User.findById(userId).select("_id");
      // Thống kê tương tác
      const logStats = {};
      logs.forEach((log) => {
        const id = log.scheduleId.toString();
        if (!logStats[id]) logStats[id] = { viewCount: 0, editCount: 0 };
        if (log.actionType === "view") logStats[id].viewCount++;
        if (log.actionType === "edit") logStats[id].editCount++;
      });

      const scheduleIds = Object.keys(logStats);
      const interactedSchedules = await Schedule.find(
        { _id: { $in: scheduleIds } },
        { tags: 1, address: 1 }
      );

      interactedSchedules.forEach((schedule) => {
        const id = schedule._id.toString();
        if (logStats[id]) {
          logStats[id].tags = schedule.tags || [];
          logStats[id].address = schedule.address || "";
        }
      });

      interactionSummary = scheduleIds.map((id) => ({
        scheduleId: id,
        ...logStats[id],
      }));

      // Tính topTags cho user
      topTags = getTopTags(schedules, interactionSummary);
    }

    // Chuẩn hóa thông tin user để đưa vào AI
    const exportData = {
      userId: user._id,
      schedules,
      interactionSummary,
      topTags,
    };

    // Ghi file input cho AI predict
    fs.writeFileSync(
      "../Schedule_AI/user.json",
      JSON.stringify(exportData, null, 2)
    );
    const apiUrl = "https://scheduleai.onrender.com/recommend_schedules/";
    const response = await axios.post(apiUrl, exportData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.status === "success") {
      const recommendedScheduleIds = response.data.recommendedSchedules || [];
      const recommendedSchedules = await Schedule.find({
        _id: { $in: recommendedScheduleIds },
      })
        .populate("idUser")
        .populate("idInvitee", "name avatar email")
        .lean(); // dùng lean để thao tác dễ hơn

      // ✅ Populate chỉ các activity có activityType là "Attraction"
      await populateAttractionsOptimized(recommendedSchedules);

      res.status(200).json({
        success: true,
        recommendedSchedules,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Không thể dự đoán lịch trình",
      });
    }
  } catch (error) {
    console.error("Lỗi trong recommendSchedule:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi recommend lịch trình",
      error: error.message,
    });
  }
};

export const trainScheduleModel = async (req, res) => {
  try {
    getAllScheduleToTrainAI();
    getAllUserDataToTrainAI();

    // Gọi lệnh train bằng Python
    exec(
      "python ../Schedule_AI/travel_recommendation_dqn.py",
      (err, stdout, stderr) => {
        if (err) {
          console.error("Lỗi khi train AI:", err.message);
          return res
            .status(500)
            .json({ success: false, message: "AI training error" });
        }
        if (stderr) {
          console.warn("Train stderr:", stderr);
        }
        console.log("Train stdout:", stdout);
        return res.json({
          success: true,
          message: "Model retrained successfully!",
        });
      }
    );
  } catch (error) {
    console.error("Lỗi trong trainScheduleModel:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi train mô hình",
      error: error.message,
    });
  }
};

//// Application

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
    await populateAllDestinationsOptimized([schedule]);

    // ✅ Check quyền chỉnh sửa
    const canEdit =
      schedule.idUser.toString() === userId ||
      (schedule.idInvitee || []).some(
        (invitee) => invitee._id.toString() === userId
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
    schedule.canEdit = canEdit
    return successResponse(res, schedule, "Get schedule success")
  } catch (error) {
    console.error("Error retrieving schedule:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving schedule",
      error,
    });
  }
};
const getAllUserDataToTrainAI = async () => {
  const users = await User.find().populate("following.idUser").lean();
  const allData = [];

  for (const user of users) {
    const age = calculateAge(user.date_of_birth); // bạn đã có hàm này
    const restaurants = new Set();
    const accommodations = new Set();
    const attractions = new Set();
    const allTags = [];
    const actionCounts = { like: 0, comment: 0, edit: 0, view: 0, share: 0 };
    let totalDays = 0;
    let totalCost = 0;

    // Favorite của user
    user.favorites?.foodService?.forEach((r) => restaurants.add(r.toString()));
    user.favorites?.accommodation?.forEach((a) =>
      accommodations.add(a.toString())
    );
    user.favorites?.attraction?.forEach((t) => attractions.add(t.toString()));

    // Lịch trình user tạo
    const schedules = await Schedule.find({ idUser: user._id }).lean();
    schedules.forEach((schedule) => {
      totalDays += schedule.numDays || 0;
      allTags.push(...(schedule.tags || []));

      schedule.activities?.forEach((day) => {
        day.activity.forEach((act) => {
          totalCost += act.cost || 0;
          if (act.activityType === "FoodService") {
            restaurants.add(act.idDestination);
          }
          if (act.activityType === "Accommodation") {
            accommodations.add(act.idDestination);
          }
          if (act.activityType === "Attraction") {
            attractions.add(act.idDestination);
          }
        });
      });
    });
    // Lịch trình user tương tác
    const logs = await Log.find({ userId: user._id })
      .populate("scheduleId")
      .lean();

    logs.forEach((log) => {
      // Đếm số lượng hành động (dùng actionType chứ không phải action)
      actionCounts[log.actionType] = (actionCounts[log.actionType] || 0) + 1;

      const sched = log.scheduleId;
      if (sched) {
        allTags.push(...(sched.tags || []));

        sched.activities?.forEach((day) => {
          day.activity.forEach((act) => {
            if (act.activityType === "FoodService") {
              restaurants.add(act.idDestination || act.activityId?.toString());
            }
            if (act.activityType === "Accommodation") {
              accommodations.add(
                act.idDestination || act.activityId?.toString()
              );
            }
            if (act.activityType === "Attraction") {
              attractions.add(act.idDestination || act.activityId?.toString());
            }
          });
        });
      }
    });
    // Đếm số lần xuất hiện của từng tag
    const tagCounts = {};
    allTags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });

    // Sắp xếp tag theo tần suất giảm dần và lấy top 10
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1]) // sắp giảm dần theo count
      .slice(0, 10) // lấy top 10
      .map((entry) => entry[0]); // chỉ lấy tên tag
    allData.push({
      userId: user._id,
      age,
      address: user.address || "",
      gender: user.gender || "",
      restaurants: Array.from(restaurants),
      accommodations: Array.from(accommodations),
      attractions: Array.from(attractions),
      following: Array.isArray(user.following)
        ? user.following.map((f) => f.toString())
        : [],
      averageDays: schedules.length ? totalDays / schedules.length : 0,
      averageCost: schedules.length ? totalCost / schedules.length : 0,
      topTags: topTags,
      numRestaurants: restaurants.size,
      numAccommodations: accommodations.size,
      numAttractions: attractions.size,
      totalLikes: actionCounts.like,
      totalComments: actionCounts.comment,
      totalEdits: actionCounts.edit,
      totalViews: actionCounts.view,
      totalShares: actionCounts.share,
    });
  }

  fs.writeFileSync(
    "../Schedule_AI/ALL_users.json",
    JSON.stringify(allData, null, 2)
  );
};
const getAllScheduleToTrainAI = async () => {
  const schedules = await Schedule.find().lean();
  const result = [];

  for (const sched of schedules) {
    let totalCost = 0;
    const restaurants = new Set();
    const accommodations = new Set();
    const attractions = new Set();

    sched.activities?.forEach((day) => {
      day.activity.forEach((act) => {
        totalCost += act.cost || 0;
        if (act.activityType === "FoodService") {
          restaurants.add(act.idDestination.toString());
        }
        if (act.activityType === "Accommodation") {
          accommodations.add(act.idDestination.toString());
        }
        if (act.activityType === "Attraction") {
          attractions.add(act.idDestination.toString());
        }
      });
    });

    // Tính tổng số like và comment
    const totalLikes = sched.likes ? sched.likes.length : 0;
    const totalComments = sched.comments
      ? sched.comments.reduce((sum, comment) => {
        const repliesCount = comment.replies ? comment.replies.length : 0;
        return sum + 1 + repliesCount; // 1 comment + số reply
      }, 0)
      : 0;

    result.push({
      scheduleId: sched._id,
      userId: sched.idUser,
      address: sched.address || "",
      numDays: sched.numDays || 0,
      totalLikes,
      totalComments,
      tags: sched.tags || [],
      totalCost,
      restaurants: Array.from(restaurants),
      accommodations: Array.from(accommodations),
      attractions: Array.from(attractions),
    });
  }

  fs.writeFileSync(
    "../Schedule_AI/ALL_schedules.json",
    JSON.stringify(result, null, 2)
  );
};

export const getScheduleByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const schedules = await Schedule.find({
      idUser: userId,
      isPublic: true,
    }).populate("idUser").lean();

    await populateAttractionsOptimized(schedules);

    res.status(200).json({ success: true, schedules });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching schedules" });
  }
};

// Meta tags for social sharing
export const getScheduleMetaTags = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid schedule ID");
    }

    const schedule = await Schedule.findById(id).populate("idUser").lean();

    if (!schedule) {
      return res.status(404).send("Schedule not found");
    }

    // Get image URL
    let imageUrl = 'https://res.cloudinary.com/dmdzku5og/image/upload/v1753888598/du-lich-viet-nam_a5b5777f771c44a89aee7f59151e7f95_xh9zbs.jpg';
    if (schedule.imgSrc && schedule.imgSrc[0]) {
      imageUrl = schedule.imgSrc[0].includes('http')
        ? schedule.imgSrc[0]
        : `https://vcompass.onrender.com/images/${schedule.imgSrc[0]}`;
    } else if (schedule.videoSrc) {
      imageUrl = schedule.videoSrc;
    }

    const description = schedule.description || `Lịch trình du lịch ${schedule.address} - ${schedule.numDays} ngày với nhiều hoạt động thú vị.`;
    const title = `${schedule.scheduleName} - Du lịch ${schedule.address}`;
    const url = `https://vcompass.onrender.com/schedule-view/${id}`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    
    <!-- Open Graph Tags -->
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:url" content="${url}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="VCompass">
    
    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    
    <!-- Additional Meta Tags -->
    <meta name="author" content="${schedule.idUser?.name || 'VCompass User'}">
    <meta name="keywords" content="du lịch, ${schedule.address}, lịch trình, VCompass, ${schedule.type?.join(', ') || ''}">
    
    <script>
        // Redirect to main app after 1 second
        setTimeout(function() {
            window.location.href = "${url}";
        }, 1000);
    </script>
    
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
        }
        .loading-container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="loading-container">
        <div class="spinner"></div>
        <h2>Đang chuyển hướng đến lịch trình...</h2>
        <p>${title}</p>
        <p>Nếu không tự động chuyển hướng, <a href="${url}">nhấn vào đây</a></p>
    </div>
</body>
</html>`;

    res.send(html);
  } catch (error) {
    console.error("Error serving meta tags:", error);
    res.status(500).send("Error loading schedule");
  }
};

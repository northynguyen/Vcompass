import mongoose from "mongoose";
import Schedule from "../models/schedule.js";
import User from "../models/user.js";
import {upload} from '../middleware/upload.js'
import multer from 'multer';

export const addSchedule = async (req, res) => {
  try {
    const { userId, schedule } = req.body;
    const newSchedule = new Schedule({ ...schedule, idUser: userId });
    console.log(schedule);
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

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    // Lấy thông tin schedule
    const schedule = await Schedule.findById(id).populate("idUser");

    if (!schedule) {
      return res
        .status(404)
        .json({ success: false, message: "Schedule not found" });
    }

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
  const { type } = req.query;

  try {
    if (type === "wishlist") {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const schedules = await Schedule.find({ _id: { $in: user.favorites.schedule } });
      if (!schedules.length) {
        return res.status(404).json({ success: false, message: "No schedules found in wishlist" });
      }

      return res.json({
        success: true,
        message: "Wishlist schedules retrieved successfully",
        schedules,
      });
    } else {
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const schedules = await Schedule.find({ idUser: userId });
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
    const schedule = await Schedule.find().populate("idUser");
    if (!schedule || schedule.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Schedule not found" });
    }
    res.json({
      success: true,
      message: "Get schedule success",
      schedule,
    });
  } catch (error) {
    console.error("Error retrieving schedule:", error);
    res.json({
      success: false,
      message: "Error retrieving schedule",
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
    } else if (action === "comment") {
      // Add a comment
      const newComment = {
        idUser: userId,
        userName: user.name,
        avatar: user.avatar,
        content,
        createdAt: new Date(),
        replies: [],
      };
      schedule.comments.push(newComment);
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

    res.status(200).json({ success: true, message: "Activity deleted successfully" , schedule});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete activity", error: error.message });
  }
};

export const uploadFiles = (req, res) => {
  // Sử dụng middleware multer để xử lý
  upload.array('images', 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Xử lý lỗi từ multer (ví dụ: vượt kích thước file)
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      // Xử lý lỗi khác (ví dụ: loại file không hợp lệ)
      return res.status(400).json({ success: false, message: err.message });
    }

    // Kiểm tra nếu không có file nào được tải lên
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded!' });
    }

    // Trả về thông tin file đã tải lên
    const uploadedFiles = req.files.map((file) => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      size: file.size,
    }));

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully!',
      files: uploadedFiles,
    });
  });
};
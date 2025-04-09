import mongoose from "mongoose";
import Schedule from "../models/schedule.js";
import User from "../models/user.js";
import { upload } from '../middleware/upload.js'
import multer from 'multer';
import { createNotification } from "./notiController.js";
import { ObjectId } from "mongodb";
import keyword_extractor from "keyword-extractor";
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
      sortBy, // "likes", "comments"
      page = 1, // Trang hiện tại
      limit = 10, // Số lượng mỗi trang
    } = req.query;

    // Xử lý cities thành mảng nếu được truyền dưới dạng chuỗi
    const cityList = cities ? cities.split(",") : [];

    // Tạo điều kiện tìm kiếm
    const query = {};
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

    // Phân trang
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

  // 1. Địa điểm
  if (schedule.address) {
    tags.add(schedule.address);

    const beachPlaces = ['Vũng Tàu', 'Phú Quốc', 'Nha Trang', 'Đà Nẵng', 'Côn Đảo'];
    if (beachPlaces.some(place => schedule.address.includes(place))) {
      tags.add('biển');
      tags.add('nghỉ dưỡng');
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

      const lowerName = activity.name?.toLowerCase() || '';
      const lowerDesc = activity.description?.toLowerCase() || '';

      if (lowerName.includes('hải sản') || lowerDesc.includes('hải sản')) {
        hasSeafood = true;
      }

      if (lowerName.includes('cà phê') || lowerDesc.includes('view đẹp')) {
        hasCafe = true;
      }

      if (lowerName.includes('resort') || lowerDesc.includes('hồ bơi')) {
        hasResort = true;
      }
    }
  }

  activityTypes.forEach(type => {
    switch (type) {
      case 'Accommodation':
        tags.add('khách sạn');
        tags.add('chỗ ở');
        break;
      case 'Attraction':
        tags.add('địa điểm');
        tags.add('tham quan');
        break;
      case 'FoodService':
        tags.add('ẩm thực');
        tags.add('ăn uống');
        break;
      case 'Other':
        tags.add('hoạt động khác');
        break;
      default:
        tags.add(type.toLowerCase());
    }
  });

  // 4. Từ khóa bổ sung
  tags.add('du lịch');
  tags.add('phượt');
  tags.add('lịch trình');

  // 5. Gợi ý thêm theo cảm xúc/xu hướng
  if (hasSeafood) tags.add('ẩm thực');
  if (hasCafe) tags.add('sống ảo');
  if (hasResort) tags.add('nghỉ dưỡng');

  if (schedule.numDays <= 3 && (hasCafe || hasResort)) {
    tags.add('giới trẻ');
  }

  // 6. Tag từ người dùng (tuổi + giới tính)
  if (schedule.idUser.date_of_birth) {
    const age = calculateAge(schedule.idUser.date_of_birth);
    const gender = schedule.idUser.gender; // "male" | "female" | "other"

    // Giới tính
    if (gender === 'male' || gender === 'female') {
      tags.add(gender); // thêm "male" hoặc "female"
    }

    // Nhóm tuổi
    if (age <= 25) tags.add('trẻ');
    else if (age <= 50) tags.add('trung niên');
    else tags.add('cao tuổi');
  }
  const nameTags = extractTagsFromName(schedule.scheduleName);
  nameTags.forEach(tag => tags.add(tag));

  const descriptionTags = extractTagsFromName(schedule.description);
  descriptionTags.forEach(tag => tags.add(tag));
  console.log(tags);
  return Array.from(tags);
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

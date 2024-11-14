import mongoose from "mongoose";
import Schedule from "../models/schedule.js";

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

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }
    const schedule = await Schedule.findById(id).populate("idUser");
    console.log(schedule);
    if (!schedule) {
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
export const updateSchedule = async (req, res) => {
  const { id } = req.params;
  const scheduleData = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

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
  const { userId } = req.body;
  try {
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "idUser parameter is required",
      });
    }
    const schedules = await Schedule.find({ idUser: userId });
    if (!schedules || schedules.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No schedules found for this user",
      });
    }

    res.json({
      success: true,
      message: "Get schedules success",
      schedules,
    });
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
      const addresses = result.map(item => ({
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








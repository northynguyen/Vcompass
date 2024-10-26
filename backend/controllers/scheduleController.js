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

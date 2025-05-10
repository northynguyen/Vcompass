import UserSatisfaction from "../models/userSatisfaction.js";

export const createSatisfaction = async (req, res) => {
  try {
    const { userId, scheduleId, action, score } = req.body;
    const newRecord = await UserSatisfaction.create({
      userId,
      scheduleId,
      action,
      score,
    });
    res.status(201).json(newRecord);
  } catch (err) {
    console.error("❌ Server error:", err);
    res
      .status(500)
      .json({ message: "Error recording satisfaction", error: err.message });
  }
};

export const getSatisfactionsByUser = async (req, res) => {
  try {
    const userSatisfactions = await UserSatisfaction.find();
    res.status(200).json({
      success: true,
      userSatisfactions,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching records", error: err.message });
  }
};

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
        res
        .status(500)
        .json({ message: "Error recording satisfaction", error: err.message });
    }
};

export const getSatisfactionsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const records = await UserSatisfaction.find({ userId })
        res.status(200).json(records);
    } catch (err) {
        res
        .status(500)
        .json({ message: "Error fetching records", error: err.message });
    }
};

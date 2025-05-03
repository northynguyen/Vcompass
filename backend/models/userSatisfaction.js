import mongoose from "mongoose";

const userSatisfactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  scheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Schedule",
    default: null,
    required: false,
  },
  action: {
    type: String,
    enum: ["over_view", "view", "like", "comment", "edit", "save"],
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserSatisfaction =
  mongoose.models.UserSatisfaction ||
  mongoose.model("UserSatisfaction", userSatisfactionSchema);

export default UserSatisfaction;

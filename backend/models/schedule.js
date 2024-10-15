import { Schema } from "mongoose";
import { RatingSchema } from "./rating.js";

const ScheduleSchema = new Schema({
  idSchedule: { type: String, required: true },
  scheduleName: { type: String, required: true },
  description: { type: String },
  address: { type: String, required: true },
  status: { type: String, required: true },
  activities: [ActivitySchema],
  ratings: [RatingSchema],
  comments: [CommentSchema],
  likes: [LikeSchema],
});

const ActivitySchema = new Schema({
  idActivity: { type: String, required: true },
  activityType: { type: String, required: true },
  idDestination: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  description: { type: String },
});

const CommentSchema = new Schema({
  idComment: { type: String, required: true },
  idUser: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const LikeSchema = new Schema({
  idLike: { type: String, required: true },
  idUser: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export { ActivitySchema, CommentSchema, LikeSchema, ScheduleSchema };

import mongoose, { Schema } from "mongoose";

const ActivitySchema = new Schema({
  day: { type: Number, required: true },
  activity: [
    {
      activityType: { type: String, required: true },
      idDestination: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'activity.activityType',
      },
      name: { type: String },
      bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "booking" },
      address: { type: String },
      imgSrc: [{ type: String }],
      cost: { type: Number, required: true },
      costDescription: { type: String, default: '' },
      description: { type: String },
      timeStart: { type: String, required: true },
      timeEnd: { type: String, required: true },
    },
  ],
});

const AdditionalExpenseSchema = new Schema({
  name: { type: String, required: true },
  cost: { type: Number, required: true },
  description: { type: String },
});

const ReplySchema = new Schema({
  idUser: { type: String, required: true },
  userName: { type: String, required: true },
  avatar: { type: String },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const CommentSchema = new Schema({
  idUser: { type: String, required: true },
  userName: { type: String, required: true },
  avatar: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  replies: [ReplySchema],  // Add this line to store replies to the comment
});

const LikeSchema = new Schema({
  idUser: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ScheduleSchema = new Schema(
  {
    idUser: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    idInvitee: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    scheduleName: { type: String, required: true },
    description: { type: String },
    address: { type: String, required: true },
    videoSrc: { type: String },
    imgSrc: [{ type: String }],
    numDays: { type: Number, required: true },
    dateStart: { type: String, required: true },
    dateEnd: { type: String },
    status: { type: String, required: true },
    activities: [ActivitySchema],
    additionalExpenses: [AdditionalExpenseSchema],
    type: { type: [String], required: true },
    comments: [CommentSchema],
    likes: [LikeSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isPublic: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);



const Schedule =
  mongoose.models.ScheduleSchema || mongoose.model("schedule", ScheduleSchema);
export default Schedule;
export { ActivitySchema, CommentSchema, LikeSchema };
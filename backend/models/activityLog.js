import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
    idUser: {  type: mongoose.Schema.Types.ObjectId, ref: "user" , required: true},
    action : { type: String, required: true},
    metadata : { type: Object, required: true},
    createdAt: { type: Date, default: Date.now },
});

const ActivityLog = mongoose.model("activity_log", activityLogSchema);
export default ActivityLog;
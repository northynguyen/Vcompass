import { Schema } from "mongoose";

const LogActivitySchema = new Schema({
  idLogActivity: { type: String, required: true },
  idUser: { type: String, required: true },
  activity: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const LogActivity =
  mongoose.models.LogActivity ||
  mongoose.model("logactivity", LogActivitySchema);
export default LogActivity;

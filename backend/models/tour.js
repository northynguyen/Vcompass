import { Schema } from "mongoose";
import { ScheduleSchema } from "./Schedule.js";

const TourSchema = new Schema({
  idTour: { type: String, required: true },
  tourName: { type: String, required: true },
  address: { type: String, required: true },
  schedules: [ScheduleSchema],
});

const Tour = mongoose.models.Tour || mongoose.model("tour", TourSchema);
export default Tour;

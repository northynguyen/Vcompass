import express from "express";
import { uploadVideo, upload , deleteVideo} from "../controllers/videoController.js";

const videoRouter = express.Router();

// Route upload video
videoRouter.post("/upload", upload.single("video"), uploadVideo);

// Route delete video
videoRouter.delete("/", deleteVideo);


export default videoRouter;

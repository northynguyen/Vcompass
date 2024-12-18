import express from "express";
import { uploadVideo, upload, deleteVideo, uploadImage, deleteImage } from "../controllers/videoController.js";

const videoRouter = express.Router();

videoRouter.post("/upload", upload.single("video"), uploadVideo);

videoRouter.delete("/", deleteVideo);

videoRouter.post("/upload-image", upload.single("image"), uploadImage);

videoRouter.delete("/delete-image", deleteImage);

export default videoRouter;

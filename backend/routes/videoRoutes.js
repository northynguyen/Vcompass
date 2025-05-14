import express from "express";
import { uploadVideo, upload, deleteVideo, uploadImage, deleteImage, copyMediaFromSchedule } from "../controllers/videoController.js";

const videoRouter = express.Router();

videoRouter.post("/upload", upload.single("video"), uploadVideo);

videoRouter.delete("/", deleteVideo);

videoRouter.post("/upload-image", upload.single("image"), uploadImage);

videoRouter.delete("/delete-image", deleteImage);

videoRouter.post("/copy-media", async (req, res) => {
  try {
    const { schedule } = req.body;
    const copiedMedia = await copyMediaFromSchedule(schedule);
    res.status(200).json({
      success: true,
      ...copiedMedia
    });
  } catch (error) {
    console.error('Error copying media:', error);
    res.status(500).json({
      success: false,
      message: 'Error copying media',
      error: error.message
    });
  }
});

export default videoRouter;

import express from 'express';
const router = express.Router();
import fileUpload from 'express-fileupload';
import authMiddleware from "../middleware/auth.js";
import {    
  createShortVideo,
  getShortVideos,
  getShortVideoById,
  updateShortVideo,
  deleteShortVideo,
  toggleLike,
  addComment,
  increaseShares,
  getUserShortVideos,
  getPopularShortVideos,
  togglePin,
  addReply,
  toggleCommentLike,
  toggleReplyLike,
  removeReply,
  increaseViews,
  getTrendingVideos,
  getFollowingVideos
} from '../controllers/ShortVideoController.js';

// Cấu hình middleware upload file
router.use(fileUpload({
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true,
  debug: true,
  abortOnLimit: true,
  responseOnLimit: 'File quá lớn, giới hạn là 100MB',
  safeFileNames: true,
  preserveExtension: true
}));

// Routes không cần xác thực
router.get('/videos',   getShortVideos);
router.get('/videos/:id', getShortVideoById);
router.get('/all/trending', getTrendingVideos);
router.get('/user/:userId', getUserShortVideos);

// Routes cần xác thực
router.post('/videos', authMiddleware, createShortVideo);
router.put('/videos/:id', authMiddleware, updateShortVideo);
router.delete('/videos/:id', authMiddleware, deleteShortVideo);
router.post('/videos/:id/like', authMiddleware, toggleLike);
router.post('/videos/:id/comment', authMiddleware, addComment);
router.post('/videos/:videoId/comment/:commentId/reply', authMiddleware, addReply);
router.post('/videos/:videoId/comment/:commentId/like', authMiddleware, toggleCommentLike);
router.post('/videos/:videoId/comment/:commentId/reply/:replyId/like', authMiddleware, toggleReplyLike);
router.post('/videos/:id/share', authMiddleware, increaseShares);
router.post('/videos/:id/pin', authMiddleware, togglePin);
router.delete('/videos/:videoId/comment/:commentId/reply/:replyId', authMiddleware, removeReply);
router.post('/videos/:id/view', increaseViews);
router.get('/all/following', authMiddleware, getFollowingVideos);

export default router; 
import express from 'express';
import logActivityController from '../controllers/logActivityController.js';
import  authMiddleware  from '../middleware/auth.js';

const router = express.Router();

// Route để tạo log mới
router.post('/create', authMiddleware, logActivityController.logActivity);

// Route để lấy logs của một user
router.get('/user/:userId', authMiddleware, logActivityController.getUserLogs);

// Route để lấy logs của một schedule
router.get('/schedule/:scheduleId', authMiddleware, logActivityController.getScheduleLogs);

// Route để lấy thống kê tương tác của một schedule
router.get('/stats/:scheduleId', authMiddleware, logActivityController.getInteractionStats);

// Route để xóa logs cũ (có thể giới hạn quyền admin)
router.delete('/cleanup', authMiddleware, logActivityController.deleteOldLogs);

export default router; 
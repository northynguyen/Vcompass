import LogActivity from '../models/logActivity.js';
import Schedule from '../models/schedule.js';
import User from '../models/user.js';



const logActivityController = {
  // Log một hoạt động mới
  logActivity: async (req, res) => {
    try {
      const { scheduleId, actionType, content, viewDuration } = req.body;
      const userId = req.body.userId;

  
      // Tính toán các feature phái sinh
      const derivedFeatures = {
        userEngagementScore: await LogActivity.calculateUserEngagement(userId, scheduleId),
        contentPopularityScore: 0, // Sẽ cập nhật sau
        seasonalityScore: 0 // Sẽ cập nhật sau
      };

      // Tạo log mới
      const newLog = new LogActivity({
        userId,
        scheduleId,
        actionType,
        content,
        viewDuration,
        derivedFeatures
      });

      await newLog.save();

      res.status(201).json({
        success: true,
        message: 'Đã lưu log hoạt động',
        log: newLog
      });

    } catch (error) {
      console.error('Error in logActivity:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lưu log hoạt động',
        error: error.message
      });
    }
  },

  // Lấy logs của một user
  getUserLogs: async (req, res) => {
    try {
      const { userId } = req.params;
      const logs = await LogActivity.find({ userId })
        .sort({ interactionTime: -1 })
        .populate('scheduleId', 'title description');

      res.status(200).json({
        success: true,
        logs
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy logs của user',
        error: error.message
      });
    }
  },

  // Lấy logs của một schedule
  getScheduleLogs: async (req, res) => {
    try {
      const { scheduleId } = req.params;
      const logs = await LogActivity.find({ scheduleId })
        .sort({ interactionTime: -1 })
        .populate('userId', 'name avatar');

      res.status(200).json({
        success: true,
        logs
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy logs của schedule',
        error: error.message
      });
    }
  },

  // Lấy thống kê tương tác
  getInteractionStats: async (req, res) => {
    try {
      const { scheduleId } = req.params;
      
      const stats = await LogActivity.aggregate([
        { $match: { scheduleId: scheduleId } },
        { $group: {
          _id: '$actionType',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }},
        { $project: {
          actionType: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }}
      ]);

      res.status(200).json({
        success: true,
        stats
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thống kê tương tác',
        error: error.message
      });
    }
  },

  // Xóa logs cũ
  deleteOldLogs: async (req, res) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await LogActivity.deleteMany({
        interactionTime: { $lt: thirtyDaysAgo }
      });

      res.status(200).json({
        success: true,
        message: 'Đã xóa logs cũ',
        deletedCount: result.deletedCount
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa logs cũ',
        error: error.message
      });
    }
  }
};

export default logActivityController; 
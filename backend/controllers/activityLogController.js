import ActivityLog from '../models/activityLog.js';

// Hàm thêm activity log mới
const addActivityLog = async (req, res) => {
    try {
        const { action, metadata, idUser } = req.body;

        // Validate required fields
        if (!action || !idUser || !metadata) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc: action, idUser, hoặc metadata'
            });
        }

        // Tạo log mới theo schema
        const newLog = new ActivityLog({
            idUser,    // reference tới user
            action,    // hành động thực hiện
            metadata,  // object chứa các thông tin chi tiết
        });

        const savedLog = await newLog.save();
        
        return res.status(201).json({
            success: true,
            data: savedLog
        });

    } catch (error) {
        console.error('Activity Log Error:', error);
        return res.status(500).json({
            success: false,
            message: "Không thể thêm activity log",
            error: error.message
        });
    }
};

export { addActivityLog };

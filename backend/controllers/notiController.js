import { Notification } from "../models/notification.js";


// Controller to create a new notification
const createNotification = async (io, notificationData) => {
  try {
    const notification = new Notification(notificationData);

    await notification.save();
    console.log("Notification created:", notification);
    if (notification.type === 'admin') {
      io.emit('admin', notification);
    }

    else if (notification.type === 'partner') {
      io.emit(`${notification.idReceiver}`, notification);
    }

    else if (notification.type === 'user') {
      io.emit(`${notification.idReceiver}`, notification);
    }

  } catch (err) {
    console.error("Error creating notification:", err.message);
  }
};


const addNotification = async (req, res) => {
  try {
    const { idSender, idReceiver, content, typeNo, nameSender, imgSender } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!idSender || !idReceiver || !content || !typeNo) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newNotification = new Notification({
      idSender,
      idReceiver,
      content,
      type: typeNo,
      nameSender,
      imgSender,
    });

    // Emit sự kiện đến client theo loại thông báo
    global.io.emit(`${newNotification.idReceiver}`, newNotification);

    await newNotification.save();
    res.json({ success: true, message: "Notification added successfully" });
  } catch (error) {
    console.error("Error in addNotification:", error.message);
    res.status(500).json({ success: false, message: "Error adding notification" });
  }
};



const getNotifications = async (req, res) => {
  try {
    const { idReceiver } = req.params;
    if(idReceiver == null) return res.status(400).json({ success: false, message: "Missing required fields" });
    if(idReceiver == "admin") 
    {
      const notifications = await Notification.find({ type: 'admin' }).sort({ createdAt: -1 });
      return res.json({ success: true, notifications });
    }
    else {
    const notifications = await Notification.find({ idReceiver }).sort({ createdAt: -1 });

    res.json({ success: true, notifications });
    }
    
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error fetching notifications" });
  }
};

const updateNotificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    notification.status = status;
    await notification.save();

    res.json({ success: true, message: "Notification status updated successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error updating notification status" });
  }
};

export { addNotification, getNotifications , createNotification,updateNotificationStatus};

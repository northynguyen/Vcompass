import { Notification } from "../models/notification.js";

const addNotification = async (req, res) => {
  try {
    const { idNotificaion, idSender, idReceiver, content } = req.body;
    const newNotification = new Notification({
      idNotificaion,
      idSender,
      idReceiver,
      content,
    });
    await newNotification.save();
    res.json({ success: true, message: "Notification added successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error adding notification" });
  }
};
const removeNotification = async (req, res) => {
  try {
    const { idNotificaion } = req.body;
    const result = await Notification.findOneAndDelete({ idNotificaion });

    if (!result) {
      return res.json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, message: "Notification removed successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error removing notification" });
  }
};

const getNotifications = async (req, res) => {
  try {
    const { idReceiver } = req.body;
    const notifications = await Notification.find({ idReceiver });

    res.json({ success: true, notifications });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error fetching notifications" });
  }
};

export { addNotification, getNotifications, removeNotification };

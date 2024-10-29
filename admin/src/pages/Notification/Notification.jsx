import React, { useState, useContext } from 'react';
import './Notification.css';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';

const Notification = ({ userData }) => {
    const { admin, url } = useContext(StoreContext); // Lấy admin từ StoreContext
    const [userName, setUserName] = useState(userData?.name || ""); // State để nhập tên user
    const [content, setContent] = useState("");   // State để nhập nội dung thông báo
    // Xử lý gửi form
    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            // Thực hiện gửi yêu cầu POST đến server
            const response = await axios.post(`${url}/api/notifications/notifications/`, {
                idSender: admin._id,     // Truyền ID của admin
                idReceiver: userData?._id,  // Truyền ID của user nếu có
                content,                // Nội dung thông báo
            });
            await axios.put(`${url}/api/user/update`, { id: userData._id, status: userData.status });
            // Reset lại các trường input sau khi gửi
            setContent("");
        } catch (error) {
            console.error("Error adding notification:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="block-user-form">
            <div className="form-group">
                <label>Admin Name:</label>
                <input type="text" value={admin.name} disabled className="form-control" />
            </div>
            <div className="form-group">
                <label>User Name:</label>
                <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    disabled={!!userData?.name} // Nếu có userData, khóa trường nhập
                    required
                    className="form-control"
                />
            </div>
            <div className="form-group">
                <label>Content:</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    className="form-control"
                />
            </div>
            <div className="form-buttons">
                <button type="submit" className="btn btn-primary">Send</button>
            </div>
        </form>
    );
};

export default Notification;

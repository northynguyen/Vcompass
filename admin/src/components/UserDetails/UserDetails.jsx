import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './UserDetails.css';

const UserDetails = () => {
    const location = useLocation();
    const user = location.state?.profile;

    const [status, setStatus] = useState(user.status || "Active");
    const [showForm, setShowForm] = useState(false);
    const [reason, setReason] = useState("");

    if (!user) {
        return <div>Error: No user data available</div>;
    }

    const handleStatusChange = (event) => {
        const newStatus = event.target.value;
        setStatus(newStatus);
        if (newStatus === "Blocked") {
            setShowForm(true); // Hiện form gửi thông báo khi chọn "Blocked"
        } else {
            setShowForm(false); // Ẩn form khi chọn "Active"
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // Xử lý gửi thông báo ở đây
        console.log(`Blocking user: ${user.name}, Reason: ${reason}`);
        setShowForm(false); // Ẩn form sau khi gửi
        setReason(""); // Đặt lý do về mặc định
    };

    return (
        <div className="user-details">
            <h1>{user.name}</h1>
            <div className="user-info-avatar">
                <img src={user.avatar} alt={`${user.name}'s avatar`} />
            </div>
            <div className="user-details-info">
                <p><strong>Gender:</strong> {user.gender || "Not specified"}</p>
                <p><strong>Date of Birth:</strong> {user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : "Not specified"}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone_number || "Not specified"}</p>
                <p><strong>Address:</strong> {user.address || "Not specified"}</p>
                <p><strong>Account Created:</strong> {user.createdAt ? new Date(Date.parse(user.createdAt)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Not available"}</p>
                <div>
                    <strong>Status:</strong>
                    <select value={status} onChange={handleStatusChange}>
                        <option value="Active">Active</option>
                        <option value="Blocked">Blocked</option>
                    </select>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="block-user-form">
                    <div>
                        <label>Admin Name:</label>
                        <input type="text" value="Admin Name" disabled />
                    </div>
                    <div>
                        <label>User Name:</label>
                        <input type="text" value={user.name} disabled />
                    </div>
                    <div>
                        <label>Reason for Blocking:</label>
                        <textarea value={reason} onChange={(e) => setReason(e.target.value)} required />
                    </div>
                    <div className="form-buttons">
                        <button type="submit">Send</button>
                        <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default UserDetails;

import React, { useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import './UserDetails.css';
import { StoreContext } from '../../Context/StoreContext';
import Notification from '../../pages/Notification/Notification'; // Import Notification component

const UserDetails = () => {
    const location = useLocation();
    const user = location.state?.profile;
    const admin = useContext(StoreContext).admin;
    const [status, setStatus] = useState(user.status);
    const [previousStatus, setPreviousStatus] = useState(user.status); // Trạng thái trước đó
    const [showForm, setShowForm] = useState(false);
    const [reason, setReason] = useState("");

    if (!user) {
        return <div>Error: No user data available</div>;
    }

    const handleStatusChange = (event) => {
        const newStatus = event.target.value;
        setPreviousStatus(status); // Cập nhật trạng thái trước đó
        setStatus(newStatus);

        // Hiện hộp thoại khi trạng thái thay đổi giữa "blocked" và "active"
        if ((previousStatus === "blocked" && newStatus === "active") ||
            (previousStatus === "active" && newStatus === "blocked")) {
            setShowForm(true); // Hiện form khi chuyển đổi trạng thái
        } else {
            // Ẩn form khi không có chuyển đổi giữa "blocked" và "active"
        }
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
                <p>
                    <strong>Status:</strong>
                    <select value={status} onChange={handleStatusChange}>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                    </select>
                </p>
            </div>

            {showForm && (
                <Notification userData={{ _id: user._id, name: user.name, status }} />
            )}
        </div>
    );
};

export default UserDetails;

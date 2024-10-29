import React, { useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import './PartnerDetails.css';
import { StoreContext } from '../../Context/StoreContext';
import Notification from '../../pages/Notification/Notification'; // Import Notification component
const PartnerDetails = () => {
    const location = useLocation();
    const partner = location.state?.profile;
    const admin = useContext(StoreContext).admin;
    const [status, setStatus] = useState(partner.status);
    const [previousStatus, setPreviousStatus] = useState(partner.status); // Trạng thái trước đó
    const [showForm, setShowForm] = useState(false);
    if (!partner) {
        return <div>Error: No Partner data available</div>;
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
        <div className="partner-details">
            <h1>{partner.name}</h1>
            <div className="partner-avatar">
                <img src={partner.avatar} alt={partner.name} />
            </div>
            <div className="partner-info">
                <p><strong>Gender:</strong> {partner.gender}</p>
                <p><strong>Date of Birth:</strong> {new Date(partner.date_of_birth).toLocaleDateString()}</p>
                <p><strong>Email:</strong> {partner.email}</p>
                <p><strong>Phone:</strong> {partner.phone_number}</p>
                <p><strong>Address:</strong> {partner.address}</p>
                <p><strong>Account Created:</strong> {new Date(Date.parse(partner.createdAt)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p>
                    <strong>Status:</strong>
                    <select value={status} onChange={handleStatusChange}>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                    </select>
                </p>
            </div>
            {showForm && (
                <Notification userData={{ type: "partner", _id: partner._id, name: partner.name, status }} />
            )}
        </div>
    );
};

export default PartnerDetails;

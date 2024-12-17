import React, { useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import Modal from 'react-modal'; // Import React Modal
import './UserDetails.css';
import { StoreContext } from '../../Context/StoreContext';
import Notification from '../../pages/Notification/Notification'; // Import Notification component

// Cấu hình modal
Modal.setAppElement('#root'); // Đảm bảo modal tuân thủ nguyên tắc truy cập

const UserDetails = () => {
    const location = useLocation();
    const user = location.state?.profile;
    const { url } = useContext(StoreContext);
    const [status, setStatus] = useState(user.status);
    const [previousStatus, setPreviousStatus] = useState(user.status); // Trạng thái trước đó
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!user) {
        return <div>Lỗi truy cập nguồn dữ liệu</div>;
    }

    const handleStatusChange = (event) => {
        const newStatus = event.target.value;
        setPreviousStatus(status); // Lưu trạng thái trước đó
        setStatus(newStatus);      // Tạm thời cập nhật trạng thái mới
        setIsModalOpen(true);      // Mở modal
    };

    const closeModal = (isConfirmed) => {
        if (!isConfirmed) {
            setStatus(previousStatus); // Quay lại trạng thái cũ nếu không xác nhận
        }
        setIsModalOpen(false); // Đóng modal
    };

    return (
        <div className="user-details">
            <div className="partner-info">
                <div className="partner-avatar">
                    <img
                        src={
                            user.avatar && user.avatar.includes('http')
                                ? user.avatar
                                : `${url}/images/${user.avatar}`
                        }
                        alt={user.name}
                    />
                </div>
                <div style={{ width: '100%', textAlign: 'center' }}>
                    <h3>{user.name}</h3>
                </div>
                <div className="info-container">
                    <p><strong>Gender:</strong> {user.gender}</p>
                    <p><strong>Date of Birth:</strong> {new Date(user.date_of_birth).toLocaleDateString()}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Phone:</strong> {user.phone_number}</p>
                    <p><strong>Address:</strong> {user.address}</p>
                    <p><strong>Account Created:</strong> {new Date(Date.parse(user.createdAt)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p>
                        <strong>Status:</strong>
                        <select value={status} onChange={handleStatusChange}>
                            <option value="active">Active</option>
                            <option value="blocked">Blocked</option>
                        </select>
                    </p>
                </div>

                {/* Modal Popup */}
                <Modal
                    isOpen={isModalOpen}
                    onRequestClose={() => closeModal(false)}
                    className="notification-modal"
                    overlayClassName="modal-overlay"
                >
                    <button className="close-button" onClick={() => closeModal(false)}>×</button>
                    <Notification
                        userData={{ type: "user", _id: user._id, name: user.name, status }}
                        onClose={closeModal}
                    />
                </Modal>
            </div>
        </div>
    );
};

export default UserDetails;

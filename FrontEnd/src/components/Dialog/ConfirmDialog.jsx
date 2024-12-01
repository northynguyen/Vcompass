import React, { useState } from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ isOpen, onConfirm, onCancel, message ,successMessage}) => {
    const [showSuccess, setShowSuccess] = useState(false);

    const handleConfirm = () => {
        setShowSuccess(true); // Hiển thị dấu tích
        setTimeout(() => {
            setShowSuccess(false); // Sau 2 giây ẩn dấu tích
            onConfirm(); // Gọi callback của hành động xác nhận xóa
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="custom-modal-overlay">
            {showSuccess ? (
                <div className="custom-success-container">
                    <div className="custom-checkmark"></div>
                    <p>{successMessage || 'Xóa thành công'}</p>
                </div>
            ) : (
                <div className="custom-modal-container">
                    <div className="custom-modal-header">
                        <p>{message || 'Bạn có chắc chắn muốn thực hiện hành động này không?'}</p>
                    </div>
                    <div className="custom-modal-buttons">
                        <button className="custom-confirm-btn" onClick={handleConfirm}>
                            Xác nhận
                        </button>
                        <button className="custom-cancel-btn" onClick={onCancel}>
                            Hủy
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConfirmDialog;

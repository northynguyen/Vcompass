
import React, { useState, useRef, useEffect, useContext } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import './CancelBooking.css';
import { toast } from 'react-toastify';

const CancelBooking = ({ booking, onClose }) => {
    const { url } = useContext(StoreContext);
    const [reason, setReason] = useState('');
    const [additionalComments, setAdditionalComments] = useState('');
    const [otherReasons, setOtherReasons] = useState('');
    const formRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            const response = await fetch(`${url}/api/bookings/${booking._id}/cancel`, {
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reason,
                    additionalComments,
                    otherReasons
                }),
            });

            const data = await response.json();
            if (data.success) {
                setIsLoading(false);
                toast.success('Hủy đặt phòng thành công!');
                setTimeout(() => {
                    onClose();
                }, 1000);
            } else {
                setIsLoading(false);
                console.error('Hủy không thành công:', data.message);
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Lỗi khi hủy đặt phòng:', error);
        }
    };

    return (
        <div className="cancel-booking">
            <h3>Hủy đặt phòng tại {booking.hotel}</h3>
            <form onSubmit={handleSubmit} ref={formRef}>
                <div className="confirmation">
                    <p>Bạn có chắc chắn muốn hủy đặt phòng này không?</p>
                </div>

                <div className="rating-group">
                    <label>Lý do hủy:</label>
                    <select value={reason} onChange={(e) => setReason(e.target.value)} required>
                        <option value="">Chọn lý do</option>
                        <option value="Change of plans">Thay đổi kế hoạch</option>
                        <option value="Found a better price">Tìm được giá tốt hơn</option>
                        <option value="Unsatisfied with the service">Không hài lòng với dịch vụ</option>
                        <option value="Other">Khác</option>
                    </select>
                </div>

                {reason === 'Other' && (
                    <div className="rating-group">
                        <label>Vui lòng mô tả chi tiết:</label>
                        <input
                            type="text"
                            value={otherReasons}
                            onChange={(e) => setOtherReasons(e.target.value)}
                            placeholder="Lý do của bạn..."
                        />
                    </div>
                )}

                <div className="comment-section">
                    <label>Bình luận bổ sung:</label>
                    <textarea
                        value={additionalComments}
                        onChange={(e) => setAdditionalComments(e.target.value)}
                        placeholder="Nhập ý kiến bổ sung của bạn..."
                    />
                </div>

                <button type="submit" className="submit-btn">Xác nhận hủy</button>
            </form>

            {isLoading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                </div>
            )}
        </div>
    );
};

export default CancelBooking;

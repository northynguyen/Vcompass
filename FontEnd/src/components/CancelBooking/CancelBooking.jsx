/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// src/components/CancelBooking/CancelBooking.js
import React, { useState, useRef, useEffect } from 'react';
import './CancelBooking.css';

const CancelBooking = ({ booking, onClose }) => {
    const [reason, setReason] = useState('');
    const [additionalComments, setAdditionalComments] = useState('');
    const [otherReasons, setOtherReasons] = useState('');
    const formRef = useRef(null);

    useEffect(() => {
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic gửi dữ liệu hủy phòng (ví dụ: gửi đến API)
        console.log('Booking to cancel:', booking);
        console.log('Reason for cancellation:', reason);
        console.log('Additional Comments:', additionalComments);
        // Reset form sau khi gửi
        setReason('');
        setAdditionalComments('');
        // Đóng popup sau khi gửi
        onClose();
    };

    return (
        <div className="cancel-booking">
            <h3>Cancel Your Booking at {booking.hotel}</h3>
            <form onSubmit={handleSubmit} ref={formRef}>
                <div className="confirmation">
                    <p>Are you sure you want to cancel this booking?</p>
                </div>

                <div className="rating-group">
                    <label>Reason for Cancellation:</label>
                    <select value={reason} onChange={(e) => setReason(e.target.value)} required>
                        <option value="">Select a reason</option>
                        <option value="Change of plans">Change of plans</option>
                        <option value="Found a better price">Found a better price</option>
                        <option value="Unsatisfied with the service">Unsatisfied with the service</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {reason === 'Other' && (
                    <div className="rating-group">
                        <label>Please specify:</label>
                        <input 
                            type="text" 
                            value={otherReasons} 
                            onChange={(e) => setOtherReasons(e.target.value)} 
                            placeholder="Your reason here..."
                        />
                    </div>
                )}

                <div className="comment-section">
                    <label>Additional Comments:</label>
                    <textarea 
                        value={additionalComments} 
                        onChange={(e) => setAdditionalComments(e.target.value)} 
                        placeholder="Any additional feedback..."
                    />
                </div>

                <button type="submit" className="submit-btn">Confirm Cancellation</button>
            </form>
        </div>
    );
};

export default CancelBooking;

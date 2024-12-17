/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// src/components/CancelBooking/CancelBooking.js
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
                toast.success('Booking canceled successfully!');
                setTimeout(() => {
                    onClose();
                }, 1000);
            } else {
                setIsLoading(false);
                console.error('Cancellation failed:', data.message);
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Error canceling booking:', error);
        }
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

            {isLoading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                </div>
            )}
        </div>
    );
};

export default CancelBooking;

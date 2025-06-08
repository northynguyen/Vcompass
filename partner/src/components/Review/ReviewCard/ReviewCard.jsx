import React, { useState } from 'react';
import { FaRegCalendarAlt, FaStar } from 'react-icons/fa';
import './ReviewCard.css';

const ReviewCard = ({ service, rating, handleResponse, url }) => {
    const [showResponseInput, setShowResponseInput] = useState(false);
    const [responseText, setResponseText] = useState(rating.response || '');
    const handleResponseClick = () => {
        setShowResponseInput(!showResponseInput);
    };

    const handleResponseChange = (e) => {
        setResponseText(e.target.value);
    };

    const handleSubmit = () => {
        handleResponse(rating._id, responseText)
        setShowResponseInput(false);
    };

    const renderStarRating = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <FaStar
                key={index}
                color={index < rating ? '#FFD700' : '#ddd'} // Filled stars in gold, unfilled in gray
                className="star-icon"
            />
        ));
    };

    return (
        <div className="review-card">
            <div className="review-avatar">
            <img 
                src={
                    rating.idUser.avatar && rating.idUser.avatar.includes('http')
                    ? rating.idUser.avatar 
                    : `${url}/images/${rating.idUser.avatar || 'default-avatar.png'}`
                }
                alt="User avatar"
                />
            </div>
            <div className="review-content">
                <div className="review-header">
                    <h4>{rating.idUser.name}</h4>
                    <p><FaRegCalendarAlt /> {new Date(rating.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                <div className="review-stars">
                    <p>Tổng quan </p>
                    {renderStarRating(rating.rate)}
                </div>
                <div className="review-stars">
                    <p>Dịch vụ</p>
                    {renderStarRating(rating.serviceRate)}
                </div>
                <div className="review-stars">
                    <p>{!service.name   ? "Thức ăn"   :"Phòng" }</p>
                    {renderStarRating(rating.foodRate ? rating.foodRate : rating.roomRate  )}
                </div>
                <p className="review-comment">{rating.content}</p>

                {!rating.response &&
                    <button className={`response-button ${showResponseInput ? "active-show-response" : ""}`} onClick={handleResponseClick}>
                        {showResponseInput ? 'Hủy' : 'Phản hồi'}
                    </button>}

                {showResponseInput && (
                    <div className="response-input">
                        <textarea
                            value={responseText}
                            onChange={handleResponseChange}
                            placeholder="Write your response..."
                        />
                        <div className="btn-confirm-container">
                            <button className="submit-response" onClick={handleSubmit}>Xác nhận</button>
                        </div>
                    </div>
                )}

                {rating.response && !showResponseInput && (
                    <div className="existing-response">
                        <p><strong>{`${!service.name   ? service.foodServiceName : service.name}: `} </strong> {rating.response}</p>
                        <p className='response-time'>Đã phản hồi lúc: {new Date(rating.responseTime).toLocaleString()}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewCard;
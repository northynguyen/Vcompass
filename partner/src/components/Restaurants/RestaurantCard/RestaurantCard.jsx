/* eslint-disable react/prop-types */
// src/components/FABS/RestaurantCard.js
import './RestaurantCard.css';
import { FaEllipsisV } from 'react-icons/fa';
import { useState } from 'react';

const RestaurantCard = ({ restaurant, onMenuClick, onCardClick, url }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleDescription = (e) => {
        e.stopPropagation(); // Ngăn chặn sự kiện click lên card
        setIsExpanded((prev) => !prev);
    };
    return (
        <div className="restaurant-card" onClick={onCardClick}>
            <img
                src={restaurant.images[0]?.includes('http') ? restaurant.images[0] : `${url}/images/${restaurant.images[0]}`}
                alt={restaurant.foodServiceName}
                className="restaurant-image"
            />
            <div className="restaurant-info">
                <h3>{restaurant.foodServiceName}</h3>
                <p><strong>Địa Điểm:</strong> {restaurant.location.address}</p>
                <p>
                    <strong>Mô Tả:</strong>
                    <span className={`restaurant-description ${isExpanded ? 'expanded' : ''}`}>
                        {restaurant.description}
                    </span>
                    {restaurant.description.length > 100 && (
                        <button
                            className="show-more-btn"
                            onClick={toggleDescription}
                        >
                            {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                        </button>
                    )}
                </p>
                <p>
                    <strong>Trạng Thái:</strong>
                    <span className={`status-badge ${restaurant.status}`}>
                        {restaurant.status === 'active' ? 'Đang hoạt động' : restaurant.status === 'block' ? 'Đã bị khóa' : restaurant.status === 'pending' ? 'Đang được duyệt' : 'Dừng hoạt động'}
                    </span>
                </p>
            </div>
            <div className="restaurant-actions">
                <FaEllipsisV
                    className="actions-icon"
                    onClick={(e) => {
                        e.stopPropagation(); // Ngăn sự kiện click lên card
                        onMenuClick(restaurant);
                    }}
                />
            </div>
        </div>
    );
};

export default RestaurantCard;

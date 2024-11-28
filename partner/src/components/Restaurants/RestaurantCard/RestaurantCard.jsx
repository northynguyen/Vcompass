/* eslint-disable react/prop-types */
// src/components/FABS/RestaurantCard.js
import './RestaurantCard.css';
import { FaEllipsisV } from 'react-icons/fa';

const RestaurantCard = ({ restaurant, onMenuClick, onCardClick, url }) => {
    return (
        <div className="restaurant-card" onClick={onCardClick}>
            <img src={`${url}/images/${restaurant.images[0]}`} alt={restaurant.foodServiceName} className="restaurant-image" />
            <div className="restaurant-info">
                <h3>{restaurant.foodServiceName}</h3>
                <p><strong>Địa Điểm:</strong> {restaurant.location.address}</p>
                <p><strong>Mô Tả:</strong> {restaurant.description}</p>
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

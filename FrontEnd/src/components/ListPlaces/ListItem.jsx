import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { StoreContext } from '../../Context/StoreContext';
import './ListPlaces.css';

const ListItem = ({ item, type, additionalData }) => {
  const { getImageUrl } = useContext(StoreContext);
  const navigate = useNavigate();

  const onClick = (serviceId) => {
    const encryptedServiceId = CryptoJS.AES.encrypt(serviceId, 'mySecretKey').toString();
    const safeEncryptedServiceId = encodeURIComponent(encryptedServiceId);
    
    let route;
    let state = {};
    
    switch (type) {
      case 'accommodation':
        route = `/place-details/accommodation/${safeEncryptedServiceId}`;
        state = { filterData: additionalData };
        break;
      case 'attraction':
        route = `/place-details/attraction/${safeEncryptedServiceId}`;
        break;
      case 'food':
        route = `/place-details/food/${safeEncryptedServiceId}`;
        break;
      default:
        route = `/place-details/${safeEncryptedServiceId}`;
    }
    
    navigate(route, state.filterData ? { state } : undefined);
    window.scrollTo(0, 0);
  };

  const getRatingInfo = (ratings) => {
    const totalReviews = ratings?.length || 0;
    const averageRating = totalReviews > 0
      ? (ratings.reduce((sum, r) => sum + (Number(r.rate) || 0), 0) / totalReviews).toFixed(1)
      : 'Chưa có đánh giá';
    return { totalReviews, averageRating };
  };

  if (!item) return null;

  const { totalReviews, averageRating } = getRatingInfo(item.ratings || []);

  let name, priceDisplay;
  
  // Get the correct name based on place type
  switch (type) {
    case 'accommodation':
      name = item.name;
      if (item.roomTypes && item.roomTypes.length > 0) {
        const prices = item.roomTypes.map(room => room.pricePerNight);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        priceDisplay = (
          <>
            <p className="card-range-price">
              {minPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </p>
            <p className="card-range-price">-</p>
            <p className="card-range-price">
              {maxPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </p>
          </>
        );
      }
      break;
    case 'attraction':
      name = item.attractionName;
      priceDisplay = (
        <p className="card-range-price">
          {item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
        </p>
      );
      break;
    case 'food':
      name = item.foodServiceName;
      priceDisplay = (
        <>
          <p className="card-range-price">
            {(item.price?.minPrice || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </p>
          <p className="card-range-price">-</p>
          <p className="card-range-price">
            {(item.price?.maxPrice || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </p>
        </>
      );
      break;
    default:
      name = item.name || 'Không có tên';
      priceDisplay = null;
  }

  return (
    <div className="accomodation-card-home">
      <div className="card-content-container">
        {/* Hình ảnh */}
        <div className="card-content-img" onClick={() => onClick(item._id)}>
          <img
            src={getImageUrl(item)}
            alt={name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg';
            }}
          />
        </div>

        {/* Wrapper cho nội dung và giá */}
        <div className="card-content-wrapper">
          {/* Nội dung chính */}
          <div className="card-content">
            <h3 onClick={() => onClick(item._id)}>{name}</h3>
            {item.location && (
              <a
                href={`https://www.google.com/maps/?q=${item.location.latitude},${item.location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.location.address}
              </a>
            )}
            <p>{item.description}</p>
            <p className="card-reviews">
              ⭐ {averageRating} ({totalReviews} đánh giá)
            </p>
          </div>

          {/* Hiển thị giá */}
          <div className="card-content-price">
            {priceDisplay}
          </div>
        </div>
      </div>
    </div>
  );
};

ListItem.propTypes = {
  item: PropTypes.object.isRequired,
  type: PropTypes.oneOf(['accommodation', 'attraction', 'food']).isRequired,
  additionalData: PropTypes.object
};

export default ListItem; 
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { StoreContext } from '../../Context/StoreContext';
import './ListPlaces.css';

const ListItem = ({ item, type, additionalData, status = "Default", setCurDes }) => {
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

  const handleSelect = () => {
    if (setCurDes) {
      setCurDes(item);
    }
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
            <p className="list-item-price-value">
              {minPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </p>
            <p className="list-item-price-value">-</p>
            <p className="list-item-price-value">
              {maxPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </p>
          </>
        );
      }
      break;
    case 'attraction':
      name = item.attractionName;
      priceDisplay = (
        <p className="list-item-price-value">
          {item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
        </p>
      );
      break;
    case 'food':
      name = item.foodServiceName;
      priceDisplay = (
        <>
          <p className="list-item-price-value">
            {(item.price?.minPrice || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </p>
          <p className="list-item-price-value">-</p>
          <p className="list-item-price-value">
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
    <div className="list-item-card">
      <div className="list-item-content-container">
        {/* Hình ảnh */}
        <div className="list-item-img" onClick={() => onClick(item._id)}>
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
        <div className="list-item-wrapper">
          {/* Nội dung chính */}
          <div className="list-item-content">
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
            <p className="list-item-reviews">
              ⭐ {averageRating} ({totalReviews} đánh giá)
            </p>
          </div>
          <div className="list-item-price-select-container">
            {/* Hiển thị giá và nút chọn */}
            <div className="list-item-price">
              <div className="list-item-price-container">
                {priceDisplay}
              </div>
            </div>
            {status !== "Default" && (
                <div className="list-item-select-container">
                  <button className="list-item-select-btn" onClick={handleSelect}>
                    Chọn
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
     
    </div>
  );
};

ListItem.propTypes = {
  item: PropTypes.object.isRequired,
  type: PropTypes.oneOf(['accommodation', 'attraction', 'food']).isRequired,
  additionalData: PropTypes.object,
  status: PropTypes.string,
  setCurDes: PropTypes.func
};

export default ListItem; 
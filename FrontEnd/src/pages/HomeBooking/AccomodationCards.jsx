import React, { useContext, useEffect, useState } from 'react';
import './AccomodationCards.css';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import PropTypes from 'prop-types';

const AccomodationCards = ({ accommodationsFound, startDay, endDay, adults, childrenCount }) => {
    const { url,getImageUrl  } = useContext(StoreContext);
    const [accomodations, setAccomodations] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const navigate = useNavigate();
    const filterData = { startDay, endDay, adults, childrenCount };
    
    useEffect(() => {
        setAccomodations(accommodationsFound || []);
        setIsInitialized(true); // Mark that we've received data at least once
    }, [accommodationsFound]);

    const onClick = (serviceId) => {
        const encryptedServiceId = CryptoJS.AES.encrypt(serviceId, 'mySecretKey').toString();
        const safeEncryptedServiceId = encodeURIComponent(encryptedServiceId);
        navigate(`/place-details/accommodation/${safeEncryptedServiceId}`, { state: { filterData } });
        window.scrollTo(0, 0);
    };

    const getRatingInfo = (ratings) => {
        const totalReviews = ratings.length;
        const averageRating = totalReviews > 0
            ? (ratings.reduce((sum, r) => sum + (Number(r.rate) || 0), 0) / totalReviews).toFixed(1)
            : 'Chưa có đánh giá';
        return { totalReviews, averageRating };
    };

    return (
        <div className="accomodation-cards">
            <h2>Danh sách khách sạn</h2>
            {/* Only show "Không tìm thấy khách sạn" if we've initialized and have no accommodations */}
            {isInitialized && accomodations.length === 0 && <p>Không tìm thấy khách sạn</p>}
            
            <div className="card-list">
                {accomodations.map((item) => {
                    const prices = item.roomTypes ? item.roomTypes.map(room => room.pricePerNight) : [];

                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    const { totalReviews, averageRating } = getRatingInfo(item.ratings);
                    return (
                        <div key={item._id} className="accomodation-card-home">
                            <div className='card-content-container'>
                                <div className='card-content-img' onClick={() => onClick(item._id)}>
                                    <img
                                     src={getImageUrl(item)}
                                      alt={item.name} 
                                        onError={(e) => {
                                            e.target.onerror = null; // Prevent infinite loop
                                            e.target.src = 'https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg';
                                        }}
                                       />
                                </div>
                                <div className='card-content'>
                                    <h3 onClick={() => onClick(item._id)}>{item.name}</h3>
                                    <a href={`https://www.google.com/maps/?q=${item.location.latitude},${item.location.longitude}`}>{item.location.address}</a>
                                    <p>{item.description}</p>
                                    <p className="card-reviews">
                                        ⭐ {averageRating} ({totalReviews} đánh giá)
                                    </p>
                                </div>
                                <div className='card-content-price'>
                                    <p className="card-range-price">{minPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                                    <p className="card-range-price">đến</p>
                                    <p className="card-range-price">{maxPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Add PropTypes validation
AccomodationCards.propTypes = {
    accommodationsFound: PropTypes.array,
    startDay: PropTypes.object,
    endDay: PropTypes.object,
    adults: PropTypes.number,
    childrenCount: PropTypes.number
};

export default AccomodationCards;

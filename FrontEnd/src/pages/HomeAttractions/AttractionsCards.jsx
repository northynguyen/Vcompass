import React, { useContext, useEffect, useState } from 'react';
import './AttractionsCards.css';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';

const AttractionsCards = ({ attractionsFound }) => {
    const { url } = useContext(StoreContext);
    const [attractions, setAttractions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setAttractions(attractionsFound || []); // Cập nhật danh sách attractions
    }, [attractionsFound]);

    const onClick = (serviceId) => {
        const encryptedServiceId = CryptoJS.AES.encrypt(serviceId, 'mySecretKey').toString();
        const safeEncryptedServiceId = encodeURIComponent(encryptedServiceId);
        navigate(`/place-details/attraction/${safeEncryptedServiceId}`);
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
            <h2>Danh sách điểm đến</h2>

            <div className="card-list">
                {attractions.length === 0 && <p>Không tìm thấy điểm đến</p>}
                {attractions.map((item) => {
                    const { totalReviews, averageRating } = getRatingInfo(item.ratings);
                    return (
                        <div key={item._id} className="accomodation-card-home">
                            <div className="card-content-container">
                                <div className="card-content-img" onClick={() => onClick(item._id)}>
                                    <img src={`${url}/images/${item.images[0]}`} alt={item.attractionName} />
                                </div>
                                <div className="card-content">
                                    <h3 onClick={() => onClick(item._id)}>{item.attractionName}</h3>
                                    <a href={`https://www.google.com/maps/?q=${item.location.latitude},${item.location.longitude}`}>
                                        {item.location.address}
                                    </a>
                                    <p>{item.description}</p>
                                    <p className="card-reviews">
                                        ⭐ {averageRating} ({totalReviews} đánh giá)
                                    </p>
                                </div>
                                <div className="card-content-price">
                                    
                                    <p className="card-range-price">{item.price > 0 ? `${item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ₫` : 'Free'}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AttractionsCards;

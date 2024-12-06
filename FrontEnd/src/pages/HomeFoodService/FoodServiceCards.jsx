import React, { useContext, useEffect, useState } from 'react';
import './FoodServiceCards.css';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';

const FoodServiceCards = (foodServicesFound) => {
    const { url } = useContext(StoreContext);
    const [foodService, setFoodService] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setFoodService(foodServicesFound.foodServicesFound || []);
    }, [foodServicesFound]);

    const onClick = (serviceId) => {
        const encryptedServiceId = CryptoJS.AES.encrypt(serviceId, 'mySecretKey').toString();
        const safeEncryptedServiceId = encodeURIComponent(encryptedServiceId);
        navigate(`/place-details/food/${safeEncryptedServiceId}`);
        window.scrollTo(0, 0);
    };
    return (
        <div className="accomodation-cards">
            <h2>Danh sách nhà hàng</h2>

            <div className="card-list">
                {foodService.length === 0 && <p>Không tìm thấy nhà hàng</p>}
                {foodService.map((item) => {
                    // Lấy giá thấp nhất và cao nhất từ dữ liệu
                    const minPrice = item.price?.minPrice || 0;
                    const maxPrice = item.price?.maxPrice || 0;

                    return (
                        <div key={item._id} className="accomodation-card-home">
                            <div className="card-content-container">
                                {/* Hình ảnh */}
                                <div className="card-content-img" onClick={() => onClick(item._id)}>
                                    <img
                                        src={`${url}/images/${item.images[0]}`}
                                        alt={item.foodServiceName}
                                    />
                                </div>

                                {/* Nội dung chính */}
                                <div className="card-content">
                                    <h3 onClick={() => onClick(item._id)}>{item.foodServiceName}</h3>
                                    <a
                                        href={`https://www.google.com/maps/?q=${item.location.latitude},${item.location.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {item.location.address}
                                    </a>
                                    <p>{item.description}</p>
                                </div>

                                {/* Hiển thị giá */}
                                <div className="card-content-price">
                                    <p>
                                        {minPrice.toLocaleString()} - {maxPrice.toLocaleString()} VND
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FoodServiceCards;

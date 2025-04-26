import React, { useState, useContext, useEffect } from 'react';
import './MyWishList.css';
import axios from 'axios';
import { StoreContext } from '../../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { FaHeart } from "react-icons/fa";

const MyWishList = () => {
    const navigate = useNavigate();
    const { url, token, user,getImageUrl } = useContext(StoreContext);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('schedule');
    const [scheduleData, setScheduleData] = useState([]);
    const [accommodationData, setAccommodationData] = useState([]);
    const [attractionData, setAttractionData] = useState([]);
    const [foodserviceData, setFoodserviceData] = useState([]);
    const [type, setType] = useState('');

    const handleTabClick = (tab) => setActiveTab(tab);

    const renderCardContent = (service) => {
        switch (type) {
            case 'accommodation':
                return (
                    <>
                        <h3 className="card-title">{service.name}</h3>
                        <p className="card-facilities">
                            {service.amenities?.join(' • ')}
                        </p>
                        <p className="card-price">{service.roomTypes[0]?.pricePerNight}đ / đêm</p>
                    </>
                );
            case 'food':
                return (
                    <>
                        <h3 className="card-title">{service.foodServiceName}</h3>
                        {service.operatingHours.map((hour, index) => (
                            <p key={index} className="card-duration">
                                {hour.openTime} - {hour.closeTime} | {hour.startDay} - {hour.endDay}
                            </p>
                        ))}
                        <p className="card-facilities">
                            {service.amenities?.join(' • ')}
                        </p>
                        <p className="card-price">{service.price.minPrice}đ - {service.price.maxPrice}đ / người</p>
                    </>
                );
            case 'attraction':
                return (
                    <>
                        <h3 className="card-title">{service.attractionName}</h3>
                        {service.operatingHours.map((hour, index) => (
                            <p key={index} className="card-duration">
                                {hour.openTime} - {hour.closeTime} | {hour.startDay} - {hour.endDay}
                            </p>
                        ))}
                        <p className="card-facilities">
                            {service.amenities?.join(' • ')}
                        </p>
                        <p className="card-price">{service.price.toLocaleString()}đ / người</p>
                    </>
                );
            default:
                return null;
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [scheduleRes, accommodationRes, attractionRes, foodserviceRes] = await Promise.all([
                axios.get(`${url}/api/schedule/user/getSchedules?type=wishlist`, { headers: { token } }),
                axios.get(`${url}/api/accommodations/user/wishlist`, { headers: { token } }),
                axios.get(`${url}/api/attractions/user/wishlist`, { headers: { token } }),
                axios.get(`${url}/api/foodservices/user/get/wishlist`, { headers: { token } }),
            ]);

            setScheduleData(scheduleRes.data.success ? scheduleRes.data.schedules : []);
            setAccommodationData(accommodationRes.data.success ? accommodationRes.data.accommodations : []);
            setAttractionData(attractionRes.data.success ? attractionRes.data.attractions : []);
            setFoodserviceData(foodserviceRes.data.success ? foodserviceRes.data.foodServices : []);
        } catch (error) {
            console.error("Error fetching wishlist data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getRatingInfo = (ratings) => {
        const totalReviews = ratings.length;
        const averageRating = totalReviews > 0
            ? (ratings.reduce((sum, r) => sum + (Number(r.rate) || 0), 0) / totalReviews).toFixed(1)
            : 'Chưa có đánh giá';
        return { totalReviews, averageRating };
    };
    const onClick = (serviceId) => {
        const encryptedServiceId = CryptoJS.AES.encrypt(serviceId, 'mySecretKey').toString();
        const safeEncryptedServiceId = encodeURIComponent(encryptedServiceId);
        navigate(`/place-details/${type}/${safeEncryptedServiceId}`);
        window.scrollTo(0, 0);
    };

    const handleRemoveFromWishlist = async (type, itemId) => {
        try {
            const response = await fetch(
                `${url}/api/user/user/${user._id}/addtoWishlist?type=${type}&itemId=${itemId}&action=remove`,
                {
                    method: "POST",
                    headers: { token: token },
                }
            );

            if (response.ok) {
                if (type === "schedule") {
                    setScheduleData((prev) => prev.filter((item) => item._id !== itemId));
                }
                // Filter out the removed item from the corresponding state
                if (type === "attraction") {
                    setAttractionData((prev) => prev.filter((item) => item._id !== itemId));
                } else if (type === "accommodation") {
                    setAccommodationData((prev) => prev.filter((item) => item._id !== itemId));
                } else if (type === "foodService") {
                    setFoodserviceData((prev) => prev.filter((item) => item._id !== itemId));
                }
            } else {
                console.error("Failed to remove from wishlist.");
            }
        } catch (error) {
            console.error("Error removing from wishlist:", error);
        }
    };


    useEffect(() => {
        if (token && url) fetchData();
    }, [token, url]);

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="my-wishlist">
            <h2>Danh sách đã lưu</h2>
            <div className="tab-navigation">
                <button className={activeTab === 'schedule' ? 'active-tab' : ''} onClick={() => handleTabClick('schedule')}>
                    Lịch trình
                </button>
                <button className={activeTab === 'accommodation' ? 'active-tab' : ''} onClick={() => { handleTabClick('accommodation'); setType('accommodation'); }}>
                    Khách sạn
                </button>
                <button className={activeTab === 'attraction' ? 'active-tab' : ''} onClick={() => { handleTabClick('attraction'); setType('attraction'); }}>
                    Điểm tham quan
                </button>
                <button className={activeTab === 'foodservice' ? 'active-tab' : ''} onClick={() => { handleTabClick('foodservice'); setType('food'); }}>
                    Điểm ăn uống
                </button>
            </div>

            {activeTab === 'schedule' && (
                <div className="schedule-content">
                    {scheduleData.length > 0 ? (
                        <div className="featured-schedules">
                            {scheduleData.map((schedule) => (
                                <div
                                    key={schedule._id}
                                    className="schedule-card"
                                    onClick={() => navigate(`/schedule-view/${schedule._id}`)}
                                >
                                      <div className="image-container">
                                        {schedule.imgSrc && schedule.imgSrc[0] ? (
                                        // Hiển thị ảnh nếu có imgSrc
                                        <img
                                            className="content-image"
                                            src={ schedule.imgSrc[0].includes("http") ? schedule.imgSrc[0] : `${url}/images/${schedule.imgSrc[0]}`}
                                            alt="Schedule Image"
                                        />
                                        ) : schedule.videoSrc ? (
                                        // Hiển thị video từ Cloudinary nếu có videoSrc
                                        <video
                                            className="content-video"
                                            src={schedule.videoSrc}
                                            autoPlay
                                            loop
                                            muted
                                            controls
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                        ) : (
                                        // Hiển thị ảnh mặc định nếu không có cả imgSrc lẫn videoSrc
                                        <img
                                            className="content-image"
                                            src="https://bazantravel.com/cdn/medias/uploads/83/83317-khu-nghi-duong-lan-rung-700x420.jpg"
                                            alt="Default Image"
                                        />
                                        )}

                                        <button
                                            className="heart-icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFromWishlist("schedule", schedule._id);
                                            }}
                                        >
                                            <FaHeart/>
                                        </button>
                                        </div>
                                    <div className="schedule-info">
                                        <h3>{schedule.scheduleName}</h3>
                                        <p>Địa điểm: {schedule.address}</p>
                                        <p>Ngày bắt đầu: {schedule.dateStart}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Không có lịch trình đã lưu.</p>
                    )}
                </div>
            )}

            {activeTab === 'accommodation' && (
                <div className="accommodation-content">
                    {accommodationData.length > 0 && accommodationData.map((service) => {
                        const { totalReviews, averageRating } = getRatingInfo(service.ratings);
                        return (
                            <div className="card" key={service._id} onClick={() => onClick(service._id)}>
                                <div className="image-container">
                                    <img
                                        src={getImageUrl(service)}
                                        alt={service.name}
                                        className="card-image"
                                        onError={(e) => {
                                            e.target.onerror = null; // Prevent infinite loop
                                            e.target.src = 'https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg';
                                        }}
                                    />
                                    <button
                                        className="heart-icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveFromWishlist("accommodation", service._id);
                                        }}
                                    >
                                        <FaHeart/>
                                    </button>
                                </div>
                                <div className="card-content">
                                    {renderCardContent(service)}
                                    <p className="card-reviews">
                                        ⭐ {averageRating} ({totalReviews} đánh giá)
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    {accommodationData.length === 0 && (
                        <p>Không có khách sạn được lưu.</p>
                    )}
                </div>
            )}

            {activeTab === 'attraction' && (
                <div className="attraction-content">
                    { attractionData.length > 0 && attractionData.map((service) => {
                        const { totalReviews, averageRating } = getRatingInfo(service.ratings);
                        return (
                            <div className="card" key={service._id} onClick={() => onClick(service._id)}>
                                <div className="image-container">
                                    <img
                                        src={getImageUrl(service)}
                                        alt={service.name}
                                        className="card-image"
                                        onError={(e) => {
                                            e.target.onerror = null; // Prevent infinite loop
                                            e.target.src = 'https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg';
                                        }}
                                    />
                                    <button
                                        className="heart-icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveFromWishlist("attraction", service._id);
                                        }}
                                    >
                                        <FaHeart/>
                                    </button>
                                </div>

                                <div className="card-content">
                                    {renderCardContent(service)}
                                    <p className="card-reviews">
                                        ⭐ {averageRating} ({totalReviews} đánh giá)
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    {!attractionData && (
                        <p>Không có điểm tham quan được lưu.</p>
                    )}
                </div>
            )}

            {activeTab === 'foodservice' && (
                <div className="foodservice-content">
                    {foodserviceData && foodserviceData.map((service) => {
                        const { totalReviews, averageRating } = getRatingInfo(service.ratings);
                        return (
                            <div className="card" key={service._id} onClick={() => onClick(service._id)}>
                               <div className="image-container">
                                    <img
                                        src={getImageUrl(service)}
                                        alt={service.name}
                                        className="card-image"
                                        onError={(e) => {
                                            e.target.onerror = null; // Prevent infinite loop
                                            e.target.src = 'https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg';
                                        }}
                                    />
                                    <button
                                        className="heart-icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveFromWishlist("foodService", service._id);
                                        }}
                                    >
                                        <FaHeart/>
                                    </button>
                                </div>
                                
                                <div className="card-content">
                                    {renderCardContent(service)}
                                    <p className="card-reviews">
                                        ⭐ {averageRating} ({totalReviews} đánh giá)
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    
                    {!foodserviceData && (
                        <p>Không có điểm ăn uống được lưu.</p>
                    )}
                </div>
            )}

        </div>
    );
};

export default MyWishList;

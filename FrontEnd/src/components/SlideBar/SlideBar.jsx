/* eslint-disable react/prop-types */
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import './SlideBar.css';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import CryptoJS from 'crypto-js';
import SlideBarSkeleton from './SlideBarSkeleton';

const SlideBar = ({ type }) => {
    const [popularServices, setPopularServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { url } = useContext(StoreContext);

    useEffect(() => {
        const fetchFoodServices = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${url}/api/foodservices/`, {
                    params: {
                        status: "active" // Thêm status vào query string
                    }
                });
                const sortedServices = response.data.foodService.slice(0, 10);
                setPopularServices(sortedServices);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching food services:', error);
                setLoading(false);
            }
        };

        const fetchAccommodations = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${url}/api/accommodations`, {
                    params: {
                        status: "active"
                    }
                });
                const sortedServices = response.data.accommodations.slice(0, 10);
                setPopularServices(sortedServices);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching accommodations:', error);
                setLoading(false);
            }
        };

        const fetchAttractions = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${url}/api/attractions/`, {
                    params: {
                        status: "active" // Thêm status vào query string
                    }
                });
                if (response.data.success) {
                    const sortedServices = response.data.attractions.slice(0, 10);
                    setPopularServices(sortedServices);
                    setLoading(false);
                }
                else {
                    console.error('Error fetching attractions:', response.data.message);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error fetching attractions:', error);
                setLoading(false);
            }
        };

        if (type === 'accommodation') {
            fetchAccommodations();
        } else if (type === 'food') {
            fetchFoodServices();
        } else if (type === 'attraction') {
            fetchAttractions();
        }
    }, [type, url]);

    // If loading, show skeleton component
    if (loading) {
        return <SlideBarSkeleton type={type} />;
    }

    const onClick = (serviceId) => {
        const encryptedServiceId = CryptoJS.AES.encrypt(serviceId, 'mySecretKey').toString();
        const safeEncryptedServiceId = encodeURIComponent(encryptedServiceId);
        navigate(`/place-details/${type}/${safeEncryptedServiceId}`);
        window.scrollTo(0, 0);
    };

    const renderCardContent = (service) => {
        //console.log(service);
        switch (type) {
            case 'accommodation': {
                return (
                    <>
                        <h3 className="card-title">{service.name}</h3>
                        <p className="card-facilities">
                            {service.amenities && service.amenities.length > 5 
                              ? service.amenities.slice(0, 5).join(' • ') + ' • ...'
                              : service.amenities?.join(' • ')}
                        </p>
                        <p className="card-price">{service.roomTypes[0]?.pricePerNight.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} / đêm</p>
                    </>
                );
            }
            case 'food': {
                const foodHours = service.operatingHours.slice(0, 2); // Limit to first 2 operating hours
                const foodAmenitiesLimit = foodHours.length > 1 ? 3 : 5; // Fewer amenities if showing 2 operating hours
                
                return (
                    <>
                        <h3 className="card-title">{service.foodServiceName}</h3>
                        {foodHours.map((hour, index) => (
                            <p className="card-duration" key={index}>
                                {hour.openTime} - {hour.closeTime} &nbsp; | &nbsp; {hour.startDay} - {hour.endDay}
                            </p>
                        ))}
                        {service.operatingHours.length > 2 && (
                            <p className="card-duration-more">+{service.operatingHours.length - 2} giờ khác</p>
                        )}
                        <p className="card-facilities">
                            {service.amenities && service.amenities.length > foodAmenitiesLimit 
                              ? service.amenities.slice(0, foodAmenitiesLimit).join(' • ') + ' • ...'
                              : service.amenities?.join(' • ')}
                        </p>
                        <p className="card-price">{service.price.minPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} - {service.price.maxPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}/ người</p>
                    </>
                );
            }
            case 'attraction': {
                const attractionHours = service.operatingHours.slice(0, 2); // Limit to first 2 operating hours
                const attractionAmenitiesLimit = attractionHours.length > 1 ? 3 : 5; // Fewer amenities if showing 2 operating hours
                
                return (
                    <>
                        <h3 className="card-title">{service.attractionName}</h3>
                        {attractionHours.map((hour, index) => (
                            <p className="card-duration" key={index}>
                                {hour.openTime} - {hour.closeTime} &nbsp; | &nbsp; {hour.startDay} - {hour.endDay}
                            </p>
                        ))}
                        {service.operatingHours.length > 2 && (
                            <p className="card-duration-more">+{service.operatingHours.length - 2} giờ khác</p>
                        )}
                        <p className="card-facilities">
                            {service.amenities && service.amenities.length > attractionAmenitiesLimit 
                              ? service.amenities.slice(0, attractionAmenitiesLimit).join(' • ') + ' • ...'
                              : service.amenities?.join(' • ')}
                        </p>
                        <p className="card-price">{service.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} / người</p>
                    </>
                );
            }
            default:
                return null;
        }
    };

    const getRatingInfo = (ratings) => {
        const totalReviews = ratings.length;
        const averageRating = totalReviews > 0
            ? (ratings.reduce((sum, r) => sum + (Number(r.rate) || 0), 0) / totalReviews).toFixed(1)
            : 'Chưa có đánh giá';
        return { totalReviews, averageRating };
    };
    const getTypeInVietnamese = (type) => {
        const typeMapping = {
            accommodation: "chỗ ở",
            food: "dịch vụ ăn uống",
            attraction: "điểm tham quan",
            transport: "phương tiện di chuyển",
            activity: "hoạt động giải trí"
        };
        return typeMapping[type] || "loại khác";
    };

    return (
        <div className="slidebar-container">
            <h3 className="title">Những {getTypeInVietnamese(type)} phổ biến</h3>
            {popularServices.length === 0 && <p>No {type} services found.</p>}
            <Swiper
                modules={[Navigation]}
                spaceBetween={10}
                slidesPerView={1}
                breakpoints={{
                    480: { slidesPerView: 2, spaceBetween: 10 },
                    768: { slidesPerView: 3, spaceBetween: 15 },
                    1024: { slidesPerView: 4, spaceBetween: 20 }
                }}
                navigation
                className="custom-swiper"
            >
                {popularServices.map((service) => {
                    const { totalReviews, averageRating } = getRatingInfo(service.ratings);
                    return (
                        <SwiperSlide key={service._id} className="custom-slide">
                            <div className="card" onClick={() => onClick(service._id)}>
                                <img src={`${url}/images/${service.images[0]}`} alt={service.foodServiceName || service.name || service.attraction_name} className="card-image" />
                                <div className="card-content">
                                    {renderCardContent(service)}
                                    <p className="card-reviews">
                                        ⭐ {averageRating} ({totalReviews} đánh giá)
                                    </p>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
};

export default SlideBar;
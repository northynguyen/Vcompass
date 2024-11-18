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

const SlideBar = ({ type }) => {
    const [popularServices, setPopularServices] = useState([]);
    const navigate = useNavigate();
    const { url } = useContext(StoreContext);

    useEffect(() => {
        const fetchFoodServices = async () => {
            try {
                const response = await axios.get(`${url}/api/foodservices/`);
                const sortedServices = response.data.foodService.slice(0, 10);
                setPopularServices(sortedServices);
            } catch (error) {
                console.error('Error fetching food services:', error);
            }
        };

        const fetchAccommodations = async () => {
            try {
                const response = await axios.get(`${url}/api/accommodations`);
                const sortedServices = response.data.accommodations.slice(0, 10);
                setPopularServices(sortedServices);
            } catch (error) {
                console.error('Error fetching accommodations:', error);
            }
        };

        const fetchAttractions = async () => {
            try {
                const response = await axios.get(`${url}/api/attractions/`);
                if (response.data.success) {
                    const sortedServices = response.data.attractions.slice(0, 10);
                    setPopularServices(sortedServices);
                }
                else {
                    console.error('Error fetching attractions:', response.data.message);
                }
            } catch (error) {
                console.error('Error fetching attractions:', error);
            }
        };

        if (type === 'accommodation') {
            fetchAccommodations();
        } else if (type === 'food') {
            fetchFoodServices();
        } else if (type === 'attraction') {
            fetchAttractions();
            console.log(popularServices);
        }
    }, [type, url]);


    const onClick = (serviceId) => {
        console.log(serviceId);
        const encryptedServiceId = CryptoJS.AES.encrypt(serviceId, 'mySecretKey').toString();
        console.log('Encrypted Service ID:', encryptedServiceId);
        const safeEncryptedServiceId = encodeURIComponent(encryptedServiceId);
        navigate(`/place-details/${type}/${safeEncryptedServiceId}`);
        window.scrollTo(0, 0);
    };

    const renderCardContent = (service) => {
        console.log(service);
        switch (type) {
            case 'accommodation':
                return (
                    <>

                        <h3 className="card-title">{service.name}</h3>
                        <p className="card-facilities">
                            {service.amenities?.join(' • ')}
                        </p>
                        <p className="card-price">{service.roomTypes[0].pricePerNight}đ / đêm</p>
                    </>
                );
            case 'food':
                return (
                    <>
                        <h3 className="card-title">{service.foodServiceName}</h3>
                        {service.operatingHours.map((hour, index) => (
                            <p className="card-duration" key={index}>
                                {hour.openTime} - {hour.closeTime} &nbsp; | &nbsp; {hour.startDay} - {hour.endDay}
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
                            <p className="card-duration" key={index}>
                                {hour.openTime} - {hour.closeTime} &nbsp; | &nbsp; {hour.startDay} - {hour.endDay}
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
            <h2 className="title">Những {getTypeInVietnamese(type)} phổ biến</h2>
            {popularServices.length === 0 && <p>No {type} services found.</p>}
            <Swiper
                modules={[Navigation]}
                spaceBetween={20}
                slidesPerView={4}
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

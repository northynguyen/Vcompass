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
                const sortedServices = response.data.attraction.slice(0, 10);
                setPopularServices(sortedServices);
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
        switch (type) {
            case 'accommodation':
                return (
                    <>
                    
                        <h3 className="card-title">{service.name}</h3>
                        <p className="card-facilities">
                            {service.amenities?.join(' • ')}
                        </p>
                        <p className="card-price">${service.price} per night</p>
                    </>
                );
            case 'food':
                return (
                    <>
                        <h3 className="card-title">{service.foodServiceName}</h3>
                        <p className="card-duration">
                            {service.operatingHours[0]?.startDay} - {service.operatingHours[0]?.endDay}
                        </p>
                        <p className="card-facilities">
                            {service.amenities?.join(' • ')}
                        </p>
                        <p className="card-price">${service.price.minPrice} - ${service.price.maxPrice} per person</p>
                    </>
                );
            case 'attraction':
                return (
                    <>
                        <h3 className="card-title">{service.attraction_name}</h3>
                        <p className="card-duration">{service.openTime} - {service.closeTime}</p>
                        <p className="card-facilities">
                            {service.amenities?.join(' • ')}
                        </p>
                        <p className="card-price">${service.price} entrance fee</p>
                    </>
                );
            default:
                return null;
        }
    };

    const getRatingInfo = (ratings) => {
        const totalReviews = ratings.length;
        const averageRating = totalReviews > 0
            ? (ratings.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
            : 'No reviews';
        return { totalReviews, averageRating };
    };

    return (
        <div className="slidebar-container">
            <h2 className="title">Popular {type} Services</h2>
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
                                <img src={`${url}/images/${service.images[0]}`}  alt={service.foodServiceName || service.name || service.attraction_name} className="card-image" />
                                <div className="card-content">
                                    {renderCardContent(service)}
                                    <p className="card-reviews">
                                        ⭐ {averageRating} ({totalReviews} reviews)
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

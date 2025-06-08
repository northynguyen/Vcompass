/* eslint-disable react/prop-types */
import axios from 'axios'; // for API calls
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { StoreContext } from '../../Context/StoreContext';
import ImagesModal from '../ImagesModal/ImagesModal';
import { StarRating } from '../PlaceReview/PlaceReview';
import './FoodDetailsInfo.css';
const FoodDetailsInfo = ({ serviceId, setShowLogin }) => {
    const { url, token, user , getImageUrl } = useContext(StoreContext);
    const [isSave, setIsSave] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [foodService, setFoodService] = useState(null); // To store food service details
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
    // Fetch the food service details based on serviceId
    useEffect(() => {
        const fetchFoodService = async () => {
            try {
                const response = await axios.get(`${url}/api/foodservices/`)
                setFoodService(response.data.foodService.find(service => service._id === serviceId));

            } catch (error) {
                console.error('Error fetching food service details:', error);
            }
        };

        fetchFoodService();

    }, [serviceId, url]);

    // Open Modal and set the clicked image
    const openModal = (index) => {
        setSelectedImageIndex(index);
        setIsImageModalOpen(true);
    };
    const openModalMenu = (index) => {
        setSelectedMenuIndex(index);
        setIsMenuModalOpen(true);
    };
    // Close the Modal
    const closeImageModal = () => {
        setIsImageModalOpen(false);
    };
    
    const closeMenuModal = () => {
        setIsMenuModalOpen(false);
    };
    const toggleWishlist = async () => {
        try {
            if (!user) {
                setShowLogin(true);
                return;
            }
            const newStatus = !isSave;
            setIsSave(newStatus);
            const action = newStatus ? "add" : "remove";
            const response = await fetch(
                `${url}/api/user/user/${user._id}/addtoWishlist?type=foodService&itemId=${serviceId}&action=${action}`,
                {
                    method: "POST",
                    headers: { token: token },
                }
            );

            const result = await response.json();
            if (!result.success) {
                toast.error(result.message);
            }
            toast.success(result.message);
            console.log(result.message);
        } catch (error) {
            console.error("Failed to update wishlist:", error.message);
            setIsSave((prevState) => !prevState);
        }
    };
    if (!foodService) return <div>Loading...</div>;
    const totalRating = foodService.ratings.length
        ? foodService.ratings.reduce((acc, review) => acc + review.rate, 0) / foodService.ratings.length
        : 0;
    return (
        <div className="food-details-info">
            {/* Left Column: Food Service Details */}
            <div className="food-details">
                <h1>{foodService.foodServiceName}</h1>
                <p className="place-header-rating"><StarRating rating={Math.round(totalRating)} />  {totalRating.toFixed(1)} / 5.0 ( {foodService.ratings.length} đánh giá)</p>

                {/* Image Gallery */}
                <div className='food-gallery-container'>
                    <div className="food-gallery">
                        <img src={getImageUrl(foodService, 0)} alt="Main" className="food-main-img" />
                        <div className="food-thumbnails">
                            {foodService.images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image.includes('http') ? image : `${url}/images/${image}`}
                                    alt={`Thumb ${index + 1}`}
                                    onClick={() => openModal(index )}
                                />
                            ))}
                        </div>
                    </div>

                </div>
                {/* Features */}
                <div className="food-features">
                    {foodService.amenities.map((amenity, index) => (
                        <p key={index}>✔️ {amenity}</p>
                    ))}
                </div>

                {/* Description */}
                <div className="food-description">
                    <h3>Mô tả</h3>
                    <p>{foodService.description}</p>
                </div>
                <div className="food-description">
                    <h3>Thực đơn</h3>
                    <div className="food-gallery" onClick={() => openModalMenu(0)}>
                        <div className="food-thumbnails">
                            {foodService.menuImages.map((image, index) => (
                                <img
                                    key={index}
                                    src={image.includes('http') ? image : `${url}/images/${image}`}
                                    alt={`Thumb ${index + 1}`}
                                    onClick={() => openModalMenu(index + 1)}
                                />
                            ))}
                        </div>

                    </div>
                </div>


                {/* Location (Google Map) */}
                <div className="food-map">
                    <h3 style={{ marginBottom: '20px' }}>Vị trí</h3>
                    <iframe
                        title="map"
                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao&q=${foodService.location.latitude},${foodService.location.longitude}`}
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                    ></iframe>
                </div>
            </div>
            {/* Right Column: Booking Form */}
            <div className="booking-form">
                <div className="addition-infor-header">
                    <h3>Thông tin thêm</h3>
                </div>
                <div className="infor-form-wrapper">
                    <div className="wrapper">
                        <div className="addition-infor-item">
                            <p htmlFor="from">Giờ mở cửa:</p>
                            <p className='addition-infor-content' htmlFor="from">{foodService.operatingHours[0].openTime}</p>
                        </div>
                        <div className="addition-infor-item">
                            <p htmlFor="from">Giờ đóng cửa:</p>
                            <p className='addition-infor-content' htmlFor="from">{foodService.operatingHours[0].closeTime}</p>
                        </div>
                        <div className="addition-infor-item">
                            <p htmlFor="from">Giá:</p>
                            <p className='addition-infor-content' htmlFor="from">
                                {foodService.price.minPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })} - {foodService.price.maxPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                            </p>
                        </div>
                    </div>
                    <div className="wrapper">
                        <div className={`favorite-button   ${isSave ? "saved" : ""} `} onClick={toggleWishlist}>
                            <i className="fa-solid fa-bookmark schedule-icon"></i>
                            <button className="favourite-btn">
                                {!isSave ? "Lưu địa điểm" : "Đã lưu địa điểm"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            {/* Modal for displaying service images */}
            <ImagesModal
                isOpen={isImageModalOpen}
                images={foodService.images}
                selectedIndex={selectedImageIndex}
                onClose={closeImageModal}
            />
            {/* Modal for displaying menu images */}
            <ImagesModal
                isOpen={isMenuModalOpen}
                images={foodService.menuImages}
                selectedIndex={selectedMenuIndex}
                onClose={closeMenuModal}
            />
        </div>
    );
};

export default FoodDetailsInfo;

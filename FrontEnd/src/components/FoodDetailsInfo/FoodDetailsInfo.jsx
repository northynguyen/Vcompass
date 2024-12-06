/* eslint-disable react/prop-types */
import axios from 'axios'; // for API calls
import { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import ImagesModal from '../ImagesModal/ImagesModal';
import './FoodDetailsInfo.css';
const FoodDetailsInfo = ({ serviceId }) => {
    const { url } = useContext(StoreContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
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
        setIsModalOpen(true);
    };
    const openModalMenu = (index) => {
        setSelectedMenuIndex(index);
        setIsModalOpen(true);
    };
    // Close the Modal
    const closeModal = () => {
        setIsModalOpen(false);

    };

    if (!foodService) return <div>Loading...</div>;

    return (
        <div className="food-details-info">
            {/* Left Column: Food Service Details */}
            <div className="food-details">
                <h1>{foodService.foodServiceName}</h1>
                <p>{foodService.city} ★★★★☆ (348 reviews)</p>

                {/* Image Gallery */}
                <div className='food-gallery-container'>
                    <div className="food-gallery">
                        <img src={`${url}/images/${foodService.images[0]}`} alt="Main" className="food-main-img" />
                        <div className="food-thumbnails">
                            {foodService.images.map((image, index) => (
                                <img
                                    key={index}
                                    src={`${url}/images/${image}`}
                                    alt={`Thumb ${index + 1}`}
                                    onClick={() => openModal(index + 1)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="food-gallery" onClick={() => openModalMenu(0)}>
                        <img src={`${url}/images/${foodService.menuImages[0]}`} alt="Main" className="food-main-img" />
                        <div className="food-thumbnails">
                            {foodService.menuImages.map((image, index) => (
                                <img
                                    key={index}
                                    src={`${url}/images/${image}`}
                                    alt={`Thumb ${index + 1}`}
                                    onClick={() => openModalMenu(index + 1)}
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
                    <h3>Description</h3>
                    <p>{foodService.description}</p>
                </div>

                {/* Location (Google Map) */}
                <div className="food-map">
                    <h3 style={{ marginBottom: '20px' }}>Location</h3>
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



            {/* Modal for displaying clicked images */}
            <ImagesModal
                isOpen={isModalOpen}
                images={foodService.images}
                selectedIndex={selectedImageIndex}
                onClose={closeModal}
            />
            {/* Modal for displaying clicked images */}
            <ImagesModal
                isOpen={isModalOpen}
                images={foodService.menuImages}
                selectedIndex={selectedMenuIndex}
                onClose={closeModal}
            />
        </div>
    );
};

export default FoodDetailsInfo;

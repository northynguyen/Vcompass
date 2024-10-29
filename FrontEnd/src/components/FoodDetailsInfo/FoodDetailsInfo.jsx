/* eslint-disable react/prop-types */
import { useState, useEffect , useContext} from 'react';
import axios from 'axios'; // for API calls
import './FoodDetailsInfo.css';
import { StoreContext } from '../../Context/StoreContext';
import ImagesModal from '../ImagesModal/ImagesModal';
const FoodDetailsInfo = ({ serviceId }) => {
    const {url} = useContext(StoreContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [foodService, setFoodService] = useState(null); // To store food service details
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Fetch the food service details based on serviceId
    useEffect(() => {
        const fetchFoodService = async () => {
            try {
                const response = await   axios.get(`${url}/api/foodservices/`)
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
    
      // Close the Modal
      const closeModal = () => {
        setIsModalOpen(false);
       
      };

    if (!foodService) return <div>Loading...</div>;

    return (
        <div className="place-details-info">
            {/* Left Column: Food Service Details */}
            <div className="tour-details">
                <h1>{foodService.foodServiceName}</h1>
                <p>{foodService.city} ★★★★☆ (348 reviews)</p>

                {/* Image Gallery */}
                <div className="gallery">
                    <img src={`${url}/images/${foodService.images[0]}`}  alt="Main" className="main-img" />
                    <div className="thumbnails">
                        {foodService.images.map((image, index) => (
                            <img 
                                key={index} 
                                src={`${url}/images/${image}`}
                                alt={`Thumb ${index + 1}`} 
                                onClick={() => openModal(index+1)} 
                            />
                        ))}
                    </div>
                </div>

                {/* Features */}
                <div className="features">
                    {foodService.amenities.map((amenity, index) => (
                        <p key={index}>✔️ {amenity}</p>
                    ))}
                </div>

                {/* Description */}
                <div className="description">
                    <h3>Description</h3>
                    <p>{foodService.description}</p>
                </div>

                {/* Location (Google Map) */}
                <div className="map">
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

            {/* Right Column: Booking Form */}
            <div className="booking-form">
                <form>
                    <h2>Booking</h2>

                    <label htmlFor="from">From</label>
                    <input type="date" id="from" />

                    <label htmlFor="to">To</label>
                    <input type="date" id="to" />

                    <label htmlFor="guests">No. of Guests</label>
                    <select id="guests">
                        <option value="1">1 adult</option>
                        <option value="2">2 adults</option>
                    </select>

                    <div className="total-price">
                        <h3>Price Range: ${foodService.price.minPrice} - ${foodService.price.maxPrice}</h3>
                    </div>

                    <button type="submit" className="book-btn">Confirm Booking</button>
                    <button type="button" className="wishlist-btn" onClick={() => alert('Saved to wishlist')}>
                        Save to Wishlist
                    </button>
                    <button type="button" className="share-btn" onClick={() => alert('Shared the activity')}>
                        Share the Activity
                    </button>
                </form>
            </div>

            {/* Modal for displaying clicked images */}
            <ImagesModal
            isOpen={isModalOpen}
            images={foodService.images}
            selectedIndex={selectedImageIndex}
            onClose={closeModal}
      />
        </div>
    );
};

export default FoodDetailsInfo;

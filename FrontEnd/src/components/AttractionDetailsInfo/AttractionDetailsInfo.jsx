/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
import './AttractionDetailsInfo.css'
import { useState, useContext, useEffect } from 'react'
import ImagesModal from '../ImagesModal/ImagesModal';
import {StoreContext} from '../../Context/StoreContext'
import {toast as Toast} from 'react-toastify'
import axios from 'axios'


const AttractionDetailsInfo = ({serviceId}) => {
    const { url } = useContext(StoreContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState('');
    const [attraction, setAttraction] = useState(null);

    const openModal = (index) => {
        setSelectedImageIndex(index)
        setIsModalOpen(true);
    };

    // Close the Modal
    const closeModal = () => {
        setIsModalOpen(false);
       
    };

    useEffect(() => {
        const fetchAttraction = async () => {
            try {
                const response = await axios.get(`${url}/api/attractions/`);
                console.log("API Response:", response.data); // Log the entire response for debugging
                if (response.data.success) {
                    setAttraction(response.data.attractions.find((attraction) => attraction._id === serviceId));
                    Toast.success(response.data.message);
                } else {
                    console.error('Attraction not found for serviceId:', serviceId);
                    Toast.error(response.data.message);
                }
            } catch (error) {
                console.error('Error fetching attraction:', error);
            }
        };
        fetchAttraction();
    }, [serviceId, url]);

        
    if (!attraction) {
        return <p>Loading...</p>;
    }

    return (
        <div className="place-details-info">
            <div className="tour-details">
                <h1>Điểm đến A</h1>
                <p>Gothenburg ★★★★☆ (348 reviews)</p>

                <div className="gallery">
                    <img src={`${url}/images/${attraction.images[0]}`}  alt="Main" className="main-img" />
                    <div className="thumbnails">
                        {attraction.images.map((image, index) => (
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
                    {attraction.amenities.map((amenity, index) => (
                        <p key={index}>✔️ {amenity}</p>
                    ))}
                </div>

                {/* Description */}
                <div className="description">
                    <h3>Description</h3>
                    <p>{attraction.description}</p>
                </div>

                {/* Embed Google Map */}
                <div className="map">
                    <h3 style={{ marginBottom: '20px' }}>Location</h3>
                    <p>{attraction.location.address}</p>
                    <iframe
                        title="map"
                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao&q=${attraction.location.latitude},${attraction.location.longitude}`}
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
                <form >
                    <h2>Booking</h2>

                    <label htmlFor="from">From</label>
                    <input
                        type="date"
                        id="from"
                        onChange={(e) => setFromDate(e.target.value)}
                    />

                    <label htmlFor="to">To</label>
                    <input
                        type="date"
                        id="to"
                        onChange={(e) => setToDate(e.target.value)}
                    />

                    <label htmlFor="guests">No. of Guests</label>
                    <select
                        id="guests"
                        // eslint-disable-next-line no-undef
                        onChange={(e) => setGuests(e.target.value)}
                    >
                        <option value="1">1 adult</option>
                        <option value="2">2 adults</option>
                    </select>

                    <div className="total-price">
                        <h3>Subtotal: $78.90</h3>
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
                images={attraction.images}
                selectedIndex={selectedImageIndex}
                onClose={closeModal}
            />

        </div>
    )
}

export default AttractionDetailsInfo
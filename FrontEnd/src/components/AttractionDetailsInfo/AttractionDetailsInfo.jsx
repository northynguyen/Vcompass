/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { toast as Toast, toast } from 'react-toastify';
import { StoreContext } from '../../Context/StoreContext';
import ImagesModal from '../ImagesModal/ImagesModal';
import './AttractionDetailsInfo.css';

const AttractionDetailsInfo = ({ serviceId }) => {
    const { url, token, user } = useContext(StoreContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState('');
    const [attraction, setAttraction] = useState(null);
    const [isSave, setIsSave] = useState(false);
    console.log(user)

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
    const toggleWishlist = async () => {
        try {
            const newStatus = !isSave;
            setIsSave(newStatus);
            const action = newStatus ? "add" : "remove";
            const response = await fetch(
                `${url}/api/user/user/${user._id}/addtoWishlist?type=attraction&itemId=${serviceId}&action=${action}`,
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


    if (!attraction) {
        return <p>Loading...</p>;
    }

    return (
        <div className="place-details-info">
            <div className="tour-details">
                <div className="place-header">
                    <h1>{attraction.attractionName}</h1>
                    <p> ★★★★☆  ( {attraction.ratings.length} reviews)</p>
                </div>
                <div className="gallery">
                    <img src={`${url}/images/${attraction.images[0]}`} alt="Main" className="main-img" />
                    <div className="thumbnails">
                        {attraction.images.map((image, index) => (
                            <img
                                key={index}
                                src={`${url}/images/${image}`}
                                alt={`Thumb ${index + 1}`}
                                onClick={() => openModal(index + 1)}
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
                <h3>Thông tin thêm</h3>
                <div className="infor-form-wrapper">
                    <div className="wrapper">
                        <div className="addition-infor-item">
                            <p htmlFor="from">Giờ mở cửa:</p>
                            <p className='addition-infor-content' htmlFor="from">{attraction.operatingHours[0].openTime}</p>
                        </div>
                        <div className="addition-infor-item">
                            <p htmlFor="from">Giờ đóng cửa:</p>
                            <p className='addition-infor-content' htmlFor="from">{attraction.operatingHours[0].closeTime}</p>
                        </div>
                        <div className="addition-infor-item">
                            <p htmlFor="from">Giá vé:</p>
                            <p className='addition-infor-content' htmlFor="from">{attraction.price == 0 ? "Miễn phí" : attraction.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</p>
                        </div>
                    </div>
                    <div className="wrapper">
                        <div className={`title-button ${isSave ? "saved" : ""} `} onClick={toggleWishlist}>
                            <i className="fa-solid fa-bookmark schedule-icon"></i>
                            <button className="save-and-share-btn">
                                Lưu vào danh sách yêu thích
                            </button>
                        </div>
                    </div>
                </div>
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
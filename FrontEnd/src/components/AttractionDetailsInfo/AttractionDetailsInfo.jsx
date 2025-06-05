/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { StoreContext } from '../../Context/StoreContext';
import { FaRegClock, FaTicketAlt   } from "react-icons/fa";
import ImagesModal from '../ImagesModal/ImagesModal';
import { StarRating } from '../PlaceReview/PlaceReview';
import './AttractionDetailsInfo.css';

const AttractionDetailsInfo = ({ serviceId, setShowLogin }) => {
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
                const response = await axios.get(`${url}/api/attractions/${serviceId}`);
                if (response.data.success) {
                    setAttraction(response.data.attraction);
                    toast.success(response.data.message);
                } else {
                    console.error('Attraction not found for serviceId:', serviceId);
                    toast.error(response.data.message);
                }
            } catch (error) {
                console.error('Error fetching attraction:', error);
            }
        };
        fetchAttraction();
    }, [serviceId, url]);
    const toggleWishlist = async () => {
        if (!user) {
            setShowLogin(true);
            return;
        }
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
    const totalRating = attraction.ratings.length
    ? attraction.ratings.reduce((acc, review) => acc + review.rate, 0) / attraction.ratings.length
    : 0;
    return (
        <div className="place-details-info">
            <div className="tour-details">
                <div className="place-header">
                    <h1>{attraction.attractionName}</h1>
                    <p className="place-header-rating"><StarRating rating={Math.round(totalRating)}  />  {totalRating.toFixed(1)} / 5.0 ( {attraction.ratings.length} đánh giá)</p>
                </div>
                <div className="gallery">
                    <img src={ attraction.images[0].includes("http") ? attraction.images[0] : `${url}/images/${attraction.images[0]}`} alt="Main" className="main-img" />
                    <div className="thumbnails">
                        {attraction.images.map((image, index) => (
                            <img
                                key={index}
                                src={ image.includes("http") ? image : `${url}/images/${image}`}
                                alt={`Thumb ${index + 1}`}
                                onClick={() => openModal(index )}
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
                    <h3>Mô tả</h3>
                    <p>{attraction.description}</p>
                </div>

                {/* Embed Google Map */}
                <div className="map">
                    <h3 style={{ marginBottom: '20px' }}>Vị trí</h3>
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
                <div className="addition-infor-header">
                <h3>Thông tin thêm</h3>
                </div>
                <div className="infor-form-wrapper">
                    <div className="wrapper">
                        <div className="addition-infor-item">
                            <p htmlFor="from" className='addition-infor-title'><FaRegClock/>Mở cửa:</p>
                            <p className='addition-infor-content' htmlFor="from">{attraction.operatingHours[0].openTime}</p>
                        </div>
                        <div className="addition-infor-item">
                            <p htmlFor="from" className='addition-infor-title'><FaRegClock/> Đóng cửa:</p>
                            <p className='addition-infor-content' htmlFor="from">{attraction.operatingHours[0].closeTime}</p>
                        </div>
                        <div className="addition-infor-item">
                            <p htmlFor="from" className='addition-infor-title'><FaTicketAlt /> Giá vé:</p>
                            <p className='addition-infor-content' htmlFor="from">{attraction.price == 0 ? "Miễn phí" : attraction.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</p>
                        </div>
                    </div>
                    <div className="wrapper">
                        <div className={`favorite-button ${isSave ? "saved" : ""} `} onClick={toggleWishlist}>
                            <i className="fa-solid fa-bookmark schedule-icon"></i>
                            <p className="favourite-btn">
                                {!isSave ? "Lưu địa điểm": "Đã lưu địa điểm"}
                            </p>
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
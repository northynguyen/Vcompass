/* eslint-disable react/prop-types */
import { useState, useRef, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

import './RestaurantDetail.css'; // Import CSS mới
import { FaArrowLeft, FaPhone, FaEnvelope, FaWifi, FaUtensils, FaCar } from 'react-icons/fa'; // Import icons từ react-icons
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { StoreContext } from '../../../Context/StoreContext';
import { toast } from 'react-toastify';

import OperatingHoursEditor from './OperatingHoursEditor';
import ImageGallery from './ImageGallery';
import LocationMap from './LocationMap';
import AmenitiesEditor from './AmenitiesEditor';

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const redIcon = new L.Icon({
    iconUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-location-icon-download-in-svg-png-gif-file-formats--marker-pointer-map-pin-navigation-finance-and-economy-pack-business-icons-2561454.png?f=webp&w=256',
    iconSize: [41, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const RestaurantDetail = ({ onBack, RestaurantData }) => {
    const { url, token  } = useContext(StoreContext);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [formData, setFormData] = useState(
        RestaurantData ? RestaurantData : {
            foodServiceName: "",
            description: "",
            contactNumber: "",
            email: "",
            city: "", // Initialize city
            price: { // Initialize price
                minPrice: 0,
                maxPrice: 0,
            },
            location: {
                address: "",
                latitude: 0,
                longitude: 0,
            },
            amenities: [],
            operatingHours: [
                {
                    startDay: "Mon",
                    endDay: "Sun",
                    openTime: "10:00",
                    closeTime: "22:00",
                },
            ],
            images: [],
            menuImages: [],
        }
    );

    const mapRef = useRef();
    const availableAmenities = ["Free Wi-Fi", "Outdoor seating", "Live music", "Parking", "Wheelchair access", "Pets allowed"];

    useEffect(() => {
        if (RestaurantData) {
            setFormData({
                foodServiceName: RestaurantData.foodServiceName || "",
                description: RestaurantData.description || "",
                contactNumber: RestaurantData.contactNumber || "",
                email: RestaurantData.email || "",
                city: RestaurantData.city || "", // Set city
                price: RestaurantData.price || { // Set price
                    minPrice: RestaurantData.price?.minPrice || 0,
                    maxPrice: RestaurantData.price?.maxPrice || 0,
                },
                location: {
                    address: RestaurantData.location.address || "",
                    latitude: RestaurantData.location.latitude || 0,
                    longitude: RestaurantData.location.longitude || 0,
                },
                amenities: RestaurantData.amenities || [],
                operatingHours: RestaurantData.operatingHours || [
                    {
                        startDay: "Mon",
                        endDay: "Sun",
                        openTime: "10:00",
                        closeTime: "22:00",
                    },
                ],
                images: RestaurantData.images || [],
                menuImages: RestaurantData.menuImages || [],
            });     
        } else {
            setIsEditing(true);
            setFormData({
                foodServiceName: "",
                description: "",
                contactNumber: "",
                email: "",
                city: "", // Initialize city
                price: { // Initialize price
                    minPrice: 0,
                    maxPrice: 0,
                },
                location: {
                    address: "",
                    latitude: 0,
                    longitude: 0,
                },
                amenities: [],
                operatingHours: [
                    {
                        startDay: "Mon",
                        endDay: "Sun",
                        openTime: "10:00",
                        closeTime: "22:00",
                    },
                ],
                images: [],
                menuImages: [],
            });
        }
    }, [RestaurantData]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isEditing) {
                setIsEditing(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSave = async () => {
        // Optional: Add validation here (e.g., minPrice <= maxPrice)
        if (formData.price.minPrice > formData.price.maxPrice) {
            alert('Giá thấp nhất không được vượt quá giá cao nhất.');
            return;
        }
    
        try {
            let response;
            if (RestaurantData) {
                // Updating an existing restaurant
                response = await axios.post(`${url}/api/foodServices/update`, 
                    { foodServiceData: formData },
                    { headers: { token } }
                );
            } else {
                // Adding a new restaurant
                response = await axios.post(`${url}/api/foodServices/add`, 
                    { foodServiceData: { ...formData, status: "active" } },
                    { headers: { token } }
                );
            }
    
            // Handle the response based on success
            if (response.data.success) {
                toast.success(response.data.message);
                setIsEditing(false); // Stop editing mode if saving is successful
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            // Handle any errors that occur during the save process
            console.error('Error saving data:', error);
            toast.error('Đã xảy ra lỗi khi lưu dữ liệu. Vui lòng thử lại.');
        }
    };
    
    
    // Image Upload Handler
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => URL.createObjectURL(file));
        setFormData(prevData => ({
            ...prevData,
            images: [...prevData.images, ...newImages],
        }));
    };

    // Image Deletion Handler
    const deleteImage = (index) => {
        setFormData(prevData => {
            const updatedImages = [...prevData.images];
            updatedImages.splice(index, 1);
            return { ...prevData, images: updatedImages };
        });
    };

    // Menu Image Upload Handler
    const handleMenuImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const menuImages = files.map(file => URL.createObjectURL(file));
        setFormData(prevData => ({
            ...prevData,
            menuImages: [...prevData.menuImages, ...menuImages],
        }));
    };

    // Menu Image Deletion Handler
    const deleteMenuImage = (index) => {
        setFormData(prevData => {
            const updatedMenuImages = [...prevData.menuImages];
            updatedMenuImages.splice(index, 1);
            return { ...prevData, menuImages: updatedMenuImages };
        });
    };

    const handleOperatingHourChange = (index, field, value) => {
        setFormData(prevData => {
            const updatedOperatingHours = [...prevData.operatingHours];
            updatedOperatingHours[index][field] = value;
            return { ...prevData, operatingHours: updatedOperatingHours };
        });
    };

    const addOperatingHour = () => {
        setFormData(prevData => ({
            ...prevData,
            operatingHours: [
                ...prevData.operatingHours,
                { startDay: "Mon", endDay: "Mon", openTime: "10:00", closeTime: "22:00" }
            ]
        }));
    };

    const removeOperatingHour = (index) => {
        setFormData(prevData => {
            const updatedOperatingHours = [...prevData.operatingHours];
            updatedOperatingHours.splice(index, 1);
            return { ...prevData, operatingHours: updatedOperatingHours };
        });
    };

    const handleAmenitiesChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prevData => {
            let updatedAmenities = [...prevData.amenities];
            if (checked) {
                updatedAmenities.push(value);
            } else {
                updatedAmenities = updatedAmenities.filter(amenity => amenity !== value);
            }
            return { ...prevData, amenities: updatedAmenities };
        });
    };

    // Function to format time
    const formatTime = (time) => {
        const [hour, minute] = time.split(':');
        const hourNum = parseInt(hour, 10);
        const ampm = hourNum >= 12 ? 'PM' : 'AM';
        const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
        return `${formattedHour}:${minute} ${ampm}`;
    };

    return (
        <div className="restaurant">
            <button type="button" className="back-button" onClick={onBack}>
                <FaArrowLeft /> Back to Restaurants
            </button>
            {isEditing ? (
                <>
                    <h1>
                        <label htmlFor="foodServiceName">Tên:</label>
                        <input
                            id="foodServiceName"
                            type="text"
                            name="foodServiceName"
                            value={formData.foodServiceName}
                            onChange={handleChange}
                            className="edit-input"
                        />
                    </h1>
                    <label htmlFor="description">Mô tả:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Mô tả"
                        className="edit-textarea"
                    />

                    <h2>Thành phố</h2>
                    <p>
                        <label htmlFor="city">Thành phố:</label>
                        <input
                            id="city"
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="edit-input"
                        />
                    </p>

                    <h2>Giá</h2>
                    <p>
                        <label htmlFor="minPrice">Giá thấp nhất (VNĐ):</label>
                        <input
                            id="minPrice"
                            type="number"
                            name="minPrice"
                            value={formData.price.minPrice}
                            onChange={(e) => setFormData(prevData => ({
                                ...prevData,
                                price: { ...prevData.price, minPrice: parseInt(e.target.value) || 0 }
                            }))}
                            className="edit-input-small"
                            min="0"
                        />
                    </p>
                    <p>
                        <label htmlFor="maxPrice">Giá cao nhất (VNĐ):</label>
                        <input
                            id="maxPrice"
                            type="number"
                            name="maxPrice"
                            value={formData.price.maxPrice}
                            onChange={(e) => setFormData(prevData => ({
                                ...prevData,
                                price: { ...prevData.price, maxPrice: parseInt(e.target.value) || 0 }
                            }))}
                            className="edit-input-small"
                            min="0"
                        />
                    </p>

                    <LocationMap
                        formData={formData}
                        setFormData={setFormData}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        searchResults={searchResults}
                        setSearchResults={setSearchResults}
                        mapRef={mapRef}
                    />

                    <ImageGallery
                        images={formData.images}
                        onImageUpload={handleImageUpload}
                        onDeleteImage={deleteImage}
                        title="Hình ảnh"
                    />

                    <ImageGallery
                        images={formData.menuImages}
                        onImageUpload={handleMenuImageUpload}
                        onDeleteImage={deleteMenuImage}
                        title="Hình ảnh Menu"
                    />

                    <AmenitiesEditor
                        availableAmenities={availableAmenities}
                        selectedAmenities={formData.amenities}
                        onAmenitiesChange={handleAmenitiesChange}
                    />

                    <h2>Thông tin Liên hệ</h2>
                    <p><FaPhone /> Điện thoại: 
                        <input
                            type="text"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleChange}
                            className="edit-input"
                        />
                    </p>
                    <p><FaEnvelope /> Email: 
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="edit-input"
                        />
                    </p>

                    <OperatingHoursEditor
                        operatingHours={formData.operatingHours}
                        onOperatingHourChange={handleOperatingHourChange}
                        onAddOperatingHour={addOperatingHour}
                        onRemoveOperatingHour={removeOperatingHour}
                    />

                    <div className="buttons">
                        <button type="button" onClick={handleSave} className="save-button">Lưu</button>
                        <button type="button" onClick={() => setIsEditing(false)} className="cancel-button">Hủy</button>
                    </div>
                </>
            ) : (
                <>
                    <h1>{formData.foodServiceName}</h1>
                    <p>{formData.description}</p>

                    <h2>Thành phố</h2>
                    <p>{formData.city}</p>

                    <h2>Giá</h2>
                    <p>
                        Giá thấp nhất: {formData.price.minPrice.toLocaleString('vi-VN')} VNĐ<br />
                        Giá cao nhất: {formData.price.maxPrice.toLocaleString('vi-VN')} VNĐ
                    </p>

                    <h2>Vị trí</h2>
                    <p>Địa chỉ: {formData.location.address}</p>
                    <p>Tọa độ: {formData.location.latitude}, {formData.location.longitude}</p>

                    <iframe
                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao&q=${formData.location.latitude},${formData.location.longitude}&zoom=14&maptype=roadmap`}
                        width="100%"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Google Maps"
                    ></iframe>

                    <ImageGallery
                        images={formData.images}
                        title="Hình ảnh"
                    />

                    <ImageGallery
                        images={formData.menuImages}
                        title="Hình ảnh Menu"
                    />

                    <h2>Tiện nghi</h2>
                    <ul className="amenities">
                        {formData.amenities.map((amenity, index) => (
                            <li key={index}>
                                {amenity === "Free Wi-Fi" && <FaWifi />}
                                {amenity === "Outdoor seating" && <FaUtensils />}
                                {amenity === "Parking" && <FaCar />}
                                {amenity}
                            </li>
                        ))}
                    </ul>

                    <h2>Thông tin Liên hệ</h2>
                    <p><FaPhone /> Điện thoại: {formData.contactNumber}</p>
                    <p><FaEnvelope /> Email: {formData.email}</p>

                    <h2>Giờ Mở Cửa</h2>
                    <ul className="operating-hours-list">
                        {formData.operatingHours.map((oh, index) => (
                            <li key={index}>
                                {oh.startDay} đến {oh.endDay}: {formatTime(oh.openTime)} - {formatTime(oh.closeTime)}
                            </li>
                        ))}
                    </ul>

                    <div className="buttons">
                        <button type="button" onClick={() => setIsEditing(true)} className="edit-button">Chỉnh sửa</button>
                    </div>
                </>
            )}
        </div>
    );
};

RestaurantDetail.propTypes = {
    onBack: PropTypes.func.isRequired,
    RestaurantData: PropTypes.shape({
        idFoodService: PropTypes.string,
        foodServiceName: PropTypes.string,
        description: PropTypes.string,
        contactNumber: PropTypes.string,
        email: PropTypes.string,
        city: PropTypes.string, // Added city
        price: PropTypes.shape({ // Added price
            minPrice: PropTypes.number,
            maxPrice: PropTypes.number,
        }),
        location: PropTypes.shape({
            address: PropTypes.string,
            latitude: PropTypes.number,
            longitude: PropTypes.number,
        }),
        amenities: PropTypes.arrayOf(PropTypes.string),
        operatingHours: PropTypes.arrayOf(PropTypes.shape({
            startDay: PropTypes.string,
            endDay: PropTypes.string,
            openTime: PropTypes.string,
            closeTime: PropTypes.string,
        })),
        images: PropTypes.arrayOf(PropTypes.string),
        menuImages: PropTypes.arrayOf(PropTypes.string),
    }),
    onSave: PropTypes.func,
};

export default RestaurantDetail;
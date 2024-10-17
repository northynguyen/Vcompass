/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import './RestaurantDetail.css'; // Import CSS mới
import { FaArrowLeft, FaPhone, FaEnvelope, FaWifi, FaUtensils, FaCar } from 'react-icons/fa'; // Import icons từ react-icons
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const redIcon = new L.Icon({
    iconUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-location-icon-download-in-svg-png-gif-file-formats--marker-pointer-map-pin-navigation-finance-and-economy-pack-business-icons-2561454.png?f=webp&w=256',
    iconSize: [41, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const RestaurantDetail = ({ onBack, RestaurantData, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [formData, setFormData] = useState(
        RestaurantData ? {
            foodServiceName: RestaurantData.foodServiceName || "",
            description: RestaurantData.description || "",
            contactNumber: RestaurantData.contactNumber || "",
            email: RestaurantData.email || "",
            city: RestaurantData.city || "", // Added city
            price: RestaurantData.price || { // Added price
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
        } : {
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

    const handleSave = () => {
        // Optional: Add validation here (e.g., minPrice <= maxPrice)
        if (formData.price.minPrice > formData.price.maxPrice) {
            alert('Giá thấp nhất không được vượt quá giá cao nhất.');
            return;
        }

        if (onSave) {
            onSave(formData);
        }
        setIsEditing(false);
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

    const getAddressFromCoords = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (!response.ok) {
                throw new Error('Failed to fetch address');
            }
            const data = await response.json();
            return data.display_name;
        } catch (error) {
            console.error(error);
            alert('Error fetching address. Please try again.');
            return '';
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const address = await getAddressFromCoords(latitude, longitude);
                setFormData(prevData => ({
                    ...prevData,
                    location: {
                        ...prevData.location,
                        latitude,
                        longitude,
                        address
                    }
                }));
                // Move the map to the new location and zoom
                if (mapRef.current) {
                    mapRef.current.flyTo([latitude, longitude], 20);
                }
            }, (error) => {
                console.error(error);
                alert('Unable to retrieve your location.');
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    // Handle location search
    const handleLocationSearch = async (e) => {
        e.preventDefault();
        if (searchQuery) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json`);
                if (!response.ok) {
                    throw new Error('Failed to fetch search results');
                }
                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.error(error);
                alert('Error searching for location. Please try again.');
            }
        }
    };

    const handleLocationSelect = (lat, lon, address) => {
        setFormData(prevData => ({
            ...prevData,
            location: {
                latitude: parseFloat(lat),
                longitude: parseFloat(lon),
                address,
            }
        }));
        setSearchResults([]);
        setSearchQuery(address);
        if (mapRef.current) {
            mapRef.current.flyTo([lat, lon], 20);
        }
    };

    const LocationMarker = () => {
        useMapEvents({
            click: async (e) => {
                const { lat, lng } = e.latlng;
                const address = await getAddressFromCoords(lat, lng); // Get address from coordinates

                setFormData(prevData => ({
                    ...prevData,
                    location: {
                        latitude: lat,
                        longitude: lng,
                        address
                    }
                }));

                // Move the map to the selected location and zoom
                const map = e.target;
                map.flyTo([lat, lng], 15);
            },
        });

        return (
            <Marker position={[formData.location.latitude, formData.location.longitude]} icon={redIcon} />
        );
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

                    {/* New City Field */}
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

                    {/* New Price Fields */}
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

                    <h2>Vị trí</h2>
                    <p>Địa chỉ:
                        <input
                            id="address"
                            type="text"
                            name="address"
                            value={formData.location.address}
                            onChange={(e) => setFormData(prevData => ({
                                ...prevData,
                                location: { ...prevData.location, address: e.target.value }
                            }))}
                            className="edit-input"
                        />
                    </p>
                    <p>Tọa độ:
                        <input
                            type="number"
                            name="latitude"
                            value={formData.location.latitude}
                            onChange={(e) => setFormData(prevData => ({
                                ...prevData,
                                location: { ...prevData.location, latitude: parseFloat(e.target.value) || 0 }
                            }))}
                            className="edit-input-small"
                            step="0.000001"
                        /> ,
                        <input
                            type="number"
                            name="longitude"
                            value={formData.location.longitude}
                            onChange={(e) => setFormData(prevData => ({
                                ...prevData,
                                location: { ...prevData.location, longitude: parseFloat(e.target.value) || 0 }
                            }))}
                            className="edit-input-small"
                            step="0.000001"
                        />
                    </p>

                    {/* Search for a location */}
                    <form onSubmit={handleLocationSearch} className="location-search-form">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm địa điểm"
                            className="location-search-input"
                        />
                        <button type="submit">Tìm</button>
                    </form>

                    {searchResults.length > 0 && (
                        <ul className="location-search-results">
                            {searchResults.map((result, index) => (
                                <li key={index} onClick={() => handleLocationSelect(result.lat, result.lon, result.display_name)}>
                                    {result.display_name}
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Get current location */}
                    <button type="button" onClick={getCurrentLocation} className="current-location-button">
                        Sử dụng vị trí hiện tại
                    </button>

                    <MapContainer
                        center={[formData.location.latitude, formData.location.longitude]}
                        zoom={15}
                        style={{ width: '100%', height: '500px' }}
                        ref={mapRef}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <LocationMarker />
                    </MapContainer>

                    <h2>Hình ảnh</h2>
                    <input type="file" multiple onChange={handleImageUpload} className="file-upload" />
                    <div className="image-gallery">
                        {formData.images.map((image, index) => (
                            <div key={index} className="image-container">
                                <img src={image} alt={`Image ${index + 1}`} />
                                <button type="button" onClick={() => deleteImage(index)} className="delete-button">Xóa</button>
                            </div>
                        ))}
                    </div>

                    <h2>Hình ảnh Menu</h2>
                    <input type="file" multiple onChange={handleMenuImageUpload} className="file-upload" />
                    <div className="image-gallery">
                        {formData.menuImages.map((menuImage, index) => (
                            <div key={index} className="image-container">
                                <img src={menuImage} alt={`Menu Image ${index + 1}`} />
                                <button type="button" onClick={() => deleteMenuImage(index)} className="delete-button">Xóa</button>
                            </div>
                        ))}
                    </div>

                    <h2>Tiện nghi</h2>
                    <div className="amenities-edit">
                        {availableAmenities.map((amenity, index) => (
                            <label key={index} className="amenity-option">
                                <input
                                    type="checkbox"
                                    value={amenity}
                                    checked={formData.amenities.includes(amenity)}
                                    onChange={handleAmenitiesChange}
                                />
                                {amenity}
                            </label>
                        ))}
                    </div>

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

                    <h2>Giờ Mở Cửa</h2>
                    <div className="operating-hours-edit-section">
                        {formData.operatingHours.map((oh, index) => (
                            <div key={index} className="operating-hours-entry">
                                <div className="operating-hours-fields">
                                    <label htmlFor={`startDay-${index}`}>Từ:</label>
                                    <select
                                        id={`startDay-${index}`}
                                        value={oh.startDay}
                                        onChange={(e) => handleOperatingHourChange(index, 'startDay', e.target.value)}
                                        className="day-select"
                                    >
                                        {daysOfWeek.map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>

                                    <label htmlFor={`endDay-${index}`}>Đến:</label>
                                    <select
                                        id={`endDay-${index}`}
                                        value={oh.endDay}
                                        onChange={(e) => handleOperatingHourChange(index, 'endDay', e.target.value)}
                                        className="day-select"
                                    >
                                        {daysOfWeek.map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>

                                    <label htmlFor={`openTime-${index}`}>Mở cửa:</label>
                                    <input
                                        id={`openTime-${index}`}
                                        type="time"
                                        value={oh.openTime}
                                        onChange={(e) => handleOperatingHourChange(index, 'openTime', e.target.value)}
                                        className="time-input"
                                        step="1800" // 30-minute steps
                                    />

                                    <label htmlFor={`closeTime-${index}`}>Đóng cửa:</label>
                                    <input
                                        id={`closeTime-${index}`}
                                        type="time"
                                        value={oh.closeTime}
                                        onChange={(e) => handleOperatingHourChange(index, 'closeTime', e.target.value)}
                                        className="time-input"
                                        step="1800" // 30-minute steps
                                    />
                                </div>
                                <button type="button" onClick={() => removeOperatingHour(index)} className="remove-oh-button">Xóa</button>
                            </div>
                        ))}
                        <button type="button" onClick={addOperatingHour} className="add-oh-button">Thêm Giờ Mở Cửa</button>
                    </div>

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
                    <p>{formData.city}</p> {/* Display city */}

                    <h2>Giá</h2>
                    <p>
                        Giá thấp nhất: {formData.price.minPrice.toLocaleString('vi-VN')} VNĐ<br />
                        Giá cao nhất: {formData.price.maxPrice.toLocaleString('vi-VN')} VNĐ
                    </p> {/* Display price */}

                    <h2>Vị trí</h2>
                    <p>Địa chỉ: {formData.location.address}</p>
                    <p>Tọa độ: {formData.location.latitude}, {formData.location.longitude}</p>

                    {/* Google Maps iframe */}
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

                    <h2>Hình ảnh</h2>
                    <div className="image-gallery">
                        {formData.images.map((image, index) => (
                            <img className="image-rest" key={index} src={image} alt={`Restaurant ${formData.foodServiceName} ${index + 1}`} />
                        ))}
                    </div>

                    <h2>Hình ảnh Menu</h2>
                    <div className="image-gallery">
                        {formData.menuImages.map((menuImage, index) => (
                            <img key={index} className="image-rest" src={menuImage} alt={`Menu ${index + 1}`} />
                        ))}
                    </div>

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

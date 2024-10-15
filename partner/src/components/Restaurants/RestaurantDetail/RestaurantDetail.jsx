/* eslint-disable react/prop-types */
import { useState, useRef , useEffect} from 'react';

import './RestaurantDetail.css'; // Import CSS mới
import { FaArrowLeft,FaPhone, FaEnvelope, FaWifi, FaUtensils,FaCar } from 'react-icons/fa'; // Import icons từ react-icons
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import { MapContainer, TileLayer, Marker,useMapEvents } from 'react-leaflet';
import L from 'leaflet';


const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const redIcon = new L.Icon({
    iconUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-location-icon-download-in-svg-png-gif-file-formats--marker-pointer-map-pin-navigation-finance-and-economy-pack-business-icons-2561454.png?f=webp&w=256',
    iconSize: [41, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const RestaurantDetail = ({onBack, RestaurantData}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [formData, setFormData] = useState(
        RestaurantData || {
            name: "",
            description: "",
            contactNumber: "",
            email: "",
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
            newImages: [],
            menuImages: [],
        }
    );

    console.log(formData)
    const [amenities, setAmenities] = useState([]);
    const mapRef = useRef();
    const availableAmenities = ["Free Wi-Fi", "Outdoor seating", "Live music", "Parking", "Wheelchair access", "Pets allowed"];

    useEffect(() => {
        console.log(RestaurantData);
        if (RestaurantData) {
            setFormData({
                name: RestaurantData.name,
                description: RestaurantData.description,
                contactNumber: RestaurantData.contactNumber,
                email: RestaurantData.email,
                location: {
                    address: RestaurantData.location.address,
                    latitude: RestaurantData.location.latitude,
                    longitude: RestaurantData.location.longitude,
                },
                amenities: RestaurantData.amenities,
                operatingHours: RestaurantData.operatingHours,
                newImages: RestaurantData.newImages,
                menuImages: RestaurantData.menuImages,
            });     
        }
        else {
            setIsEditing(true) ;
            setFormData({ name: "",
                description: "",
                contactNumber: "",
                email: "",
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
                newImages: [],
                menuImages: [],
            });
        }
    }, [RestaurantData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = () => {
        if (!RestaurantData) {
            console.log("New restaurant data:", formData);
            
        } else {
            console.log("Saved data:", formData);
            // Thực hiện logic lưu chỉnh sửa
        }
        setIsEditing(false);
    };
    const handleImageUpload = (e) => {
        const files = e.target.files;
        const newImages = [...formData.newImages];
        for (let file of files) {
            newImages.push(URL.createObjectURL(file));
        }
        setFormData({ ...formData, newImages });
    };

    const handleMenuImageUpload = (e) => {
        const files = e.target.files;
        const menuImages = [...formData.menuImages];
        for (let file of files) {
            menuImages.push(URL.createObjectURL(file));
        }
        setFormData({ ...formData, menuImages });
    };

    const deleteImage = (index) => {
        const updatedImages = [...formData.newImages];
        updatedImages.splice(index, 1);
        setFormData({ ...formData, newImages: updatedImages });
    };

    const deleteMenuImage = (index) => {
        const updatedImages = [...formData.menuImages];
        updatedImages.splice(index, 1);
        setFormData({ ...formData, menuImages: updatedImages });
    };

    const handleOperatingHourChange = (index, field, value) => {
        const updatedOperatingHours = [...formData.operatingHours];
        updatedOperatingHours[index][field] = value;
        setFormData({ ...formData, operatingHours: updatedOperatingHours });
    };

    const addOperatingHour = () => {
        setFormData({
            ...formData,
            operatingHours: [
                ...formData.operatingHours,
                { startDay: "Mon", endDay: "Mon", openTime: "10:00", closeTime: "22:00" }
            ]
        });
    };

    const removeOperatingHour = (index) => {
        const updatedOperatingHours = [...formData.operatingHours];
        updatedOperatingHours.splice(index, 1);
        setFormData({ ...formData, operatingHours: updatedOperatingHours });
    };

    // const handleLocationChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData({ ...formData, location: { ...formData.location, [name]: value } });
    // };

    const handleAmenitiesChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setAmenities([...amenities, value]);
            setFormData({ ...formData, amenities: [...formData.amenities, value] });
        } else {
            setAmenities(amenities.filter(amenity => amenity !== value));
            setFormData({ ...formData, amenities: formData.amenities.filter(amenity => amenity !== value) });
        }
    };

    // Hàm định dạng thời gian
    const formatTime = (time) => {
        const [hour, minute] = time.split(':');
        const hourNum = parseInt(hour);
        const ampm = hourNum >= 12 ? 'PM' : 'AM';
        const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
        return `${formattedHour}:${minute} ${ampm}`;
    };
    const getAddressFromCoords = async (lat, lng) => {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        return data.display_name;
    };
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const address = await getAddressFromCoords(latitude, longitude);
                setFormData({
                    ...formData,
                    location: {
                        ...formData.location,
                        latitude,
                        longitude,
                        address
                    }
                });
                // Di chuyển bản đồ đến vị trí mới và zoom
                mapRef.current.flyTo([latitude, longitude], 20);
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    // Handle location search
    const handleLocationSearch = async (e) => {
        e.preventDefault();
        if (searchQuery) {
            // Use a geolocation service like OpenStreetMap Nominatim API
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json`);
            const data = await response.json();
            setSearchResults(data);
        }
    };

    const handleLocationSelect = (lat, lon, address) => {
        setFormData({
            ...formData,
            location: {
                latitude: lat,
                longitude: lon,
                address,
            }
        });
        setSearchResults([]);
        setSearchQuery(address);
        mapRef.current.flyTo([lat, lon], 20);
    };

    const LocationMarker = () => {
        const map = useMapEvents({
            click: async (e) => {
                const { lat, lng } = e.latlng;
                const address = await getAddressFromCoords(lat, lng); // Lấy địa chỉ từ tọa độ

                setFormData({
                    ...formData,
                    location: {
                        latitude: lat,
                        longitude: lng,
                        address // Cập nhật địa chỉ với tọa độ mới
                    }
                });

                // Di chuyển bản đồ đến vị trí được chọn và zoom
                map.flyTo([lat, lng], 15);
            },
        });

        return (
            <Marker position={[formData.location.latitude, formData.location.longitude]} icon={redIcon} />
        );
    };

       

    return (
        <div className="restaurant">
             <button className="back-button" onClick={() => onBack()}>
                <FaArrowLeft /> Back to Restaurants
            </button>
            {isEditing ? (
                <>
                    <h1>
                        <label>Tên:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="edit-input"
                        />
                    </h1>
                    <label>Mô tả:</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Mô tả"
                        className="edit-textarea"
                    />
                </>
            ) : (
                <>
                    <h1>{formData.name}</h1>
                    <p>{formData.description}</p>
                </>
            )}

            <h2>Vị trí</h2>
            {isEditing ? (
                <>
                    <p>Địa chỉ:
                        <input
                            type="text"
                            name="address"
                            value={formData.location.address}
                            onChange={(e) => setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })}
                            className="edit-input"
                        />
                    </p>
                    <p>Tọa độ:
                        <input
                            type="number"
                            name="latitude"
                            value={formData.location.latitude}
                            onChange={(e) => setFormData({ ...formData, location: { ...formData.location, latitude: e.target.value } })}
                            className="edit-input-small"
                            step="0.000001"
                        /> ,
                        <input
                            type="number"
                            name="longitude"
                            value={formData.location.longitude}
                            onChange={(e) => setFormData({ ...formData, location: { ...formData.location, longitude: e.target.value } })}
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
                    <button onClick={getCurrentLocation} className="current-location-button">
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
                </>
            ) : (
                <div className="map">
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
                    ></iframe>
                </div>
            )}

            <h2>Hình ảnh</h2>
            {isEditing ? (
                <>
                    <input type="file" multiple onChange={handleImageUpload} className="file-upload" />
                    <div className="image-gallery">
                        {formData.newImages.map((image, index) => (
                            <div key={index} className="image-container">
                                <img src={image} alt={`Image ${index + 1}`} />
                                <button onClick={() => deleteImage(index)} className="delete-button">Xóa</button>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="image-gallery">
                    {formData.newImages.map((image, index) => (
                        <img className="image-rest" key={index} src={image} alt={`Restaurant ${formData.name} ${index + 1}`} />
                    ))}
                </div>
            )}

            <h2>Hình ảnh Menu</h2>
            {isEditing ? (
                <>
                    <input type="file" multiple onChange={handleMenuImageUpload} className="file-upload" />
                    <div className="image-gallery">
                        {formData.menuImages.map((image, index) => (
                            <div key={index} className="image-container">
                                <img src={image} alt={`Menu Image ${index + 1}`} />
                                <button onClick={() => deleteMenuImage(index)} className="delete-button">Xóa</button>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="image-gallery">
                    {formData.menuImages.map((menuImage, index) => (
                        <img key={index} className="image-rest" src={menuImage} alt={`Menu ${index + 1}`} />
                    ))}
                </div>
            )}

            <h2>Tiện nghi</h2>
            {isEditing ? (
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
            ) : (
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
            )}

            <h2>Thông tin Liên hệ</h2>
            <p><FaPhone /> Điện thoại: {isEditing ? (
                <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="edit-input"
                />
            ) : (
                formData.contactNumber
            )}</p>
            <p><FaEnvelope /> Email: {isEditing ? (
                <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="edit-input"
                />
            ) : (
                formData.email
            )}</p>

            <h2>Giờ Mở Cửa</h2>
            {isEditing ? (
                <div className="operating-hours-edit-section">
                    {formData.operatingHours.map((oh, index) => (
                        <div key={index} className="operating-hours-entry">
                            <div className="operating-hours-fields">
                                <label>Từ:</label>
                                <select
                                    value={oh.startDay}
                                    onChange={(e) => handleOperatingHourChange(index, 'startDay', e.target.value)}
                                    className="day-select"
                                >
                                    {daysOfWeek.map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>

                                <label>Đến:</label>
                                <select
                                    value={oh.endDay}
                                    onChange={(e) => handleOperatingHourChange(index, 'endDay', e.target.value)}
                                    className="day-select"
                                >
                                    {daysOfWeek.map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>

                                <label>Mở cửa:</label>
                                <input
                                    type="time"
                                    value={oh.openTime}
                                    onChange={(e) => handleOperatingHourChange(index, 'openTime', e.target.value)}
                                    className="time-input"
                                    step="1800" // Bước nhảy 30 phút
                                />

                                <label>Đóng cửa:</label>
                                <input
                                    type="time"
                                    value={oh.closeTime}
                                    onChange={(e) => handleOperatingHourChange(index, 'closeTime', e.target.value)}
                                    className="time-input"
                                    step="1800" // Bước nhảy 30 phút
                                />
                            </div>
                            <button onClick={() => removeOperatingHour(index)} className="remove-oh-button">Xóa</button>
                        </div>
                    ))}
                    <button onClick={addOperatingHour} className="add-oh-button">Thêm Giờ Mở Cửa</button>
                </div>
            ) : (
                <ul className="operating-hours-list">
                    {formData.operatingHours.map((oh, index) => (
                        <li key={index}>
                            {oh.startDay} đến {oh.endDay}: {formatTime(oh.openTime)} - {formatTime(oh.closeTime)}
                        </li>
                    ))}
                </ul>
            )}

            <div className="buttons">
                {isEditing ? (
                    <>
                        <button onClick={handleSave} className="save-button">Lưu</button>
                        <button onClick={() => setIsEditing(false)} className="cancel-button">Hủy</button>
                    </>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="edit-button">Chỉnh sửa</button>
                )}
            </div>
        </div>
    );

};

export default RestaurantDetail;

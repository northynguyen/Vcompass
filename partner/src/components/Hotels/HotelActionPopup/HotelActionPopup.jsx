/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* HotelActionPopup.jsx */
import { useState, useEffect, useRef } from 'react';
import './HotelActionPopup.css';
import { FaTimes } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Define a custom icon for the marker
const redIcon = new L.Icon({
    iconUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-location-icon-download-in-svg-png-gif-file-formats--marker-pointer-map-pin-navigation-finance-and-economy-pack-business-icons-2561454.png?f=webp&w=256',
    iconSize: [41, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const HotelActionPopup = ({ action, hotel, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: hotel ? hotel.name : '',
        description: hotel ? hotel.description : '',
        rooms: hotel ? hotel.rooms : '',
        rating: hotel ? hotel.rating : '',
        priceRange: hotel ? hotel.priceRange : '',
        amenities: hotel ? hotel.amenities.join(", ") : '',
        contactPhone: hotel ? hotel.contact.phone : '',
        contactEmail: hotel ? hotel.contact.email : '',
        website: hotel ? hotel.website : '',
        // Initialize location with latitude, longitude, and address
        location: hotel
            ? { ...hotel.location }
            : { latitude: 0, longitude: 0, address: '' },
        // Initialize images as an array
        images: hotel ? (Array.isArray(hotel.image) ? hotel.image : [hotel.image]) : [],
    });

    const [imageFiles, setImageFiles] = useState([]); // Store uploaded image files
    const [imagePreviews, setImagePreviews] = useState(hotel ? (Array.isArray(hotel.image) ? hotel.image : [hotel.image]) : []); // Image previews

    const popupRef = useRef(null);
    const mapRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        // Process amenities into an array
        const processedData = {
            ...formData,
            amenities: formData.amenities.split(",").map(item => item.trim()),
            image: imagePreviews,
        };
        onSubmit(processedData);
    };

    // Handle multiple image uploads
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImagePreviews = [...imagePreviews];
        const newImageFiles = [...imageFiles];

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newImagePreviews.push(reader.result);
                setImagePreviews([...newImagePreviews]);
            };
            reader.readAsDataURL(file);
            newImageFiles.push(file);
        });

        setImageFiles([...newImageFiles]);
    };

    // Handle image deletion
    const deleteImage = (index) => {
        const updatedPreviews = [...imagePreviews];
        updatedPreviews.splice(index, 1);
        setImagePreviews(updatedPreviews);

        const updatedFiles = [...imageFiles];
        updatedFiles.splice(index, 1);
        setImageFiles(updatedFiles);
    };

    // Handle location selection via map
    const LocationMarker = () => {
        useMapEvents({
            click: async (e) => {
                const { lat, lng } = e.latlng;
                const address = await getAddressFromCoords(lat, lng);

                setFormData({
                    ...formData,
                    location: {
                        latitude: lat,
                        longitude: lng,
                        address
                    }
                });
            },
        });

        return (
            <Marker position={[formData.location.latitude, formData.location.longitude]} icon={redIcon} />
        );
    };

    // Function to get address from coordinates using OpenStreetMap Nominatim API
    const getAddressFromCoords = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (!response.ok) throw new Error('Failed to fetch address');
            const data = await response.json();
            return data.display_name;
        } catch (error) {
            console.error(error);
            alert('Unable to retrieve address. Please try again.');
            return formData.location.address;
        }
    };

    // Handle current location retrieval
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const address = await getAddressFromCoords(latitude, longitude);
                setFormData({
                    ...formData,
                    location: {
                        latitude,
                        longitude,
                        address
                    }
                });

                // Fly to current location
                mapRef.current.flyTo([latitude, longitude], 18);
            }, (error) => {
                console.error(error);
                alert('Unable to retrieve your location.');
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    // Render form fields based on action
    const renderFormFields = () => {
        switch (action) {
            case 'add':
            case 'edit':
                return (
                    <>
                        <div className="hap-form-group">
                            <label>Tên Khách Sạn:</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="hap-form-group">
                            <label>Địa Điểm:</label>
                            {/* Map for selecting location */}
                            <div className="hap-map-container">
                                <MapContainer
                                    center={[formData.location.latitude || 0, formData.location.longitude || 0]}
                                    zoom={13}
                                    style={{ height: '200px', width: '100%' }}
                                    ref={mapRef}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <LocationMarker />
                                </MapContainer>
                                <button type="button" onClick={getCurrentLocation} className="hap-current-location-btn">
                                    Sử dụng vị trí hiện tại
                                </button>
                            </div>
                            <input
                                type="text"
                                name="address"
                                value={formData.location.address}
                                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })}
                                placeholder="Địa chỉ"
                                required
                            />
                        </div>
                        <div className="hap-form-group">
                            <label>Mô Tả:</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="hap-form-group">
                            <label>Số Phòng:</label>
                            <input
                                type="number"
                                name="rooms"
                                value={formData.rooms}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="hap-form-group">
                            <label>Đánh Giá (1-5):</label>
                            <input
                                type="number"
                                name="rating"
                                min="1"
                                max="5"
                                step="0.1"
                                value={formData.rating}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="hap-form-group">
                            <label>Phạm Vi Giá:</label>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <label htmlFor="priceRange" style={{ marginRight: '10px' }}>Từ </label>
                                <input
                                    style={{ marginRight: '10px' , width: '100px'}}
                                    type="number"
                                    name="price"
                                    value={formData.priceRange.priceMin}
                                    onChange={handleChange}
                                    required
                                />
                                <label htmlFor="priceRange" style={{ marginRight: '10px' }}> VND - Đến </label>
                                <input
                                    style={{ marginRight: '10px' , width: '100px'}}
                                    type="number"
                                    name="priceRange"
                                    value={formData.priceRange.priceMax}
                                    onChange={handleChange}
                                    required
                                />
                                <label htmlFor="priceRange">VND</label>
                            </div>
                           
                        </div>
                        <div className="hap-form-group">
                            <label>Tiện Nghi:</label>
                            <input
                                type="text"
                                name="amenities"
                                value={formData.amenities}
                                onChange={handleChange}
                                placeholder="Free Wi-Fi, Breakfast Included"
                                required
                            />
                        </div>
                        <div className="hap-form-group">
                            <label>Số Điện Thoại Liên Hệ:</label>
                            <input
                                type="text"
                                name="contactPhone"
                                value={formData.contactPhone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="hap-form-group">
                            <label>Email Liên Hệ:</label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="hap-form-group">
                            <label>Website:</label>
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="hap-form-group">
                            <label>Hình Ảnh:</label>
                            <input
                                type="file"
                                name="images"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="hap-file-input"
                                required={action === 'add'}
                            />
                            {imagePreviews.length > 0 && (
                                <div className="hap-image-preview-container">
                                    {imagePreviews.map((image, index) => (
                                        <div key={index} className="hap-image-preview-wrapper">
                                            <img src={image} alt={`Preview ${index + 1}`} className="hap-image-preview" />
                                            <button type="button" onClick={() => deleteImage(index)} className="hap-delete-image-btn">
                                                X
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                );
            case 'lock':
                return (
                    <div className="hap-form-group">
                        <p>Bạn có chắc chắn muốn khóa khách sạn này không?</p>
                    </div>
                );
            case 'view':
                return (
                    <>
                        <div className="hap-form-group">
                            <label>Tên Khách Sạn:</label>
                            <input type="text" name="name" value={formData.name} readOnly />
                        </div>
                        <div className="hap-form-group">
                            <label>Địa Điểm:</label>
                            {/* Display map for view mode */}
                            <div className="hap-map-container">
                                <MapContainer
                                    center={[formData.location.latitude || 0, formData.location.longitude || 0]}
                                    zoom={13}
                                    style={{ height: '200px', width: '100%' }}
                                    scrollWheelZoom={false}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <Marker position={[formData.location.latitude, formData.location.longitude]} icon={redIcon} />
                                </MapContainer>
                            </div>
                            <input
                                type="text"
                                name="address"
                                value={formData.location.address}
                                readOnly
                            />
                        </div>
                        <div className="hap-form-group">
                            <label>Mô Tả:</label>
                            <textarea name="description" value={formData.description} readOnly />
                        </div>
                        <div className="hap-form-group">
                            <label>Số Phòng:</label>
                            <input type="number" name="rooms" value={formData.rooms} readOnly />
                        </div>
                        <div className="hap-form-group">
                            <label>Đánh Giá:</label>
                            <input type="number" name="rating" value={formData.rating} readOnly />
                        </div>
                        <div className="hap-form-group">
                            <label>Phạm Vi Giá:</label>
                            <div style={{ display: 'flex', alignItems: 'center' }} >
                                <label htmlFor="priceRange" style={{ marginRight: '10px' }}>Từ </label>
                                <input
                                    style={{ marginRight: '10px' , width: '100px'}}
                                    type="number"
                                    name="price"
                                    value={formData.priceRange.priceMin}
                                    onChange={handleChange}
                                    required
                                    readOnly
                                />
                                <label htmlFor="priceRange" style={{ marginRight: '10px' }}> VND - Đến </label>
                                <input
                                    style={{ marginRight: '10px' , width: '100px'}}
                                    type="number"
                                    name="priceRange"
                                    value={formData.priceRange.priceMax}                                   
                                    readOnly
                                />
                                <label htmlFor="priceRange">VND</label>
                            </div>
                        </div>
                        <div className="hap-form-group">
                            <label>Tiện Nghi:</label>
                            <input type="text" name="amenities" value={formData.amenities} readOnly />
                        </div>
                        <div className="hap-form-group">
                            <label>Số Điện Thoại Liên Hệ:</label>
                            <input type="text" name="contactPhone" value={formData.contactPhone} readOnly />
                        </div>
                        <div className="hap-form-group">
                            <label>Email Liên Hệ:</label>
                            <input type="email" name="contactEmail" value={formData.contactEmail} readOnly />
                        </div>
                        <div className="hap-form-group">
                            <label>Website:</label>
                            <input type="url" name="website" value={formData.website} readOnly />
                        </div>
                        <div className="hap-form-group">
                            <label>Hình Ảnh:</label>
                            <div className="hap-image-preview-container">
                                {imagePreviews.map((image, index) => (
                                    <img key={index} src={image} alt={`${formData.name} ${index + 1}`} className="hap-view-hotel-image" />
                                ))}
                            </div>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="hap-popup">
            <div className="hap-popup-content" ref={popupRef}>
                <button className="hap-close-popup" onClick={onClose}>
                    <FaTimes />
                </button>
                <h3 className="hap-title">
                    {action === 'add' ? 'Thêm Khách Sạn Mới' 
                    : action === 'edit' ? 'Chỉnh Sửa Khách Sạn' 
                    : action === 'lock' ? 'Khóa Khách Sạn' 
                    : 'Chi Tiết Khách Sạn'}
                </h3>
                <form onSubmit={action !== 'lock' ? handleSubmit : null}>
                    {renderFormFields()}
                    {action !== 'view' && action !== 'lock' && (
                        <div>
                            <button 
                            type="submit" 
                            className="hap-submit-btn" 
                            onClick={(e) => {
                                if (action === 'add' || action === 'edit') {
                                    handleSubmit(e);
                                    onClose();
                                }
                            }}
                            >
                                {action === 'add' ? 'Thêm Khách Sạn' : 'Lưu Thay Đổi'}
                            </button>
                            <span> </span>
                            <button type="button" className="hap-submit-btn" style={{ backgroundColor: 'red' }} onClick={onClose}>
                                Huy
                            </button>
                        </div>
                        
                    )}
                    {action === 'lock' && (
                        <div>
                            <button type="button" className="hap-submit-btn" onClick={() => {
                            onSubmit();
                            onClose();
                            }}>
                                Xác Nhận Khóa
                            </button>
                            <span> </span>
                            <button type="button" className="hap-submit-btn" style={{ backgroundColor: 'red' }} onClick={onClose}>
                                Huy
                            </button>
                        </div>
                        
                    )}
                </form>
            </div>
        </div>
    );
};

export default HotelActionPopup;

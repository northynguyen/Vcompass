/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* HotelActionPopup.jsx */
import { useState, useEffect, useRef, useContext } from 'react';
import './HotelActionPopup.css';
import { FaTimes } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { StoreContext } from '../../../Context/StoreContext';
import AmenitiesEditor from './AmenitiesEditor';
// Define a custom icon for the marker
const redIcon = new L.Icon({
    iconUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-location-icon-download-in-svg-png-gif-file-formats--marker-pointer-map-pin-navigation-finance-and-economy-pack-business-icons-2561454.png?f=webp&w=256',
    iconSize: [41, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


const HotelActionPopup = ({ action, hotel, onClose, onSubmit }) => {
    const { url } = useContext(StoreContext);
    const [formData, setFormData] = useState({
        name: hotel ? hotel.name : '',
        description: hotel ? hotel.description : '',
        priceRange: hotel ? hotel.priceRange : { priceMin: '', priceMax: '' }, // Ensure it's an object
        amenities: hotel ? hotel.amenities : [],
        contact: {
            phone: hotel ? hotel.contact.phone : '',
            email: hotel ? hotel.contact.email : '',
        },
        location: {
            address: hotel ? hotel.location.address : '',
            latitude: hotel ? hotel.location.latitude : '',
            longitude: hotel ? hotel.location.longitude : '',
        },
        city: hotel ? hotel.city : '',
        status: hotel ? hotel.status : 'pending',
    });

    const vietnamProvinces = [
        "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bến Tre", "Bình Định",
        "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk",
        "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam",
        "Hà Nội", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hồ Chí Minh", "Hưng Yên",
        "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai",
        "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên",
        "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng",
        "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế",
        "Tiền Giang", "TP Hồ Chí Minh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
    ];
    const [availableAmenities, setAvailableAmenities] = useState([]);

    useEffect(() => {
        const fetchAmenities = async () => {
            try {
                const response = await fetch(`${url}/api/extensions?limit=0`);
                const data = await response.json();
                const formattedAmenities = data.extensions.map(item => item.name);
                setAvailableAmenities(formattedAmenities);
            } catch (error) {
                console.error("Lỗi khi fetch dữ liệu:", error);
            }
        };

        fetchAmenities();
    }, []);

    const [existingImages, setExistingImages] = useState(hotel?.images || []);
    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);

    const popupRef = useRef(null);
    const mapRef = useRef(null);
    const [searchAddress, setSearchAddress] = useState('');
    const [manualCoords, setManualCoords] = useState({ lat: '', lng: '' });

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
        if (name === 'phone' || name === 'email') {
            setFormData((prev) => ({
                ...prev,
                contact: {
                    ...prev.contact,
                    [name === 'phone' ? 'phone' : 'email']: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };


    // Handle form submission
    const handleSubmit = (e) => {

        e.preventDefault();
        // Check for missing required fields

        const formDataToSubmit = new FormData();

        // Append simple fields
        formDataToSubmit.append('name', formData.name);
        formDataToSubmit.append('description', formData.description);
        formDataToSubmit.append('contact', JSON.stringify(formData.contact));
        formDataToSubmit.append('city', formData.city);
        formDataToSubmit.append('status', formData.status);
        formDataToSubmit.append('location', JSON.stringify(formData.location));


        // Append amenities as individual items in FormData
        formData.amenities.map(item => item.trim()).forEach(amenity => {
            formDataToSubmit.append('amenities[]', amenity);
        });

        // Append existing images
        existingImages.forEach((image, index) => {
            formDataToSubmit.append(`images[${index}]`, image);
        });

        // Append new image files
        newImages.forEach(file => {
            formDataToSubmit.append('newImages', file);
        });

        console.log([...formDataToSubmit.entries()]); // Log the FormData to see its contents

        // Pass FormData to the submit function
        onSubmit(formDataToSubmit);

    };

    // Handle multiple image uploads
    const handleExistingImageRemove = (index) => {
        setExistingImages((prevImages) => prevImages.filter((_, idx) => idx !== index));
    };

    // Handle new image uploads
    const handleNewImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + newImages.length + existingImages.length > 8) {
            alert('Bạn chỉ có thể chọn tối đa 8 hình ảnh.');
            return;
        }

        setNewImages((prevFiles) => [...prevFiles, ...files]);

        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setNewImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    };

    const handleNewImageRemove = (index) => {
        setNewImages((prevFiles) => prevFiles.filter((_, idx) => idx !== index));
        setNewImagePreviews((prevPreviews) => prevPreviews.filter((_, idx) => idx !== index));
    };


    // Handle location selection via map
    const LocationMarker = () => {
        useMapEvents({
            click: async (e) => {
                const { lat, lng } = e.latlng;
                const address = await getAddressFromCoords(lat, lng);
                setFormData((prev) => ({
                    ...prev,
                    location: { latitude: lat, longitude: lng, address },
                }));
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
                setFormData((prev) => ({
                    ...prev,
                    location: { latitude, longitude, address },
                }));
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

    // Function to search for location by address
    const searchLocation = async () => {
        if (!searchAddress.trim()) {
            alert('Vui lòng nhập địa chỉ để tìm kiếm');
            return;
        }
        
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}`);
            if (!response.ok) throw new Error('Failed to search location');
            
            const data = await response.json();
            if (data.length === 0) {
                alert('Không tìm thấy địa điểm. Vui lòng thử lại với từ khóa khác.');
                return;
            }
            
            const { lat, lon, display_name } = data[0];
            setFormData((prev) => ({
                ...prev,
                location: { 
                    latitude: parseFloat(lat), 
                    longitude: parseFloat(lon), 
                    address: display_name 
                },
            }));
            
            // Fly to the found location
            mapRef.current.flyTo([parseFloat(lat), parseFloat(lon)], 15);
        } catch (error) {
            console.error(error);
            alert('Không thể tìm kiếm địa điểm. Vui lòng thử lại sau.');
        }
    };
    
    // Function to set location from manually entered coordinates
    const setLocationFromCoords = async () => {
        if (!manualCoords.lat || !manualCoords.lng) {
            alert('Vui lòng nhập cả vĩ độ và kinh độ');
            return;
        }
        
        const lat = parseFloat(manualCoords.lat);
        const lng = parseFloat(manualCoords.lng);
        
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            alert('Tọa độ không hợp lệ. Vĩ độ phải từ -90 đến 90, kinh độ từ -180 đến 180.');
            return;
        }
        
        const address = await getAddressFromCoords(lat, lng);
        setFormData((prev) => ({
            ...prev,
            location: { latitude: lat, longitude: lng, address },
        }));
        
        // Fly to the entered coordinates
        mapRef.current.flyTo([lat, lng], 15);
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
                            
                            {/* Add search functionality */}
                            <div className="hap-location-search">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm địa điểm..."
                                    value={searchAddress}
                                    onChange={(e) => setSearchAddress(e.target.value)}
                                />
                                <button type="button" onClick={searchLocation} className="hap-search-btn">
                                    Tìm kiếm
                                </button>
                            </div>
                            
                            {/* Add manual coordinate input */}
                            <div className="hap-manual-coords">
                                <div className="hap-coords-inputs">
                                    <input
                                        type="text"
                                        placeholder="Vĩ độ (Latitude)"
                                        value={manualCoords.lat}
                                        onChange={(e) => setManualCoords({...manualCoords, lat: e.target.value})}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Kinh độ (Longitude)"
                                        value={manualCoords.lng}
                                        onChange={(e) => setManualCoords({...manualCoords, lng: e.target.value})}
                                    />
                                </div>
                                <button type="button" onClick={setLocationFromCoords} className="hap-coords-btn">
                                    Đặt vị trí
                                </button>
                            </div>
                            
                            <div className="hap-map-container">
                                <MapContainer
                                    center={[formData.location.latitude || 10.8231, formData.location.longitude || 106.6297]} // Default to HCMC if no coords
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
                            
                            {/* Display current coordinates */}
                            <div className="hap-current-coords">
                                <p>Tọa độ hiện tại: {formData.location.latitude ? `${formData.location.latitude.toFixed(6)}, ${formData.location.longitude.toFixed(6)}` : 'Chưa chọn'}</p>
                            </div>
                        </div>
                        <div className="hap-form-group">
                            <label>Thành phố:</label>
                            <select
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Chọn tỉnh/thành phố</option>
                                {vietnamProvinces.map((province, index) => (
                                    <option key={index} value={province}>
                                        {province}
                                    </option>
                                ))}
                            </select>
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

                        <AmenitiesEditor
                            availableAmenities={availableAmenities}
                            selectedAmenities={formData.amenities}
                            onAmenitiesChange={handleAmenitiesChange}
                        />
                        <div className="hap-form-group">
                            <label>Số Điện Thoại Liên Hệ:</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.contact.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="hap-form-group">
                            <label>Email Liên Hệ:</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.contact.email}
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
                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <div className="existing-images">
                                    <h4>Existing Images:</h4>
                                    <div className="image-previews">
                                        {existingImages.map((img, idx) => (
                                            <div key={idx} className="image-preview">
                                                <img src={img.includes('http') ? img : `${url}/images/${img}`} alt={`Existing Room ${idx + 1}`} />
                                                <button type="button" onClick={() => handleExistingImageRemove(idx)}>x</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Image Upload */}
                            <label>
                                Upload New Images:
                                <input
                                    type="file"
                                    name="newImages"
                                    accept="image/*"
                                    multiple
                                    onChange={handleNewImageChange}
                                />
                            </label>

                            {/* New Image Previews */}
                            {newImagePreviews.length > 0 && (
                                <div className="new-image-previews">
                                    <h4>New Images:</h4>
                                    <div className="image-previews">
                                        {newImagePreviews.map((img, idx) => (
                                            <div key={idx} className="image-preview">
                                                <img src={img} alt={`New Room ${idx + 1}`} />
                                                <button type="button" onClick={() => handleNewImageRemove(idx)}>x</button>
                                            </div>
                                        ))}
                                    </div>
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
                            <label>Tiện nghi</label>
                            <ul className="amenities">
                                {formData.amenities.map((amenity, index) => (
                                    <li key={index}>
                                        {amenity}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="hap-form-group">
                            <label>Số Điện Thoại Liên Hệ:</label>
                            <input type="text" name="contactPhone" value={formData.contact.phone} readOnly />
                        </div>
                        <div className="hap-form-group">
                            <label>Email Liên Hệ:</label>
                            <input type="email" name="contactEmail" value={formData.contact.email} readOnly />
                        </div>
                        <div className="hap-form-group">
                            <label>Hình Ảnh:</label>
                            <div className="hap-image-preview-container">
                                {existingImages.map((image, index) => (
                                    <img key={index} src={`${url}/images/${image}`} alt={`${formData.name} ${index + 1}`} className="hap-view-hotel-image" />
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
                            : action === 'lock' ? 'Dừng hoạt động khách sạn'
                                : action === 'unlock' ? 'Mở hoạt động khách sạn'
                                    : 'Chi Tiết Khách Sạn'}
                </h3>
                <form onSubmit={action !== 'lock' && action !== 'unlock' ? handleSubmit : null}>
                    {renderFormFields()}
                    {action !== 'view' && action !== 'lock' && action !== 'unlock' && (
                        <div>
                            <button
                                type="submit"
                                className="hap-submit-btn"
                                onClick={(e) => {
                                    if (action === 'add' || action === 'edit') {
                                        handleSubmit(e);
                                    }
                                }}
                            >
                                {action === 'add' ? 'Thêm Khách Sạn' : 'Lưu Thay Đổi'}
                            </button>
                            <span> </span>
                            <button type="button" className="hap-submit-btn" style={{ backgroundColor: 'red' }} onClick={onClose}>
                                Hủy
                            </button>
                        </div>

                    )}
                    {(action === 'lock' || action === 'unlock') && (
                        <div>
                            <button type="button" className="hap-submit-btn" onClick={() => {
                                onSubmit();
                                onClose();
                            }}> {action === 'lock' ? 'Khoá Khách Sạn' : 'Mở khóa '}
                            </button>
                            <span> </span>
                            <button type="button" className="hap-submit-btn" style={{ backgroundColor: 'red' }} onClick={onClose}>
                                Hủy
                            </button>
                        </div>

                    )}
                </form>
            </div>
        </div>
    );
};

export default HotelActionPopup;

import { useState, useRef, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { FaArrowLeft, FaPhone, FaEnvelope, FaWifi, FaUtensils, FaCar } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { StoreContext } from '../../Context/StoreContext';
import { toast } from 'react-toastify';
import OperatingHoursEditor from './OperatingHoursEditor';
import ImageGallery from './ImageGallery';
import LocationMap from './LocationMap';
import AmenitiesEditor from './AmenitiesEditor';
import { useNavigate } from 'react-router-dom';
import './AttractionDetails.css';
import axios from 'axios';
const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const redIcon = new L.Icon({
    iconUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-location-icon-download-in-svg-png-gif-file-formats--marker-pointer-map-pin-navigation-finance-and-economy-pack-business-icons-2561454.png?f=webp&w=256',
    iconSize: [41, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const AttractionDetails = () => {
    const navigate = useNavigate();
    const handleback = () => {
        navigate(`/attraction/`);
    }
    const location = useLocation();
    const { attractionData } = location.state || {};

    const { url, token } = useContext(StoreContext);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [imagesData, setImageData] = useState([]);
    const [formData, setFormData] = useState(
        attractionData ? attractionData : {
            attractionName: "",
            description: "",
            city: "",
            price: "",
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
        }
    );

    const mapRef = useRef();
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
    useEffect(() => {
        if (attractionData) {
            setFormData({
                attractionName: attractionData.attractionName || "",
                description: attractionData.description || "",
                city: attractionData.city || "", // Set city
                price: attractionData.price || 0,
                location: {
                    address: attractionData.location.address || "",
                    latitude: attractionData.location.latitude || 0,
                    longitude: attractionData.location.longitude || 0,
                },
                amenities: attractionData.amenities || [],
                operatingHours: attractionData.operatingHours || [
                    {
                        startDay: "Mon",
                        endDay: "Sun",
                        openTime: "10:00",
                        closeTime: "22:00",
                    },
                ],
                images: attractionData.images || [],
            });
        } else {
            setIsEditing(true);
            setFormData({
                attractionName: "",
                description: "",
                city: "", // Initialize city
                price: "",
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

            });
        }
    }, [attractionData]);

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
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImagePreviews = files.map(file => URL.createObjectURL(file));
        setImageData(prevImages => [...prevImages, ...files]); // Lưu file thực tế
        setFormData(prevData => ({
            ...prevData,
            images: [...prevData.images, ...newImagePreviews], // Blob URL để hiển thị
        }));
    };

    const deleteImage = (index) => {
        setFormData(prevData => {
            const updatedImages = [...prevData.images];
            updatedImages.splice(index, 1);
            return { ...prevData, images: updatedImages };
        });

        setImageData(prevData => {
            const updatedImageData = [...prevData];
            updatedImageData.splice(index, 1);
            return updatedImageData;
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

    const formatTime = (time) => {
        const [hour, minute] = time.split(':');
        const hourNum = parseInt(hour, 10);
        const ampm = hourNum >= 12 ? 'PM' : 'AM';
        const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
        return `${formattedHour}:${minute} ${ampm}`;
    };

    const handleSave = async () => {
        try {
            let response;
            const formDataToSend = new FormData();

            // Append the images
            imagesData.forEach((file) => {
                formDataToSend.append("images", file);
            });

            const config = {
                headers: { 
                    token,
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (attractionData) {
                // For updating existing attraction
                const attrData = { 
                    ...formData, 
                    images: formData.images.filter(img => !img.startsWith('blob:')) // Keep only server images
                };
                console.log("Updating attraction data:", attrData);
                
                formDataToSend.append("attractionData", JSON.stringify(attrData));
                response = await axios.put(
                    `${url}/api/attractions/${attractionData._id}`,
                    formDataToSend,
                    config
                );
            } else {
                // For creating new attraction
                const attrData = { 
                    ...formData, 
                    images: [], // Start with empty images array, new images will be uploaded
                    status: "active" 
                };
                console.log("Creating new attraction data:", attrData);
                
                formDataToSend.append("attractionData", JSON.stringify(attrData));
                response = await axios.post(
                    `${url}/api/attractions`,
                    formDataToSend,
                    config
                );
            }

            if (response.data.success) {
                toast.success(response.data.message);
                setIsEditing(false);
                if (attractionData) {
                    setFormData(response.data.updatedAttraction);
                } else {
                    setFormData(response.data.newAttraction);
                }
                navigate('/attraction');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error saving data:', error);
            toast.error('Đã xảy ra lỗi khi lưu dữ liệu. Vui lòng thử lại.');
        }
    };




    return (
        <div className="attraction-details">
            <button type="button" className="back-button" onClick={handleback}>
                <FaArrowLeft /> Quay lại danh sách điểm tham quan
            </button>
            {isEditing ? (
                <>
                    <h1>
                        <label htmlFor="attractionName">Tên điểm tham quan:</label>
                        <input
                            id="attractionName"
                            type="text"
                            name="attractionName"
                            value={formData.attractionName}
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
                        <select
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="edit-input"
                        >
                            <option value="">Chọn tỉnh</option>
                            {vietnamProvinces.map((province, index) => (
                                <option key={index} value={province}>
                                    {province}
                                </option>
                            ))}
                        </select>
                    </p>
                    <h2>Giá</h2>
                    <p>
                        <label htmlFor="price">Giá (VNĐ):</label>
                        <input
                            id="price"
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={(e) => setFormData(prevData => ({
                                ...prevData,
                                price: parseInt(e.target.value) || 0
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
                        images={formData.images} // Hiển thị blob URL hoặc ảnh từ server
                        onImageUpload={handleImageUpload}
                        onDeleteImage={deleteImage}
                        title="Hình ảnh"
                        url={url}
                        isEditing={isEditing}
                    />


                    <AmenitiesEditor
                        availableAmenities={availableAmenities}
                        selectedAmenities={formData.amenities}
                        onAmenitiesChange={handleAmenitiesChange}
                    />


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
                    <h1>{formData.attractionName}</h1>
                    <p>{formData.description}</p>

                    <h2>Thành phố</h2>
                    <p>{formData.city}</p>

                    <h2>Giá</h2>
                    <p>
                        {formData.price.toLocaleString('vi-VN')} VNĐ<br />
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
                        title="Bản đồ Google"
                    ></iframe>

                    <ImageGallery
                        images={formData.images}
                        title="Hình ảnh"
                        url={url}


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

                    <h2>Giờ mở cửa</h2>
                    <ul className="operating-hours-list">
                        {formData.operatingHours.map((oh, index) => (

                            <li key={index}>
                                {oh.startDay} đến {oh.endDay}: {formatTime(oh.openTime)} - {formatTime(oh.closeTime)}
                            </li>

                        ))}
                    </ul>

                    <div className="buttons">
                        <button type="button" onClick={() => setIsEditing(true)} className="attraction-edit-button">Chỉnh sửa</button>
                    </div>
                </>
            )}
        </div>
    );
};


export default AttractionDetails;

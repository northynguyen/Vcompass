import React, { useContext, useEffect } from 'react';
import './AccomodationDetailsPopup.css';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { StoreContext } from '../../Context/StoreContext';

const AccomodationDetailsPopup = ({ accommodation, onClose }) => {
    const { url } = useContext(StoreContext);
    const redIcon = new L.Icon({
        iconUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-location-icon-download-in-svg-png-gif-file-formats--marker-pointer-map-pin-navigation-finance-and-economy-pack-business-icons-2561454.png?f=webp&w=256', // Update this path as needed
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });
    useEffect(() => {
        const handleClickOutside = (event) => {
            const popupContent = document.querySelector('.hap-popup-content');
            if (popupContent && !popupContent.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);



    return (
        <div className="hap-popup">
            <div className="hap-popup-content">
                <button className="hap-close-popup" onClick={onClose}>
                    ×
                </button>
                <h2 className="hap-title">Details for {accommodation.name}</h2>

                {/* Hotel Name */}
                <div className="hap-form-group">
                    <label>Tên Khách Sạn:</label>
                    <input type="text" value={accommodation.name} readOnly />
                </div>

                {/* Location with Map */}
                <div className="hap-form-group">
                    <label>Địa Điểm:</label>
                    <div className="hap-map-container">
                        <MapContainer
                            center={[
                                accommodation.location.latitude || 0,
                                accommodation.location.longitude || 0,
                            ]}
                            zoom={13}
                            style={{ height: '200px', width: '100%' }}
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker
                                position={[
                                    accommodation.location.latitude,
                                    accommodation.location.longitude,
                                ]}
                                icon={redIcon}
                            />
                        </MapContainer>
                    </div>
                    <input type="text" value={accommodation.location.address} readOnly />
                </div>

                {/* Description */}
                <div className="hap-form-group">
                    <label>Mô Tả:</label>
                    <textarea value={accommodation.description} readOnly />
                </div>

                {/* Amenities */}
                <div className="hap-form-group">
                    <label>Tiện Nghi:</label>
                    <input type="text" value={accommodation.amenities} readOnly />
                </div>

                {/* Contact Phone */}
                <div className="hap-form-group">
                    <label>Số Điện Thoại Liên Hệ:</label>
                    <input type="text" value={accommodation.contact.phone} readOnly />
                </div>

                {/* Contact Email */}
                <div className="hap-form-group">
                    <label>Email Liên Hệ:</label>
                    <input type="email" value={accommodation.contact.email} readOnly />
                </div>

                {/* Image Gallery */}
                <div className="hap-form-group">
                    <label>Hình Ảnh:</label>
                    <div className="hap-image-preview-container">
                        {accommodation.images.map((image, index) => (
                            <div className="hap-image-preview-wrapper" key={index}>
                                <img
                                    src={`${url}/images/${image}`}
                                    alt={`${accommodation.name} ${index + 1}`}
                                    className="hap-image-preview"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccomodationDetailsPopup;

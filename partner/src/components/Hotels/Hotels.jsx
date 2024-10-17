import { useState, useEffect } from 'react';
import './Hotels.css';
import { FaPlus, FaEllipsisV, FaTimes } from 'react-icons/fa';
import HotelActionPopup from './HotelActionPopup/HotelActionPopup';
import Rooms from '../Rooms/Rooms';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import { useContext } from 'react';
import {toast} from 'react-toastify';

const Hotels = () => {
   
    const [hotels, setHotels] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [action, setAction] = useState('');
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [selectedTab, setSelectedTab] = useState(null);
    const {url , user} = useContext(StoreContext);
    const partnerId = user._id;  
    useEffect(() => {
        // Fetch accommodations for the partner
        const fetchAccommodations = async () => {
            try {
                const response = await axios.get(`${url}/api/accommodations/${partnerId}`);
                if (response.data.success) {
                    setHotels(response.data.accommodations);
                    toast.success(response.data.message);
                } else {
                    console.error("Error fetching accommodations:", response.data.message);
                    toast.error(response.data.message);
                }
            } catch (error) {
                console.error("Error fetching accommodations:", error);
                toast.error("Error fetching accommodations. Please try again later.");
            }
        };

        fetchAccommodations();
    }, [partnerId]);
    
    const openPopup = (actionType, hotel = null) => {
        setAction(actionType);
        setSelectedHotel(hotel);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setAction('');
        setSelectedHotel(null);
    };

  

    const handleSubmit = async (formData) => {
        if (action === 'add') {
            try {
                const response = await axios.post(`${url}/api/accommodations/${partnerId}`, formData);
                if (response.data.success) {
                    setHotels([...hotels, response.data.accommodation]);
                    closePopup();
                    toast.success(response.data.message);
                }
                else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                console.error("Error adding new accommodation:", error);
                toast.error("Error adding new accommodation. Please try again later.");
            }
        } else if (action === 'edit') {
            try {
                const response = await axios.put(`${url}/api/accommodations/${partnerId}/${selectedHotel._id}`, formData);
                if (response.data.success) {
                    toast.success(response.data.message);
                    const updatedHotels = hotels.map((hotel) =>
                        hotel._id === selectedHotel._id ? response.data.accommodation : hotel
                    );
                    setHotels(updatedHotels);
                    closePopup();
                }
                else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                console.error("Error updating accommodation:", error);
                toast.error("Error updating accommodation. Please try again later.");
            }
        } else if (action === 'lock' || action === 'unlock') {
            const updatedStatus = action === 'lock' ? 'locked' : 'active';
            try {
                const response = await axios.put(`${url}/api/accommodations/${partnerId}/${selectedHotel._id}`, { status: updatedStatus });
                if (response.data.success) {
                    toast.success(response.data.message);
                    const updatedHotels = hotels.map((hotel) =>
                        hotel._id === selectedHotel._id ? response.data.accommodation : hotel
                    );
                    setHotels(updatedHotels);
                }
            } catch (error) {
                console.error("Error updating status:", error);
                toast.error("Error updating status. Please try again later.");
                console.error(`Error ${action} accommodation:`, error);
            }
        }
    };

    const openRoomsTab = (hotel) => {
        setSelectedHotel(hotel);
        setSelectedTab('rooms');
    };

    const closeRoomsTab = () => {
        setSelectedTab(null);
        setSelectedHotel(null);
    };

    return (
        <div>
            {!selectedTab ? (
                <div className="partner-hotels-container">
                    <h2>Danh Sách Khách Sạn Đăng Ký</h2>
                    <div className="hotels-list">
                        <div className="hotel-card add-hotel-card" onClick={() => openPopup('add')}>
                            <div className="add-hotel-content">
                                <FaPlus size={50} color="#007bff" />
                                <p>Thêm Khách Sạn Mới</p>
                            </div>
                        </div>

                        {hotels.map((hotel) => (
                            <div key={hotel._id} className="hotel-card" onClick={() => openRoomsTab(hotel)}>
                                <img src={`${url}/images/${hotel.images[0]}`} alt={`${hotel.name}`} className="hotel-image" />
                                <div className="hotel-info">
                                    <h3>{hotel.name}</h3>
                                    <p><strong>Địa Điểm:</strong> {hotel.location.address}</p>
                                    <p><strong>Thành phố:</strong> {hotel.city}</p>
                                    <p><strong>Mô Tả:</strong> {hotel.description}</p>
                                    <p>
                                        <strong>Trạng Thái:</strong> 
                                        <span className={`status-badge ${hotel.status}`}>
                                            {hotel.status === 'active' ? 'Đang hoạt động' : hotel.status === 'pending' ? 'Đang được duyệt' : 'Đã khóa'}
                                        </span>
                                    </p>
                                </div>
                                <div className="hotel-actions">
                                    <FaEllipsisV 
                                        className="actions-icon" 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            openPopup('menu', hotel);
                                        }} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {showPopup && action === 'add' && (
                        <HotelActionPopup 
                            action="add" 
                            hotel={null} 
                            onClose={closePopup} 
                            onSubmit={handleSubmit} 
                        />
                    )}

                    {showPopup && action === 'edit' && selectedHotel && (
                        console.log('......'+selectedHotel.contact),
                        <HotelActionPopup 
                            action="edit" 
                            hotel={selectedHotel} 
                            onClose={closePopup} 
                            onSubmit={handleSubmit} 
                        />
                    )}

                    {showPopup && action === 'lock' && selectedHotel && (
                        <HotelActionPopup 
                            action="lock" 
                            hotel={selectedHotel} 
                            onClose={closePopup} 
                            onSubmit={handleSubmit} 
                        />
                    )}

                    {showPopup && action === 'unlock' && selectedHotel && (
                        <HotelActionPopup 
                            action="unlock" 
                            hotel={selectedHotel} 
                            onClose={closePopup} 
                            onSubmit={handleSubmit} 
                        />
                    )}

                    {showPopup && action === 'view' && selectedHotel && (
                        <HotelActionPopup 
                            action="view" 
                            hotel={selectedHotel} 
                            onClose={closePopup} 
                            onSubmit={handleSubmit} 
                        />
                    )}

                    {showPopup && action === 'menu' && selectedHotel && (
                        <div className="popup menu-popup">
                            <div className="popup-content menu-popup-content">
                                <FaTimes className="close-popup" onClick={closePopup} />
                                <div className="menu-options">
                                    {selectedHotel.status === 'locked' ? (
                                        <button onClick={() => { closePopup(); openPopup('unlock', selectedHotel); }}>
                                            Mở Khách Sạn
                                        </button>
                                    ) : (
                                        <button onClick={() => { closePopup(); openPopup('lock', selectedHotel); }}>
                                            Khóa Khách Sạn
                                        </button>
                                    )}
                                    <button onClick={() => { closePopup(); openPopup('edit', selectedHotel); }}>
                                        Chỉnh Sửa
                                    </button>
                                    <button onClick={() => { closePopup(); openPopup('view', selectedHotel); }}>
                                        Xem Chi Tiết
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <Rooms hotel={selectedHotel} onBack={closeRoomsTab} />
            )}
        </div>
    );
};

export default Hotels;

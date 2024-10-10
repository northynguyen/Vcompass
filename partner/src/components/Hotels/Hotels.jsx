// src/components/Hotels/Hotels.js
import { useState } from 'react';
import './Hotels.css';
import { FaPlus, FaEllipsisV, FaTimes } from 'react-icons/fa';
import HotelActionPopup from './HotelActionPopup/HotelActionPopup';
import Rooms from '../Rooms/Rooms';
const Hotels = () => {
    const initialHotels = [
        {
            id: 1,
            name: "Grand Palace Hotel",
            location: {
                latitude: 10.8231,
                longitude: 106.6297,
                address: "Hà Nội",
            },
            status: "active", // "pending", "active", hoặc "locked"
            image: ["https://cf.bstatic.com/xdata/images/hotel/max1024x768/577035617.jpg?k=56e929e64bf7735003099c29b717428443393bf09e9e454d8a6966750a920e86&o=&hp=1"],
            description: "Khách sạn sang trọng với vị trí đắc địa tại trung tâm Hà Nội.",
            rooms: 150,
            rating: 4.5,
            priceRange: {
                priceMax: 300,
                priceMin: 100,
            },
            amenities: ["Free Wi-Fi", "Breakfast Included", "Swimming Pool"],
            contact: {
                phone: "0123456789",
                email: "info@grandpalace.com",
            },
            website: "https://grandpalace.com",
        },
        {
            id: 2,
            name: "Sunny Beach Resort",
            location: {
                latitude: 10.8231,
                longitude: 106.6297,
                address: "Hà Nội",
            },
            status: "pending", // "pending", "active", hoặc "locked"
            image: ["https://cf.bstatic.com/xdata/images/hotel/max1024x768/577035618.jpg?k=56e929e64bf7735003099c29b717428443393bf09e9e454d8a6966750a920e86&o=&hp=1"],
            description: "Khu nghỉ dưỡng bên bờ biển với dịch vụ tuyệt vời.",
            rooms: 200,
            rating: 4.8,
            priceRange: {
                priceMax: 300,
                priceMin: 100,
            },
            amenities: ["Free Wi-Fi", "Spa", "Fitness Center"],
            contact: {
                phone: "0987654321",
                email: "info@sunnybeach.com",
            },
            website: "https://sunnybeach.com",
        },
        {
            id: 3,
            name: "Mountain View Hotel",
            location: {
                latitude: 10.8231,
                longitude: 106.6297,
                address: "Hà Nội",
            },
            status: "locked", // "pending", "active", hoặc "locked"
            image: ["https://cf.bstatic.com/xdata/images/hotel/max1024x768/577035619.jpg?k=56e929e64bf7735003099c29b717428443393bf09e9e454d8a6966750a920e86&o=&hp=1"],
            description: "Khách sạn với view núi tuyệt đẹp và không khí trong lành.",
            rooms: 100,
            rating: 4.2,
            priceRange: {
                priceMax: 300,
                priceMin: 100,
            },
            amenities: ["Free Wi-Fi", "Breakfast Included"],
            contact: {
                phone: "0123987654",
                email: "info@mountainview.com",
            },
            website: "https://mountainview.com",
        },
        {
            id: 4,
            name: "Ocean Breeze Hotel",
            location: {
                latitude: 10.8231,
                longitude: 106.6297,
                address: "Hà Nội",
            },
            status: "active", // "pending", "active", hoặc "locked"
            image:[ "https://cf.bstatic.com/xdata/images/hotel/max1024x768/577035620.jpg?k=56e929e64bf7735003099c29b717428443393bf09e9e454d8a6966750a920e86&o=&hp=1"],
            description: "Khách sạn gần biển với nhiều hoạt động giải trí.",
            rooms: 120,
            rating: 4.6,
            priceRange: {
                priceMax: 300,
                priceMin: 100,
            },
            amenities: ["Free Wi-Fi", "Swimming Pool", "Restaurant"],
            contact: {
                phone: "0123478564",
                email: "info@oceanbreeze.com",
            },
            website: "https://oceanbreeze.com",
        },
        {
            id: 5,
            name: "City Center Hotel",
            location: {
                latitude: 10.8231,
                longitude: 106.6297,
                address: "Hà Nội",
            },
            status: "pending", // "pending", "active", hoặc "locked"
            image: ["https://cf.bstatic.com/xdata/images/hotel/max1024x768/577035621.jpg?k=56e929e64bf7735003099c29b717428443393bf09e9e454d8a6966750a920e86&o=&hp=1"],
            description: "Khách sạn ở trung tâm thành phố với giá cả phải chăng.",
            rooms: 80,
            rating: 3.9,
            priceRange: {
                priceMax: 300,
                priceMin: 100,
            },
            amenities: ["Free Wi-Fi", "Laundry Service"],
            contact: {
                phone: "0123549876",
                email: "info@citycenter.com",
            },
            website: "https://citycenter.com",
        },
    ];
    

    const [hotels, setHotels] = useState(initialHotels);
    const [showPopup, setShowPopup] = useState(false);
    const [action, setAction] = useState(''); // 'add', 'edit', 'lock', 'view'
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [selectedTab, setSelectedTab] = useState(null); // 'rooms'

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

    const handleSubmit = (formData) => {
        if (action === 'add') {
            const newHotel = {
                id: hotels.length > 0 ? hotels[hotels.length - 1].id + 1 : 1,
                ...formData,
                status: 'active', // Mặc định trạng thái mới là active
            };
            setHotels([...hotels, newHotel]);
        } else if (action === 'edit') {
            const updatedHotels = hotels.map((hotel) =>
                hotel.id === selectedHotel.id ? { ...hotel, ...formData } : hotel
            );
            setHotels(updatedHotels);
        } else if (action === 'lock') {
            const updatedHotels = hotels.map((hotel) =>
                hotel.id === selectedHotel.id ? { ...hotel, status: 'locked' } : hotel
            );
            setHotels(updatedHotels);
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
        <div >
            
            {/* Điều kiện hiển thị tab Rooms hoặc danh sách khách sạn */}
            {!selectedTab ? (
                <div className="partner-hotels-container">
                     <h2>Danh Sách Khách Sạn Đăng Ký</h2>
                    <div className="hotels-list">
                   

                        {/* Card Thêm Khách Sạn Mới */}
                        <div className="hotel-card add-hotel-card" onClick={() => openPopup('add')}>
                            <div className="add-hotel-content">
                                <FaPlus size={50} color="#007bff" />
                                <p>Thêm Khách Sạn Mới</p>
                            </div>
                        </div>

                        {/* Danh Sách Khách Sạn */}
                        {hotels.map((hotel) => (
                            <div key={hotel.id} className="hotel-card" onClick={() => openRoomsTab(hotel)}>
                                <img src={hotel.image[0]} alt={`${hotel.name}`} className="hotel-image" />
                                <div className="hotel-info">
                                    <h3>{hotel.name}</h3>
                                    <p><strong>Địa Điểm:</strong> {hotel.location.address}</p>
                                    <p><strong>Mô Tả:</strong> {hotel.description}</p>
                                    <p>
                                        <strong>Trạng Thái:</strong> 
                                        <span className={`status-badge ${hotel.status === 'active' ? 'active' : hotel.status === 'pending' ? 'pending' : 'locked'}`}>
                                            {hotel.status === 'active' ? 'Đang hoạt động' : hotel.status === 'pending' ? 'Đang được duyệt' : 'Đã khóa'}
                                        </span>
                                    </p>
                                </div>
                                {/* Nút Ba Chấm */}
                                <div className="hotel-actions">
                                    <FaEllipsisV 
                                        className="actions-icon" 
                                        onClick={(e) => { 
                                            e.stopPropagation(); // Ngăn sự kiện click lên card
                                            openPopup('menu', hotel);
                                        }} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Popup Cho Các Tùy Chọn Menu */}
                    {showPopup && action === 'add' && (
                        <HotelActionPopup 
                            action="add" 
                            hotel={null} 
                            onClose={closePopup} 
                            onSubmit={handleSubmit} 
                        />
                    )}

                    {showPopup && action === 'edit' && selectedHotel && (
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

                    {showPopup && action === 'view' && selectedHotel && (
                        <HotelActionPopup 
                            action="view" 
                            hotel={selectedHotel} 
                            onClose={closePopup} 
                            onSubmit={() => {}} // Không cần submit khi xem
                        />
                    )}

                    {showPopup && action === 'menu' && selectedHotel && (
                        <div className="popup menu-popup">
                            <div className="popup-content menu-popup-content">
                                <FaTimes className="close-popup" onClick={closePopup} />
                                <div className="menu-options">
                                    <button onClick={() => { closePopup(); openPopup('lock', selectedHotel); }}>
                                        Khóa Khách Sạn
                                    </button>
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
                // Hiển thị tab Rooms
                <Rooms hotel={selectedHotel} onBack={closeRoomsTab} />
            )}
        </div>
    );
};

export default Hotels;

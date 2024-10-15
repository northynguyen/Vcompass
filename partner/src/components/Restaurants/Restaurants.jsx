// src/components/Restaurants/Restaurants.js
import  { useState } from 'react';
import './Restaurants.css';
import { FaPlus, FaTimes } from 'react-icons/fa';
import RestaurantActionPopup from './RestaurantActionPopup/RestaurantActionPopup ';
import RestaurantCard from './RestaurantCard/RestaurantCard';
import RestaurantDetail from './RestaurantDetail/RestaurantDetail';

const Restaurants = () => {
    const restaurantData = [{
        id: 1,
        name: "Quán Ăn Ngon",
        description: "Quán ăn phục vụ các món ngon truyền thống.",
        location: {
            address: "123 Đường ABC, Thành phố XYZ",
            latitude: 10.7769,
            longitude: 106.6956,
        },
        status: "active",
        newImages: [
            "https://example.com/image1.jpg",
            "https://example.com/image2.jpg",
        ],
        menuImages: [
            "https://example.com/menu1.jpg",
            "https://example.com/menu2.jpg",
        ],
        amenities: ["Free Wi-Fi", "Outdoor seating"],
        contactNumber: "0123 456 789",
        email: "quananngon@example.com",
        operatingHours: [
            {
                startDay: "Mon",
                endDay: "Sun",
                openTime: "10:00",
                closeTime: "22:00",
            }
        ],
    },
    {
        id: 2,
        name: "The Delicious Bistro",
        description: "A cozy spot with delicious meals and a great ambiance.",
        contactNumber: "123-456-7890",
        email: "contact@bistro.com",
        status: "active",
        location: {
            address: "123 Gourmet St, Foodie City",
            latitude: 10.849735,            
            longitude: 106.769845 ,
        },
        amenities: ["Free Wi-Fi", "Outdoor seating"],
        operatingHours: [
            {
                startDay: "Mon",
                endDay: "Sun",
                openTime: "10:00",
                closeTime: "22:00",
            }
        ],
        newImages: [
            "https://via.placeholder.com/150?text=Image+1",
            "https://via.placeholder.com/150?text=Image+2",
            "https://via.placeholder.com/150?text=Image+3"
        ],
        menuImages: [
            "https://via.placeholder.com/150?text=Menu+1",
            "https://via.placeholder.com/150?text=Menu+2",
        ],}];
    
    
    const [restaurants, setRestaurants] = useState(restaurantData);
    const [showPopup, setShowPopup] = useState(false);
    const [action, setAction] = useState(''); // 'add', 'edit', 'lock', 'view', 'menu'
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [selectedTab, setSelectedTab] = useState(null); // 'rooms'

    const openPopup = (actionType, restaurant = null) => {
        setAction(actionType);
        setSelectedRestaurant(restaurant);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setAction('');
        setSelectedRestaurant(null);
    };

    const handleSubmit = (formData) => {
        if (action === 'add') {
            const newRestaurant = {
                id: restaurants.length > 0 ? restaurants[restaurants.length - 1].id + 1 : 1,
                ...formData,
                status: 'active', // Mặc định trạng thái mới là active
            };
            setRestaurants([...restaurants, newRestaurant]);
        } else if (action === 'edit') {
            const updatedRestaurants = restaurants.map((restaurant) =>
                restaurant.id === selectedRestaurant.id ? { ...restaurant, ...formData } : restaurant
            );
            setRestaurants(updatedRestaurants);
        } else if (action === 'lock') {
            const updatedRestaurants = restaurants.map((restaurant) =>
                restaurant.id === selectedRestaurant.id ? { ...restaurant, status: 'locked' } : restaurant
            );
            setRestaurants(updatedRestaurants);
        }
    };
    const openRoomsTab = (restaurant) => {
        setSelectedRestaurant(restaurant);
        setSelectedTab('rooms');
    };

    // const closeRoomsTab = () => {
    //     setSelectedTab(null);
    //     setSelectedRestaurant(null);
    // };

    return (
        <div className="Restaurants-container">
            {/* Điều kiện hiển thị tab Rooms hoặc danh sách nhà hàng/quán nước */}
            {!selectedTab ? (
                <div className="partner-restaurants-container">
                    <h2>Danh Sách Nhà Hàng/Quán Nước</h2>
                    <div className="restaurants-list">

                        {/* Card Thêm Nhà Hàng/Quán Nước Mới */}
                        <div className="restaurant-card add-restaurant-card" onClick={ () => openRoomsTab()}>
                            <div className="add-restaurant-content">
                                <FaPlus size={50} color="#007bff" />
                                <p>Thêm Nhà Hàng/Quán Nước Mới</p>
                            </div>
                        </div>

                        {/* Danh Sách Nhà Hàng/Quán Nước */}
                        {restaurants.map((restaurant) => (
                            <RestaurantCard 
                                key={restaurant.id} 
                                restaurant={restaurant} 
                                onMenuClick={(restaurant) => openPopup('menu', restaurant)} 
                                onCardClick={() => openRoomsTab(restaurant)}
                            />
                        ))}
                    </div>

                    {/* Popup Cho Các Tùy Chọn Menu */}
                    {showPopup && action === 'add' && (
                        <RestaurantActionPopup 
                            action="add" 
                            restaurant={null} 
                            isOpen={showPopup}
                            onClose={closePopup} 
                            onSubmit={handleSubmit} 
                        />
                    )}

                    {showPopup && action === 'edit' && selectedRestaurant && (
                        <RestaurantActionPopup 
                            action="edit" 
                            restaurant={selectedRestaurant} 
                            isOpen={showPopup}
                            onClose={closePopup} 
                            onSubmit={handleSubmit} 
                        />
                    )}

                    {showPopup && action === 'lock' && selectedRestaurant && (
                        <RestaurantActionPopup 
                            action="lock" 
                            restaurant={selectedRestaurant} 
                            isOpen={showPopup}
                            onClose={closePopup} 
                            onSubmit={handleSubmit} 
                        />
                    )}

                    {showPopup && action === 'view' && selectedRestaurant && (
                        <RestaurantActionPopup 
                            action="view" 
                            restaurant={selectedRestaurant} 
                            isOpen={showPopup}
                            onClose={closePopup} 
                            onSubmit={() => {}} // Không cần submit khi xem
                        />
                    )}

                    {showPopup && action === 'menu' && selectedRestaurant && (
                        <div className="popup menu-popup">
                            <div className="popup-content menu-popup-content">
                                <FaTimes className="close-popup" onClick={closePopup} />
                                <div className="menu-options">
                                    {selectedRestaurant.status !== 'locked' && (
                                        <button onClick={() => { closePopup(); openPopup('lock', selectedRestaurant); }}>
                                            Khóa Nhà Hàng/Quán Nước
                                        </button>
                                    )}
                                    <button onClick={() => { closePopup(); openPopup('edit', selectedRestaurant); }}>
                                        Chỉnh Sửa
                                    </button>
                                    <button onClick={() => { closePopup(); openPopup('view', selectedRestaurant); }}>
                                        Xem Chi Tiết
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <RestaurantDetail RestaurantData={selectedRestaurant} onBack={() => setSelectedTab(null)}></RestaurantDetail>
            )}

        </div>
    );
};

export default Restaurants;

// src/components/Restaurants/Restaurants.js
import { useState } from 'react';
import './Restaurants.css';
import { FaPlus, FaTimes } from 'react-icons/fa';
import RestaurantActionPopup from './RestaurantActionPopup/RestaurantActionPopup ';
import RestaurantCard from './RestaurantCard/RestaurantCard';
import RestaurantDetail from './RestaurantDetail/RestaurantDetail';

const Restaurants = () => {
    const restaurantData = [{
        idFoodService: "1",
        idPartner: "partner1",
        serviceType: "restaurant",
        foodServiceName: "Quán Ăn Ngon",
        description: "Quán ăn phục vụ các món ngon truyền thống.",
        location: {
            address: "123 Đường ABC, Thành phố XYZ",
            latitude: 10.7769,
            longitude: 106.6956,
        },
        city: "Thành phố XYZ",
        price: {
            maxPrice: 200000,
            minPrice: 50000,
        },
        images: [
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
        status: "active",
    },
    {
        idFoodService: "2",
        idPartner: "partner2",
        serviceType: "restaurant",
        foodServiceName: "The Delicious Bistro",
        description: "A cozy spot with delicious meals and a great ambiance.",
        location: {
            address: "123 Gourmet St, Foodie City",
            latitude: 10.849735,
            longitude: 106.769845,
        },
        city: "Foodie City",
        price: {
            maxPrice: 300000,
            minPrice: 70000,
        },
        images: [
            "https://via.placeholder.com/150?text=Image+1",
            "https://via.placeholder.com/150?text=Image+2",
            "https://via.placeholder.com/150?text=Image+3"
        ],
        menuImages: [
            "https://via.placeholder.com/150?text=Menu+1",
            "https://via.placeholder.com/150?text=Menu+2",
        ],
        amenities: ["Free Wi-Fi", "Outdoor seating"],
        contactNumber: "123-456-7890",
        email: "contact@bistro.com",
        operatingHours: [
            {
                startDay: "Mon",
                endDay: "Sun",
                openTime: "10:00",
                closeTime: "22:00",
            }
        ],
        status: "active",
    }];

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
       
         if (action === 'lock') {
            const updatedRestaurants = restaurants.map((restaurant) =>
                restaurant.idFoodService === selectedRestaurant.idFoodService ? { ...restaurant, status: 'locked' } : restaurant
            );
            setRestaurants(updatedRestaurants);
        }
        else if (action === 'unlock') { // Add unlock logic
            const updatedRestaurants = restaurants.map((restaurant) =>
                restaurant.idFoodService === selectedRestaurant.idFoodService ? { ...restaurant, status: 'active' } : restaurant
            );
            setRestaurants(updatedRestaurants);
        }
    };

    const openRoomsTab = (restaurant) => {
        setSelectedRestaurant(restaurant);
        setSelectedTab('rooms');
    };

    return (
        <div className="Restaurants-container">
            {!selectedTab ? (
                <div className="partner-restaurants-container">
                    <h2>Danh Sách Nhà Hàng/Quán Nước</h2>
                    <div className="restaurants-list">
                        <div className="restaurant-card add-restaurant-card" onClick={() => openRoomsTab(null)}>
                            <div className="add-restaurant-content">
                                <FaPlus size={50} color="#007bff" />
                                <p>Thêm Nhà Hàng/Quán Nước Mới</p>
                            </div>
                        </div>

                        {restaurants.map((restaurant) => (
                            <RestaurantCard 
                                key={restaurant.idFoodService} 
                                restaurant={restaurant} 
                                onMenuClick={() => openPopup('menu', restaurant)} 
                                onCardClick={() => openRoomsTab(restaurant)}
                            />
                        ))}
                    </div>

                    {showPopup && action === 'lock' && selectedRestaurant && (
                        <RestaurantActionPopup 
                            action="lock" 
                            restaurant={selectedRestaurant} 
                            isOpen={showPopup}
                            onClose={closePopup} 
                            onSubmit={handleSubmit} 
                        />
                    )}

                    {showPopup && action === 'unlock' && selectedRestaurant && (
                        <RestaurantActionPopup 
                            action="unlock" 
                            restaurant={selectedRestaurant} 
                            isOpen={showPopup}
                            onClose={closePopup} 
                            onSubmit={() => {handleSubmit();}} // No submit needed for view
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
                                     {selectedRestaurant.status !== 'active' && (
                                        <button onClick={() => { closePopup(); openPopup('unlock', selectedRestaurant); }}>
                                            Mở Nhà Hàng/Quán Nước
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
                <RestaurantDetail RestaurantData={selectedRestaurant} onBack={() => setSelectedTab(null)} />
            )}
        </div>
    );
};

export default Restaurants;

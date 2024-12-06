import { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import './Restaurants.css';
import { FaPlus, FaTimes } from 'react-icons/fa';
import axios from 'axios'; // Import axios
import RestaurantCard from './RestaurantCard/RestaurantCard';
import RestaurantDetail from './RestaurantDetail/RestaurantDetail';
import RestaurantActionPopup from './RestaurantActionPopup/RestaurantActionPopup';
import { toast } from 'react-toastify';

const Restaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [action, setAction] = useState(''); // 'add', 'edit', 'lock', 'view', 'menu'
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [selectedTab, setSelectedTab] = useState(null); // 'rooms'
    const { url, token, user  } = useContext(StoreContext);

    const fetchRestaurants = async () => {
        try {
            const response = await axios.get(`${url}/api/foodServices/partner/${user._id}`, 
                { headers: { token } }
            );
            if (response.data.success)
            {
                console.log(response.data);
                setRestaurants(response.data.foodService); // Assuming the response data contains the restaurant array
            }
            else
            {
                console.error(response.data.message);
            }
           

        } catch (error) {
            console.error('Error fetching restaurant data:', error);
        }
    };

    useEffect(() => {
        fetchRestaurants();
    }, [token, url]); 
    

    const openPopup = (actionType, restaurant = null) => {
        console.log("restaurant", restaurant);
        setAction(actionType);
        setSelectedRestaurant(restaurant);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setAction('');
        setSelectedRestaurant(null);
    };

    const handleSubmit = async () => {
        // Initialize loading state
        try {
            // Prepare the updated data object
            const updateData = {
                ...selectedRestaurant,
                status: action === 'lock' ? 'unActive' : 'active',
            };
    
            // Prepare FormData payload
            const dataToSend = new FormData();
            dataToSend.append('foodServiceData', JSON.stringify(updateData));
            dataToSend.append('Id', selectedRestaurant._id);
            // Send the POST request
            const response = await axios.post(
                `${url}/api/foodServices/update`,
                dataToSend,
                { headers: { token } }
            );
    
            // Handle the response
            if (response.data.success) {
                toast.success(response.data.message || 'Operation successful!');
                fetchRestaurants(); // Refresh the restaurant list
} else {
                toast.error(response.data.message || 'Operation failed!');
            }
        } catch (error) {
            // Handle errors
            const errorMsg =
                action === 'lock' ? 'Error locking restaurant.' : 'Error unlocking restaurant.';
            console.error(errorMsg, error);
    
            // Check for specific server error messages
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error(errorMsg);
            }
        } finally {

            // Reset the loading state
            setShowPopup(false);
            setAction('');}
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

                        {restaurants.length > 0 ? (
                            restaurants.map((restaurant, index) => (
                                <RestaurantCard
                                    key={index}
                                    restaurant={restaurant}
                                    onMenuClick={() => openPopup('menu', restaurant)}
                                    onCardClick={() => openRoomsTab(restaurant)}
                                    url={url}
                                />
                            ))
                        ) : (
                            <p></p>
                        )}
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
onSubmit={() => { handleSubmit(); }} 
                        />
                    )}

                    {showPopup && action === 'menu' && selectedRestaurant && (
                        <div className="popup menu-popup">
                            <div className="popup-content menu-popup-content">
                                <FaTimes className="close-popup" onClick={closePopup} />
                                <div className="menu-options">
                                    {selectedRestaurant.status !== 'unActive' && selectedRestaurant.status !== 'block' &&  (
                                        <button onClick={() => { closePopup(); openPopup('lock', selectedRestaurant); }}>
                                            Khóa Nhà Hàng/Quán Nước
                                        </button>
                                    )}
                                    {selectedRestaurant.status !== 'active' && selectedRestaurant.status !== 'block' && (
                                        <button onClick={() => { closePopup(); openPopup('unlock', selectedRestaurant); }}>
                                            Mở Nhà Hàng/Quán Nước
                                        </button>
                                    )}
                                    <button onClick={() => openRoomsTab(selectedRestaurant)}>
                                        Chỉnh Sửa
                                    </button>
                                    <button onClick={() => openRoomsTab(selectedRestaurant)}>
                                        Xem Chi Tiết
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <RestaurantDetail RestaurantData={selectedRestaurant} onBack={() => { setSelectedTab(null); fetchRestaurants(); }} />
            )}
        </div>
    );
};

export default Restaurants;
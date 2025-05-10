import axios from 'axios'; // Import axios
import { useContext, useEffect, useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { StoreContext } from '../../Context/StoreContext';
import RestaurantActionPopup from './RestaurantActionPopup/RestaurantActionPopup';
import RestaurantCard from './RestaurantCard/RestaurantCard';
import RestaurantDetail from './RestaurantDetail/RestaurantDetail';
import './Restaurants.css';

const Restaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [action, setAction] = useState(''); // 'add', 'edit', 'lock', 'view', 'menu'
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [selectedTab, setSelectedTab] = useState(null); // 'rooms'
    const { url, token, user } = useContext(StoreContext);

    const fetchRestaurants = async () => {
        try {
            const response = await axios.get(`${url}/api/foodServices/partner/${user._id}`,
                { headers: { token } }
            );
            if (response.data.success) {
                console.log(response.data);
                setRestaurants(response.data.foodService); // Assuming the response data contains the restaurant array
            }
            else {
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
            setAction('');
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
                    <h2 className='main-title'>Dịch vụ ăn uống</h2>
                    <div className="add-restaurant-card" onClick={() => openRoomsTab(null)}>
                        <FaPlus size={25} color="#184b7f" />
                        <p>Thêm mới</p>
                    </div>
                    <div className="restaurants-list">
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
                                    {selectedRestaurant.status !== 'unActive' && selectedRestaurant.status !== 'block' && (
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
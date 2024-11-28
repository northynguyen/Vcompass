import React, { useState, useEffect, useContext } from 'react';
import './FoodServiceCard.css';
import { StoreContext } from '../../Context/StoreContext';
import FoodServiceDetailsPopup from '../FoodServiceDetails/FoodServiceDetailsPopup';

const FoodServiceCard = ({ partnerId, onStatusChange }) => {
    const [foodServices, setFoodServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFoodService, setSelectedFoodService] = useState(null);
    const { url } = useContext(StoreContext);

    const handleStatusChange = (id, status) => {
        const updatedFoodService = foodServices.find((service) => service._id === id);
        if (updatedFoodService) {
            onStatusChange({ ...updatedFoodService, status });
        }
    };

    const handleCardClick = (service) => {
        setSelectedFoodService(service);
    };

    const handleClosePopup = () => {
        setSelectedFoodService(null);
    };

    useEffect(() => {
        const fetchFoodServices = async () => {
            try {
                const response = await fetch(`${url}/api/foodservices/${partnerId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch food services');
                }
                const data = await response.json();
                if (data.success) {
                    setFoodServices(data.foodServices);
                } else {
                    throw new Error('Failed to load food services');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (partnerId) {
            fetchFoodServices();
        }
    }, [partnerId, url]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (foodServices.length === 0) return <p>No food services available.</p>;

    return (
        <div className="food-services">
            {foodServices.map((service) => (
                <div
                    className="horizontal-card"
                    key={service._id}

                >
                    <div className="card-image" onClick={() => handleCardClick(service)}>
                        <img src={`${url}/images/${service.images[0] || 'placeholder.jpg'}`} alt={service.foodServiceName} />
                    </div>
                    <div className="card-content">
                        <h3 onClick={() => handleCardClick(service)}>{service.foodServiceName}</h3>
                        <p><strong>Phone:</strong> {service.contactNumber}</p>
                        <p><strong>Address:</strong> {service.location.address}</p>
                    </div>
                    <div className="card-actions">
                        <select
                            className="status-select"
                            defaultValue={service.status}
                            onChange={(e) => handleStatusChange(service._id, e.target.value)}
                        >
                            <option value="active">Hoạt động</option>
                            <option value="unActive" disabled>Không hoạt động</option>
                            <option value="block">Khóa</option>
                            <option value="pending" disabled>Đang chờ duyệt</option>
                        </select>
                    </div>
                </div>
            ))}
            {selectedFoodService && (
                <FoodServiceDetailsPopup
                    foodService={selectedFoodService}
                    onClose={handleClosePopup}
                />
            )}
        </div>
    );
};

export default FoodServiceCard;
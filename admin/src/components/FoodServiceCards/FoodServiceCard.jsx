import React, { useState, useEffect, useContext } from 'react';
import './FoodServiceCard.css';
import { StoreContext } from '../../Context/StoreContext';
import FoodServiceDetailsPopup from '../FoodServiceDetails/FoodServiceDetailsPopup';

const FoodServiceCard = ({ partnerId, onStatusChange, foodServiceList }) => {
    const [foodServices, setFoodServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFoodService, setSelectedFoodService] = useState(null);
    const { url, getImageUrl } = useContext(StoreContext);

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
        if (foodServiceList){
            setFoodServices(foodServiceList)
            setLoading(false);
        }
        const fetchFoodServices = async () => {
            try {
                const response = await fetch(`${url}/api/foodservices/partner/${partnerId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch food services');
                }
                const data = await response.json();
                if (data.success) {
                    setFoodServices(data.foodService);
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

    if (loading) return <p>Đang lấy dữ liệu...</p>;
    if (error) return <p>Error: {error}</p>;
    if (foodServices.length === 0) return <p>Chưa có dịch vụ ăn uống nào</p>;

    return (
        <div className="food-services">
            {foodServices.map((service) => (
                <div
                    className="horizontal-card"
                    key={service._id}

                >
                    <div className="card-image" onClick={() => handleCardClick(service)}>
                        <img src={getImageUrl(service.images[0])} alt={service.foodServiceName} />
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
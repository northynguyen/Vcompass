import React, { useState, useEffect, useContext } from 'react';
import './AccomodationCards.css';
import { StoreContext } from '../../Context/StoreContext';
import AccomodationDetailsPopup from '../AccomodationDetails/AccomodationDetailsPopup';

const AccomodationCards = ({ partnerId, onStatusChange, accomList }) => {
    const [accommodations, setAccommodations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAccommodation, setSelectedAccommodation] = useState(null);
    const { url, getImageUrl } = useContext(StoreContext);

    const handleStatusChange = (id, status) => {
        const updatedAccommodation = accommodations.find((acc) => acc._id === id);
        if (updatedAccommodation) {
            onStatusChange({ ...updatedAccommodation, status });
        }
    };

    const handleCardClick = (accommodation) => {
        setSelectedAccommodation(accommodation);
    };

    const handleClosePopup = () => {
        setSelectedAccommodation(null);
    };

    useEffect(() => {
        if (accomList){
            setAccommodations(accomList);
            setLoading(false);
        }
        const fetchAccommodations = async () => {
            try {
                const response = await fetch(`${url}/api/accommodations/${partnerId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch accommodations');
                }
                const data = await response.json();
                if (data.success) {
                    setAccommodations(data.accommodations);
                } else {
                    throw new Error('Failed to load accommodations');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (partnerId) {
            fetchAccommodations();
        }
    }, [partnerId, url]);

    if (loading) return <p>Đang lấy dữ liệu...</p>;
    if (error) return <p>Error: {error}</p>;
    if (accommodations.length === 0) return <p>Chưa có chỗ ở nào.</p>;

    return (
        <div className="accommodations">
            {accommodations.map((accommodation) => (
                <div
                    className="horizontal-card"
                    key={accommodation._id}
                // Add click handler
                >
                    <div className="card-image" onClick={() => handleCardClick(accommodation)}>
                        <img src={getImageUrl(accommodation)} alt={accommodation.name} />
                    </div>
                    <div className="card-content">
                        <h3 onClick={() => handleCardClick(accommodation)}>{accommodation.name}</h3>
                        <p><strong>City:</strong> {accommodation.city}</p>
                        <p><strong>Address:</strong> {accommodation.location.address}</p>
                    </div>
                    <div className="card-actions">
                        <select
                            className="status-select"
                            defaultValue={accommodation.status}
                            onChange={(e) => handleStatusChange(accommodation._id, e.target.value)}
                        >
                            <option value="active">Hoạt động</option>
                            <option value="unActive" disabled>Không hoạt động</option>
                            <option value="block">Khóa</option>
                            <option value="pending" disabled>Đang chờ duyệt</option>
                        </select>
                    </div>
                </div>
            ))}
            {selectedAccommodation && (
                <AccomodationDetailsPopup
                    accommodation={selectedAccommodation}
                    onClose={handleClosePopup}
                />
            )}


        </div>
    );
};

export default AccomodationCards;

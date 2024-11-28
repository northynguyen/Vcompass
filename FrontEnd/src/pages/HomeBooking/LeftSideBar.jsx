import React, { useState } from 'react';
import './LeftSideBar.css';

const LeftSideBar = ({ onFilterChange }) => {
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortOrder, setSortOrder] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [roomSize, setRoomSize] = useState('');
    const [rating, setRating] = useState('');

    const amenities = ["WiFi", "Pool", "Parking", "Gym"];

    const handleCheckboxChange = (event, type) => {
        const { value, checked } = event.target;

        if (type === 'amenities') {
            const updatedAmenities = checked
                ? [...selectedAmenities, value]
                : selectedAmenities.filter(item => item !== value);
            setSelectedAmenities(updatedAmenities);
            onFilterChange({ type, value: updatedAmenities });
        } else if (type === 'roomSize' || type === 'rating') {
            setRoomSize(type === 'roomSize' ? value : roomSize);
            setRating(type === 'rating' ? value : rating);
            onFilterChange({ type, value });
        }
    };

    const handlePriceChange = (event) => {
        const { name, value } = event.target;
        const updatedPriceRange = { ...priceRange, [name]: value };
        setPriceRange(updatedPriceRange);
        onFilterChange({ type: 'priceRange', value: updatedPriceRange });
    };

    const handleSortOrderChange = (event) => {
        const value = event.target.value;
        setSortOrder(value);
        onFilterChange({ type: 'sortOrder', value });
    };

    return (
        <div className="left-sidebar">
            <h2>Chọn lọc theo:</h2>

            <div className="filter-section">
                <h3>Khoảng giá</h3>
                <input
                    type="number"
                    name="min"
                    placeholder="Giá thấp nhất"
                    value={priceRange.min}
                    onChange={handlePriceChange}
                />
                <input
                    type="number"
                    name="max"
                    placeholder="Giá cao nhất"
                    value={priceRange.max}
                    onChange={handlePriceChange}
                />
            </div>

            <div className="filter-section">
                <h3>Sắp xếp theo</h3>
                <label>
                    <input
                        type="radio"
                        name="sortOrder"
                        value="asc"
                        checked={sortOrder === 'asc'}
                        onChange={handleSortOrderChange}
                    />
                    Giá thấp đến cao
                </label>
                <label>
                    <input
                        type="radio"
                        name="sortOrder"
                        value="desc"
                        checked={sortOrder === 'desc'}
                        onChange={handleSortOrderChange}
                    />
                    Giá cao đến thấp
                </label>
            </div>

            <div className="filter-section">
                <h3>Tiện nghi</h3>
                {amenities.map((amenity, index) => (
                    <label key={index}>
                        <input
                            type="checkbox"
                            value={amenity}
                            checked={selectedAmenities.includes(amenity)}
                            onChange={(e) => handleCheckboxChange(e, 'amenities')}
                        />
                        {amenity}
                    </label>
                ))}
            </div>

            <div className="filter-section">
                <h3>Kích thước phòng</h3>
                <label>
                    <input
                        type="radio"
                        name="roomSize"
                        value="0-40"
                        checked={roomSize === '0-40'}
                        onChange={(e) => handleCheckboxChange(e, 'roomSize')}
                    />
                    0 - 40 m²
                </label>
                <label>
                    <input
                        type="radio"
                        name="roomSize"
                        value="40-60"
                        checked={roomSize === '40-60'}
                        onChange={(e) => handleCheckboxChange(e, 'roomSize')}
                    />
                    40 - 60 m²
                </label>
                <label>
                    <input
                        type="radio"
                        name="roomSize"
                        value="60+"
                        checked={roomSize === '60+'}
                        onChange={(e) => handleCheckboxChange(e, 'roomSize')}
                    />
                    Trên 60 m²
                </label>
            </div>

            <div className="filter-section">
                <h3>Xếp hạng</h3>
                <label>
                    <input
                        type="radio"
                        name="rating"
                        value="3"
                        checked={rating === '3'}
                        onChange={(e) => handleCheckboxChange(e, 'rating')}
                    />
                    Trên 3 sao
                </label>
                <label>
                    <input
                        type="radio"
                        name="rating"
                        value="4"
                        checked={rating === '4'}
                        onChange={(e) => handleCheckboxChange(e, 'rating')}
                    />
                    Trên 4 sao
                </label>
            </div>
        </div>
    );
};

export default LeftSideBar;

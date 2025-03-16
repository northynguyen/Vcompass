import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import './LeftSideBar.css';
import { Range } from 'react-range';
import { FaFilter } from "react-icons/fa";
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';

const LeftSideBar = ({ onFilterChange = () => { } }) => {
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 700000 });
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [rating, setRating] = useState('');
    const [amenities, setAmenities] = useState([]);
    const { url } = useContext(StoreContext);
    const groupedAmenities = amenities.reduce((acc, amenity) => {
        if (!acc[amenity.category]) {
            acc[amenity.category] = [];
        }
        acc[amenity.category].push(amenity);
        return acc;
    }, {});
    // Lấy danh sách amenities từ API
    useEffect(() => {
        axios.get(`${url}/api/extensions?limit=0`)
            .then(response => {
                if (response.data.success) {
                    setAmenities(response.data.extensions);
                }
            })
            .catch(error => console.error('Error fetching amenities:', error));
    }, []);

    // Gọi API khi bất kỳ filter nào thay đổi
    useEffect(() => {
        onFilterChange({ priceRange, selectedAmenities, rating });
    }, [priceRange, selectedAmenities, rating]);

    // Xử lý tick/bỏ tick tiện ích
    const handleCheckboxChange = (event, type) => {
        const { value, checked } = event.target;

        if (type === 'amenities') {
            setSelectedAmenities(prev => {
                const updated = checked ? [...prev, value] : prev.filter(item => item !== value);
                return updated;
            });
        } else if (type === 'rating') {
            setRating(checked ? value : '');
        }
    };

    // Xử lý thay đổi giá tiền
    const handlePriceChange = (values) => {
        setPriceRange({ min: values[0], max: values[1] });
    };

    // Xử lý nhập liệu trực tiếp vào input giá tiền
    const handleInputChange = (e, type) => {
        const value = parseInt(e.target.value, 10) || 0;
        setPriceRange((prev) => ({
            ...prev,
            [type]: Math.min(Math.max(0, value), 700000),
        }));
    };

    return (
        <div className="left-sidebar">
            <div className="filter-header">
                <h2>Chọn lọc theo:</h2>
                <FaFilter className="filter-icon" onClick={() => setIsFilterVisible(!isFilterVisible)} />
            </div>
            <div className={`filter-content ${isFilterVisible ? "show" : "hide"}`}>
                <h3>Khoảng giá</h3>
                <div className="price-filter-container">
                    <div className="price-inputs">
                        <input
                            type="number"
                            value={priceRange.min}
                            onChange={(e) => handleInputChange(e, "min")}
                            min="0"
                            max="700000"
                        />
                        <span>-</span>
                        <input
                            type="number"
                            value={priceRange.max}
                            onChange={(e) => handleInputChange(e, "max")}
                            min="0"
                            max="700000"
                        />
                    </div>
                    <Range
                        values={[priceRange.min, priceRange.max]}
                        step={1000}
                        min={0}
                        max={700000}
                        onChange={handlePriceChange}
                        renderTrack={({ props, children }) => (
                            <div {...props} className="range-track">
                                {children}
                            </div>
                        )}
                        renderThumb={({ props }) => (
                            <div {...props} className="range-thumb" />
                        )}
                    />
                </div>
                <div className="filter-section">
                    <h3>Tiện nghi</h3>
                    {Object.keys(groupedAmenities).map((category) => (
                        <div key={category} className="amenity-category">
                            <h4>{category}</h4>
                            {groupedAmenities[category].map((amenity) => (
                                <label key={amenity._id}>
                                    <input
                                        type="checkbox"
                                        value={amenity.name}
                                        checked={selectedAmenities.includes(amenity.name)}
                                        onChange={(e) => handleCheckboxChange(e, 'amenities')}
                                    />
                                    {amenity.name}
                                </label>
                            ))}
                        </div>
                    ))}
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
        </div>
    );
};

LeftSideBar.propTypes = {
    onFilterChange: PropTypes.func,
};

export default LeftSideBar;

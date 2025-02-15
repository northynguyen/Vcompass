import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './LeftSideBar.css';
import { Range } from 'react-range';
import { FaFilter } from "react-icons/fa";
const LeftSideBar = ({ onFilterChange }) => {
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 700000 });
    // const [sortOrder, setSortOrder] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    // const [roomSize, setRoomSize] = useState('');
    const [rating, setRating] = useState('');

    const amenities = {
        basicServices: [
            "Wi-Fi",
            "Bãi đậu xe",
            "Dịch vụ 24/7",
            "Két an toàn",
            "Tủ lạnh mini",
            "Truyền hình cáp và truyền hình vệ tinh"
        ],
        transportationServices: [
            "Dịch vụ đưa đón sân bay",
            "Dịch vụ đặt vé",
            "Dịch vụ hỗ trợ khách hàng",
            "Dịch vụ giặt ủi",
        ],
        roomAndDiningServices: [
            "Dịch vụ phòng",
            "Nhà hàng và quầy bar",
            "Phục vụ ăn sáng",

        ],
        recreationalAmenities: [
            "Hồ bơi",
            "Khu vui chơi trẻ em",
            "Công viên và khu vườn",
            "Trung tâm thể dục thể thao",
            "Dịch vụ spa và massage"
        ],
        businessAndEventServices: [
            "Phòng hội nghị",
            "Tổ chức tour du lịch"
        ],

    };


    const logAndCallOnFilterChange = () => {
        // Tạo đối tượng dữ liệu lọc đầy đủ và gọi onFilterChange ngay lập tức
        const filters = {
            priceRange,
            // sortOrder,
            selectedAmenities,
            // roomSize,
            rating,
        };
        onFilterChange?.(filters);
    };
    useEffect(() => {
        const filters = {
            priceRange,
            // sortOrder,
            selectedAmenities,
            // roomSize,
            rating,
        };
        onFilterChange?.(filters);

    }, [priceRange, selectedAmenities, rating]); // Chạy khi bất kỳ trạng thái nào thay đổi

    const handleCheckboxChange = (event, type) => {
        const { value, checked } = event.target;

        if (type === 'amenities') {
            const updatedAmenities = checked
                ? [...selectedAmenities, value]
                : selectedAmenities.filter(item => item !== value);
            setSelectedAmenities(updatedAmenities);
            logAndCallOnFilterChange(); // Gọi ngay khi cập nhật tiện nghi

            // }else if (type === 'roomSize') {
            //     setRoomSize(value);
            //     logAndCallOnFilterChange(); // Gọi ngay khi chọn kích thước phòng
        } else if (type === 'rating') {
            setRating(value);
            logAndCallOnFilterChange(); // Gọi ngay khi chọn xếp hạng
        }
    };

    // const handleSortOrderChange = (event) => {
    //     const value = event.target.value;
    //     setSortOrder(value);
    //     logAndCallOnFilterChange(); // Gọi ngay khi chọn thứ tự sắp xếp
    // };

    const handlePriceChange = (values) => {
        const [newMin, newMax] = values;
        setPriceRange({
            min: Math.max(0, Math.min(700000, newMin)),
            max: Math.max(0, Math.min(700000, newMax)),
        });
        logAndCallOnFilterChange(); // Gọi ngay khi thay đổi khoảng giá
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const numericValue = Math.max(0, Math.min(700000, Number(value)));
        setPriceRange((prev) => ({
            ...prev,
            [name]: numericValue,
        }));
        logAndCallOnFilterChange(); // Gọi ngay khi thay đổi giá thủ công
    };
    const getCategoryName = (key) => {
        const categoryNames = {
            basicServices: "Dịch vụ cơ bản",
            transportationServices: "Dịch vụ vận chuyển",
            roomAndDiningServices: "Dịch vụ phòng và ăn uống",
            recreationalAmenities: "Tiện ích giải trí",
            businessAndEventServices: "Dịch vụ kinh doanh và sự kiện",
        };
        return categoryNames[key] || key;
    };
    return (
        <div className="left-sidebar">
            <div className="filter-header">
                <h2>Chọn lọc theo:</h2>
                <FaFilter className="filter-icon" onClick={() => setIsFilterVisible(!isFilterVisible)} />
            </div>
            <div className={`filter-content ${isFilterVisible ? "show" : "hide"}`}>
                <h3>Khoảng giá</h3>
                <div className="price-range-slider">
                    <Range
                        values={[priceRange.min, priceRange.max]}
                        step={1000}
                        min={0}
                        max={700000}
                        onChange={handlePriceChange}
                        renderTrack={({ props, children }) => (
                            <div
                                {...props}
                                style={{
                                    ...props.style,
                                    height: '6px',
                                    width: '100%',
                                    backgroundColor: '#ddd',
                                    margin: '15px 0',
                                }}
                            >
                                {children}
                            </div>
                        )}
                        renderThumb={({ props, index }) => (
                            <div
                                {...props}
                                style={{
                                    ...props.style,
                                    height: '20px',
                                    width: '20px',
                                    borderRadius: '50%',
                                    backgroundColor: '#007BFF',
                                    cursor: 'pointer',
                                    boxShadow: '0 0 2px rgba(0, 0, 0, 0.5)',
                                }}
                            />
                        )}
                    />
                    <div className="price-range-inputs">
                        <input
                            type="number"
                            name="min"
                            value={priceRange.min}
                            onChange={handleInputChange}
                            placeholder="Giá thấp nhất"
                            className="price-input"
                        />
                        <input
                            type="number"
                            name="max"
                            value={priceRange.max}
                            onChange={handleInputChange}
                            placeholder="Giá cao nhất"
                            className="price-input"
                        />
                    </div>
                </div>

                {/* <div className="filter-section">
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
            </div> */}

                <div className="filter-section">
                    <h3>Tiện nghi</h3>
                    {Object.entries(amenities).map(([category, amenityList]) => (
                        <div key={category} className="amenity-category">
                            <h4>{getCategoryName(category)}</h4> {/* Hàm để hiển thị tên danh mục theo ý bạn */}
                            {amenityList.map((amenity, index) => (
                                <label key={amenity}>
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
                    ))}
                </div>


                {/* <div className="filter-section">
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
                <label>
                    <input
                        type="radio"
                        name="roomSize"
                        value="80+"
                        checked={roomSize === '80+'}
                        onChange={(e) => handleCheckboxChange(e, 'roomSize')}
                    />
                    Trên 80 m²
                </label>
            </div> */}

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

LeftSideBar.defaultProps = {
    onFilterChange: () => { },
};

export default LeftSideBar;

import React, { useState, useEffect, useContext } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import './HomeAttractions.css';
import AttractionsCards from './AttractionsCards';
import LeftSideBar from './LeftSideBar';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';

const HomeAttractions = () => {
    const [location, setLocation] = useState('');
    const [backupAttractions, setBackupAttractions] = useState([]);
    const [filterData, setFilterData] = useState({ priceRange: { min: 0, max: Infinity }, selectedAmenities: [], rating: 0 });
    const [attractionsFound, setAttractionsFound] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const { url } = useContext(StoreContext);
    // Xử lý khi bộ lọc thay đổi
    const handleFilterChange = (newFilterData) => {
        setFilterData((prevData) => ({ ...prevData, ...newFilterData }));
    };

    useEffect(() => {
        const fetchAttractions = async () => {
            try {
                let attractions = [];
                if (isSearching && backupAttractions.length > 0) {
                    // Khi đang tìm kiếm, sử dụng dữ liệu đã backup
                    attractions = [...backupAttractions];
                } else {
                    // Nếu không tìm kiếm, gọi API để lấy dữ liệu đầy đủ
                    const response = await axios.get(`${url}/api/attractions`);
                    attractions = response.data.attractions;
                    setBackupAttractions(response.data.attractions);
                }

                const filteredAttractions = applyFilters(attractions);
                setAttractionsFound(filteredAttractions);
            } catch (error) {
                console.error("Error fetching attractions:", error);
            }
        };

        fetchAttractions();
    }, [url, filterData, isSearching]);

    // Hàm áp dụng bộ lọc
    const applyFilters = (attractions) => {
        return attractions.filter((attraction) => {
            // Lọc theo giá
            if (filterData.priceRange && (attraction.price > filterData.priceRange.max || attraction.price < filterData.priceRange.min)) {
                return false;
            }

            // Lọc theo tiện ích
            if (filterData.selectedAmenities.length > 0) {
                const hasAllSelectedAmenities = filterData.selectedAmenities.every((amenity) =>
                    attraction.amenities.includes(amenity)
                );
                if (!hasAllSelectedAmenities) return false;
            }

            // Tính điểm đánh giá trung bình
            let averageRating = null;
            if (attraction.ratings && attraction.ratings.length > 0) {
                const totalRating = attraction.ratings.reduce((sum, rating) => sum + rating.rate, 0);
                averageRating = totalRating / attraction.ratings.length;
            }

            // Lọc theo đánh giá
            if (filterData.rating && (averageRating === null || averageRating < parseFloat(filterData.rating))) {
                return false;
            }

            return true;
        });
    };

    // Hàm tìm kiếm theo địa điểm
    const handleSearch = async () => {
        setAttractionsFound([]); // Reset danh sách tạm thời
        try {
            const response = await axios.get(`${url}/api/attractions?name=${location}`);
            if (!response.data.success) {
                throw new Error("Failed to fetch attractions");
            }

            setBackupAttractions(response.data.attractions); // Lưu lại kết quả tìm kiếm vào backup
            setAttractionsFound(response.data.attractions); // Cập nhật danh sách hiển thị
            setIsSearching(true); // Đánh dấu là đang tìm kiếm
        } catch (error) {
            console.error("Error fetching attractions:", error);
        }
    };

    // Reset trạng thái tìm kiếm
    const resetSearch = () => {
        setIsSearching(false);
        setAttractionsFound(applyFilters(backupAttractions));
    };
    return (
        <div className="home-attractions-container">

            <form className="attractions-search-form" onSubmit={(e) => e.preventDefault()}>
                {/* Location Input */}
                <div className="attractions-search-item">
                    <span role="img" aria-label="location">📍</span>
                    <input
                        type="text"
                        placeholder="Bà Rịa - Vũng Tàu"
                        className="attractions-input"
                        onChange={(e) => setLocation(e.target.value)}
                        value={location}
                    />
                </div>

                {/* Search Button */}
                <button
                    type="submit"
                    className="attractions-search-btn"
                    onClick={handleSearch}
                >
                    Tìm kiếm
                </button>
            </form>

            <div className="attractions-content-container">
                <LeftSideBar onFilterChange={handleFilterChange} />
                 <AttractionsCards attractionsFound={attractionsFound} />
            </div>
        </div>

    );
};

export default HomeAttractions;

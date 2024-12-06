import React, { useState, useEffect, useContext } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import './HomeFoodService.css';
import FoodServiceCards from './FoodServiceCards';
import LeftSideBar from './LeftSideBar';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';


const HomeFoodService = () => {
    const [location, setLocation] = useState('');
    const [backupFoodServices, setBackupFoodServices] = useState([]);
    const [filterData, setFilterData] = useState({ priceRange: { min: 0, max: Infinity }, selectedAmenities: [], rating: 0 });
    const [foodServicesFound, setFoodServicesFound] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const { url } = useContext(StoreContext);
    // Xử lý khi bộ lọc thay đổi
    const handleFilterChange = (newFilterData) => {
        setFilterData((prevData) => ({ ...prevData, ...newFilterData }));
    };

    useEffect(() => {
        const fetchFoodServices = async () => {
            try {
                let foodServices = [];
                if (isSearching && backupFoodServices.length > 0) {
                    // Khi đang tìm kiếm, sử dụng dữ liệu đã backup
                    foodServices = [...backupFoodServices];
                } else {
                    // Nếu không tìm kiếm, gọi API để lấy dữ liệu đầy đủ
                    const response = await axios.get(`${url}/api/foodservices`);
                    foodServices = response.data.foodService;
                    setBackupFoodServices(response.data.foodService);
                }

                const filteredFoodServices = applyFilters(foodServices);
                setFoodServicesFound(filteredFoodServices);
            } catch (error) {
                console.error("Error fetching Food Services:", error);
            }
        };

        fetchFoodServices();
    }, [url, filterData, isSearching]);

    // Hàm áp dụng bộ lọc
    const applyFilters = (foodServices) => {
        return foodServices.filter((foodService) => {


            // Lọc theo giá
            if (filterData.priceRange && (foodService.price.minPrice < filterData.priceRange.min || foodService.price.maxPrice > filterData.priceRange.max)) {
                return false;
            }

            // Lọc theo tiện ích
            if (filterData.selectedAmenities.length > 0) {
                const hasAllSelectedAmenities = filterData.selectedAmenities.every((amenity) =>
                    foodService.amenities.includes(amenity)
                );
                if (!hasAllSelectedAmenities) return false;
            }

            // Tính điểm đánh giá trung bình
            let averageRating = null;
            if (foodService.ratings && foodService.ratings.length > 0) {
                const totalRating = foodService.ratings.reduce((sum, rating) => sum + rating.rate, 0);
                averageRating = totalRating / foodService.ratings.length;
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
        setFoodServicesFound([]); // Reset danh sách tạm thời
        try {
            const response = await axios.get(`${url}/api/foodservices?name=${location}`);
            if (!response.data.success) {
                throw new Error("Failed to fetch foodServices");
            }

            setBackupFoodServices(response.data.foodService); // Lưu lại kết quả tìm kiếm vào backup
            setFoodServicesFound(response.data.foodService); // Cập nhật danh sách hiển thị
            setIsSearching(true); // Đánh dấu là đang tìm kiếm
        } catch (error) {
            console.error("Error fetching foodServices:", error);
        }
    };

    // Reset trạng thái tìm kiếm
    const resetSearch = () => {
        setIsSearching(false);
        setFoodServicesFound(applyFilters(backupFoodServices));
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
                {foodServicesFound.length > 0 && <FoodServiceCards foodServicesFound={foodServicesFound} />}
            </div>
        </div>

    );
};

export default HomeFoodService;

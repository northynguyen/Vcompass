import React, { useState, useEffect, useContext } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import './HomeFoodService.css';
import FoodServiceCards from './FoodServiceCards';
import LeftSideBar from './LeftSideBar';
import { StoreContext } from '../../Context/StoreContext';


const HomeFoodService = () => {
    const { url } = useContext(StoreContext);
    const [location, setLocation] = useState("");
    const [foodServicesFound, setFoodServicesFound] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchFoodServices = async (searchLocation = location, pageNum = 1, filters = {}) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                keyword: searchLocation,
                page: pageNum,
                limit: 6,
                minPrice: filters.priceRange?.min || 0,
                maxPrice: filters.priceRange?.max || 700000,
                rating: filters.rating || "",
                amenities: filters.selectedAmenities?.join(",") || "",
            });
            const response = await fetch(`${url}/api/foodservices/search?${params.toString()}`);
            const data = await response.json();
            if (data.success) {
                setFoodServicesFound(data.data);
                setTotalPages(data.totalPages);
            }
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu Food Services:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFoodServices();
    }, [page]);

    const handleSearch = () => {
        setPage(1);
        fetchFoodServices(location, 1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            fetchFoodServices(location, newPage);
        }
    };

    return (
        <div className="home-attractions-container">
            <form className="attractions-search-form" onSubmit={(e) => e.preventDefault()}>
                <div className="attractions-search-item">
                    <span role="img" aria-label="location">📍</span>
                    <input
                        type="text"
                        placeholder="Cơm nghêu Vũng Tàu"
                        className="attractions-input"
                        onChange={(e) => setLocation(e.target.value)}
                        value={location}
                    />
                </div>
                <button type="submit" className="attractions-search-btn" onClick={handleSearch}>
                    Tìm kiếm
                </button>
            </form>

            <div className="attractions-content-container">
                <LeftSideBar onFilterChange={(filters) => fetchFoodServices(location, 1, filters)} />
                {loading ? <p>Đang tải...</p> : <FoodServiceCards foodServicesFound={foodServicesFound} />}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button disabled={page === 1} onClick={() => handlePageChange(page - 1)}>«</button>
                    <span>Trang {page} / {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => handlePageChange(page + 1)}>»</button>
                </div>
            )}
        </div>
    );
};

export default HomeFoodService;
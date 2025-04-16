import React, { useState, useEffect, useContext } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import './HomeFoodService.css';
import FoodServiceCards from './FoodServiceCards';
import LeftSideBar from './LeftSideBar';
import { StoreContext } from '../../Context/StoreContext';

const HomeFoodService = () => {
    const { url } = useContext(StoreContext);
    const [location, setLocation] = useState('');
    const [foodServicesFound, setFoodServicesFound] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({});

    const fetchFoodServices = async (searchLocation = location, pageNum = page, currentFilters = filters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                keyword: searchLocation,
                page: pageNum,
                limit: 6,
                minPrice: currentFilters.priceRange?.min || 0,
                maxPrice: currentFilters.priceRange?.max || 700000,
                minRating: currentFilters.rating || '',
                amenities: currentFilters.selectedAmenities?.join(',') || '',
                serviceType: currentFilters.serviceType || '',
                status: currentFilters.status || '',
            });

            const response = await fetch(`${url}/api/foodservices/search?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                setFoodServicesFound(data.data);
                setTotalPages(data.totalPages);
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu Food Services:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFoodServices(location, page, filters);
    }, [page, location, filters]);

    const handleSearch = () => {
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage); // useEffect sẽ tự động fetch
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPage(1); // reset về trang đầu
    };

    return (
        <div className="home-attractions-container">
            <form className="attractions-search-form" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
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
                <button type="submit" className="attractions-search-btn">
                    Tìm kiếm
                </button>
            </form>

            <div className="attractions-content-container">
                <LeftSideBar onFilterChange={handleFilterChange} />
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

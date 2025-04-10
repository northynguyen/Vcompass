import React, { useState, useEffect, useContext } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import './HomeAttractions.css';
import AttractionsCards from './AttractionsCards';
import LeftSideBar from './LeftSideBar';
import { StoreContext } from '../../Context/StoreContext';

const HomeAttractions = () => {
    const { url } = useContext(StoreContext);
    const [location, setLocation] = useState('');
    const [attractionsFound, setAttractionsFound] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        priceRange: { min: 0, max: 700000 },
        minRating: '',
        selectedAmenities: [],
    });

    const fetchAttractions = async (searchLocation = location, pageNum = 1, customFilters = filters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                keyword: searchLocation,
                page: pageNum,
                limit: 6,
                minPrice: customFilters.priceRange?.min || 0,
                maxPrice: customFilters.priceRange?.max || 700000,
                minRating: customFilters.minRating || '',
                amenities: customFilters.selectedAmenities?.join(',') || '',
            });

            const response = await fetch(`${url}/api/attractions/search?${params.toString()}`);
            const data = await response.json();
            if (data.success) {
                setAttractionsFound(data.data);
                setTotalPages(data.totalPages);
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu attractions:', error);
        }
        setLoading(false);
    };

    // Khi location hoặc page thay đổi, gọi lại API
    useEffect(() => {
        fetchAttractions(location, page);
    }, [location, page, filters]);

    const handleSearch = () => {
        setPage(1); // Reset lại trang đầu tiên
        // fetchAttractions sẽ được gọi tự động qua useEffect
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage); // Gọi API sẽ được tự động qua useEffect
        }
    };

    const handleFilterChange = (newFilters) => {
        setPage(1); // Reset lại trang đầu tiên
        setFilters(newFilters); // Trigger useEffect
    };

    return (
        <div className="home-attractions-container">
            {/* Form tìm kiếm */}
            <form className="attractions-search-form" onSubmit={(e) => e.preventDefault()}>
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
                <button type="submit" className="attractions-search-btn" onClick={handleSearch}>
                    Tìm kiếm
                </button>
            </form>

            {/* Danh sách attraction */}
            <div className="attractions-content-container">
                <LeftSideBar onFilterChange={handleFilterChange} />
                {loading ? <p>Đang tải...</p> : <AttractionsCards attractionsFound={attractionsFound} />}
            </div>

            {/* Phân trang */}
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

export default HomeAttractions;

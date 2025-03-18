import React, { useState, useEffect, useContext } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import './HomeAttractions.css';
import AttractionsCards from './AttractionsCards';
import LeftSideBar from './LeftSideBar';
import { StoreContext } from '../../Context/StoreContext';

const HomeAttractions = () => {
    const { url } = useContext(StoreContext);
    const [location, setLocation] = useState("");
    const [attractionsFound, setAttractionsFound] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchAttractions = async (searchLocation = location, pageNum = 1, filters = {}) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                keyword: searchLocation,
                page: pageNum,
                limit: 6,
                minPrice: filters.priceRange?.min || 0,
                maxPrice: filters.priceRange?.max || 700000,
                rating: filters.rating || '',
                amenities: filters.selectedAmenities?.join(',') || ''
            });
            const response = await fetch(`${url}/api/attractions/search?${params.toString()}`);
            const data = await response.json();
            if (data.success) {
                setAttractionsFound(data.data);
                setTotalPages(data.totalPages);
            }
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu attractions:", error);
        }
        setLoading(false);
    };


    // Gọi API khi component mount hoặc thay đổi trang
    useEffect(() => {
        fetchAttractions();
    }, [page]);

    // Xử lý khi nhấn nút tìm kiếm
    const handleSearch = () => {
        setPage(1); // Reset về trang đầu tiên khi tìm kiếm
        fetchAttractions(location, 1);
    };

    // Chuyển trang
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            fetchAttractions(location, newPage);
        }
    };
    useEffect(() => {
        if (location) { // Chỉ fetch nếu có location
            fetchAttractions(location, page);
        }
    }, [page]);

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
                <LeftSideBar onFilterChange={filters => fetchAttractions(location, 1, filters)} />
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

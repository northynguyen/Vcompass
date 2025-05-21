import { useState, useEffect, useContext } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import './HomeAttractions.css';
import AttractionsCards from './AttractionsCards';
import LeftSideBar from './LeftSideBar';
import SkeletonLoading from './SkeletonLoading';
import { StoreContext } from '../../Context/StoreContext';

// Danh sách thành phố
const cities = [
    "Hà Nội",
    "TP Hồ Chí Minh",
    "Đà Nẵng",
    "Hải Phòng",
    "Cần Thơ",
    "An Giang",
    "Bà Rịa - Vũng Tàu",
    "Bắc Giang",
    "Bắc Kạn",
    "Bạc Liêu",
    "Bắc Ninh",
    "Bến Tre",
    "Bình Dương",
    "Bình Định",
    "Bình Phước",
    "Bình Thuận",
    "Cà Mau",
    "Cao Bằng",
    "Đắk Lắk",
    "Đắk Nông",
    "Điện Biên",
    "Đồng Nai",
    "Đồng Tháp",
    "Gia Lai",
    "Hà Giang",
    "Hà Nam",
    "Hà Tĩnh",
    "Hải Dương",
    "Hậu Giang",
    "Hòa Bình",
    "Hưng Yên",
    "Khánh Hòa",
    "Kiên Giang",
    "Kon Tum",
    "Lai Châu",
    "Lâm Đồng",
    "Lạng Sơn",
    "Lào Cai",
    "Long An",
    "Nam Định",
    "Nghệ An",
    "Ninh Bình",
    "Ninh Thuận",
    "Phú Thọ",
    "Phú Yên",
    "Quảng Bình",
    "Quảng Nam",
    "Quảng Ngãi",
    "Quảng Ninh",
    "Quảng Trị",
    "Sóc Trăng",
    "Sơn La",
    "Tây Ninh",
    "Thái Bình",
    "Thái Nguyên",
    "Thanh Hóa",
    "Thừa Thiên Huế",
    "Tiền Giang",
    "Trà Vinh",
    "Tuyên Quang",
    "Vĩnh Long",
    "Vĩnh Phúc",
    "Yên Bái",
];

// Địa điểm du lịch nổi tiếng và tỉnh tương ứng
const popularCities = {
    'Đà Lạt': 'Lâm Đồng',
    'Hạ Long': 'Quảng Ninh',
    'Long Hải': 'Bà Rịa - Vũng Tàu',
    'Nha Trang': 'Khánh Hòa',
    'Phan Thiết': 'Bình Thuận',
    'Huế': 'Thừa Thiên Huế',
    'Hội An': 'Quảng Nam',
    'Sapa': 'Lào Cai',
    'Vũng Tàu': 'Bà Rịa - Vũng Tàu',
    'Đồng Hới': 'Quảng Bình',
    'Tuy Hòa': 'Phú Yên',
    'Quy Nhơn': 'Bình Định',
    'Buôn Ma Thuột': 'Đắk Lắk',
    'Pleiku': 'Gia Lai',
    'Hà Tiên': 'Kiên Giang',
    'Phú Quốc': 'Kiên Giang',
    'Mũi Né': 'Bình Thuận',
    'Bắc Hà': 'Lào Cai',
    'Mộc Châu': 'Sơn La',
    'Mai Châu': 'Hòa Bình',
    'Tam Đảo': 'Vĩnh Phúc',
    'Ninh Bình': 'Ninh Bình',
    'Mỹ Tho': 'Tiền Giang',
    'Cần Giờ': 'TP Hồ Chí Minh',
    'Tây Ninh': 'Tây Ninh',
    'Cát Bà': 'Hải Phòng',
    'Sầm Sơn': 'Thanh Hóa',
    'Cửa Lò': 'Nghệ An',
    'Bảo Lộc': 'Lâm Đồng',
    'Hồ Tràm': 'Bà Rịa - Vũng Tàu',
    'Long Khánh': 'Đồng Nai',
    'Phan Rang': 'Ninh Thuận',
    'Cam Ranh': 'Khánh Hòa',
    'Quảng Ngãi': 'Quảng Ngãi',
    'Tam Kỳ': 'Quảng Nam',
    'Hà Giang': 'Hà Giang',
    'Cao Bằng': 'Cao Bằng',
    'Lạng Sơn': 'Lạng Sơn',
    'Móng Cái': 'Quảng Ninh',
    'Uông Bí': 'Quảng Ninh',
    'Cẩm Phả': 'Quảng Ninh',
    'Thái Nguyên': 'Thái Nguyên',
    'Việt Trì': 'Phú Thọ',
    'Lào Cai': 'Lào Cai'
};

const HomeAttractions = () => {
    const { url } = useContext(StoreContext);
    const [location, setLocation] = useState('');
    const [attractionsFound, setAttractionsFound] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        selectedAmenities: [],
    });
    const [suggestions, setSuggestions] = useState([]);

    const fetchAttractions = async (searchLocation = location, pageNum = 1, customFilters = filters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                keyword: searchLocation,
                page: pageNum,
                limit: 6,
                minPrice: customFilters.minPrice || 0,
                maxPrice: customFilters.maxPrice || 1000000,
                minRating: customFilters.minRating || '',
                amenities: customFilters.selectedAmenities?.join(',') || '',
            });

            const response = await fetch(`${url}/api/attractions/search?${params.toString()}`);
            const data = await response.json();
            if (data.success) {
                setAttractionsFound(data.data);
                console.log(data.data);
                setTotalPages(data.totalPages);
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu attractions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Khi location hoặc page thay đổi, gọi lại API
    useEffect(() => {
        fetchAttractions(location, page);
    }, [page, filters]);

    const handleSearch = () => {
        setPage(1);
        fetchAttractions(location, page);
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
                        onChange={(e) => {
                            const value = e.target.value;
                            setLocation(value);

                            // Lọc danh sách gợi ý khi người dùng nhập
                            if (value) {
                                // Lọc các thành phố thông thường
                                const filteredRegular = cities.filter(city =>
                                    city.toLowerCase().includes(value.toLowerCase())
                                );

                                // Lọc các thành phố/địa điểm du lịch nổi tiếng
                                const filteredPopular = Object.keys(popularCities).filter(city =>
                                    city.toLowerCase().includes(value.toLowerCase())
                                ).map(city => `${city}, ${popularCities[city]}`);

                                // Kết hợp cả hai kết quả
                                setSuggestions([...filteredPopular, ...filteredRegular]);
                            } else {
                                setSuggestions([]);
                                setPage(1);
                                fetchAttractions('', 1, filters);
                            }
                        }}
                        value={location}
                    />
                    {/* Hiển thị gợi ý */}
                    {suggestions.length > 0 && (
                        <ul className="suggestions-list">
                            {suggestions.map((city, index) => (
                                <li
                                    key={index}
                                    onClick={() => {
                                        // Kiểm tra nếu là định dạng "Tên thành phố, Tên tỉnh"
                                        if (city.includes(', ')) {
                                            const parts = city.split(', ');
                                            const province = parts[1];
                                            setLocation(province); // Lưu tên tỉnh làm giá trị thực tế
                                        } else {
                                            setLocation(city);
                                        }
                                        setSuggestions([]);
                                        setPage(1);
                                        fetchAttractions(city.includes(', ') ? city.split(', ')[1] : city, 1, filters);
                                    }}
                                >
                                    {city}
                                </li>
                            ))}
                        </ul>
                    )}

                </div>
                <button type="submit" className="attractions-search-btn" onClick={handleSearch}>
                    Tìm kiếm
                </button>
            </form>


            {/* Danh sách attraction */}
            <div className="attractions-content-container">
                <LeftSideBar onFilterChange={handleFilterChange} />
                {loading ? <SkeletonLoading type="điểm đến" /> : <AttractionsCards attractionsFound={attractionsFound} />}
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

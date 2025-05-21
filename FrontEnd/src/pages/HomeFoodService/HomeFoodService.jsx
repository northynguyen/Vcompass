import { useState, useEffect, useContext, useRef } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import './HomeFoodService.css';
import FoodServiceCards from './FoodServiceCards';
import LeftSideBar from './LeftSideBar';
import { StoreContext } from '../../Context/StoreContext';
import SkeletonLoading from '../HomeAttractions/SkeletonLoading';

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

const HomeFoodService = () => {
    const { url } = useContext(StoreContext);
    const [location, setLocation] = useState('');
    const [foodServicesFound, setFoodServicesFound] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({});
    const [suggestions, setSuggestions] = useState([]);
    const suggestionRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
          if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
            setSuggestions([]);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [suggestionRef]);

    const fetchFoodServices = async (searchLocation = location, pageNum = page, currentFilters = filters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                keyword: searchLocation,
                page: pageNum,
                limit: 6,
                minPrice: currentFilters.priceRange?.min || 0,
                maxPrice: currentFilters.priceRange?.max || 1000000,
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
    }, [page, filters]);

    const handleSearch = () => {
        setPage(1);
        fetchFoodServices(location, 1, filters);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPage(1);
    };

    const handleLocationChange = (e) => {
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
            // Auto fetch when input is cleared
            setPage(1);
            fetchFoodServices('', 1, filters);
        }
    };

    const handleSuggestionClick = (city) => {
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
        fetchFoodServices(city.includes(', ') ? city.split(', ')[1] : city, 1, filters);
    };

    return (
        <div className="home-attractions-container">
            <form className="attractions-search-form" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
                <div className="attractions-search-item" ref={suggestionRef} style={{ position: 'relative' }}>
                    <span role="img" aria-label="location">📍</span>
                    <input
                        type="text"
                        placeholder="Nhập địa điểm"
                        className="attractions-input"
                        onChange={handleLocationChange}
                        value={location}
                        autoComplete="off"
                    />
                    {suggestions.length > 0 && (
                        <ul className="suggestions-list">
                            {suggestions.map((city, index) => (
                                <li 
                                    key={index} 
                                    onClick={() => handleSuggestionClick(city)}
                                >
                                    {city}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button type="submit" className="attractions-search-btn">
                    Tìm kiếm
                </button>
            </form>

            <div className="attractions-content-container">
                <LeftSideBar onFilterChange={handleFilterChange} />
                {loading ? <SkeletonLoading type= "nhà hàng" /> : <FoodServiceCards foodServicesFound={foodServicesFound} />}
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

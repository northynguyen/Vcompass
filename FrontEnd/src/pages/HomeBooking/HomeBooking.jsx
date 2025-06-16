import React, { useState, useEffect, useContext, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './HomeBooking.css';
import AccomodationCards from './AccomodationCards';
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

const HomeBooking = () => {
    const { url } = useContext(StoreContext);
    // Trạng thái hiển thị trong form
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [suggestions, setSuggestions] = useState([]);
    
    
    // Trạng thái đã được xác nhận để tìm kiếm
    const [searchParams, setSearchParams] = useState({
        location: '',
        startDate: null,
        endDate: null,
        adults: 1,
        children: 0
    });
    
    const [accommodationsFound, setAccommodationsFound] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showGuestDropdown, setShowGuestDropdown] = useState(false);
    const [filters, setFilters] = useState({});
    const dropdownRef = useRef(null);
    const suggestionRef = useRef(null);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setShowGuestDropdown(false);
          }
          if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
            setSuggestions([]);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [dropdownRef, suggestionRef]);
      
    const fetchAccommodations = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                keyword: searchParams.location,
                page: page,
                limit: 6,
                rating: filters.rating || '',
                amenities: filters.selectedAmenities?.join(',') || '',
                startDate: searchParams.startDate ? searchParams.startDate.toISOString().split('T')[0] : '',
                endDate: searchParams.endDate ? searchParams.endDate.toISOString().split('T')[0] : '',
                adults: searchParams.adults,
                children: searchParams.children,
            });

            const response = await fetch(`${url}/api/accommodations/search?${params.toString()}`);
            const data = await response.json();
            if (data.success) {
                setAccommodationsFound(data.data);
                setTotalPages(data.totalPages);
            }
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu accommodations:", error);
        }
        setLoading(false);
    };

    // Chỉ fetch khi page hoặc filters thay đổi hoặc khi searchParams thay đổi
    useEffect(() => {
        fetchAccommodations();
    }, [page, filters, searchParams]);

    const handleSearch = () => {
        // Cập nhật searchParams với giá trị hiện tại từ form
        setSearchParams({
            location,
            startDate,
            endDate,
            adults,
            children
        });
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const handleGuestChange = (type, field, event) => {
        // Ngăn không cho sự kiện nổi bọt ra ngoài
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        if (field === 'adults') {
            setAdults((prev) => (type === 'increment' ? prev + 1 : Math.max(1, prev - 1)));
        } else if (field === 'children') {
            setChildren((prev) => (type === 'increment' ? prev + 1 : Math.max(0, prev - 1)));
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPage(1); // reset về trang đầu khi thay filter
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
    };

    return (
        <div className="home-booking-container">
            <form className="home-booking-search-form" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
                <div className="home-booking-search-item" ref={suggestionRef} style={{ position: 'relative' }}>
                    <span role="img" aria-label="location">📍</span>
                    <input
                        type="text"
                        placeholder="Nhập điểm đến"
                        className="home-booking-input"
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

                <div className="home-booking-search-item">
                    <span role="img" aria-label="calendar">📅</span>
                    <div className="date-picker-wrapper">
                        <DatePicker
                            selected={startDate}
                            onChange={(update) => { setStartDate(update[0]); setEndDate(update[1]); }}
                            startDate={startDate}
                            endDate={endDate}
                            selectsRange
                            monthsShown={2}
                            placeholderText="Chọn ngày"
                            dateFormat="dd/MM/yyyy"
                            className="home-booking-datepicker"
                            minDate={new Date()}
                        />
     
                    </div>
                </div>

                <div className="home-booking-search-item" onClick={() => setShowGuestDropdown(!showGuestDropdown)} style={{ position: 'relative' }}>
                    <span role="img" aria-label="people">👥</span>
                    <input type="text" value={`${adults} người lớn, ${children} trẻ em`} readOnly className="home-booking-input" />
                    {showGuestDropdown && (
                        
                         <div className="home-booking-guest-dropdown" ref={dropdownRef}>
                         <div className="guest-option">
                           <span>Người lớn</span>
                           <button onClick={(e) => handleGuestChange('decrement', 'adults', e)} >-</button>
                           <span className='num'>{adults}</span>
                           <button onClick={(e) => handleGuestChange('increment', 'adults', e)}>+</button>
                         </div>
                         <div className="guest-option">
                           <span>Trẻ em</span>
                           <button onClick={(e) => handleGuestChange('decrement', 'children', e)}>-</button>
                           <span className='num'>{children}</span>
                            <button onClick={(e) => handleGuestChange('increment', 'children', e)}>+</button>
                         </div>
           
                         <button className="ok-btn" onClick={() => setShowGuestDropdown(false)}>Xong</button>
                       </div>
                    )}
                </div>

                <button type="submit" className="home-booking-search-btn">Tìm kiếm</button>
            </form>

            <div className='homeBooking-accomodations-container'>
                <LeftSideBar onFilterChange={handleFilterChange} />
                {loading ? <SkeletonLoading type="khách sạn"></SkeletonLoading> : (
                    <AccomodationCards
                        accommodationsFound={accommodationsFound}
                        startDay={searchParams.startDate}
                        endDay={searchParams.endDate}
                        adults={searchParams.adults}
                        childrenCount={searchParams.children}
                    />
                )}
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

export default HomeBooking;

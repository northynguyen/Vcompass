import React, { useState, useRef, useEffect, useContext } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './HomeBooking.css';
import AccomodationCards from './AccomodationCards';
import LeftSideBar from './LeftSideBar';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';
const HomeBooking = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [showGuestDropdown, setShowGuestDropdown] = useState(false);
    const [accommodationsFound, setAccommodationsFound] = useState([]);
    const [backupAccommodations, setBackupAccommodations] = useState([]);
    const [location, setLocation] = useState('');
    const [filterData, setFilterData] = useState({});
    const [isSearching, setIsSearching] = useState(false);
    const dropdownRef = useRef(null);
    const { url } = useContext(StoreContext)
    const setDateRange = ([start, end]) => {
        const today = new Date();
        if (start && start < today) start = today; // Điều chỉnh nếu ngày bắt đầu nhỏ hơn hôm nay
        setStartDate(start);
        setEndDate(end);
    };

    const calculateNights = (start, end) => {
        if (!start || !end) return 0;
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const handleButtonClick = (type, field, e) => {
        e.stopPropagation();
        if (field === 'adults') {
            setAdults((prev) => (type === 'increment' ? prev + 1 : Math.max(1, prev - 1)));
        } else if (field === 'children') {
            setChildren((prev) => (type === 'increment' ? prev + 1 : Math.max(0, prev - 1)));
        }
    };

    useEffect(() => {
        const fetchAccommodations = async () => {
            try {
                let accommodations = [];

                if (isSearching) {
                    // Khi đang tìm kiếm, sử dụng backup nếu có
                    accommodations = [...backupAccommodations];
                } else {
                    // Nếu không tìm kiếm, gọi API để lấy dữ liệu đầy đủ
                    const response = await axios.get(`${url}/api/accommodations`, {
                        params: { status: "active" },
                    });
                    accommodations = response.data.accommodations;
                    setBackupAccommodations(accommodations); // Backup dữ liệu đầy đủ
                    setAccommodationsFound(accommodations); // Hiển thị danh sách đầy đủ
                }

                // Áp dụng filter
                const filteredAccommodations = applyFilters(accommodations);
                setAccommodationsFound(filteredAccommodations);
            } catch (error) {
                console.error("Error fetching accommodations:", error);
            }
        };

        fetchAccommodations();
    }, [url, filterData, isSearching]); // dependencies đầy đủ để cập nhật khi filterData thay đổi

    const applyFilters = (accommodations) => {
        return accommodations.filter((accommodation) => {
            if (!accommodation.roomTypes) return false;

            const roomPrices = accommodation.roomTypes.map((room) => room.pricePerNight);
            const minPrice = Math.min(...roomPrices);
            const maxPrice = Math.max(...roomPrices);

            // Lọc theo khoảng giá
            if (minPrice < filterData.priceRange.min || maxPrice > filterData.priceRange.max) {
                return false;
            }

            // Lọc theo tiện ích
            if (filterData.selectedAmenities.length > 0) {
                const hasAllSelectedAmenities = filterData.selectedAmenities.every((amenity) =>
                    accommodation.amenities.includes(amenity)
                );
                if (!hasAllSelectedAmenities) {
                    return false;
                }
            }

            // Tính toán đánh giá trung bình
            let averageRating = null;
            if (accommodation.ratings.length > 0) {
                const totalRating = accommodation.ratings.reduce((sum, rating) => sum + rating.rate, 0);
                averageRating = totalRating / accommodation.ratings.length;
            }

            // Lọc theo đánh giá
            if (filterData.rating && (averageRating === null || averageRating < parseFloat(filterData.rating))) {
                return false;
            }

            return true;
        });
    };

    const handleSearch = async () => {
        setAccommodationsFound([]); // Reset danh sách tạm thời
        try {
            const response = await axios.get(`${url}/api/accommodations?name=${location}&status=active`);
            if (!response.data.success) {
                throw new Error("Failed to fetch accommodations");
            }

            let searchResults = [];

            if (response.data.success && (!startDate || !endDate)) {
                searchResults = response.data.accommodations;
            } else if (response.data.success && startDate && endDate) {
                for (const acc of response.data.accommodations) {
                    try {
                        const roomResponse = await axios.get(`${url}/api/bookings/getAvailableRoom`, {
                            params: {
                                accommodationId: acc._id,
                                startDate: startDate.toISOString().split("T")[0],
                                endDate: endDate.toISOString().split("T")[0],
                                adults,
                                children,
                            },
                        });

                        if (roomResponse.data.success && roomResponse.data.availableRooms.length > 0) {
                            searchResults.push(acc);
                        }
                    } catch (error) {
                        console.error("Error fetching available rooms for accommodation", acc._id, error);
                        alert("Unable to find available rooms for the selected dates.");
                    }
                }
            }

            setBackupAccommodations(searchResults); // Lưu lại kết quả tìm kiếm vào backup
            setAccommodationsFound(searchResults); // Cập nhật danh sách hiển thị
            setIsSearching(true); // Đánh dấu là đang tìm kiếm
        } catch (error) {
            console.error("Error fetching accommodations:", error);
        }
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setShowGuestDropdown(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const handleFilterChange = (filterData) => {
        setFilterData(filterData);
    };

    return (
        <div className="home-booking-container">
            <form className="home-booking-search-form" onSubmit={(e) => e.preventDefault()}>
                {/* Location Input */}
                <div className="home-booking-search-item">
                    <span role="img" aria-label="location">📍</span>
                    <input
                        type="text"
                        placeholder="Milan Homestay - The Song Vung Tau"
                        className="home-booking-input"
                        onChange={(e) => setLocation(e.target.value)}
                        value={location}
                    />
                </div>

                {/* Date Picker */}
                <div className="home-booking-search-item">
                    <span role="img" aria-label="calendar">📅</span>
                    <DatePicker
                        selected={startDate}
                        onChange={(update) => setDateRange(update)}
                        startDate={startDate}
                        endDate={endDate}
                        selectsRange
                        monthsShown={2}
                        placeholderText="Chọn ngày"
                        dateFormat="dd/MM/yyyy"
                        className="home-booking-datepicker"
                        minDate={new Date()}
                    />

                    {startDate && endDate && (
                        <span className="home-booking-nights"> &nbsp;&nbsp;{calculateNights(startDate, endDate)} nights</span>
                    )}
                </div>

                {/* Guests and Rooms */}
                <div
                    className="home-booking-search-item"
                    onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                    style={{ position: 'relative' }}
                >
                    <span role="img" aria-label="people">👥</span>
                    <input
                        type="text"
                        value={`${adults} người lớn, ${children} trẻ em`}
                        readOnly
                        className="home-booking-input"
                    />
                    {showGuestDropdown && (
                        <div className="home-booking-guest-dropdown" ref={dropdownRef}>
                            <div className="home-booking-guest-option">
                                <span>Người lớn</span>
                                <button onClick={(e) => handleButtonClick('decrement', 'adults', e)}>-</button>
                                <span className="num">{adults}</span>
                                <button onClick={(e) => handleButtonClick('increment', 'adults', e)}>+</button>
                            </div>
                            <div className="home-booking-guest-option">
                                <span>Trẻ em</span>
                                <button onClick={(e) => handleButtonClick('decrement', 'children', e)}>-</button>
                                <span className="num">{children}</span>
                                <button onClick={(e) => handleButtonClick('increment', 'children', e)}>+</button>
                            </div>


                            <button className="home-booking-ok-btn" onClick={() => setShowGuestDropdown(false)}>Xong</button>
                        </div>
                    )}
                </div>

                {/* Search Button */}
                <button
                    type="submit"
                    className="home-booking-search-btn"
                    onClick={handleSearch}
                >
                    Tìm kiếm
                </button>
            </form>

            <div className='homeBooking-accomodations-container'>
                <LeftSideBar onFilterChange={handleFilterChange} />
                <AccomodationCards accommodationsFound={accommodationsFound} startDay={startDate} endDay={endDate} adults={adults} children={children} />
            </div>
        </div>
    );
};

export default HomeBooking;

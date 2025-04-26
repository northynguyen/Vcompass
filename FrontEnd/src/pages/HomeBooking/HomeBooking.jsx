import React, { useState, useEffect, useContext, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './HomeBooking.css';
import AccomodationCards from './AccomodationCards';
import LeftSideBar from './LeftSideBar';
import { StoreContext } from '../../Context/StoreContext';
import SkeletonLoading from '../HomeAttractions/SkeletonLoading';

const HomeBooking = () => {
    const { url } = useContext(StoreContext);
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [accommodationsFound, setAccommodationsFound] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showGuestDropdown, setShowGuestDropdown] = useState(false);
    const [filters, setFilters] = useState({});
    const dropdownRef = useRef(null);

    const fetchAccommodations = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                keyword: location,
                page: page,
                limit: 6,
                rating: filters.rating || '',
                amenities: filters.selectedAmenities?.join(',') || '',
                startDate: startDate ? startDate.toISOString().split('T')[0] : '',
                endDate: endDate ? endDate.toISOString().split('T')[0] : '',
                adults,
                children,
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

    // Auto fetch khi bất kỳ input nào thay đổi
    useEffect(() => {
        fetchAccommodations();
    }, [page, location, filters, startDate, endDate, adults, children]);

    const handleSearch = () => {
        setPage(1); // Trigger useEffect
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage); // Trigger useEffect
        }
    };

    const handleGuestChange = (type, field) => {
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

    return (
        <div className="home-booking-container">
            <form className="home-booking-search-form" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
                <div className="home-booking-search-item">
                    <span role="img" aria-label="location">📍</span>
                    <input
                        type="text"
                        placeholder="Nhập điểm đến"
                        className="home-booking-input"
                        onChange={(e) => setLocation(e.target.value)}
                        value={location}
                    />
                </div>

                <div className="home-booking-search-item">
                    <span role="img" aria-label="calendar">📅</span>
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

                <div className="home-booking-search-item" onClick={() => setShowGuestDropdown(!showGuestDropdown)} style={{ position: 'relative' }}>
                    <span role="img" aria-label="people">👥</span>
                    <input type="text" value={`${adults} người lớn, ${children} trẻ em`} readOnly className="home-booking-input" />
                    {showGuestDropdown && (
                        <div className="home-booking-guest-dropdown" ref={dropdownRef}>
                            <div className="home-booking-guest-option">
                                <span>Người lớn</span>
                                <button type="button" onClick={() => handleGuestChange('decrement', 'adults')}>-</button>
                                <span className="num">{adults}</span>
                                <button type="button" onClick={() => handleGuestChange('increment', 'adults')}>+</button>
                            </div>
                            <div className="home-booking-guest-option">
                                <span>Trẻ em</span>
                                <button type="button" onClick={() => handleGuestChange('decrement', 'children')}>-</button>
                                <span className="num">{children}</span>
                                <button type="button" onClick={() => handleGuestChange('increment', 'children')}>+</button>
                            </div>
                            <button type="button" className="home-booking-ok-btn" onClick={() => setShowGuestDropdown(false)}>Xong</button>
                        </div>
                    )}
                </div>

                <button type="submit" className="home-booking-search-btn">Tìm kiếm</button>
            </form>

            <div className='homeBooking-accomodations-container'>
                <LeftSideBar onFilterChange={handleFilterChange} />
                {loading ?<SkeletonLoading type ="khách sạn"></SkeletonLoading> : (
                    <AccomodationCards
                        accommodationsFound={accommodationsFound}
                        startDay={startDate}
                        endDay={endDate}
                        adults={adults}
                        childrenCount={children}
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

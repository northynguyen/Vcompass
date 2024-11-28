import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './HomeBooking.css';
import AccomodationCards from './AccomodationCards';
import LeftSideBar from './LeftSideBar';

const HomeBooking = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [numRooms, setNumRooms] = useState(1);
    const [showGuestDropdown, setShowGuestDropdown] = useState(false);
    const dropdownRef = useRef(null);

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
        } else if (field === 'rooms') {
            setNumRooms((prev) => (type === 'increment' ? prev + 1 : Math.max(1, prev - 1)));
        }
    };

    const handleSearch = () => {
        console.log({
            location: 'Milan Homestay - The Song Vung Tau',
            startDate,
            endDate,
            adults,
            children,
            numRooms,
        });
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
                        value={`${adults} người lớn, ${children} trẻ em, ${numRooms} phòng`}
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
                            <div className="home-booking-guest-option">
                                <span>Phòng</span>
                                <button onClick={(e) => handleButtonClick('decrement', 'rooms', e)}>-</button>
                                <span className="num">{numRooms}</span>
                                <button onClick={(e) => handleButtonClick('increment', 'rooms', e)}>+</button>
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
                <LeftSideBar />
                <AccomodationCards />
            </div>
        </div>
    );
};

export default HomeBooking;

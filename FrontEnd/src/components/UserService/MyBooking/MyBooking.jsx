// src/components/MyBooking/MyBooking.js
import { useState, useRef, useEffect } from 'react';
import './MyBooking.css';
import Review from '../../Review/Review';
import CancelBooking from '../../CancelBooking/CancelBooking'; // Import thành phần CancelBooking

const MyBooking = () => {
    const bookings = [
        {
            id: 1,
            hotel: "Grand Palace",
            status: "used",
            date: "2023-09-01",
            image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/582408500.jpg?k=166f1c3a899a6721f0338314285cd85901c7654eb7f96e3813dba7a0f62c97ff&o=&hp=1",
            roomNumber: 1203,
            nights: 3,
            price: 150,
            services: ["Free Wi-Fi", "Breakfast Included"]
        },
        {
            id: 2,
            hotel: "Sun Resort",
            status: "pending",
            date: "2023-10-12",
            image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/582408488.jpg?k=473daeebbaacb257f89a957f80b41d0bd8ab97cef8271eca11d71214a0384a70&o=&hp=1",
            roomNumber: 403,
            nights: 2,
            price: 100,
            services: ["Free Parking", "Airport Shuttle"]
        },
        {
            id: 3,
            hotel: "Moon Hotel",
            status: "pending",
            date: "2023-10-20",
            image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/554285992.jpg?k=42ea853b3e50553ddd67a58ac0baa8a1e7a9cec501bb3c91560dcd605b946b33&o=&hp=1",
            roomNumber: 105,
            nights: 1,
            price: 200,
            services: ["Gym Access", "Spa"]
        },
        {
            id: 4,
            hotel: "Ocean View",
            status: "used",
            date: "2023-09-25",
            image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/554285992.jpg?k=42ea853b3e50553ddd67a58ac0baa8a1e7a9cec501bb3c91560dcd605b946b33&o=&hp=1",
            roomNumber: 203,
            nights: 5,
            price: 120,
            services: ["Beachfront", "Pool Access"]
        }
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'used', 'pending'
    const [showReviewPopup, setShowReviewPopup] = useState(false);
    const [showCancelPopup, setShowCancelPopup] = useState(false); // State mới cho popup hủy phòng
    const [selectedBooking, setSelectedBooking] = useState(null); // Lưu thông tin đặt phòng đã chọn

    // Refs cho popup
    const reviewPopupRef = useRef(null);
    const cancelPopupRef = useRef(null);

    // Bổ sung useEffect để xử lý việc đóng popup khi nhấp ra ngoài (Review)
    useEffect(() => {
        const handleClickOutsideReview = (event) => {
            if (reviewPopupRef.current && !reviewPopupRef.current.contains(event.target)) {
                handleCloseReviewPopup();
            }
        };

        if (showReviewPopup) {
            document.addEventListener('mousedown', handleClickOutsideReview);
        } else {
            document.removeEventListener('mousedown', handleClickOutsideReview);
        }

        // Cleanup event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideReview);
        };
    }, [showReviewPopup]);

    // Bổ sung useEffect để xử lý việc đóng popup khi nhấp ra ngoài (Cancel)
    useEffect(() => {
        const handleClickOutsideCancel = (event) => {
            if (cancelPopupRef.current && !cancelPopupRef.current.contains(event.target)) {
                handleCloseCancelPopup();
            }
        };

        if (showCancelPopup) {
            document.addEventListener('mousedown', handleClickOutsideCancel);
        } else {
            document.removeEventListener('mousedown', handleClickOutsideCancel);
        }

        // Cleanup event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideCancel);
        };
    }, [showCancelPopup]);

    // Lọc theo từ khóa tìm kiếm và trạng thái
    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = booking.hotel.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleReviewClick = (booking) => {
        setSelectedBooking(booking);
        setShowReviewPopup(true);
    };

    const handleCancelClick = (booking) => {
        setSelectedBooking(booking);
        setShowCancelPopup(true);
    };

    const handleCloseReviewPopup = () => {
        setShowReviewPopup(false);
        setSelectedBooking(null);
    };

    const handleCloseCancelPopup = () => {
        setShowCancelPopup(false);
        setSelectedBooking(null);
    };

    return (
        <div className="my-booking">
            <h2>My Booking</h2>

            {/* Mục tìm kiếm */}
            <input
                type="text"
                placeholder="Tìm kiếm khách sạn..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-input"
            />

            {/* Lọc theo trạng thái */}
            <div className="filter-buttons">
                <button 
                    onClick={() => setFilterStatus('all')}
                    className={filterStatus === 'all' ? 'active-filter' : ''}>
                    Tất cả
                </button>
                <button 
                    onClick={() => setFilterStatus('used')}
                    className={filterStatus === 'used' ? 'active-filter' : ''}>
                    Đã ở
                </button>
                <button 
                    onClick={() => setFilterStatus('pending')}
                    className={filterStatus === 'pending' ? 'active-filter' : ''}>
                    Đang chờ
                </button>
            </div>

            {/* Danh sách đặt phòng */}
            {filteredBookings.length > 0 ? (
                filteredBookings.map(booking => (
                    <div key={booking.id} className="booking-item">
                        <img src={booking.image} alt={`${booking.hotel}`} className="hotel-img" />
                        <div className="booking-info">
                            <h3>{booking.hotel}</h3>
                            <p><strong>Room Number:</strong> {booking.roomNumber}</p>
                            <p><strong>Booking Date:</strong> {booking.date}</p>
                            <p><strong>Nights:</strong> {booking.nights}</p>
                            <p><strong>Price per Night:</strong> ${booking.price}</p>
                            <p><strong>Total Price:</strong> ${booking.nights * booking.price}</p>
                            <p><strong>Services:</strong> {booking.services.join(", ")}</p>
                            <p><strong>Status:</strong> {booking.status === "used" ? "Used" : "Pending"}</p>
                        </div>
                        <div className="booking-actions">
                            {booking.status === "used" ? (
                                <button className="review-btn" onClick={() => handleReviewClick(booking)}>Review</button>
                            ) : (
                                <button className="cancel-btn" onClick={() => handleCancelClick(booking)}>Cancel</button> // Thêm onClick cho Cancel
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <p>No bookings found matching your search criteria.</p>
            )}

            {/* Popup Review */}
            {showReviewPopup && selectedBooking && (
                <div className="popup">
                    <div className="popup-content" ref={reviewPopupRef}>
                        <button className="close-popup" onClick={handleCloseReviewPopup}>×</button>
                        <Review booking={selectedBooking} onClose={handleCloseReviewPopup} />
                    </div>
                </div>
            )}

            {/* Popup Cancel Booking */}
            {showCancelPopup && selectedBooking && (
                <div className="popup">
                    <div className="popup-content" ref={cancelPopupRef}>
                        <button className="close-popup" onClick={handleCloseCancelPopup}>×</button>
                        <CancelBooking booking={selectedBooking} onClose={handleCloseCancelPopup} />
                    </div>
                </div>
            )}
        </div>
    );

};

export default MyBooking;

import { useState, useEffect, useContext, useRef } from 'react';
import './MyBooking.css';
import Review from '../../Review/Review';
import CancelBooking from '../../CancelBooking/CancelBooking';
import axios from 'axios';
import { StoreContext } from '../../../Context/StoreContext';
import { useLocation } from 'react-router-dom';

const MyBooking = ({ send }) => {
    const location = useLocation();
    const [bookings, setBookings] = useState([]);
    const [accommodations, setAccommodations] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showReviewPopup, setShowReviewPopup] = useState(false);
    const [showCancelPopup, setShowCancelPopup] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [highlightFirstBooking, setHighlightFirstBooking] = useState(false);
    const [currentPage, setCurrentPage] = useState(1); // Trạng thái phân trang
    const bookingsPerPage = 2; // Số booking mỗi trang
    const { token, url } = useContext(StoreContext);
    const reviewPopupRef = useRef(null);
    const cancelPopupRef = useRef(null);
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await axios.get(`${url}/api/bookings/user/getAll`, { headers: { token } });
                if (response.data.success) {
                    const bookingsData = response.data.bookings;
                    setBookings(bookingsData);

                    const accommodationsData = await Promise.all(bookingsData.map(async (booking) => {
                        if (booking.accommodationId) {
                            try {
                                const response = await axios.get(`${url}/api/accommodations/getAccomm/${booking.accommodationId}`);
                                return response.data.success ? response.data.accommodation : null;
                            } catch (error) {
                                console.error("Failed to fetch accommodation", error);
                                return null;
                            }
                        }
                        return null;
                    }));
                    setAccommodations(accommodationsData.filter(Boolean));
                } else {
                    console.error("Failed to fetch bookings", response.data.message);
                }
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            }
        };

        fetchBookings();

        if (send === true) {
            setHighlightFirstBooking(true);
            const timer = setTimeout(() => {
                setHighlightFirstBooking(false);
            }, 1400);
            return () => clearTimeout(timer);
        }

    }, [token, url, location.state, selectedBooking, send]);

    useEffect(() => {
        const filtered = bookings.filter(booking => {
            const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
            return matchesStatus && booking.accommodationId;
        });
        setFilteredBookings(filtered);
    }, [bookings, filterStatus]);

    // Tính toán các dữ liệu của trang hiện tại
    const indexOfLastBooking = currentPage * bookingsPerPage;
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);

    // Thay đổi trang khi người dùng bấm nút
    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

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

    const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

    return (
        <div className="my-booking">
            <h2>My Booking</h2>
            <input
                type="text"
                placeholder="Search hotel..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-input"
            />
            <div className="filter-buttons">
                <button onClick={() => setFilterStatus('all')} className={filterStatus === 'all' ? 'active-filter' : ''}>All</button>
                <button onClick={() => setFilterStatus('expired')} className={filterStatus === 'expired' ? 'active-filter' : ''}>Used</button>
                <button onClick={() => setFilterStatus('pending')} className={filterStatus === 'pending' ? 'active-filter' : ''}>Pending</button>
                <button onClick={() => setFilterStatus('confirmed')} className={filterStatus === 'confirmed' ? 'active-filter' : ''}>Confirmed</button>
                <button onClick={() => setFilterStatus('cancelled')} className={filterStatus === 'cancelled' ? 'active-filter' : ''}>Cancelled</button>
            </div>

            {currentBookings.length === 0 ? (
                <p>No bookings found matching your search criteria.</p>
            ) : (
                currentBookings.map((booking, index) => {
                    const accommodationData = accommodations.find(accommodation => accommodation._id === booking.accommodationId);
                    const roomInfo = accommodationData ? accommodationData.roomTypes.find(roomType => roomType._id === booking.roomId) : null;
                    return (
                        <div
                            key={booking._id}
                            className={`booking-item ${highlightFirstBooking && index === 0 ? 'highlight' : ''}`}
                        >
                            {roomInfo && <img src={`${url}/images/${roomInfo.images[0]}`} alt={`${roomInfo.nameRoomType}`} className="hotel-img" />}
                            <div className="booking-info">
                                {accommodationData ? <h3>{accommodationData.name}</h3> : null}
                                <p><strong>Room Name:</strong> {roomInfo ? roomInfo.nameRoomType : "N/A"}</p>
                                <p><strong>Booking Date:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>
                                <p><strong>Start Date:</strong> {new Date(booking.checkInDate).toLocaleDateString()}</p>
                                <p><strong>End Date:</strong>{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                                <p><strong>Nights:</strong> {booking.duration}</p>
                                <p><strong>Price per Night:</strong> {roomInfo ? roomInfo.pricePerNight : "N/A"} VND</p>
                                <p><strong>Taxes: </strong> Include VAT 8% - {booking.totalAmount * 0.08} VND</p>
                                <p><strong>Total Price:</strong> {booking.totalAmount + booking.totalAmount * 0.08} VND</p>
                                <p><strong>Services:</strong> {roomInfo ? roomInfo.amenities.join(", ") : "N/A"}</p>
                                <p><strong>Status:</strong> {booking.status === "expired" ? "Expired" : booking.status === "pending" ? "Pending" : booking.status === "cancelled" ? "Cancelled" : "Confirmed"}</p>
                                {booking.status === "cancelled" && <p style={{ color: "red" }}><strong>Reason:</strong> {booking.cancellationReason}</p>}
                            </div>
                            <div className="booking-actions">
                                {booking.status === "expired" && (
                                    <button className="review-btn" onClick={() => handleReviewClick(booking)}>Review</button>
                                )}
                                {(booking.status === "confirmed" || booking.status === "pending") && (
                                    <button className="cancel-btn" onClick={() => handleCancelClick(booking)}>Cancel</button>
                                )}
                            </div>
                        </div>
                    );
                })
            )}

            {/* Phân trang */}
            <div className="pagination">
                <button
                    className="pagination-btn"
                    onClick={() => handlePageClick(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    className="pagination-btn"
                    onClick={() => handlePageClick(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    Next
                </button>
            </div>

            {showReviewPopup && selectedBooking && (
                <div className="popup">
                    <div className="popup-content" ref={reviewPopupRef}>
                        <button className="close-popup" onClick={handleCloseReviewPopup}>×</button>
                        <Review type="accommodation" booking={selectedBooking} onClose={handleCloseReviewPopup}  id={selectedBooking.accommodationId} />
                    </div>
                </div>
            )}

            {showCancelPopup && selectedBooking && (
                <div className="popup">
                    <div className="popup-content" ref={cancelPopupRef}>
                        <button className="close-popup" onClick={handleCloseCancelPopup}>×</button>
                        <CancelBooking booking={selectedBooking} onClose={handleCloseCancelPopup}/>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBooking;

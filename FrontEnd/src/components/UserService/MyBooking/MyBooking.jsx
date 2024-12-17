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
    const [currentPage, setCurrentPage] = useState(1);
    const bookingsPerPage = 2;
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
                                console.error("Lỗi khi lấy dữ liệu chỗ ở", error);
                                return null;
                            }
                        }
                        return null;
                    }));
                    setAccommodations(accommodationsData.filter(Boolean));
                } else {
                    console.error("Lỗi khi lấy danh sách đặt phòng", response.data.message);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách đặt phòng", error);
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

    const indexOfLastBooking = currentPage * bookingsPerPage;
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);

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
            <h2>Lịch Sử Đặt Phòng</h2>
            <input
                type="text"
                placeholder="Tìm kiếm khách sạn..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-input"
            />
            <div className="filter-buttons">
                <button onClick={() => setFilterStatus('all')} className={filterStatus === 'all' ? 'active-filter' : ''}>Tất cả</button>
                <button onClick={() => setFilterStatus('expired')} className={filterStatus === 'expired' ? 'active-filter' : ''}>Đã sử dụng</button>
                <button onClick={() => setFilterStatus('pending')} className={filterStatus === 'pending' ? 'active-filter' : ''}>Chờ xác nhận</button>
                <button onClick={() => setFilterStatus('confirmed')} className={filterStatus === 'confirmed' ? 'active-filter' : ''}>Đã xác nhận</button>
                <button onClick={() => setFilterStatus('cancelled')} className={filterStatus === 'cancelled' ? 'active-filter' : ''}>Đã hủy</button>
            </div>

            {currentBookings.length === 0 ? (
                <p>Không tìm thấy lịch sử đặt phòng phù hợp.</p>
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
                                <p><strong>Tên phòng:</strong> {roomInfo ? roomInfo.nameRoomType : "N/A"}</p>
                                <p><strong>Ngày đặt:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>
                                <p><strong>Ngày nhận phòng:</strong> {new Date(booking.checkInDate).toLocaleDateString()}</p>
                                <p><strong>Ngày trả phòng:</strong> {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                                <p><strong>Số đêm:</strong> {booking.duration}</p>
                                <p><strong>Giá mỗi đêm:</strong> {roomInfo ? roomInfo.pricePerNight : "N/A"} VND</p>
                                <p><strong>Thuế VAT 8%:</strong> {booking.totalAmount * 0.08} VND</p>
                                <p><strong>Tổng giá:</strong> {booking.totalAmount + booking.totalAmount * 0.08} VND</p>
                                <p><strong>Dịch vụ:</strong> {roomInfo ? roomInfo.amenities.join(", ") : "N/A"}</p>
                                <p><strong>Trạng thái:</strong> {booking.status === "expired" ? "Đã hết hạn" : booking.status === "pending" ? "Chờ xác nhận" : booking.status === "cancelled" ? "Đã hủy" : "Đã xác nhận"}</p>
                            </div>
                            <div className="booking-actions">
                                {booking.status === "expired" && (
                                    <button className="review-btn" onClick={() => handleReviewClick(booking)}>Viết đánh giá</button>
                                )}
                                {(booking.status === "confirmed" || booking.status === "pending") && (
                                    <button className="cancel-btn" onClick={() => handleCancelClick(booking)}>Hủy đặt phòng</button>
                                )}
                            </div>
                        </div>
                    );
                })
            )}

            <div className="pagination">
                <button
                    className="pagination-btn"
                    onClick={() => handlePageClick(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Trước
                </button>
                <span className="pagination-info">
                    Trang {currentPage} / {totalPages}
                </span>
                <button
                    className="pagination-btn"
                    onClick={() => handlePageClick(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    Tiếp
                </button>
            </div>
        </div>
    );
};

export default MyBooking;

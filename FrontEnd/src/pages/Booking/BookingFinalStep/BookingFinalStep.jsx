import { useEffect, useState, useContext } from 'react';
import './BookingFinalStep.css';
import Modal from 'react-modal';
import { FaLock } from 'react-icons/fa';
import { StoreContext } from '../../../Context/StoreContext';
import {toast} from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const BookingModal = ({ isOpen, onRequestClose, bookingDetails , onSubmit}) => {
    Modal.setAppElement('#root');
    
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Chi tiết đặt phòng"
            className="booking-modal"
            overlayClassName="booking-modal-overlay"
        >
            <button className="close-button" onClick={onRequestClose}>×</button>
            
            <h2>{bookingDetails.hotel.name}</h2>
            <a 
                className="location" 
                href={`https://www.google.com/maps/?q=${bookingDetails.hotel.location.latitude},${bookingDetails.hotel.location.longitude}`} 
                target="_blank" 
                rel="noopener noreferrer"
                >
                {bookingDetails.hotel.location.address}
            </a>
            
            <div className="booking-info">
                <p><strong>Tổng thời gian lưu trú:</strong> {bookingDetails.bookingInfo.diffDays + 1} đêm, {bookingDetails.bookingInfo.adults} người lớn</p>
                
                <div className="dates">
                    <div>
                        <strong>Nhận phòng</strong>
                        <p>{bookingDetails.bookingInfo.startDate}</p>
                        <span>Từ 14:00</span>
                    </div>
                    <div>
                        <strong>Trả phòng</strong>
                        <p>{bookingDetails.bookingInfo.endDate}</p>
                        <span>Đến 12:00</span>
                    </div>
                </div>
                
                <div className="room-details">
                    
                        <p >
                            1× {bookingDetails.room.nameRoomType} <br />
                            <span className="free-cancellation">Hủy miễn phí bất kỳ lúc nào</span>
                        </p>
    
                </div>
                
                <div className="price-section">
                    <p>Giá</p>
                    <p className="total-price">{bookingDetails.bookingInfo.totalPrice.toLocaleString()} VND</p>
                </div>
                
                <p className="info-text">
                    * Giá này đã được chuyển đổi để hiển thị chi phí ước tính bằng VND. Tỷ giá có thể thay đổi trước khi bạn thanh toán.
                    Lưu ý rằng tổ chức phát hành thẻ của bạn có thể tính phí giao dịch quốc tế.
                </p>
            </div>

            <button className="confirm-button" onClick={() =>  onSubmit}>
                <FaLock />
                Tất cả đều ổn, hoàn tất đặt phòng của tôi!
            </button>
        </Modal>
    );
};

BookingModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    bookingDetails: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired
};

const BookingFinalStep = ({bookingDetails, setShowLogin}) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const {url, user} = useContext(StoreContext);
    const [loading, setLoading] = useState(false);
    const [hasShownLoginPopup, setHasShownLoginPopup] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user && !hasShownLoginPopup) {
            setShowLogin(true);
            setHasShownLoginPopup(true);
            
            // Sau 2 giây, redirect về home nếu user vẫn chưa đăng nhập
            const timer = setTimeout(() => {
                if (!user) {
                    navigate('/');
                }
            }, 2000);
            
            return () => clearTimeout(timer);
        }
    }, [user, hasShownLoginPopup, setShowLogin, navigate]);

    const handleSubmit = async () => {
        window.scrollTo(0, 0);
        if(!user){
            setShowLogin(true);
            return
        }
        try {
            setLoading(true);           
            const response = await fetch(`${url}/api/bookings/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user._id, // Replace with the actual user ID
                    partnerId: bookingDetails.hotel.idPartner,
                    accommodationId: bookingDetails.hotel._id,
                    roomId: bookingDetails.room._id,
                    checkInDate: bookingDetails.bookingInfo.startDate,
                    checkOutDate: bookingDetails.bookingInfo.endDate,
                    numberOfGuests: {
                        adult: bookingDetails.bookingInfo.adults,
                        child: bookingDetails.bookingInfo.children
                    },
                    totalAmount: bookingDetails.bookingInfo.totalPrice,
                    specialRequest: bookingDetails.bookingInfo.specialRequest,
                    guestInfo: {
                        name: bookingDetails.bookingInfo.firstName + " " + bookingDetails.bookingInfo.lastName, // Replace with actual guest name
                        email: bookingDetails.bookingInfo.email, // Replace with actual guest email
                        phone: bookingDetails.bookingInfo.phoneNumber,
                        nationality: bookingDetails.bookingInfo.country, // Replace with actual guest phone
                    },
                    createdAt: new Date().toISOString() // Current date/time
                }),
            });

            if (response.ok) {
                setLoading(false);

                const bookingConfirmation = await response.json();
                toast.success("Đặt phòng thành công");
                console.log("Đặt phòng thành công:", bookingConfirmation);
                navigate('/user-service/booking', { state: { tab: 'booking', send: true }, replace: true });
                
            } else {
                setLoading(false);
                console.error("Không thể đặt phòng:", response.statusText);
                toast.error("Không thể đặt phòng" );
            }
        } catch (error) {
            setLoading(false);
            console.error("Lỗi khi đặt phòng:", error);
            toast.error("Lỗi khi đặt phòng" );  
        }
        
    };


   
    return (
        <div className="final-step-container">
           
    
            <h2 className="title">Không cần thông tin thanh toán</h2>
            <p>Thanh toán sẽ được xử lý bởi Joi Hospitality - Hoàng Anh, vì vậy bạn không cần nhập bất kỳ thông tin thanh toán nào cho đơn đặt phòng này.</p>

            <div className="checkbox-group">
                <input type="checkbox" id="marketing-emails" />
                <label htmlFor="marketing-emails">Tôi đồng ý nhận email quảng cáo từ VCompass, bao gồm các chương trình khuyến mãi, gợi ý cá nhân hóa, phần thưởng, trải nghiệm du lịch và cập nhật về các sản phẩm và dịch vụ của VCompass.</label>
            </div>

            <div className="checkbox-group">
                <input type="checkbox" id="transport-emails" />
                <label htmlFor="transport-emails">Tôi đồng ý nhận email quảng cáo từ VCompass, bao gồm các chương trình khuyến mãi, gợi ý cá nhân hóa, phần thưởng, trải nghiệm du lịch và cập nhật về các sản phẩm và dịch vụ của VCompass.</label>
            </div>

            <p className="note">Bằng cách đăng ký, bạn cho phép chúng tôi cá nhân hóa ưu đãi và nội dung phù hợp với sở thích của bạn bằng cách theo dõi cách bạn sử dụng VCompass thông qua công nghệ theo dõi. Bạn có thể hủy đăng ký bất kỳ lúc nào. Đọc <a href="#">chính sách bảo mật</a> của chúng tôi.</p>

            <p>Đơn đặt phòng của bạn sẽ được thực hiện bởi Joi Hospitality - Hoàng Anh và bằng cách hoàn tất đặt phòng này, bạn đồng ý với các <a href="#">điều kiện đặt phòng</a>, <a href="#">điều khoản chung</a>, và <a href="#">chính sách bảo mật</a>.</p>

            <div className="button-container">
                <button className="button" onClick={() => setModalIsOpen(true)}>Kiểm tra đơn đặt phòng</button>
                <button className="button" onClick={handleSubmit} disabled={loading}>Hoàn tất đặt phòng</button>
            </div>

            <BookingModal 
                isOpen={modalIsOpen} 
                onRequestClose={() => setModalIsOpen(false)} 
                bookingDetails={bookingDetails} 
                onSubmit={handleSubmit}
            />

            <p className="note"><a href="#">Điều kiện đặt phòng của tôi là gì?</a></p>

            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                </div>
            )}
        </div>
    );
};

BookingFinalStep.propTypes = {
    bookingDetails: PropTypes.object.isRequired,
    setShowLogin: PropTypes.func.isRequired
};

export default BookingFinalStep;

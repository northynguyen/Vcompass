import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import './Booking.css';
import BookingFinalStep from './BookingFinalStep/BookingFinalStep';
import BookingStep2 from './BookingStep2/BookingStep2';
const BookingProcess = () => {
  const [currentStep, setCurrentStep] = useState(2);
  const [hotelInfo, setHotelInfo] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [bookingInfo, setBookingInfo] = useState(null);
  const location = useLocation();
  const [priceSummary, setPriceSummary] = useState(null);
  const [taxes, setTaxes] = useState(null);
  const [totalPrice, setTotalPrice] = useState(null);
  const [dataSend, setDataSend] = useState(null);

  useEffect(() => {
    if (location.state?.step) {
      setCurrentStep(location.state.step);
    } else {
      setCurrentStep(2);
    }
  
    const sendData = location.state?.dataSend;
    setDataSend(sendData);
    if (sendData) {
      setRoomInfo(sendData.room);
      setHotelInfo(sendData.hotel);
      setBookingInfo(sendData.bookingInfo);
  
      const calculatedPriceSummary = sendData.room.pricePerNight * sendData.bookingInfo.diffDays;
      const calculatedTaxes = calculatedPriceSummary * 0.08;
      
      setPriceSummary(calculatedPriceSummary);
      setTaxes(calculatedTaxes);
      setTotalPrice(calculatedPriceSummary + calculatedTaxes);
      setDataSend({
        ...sendData,bookingInfo: {...sendData.bookingInfo, priceSummary: calculatedPriceSummary, taxes: calculatedTaxes, totalPrice: calculatedPriceSummary + calculatedTaxes}
      });
    }
  }, [location.state]);

  const averageRating = hotelInfo?.ratings?.length
  ? (hotelInfo.ratings.reduce((acc, rating) => acc + rating.rate, 0) / hotelInfo.ratings.length).toFixed(1)
  : 'N/A'; // Fallback if no ratings


  console.log("Data Send: ", dataSend);
  if (!location.state?.dataSend || !roomInfo) {
    return (
      <div className="booking-process-container">
        <div className="status-bar">
          <div className= "status-item  active">
            <span>1</span>
            <p>Lựa chọn của bạn</p>
          </div>
          <div className="status-item">
            <span>2</span>
            <p>Thông tin của bạn</p>
          </div>
          <div className="status-item">
            <span>3</span>
            <p>Bước cuối cùng</p>
          </div>
        </div>
        <div className="step-content">
          <h2>Vui lòng chọn phòng để đặt</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-process-container">
      {/* Thanh trạng thái bước */}
      <div className="status-bar">
        <div className={`status-item ${currentStep >= 1 ? 'active' : ''}`}>
          <span>1</span>
          <p>Lựa chọn của bạn</p>
        </div>
        <div className={`status-item ${currentStep >= 2 ? 'active' : ''}`}>
          <span>2</span>
          <p>Thông tin của bạn</p>
        </div>
        <div className={`status-item ${currentStep >= 3 ? 'active' : ''}`}>
          <span>3</span>
          <p>Bước cuối cùng</p>
        </div>
      </div>

      {/* Nội dung các bước đặt phòng */}
      <div className="step-content">
        <div className="left-panel">
          {/* Thông tin khách sạn */}
          <div className="section-box hotel-info">
            <h2>Chỗ ở</h2>
            <p><strong>{hotelInfo?.name || 'Joi Hospitality - Hoang Anh'}</strong></p>
            <p>{hotelInfo?.location.address || 'I43, Phan Huy Ích, Phường 2, Vũng Tàu, Việt Nam'}</p>
            <p className="rating">Đánh giá — {averageRating || '8.4'}</p>
            <p className="review"> {hotelInfo?.ratings?.length || '0'} nhận xét</p>
            <p className="amenities">{hotelInfo?.amenities.join(' · ') || 'WiFi miễn phí • Bãi đậu xe'}</p>
          </div>

          {/* Chi tiết đặt phòng */}

          <div className="section-box bookingdetail">
            <h2>Chi tiết đặt phòng</h2>
            
            <div className="check-in-out">
              <div>
                <p><strong>Nhận phòng</strong></p>
                <p><strong>{bookingInfo?.startDate || 'Thứ Năm, 31 Tháng 10, 2024'}</strong></p>
                <p className="time-info">Từ 14:00</p>
              </div>
              <div className="divider"></div>
              <div>
                <p><strong>Trả phòng</strong></p>
                <p><strong>{bookingInfo?.endDate || 'Thứ Sáu, 1 Tháng 11, 2024'}</strong></p>
                <p className="time-info">Đến 12:00</p>
              </div>
            </div>
            
            <p className="important-info"><span className="icon">⚠️</span> Chỉ {bookingInfo?.diffDays + 1 || '2'} ngày!</p>
            
            <p>Tổng số ngày ở: <strong>{bookingInfo?.diffDays ? `${bookingInfo.diffDays} đêm` : '1 đêm'}</strong></p>
            
            <hr />
            
            <p>Bạn đã chọn</p>
            <p><strong>{`1 phòng cho ${bookingInfo?.adults || '2'} người lớn`}</strong>
              {bookingInfo?.children > 0 && <span> và <strong>{bookingInfo.children} trẻ em</strong></span>}
            </p>
            
            <a href="#">Thay đổi lựa chọn</a>
          </div>


          <div className="section-box price-summary">
            <h2>Chi tiết giá</h2>
            
            <div className="price-row">
              <span>Giá gốc</span>
              <span><strong>{priceSummary?.toLocaleString() || '23.55 '} VND</strong></span>
            </div>
            <div className="price-row">
              <span>Thuế</span>
              <span><strong>{taxes?.toLocaleString() || '23.55 '} VND</strong></span>
            </div>

            <div className="price-row">
              <span>Giảm giá phút cuối</span>
              <span className="discount">− {roomInfo?.dealDiscount || '0 VND'}</span>
            </div>
            
            <div className="price-row">
              <span>Giảm giá Genius</span>
              <span className="discount">− {roomInfo?.geniusDiscount || '0 VND'}</span>
            </div>
            
            <div className="total-section">
              <p className="total-label">Tổng cộng</p>
              <p className="total-price">{totalPrice?.toLocaleString() || '7.84'} VND</p>
              <p className="total-subtext">Đã bao gồm thuế và phí</p>
            </div>
            
            <h3>Thông tin giá</h3>
            <ul className="price-info-list">
              <li>Đã bao gồm {taxes?.toLocaleString()} VND thuế và phí</li>
              <li>VAT 8% <span>(ước tính)</span></li>
              <li>Giá này được quy đổi để hiển thị chi phí gần đúng bằng VND. Bạn sẽ thanh toán bằng VND hoặc USD.</li>
              <li>Lưu ý rằng tổ chức phát hành thẻ của bạn có thể tính phí giao dịch ngoại tệ.</li>
            </ul>
            
            <a href="#" className="hide-details">Ẩn chi tiết</a>
          </div>

        </div>
        {currentStep === 2 && (
          <BookingStep2 dataSend={dataSend} roomInfo={roomInfo} bookingInfo={bookingInfo}/>
        )}

        {currentStep === 3 && (
          <BookingFinalStep bookingDetails={dataSend}/>
        )}
      </div>
    </div>
  );
};

export default BookingProcess;
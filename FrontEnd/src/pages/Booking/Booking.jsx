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
      {/* Step Status Bar */}
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

      {/* Booking Step Content */}
      <div className="step-content">
        <div className="left-panel">
          {/* Hotel Information Section */}
          <div className="section-box hotel-info">
            <h2>Chỗ ở</h2>
            <p><strong>{hotelInfo?.name || 'Joi Hospitality - Hoang Anh'}</strong></p>
            <p>{hotelInfo?.location.address || 'I43, Phan Huy Ich Street, Ward 2, Vung Tau, Vietnam'}</p>
            <p className="rating">Rating — {averageRating || '8.4'}</p>
            <p className="review"> Đánh giá {hotelInfo?.ratings?.length || '0'}</p>
            <p className="amenities">{hotelInfo?.amenities.join(' · ') || 'Free WiFi • Parking'}</p>
          </div>

          {/* Booking Details Section */}

          <div className="section-box bookingdetail">
            <h2>Chi tiết đặt phòng</h2>
            
            <div className="check-in-out">
              <div>
                <p><strong>Check-in</strong></p>
                <p><strong>{bookingInfo?.startDate || 'Thu 31 Oct 2024'}</strong></p>
                <p className="time-info">Từ 14:00</p>
              </div>
              <div className="divider"></div>
              <div>
                <p><strong>Check-out</strong></p>
                <p><strong>{bookingInfo?.endDate || 'Fri 1 Nov 2024'}</strong></p>
                <p className="time-info">Đến 12:00</p>
              </div>
            </div>
            
            <p className="important-info"><span className="icon">⚠️</span> Chỉ {bookingInfo?.diffDays + 1 || '2'} ngày!</p>
            
            <p>Tổng số ngày ở: <strong>{bookingInfo?.diffDays ? `${bookingInfo.diffDays} nights` : '1 night'}</strong></p>
            
            <hr />
            
            <p>Bạn đã chọn</p>
            <p><strong>{`1 phòng for ${bookingInfo?.adults || '2'} người lớn`}</strong>
              {bookingInfo?.children > 0 && <span> và <strong>{bookingInfo.children} trẻ em</strong></span>}
            </p>
            
            <a href="#">Thay đổi lựa chọn</a>
          </div>


          <div className="section-box price-summary">
            <h2>Your price summary</h2>
            
            <div className="price-row">
              <span>Original price</span>
              <span><strong>{priceSummary?.toLocaleString() || '23.55 '} VND</strong></span>
            </div>
            <div className="price-row">
              <span>Tax price</span>
              <span><strong>{taxes?.toLocaleString() || '23.55 '} VND</strong></span>
            </div>

            <div className="price-row">
              <span>Late Escape Deal</span>
              <span className="discount">− {roomInfo?.dealDiscount || '0 VND'}</span>
            </div>
            
            <div className="price-row">
              <span>Genius discount</span>
              <span className="discount">− {roomInfo?.geniusDiscount || '0 VND'}</span>
            </div>
            
            <div className="total-section">
              <p className="total-label">Total</p>
              <p className="total-price">{totalPrice?.toLocaleString() || 'US$7.84'} VND</p>
              <p className="total-subtext">Includes taxes and charges</p>
            </div>
            
            <h3>Price information</h3>
            <ul className="price-info-list">
              <li>Includes {taxes?.toLocaleString()} VND in taxes and charges</li>
              <li>8 % VAT <span>(estimated)</span></li>
              <li>This price is converted to show you the approximate cost in VND. You'll pay in VND or USD.</li>
              <li>Bear in mind that your card issuer may charge you a foreign transaction fee.</li>
            </ul>
            
            <a href="#" className="hide-details">Hide details</a>
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

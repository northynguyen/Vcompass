import React, { useEffect, useState } from 'react';
import './BookingStep2.css';
import { useNavigate, useLocation } from 'react-router-dom';

const BookingStep2 = ({ dataSend, roomInfo, bookingInfo }) => {
  const navigate = useNavigate();
  const [sendData, setSendData] = useState(dataSend || {});
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === 'checkbox' ? checked : value;

    setSendData((prevData) => ({
      ...prevData,
      bookingInfo: { ...prevData.bookingInfo, [name]: updatedValue },
    }));

    // Xóa lỗi khi người dùng bắt đầu nhập
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['firstName', 'lastName', 'email', 'country', 'phoneNumber'];
    
    // Kiểm tra các trường bắt buộc
    requiredFields.forEach((field) => {
      if (!sendData.bookingInfo?.[field]) {
        newErrors[field] = 'Trường này là bắt buộc';
      }
    });

    // Kiểm tra định dạng email
    if (sendData.bookingInfo?.email && !/\S+@\S+\.\S+/.test(sendData.bookingInfo.email)) {
      newErrors.email = 'Vui lòng nhập địa chỉ email hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      navigate('/booking-process/finalstep', { state: { step: 3, dataSend: sendData } });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    else {
      // Nếu có lỗi, focus vào phần đầu của form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="right-panel">
      <div className="section-box"> 
        <h2>Nhập thông tin của bạn</h2>
        <p className="note">Gần xong rồi! Hãy điền thông tin có <span className="required">*</span> yêu cầu</p>

        <form >
          <div className="form-group">
            <label>Họ <span className="required">*</span></label>
            <input type="text" placeholder="Họ" name="firstName" onChange={handleChange} />
            {errors.firstName && <span className="error">{errors.firstName}</span>}
          </div>
          <div className="form-group">
            <label>Tên <span className="required">*</span></label>
            <input type="text" placeholder="Tên" name="lastName" onChange={handleChange} />
            {errors.lastName && <span className="error">{errors.lastName}</span>}
          </div>
          <div className="form-group">
            <label>Địa chỉ email <span className="required">*</span></label>
            <input type="email" placeholder="Địa chỉ email" name="email" onChange={handleChange} />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Quốc gia/khu vực <span className="required">*</span></label>
            <select name="country" onChange={handleChange}>
              <option value="">Chọn quốc gia</option>
              <option value="Vietnam">Việt Nam</option>
              <option value="US">Hoa Kỳ</option>
              <option value="UK">Vương Quốc Anh</option>
            </select>
            {errors.country && <span className="error">{errors.country}</span>}
          </div>
          <div className="form-group">
            <label>Số điện thoại <span className="required">*</span></label>
            <input type="text" placeholder="Số điện thoại" name="phoneNumber" onChange={handleChange} />
            {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
          </div>
        </form>
      </div>

      {/* Phần cần lưu ý */}
      <div className="section-box good-to-know">
        <h2>Điều cần biết:</h2>
        <ul>
          <li>Không cần thẻ tín dụng</li>
          <li>Giữ sự linh hoạt: Bạn có thể hủy miễn phí bất cứ lúc nào, vì vậy hãy đặt giá tốt ngay hôm nay.</li>
          <li>Không cần thanh toán để giữ chỗ này. Bạn sẽ thanh toán khi đến ở.</li>
        </ul>
      </div>

      {/* Thông tin phòng */}
      <div className="section-box room-info">
        <h2>{roomInfo.nameRoomType || "Phòng tiêu chuẩn giường đôi"}</h2>
        <p><strong>Hủy miễn phí bất cứ lúc nào</strong></p>
        <p>Khách: <strong>{roomInfo.numPeople?.adult || 1} người lớn</strong>, <strong>{roomInfo.numPeople?.child || 0} trẻ em</strong></p>
        <p>Phòng sạch sẽ xuất sắc - 8.5</p>
        <p>Không hút thuốc</p>
        <p>Kích thước phòng: <strong>{roomInfo.roomSize || "N/A"} m²</strong></p>
        <p>Tiện nghi: <strong>{roomInfo.amenities?.join(", ") || "N/A"}</strong></p>
      </div>

      {/* Lợi ích dành cho Genius */}
      <div className="section-box genius-benefits">
        <h2>Lợi ích của bạn</h2>
        <p><strong>Giảm giá 10%</strong></p>
        <p>Bạn được giảm giá 10% trên giá trước thuế và phí.</p>
      </div>

      {/* Yêu cầu đặc biệt */}
      <div className="form-group">
        <label>Yêu cầu đặc biệt</label>
        <textarea name="specialRequests" placeholder="Vui lòng viết yêu cầu của bạn bằng tiếng Anh. (tùy chọn)" onChange={handleChange}></textarea>
      </div>

      {/* Thời gian đến */}
      <div className="form-group">
        <label>Thời gian bạn đến</label>
        <select name="arrivalTime" onChange={handleChange}>
          <option>Vui lòng chọn</option>
          <option value="14:00">14:00</option>
          <option value="15:00">15:00</option>
          <option value="16:00">16:00</option>
        </select>
        <p className="note">Phòng của bạn sẽ sẵn sàng nhận khách vào lúc 14:00</p>
      </div>

      <button className="button" type="submit" onClick={(e) => handleSubmit(e)}>
        Tiếp theo: Thông tin cuối cùng
      </button>
    </div>
  );
};

export default BookingStep2;

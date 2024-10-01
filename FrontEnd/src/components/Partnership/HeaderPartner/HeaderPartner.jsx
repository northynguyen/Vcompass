import { useState, useEffect } from 'react';
import './HeaderPartner.css';

const options = ['căn hộ', 'nhà nghỉ', 'khách sạn', 'quán ăn'];

const HeaderPartner = () => {
  const [selectedOption, setSelectedOption] = useState(options[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSelectedOption(prevOption => {
        const currentIndex = options.indexOf(prevOption);
        const nextIndex = (currentIndex + 1) % options.length;
        return options[nextIndex];
      });
    }, 3000); // change every 3 seconds

    return () => clearInterval(intervalId); // cleanup on component unmount
  }, []);

  return (
    <div className="header-partner">
        <div className="header-partner-container">

        {/* Registration Section */}
            <h1>Đã là đối tác với VCompass</h1>
            <button>Đăng nhập</button>
        </div>
        
        <div className="registration-section">
        {/* Left side content */}
        <div className="left-content">
            <h1>Đăng <span className="highlighted">{selectedOption}</span> của Quý vị trên VCompass</h1>
            <p>
            Dù host là nghề tay trái hay công việc toàn thời gian, hãy đăng {selectedOption} của bạn ngay hôm nay và nhanh chóng có thêm nguồn thu nhập.
            </p>
        </div>

        {/* Right side content - Registration Box */}
        <div className="right-content">
            <div className="registration-box">
            <h2>Đăng ký miễn phí</h2>
            <ul>
                <li>45% host nhận được đơn đặt đầu tiên trong vòng 1 tuần</li>
                <li>Chọn một trong hai cách nhận đơn đặt: xác nhận tức thì và xem trước để duyệt</li>
                <li>Chúng tôi xử lý thanh toán thay Quý vị</li>
            </ul>
            <button className="cta-button">Bắt đầu ngay</button>
            <div className="already-registered">
                <p>Quý vị đã bắt đầu quá trình đăng ký?</p>
                <a href="#continue-registration">Tiếp tục các bước đăng ký</a>
            </div>
            </div>
        </div>
        </div>
    </div>
  );
};

export default HeaderPartner;

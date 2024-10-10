import React, { useState } from 'react';
import { FaRegClock } from "react-icons/fa";
import './Schedule.css';


const TimeSelect = () => {
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(time);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();
  const [startTime, setStartTime] = useState(timeOptions[0]);
  const [endTime, setEndTime] = useState(timeOptions[1]);

  const handleStartChange = (e) => {
    setStartTime(e.target.value);
  };

  const handleEndChange = (e) => {
    const selectedEndTime = e.target.value;
    if (selectedEndTime > startTime) {
      setEndTime(selectedEndTime);
    } else {
      alert('Thời gian kết thúc phải lớn hơn thời gian bắt đầu.');
    }
  };

  // Lọc các tùy chọn giờ cho endTime lớn hơn startTime
  const filteredEndTimeOptions = timeOptions.filter(time => time > startTime);

  return (
    <div>
      <div className="time-select-wrapper">
        <FaRegClock className='icon'/>
        <select className='time-schedule' value={startTime} onChange={handleStartChange}>
          {timeOptions.map((time, index) => (
            <option key={index} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>
      <h6>To</h6>
      <div className="time-select-wrapper">
        <FaRegClock className='icon'/>
        <select className='time-schedule' value={endTime} onChange={handleEndChange}>
          {filteredEndTimeOptions.map((time, index) => (
            <option key={index} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
const Activity = () => {
  return (
    <div className="activity-infor">
      <div className="time-container">
        <TimeSelect/>
      </div>
      <div className="num-activity">
        ----
        <div className="circle-num">
          1
        </div>
        ----
      </div>
      <TourList />
    </div>
  )
}

const TourList = () => {
  const tours = [
    {
      imgSrc: "https://bazantravel.com/cdn/medias/uploads/83/83317-khu-nghi-duong-lan-rung-700x420.jpg",
      title: "Westminster to Greenwich River Thames",
      time: "2 hours",
      price: "$35.00",
    },
    // Thêm nhiều mục tour khác nếu cần
  ];

  return (
    <div className="time-schedule-list">
      {tours.map((tour, index) => (
        <TourItem
          key={index}
          imgSrc={tour.imgSrc}
          title={tour.title}
          time={tour.time}
          price={tour.price}
        />
      ))}
    </div>
  );
};

const TourItem = ({ imgSrc, title, time, price }) => (
  <div className="time-schedule-item">
    <img src={imgSrc} alt={title} className="time-schedule-image" />
    <div className="time-schedule-details">
    <div className="type-activity">
          <p>CHỖ NGHỈ</p>
        </div>
      <div className="time-schedule-header">
        <span className="time-schedule-rating">★★★★☆ (584 reviews)</span>
      </div>
      <h3>{title}</h3>
      <div className="time-schedule-info">
        <i className="fa-solid fa-file"></i>
        <span>Cần phải đem theo nhiều tiền mặt trước khi vào đây bởi vì ở đây có nhiều nơi vui chơi, đồ ăn vặt rất hấp dẫn</span>
      </div>
    </div>
    <div className="time-schedule-price">
      <span className="price-text" >{price}</span>
      <span className="persion-text">per person</span>
    </div>
  </div>
);


const Schedule = () => {
    return (
      <div className="custom-schedule">
        <div className="header-left">
          <h1 className="num-title">Custom Schedule</h1>
          <span className="num-text">49 Activities Found</span>
        </div>
        <div className='schedule-container'>
        <div className="header-container">
        <div className="activity-header">
          <div className='title-des'>
            <h2>TOUR VÙNG TÀU GIÁ RẺ</h2>
            <div className="date-schedule">
             <div className="numday-title">
             <i className="fa-regular fa-calendar-days"></i>
             <p> Từ </p>
             </div>
              <input type="date" />
              <p> Đến </p>
              <input type="date" />
            </div>
            <div className="date-schedule">
            <div className="numday-title">
              <i className="fa-regular fa-clock"></i>
              <p> Số ngày </p>
            </div>
            <p> 3 ngày 2 đêm </p>
            </div>
            <p className='des-schedule'>
                Là một địa điểm du lịch ngon bổ rẻ, Là một địa điểm du lịch ngon bổ rẻ
            </p>
          
          </div>
          <div className="confirm-booking">
            <button className='confirm-btn'>Confirm Booking</button>
            <button className='save-and-share-btn'>
            <i className="fa-solid fa-heart fa-shake book-icon"></i>
           Save To Wishlist</button>
            <button className='save-and-share-btn'>
            <i className="fa-solid fa-share fa-shake book-icon"></i>
            Share The Activity</button>
        </div>
        </div>
        </div>
        <div className="detail-container">
        <div className="activity-details">
          <div className="date-section">
            <h2>Ngày 1</h2>
          
          <Activity/>
          <Activity/>
          <div className="add-new">
            <button> 
            <i class="fa-solid fa-plus add-icon"></i>
              Add New</button>
          </div>
          </div>
        </div>
        </div>
          
        </div>
       
      </div>
    );
  };
  
  export default Schedule;
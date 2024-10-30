/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react";
import { FaEdit, FaRegClock } from 'react-icons/fa';
import { StoreContext } from "../../../Context/StoreContext";

const ActivityTime = ({ timeStart, timeEnd }) => {
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(formattedTime);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Initialize with the start and end times passed from props (time.dateStart, time.dateEnd)
  const [startTime, setStartTime] = useState(timeStart || timeOptions[0]);
  const [endTime, setEndTime] = useState(timeEnd || timeOptions[1]);

  useEffect(() => {
    if (timeStart && timeEnd) {
      setStartTime(timeStart);
      setEndTime(timeEnd);
    }
  }, [timeStart, timeEnd]);

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
  const filteredEndTimeOptions = timeOptions.filter(option => option > startTime);
  return (
    <div className="time-container ">
      <div className="time-select-wrapper">
        <FaRegClock className='icon' />
        <select className='time-schedule' value={timeStart} onChange={handleStartChange}>
          {timeOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <h6>To</h6>
      <div className="time-select-wrapper">
        <FaRegClock className='icon' />
        <select className='time-schedule' value={timeEnd} onChange={handleEndChange}>
          {filteredEndTimeOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export const AccomActivity = ({ data, handleEdit }) => {
  const { url } = useContext(StoreContext);

  if (!data) {
    return (
      <div className="div">...</div>
    )
  }
  return (
    <div className="time-schedule-item">
      <div className="time-schedule-left">
        <div className="type-activity">
          <p>NGHỈ NGƠI</p>
        </div>
        <img src={`${url}/images/${data.images[0]}`} alt={data.title || 'Image'} className="time-schedule-image" />
      </div>
      <div className="time-schedule-details">
        <div className="time-schedule-header">
          <span className="time-schedule-rating">★★★★☆ (584 reviews)</span>
          <h3>{data.name}</h3>
          <div className="time-schedule-location">
            <i className="fa-solid fa-location-dot"></i>
            <a href="#">{data.location.address}</a>
          </div>
          <div className="time-schedule-info">
            <i className="fa-solid fa-file"></i>
            <span>
              {data.description}
            </span>
          </div>
          <div className="list-accom__tour-facilities">
            {data.amenities.map((facility, index) => (
              <span key={index}>{facility}</span>
            ))}
          </div>
        </div>

        <div className="time-schedule-usernote">
          <p >Ăn trưa tại đây nha mn</p>
          <p >Text thêm nếu cần</p>
        </div>
      </div>
      <div className="time-schedule-right">
        <div className="expense-actions">
          <button className="edit-btn"
            onClick={handleEdit}>
            <FaEdit />
          </button>
        </div>
        <div className="time-schedule-price">
          <p className="price-text">100000đ</p>
          <p >Đã thanh toán</p>
        </div>
        <div />
      </div>
    </div>
  )
}
export const FoodServiceActivity = ({ data, handleEdit }) => {
  const { url } = useContext(StoreContext);
  console.log(data)
  if (!data) {
    return (
      <div className="div">...</div>
    )
  }
  return (
    <div className="time-schedule-item">
      <div className="time-schedule-left">
        <div className="type-activity">
          <p>ĂN UỐNG</p>
        </div>
        <img src={`${url}/images/${data.images[0]}`} alt={data.title || 'Image'} className="time-schedule-image" />
      </div>

      <div className="time-schedule-details">
        <div className="time-schedule-header">
          <span className="time-schedule-rating">★★★★☆ (584 reviews)</span>
          <h3>{data.foodServiceName}</h3>
          <div className="time-schedule-location">
            <i className="fa-solid fa-location-dot"></i>
            <a href="#">{data.location.address}</a>
          </div>
          <div className="time-schedule-info">
            <i className="fa-solid fa-file"></i>
            <span>{data.description}</span>
          </div>
          <div className="list-accom__tour-facilities">
            {data.amenities.map((facility, index) => (
              <span key={index}>{facility}</span>
            ))}
          </div>
        </div>

        <div className="time-schedule-usernote">
          <p>Thưởng thức bữa ăn tại đây</p>
          <p>Thông tin thêm nếu cần</p>
        </div>
      </div>

      <div className="time-schedule-right">
        <div className="expense-actions">
          <button className="edit-btn" onClick={handleEdit}>
            <FaEdit />
          </button>
        </div>
        <div className="time-schedule-price">
          <p className="price-text">200000đ</p>
          <p>Đã thanh toán</p>
        </div>
        <div />
      </div>
    </div>

  )
}
export const AttractionActivity = ({ data, handleEdit }) => {
  const { url } = useContext(StoreContext);
  if (!data) {
    return (
      <div className="div">...</div>
    )
  }
  return (
    <div className="time-schedule-item">
      <div className="time-schedule-left">
        <div className="type-activity">
          <p>THAM QUAN</p>
        </div>
        <img src={`${url}/images/${data.images[0]}`} alt={data.title || 'Image'} className="time-schedule-image" />
      </div>

      <div className="time-schedule-details">
        <div className="time-schedule-header">
          <span className="time-schedule-rating">★★★★☆ (584 reviews)</span>
          <h3>{data.name}</h3>
          <div className="time-schedule-location">
            <i className="fa-solid fa-location-dot"></i>
            <a href="#">{data.location.address}</a>
          </div>


          <div className="time-schedule-info">
            <i className="fa-solid fa-file"></i>
            <span>{data.description}</span>
          </div>
        </div>
        <div className="list-accom__tour-facilities">
          {data.amenities.map((facility, index) => (
            <span key={index}>{facility}</span>
          ))}
        </div>
        <div className="time-schedule-usernote">
          <p>Khám phá địa điểm thú vị</p>
          <p>Thông tin thêm nếu cần</p>
        </div>
      </div>

      <div className="time-schedule-right">
        <div className="expense-actions">
          <button className="edit-btn" onClick={handleEdit}>
            <FaEdit />
          </button>
        </div>

        <div className="time-schedule-price">
          <p className="price-text">200000đ</p>
          <p>Đã thanh toán</p>
        </div>
        <div />
      </div>
    </div>

  )
}

export default ActivityTime;

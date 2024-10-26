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
  console.log("Time:", timeStart)
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
  return (
    <div className="time-schedule-item">
      <img src={`${url}/images/${data.images[0]}`} alt={data.title || 'Image'} className="time-schedule-image" />
      <div className="time-schedule-details">
        <div className="type-activity">
          <p>NGHỈ NGƠI</p>
        </div>
        <div className="expense-actions">
          <button className="edit-btn"
            onClick={handleEdit}>
            <FaEdit />
          </button>
        </div>
        <div className="time-schedule-header">
          <span className="time-schedule-rating">★★★★☆ (584 reviews)</span>
        </div>
        <h3>{data.name}</h3>
        <div className="time-schedule-info">
          <i className="fa-solid fa-file"></i>
          <span>
            {data.description}
          </span>
        </div>
      </div>
    </div>
  )
}
export const FoodServiceActivity = ({ data, handleEdit }) => {
  const { url } = useContext(StoreContext);
  return (
    <div className="time-schedule-item">
      <img src={`${url}/images/${data.images[0]}`} alt={data.title || 'Image'} className="time-schedule-image" />
      <div className="time-schedule-details">
        <div className="type-activity">
          <p>ĂN UỐNG</p>
        </div>
        <div className="expense-actions">
          <button className="edit-btn"
            onClick={handleEdit}>
            <FaEdit />
          </button>
        </div>
        <div className="time-schedule-header">
          <span className="time-schedule-rating">★★★★☆ (584 reviews)</span>
        </div>
        <h3>{data.name}</h3>
        <div className="time-schedule-info">
          <i className="fa-solid fa-file"></i>
          <span>
            {data.description}
          </span>
        </div>
      </div>
    </div>
  )
}
export const AttractionActivity = ({ data, handleEdit }) => {
  const { url } = useContext(StoreContext);
  return (
    <div className="time-schedule-item">
      <img src={`${url}/images/${data.images[0]}`} alt={data.title || 'Image'} className="time-schedule-image" />
      <div className="time-schedule-details">
        <div className="type-activity">
          <p>THAM QUAN</p>
        </div>
        <div className="expense-actions">
          <button className="edit-btn"
            onClick={handleEdit}>
            <FaEdit />
          </button>
        </div>
        <div className="time-schedule-header">
          <span className="time-schedule-rating">★★★★☆ (584 reviews)</span>
        </div>
        <h3>{data.name}</h3>
        <div className="time-schedule-info">
          <i className="fa-solid fa-file"></i>
          <span>
            {data.description}
          </span>
        </div>
      </div>
      <div className="list-accom__tour-price">
        <div className="price-container">
          <span className="price-text" >{data.price}</span>
          <span className="persion-text">per person</span>
        </div>
        {
          status === "Schedule" && <SelectButton onClick={handleSelect} />
        }
      </div>
    </div>
  )
}

export default ActivityTime;

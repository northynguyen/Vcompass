/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { FaRegClock } from 'react-icons/fa';

const ActivityTime = ({ time }) => {
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 10) {
        const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(formattedTime);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();
  
  // Initialize with the start and end times passed from props (time.dateStart, time.dateEnd)
  const [startTime, setStartTime] = useState(time?.dateStart || timeOptions[0]);
  const [endTime, setEndTime] = useState(time?.dateEnd || timeOptions[1]);

  useEffect(() => {
    console.log(time);
    if (time?.timeStart && time?.timeEnd) {
      setStartTime(time.timeStart);
      setEndTime(time.timeEnd);
    }
  }, [time]);

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

  // Filter the end time options to only show times later than the selected start time
  const filteredEndTimeOptions = timeOptions.filter(option => option > startTime);

  return (
    <div className="time-container ">
      <div className="time-select-wrapper">
        <FaRegClock className='icon' />
        <select className='time-schedule' value={startTime} onChange={handleStartChange}>
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
        <select className='time-schedule' value={endTime} onChange={handleEndChange}>
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

export default ActivityTime;

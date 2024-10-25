import axios from 'axios';
import React, { useContext, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../Context/StoreContext';
import './CreateSchedule.css';

const CreateSchedule = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const { url, token } = useContext(StoreContext);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const days = calculateDaysAndNights(departureDate, returnDate)
    const schedule = {
      idUser: "123",
      description: `Tour ${destination} ${days.stringDay}`,
      scheduleName: `Tour ${destination} ${days.stringDay}`,
      address: destination,
      imgSrc: "https://bazantravel.com/cdn/medias/uploads/83/83317-khu-nghi-duong-lan-rung-700x420.jpg",
      numDays: days.numDays,
      dateStart: convertDateFormat(departureDate),
      dateEnd: convertDateFormat(returnDate),
      status: "Draft",
      activities: Array.from({ length: days.numDays }, (_, i) => ({
        day: i + 1,
        activity: []
      }))
    }
    try {
      const response = await axios.post(url + "/api/schedule/addNew", { schedule: schedule },
        { headers: { token } }
      );
      if (response.data.success) {
        navigate("/schedule-edit"); // Điều hướng sau khi thêm thành công
      } else {
        console.error("Error adding schedule:", response.data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }

  };

  return (
    <div className="create-schedule-container">
      <div className="step-indicator">
        <span className="step-number">1</span>
        <h2>Bước 1: Chọn điểm đến và thời gian</h2>
      </div>
      <form className="schedule-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="destination">Đến</label>
          <input
            type="text"
            id="destination"
            placeholder="Nhập tên điểm đến"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="departureDate">Ngày đi</label>
          <input
            type="date"
            id="departureDate"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="returnDate">Ngày về</label>
          <input
            type="date"
            id="returnDate"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
        </div>
        <button type="submit" className="submit-button">Lên lịch trình</button>
      </form>
    </div>
  );
};

const calculateDaysAndNights = (dateStart, dateEnd) => {
  const [yearStart, monthStart, dayStart] = dateStart.split("-");
  const [yearEnd, monthEnd, dayEnd] = dateEnd.split("-");

  const startDate = new Date(`${yearStart}-${monthStart}-${dayStart}`);
  const endDate = new Date(`${yearEnd}-${monthEnd}-${dayEnd}`);

  const timeDifference = endDate - startDate; // kết quả là số mili giây
  const daysDifference = timeDifference / (1000 * 3600 * 24); // chuyển mili giây thành số ngày

  // Tính số đêm (số đêm = số ngày - 1)
  const nights = daysDifference - 1;

  // Return kết quả dạng "X ngày Y đêm"
  return {
    stringDay: `${daysDifference} ngày ${nights} đêm`,
    numDays: daysDifference
  }
};
const convertDateFormat = (date) => {
  const [year, month, day] = date.split("-");
  return `${day}-${month}-${year}`;
};
export default CreateSchedule;

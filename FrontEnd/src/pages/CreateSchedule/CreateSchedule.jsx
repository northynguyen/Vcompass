import axios from 'axios';
import React, { useContext, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { StoreContext } from '../../Context/StoreContext';
import './CreateSchedule.css';

const cities = [
  'Hà Nội', 'TP Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Dương', 'Bình Định', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
  'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
  'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
  'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
  'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
  'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
  'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
  'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
];


const CreateSchedule = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState("");
  const [aiLoading, setAiLoading] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const { user, url, token } = useContext(StoreContext);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const days = calculateDaysAndNights(departureDate, returnDate)
    let schedule
    if (type === "ai") {
      if (!destination || !departureDate || !budget) {
        return;
      }
      const city = destination
      const startDate = convertDateFormat(departureDate)
      const numDays = days.numDays
      const userId = user._id
      try {
        const generateScheduleRequest = await fetch(`${url}/api/ai/generateSchedule`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city, startDate, numDays, userId, budget })
        });
        const response = await generateScheduleRequest.json()
        if (response) {
          console.log(response)
          schedule = response
        }
        console.log(response)
      } catch (error) {
        console.error("🚨 Lỗi khi tạo lịch trình bằng AI", error);
        return null;
      }
    } else {
      schedule = {
        idUser: user._id,
        description: `Tour ${destination} ${days.stringDay}`,
        scheduleName: `Tour ${destination} ${days.stringDay}`,
        address: destination,
        imgSrc: [],
        numDays: days.numDays,
        dateStart: convertDateFormat(departureDate),
        dateEnd: convertDateFormat(returnDate),
        status: "Draft",
        activities: Array.from({ length: days.numDays }, (_, i) => ({
          day: i + 1,
          activity: []
        }))
      }
    }
    try {
      const response = await axios.post(url + "/api/schedule/addNew", { schedule: schedule },
        { headers: { token } }
      );
      if (response.data.success) {
        const scheduleId = response.data.schedule._id; // Lấy _id từ phản hồi
        navigate(`/schedule-edit/${scheduleId}`);
      } else {
        console.error("Error adding schedule:", response.data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }

  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    setDestination(input);

    if (input.length > 0) {
      const filtered = cities.filter(city =>
        city.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  };

  const handleCityClick = (city) => {
    setDestination(city);
    setFilteredCities([]);
  };

  // Get today's date in 'YYYY-MM-DD' format
  const today = new Date().toISOString().split('T')[0];

  const handleDepartureDateChange = (e) => {
    setDepartureDate(e.target.value);
  };

  const handleReturnDateChange = (e) => {
    setReturnDate(e.target.value);

    // Reset departure date if it is before the selected return date
    if (departureDate && e.target.value > departureDate) {
      setDepartureDate('');
    }
  };

  return (
    <div className="create-schedule-container">
      <div className="step-indicator">
        <h2>Chọn điểm đến và thời gian</h2>
      </div>
      <form className="schedule-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="destination">Đến</label>
          <input
            type="text"
            id="destination"
            placeholder="Nhập tên điểm đến"
            value={destination}
            onChange={handleInputChange}
            autoComplete="off"
          />
          {filteredCities.length > 0 && (
            <ul className="suggestions-list">
              {filteredCities.map((city, index) => (
                <li key={index} onClick={() => handleCityClick(city)}>
                  {city}
                </li>
              ))}
            </ul>
          )}
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
        {
          type === "ai" &&
          <div className="form-group">
            <label htmlFor="returnDate">Chi phí ước tính</label>
            <input
              type="text"
              id="returnDate"
              placeholder='Từ 2.000.000 - 5.000.000'
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
        }
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
  const daysDifference = timeDifference / (1000 * 3600 * 24) + 1; // chuyển mili giây thành số ngày

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

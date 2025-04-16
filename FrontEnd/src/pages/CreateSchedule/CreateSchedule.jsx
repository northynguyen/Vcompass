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
  const [aiLoading, setAiLoading] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const { user, url, token } = useContext(StoreContext);

  // Thêm state để quản lý lỗi
  const [errors, setErrors] = useState({
    destination: '',
    dates: '',
    types: ''
  });

  const travelTypes = [
    'Du lịch vui chơi',
    'Du lịch học tập',
    'Du lịch nghỉ dưỡng',
    'Du lịch thương mại',
    'Du lịch văn hóa',
    'Du lịch ẩm thực'
  ];

  const handleTypeSelection = (selectedType) => {
    setSelectedTypes(prev => {
      if (prev.includes(selectedType)) {
        return prev.filter(type => type !== selectedType);
      } else {
        return [...prev, selectedType];
      }
    });
  };

  // Hàm validate form
  const validateForm = () => {
    let tempErrors = {
      destination: '',
      dates: '',
      types: ''
    };
    let isValid = true;

    // Validate điểm đến
    if (!destination.trim()) {
      tempErrors.destination = 'Vui lòng chọn điểm đến';
      isValid = false;
    }

    // Validate ngày đi và ngày về
    if (!departureDate) {
      tempErrors.dates = 'Vui lòng chọn ngày đi';
      isValid = false;
    } else if (!returnDate) {
      tempErrors.dates = 'Vui lòng chọn ngày về';
      isValid = false;
    } else {
      const start = new Date(departureDate);
      const end = new Date(returnDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        tempErrors.dates = 'Ngày đi không thể là ngày trong quá khứ';
        isValid = false;
      } else if (end < start) {
        tempErrors.dates = 'Ngày về phải sau ngày đi';
        isValid = false;
      }
    }

    // Validate loại hình du lịch
    if (selectedTypes.length === 0) {
      tempErrors.types = 'Vui lòng chọn ít nhất một loại hình du lịch';
      isValid = false;
    }

    // Validate budget cho AI tour
    if (type === "ai" && !budget.trim()) {
      tempErrors.budget = 'Vui lòng nhập ngân sách dự kiến';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setAiLoading(true);

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
      } finally {
        setAiLoading(false);
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
        type: selectedTypes,
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
      {aiLoading && (
        <div className="loading-indicator">
          <img src="/src/assets/logo_ai.png" alt="Loading..." />
          <p>Đang tạo lịch trình...</p>
        </div>
      )}
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
            className={errors.destination ? 'error-input' : ''}
          />
          {errors.destination && <div className="error-message">{errors.destination}</div>}
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
            min={new Date().toISOString().split('T')[0]}
            className={errors.dates ? 'error-input' : ''}
          />
        </div>
        <div className="form-group">
          <label htmlFor="returnDate">Ngày về</label>
          <input
            type="date"
            id="returnDate"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            min={departureDate || new Date().toISOString().split('T')[0]}
            className={errors.dates ? 'error-input' : ''}
          />
          {errors.dates && <div className="error-message">{errors.dates}</div>}
        </div>
        <div className="form-group">
          <label>Loại hình du lịch</label>
          <div className="travel-types-container">
            {travelTypes.map((travelType, index) => (
              <button
                key={index}
                type="button"
                className={`type-button ${selectedTypes.includes(travelType) ? 'selected' : ''} ${errors.types ? 'error-input' : ''}`}
                onClick={() => handleTypeSelection(travelType)}
              >
                {travelType}
              </button>
            ))}
          </div>
          {errors.types && <div className="error-message">{errors.types}</div>}
        </div>
        {
          type === "ai" &&
          <div className="form-group">
            <label htmlFor="budget">Chi phí ước tính</label>
            <input
              type="text"
              id="budget"
              placeholder='Từ 2.000.000 - 5.000.000'
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className={errors.budget ? 'error-input' : ''}
            />
            {errors.budget && <div className="error-message">{errors.budget}</div>}
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

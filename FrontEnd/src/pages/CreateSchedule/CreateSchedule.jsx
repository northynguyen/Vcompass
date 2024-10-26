import React, { useState } from 'react';
import './CreateSchedule.css';

const cities = [
  // List of cities as before
  'Hà Nội', 'TP Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 
  'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh',
  // Add other cities here
];

const CreateSchedule = () => {
  const [destination, setDestination] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [isDateUncertain, setIsDateUncertain] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      destination,
      departureDate,
      returnDate,
      isDateUncertain
    });
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
          <label>
            <input
              type="checkbox"
              checked={isDateUncertain}
              onChange={() => setIsDateUncertain(!isDateUncertain)}
            />
            Chưa xác định thời gian
          </label>
        </div>
        {!isDateUncertain && (
          <>
            <div className="form-group">
              <label htmlFor="departureDate">Ngày đi</label>
              <input
                type="date"
                id="departureDate"
                value={departureDate}
                onChange={handleDepartureDateChange}
                // Set min as today or return date
                min={returnDate ? returnDate : today}
              />
            </div>
            <div className="form-group">
              <label htmlFor="returnDate">Ngày về</label>
              <input
                type="date"
                id="returnDate"
                value={returnDate}
                onChange={handleReturnDateChange}
                // Set min as today
                min={today}
              />
            </div>
          </>
        )}
        <button type="submit" className="submit-button">Lên lịch trình</button>
      </form>
    </div>
  );
};

export default CreateSchedule;

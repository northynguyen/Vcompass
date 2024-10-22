import React, { useState } from 'react';
import './CreateSchedule.css';

const CreateSchedule = () => {
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [isDateUncertain, setIsDateUncertain] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle the schedule creation logic here
    console.log({
      destination,
      departureDate,
      returnDate,
      isDateUncertain
    });
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
          </>
        )}
        <button type="submit" className="submit-button">Lên lịch trình</button>
      </form>
    </div>
  );
};

export default CreateSchedule;

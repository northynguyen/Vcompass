import axios from "axios";
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import './MySchedule.css';

const MySchedule = () => {
  const { url, token } = useContext(StoreContext)
  const [schedules, setSchedules] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate();
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get(`${url}/api/schedule/user/getSchedules`,
          { headers: { token } }
        );
        if (response.data.success) {
          setSchedules(response.data.schedules);
          setIsLoading(false);
        } else {
          console.error("Failed to fetch schedules:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };
    fetchSchedules();
  }, [token]);

  const handleScheduleClick = (id) => {
    navigate(`/schedule-edit/${id}`);
  };

  return (
    <div className="my-schedule-container">
      <header className="hero-section">
        <h1>Tạo lịch trình du lịch dễ dàng cho chuyến đi của bạn</h1>
        <p>Chỉ mất 3-5 phút, bạn có thể tạo ngay cho mình lịch trình du lịch</p>
        <button className="create-schedule-btn" onClick={() => navigate('/create-schedule')}>Tạo lịch trình</button>
      </header>
      <section className="my-schedule-section">
        <h2>Lịch trình của tôi</h2>
        {!isLoading && (
          schedules.map(schedule => (
            <div key={schedule._id} className="my-schedule-card" onClick={() => handleScheduleClick(schedule._id)} >
              <img src="https://h3jd9zjnmsobj.vcdn.cloud/public/v7/banner/tourists-min-02.png" alt="My Schedule" />
              <div className="schedule-info">
                <h3>{schedule.scheduleName}</h3>
                <p>{schedule.dateStart} - {schedule.dateEnd}</p>
              </div>
            </div>
          )))
        }
      </section>


      <section className="steps-section">
        <h2>Các bước tạo lịch trình</h2>
        <div className="steps-container">
          <div className="step">
            <img src="https://h3jd9zjnmsobj.vcdn.cloud/public/v7/plan/lich-trinh-icon-1.png" alt="Step 1" />
            <h4>Tạo lịch trình</h4>
            <p>Tạo lịch trình với những hoạt động tùy thích</p>
          </div>
          <div className="step">
            <img src="https://h3jd9zjnmsobj.vcdn.cloud/public/v7/plan/lich-trinh-icon-2.png" alt="Step 2" />
            <h4>Tùy chỉnh</h4>
            <p>Tùy chỉnh lịch trình của bạn theo nhu cầu</p>
          </div>
          <div className="step">
            <img src="https://h3jd9zjnmsobj.vcdn.cloud/public/v7/plan/lich-trinh-icon-3.png" alt="Step 3" />
            <h4>Hoàn tất</h4>
            <p>Hoàn tất lịch trình và sẵn sàng</p>
          </div>
          <div className="step">
            <img src="	https://h3jd9zjnmsobj.vcdn.cloud/public/v7/plan/lich-trinh-icon-4.png" alt="Step 4" />
            <h4>Let's go</h4>
            <p>Bắt đầu chuyến đi của bạn</p>
          </div>
        </div>
      </section>

      <section className="featured-schedules-section">
        <h2>Lịch trình yêu thích</h2>
        <div className="schedule-filters">
          <button>Hà Nội</button>
          <button>Đà Lạt</button>
          <button>Vũng Tàu</button>
          <input type="text" placeholder="Tìm kiếm lịch trình" />
        </div>
        {!isLoading &&
          <div className="featured-schedules">
            {schedules.map(schedule => (
              <div key={schedule._id} className="schedule-card" onClick={() => handleScheduleClick(schedule._id)}>
                <img src="https://h3jd9zjnmsobj.vcdn.cloud/public/v7/banner/tourists-min-02.png" alt={schedule.scheduleName} />
                <div className="schedule-info">
                  <h3>{schedule.scheduleName}</h3>
                  <p>Địa điểm: {schedule.address}</p>
                  <p>Ngày bắt đầu: {schedule.dateStart}</p>
                  <p>Số ngày: {schedule.numDays} ngày {schedule.numDays - 1} đêm</p>
                  <p>Người tạo: Tôi</p>
                </div>
              </div>
            ))}
          </div>
        }
      </section>
    </div>
  );
};

export default MySchedule;

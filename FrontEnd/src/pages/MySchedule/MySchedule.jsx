import React from 'react';
import './MySchedule.css';
import { useNavigate } from 'react-router-dom'; // Assuming you're using react-router-dom

const MySchedule = () => {
  const navigate = useNavigate();

  // Fake data for schedules
  const featuredSchedules = [
    {
      id: 1,
      name: "Hà Nội 2 ngày 1 đêm",
      location: "Việt Nam - Hà Nội",
      days: 2,
      createdBy: "Dung Tung Duong (KT H7)",
      date: "29/07/2023"
    },
    {
      id: 2,
      name: "Đà Lạt 3 ngày 2 đêm",
      location: "Việt Nam - Đà Lạt",
      days: 3,
      createdBy: "Huyền Nguyễn",
      date: "06/10/2023"
    },
    {
        id: 2,
        name: "Đà Lạt 3 ngày 2 đêm",
        location: "Việt Nam - Đà Lạt",
        days: 3,
        createdBy: "Huyền Nguyễn",
        date: "06/10/2023"
      },
      {
        id: 3,
        name: "Đà Lạt 3 ngày 2 đêm",
        location: "Việt Nam - Đà Lạt",
        days: 3,
        createdBy: "Huyền Nguyễn",
        date: "06/10/2023"
      },
      {
        id: 4,
        name: "Đà Lạt 3 ngày 2 đêm",
        location: "Việt Nam - Đà Lạt",
        days: 3,
        createdBy: "Huyền Nguyễn",
        date: "06/10/2023"
      },
    // Add more dummy schedules as needed
  ];

  const handleScheduleClick = (id) => {
    // Navigate to the details page of the schedule
    navigate(`/schedule/${id}`);
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
        <div className="my-schedule-card">
          <img src="https://h3jd9zjnmsobj.vcdn.cloud/public/v7/banner/tourists-min-02.png" alt="My Schedule" />
          <div className="schedule-info">
            <h3>Vũng Tàu 3 ngày 2 đêm</h3>
            <p>Ngày 12/08/2023 - 15/08/2023</p>
          </div>
        </div>
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
        <h2>Lịch trình nổi bật</h2>
        <div className="schedule-filters">
          <button>Hàn Quốc</button>
          <button>Đà Lạt</button>
          <button>Trung Quốc</button>
          <input type="text" placeholder="Tìm kiếm lịch trình" />
        </div>

        <div className="featured-schedules">
          {featuredSchedules.map(schedule => (
            <div key={schedule.id} className="schedule-card" onClick={() => handleScheduleClick(schedule.id)}>
              <img src="https://h3jd9zjnmsobj.vcdn.cloud/public/v7/banner/tourists-min-02.png" alt={schedule.name} />
              <div className="schedule-info">
                <h3>{schedule.name}</h3>
                <p>Địa điểm: {schedule.location}</p>
                <p>Ngày: {schedule.date}</p>
                <p>Người tạo: {schedule.createdBy}</p>
                <p>Số ngày: {schedule.days}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MySchedule;

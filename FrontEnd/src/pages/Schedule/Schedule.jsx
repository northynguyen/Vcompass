/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import ActivityTime from "./ActivityTime/ActivityTime";
import AddActivity from "./AddActivity/AddActivity";
import Expense from "./Expense/Expense";
import "./Schedule.css";

const Activity = ({ activity }) => {
  return (
    console.log(activity),
    <div className="time-schedule-list">
      {activity.length > 0 && activity.map((myactivity, index) => (
        <ActivityItem
          key={index}
          imgSrc={myactivity.imgSrc}
          title={myactivity.title}
          time={myactivity.time}
          price={myactivity.price}
          index={index}
        />
      ))}
    </div>
  );
};

const ActivityItem = ({ index, imgSrc, title, time, price }) => (
  <div className="activity-infor">
    <ActivityTime time={time}></ActivityTime>
    <div className="num-activity">
      ----
      <div className="circle-num">{index + 1}</div>
      ----
    </div>
    <div className="time-schedule-item">
      <img src={imgSrc} alt={title} className="time-schedule-image" />
      <div className="time-schedule-details">
        <div className="type-activity">
          <p>CHỖ NGHỈ</p>
        </div>
        <div className="time-schedule-header">
          <span className="time-schedule-rating">★★★★☆ (584 reviews)</span>
        </div>
        <h3>{title}</h3>
        <div className="time-schedule-info">
          <i className="fa-solid fa-file"></i>
          <span>
            Cần phải đem theo nhiều tiền mặt trước khi vào đây bởi vì ở đây có
            nhiều nơi vui chơi, đồ ăn vặt rất hấp dẫn
          </span>
        </div>
      </div>
      <div className="time-schedule-price">
        <span className="price-text">{price}</span>
        <span className="persion-text">per person</span>
      </div>
    </div>
  </div>
);

const InforScheduleMedal = ({ isOpen, closeModal, selectedExpense, setAddtionExpense }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      className="add-expense-modal"
      overlayClassName="modal-overlay"
    >
      <div className="add-activity">
        <div className="modal-header">
          <h4>Thêm chi phí phát sinh</h4>
          <button onClick={closeModal} className="close-btn">
            <i className="fa-regular fa-circle-xmark"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="expense-sub-title" htmlFor="name-expense">Tên chi phí</label>
            <input className="input-field"
              id="name-expense" required
              name="name"
              placeholder="Nhập tên chi phí"
              value={formData.name}
              onChange={handleChange}
            ></input>
            <label className="expense-sub-title" htmlFor="expense">Số tiền</label>
            <input className="input-field"
              type="number"
              id="expense"
              name="cost"
              required
              placeholder="Nhập số tiền"
              value={formData.cost}
              onChange={handleChange}></input>
            <label className="expense-sub-title" htmlFor="des">Ghi chú</label>
            <textarea
              placeholder="Nhập ghi chú chi tiết"
              className="input-field" id="des"
              name="description"
              value={formData.description}
              onChange={handleChange}></textarea>
          </div>
        </div>
        <div className="modal-footer">
          {isEditMode && (
            <button className="delete-btn" onClick={handleDeleteClick}>
              Xóa
            </button>
          )}
          <button className="save-btn"
            onClick={handleSubmit}>Lưu</button>
        </div>
        <ConfirmDialog
          isOpen={isConfirmDeleteOpen}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          message="Bạn có chắc chắn muốn xóa mục này không?"
        />
      </div>
    </Modal>
  );
}

const DateSchedule = ({ schedule }) => {
  const [scheduleDate, setScheduleDate] = useState(schedule);
  const [isOpen, setIsOpen] = useState(true); // State để quản lý việc thu gọn hoặc mở chi tiết
  const [isModalOpen, setIsModalOpen] = useState(false); // State để quản lý trạng thái popup

  useEffect(() => {
    console.log(schedule);
    if (schedule) {
      setScheduleDate(schedule); // Only set when schedule is valid
    }
  }, [schedule]);

  const toggleDetails = () => {
    setIsOpen(!isOpen); // Chuyển đổi trạng thái hiển thị chi tiết
  };

  const openModal = () => {
    setIsModalOpen(true); // Mở popup
  };

  const closeModal = () => {
    setIsModalOpen(false); // Đóng popup
  };

  return (
    <div className="detail-container">
      <div className="activity-details">
        <div className="date-section">
          <h2>
            Ngày {scheduleDate.date}{" "}
            {/* Thêm icon drop down/up */}
            <i
              className={`fa-solid ${isOpen ? "fa-chevron-down" : "fa-chevron-left"}`}
              style={{ cursor: "pointer" }}
              onClick={toggleDetails}
            ></i>
          </h2>

          {isOpen && scheduleDate.activity && scheduleDate.activity.length > 0 ? (
            <Activity activity={scheduleDate.activity} />
          ) : (
            isOpen && <p>No activities scheduled</p>
          )}

          {/* Nếu đang mở, thêm nút thêm mới */}
          {isOpen && (
            <div className="add-new">
              <button onClick={openModal}>
                <i className="fa-solid fa-plus add-icon"></i>
                Add New
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hiển thị popup khi bấm Add New */}
      <AddActivity isOpen={isModalOpen} closeModal={closeModal} />
    </div>
  );
};

const parseDate = (dateString) => {
  const parts = dateString.split('/');
  return new Date(parts[2], parts[1] - 1, parts[0]); // Tháng trong Date bắt đầu từ 0
};

const Schedule = () => {

  const MyTour = {
    name: "Vung Tau 3 ngay 2 dem",
    imgSrc: "https://bazantravel.com/cdn/medias/uploads/83/83317-khu-nghi-duong-lan-rung-700x420.jpg",
    time:
    {
      dateStart: "10-11-2022",
      dateEnd: "11-11-2022",
    }
    ,
    description: "Vung Tau 3 ngay 2 dem",
    address: "Vung Tau",
    schedule: [
      {
        date: 1,
        activity: [
          {
            imgSrc:
              "https://bazantravel.com/cdn/medias/uploads/83/83317-khu-nghi-duong-lan-rung-700x420.jpg",
            title: "Westminster to Greenwich River Thames",
            time:
            {
              timeStart: "00:10",
              timeEnd: "10:10",
            },
            price: "$350000",
            type: "Hotel",
          },
          {
            imgSrc:
              "https://bazantravel.com/cdn/medias/uploads/83/83317-khu-nghi-duong-lan-rung-700x420.jpg",
            title: "Westminster to Greenwich River Thames",
            time:
            {
              timeStart: "00:10",
              timeEnd: "10:10",
            },
            price: "$3500000",
            type: "Hotel",
          },
        ]
      },
      {
        date: 2,
        activity: [
          {
            imgSrc:
              "https://bazantravel.com/cdn/medias/uploads/83/83317-khu-nghi-duong-lan-rung-700x420.jpg",
            title: "Westminster to Greenwich River Thames",
            time:
            {
              timeStart: "00:10",
              timeEnd: "10:10",
            },

            price: "$3500000",
            type: "Hotel",
          },
        ]
      },
    ]
  };
  const [additionExpenses, setAdditionExpenses] = useState([
    {
      id: "123",
      name: "Tiền ăn ốc",
      cost: 100000,
      description: "Ăn ốc ở bãi sau siêu ngon, nên đem nhiều tiền"
    },
    {
      id: "1234",
      name: "Tiền cà phê võng",
      cost: 1000000,
      description: "Khi chưa check-in thì đây là một địa điểm tuyệt vời để nghỉ ngơi sau một chuyến đi dài"
    }
  ]);
  const [inforSchedule, setInforSchedule] = useState(
    {
      name: "Tour Vũng Tàu",
      startDay: parseDate("16/12/2024"),
      endDate: parseDate("16/12/2024"),
      numDays: 2,
      description: "Ăn ốc ở bãi sau siêu ngon, nên đem nhiều tiền"
    }
  );

  const extractExpenses = (tour) => {
    const expenses = [];

    tour.schedule.forEach((day) => {
      day.activity.forEach((activity) => {
        const expense = {
          id: Math.random(), // Tạo id ngẫu nhiên, bạn có thể thay đổi cách tạo id
          name: activity.title,
          location: tour.address, // Dùng address chung từ MyTour
          cost: parseFloat(activity.price.replace(/[^0-9.-]+/g, "")), // Lấy giá và chuyển về số
          icon: activity.imgSrc, // Dùng ảnh từ activity
        };
        expenses.push(expense);
      });
    });

    return expenses;
  };

  const convertDateFormat = (date) => {
    const [day, month, year] = date.split("-");
    return `${day}-${month}-${year}`;
  };


  const calculateDaysAndNights = (dateStart, dateEnd) => {
    const [dayStart, monthStart, yearStart] = dateStart.split("-");
    const [dayEnd, monthEnd, yearEnd] = dateEnd.split("-");

    const startDate = new Date(`${yearStart}-${monthStart}-${dayStart}`);
    const endDate = new Date(`${yearEnd}-${monthEnd}-${dayEnd}`);

    const timeDifference = endDate - startDate; // kết quả là số mili giây
    const daysDifference = timeDifference / (1000 * 3600 * 24); // chuyển mili giây thành số ngày

    // Tính số đêm (số đêm = số ngày - 1)
    const nights = daysDifference - 1;

    // Return kết quả dạng "X ngày Y đêm"
    return `${daysDifference} ngày ${nights} đêm`;
  };


  const [dateStart, setDateStart] = useState(convertDateFormat(MyTour.time.dateStart));
  const [dateEnd, setDateEnd] = useState(convertDateFormat(MyTour.time.dateEnd));

  const handleDateStartChange = (e) => {
    setDateStart(e.target.value);
  };

  const handleDateEndChange = (e) => {
    setDateEnd(e.target.value);
  };

  return (
    <div className="custom-schedule">
      <div className="header-left">
        <h1 className="num-title">Custom Schedule</h1>
        <span className="num-text">49 Activities Found</span>
      </div>
      <div className="schedule-container">
        <div className="header-container">
          <div className="activity-header">
            <div className="title-des">
              <h2>{MyTour.name}</h2>
              <div className="date-schedule">
                <div className="numday-title">
                  <i className="fa-regular fa-calendar-days"></i>
                  <p>Từ</p>
                </div>
                {/* Bind the date input to dateStart state */}
                <input
                  value={dateStart}
                  onChange={handleDateStartChange} // Update dateStart on change
                />
                <p>Đến</p>
                {/* Bind the date input to dateEnd state */}
                <input
                  value={dateEnd}
                  onChange={handleDateEndChange} // Update dateEnd on change
                />
              </div>
              <div className="date-schedule">
                <div className="numday-title">
                  <i className="fa-regular fa-clock"></i>
                  <p>Số ngày</p>
                </div>
                <p>{calculateDaysAndNights(dateStart, dateEnd)}</p>
              </div>
              <p className="des-schedule">{MyTour.description}</p>
            </div>
            <div className="confirm-booking">
              <div className="title-button">
                <i className="fa-solid fa-pen schedule-icon"></i>
                <button button className="save-and-share-btn">Chỉnh sửa thông tin</button>
              </div>
              <div className="title-button">
                <i className="fa-solid fa-heart schedule-icon"></i>
                <button className="save-and-share-btn">Lưu lịch trình</button>
              </div>
              <div className="title-button">
                <i className="fa-solid fa-share schedule-icon"></i>
                <button className="save-and-share-btn">Chia sẻ lịch trình</button>
              </div>
            </div>
          </div>
        </div>
        {MyTour.schedule?.length > 0 ? (
          MyTour.schedule.map((schedule, index) => {
            return <DateSchedule key={index} schedule={schedule} />;
          })
        ) : (
          <p>No schedule available</p>
        )}
      </div>
      <div className="footer-schedule">
        <Expense
          expenses={extractExpenses(MyTour)}
          additionExpenses={additionExpenses}
          setAddtionExpense={setAdditionExpenses} />
      </div>

      <div className="save-schedule">
        <button className="btn-save-schedule">Hoàn thành</button>
      </div>
    </div>
  );
};

export default Schedule;

/* eslint-disable react/prop-types */
import axios from 'axios';
import { useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import { useParams } from 'react-router-dom';
import { StoreContext } from "../../Context/StoreContext";
import ActivityTime, { AccomActivity, AttractionActivity, FoodServiceActivity } from "./ActivityTime/ActivityTime";
import AddActivity from "./AddActivity/AddActivity";
import Expense from "./Expense/Expense";
import Comment from "./Comment/Comment";
import "./Schedule.css";

const Activity = ({ activity, setCurrentActivity, setCurrentDestination, openModal, setInforSchedule, mode }) => {
  return (
    <div className="time-schedule-list">
      {activity.length > 0 && activity.map((myactivity, index) => (
        <ActivityItem
          key={index}
          activity={myactivity}
          index={index}
          setCurrentDestination={setCurrentDestination}
          setInforSchedule={setInforSchedule}
          setCurrentActivity={setCurrentActivity}
          openModal={openModal}
          mode = {mode}
        />
      ))}
    </div>
  );
};

const ActivityItem = ({ index, activity, setCurrentActivity, setCurrentDestination, openModal, setInforSchedule, mode }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { url } = useContext(StoreContext);
  const fetchData = async (id, type) => {
    try {
      let response;
      switch (type) {
        case 'Accommodation':
          response = await fetch(`${url}/api/accommodations/getAccomm/${id}`);
          break;
        case 'FoodService':
          response = await fetch(`${url}/api/foodservices/${id}`);
          break;
        case 'Attraction':
          response = await fetch(`${url}/api/attractions/${id}`);
          break;
        default:
          throw new Error('Unknown type');
      }
      const result = await response.json();
      setIsLoading(false)
      if (!response.ok) {
        throw new Error(result.message || 'Error fetching data');
      }
      setData(result);
    } catch (err) {
      console.log(err)
    } finally { }
  };


  useEffect(() => {
    if (activity?.idDestination && activity?.activityType) {
      fetchData(activity.idDestination, activity.activityType);
    }
  }, [activity]);
  const handleEdit = () => {
    setCurrentActivity(activity);
    switch (activity.activityType) {
      case 'Accommodation':
        data.accommodation.activityType = "Accommodation";
        setCurrentDestination(data.accommodation)
        break
      case 'FoodService':
        data.foodService.activityType = "FoodService";
        setCurrentDestination(data.foodService)
        break;
      case 'Attraction':
        data.attraction.activityType = "Attraction";
        setCurrentDestination(data.attraction)
        break;
      default:
        throw new Error('Unknown type');
    }
    openModal();
  };

  return (
    <div className="activity-infor">
      <ActivityTime activity={activity} mode = {mode}
        setInforSchedule={setInforSchedule} />
      <div className="num-activity">
        -
        <div className="circle-num">{index + 1}</div>
        -
      </div>
      {!isLoading && (
        <>
          {activity.activityType === "Accommodation" && (
            <AccomActivity data={data.accommodation} activity={activity} handleEdit={handleEdit} />
          )}
          {activity.activityType === "FoodService" && (
            < FoodServiceActivity data={data.foodService} activity={activity} handleEdit={handleEdit} />
          )}
          {activity.activityType === "Attraction" && (
            <AttractionActivity data={data.attraction} activity={activity} handleEdit={handleEdit} />
          )}
        </>
      )}
    </div>
  );
}
const convertDateFormat = (date) => {
  const [day, month, year] = date.split("-");
  return `${day}-${month}-${year}`;
};
const InforScheduleMedal = ({ isOpen, closeModal, inforSchedule, setInforSchedule }) => {
  const [formData, setFormData] = useState({
    name: "",
    startDay: parseDate("16/12/1999"),
    endDate: parseDate("16/12/1999"),
    numDays: 0,
    description: ""
  });

  useEffect(() => {
    if (inforSchedule) {
      setFormData({
        name: inforSchedule.scheduleName || "",
        startDay: inforSchedule.dateStart || parseDate("16/12/1999"),
        endDate: inforSchedule.dateEnd || parseDate("16/12/1999"),
        numDays: inforSchedule.numDays || 0,
        description: inforSchedule.description || ""
      });
    } else {
      setFormData({
        name: "",
        startDay: parseDate("16/12/1999"),
        endDate: parseDate("16/12/1999"),
        numDays: 0,
        description: ""
      });
    }
  }, [inforSchedule]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'numDays' ? Number(value) : value,
    }));
  };

  const handleSubmit = () => {
    setInforSchedule((prev) => ({
      ...prev,
      ...formData,
    }));

    closeModal();
  };
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      className="add-expense-modal"
      overlayClassName="modal-overlay"
    >
      <div className="add-activity">
        <div className="modal-header">
          <h4>Chỉnh sửa lịch trình</h4>
          <button onClick={closeModal} className="close-btn">
            <i className="fa-regular fa-circle-xmark"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="expense-sub-title" htmlFor="name-expense">Tên lịch trình</label>
            <input className="input-field"
              id="name-expense" required
              name="name"
              placeholder="Nhập tên chi phí"
              value={formData.name}
              onChange={handleChange}
            ></input>
            <label className="expense-sub-title" htmlFor="expense-date">Chọn ngày bắt đầu</label>
            <input
              className="input-field"
              type="date"
              id="expense-date"
              name="dateTime"
              required
              min={new Date().toISOString().split("T")[0]}
              value={formData.dateTime}
              onChange={handleChange}
              placeholder="Chọn ngày và giờ"
            />
            <label className="expense-sub-title" htmlFor="des">Mô tả</label>
            <textarea
              placeholder="Nhập ghi chú chi tiết"
              className="input-field" id="des"
              name="description"
              value={formData.description}
              onChange={handleChange}></textarea>
          </div>
        </div>
        <div className="modal-footer">
          <button className="save-btn"
            onClick={handleSubmit}>Lưu</button>
        </div>
      </div>
    </Modal>
  );
}


const DateSchedule = ({ schedule, setInforSchedule, mode , city }) => {

  const [scheduleDate, setScheduleDate] = useState(schedule);
  const [isOpen, setIsOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [currentDestination, setCurrentDestination] = useState(null);

  useEffect(() => {
    if (schedule) {
      setScheduleDate(schedule);
      setCurrentActivity(null)
      setCurrentDestination(null)
    }
  }, [schedule]);
  useEffect(() => {
    if (!isModalOpen) {
      setCurrentActivity(null)
      setCurrentDestination(null)
    }
  }, [isModalOpen]);
  const toggleDetails = () => {
    setIsOpen(!isOpen);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };


  return (
    <div className="detail-container">
      <div className="activity-details">
        <div className="date-section">
          <h2>
            Ngày {scheduleDate.day}{" "}
            <i className={`fa-solid ${isOpen ? "fa-chevron-down" : "fa-chevron-left"}`}
              style={{ cursor: "pointer" }}
              onClick={toggleDetails}
            ></i>
          </h2>
          {isOpen && scheduleDate.activity && scheduleDate.activity.length > 0 ? (
            <Activity activity={scheduleDate.activity} setCurrentActivity={setCurrentActivity}
              openModal={openModal} setInforSchedule={setInforSchedule}
              setCurrentDestination={setCurrentDestination} mode={mode} />
          ) : (
            isOpen && <p>No activities scheduled</p>
          )}
          {isOpen && mode === "edit" && (
            <div className="add-new">
              <button onClick={openModal}>
                <i className="fa-solid fa-plus add-icon"></i>
                Thêm mới
              </button>
            </div>
          )}
        </div>
      </div>

      <AddActivity
        isOpen={isModalOpen}
        closeModal={closeModal}
        currentDay={scheduleDate.day}
        activity={currentActivity}
        destination={currentDestination}
        setInforSchedule={setInforSchedule}
      />
    </div>
  );
};

const parseDate = (dateString) => {
  const parts = dateString.split('/');
  return new Date(parts[2], parts[1] - 1, parts[0]); // Tháng trong Date bắt đầu từ 0
};

const Schedule = ({ mode }) => {
  const { url } = useContext(StoreContext)
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [inforSchedule, setInforSchedule] = useState(null)
  const [isOpenInforSchedule, setIsOpenInforSchedule] = useState(false);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get(`${url}/api/schedule/${id}`);
        setInforSchedule(response.data.schedule)
        setLoading(false);
      } catch (error) {
        console.error("Error fetching schedule:", error);
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [id]);

  useEffect(() => {
    if (inforSchedule) {
      console.log("inforSchedule", inforSchedule);
      console.log("mode:", mode);
      setDateStart(convertDateFormat(inforSchedule.dateStart))
      setDateEnd(convertDateFormat(inforSchedule.dateEnd))
    }
  }, [loading]);
  useEffect(() => {
    if (inforSchedule && mode === "edit") {
      const updateSchedule = async () => {
        try {
          const response = await axios.put(`${url}/api/schedule/update/${inforSchedule._id}`, {
            ...inforSchedule,
          });
          if (response.data.success) {
            console.log("Cập nhật lịch trình thành công:", response.data);
          } else {
            console.error("Lỗi khi cập nhật lịch trình:", response.data.message);
          }
        } catch (error) {
          console.error("Lỗi:", error);
        }
      };
      updateSchedule();
    }
  }, [inforSchedule]);

  const openInforSchedule = () => {
    setIsOpenInforSchedule(true);
  };
  const closeInforSchedule = () => {
    setIsOpenInforSchedule(false);
  };

  const extractExpenses = (tour) => {
    const expenses = [];
    tour.activities.forEach((day) => {
      day.activity.forEach((activity) => {
        const expense = {
          id: Math.random(),
          name: activity.title,
          location: tour.address,
          cost: activity.cost,
          icon: activity.imgSrc,
        };
        expenses.push(expense);
      });
    });
    return expenses;
  };
  const extractAdditionExpenses = (tour) => {
    const additonExpenses = [];
    tour.additionalExpenses.forEach((addExpense) => {
      const additonExpense = {
        id: addExpense._id,
        name: addExpense.name,
        cost: addExpense.cost,
        description: addExpense.description,
      };
      additonExpenses.push(additonExpense);
    });
    return additonExpenses;
  };

  const calculateDaysAndNights = (dateStart, dateEnd) => {
    const [dayStart, monthStart, yearStart] = dateStart.split("-");
    const [dayEnd, monthEnd, yearEnd] = dateEnd.split("-");
    const startDate = new Date(`${yearStart}-${monthStart}-${dayStart}`);
    const endDate = new Date(`${yearEnd}-${monthEnd}-${dayEnd}`);
    const timeDifference = endDate - startDate;
    const daysDifference = timeDifference / (1000 * 3600 * 24);
    const nights = daysDifference - 1;
    return `${daysDifference} ngày ${nights} đêm`;
  };
  const handleDateStartChange = (e) => {
    setDateStart(e.target.value);
  };
  const handleDateEndChange = (e) => {
    setDateEnd(e.target.value);
  };
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="custom-schedule">
      <div className="custom-schedule-header">
        <div >
          <h1 className="num-title">{mode === "view" ? "Xem  lịch trình" : "Chỉnh sửa lịch trình"}</h1>
          <span className="num-text">Tác giả: {inforSchedule.idUser.name}</span>
        </div>
        <div >
          {
            mode === "view" &&
            <button className="custom-schedule-btn">Chỉnh sửa ngay</button>
          }

        </div>
      </div>
      <div className="schedule-container">
      <img
        className="custom-schedule-image"
        src="https://www.travelalaska.com/sites/default/files/2022-01/Haida-GlacierBay-GettyImages-1147753605.jpg"
        alt="Alaska"
      />
        <div className="header-container">
          <div className="activity-header">
            <div className="title-des">
              <h2>{inforSchedule.scheduleName}</h2>
              <div className="date-schedule">
                <div className="numday-title">
                  <i className="fa-regular fa-calendar-days"></i>
                  <p>Từ</p>
                </div>
                <input
                  value={dateStart}
                  onChange={handleDateStartChange}
                  disabled={true}
                />
                <p>Đến</p>
                {/* Bind the date input to dateEnd state */}
                <input
                  value={dateEnd}
                  onChange={handleDateEndChange}
                  disabled={true}
                />
              </div>
              <div className="date-schedule">
                <div className="numday-title">
                  <i className="fa-regular fa-clock"></i>
                  <p>Số ngày</p>
                </div>
                <p>{calculateDaysAndNights(dateStart, dateEnd)}</p>
              </div>
              <p className="des-schedule">{inforSchedule.description}</p>
            </div>
            <div className="confirm-booking">
              {
                mode === "edit" ? (
                  <div className="title-button" onClick={openInforSchedule}>
                    <i className="fa-solid fa-pen schedule-icon"></i>
                    <button className="save-and-share-btn">Chỉnh sửa thông tin</button>
                  </div>
                ) : (
                  <div>
                    <div className="title-button">
                      <i className="fa-solid fa-heart schedule-icon"></i>
                      <button className="save-and-share-btn">Lưu lịch trình</button>
                    </div>
                    <div className="title-button">
                      <i className="fa-solid fa-comment schedule-icon"></i>
                      <button className="save-and-share-btn">Bình luận</button>
                    </div>
                    <div className="title-button">
                      <i className="fa-solid fa-share schedule-icon"></i>
                      <button className="save-and-share-btn">Chia sẻ lịch trình</button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
        {inforSchedule.activities?.length > 0 ? (
          inforSchedule.activities.map((schedule, index) => {

            return <DateSchedule key={index} schedule={schedule} city={inforSchedule.address}

              setInforSchedule={setInforSchedule} mode={mode} />;
          })
        ) : (
          <p>No schedule available</p>
        )}
      </div>
      <div className="footer-schedule">
        <Expense
          expenses={extractExpenses(inforSchedule)}
          additionExpenses={extractAdditionExpenses(inforSchedule)}
          setInforSchedule={setInforSchedule}
          mode = {mode} />
      </div>
      {
        mode === "edit" &&
        <div className="save-schedule">
          <button className="btn-save-schedule">Hoàn thành</button>
        </div>
      }


      <Comment schedule={inforSchedule} />
      <InforScheduleMedal isOpen={isOpenInforSchedule}
        closeModal={closeInforSchedule}
        inforSchedule={inforSchedule}
        setInforSchedule={setInforSchedule} />
    </div>
  );
};

export default Schedule;
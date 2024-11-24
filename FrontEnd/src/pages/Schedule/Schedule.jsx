/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { StoreContext } from "../../Context/StoreContext";
import ActivityTime, {
  AccomActivity,
  AttractionActivity,
  FoodServiceActivity,
  OtherActivity,
} from "./ActivityTime/ActivityTime";
import AddActivity from "./AddActivity/AddActivity";
import Comment from "./Comment/Comment";
import Expense from "./Expense/Expense";
import "./Schedule.css";
import ConfirmDialog from "../../components/Dialog/ConfirmDialog";
const Activity = ({
  activity,
  setCurrentActivity,
  setCurrentDestination,
  openModal,
  setInforSchedule,
  mode,
  inforSchedule,
}) => {
  console.log("activities", activity);
  return (
    <div className="time-schedule-list">
      {activity.length > 0 &&
        activity.map((myactivity, index) => (
          <ActivityItem
            key={index}
            activity={myactivity}
            index={index}
            setCurrentDestination={setCurrentDestination}
            inforSchedule={inforSchedule}
            setInforSchedule={setInforSchedule}
            setCurrentActivity={setCurrentActivity}
            openModal={openModal}
            mode={mode}
          />
        ))}
    </div>
  );
};

const ActivityItem = ({
  index,
  activity,
  setCurrentActivity,
  setCurrentDestination,
  openModal,
  setInforSchedule,
  mode,
  inforSchedule,
}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { url } = useContext(StoreContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log("activity", activity.activityType);
  const fetchData = async (id, type) => {
    try {
      let response;
      switch (type) {
        case "Accommodation":
          response = await fetch(`${url}/api/accommodations/getAccomm/${id}`);
          break;
        case "FoodService":
          response = await fetch(`${url}/api/foodservices/${id}`);
          break;
        case "Attraction":
          response = await fetch(`${url}/api/attractions/${id}`);
          break;
        case "Other":
          console.log(`${url}/api/schedule/${inforSchedule._id}?activityId=${activity._id}`);
          response = await fetch(`${url}/api/schedule/${inforSchedule._id}?activityId=${activity._id}`);
          break;
        default:
          throw new Error("Unknown type");
      }
      const result = await response.json();
      setIsLoading(false);
      if (!response.ok) {
        throw new Error(result.message || "Error fetching data");
      }
      setData(result);
    } catch (err) {
      console.log(err);
    } finally { /* empty */ }
  };

  useEffect(() => {
    if (activity?.idDestination && activity?.activityType) {
      fetchData(activity.idDestination, activity.activityType);
    }
    if (activity?.activityType === "Other") {
      fetchData(activity._id, "Other"); 
    }
  }, [activity]);
  const handleEdit = () => {
    setCurrentActivity(activity);
    switch (activity.activityType) {
      case "Accommodation":
        data.accommodation.activityType = "Accommodation";
        setCurrentDestination(data.accommodation);
        break;
      case "FoodService":
        data.foodService.activityType = "FoodService";
        setCurrentDestination(data.foodService);
        break;
      case "Attraction":
        data.attraction.activityType = "Attraction";
        setCurrentDestination(data.attraction);
        break;
      case "Other":
        console.log("other data", data.other);
        setCurrentDestination(data.other);
        break;
      default:
        throw new Error("Unknown type");
    }
    openModal();
  };

  const handleConfirmDelete = async () => {
    try {
      console.log(
        `${url}/api/schedule/${inforSchedule._id}/activities/${activity._id}`
      );
      const response = await axios.delete(
        `${url}/api/schedule/${inforSchedule._id}/activities/${activity._id}`
      );
      if (response.status === 200) {
        setIsModalOpen(false);
        toast.success(response.data.message);
        setInforSchedule((prevSchedule) => {
          const updatedActivities = prevSchedule.activities.map((day) => ({
            ...day,
            activity: day.activity.filter((act) => act._id !== activity._id),
          }));

          return { ...prevSchedule, activities: updatedActivities };
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="activity-infor">
      <ActivityTime
        activity={activity}
        mode={mode}
        setInforSchedule={setInforSchedule}
      />
      <div className="num-activity">
        -<div className="circle-num">{index + 1}</div>-
      </div>
      {!isLoading && (
        <>
          {activity.activityType === "Accommodation" &&
            (console.log("accommodation"),
            (
              <AccomActivity
                data={data.accommodation}
                activity={activity}
                handleEdit={handleEdit}
                setIsOpenModal={setIsModalOpen}
                mode={mode}
              />
            ))}
          {activity.activityType === "FoodService" && (
            <FoodServiceActivity
              data={data.foodService}
              activity={activity}
              handleEdit={handleEdit}
              setIsOpenModal={setIsModalOpen}
              mode={mode}
            />
          )}
          {activity.activityType === "Attraction" && (
            <AttractionActivity
              data={data.attraction}
              activity={activity}
              handleEdit={handleEdit}
              setIsOpenModal={setIsModalOpen}
              mode={mode}
            />
          )}
          {activity.activityType === "Other" &&
            (console.log("other"),
            (
              <OtherActivity
                data={data.other}
                activity={activity}
                handleEdit={handleEdit}
                setIsOpenModal={setIsModalOpen}
                mode={mode}
              />
            ))}
        </>
      )}

      {isModalOpen && (
        <ConfirmDialog
          isOpen={isModalOpen}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsModalOpen(false)}
          message="Bạn có chắc chắn muốn xóa mục này không?"
        />
      )}
    </div>
  );
};

const convertDateFormat = (date) => {
  const [day, month, year] = date.split("-");
  return `${day}-${month}-${year}`;
};

// Hàm chuyển đổi ngày từ định dạng "dd-MM-yyyy" sang "yyyy-MM-dd" (ISO)
const parseDatetoDate = (dateStr) => {
  const [day, month, year] = dateStr.split("-");
  return new Date(`${year}-${month}-${day}`);
};

const InforScheduleMedal = ({
  isOpen,
  closeModal,
  inforSchedule,
  setInforSchedule,
}) => {
  const [scheduleName, setScheduleName] = useState("");
  const [startDay, setStartDay] = useState("");
  const [endDate, setEndDate] = useState("");
  const [numDays, setNumDays] = useState(0);
  const [description, setDescription] = useState("");
  const [imgSrc, setImgSrc] = useState([]);
  const { url } = useContext(StoreContext);
  useEffect(() => {
    if (inforSchedule) {
      const startDate = convertDateToJSDateVietnam(inforSchedule.dateStart);
      const endDate = convertDateToJSDateVietnam(inforSchedule.dateEnd);
      
      setScheduleName(inforSchedule.scheduleName || "");
      setStartDay(startDate);
      setEndDate(endDate);
      setNumDays(inforSchedule.numDays || 0);
      setDescription(inforSchedule.description || "");
    }
  }, [inforSchedule, isOpen]);

  const convertDateToJSDateVietnam = (dateString) => {
    const [day, month, year] = dateString.split("-");
    const date = new Date(year, month - 1, day); // Tạo đối tượng Date cơ bản
    date.setHours(date.getHours() + 7 - date.getTimezoneOffset() / 60); // Cộng thêm múi giờ Việt Nam
    return date;
  };
  
  // Test
  console.log(convertDateToJSDateVietnam("22-11-2024"));
  
  const convertJSDateToDateString = (jsDate) => {
    const day = String(jsDate.getDate()).padStart(2, "0");
    const month = String(jsDate.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
    const year = jsDate.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "startDay") {
      const newStartDay = new Date(value);
      setStartDay(newStartDay);
      const newEndDate = new Date(newStartDay.getTime() + numDays * 24 * 60 * 60 * 1000);
      setEndDate(newEndDate);
    } else if (name === "numDays") {
      const newNumDays = Number(value);
      setNumDays(newNumDays);
      const newEndDate = new Date(startDay.getTime() + newNumDays * 24 * 60 * 60 * 1000);
      setEndDate(newEndDate);
    } else {
      switch (name) {
        case "scheduleName":
          setScheduleName(value);
          break;
        case "description":
          setDescription(value);
          break;
        default:
          break;
      }
    }
  };
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImgSrc(files); // Lưu trữ mảng các tệp hình ảnh
  };
  
  const handleSubmit = async () => {
    if (isNaN(startDay)) {
      console.error("Invalid start date");
      return; // Handle invalid date case
    }
  
    const startDayString = convertJSDateToDateString(startDay);
    const endDateString = convertJSDateToDateString(endDate);
  
    let uploadedImgSrc = [];
  
    // Kiểm tra nếu có ảnh được chọn và gửi lên server
    if (imgSrc.length > 0) {
      const formData = new FormData();
      imgSrc.forEach((file) => {
        formData.append("images", file);
      });
  
      try {
        const uploadResponse = await axios.post(`${url}/api/schedule/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
  
        if (uploadResponse.data.success) {
          console.log("Thành công khi upload ảnh:", uploadResponse.data);
          uploadedImgSrc = uploadResponse.data.files.map((file) => file.filename);
        } else {
          console.error("Lỗi khi upload ảnh:", uploadResponse.data.message);
        }
      } catch (error) {
        console.error("Lỗi khi upload ảnh:", error);
      }
    }
  
    // Cập nhật thông tin lịch trình với tên ảnh đã tải lên
    setInforSchedule((prev) => ({
      ...prev,
      scheduleName,
      description,
      dateStart: startDayString,
      dateEnd: endDateString,
      imgSrc: uploadedImgSrc, // Lưu trữ tên ảnh vào inforSchedule
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
            <label className="expense-sub-title" htmlFor="schedule-name">
              Tên lịch trình
            </label>
            <input
              className="input-field"
              id="schedule-name"
              name="scheduleName"
              placeholder="Nhập tên lịch trình"
              value={scheduleName}
              onChange={handleChange}
              required
            />

            <label className="expense-sub-title" htmlFor="start-day">
              Chọn ngày bắt đầu
            </label>
            <input
              className="input-field"
              type="date"
              id="start-day"
              name="startDay"
              value={startDay && new Date(startDay).toISOString().split("T")[0]}
              onChange={handleChange}
              required
              min={new Date().toISOString().split("T")[0]}
            />


            <label className="expense-sub-title" htmlFor="description">
              Mô tả
            </label>
            <textarea
              className="input-field"
              id="description"
              name="description"
              value={description}
              onChange={handleChange}
              placeholder="Nhập ghi chú chi tiết"
            ></textarea>


              <label className="expense-sub-title" htmlFor="image-upload">
                Ảnh bìa
              </label>
              <input
                className="input-field"
                id="image-upload"
                name="image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e)}
                multiple
              />

          </div>
        </div>

        <div className="modal-footer">
          <button className="save-btn" onClick={handleSubmit}>
            Lưu
          </button>
        </div>
      </div>
    </Modal>
  );
};





const DateSchedule = ({
  schedule,
  setInforSchedule,
  mode,
  city,
  inforSchedule,
}) => {
  console.log("schedule", schedule);
  const [scheduleDate, setScheduleDate] = useState(schedule);
  const [isOpen, setIsOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [currentDestination, setCurrentDestination] = useState(null);
  const [viewMode, setViewMode] = useState("overview"); // Chế độ hiển thị: 'overview' hoặc 'details'

  useEffect(() => {
    if (schedule) {
      setScheduleDate(schedule);
      setCurrentActivity(null);
      setCurrentDestination(null);
    }
  }, [schedule]);

  useEffect(() => {
    if (!isModalOpen) {
      setCurrentActivity(null);
      setCurrentDestination(null);
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
          <div className="date-header">
            <h2>
              Ngày {scheduleDate.day}{" "}
              <i
                className={`fa-solid ${
                  isOpen ? "fa-chevron-down" : "fa-chevron-left"
                }`}
                style={{ cursor: "pointer" }}
                onClick={toggleDetails}
              ></i>
            </h2>
            <div className="date-actions">
              <button
                className={`btn-overview ${
                  viewMode === "overview" ? "active" : ""
                }`}
                onClick={() => setViewMode("overview")}
              >
                Tổng quan
              </button>
              <button
                className={`btn-details ${
                  viewMode === "details" ? "active" : ""
                }`}
                onClick={() => setViewMode("details")}
              >
                Xem chi tiết
              </button>
            </div>
          </div>

          {isOpen &&
            (viewMode === "details" ? (
              // Chế độ chi tiết
              scheduleDate.activity && scheduleDate.activity.length > 0 ? (
                <Activity
                  activity={scheduleDate.activity}
                  setCurrentActivity={setCurrentActivity}
                  openModal={openModal}
                  inforSchedule={inforSchedule}
                  setInforSchedule={setInforSchedule}
                  setCurrentDestination={setCurrentDestination}
                  mode={mode}
                />
              ) : (
                <p>Chưa có hoạt động nào</p>
              )
            ) : (
              // Chế độ tổng quan
              <div className="activity-overview-container">
                {scheduleDate.activity && scheduleDate.activity.length > 0 ? (
                  <ul className="activity-overview-list">
                    {scheduleDate.activity.map((act, index) => {
                      const activityTypeMap = {
                        Accommodation: "Chỗ ở",
                        Attraction: "Tham quan",
                        FoodService: "Ăn uống",
                      };

                      return (
                        <li
                          key={index}
                          className={`activity-type-${act.activityType}`}
                        >
                          <span className="activity-time">
                            {act.timeStart} - {act.timeEnd}
                          </span>
                          <span className="activity-type">
                            {activityTypeMap[act.activityType] || "Khác"}
                          </span>
                          <span className="activity-description">
                            {act.description || "Không có mô tả"}
                          </span>
                          <span className="activity-cost">
                            {act.cost.toLocaleString()} VND
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="no-activity-message">Chưa có hoạt động nào trong ngày này.</p>
                )}
              </div>
            ))}

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
        city={city}
      />
    </div>
  );
};

const parseDate = (dateString) => {
  const parts = dateString.split("/");
  return new Date(parts[2], parts[1] - 1, parts[0]); // Tháng trong Date bắt đầu từ 0
};

const Schedule = ({ mode }) => {
  const { url, token, user } = useContext(StoreContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inforSchedule, setInforSchedule] = useState(null);
  const [isOpenInforSchedule, setIsOpenInforSchedule] = useState(false);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [isSaved, setIsSaved] = useState(false); // State to track wishlist status

  const toggleWishlist = async () => {
    try {
      const newStatus = !isSaved; // Determine the new state
      setIsSaved(newStatus);

      const action = newStatus ? "add" : "remove"; // Define the action
      const response = await fetch(
        `${url}/api/user/user/${user._id}/addtoWishlist?type=schedule&itemId=${id}&action=${action}`,
        {
          method: "POST",
          headers: { token: token },
        }
      );

      const result = await response.json();
      if (!result.success) {
        toast.error(result.message);
      }
      toast.success(result.message);
      console.log(result.message); // Optionally display a success message
    } catch (error) {
      console.error("Failed to update wishlist:", error.message);
      // Optionally revert the `isSaved` state if the request fails
      setIsSaved((prevState) => !prevState);
    }
  };
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get(`${url}/api/schedule/${id}`);
        setInforSchedule(response.data.schedule);
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
      setDateStart(convertDateFormat(inforSchedule.dateStart));
      setDateEnd(convertDateFormat(inforSchedule.dateEnd));
    }
  }, [loading ]);

  useEffect(() => {
    if (inforSchedule && mode === "edit") {
      const updateSchedule = async () => {
        try {
          const response = await axios.put(
            `${url}/api/schedule/update/${inforSchedule._id}`,
            {
              ...inforSchedule,
            }
          );
          if (response.data.success) {
            console.log("Cập nhật lịch trình thành công:", response.data);
          } else {
            console.error(
              "Lỗi khi cập nhật lịch trình:",
              response.data.message
            );
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

  const onCompleted = () => {
    setInforSchedule((prevInfor) => {
      return { ...prevInfor, status: "Complete" };
    });
    navigate("/my-schedule");
    toast.success("Chỉnh sửa hoàn tất");
  };
  const onEdit = async () => {
    const newSchedule = {
      ...inforSchedule,
      status: "Draft",
      likes: [],
      comments: [],
      createdAt: new Date(),
    };
    delete newSchedule._id;
    console.log("New Schedule", newSchedule);
    const response = await axios.post(
      url + "/api/schedule/addNew",
      { schedule: newSchedule },
      {
        headers: { token },
      }
    );
    if (response.data.success) {
      const scheduleId = response.data.schedule._id;
      navigate(`/schedule-edit/${scheduleId}`);
      toast.success("Lấy thành công");
    } else {
      console.error("Error adding schedule:", response.data.message);
    }
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

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="custom-schedule">
      <div className="custom-schedule-header">
        <div>
          <h1 className="num-title">
            {mode === "view" ? "Xem  lịch trình" : "Chỉnh sửa lịch trình"}
          </h1>
          <span className="num-text">Tác giả: {inforSchedule.idUser.name}</span>
        </div>
        <div>
          {mode === "view" && (
            <button className="custom-schedule-btn" onClick={onEdit}>
              Chỉnh sửa ngay
            </button>
          )}
        </div>
      </div>
      <div className="schedule-container">
        <img
          className="custom-schedule-image"
          src={inforSchedule.imgSrc[0] ? `${url}/images/${inforSchedule.imgSrc[0]}` : "https://www.travelalaska.com/sites/default/files/2022-01/Haida-GlacierBay-GettyImages-1147753605.jpg"}
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
                <input value={inforSchedule.dateStart} disabled={true} />
                <p>Đến</p>
                {/* Bind the date input to dateEnd state */}
                <input value={inforSchedule.dateEnd} disabled={true} />
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
              {mode === "edit" ? (
                <div className="title-button" onClick={openInforSchedule}>
                  <i className="fa-solid fa-pen schedule-icon"></i>
                  <button className="save-and-share-btn">
                    Chỉnh sửa thông tin
                  </button>
                </div>
              ) : (
                <div>
                  <div className={`title-button ${isSaved ? "saved" : ""} `}>
                    <i className="fa-solid fa-bookmark schedule-icon"></i>
                    <button
                      className="save-and-share-btn"
                      onClick={toggleWishlist}
                    >
                      Lưu lịch trình
                    </button>
                  </div>
                  <div className="title-button">
                    <i className="fa-solid fa-share schedule-icon"></i>
                    <button className="save-and-share-btn">
                      Chia sẻ lịch trình
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {inforSchedule.activities?.length > 0 ? (
          inforSchedule.activities.map((schedule, index) => {
            return (
              <DateSchedule
                key={index}
                schedule={schedule}
                city={inforSchedule.address}
                setInforSchedule={setInforSchedule}
                mode={mode}
                inforSchedule={inforSchedule}
              />
            );
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
          mode={mode}
        />
      </div>
      {mode === "edit" && (
        <div className="save-schedule">
          <button className="btn-save-schedule" onClick={onCompleted}>
            Hoàn thành
          </button>
        </div>
      )}

      <Comment schedule={inforSchedule} />
      <InforScheduleMedal
        isOpen={isOpenInforSchedule}
        closeModal={closeInforSchedule}
        inforSchedule={inforSchedule}
        setInforSchedule={setInforSchedule}
      />
    </div>
  );
};

export default Schedule;

import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../Context/StoreContext";
import "./MySchedule.css";
import { FaTrash, FaGlobe, FaUserSecret } from "react-icons/fa";
import ConfirmDialog from "../../components/Dialog/ConfirmDialog";

const MySchedule = ({ setShowLogin }) => {
  const { url, token, user } = useContext(StoreContext);
  const [schedules, setSchedules] = useState([]);
  const [groupSchedules, setGroupSchedules] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeScheduleId, setActiveScheduleId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [action, setAction] = useState("");
  const [scheduleType, setScheduleType] = useState("my-schedule");
  const [listRender , setListRender] = useState([]);
  const navigate = useNavigate();
  const popupRef = useRef(null);

  // Toggle action menu
  const handleToggleActions = (scheduleId) => {
    setActiveScheduleId((prev) => (prev === scheduleId ? null : scheduleId));
  };

  useEffect(() => {
    if (!token) {
      setShowLogin(true);
    }
  })
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setActiveScheduleId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSchedulesData = async () => {
     
    
        try {
          const schedulesResponse = await axios.get(
            `${url}/api/schedule/user/getSchedules`,
            { headers: { token } }
          );

          const groupSchedulesResponse = await axios.get(
            `${url}/api/schedule/user/getSchedules?type=group`,
            { headers: { token } }
          );

          const wishlistsResponse = await axios.get(
            `${url}/api/schedule/user/getSchedules?type=wishlist`,
            { headers: { token } }
          );
          if (groupSchedulesResponse.data.success) {
            setGroupSchedules(groupSchedulesResponse.data.schedules);
          } else {
            setGroupSchedules([]);
            console.error("Failed to fetch group schedules:", groupSchedulesResponse.data.message);
          }

          if (schedulesResponse.data.success) {
            setSchedules(schedulesResponse.data.schedules);
          } else {
            console.error("Failed to fetch schedules:", schedulesResponse.data.message);
          }

          if (wishlistsResponse.data.success) {
            setWishlists(wishlistsResponse.data.schedules);
          } else {
            console.error("Failed to fetch wishlists:", wishlistsResponse.data.message);
          }
        } catch (error) {
          console.error("Error fetching schedules or wishlists:", error);
        } finally {
          setIsLoading(false);
        }
      
    };

    if (token) fetchSchedulesData();
  }, [token, url, isConfirmOpen]);

  const calculateDaysAndNights = (startDateStr, endDateStr) => {
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    };

    const startDate = parseDate(startDateStr);
    const endDate = parseDate(endDateStr);

    // Calculate the difference in time (in milliseconds)
    const durationInMs = endDate - startDate;

    if (durationInMs <= 0) {
      return "Ngày kết thúc phải sau ngày bắt đầu.";
    }

    // Convert milliseconds to days
    const days = Math.floor(durationInMs / (1000 * 60 * 60 * 24));

    return `${days}`;
  };

  const handleDeleteSchedule = async () => {
    try {
      const response = await axios.delete(
        `${url}/api/schedule/${selectedSchedule._id}`,
        { headers: { token } }
      );
      if (response.data.success) {
        setSchedules((prevSchedules) =>
          prevSchedules.filter((schedule) => schedule._id !== selectedSchedule._id)
        );
        console.log("Schedule deleted successfully.");
      } else {
        console.error("Failed to delete schedule:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
    } finally {
      setIsConfirmOpen(false);
    }
  };

  // Handle update schedule visibility
  const handleUpdateVisibility = async (isPublic) => {
    try {
      const scheduleData = { ...selectedSchedule, isPublic };
      const response = await axios.put(
        `${url}/api/schedule/update/${selectedSchedule._id}`,
        { ...scheduleData },
        { headers: { token } }
      );
      if (response.data.success) {
        setSchedules((prevSchedules) =>
          prevSchedules.map((schedule) =>
            schedule._id === selectedSchedule._id
              ? { ...schedule, isPublic }
              : schedule
          )
        );
        console.log("Schedule visibility updated successfully.");
      } else {
        console.error("Failed to update schedule:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const handleOpenConfirm = (schedule, actionType) => {
    setSelectedSchedule(schedule);
    setAction(actionType);

    const actionMessages = {
      delete: "Bạn chắc chắn muốn xóa lịch trình này?",
      public: "Bạn có chắc chắn muốn công khai lịch trình?",
      private: "Bạn có chắc chắn muốn ẩn lịch trình?",
    };

    const actionSuccessMessages = {
      delete: "Xóa lịch trình thành công.",
      public: "Công khai lịch trình thành công.",
      private: "Ẩn lịch trình thành công.",
    };

    setMessage(actionMessages[actionType]);
    setSuccessMessage(actionSuccessMessages[actionType]);
    setIsConfirmOpen(true);
  };

  const handleConfirmAction = () => {
    if (action === "delete") {
      handleDeleteSchedule();
    } else if (action === "public") {
      handleUpdateVisibility(true);
    } else if (action === "private") {
      handleUpdateVisibility(false);
    }
  };

  useEffect(() => {
    if (scheduleType === "my-schedule") {
      setListRender(schedules);}
    else if (scheduleType === "group-schedule") {
      setListRender(groupSchedules);
      console.log("groupSchedules", groupSchedules);
    }
  }, [scheduleType, schedules, groupSchedules]);

  return (
    <div className="my-schedule-container">
      <header className="hero-section">
        <h1>Tạo lịch trình du lịch dễ dàng cho chuyến đi của bạn</h1>
        <p>Chỉ mất 3-5 phút, bạn có thể tạo ngay cho mình lịch trình du lịch</p>
        <button
          className="create-schedule-btn"
          onClick={() => navigate("/create-schedule/manual")}
        >
          Tạo lịch trình
        </button>
        <button
          className="create-schedule-btn"
          onClick={() => navigate("/create-schedule/ai")}
        >
          Tạo lịch trình với AI
        </button>
      </header>

      <section className="my-schedule-section">
        <div className="schedule-type-buttons">
          <button
            className={ scheduleType === "my-schedule" ? "active" : ""}
            onClick ={() => setScheduleType("my-schedule")}
          >
            Lịch trình của bạn 
          </button>
          <button
            className={scheduleType === "group-schedule" ? "active" : ""}
            onClick={() => setScheduleType("group-schedule")}
          >
            Lịch trình nhóm 
          </button>

        </div>

        {!isLoading && listRender.length > 0 ? (
          listRender.map((schedule) => (
            <div
              key={schedule._id}
              className="my-schedule-card"
              onClick={() => navigate(`/schedule-edit/${schedule._id}`)}
            >
              <img
                src="https://h3jd9zjnmsobj.vcdn.cloud/public/v7/banner/tourists-min-02.png"
                alt="My Schedule"
              />
              <div className="schedule-info">
                <h3>{schedule.scheduleName}</h3>
                <p>
                  {schedule.dateStart} - {schedule.dateEnd}
                </p>
              </div>
              <button
                className="action-toggle-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleActions(schedule._id);
                }}
              >
                <span className="vertical-dots">⋮</span>
              </button>
              {activeScheduleId === schedule._id && (
                <div className="action-buttons" ref={popupRef}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenConfirm(schedule, "delete");
                    }}
                  >
                    <FaTrash /> Xóa
                  </button>
                  {schedule.isPublic === true ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenConfirm(schedule, "private");
                      }}
                    >
                      <FaUserSecret /> Ẩn danh
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenConfirm(schedule, "public");
                      }}
                    >
                      <FaGlobe /> Công khai
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>Không có lịch trình nào.</p>
        )}
      </section>

      <section className="featured-schedules-section">
        <h2>Lịch trình đã lưu</h2>
        {!isLoading && wishlists.length > 0 ? (
          <div className="featured-schedules">
            {wishlists.map((schedule) => (
              <div
                key={schedule._id}
                className="schedule-card"
                onClick={() => navigate(`/schedule-view/${schedule._id}`)}
              >
                <div className="schedule-header">
                  <img
                    src={schedule.imgSrc[0] && schedule.imgSrc[0].includes("http") ? schedule.imgSrc[0] : schedule.imgSrc[0] ? `${url}/images/${schedule.imgSrc[0]}` : "https://h3jd9zjnmsobj.vcdn.cloud/public/v7/banner/tourists-min-02.png"}
                    alt={schedule.scheduleName}
                  />
                  <div className="schedule-date">
                    <h3> {calculateDaysAndNights(schedule.dateStart, schedule.dateEnd)}</h3>
                    <span>Ngày</span>
                  </div>

                </div>

                <div className="schedule-info">
                  <h3>{schedule.scheduleName}</h3>
                  <p> Địa điểm: {schedule.address}</p>
                  <p>Ngày bắt đầu: {schedule.dateStart}</p>
                  <p>Ngày kết thúc: {schedule.dateEnd}</p>
                </div>

                <div className="schedule-user">
                  <img
                    className="avatar"
                    src={schedule.idUser.avatar ? `${url}/images/${schedule.idUser.avatar}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    alt={schedule.userName}
                  />
                  <p>{schedule.idUser.name || "Unknown User"}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <p>Không có lịch trình đã lưu.</p>
            <a href="/searchSchedule">Tìm kiếm lịch trình </a>
          </>
        )}
      </section>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        message={message}
        successMessage={successMessage}
        onConfirm={handleConfirmAction}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default MySchedule;

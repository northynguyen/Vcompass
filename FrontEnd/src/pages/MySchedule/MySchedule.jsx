import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../Context/StoreContext";
import "./MySchedule.css";
import { FaTrash, FaGlobe, FaUserSecret } from "react-icons/fa";
import ConfirmDialog from "../../components/Dialog/ConfirmDialog";

const MySchedule = () => {
  const { url, token } = useContext(StoreContext);
  const [schedules, setSchedules] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeScheduleId, setActiveScheduleId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [message, setMessage] = useState("");
  const [action, setAction] = useState("");
  const navigate = useNavigate();
  const popupRef = useRef(null);

  // Toggle action menu
  const handleToggleActions = (scheduleId) => {
    setActiveScheduleId((prev) => (prev === scheduleId ? null : scheduleId));
  };

  // Hide popup when clicking outside
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

  // Fetch schedules and wishlists
  useEffect(() => {
    const fetchSchedulesData = async () => {
      try {
        const schedulesResponse = await axios.get(
          `${url}/api/schedule/user/getSchedules`,
          { headers: { token } }
        );
        const wishlistsResponse = await axios.get(
          `${url}/api/schedule/user/getSchedules?type=wishlist`,
          { headers: { token } }
        );

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

  // Handle delete schedule
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

    setMessage(actionMessages[actionType]);
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

  return (
    <div className="my-schedule-container">
      <header className="hero-section">
        <h1>Tạo lịch trình du lịch dễ dàng cho chuyến đi của bạn</h1>
        <p>Chỉ mất 3-5 phút, bạn có thể tạo ngay cho mình lịch trình du lịch</p>
        <button
          className="create-schedule-btn"
          onClick={() => navigate("/create-schedule")}
        >
          Tạo lịch trình
        </button>
      </header>

      <section className="my-schedule-section">
        <h2>Lịch trình của tôi</h2>
        {!isLoading && schedules.length > 0 ? (
          schedules.map((schedule) => (
            console.log("schedule", schedule),
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
                <img
                  src="https://h3jd9zjnmsobj.vcdn.cloud/public/v7/banner/tourists-min-02.png"
                  alt={schedule.scheduleName}
                />
                <div className="schedule-info">
                  <h3>{schedule.scheduleName}</h3>
                  <p>Địa điểm: {schedule.address}</p>
                  <p>Ngày bắt đầu: {schedule.dateStart}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Không có lịch trình đã lưu.</p>
        )}
      </section>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        message={message}
        onConfirm={handleConfirmAction}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default MySchedule;

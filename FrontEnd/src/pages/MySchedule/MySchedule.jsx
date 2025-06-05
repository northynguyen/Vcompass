import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { FaGlobe, FaTrash, FaUserSecret, FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import ConfirmDialog from "../../components/Dialog/ConfirmDialog";
import { StoreContext } from "../../Context/StoreContext";
import { VscCopilot } from "react-icons/vsc";
import "./MySchedule.css";
import ScheduleSkeleton from './ScheduleSkeleton';
import PropTypes from 'prop-types';

const MySchedule = () => {
  const { url, token, getImageUrl } = useContext(StoreContext);
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
  const [listRender, setListRender] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  
  // Pagination states
  const [pagination, setPagination] = useState({
    mySchedule: { currentPage: 1, totalPages: 1, total: 0 },
    groupSchedule: { currentPage: 1, totalPages: 1, total: 0 },
    wishlist: { currentPage: 1, totalPages: 1, total: 0 }
  });
  const [searchParams, setSearchParams] = useSearchParams();
  
  const navigate = useNavigate();
  const popupRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const ITEMS_PER_PAGE = 5;
  const ITEMS_SAVE_PAGE = 4;

  // Get current page from URL params
  const getCurrentPage = (type) => {
    const pageParam = searchParams.get(`${type}Page`);
    return pageParam ? parseInt(pageParam) : 1;
  };

  // Update URL params
  const updateUrlParams = (type, page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(`${type}Page`, page.toString());
    setSearchParams(newParams);
  };

  // Toggle action menu
  const handleToggleActions = (scheduleId) => {
    setActiveScheduleId((prev) => (prev === scheduleId ? null : scheduleId));
  };

  const handleCreateScheduleClick = (type) => {
    navigate(`/create-schedule/${type}`);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        if (!event.target.closest('.action-toggle-btn')) {
          setActiveScheduleId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch individual sections
  const fetchMySchedules = async (page = 1, search = "") => {
    try {
      const searchQuery = search ? `&search=${encodeURIComponent(search)}` : '';
      const response = await axios.get(
        `${url}/api/schedule/user/getSchedules?page=${page}&limit=${ITEMS_PER_PAGE}${searchQuery}`,
        { headers: { token } }
      );

      if (response.data.success) {
        setSchedules(response.data.schedules);
        setPagination(prev => ({
          ...prev,
          mySchedule: {
            currentPage: response.data.currentPage || page,
            totalPages: response.data.totalPages || 1,
            total: response.data.total || 0
          }
        }));
      } else {
        setSchedules([]);
        setPagination(prev => ({
          ...prev,
          mySchedule: { currentPage: 1, totalPages: 1, total: 0 }
        }));
      }
    } catch (error) {
      console.error("Error fetching my schedules:", error);
      setSchedules([]);
    }
  };

  const fetchGroupSchedules = async (page = 1, search = "") => {
    try {
      const searchQuery = search ? `&search=${encodeURIComponent(search)}` : '';
      const response = await axios.get(
        `${url}/api/schedule/user/getSchedules?type=group&page=${page}&limit=${ITEMS_PER_PAGE}${searchQuery}`,
        { headers: { token } }
      );

      if (response.data.success) {
        setGroupSchedules(response.data.schedules);
        setPagination(prev => ({
          ...prev,
          groupSchedule: {
            currentPage: response.data.currentPage || page,
            totalPages: response.data.totalPages || 1,
            total: response.data.total || 0
          }
        }));
      } else {
        setGroupSchedules([]);
        setPagination(prev => ({
          ...prev,
          groupSchedule: { currentPage: 1, totalPages: 1, total: 0 }
        }));
      }
    } catch (error) {
      console.error("Error fetching group schedules:", error);
      setGroupSchedules([]);
    }
  };

  const fetchWishlists = async (page = 1, search = "") => {
    try {
      const searchQuery = search ? `&search=${encodeURIComponent(search)}` : '';
      const response = await axios.get(
        `${url}/api/schedule/user/getSchedules?type=wishlist&page=${page}&limit=${ITEMS_SAVE_PAGE}${searchQuery}`,
        { headers: { token } }
      );

      if (response.data.success) {
        setWishlists(response.data.schedules);
        setPagination(prev => ({
          ...prev,
          wishlist: {
            currentPage: response.data.currentPage || page,
            totalPages: response.data.totalPages || 1,
            total: response.data.total || 0
          }
        }));
      } else {
        setWishlists([]);
        setPagination(prev => ({
          ...prev,
          wishlist: { currentPage: 1, totalPages: 1, total: 0 }
        }));
      }
    } catch (error) {
      console.error("Error fetching wishlists:", error);
      setWishlists([]);
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchInput(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value);
      // Reset to page 1 when searching
      setPagination(prev => ({
        ...prev,
        mySchedule: { ...prev.mySchedule, currentPage: 1 },
        groupSchedule: { ...prev.groupSchedule, currentPage: 1 },
        wishlist: { ...prev.wishlist, currentPage: 1 }
      }));
    }, 500); // 500ms delay
  };

  // Fetch data with pagination and search
  const fetchSchedulesData = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const mySchedulePage = getCurrentPage('my-schedule');
      const groupSchedulePage = getCurrentPage('group-schedule');
      const wishlistPage = getCurrentPage('wishlist');

      // Fetch tất cả khi lần đầu load hoặc khi search
      // Chỉ áp dụng search cho my và group schedules, không cho wishlist
      await Promise.all([
        fetchMySchedules(mySchedulePage, searchTerm),
        fetchGroupSchedules(groupSchedulePage, searchTerm),
        fetchWishlists(wishlistPage) // Không truyền searchTerm cho wishlist
      ]);

    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Separate effect for initial load and wishlist changes
  useEffect(() => {
    if (!token) return;
    // Fetch toàn bộ khi lần đầu load hoặc khi các dependency chính thay đổi
    fetchSchedulesData();
  }, [token, url, isConfirmOpen]);

  // Separate effect for search - chỉ fetch my và group schedules
  useEffect(() => {
    if (!token || !searchTerm) return;
    
    const mySchedulePage = getCurrentPage('my-schedule');
    const groupSchedulePage = getCurrentPage('group-schedule');
    
    // Chỉ fetch lại my và group schedules khi search
    Promise.all([
      fetchMySchedules(mySchedulePage, searchTerm),
      fetchGroupSchedules(groupSchedulePage, searchTerm)
    ]);
  }, [searchTerm]);

  useEffect(() => {
    if (isLoading) return;

    if (scheduleType === "my-schedule") {
      setListRender(schedules);
    } else if (scheduleType === "group-schedule") {
      setListRender(groupSchedules);
    }
  }, [scheduleType, schedules, groupSchedules, isLoading]);

  // Handle page change - chỉ fetch section được thay đổi
  const handlePageChange = (type, newPage) => {
    updateUrlParams(type, newPage);
    
    // Chỉ fetch section tương ứng với search term hiện tại
    if (type === 'my-schedule') {
      fetchMySchedules(newPage, searchTerm);
    } else if (type === 'group-schedule') {
      fetchGroupSchedules(newPage, searchTerm);
    } else if (type === 'wishlist') {
      fetchWishlists(newPage, searchTerm);
    }
  };

  // Get current pagination info
  const getCurrentPagination = () => {
    if (scheduleType === "my-schedule") return pagination.mySchedule;
    if (scheduleType === "group-schedule") return pagination.groupSchedule;
    return pagination.wishlist;
  };

  // Pagination component
  const PaginationComponent = ({ type, paginationInfo }) => {
    const { currentPage, totalPages } = paginationInfo;
    
    if (totalPages <= 1) return null;

    return (
      <div className="pagination-my-schedule">
        <button 
          onClick={() => handlePageChange(type, currentPage - 1)}
          disabled={currentPage <= 1}
          className="pagination-btn"
        >
          <FaChevronLeft />
        </button>
        
        <span className="pagination-info">
          Trang {currentPage} / {totalPages}
        </span>
        
        <button 
          onClick={() => handlePageChange(type, currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="pagination-btn"
        >
          <FaChevronRight />
        </button>
      </div>
    );
  };

  PaginationComponent.propTypes = {
    type: PropTypes.string.isRequired,
    paginationInfo: PropTypes.shape({
      currentPage: PropTypes.number.isRequired,
      totalPages: PropTypes.number.isRequired
    }).isRequired
  };

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

  return (
    <div className="my-schedule-container">
      <header className="hero-section">
            <div className="hero-section-content"> </div>
            <div className="hero-section-content-text">
            <h1 className="create-schedule-title">Tạo lịch trình du lịch dễ dàng cho chuyến đi của bạn</h1>
            <p className="create-schedule-description">Chỉ mất 3-5 phút, bạn có thể tạo ngay cho mình lịch trình du lịch</p>
            <div className="create-schedule-btn-container">
              <div className="create-schedule-btn" onClick={() => handleCreateScheduleClick('manual')}>
                <FiPlus style={{ marginRight: "6px" }} />
                <p>Tạo lịch trình</p>
              </div>
              <div className="create-schedule-btn" onClick={() => handleCreateScheduleClick('ai')}>
                <VscCopilot style={{ marginRight: "6px" }} />
                <p>Tạo lịch trình với AI</p>
              </div>
            </div>
            </div>
          </header>

      <section className="my-schedule-section">
        <div className="search-and-controls">
          
          
          <div className="schedule-type-buttons">
            <button
              className={scheduleType === "my-schedule" ? "active" : "button-schedule-type"}
              onClick={() => setScheduleType("my-schedule")}
            >
              Lịch trình của bạn
            </button>
            <button
              className={scheduleType === "group-schedule" ? "active" : "button-schedule-type"}
              onClick={() => setScheduleType("group-schedule")}
            >
              Lịch trình nhóm
            </button>
          </div>
          <div className="search-bar">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc địa điểm..."
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
        {isLoading ? (
          <>
            <ScheduleSkeleton />
            <ScheduleSkeleton />
            <ScheduleSkeleton />
          </>
        ) : listRender.length > 0 ? (
          <>
            {listRender.map((schedule) => (
              <div
                key={schedule._id}
                className="my-schedule-card"
                onClick={() => navigate(`/schedule-edit/${schedule._id}`)}
              >
                <img
                  src={getImageUrl(schedule)}
                  alt="My Schedule"
                />
                <div className="schedule-info">
                  <h3>{schedule.scheduleName}</h3>
                  <p>
                    {schedule.dateStart} - {schedule.dateEnd}
                  </p>
                </div>
                <div
                  className="action-toggle-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleActions(schedule._id);
                  }}
                >
                  <span className="vertical-dots">⋮</span>
                </div>
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
            ))}
            
            {/* Pagination cho từng loại schedule */}
            <PaginationComponent type={scheduleType} paginationInfo={getCurrentPagination()} />
          </>
        ) : (
          <p>Không có lịch trình nào.</p>
        )}
       
      </section>

      <section className="featured-schedules-section">
        <h2>Lịch trình đã lưu</h2>
        {!isLoading && wishlists.length > 0 ? (
          <>
            <div className="featured-schedules">
              {wishlists.map((schedule) => (
                <div
                  key={schedule._id}
                  className="schedule-card"
                  onClick={() => navigate(`/schedule-view/${schedule._id}`)}
                >
                  <div className="schedule-header">
                    <img
                      src={getImageUrl(schedule)}
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
                      src={schedule.idUser.avatar && schedule.idUser.avatar.includes("http") ?  schedule.idUser.avatar: schedule.idUser.avatar? `${url}/images/${schedule.idUser.avatar}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                      alt={schedule.userName}
                    />
                    <p>{schedule.idUser.name || "Unknown User"}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination cho wishlist */}
            <PaginationComponent type="wishlist" paginationInfo={pagination.wishlist} />
          </>
        ) : (
          <>
            {!isLoading && <p>Không có lịch trình đã lưu.</p>}
            {!isLoading && <a href="/searchSchedule">Tìm kiếm lịch trình </a>}
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

MySchedule.propTypes = {
  // Remove setShowLogin prop validation since it's not used anymore
};

export default MySchedule;

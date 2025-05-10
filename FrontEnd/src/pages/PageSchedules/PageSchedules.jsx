import axios from 'axios';
import { useContext, useEffect, useRef, useState } from 'react';
import { FaBars } from "react-icons/fa";
import { Range } from 'react-range';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import LeftSideBar from "../../components/LeftSideBar/LeftSideBar";
import PostCard from '../../components/Poster/PostCard';
import PostCardSkeleton from '../../components/Poster/PostCardSkeleton';
import { StoreContext } from '../../Context/StoreContext';
import './PageSchedules.css';

// Add this comment to disable prop-types validation for the Range component
// since we're using an external library where we can't control the prop validation
/* eslint-disable react/prop-types */

const PageSchedules = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { url, user, token } = useContext(StoreContext);
  const [allSchedules, setAllSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [schedulesPerPage] = useState(4);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    activityType: '',
    sortBy: '',
    hasVideo: false,
    hasImage: false,
    days: 0
  });
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [debouncedPriceRange, setDebouncedPriceRange] = useState(priceRange);
  const idleTimer = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 1000); // 1 giây

    return () => clearTimeout(timeout);
  }, [priceRange]);

  useEffect(() => {
    if (!user && type === "follow") {
      navigate('/');
    }
    if (type !== 'foryou' && type !== 'follow') {
      navigate('/404');
    }
  }, [user, type, navigate]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        let response;
        if (type === 'foryou') {
          if (user) {
            const userId = user && user._id ? user._id : '';
            response = await axios.get(`${url}/api/schedule/scheduleforuser/${userId}`);
          } else {
            response = await axios.get(`${url}/api/schedule/getAllSchedule`);
          }
        } else {
          response = await axios.get(
            `${url}/api/schedule/getSchedules/followingSchedules`,
            {
              headers: { token }
            }
          );
        }

        if (response.data.success) {
          if (type === 'foryou' && user) {
            setAllSchedules(response.data.recommendedSchedules);
            setFilteredSchedules(response.data.recommendedSchedules);
            console.log("Recommended schedules by AI:", response.data.recommendedSchedules);
          } else {
            setAllSchedules(response.data.schedules);
            setFilteredSchedules(response.data.schedules);
          }
        } else {
          toast.error(response.data.message || 'Failed to fetch schedules');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching schedules:', error);
        toast.error('Failed to fetch schedules');
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [type, url, token, user]);

  useEffect(() => {
    if (allSchedules.length === 0) return;

    const applyFilters = () => {
      const filtered = allSchedules.filter((schedule) => {
        const matchesType =
          !filters.activityType ||
          schedule.activities.some((day) =>
            day.activity.some(
              (act) =>
                act.activityType.toLowerCase() ===
                filters.activityType.toLowerCase()
            )
          );

        const matchesDays =
          !filters.days || filters.days === 0 || schedule.numDays === filters.days;

        const matchesMedia =
          (!filters.hasVideo || schedule.videoSrc) &&
          (!filters.hasImage || schedule.imgSrc.length > 0);

        const cost = calculateTotalCost(schedule.activities);
        const matchesPrice = cost >= priceRange[0] && cost <= priceRange[1];

        return matchesType && matchesDays && matchesMedia && matchesPrice;
      });

      let sortedSchedules = [...filtered];
      if (filters.sortBy === 'likes') {
        sortedSchedules.sort((a, b) => b.likes.length - a.likes.length);
      } else if (filters.sortBy === 'comments') {
        sortedSchedules.sort(
          (a, b) =>
            b.comments.length +
            b.comments.reduce((sum, comment) => sum + comment.replies.length, 0) -
            (a.comments.length +
              a.comments.reduce(
                (sum, comment) => sum + comment.replies.length,
                0
              ))
        );
      }

      setFilteredSchedules(sortedSchedules);
      setCurrentPage(1);
    };

    applyFilters();

  }, [allSchedules, filters, debouncedPriceRange]);

  const reportSatisfaction = async (action, score, scheduleId) => {
    const userId = user._id
    console.log("action, score:", action, score)
    try {
      await axios.post(`${url}/api/userSatisfaction`, {
        userId,
        scheduleId,
        action,
        score,
      });
      console.log(`📤 Sent: ${action} (${score})`);
    } catch (err) {
      console.error("❌ Failed to report satisfaction:", err.message);
    }
  };
  useEffect(() => {
    startTimeRef.current = Date.now();
    idleTimer.current = setTimeout(() => {
      reportSatisfaction("over_view", 0.2, null);
    }, 60000);

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  const calculateTotalCost = (activities) => {
    return activities.reduce((sum, day) => {
      return (
        sum +
        day.activity.reduce((acc, act) => {
          return acc + (act.cost || 0);
        }, 0)
      );
    }, 0);
  };

  const handleScheduleClick = (id) => {
    if (type === "foryou") {
      handleView(id)
      navigate(`/schedule-view/${id}`, { state: { type: "foryou" } });
    } else
      navigate(`/schedule-view/${id}`);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleView = (scheduleId) => {
    reportSatisfaction("view", 0.6, scheduleId);
  };
  const handleLike = (scheduleId) => {
    reportSatisfaction("like", 0.7, scheduleId);
  };
  const handleSave = (scheduleId) => {
    reportSatisfaction("save", 0.9, scheduleId);
  };

  const indexOfLastSchedule = currentPage * schedulesPerPage;
  const indexOfFirstSchedule = indexOfLastSchedule - schedulesPerPage;
  const currentSchedules = filteredSchedules.slice(indexOfFirstSchedule, indexOfLastSchedule);
  const totalPages = Math.ceil(filteredSchedules.length / schedulesPerPage);

  return (
    <div className="schedule-for-you">
      <div className="left-side-bar-container">
        <div className="sidebar-toggle-container">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <FaBars />
          </button>
        </div>

        {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

        <div className={`sidebar-container ${sidebarOpen ? 'open' : ''}`}>
          <LeftSideBar />
        </div>
      </div>
      <div className="main-content">
        <div>
          <div className="schedule-for-you-list">
            {loading && <PostCardSkeleton count={schedulesPerPage} />}

            {!loading && currentSchedules.length > 0 &&
              currentSchedules.map((schedule) => (
                <PostCard
                  key={schedule._id}
                  schedule={schedule}
                  handleScheduleClick={handleScheduleClick}
                  {...(type === "foryou" && {
                    onLikeClick: handleLike,
                    onHeartClick: handleSave
                  })}
                />
              ))
            }
            {!loading && currentSchedules.length === 0 && (
              <div className="no-schedule">
                <h3>Không tìm thấy lịch trình</h3>
              </div>
            )}
          </div>

          {!loading && totalPages > 1 && (
            <div className="pagination-container">
              <button
                className="prev-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Trước
              </button>
              <span>
                Trang {currentPage} / {totalPages}
              </span>
              <button
                className="next-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="filters-container">
        <div className="filters">
          <h3>Lọc & Sắp xếp</h3>
          <label>
            <span>Loại hoạt động</span>
            <select
              value={filters.activityType}
              onChange={(e) =>
                setFilters({ ...filters, activityType: e.target.value })
              }
            >
              <option value="">Tất cả</option>
              <option value="attraction">Attraction</option>
              <option value="accommodation">Accommodation</option>
              <option value="foodservice">FoodService</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label>
            <span>Số ngày</span>
            <select
              value={filters.days}
              onChange={(e) =>
                setFilters({ ...filters, days: parseInt(e.target.value, 10) })
              }
            >
              <option value={0}>Tất cả</option>
              <option value={1}>1 ngày</option>
              <option value={2}>2 ngày 1 đêm</option>
              <option value={3}>3 ngày 2 đêm</option>
              <option value={4}>4 ngày 3 đêm</option>
              <option value={5}>5 ngày 4 đêm</option>
              <option value={6}>6 ngày 5 đêm</option>
              <option value={7}>7 ngày 6 đêm</option>
            </select>
          </label>

          <label>
            <span>Sắp xếp</span>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters({ ...filters, sortBy: e.target.value })
              }
            >
              <option value="">Mặc định</option>
              <option value="likes">Nhiều lượt thích</option>
              <option value="comments">Nhiều bình luận</option>
            </select>
          </label>

          <label>
            <input
              type="checkbox"
              checked={filters.hasVideo}
              onChange={(e) =>
                setFilters({ ...filters, hasVideo: e.target.checked })
              }
            />
            <span>Có video</span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={filters.hasImage}
              onChange={(e) =>
                setFilters({ ...filters, hasImage: e.target.checked })
              }
            />
            <span>Có ảnh</span>
          </label>
        </div>

        <div className="price-slider">
          <Range
            step={100000}
            min={0}
            max={10000000}
            values={priceRange}
            onChange={(values) => setPriceRange(values)}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: "6px",
                  background: "#ddd",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    height: "6px",
                    background: "#007bff",
                    left: `${(priceRange[0] / 10000000) * 100}%`,
                    right: `${100 - (priceRange[1] / 10000000) * 100}%`,
                  }}
                ></div>
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: "12px",
                  width: "12px",
                  backgroundColor: "#007bff",
                  borderRadius: "50%",
                  border: "2px solid white",
                }}
              />
            )}
          />
          <div className="price-range">
            <span>{priceRange[0].toLocaleString("vi-VN")} ₫</span>
            <span>{priceRange[1].toLocaleString("vi-VN")} ₫</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageSchedules; 
import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Range } from "react-range"; // Import react-range
import { useLocation, useNavigate } from "react-router-dom";
import PostCard from "../../components/Poster/PostCard";
import { StoreContext } from "../../Context/StoreContext";
import "./SearchSchedule.css";

const SearchSchedule = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { url, user } = useContext(StoreContext);
  const hasSearchedRef = useRef(false);
  const [schedules, setSchedules] = useState([]);
  const [addressFilter, setAddressFilter] = useState(location.state?.city || "");
  const [scheduleNameFilter, setScheduleNameFilter] = useState("");
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [filters, setFilters] = useState({
    activityType: "",
    sortBy: "",
    hasVideo: false,
    hasImage: false,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [schedulesPerPage] = useState(4);
  const [debouncedPriceRange, setDebouncedPriceRange] = useState(priceRange);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 1000); // 1 giây

    return () => clearTimeout(timeout);
  }, [priceRange]);

  const city = location.state?.city || "";
  const name = location.state?.name || "";
  // Helper function to calculate price
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

  // Fetch all schedules when the component is mounted
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get(
          url + "/api/schedule/getAllSchedule?limit=100"
        );
        if (response.data.success) {
          if (user) {
            setSchedules(
              response.data.schedules.filter(
                (schedule) => schedule.isPublic === true && schedule.idUser !== user._id
              )
            );
            setFilteredSchedules(
              response.data.schedules.filter(
                (schedule) => schedule.isPublic === true && schedule.idUser !== user._id
              )
            )
          } else {
            setSchedules(
              response.data.schedules.filter(
                (schedule) => schedule.isPublic === true
              )
            );
            setFilteredSchedules(
              response.data.schedules.filter(
                (schedule) => schedule.isPublic === true
              )
            )
          }

        } else {
          console.error("Failed to fetch schedules:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };
    fetchSchedules();
  }, [url]);

  // Handle search based on filters
  const handleSearch = () => {
    const filtered = schedules.filter((schedule) => {
      const matchesSearch =
        (addressFilter === "" ||
          schedule.address
            .toLowerCase()
            .includes(addressFilter.toLowerCase())) &&
        (scheduleNameFilter === "" ||
          schedule.scheduleName
            .toLowerCase()
            .includes(scheduleNameFilter.toLowerCase()));
      const matchesPrice =
        calculateTotalCost(schedule.activities) >= priceRange[0] &&
        calculateTotalCost(schedule.activities) <= priceRange[1];

      const matchesType =
        !filters.activityType ||
        schedule.activities.some((day) =>
          day.activity.some(
            (act) =>
              act.activityType.toLowerCase() ===
              filters.activityType.toLowerCase()
          )
        );

      const matchesDuration =
        !filters.days ||
        filters.days === 0 ||
        schedule.numDays === filters.days; // Directly compare as numbers

      const matchesMedia =
        (!filters.hasVideo || schedule.videoSrc) &&
        (!filters.hasImage || schedule.imgSrc.length > 0);

      return (
        matchesSearch &&
        matchesPrice &&
        matchesType &&
        matchesDuration &&
        matchesMedia
      );
    });
    // Sort by likes or comments if specified
    if (filters.sortBy === "likes") {
      filtered.sort((a, b) => b.likes.length - a.likes.length);
    } else if (filters.sortBy === "comments") {
      filtered.sort(
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

    setFilteredSchedules(filtered);
  };

  // Handle pagination logic
  const indexOfLastSchedule = currentPage * schedulesPerPage;
  const indexOfFirstSchedule = indexOfLastSchedule - schedulesPerPage;
  const currentSchedules = filteredSchedules.slice(
    indexOfFirstSchedule,
    indexOfLastSchedule
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handleScheduleClick = (id) => {
    navigate(`/schedule-view/${id}`);
  };

  useEffect(() => {
    const fetchAccommodations = async () => {
      if (city) {
        setScheduleNameFilter(name);
        setAddressFilter(city);
        hasSearchedRef.current = true;
        handleSearch(); // Gọi trực tiếp sau khi set
      }
    };
    fetchAccommodations();
  }, [city, name]);
  useEffect(() => {
    handleSearch();
  }, [schedules]);
  // Re-run search whenever filters change
  useEffect(() => {
    handleSearch();
  }, [debouncedPriceRange, filters]);

  return (
    <div className="search-schedule">
      {/* Search bar */}
      <div className="search-bar">
        <div className="search-group">
          <div className="search-header">
            <i className="fa fa-map-marker" aria-hidden="true"></i>
            <p className="search-label" htmlFor="destination">
              Địa điểm
            </p>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo địa điểm"
            className="search-field"
            id="destination"
            value={addressFilter}
            onChange={(e) => setAddressFilter(e.target.value)}
          />
        </div>

        <div className="search-group">
          <div className="search-header">
            <i className="fa-solid fa-calendar-days"></i>
            <p className="search-label" htmlFor="schedule">
              Tên lịch trình
            </p>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên lịch trình"
            className="search-field"
            id="schedule"
            value={scheduleNameFilter}
            onChange={(e) => setScheduleNameFilter(e.target.value)}
          />
        </div>
        <button className="search-action-btn" onClick={handleSearch}>
          Tìm kiếm
        </button>
      </div>

      <div className="main-content">
        {/* Filters */}
        <div className="filters-container">
          <div className="filters">
            <h3>Lọc & Sắp xếp</h3>
            {/* Activity Type Filter */}
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

            {/* Number of Days Filter */}
            <label>
              <span>Số ngày </span>
              <select
                value={filters.days}
                onChange={
                  (e) =>
                    setFilters({
                      ...filters,
                      days: parseInt(e.target.value, 10),
                    }) // Convert to number
                }
              >
                <option value="0">Tất cả</option>
                <option value="1">1 ngày</option>
                <option value="2">2 ngày 1 đêm </option>
                <option value="3">3 ngày 2 đêm</option>
                <option value="4">4 ngày 3 đêm</option>
                <option value="5">5 ngày 4 đêm</option>
                <option value="6">6 ngày 5 đêm</option>
                <option value="7">7 ngày 6 đêm</option>
              </select>
            </label>

            {/* Sorting Filter */}
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

            {/* Media Filters */}
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

          {/* Price Range Slider */}
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

        {/* Schedule List */}
        <div>
          <div className="schedule-list">
            {currentSchedules.map((schedule, index) => (
              <PostCard
                key={index}
                schedule={schedule}
                handleScheduleClick={handleScheduleClick}
                setShowLogin={setShowLogin}
              />
            ))}
          </div>

          {currentSchedules.length === 0 && (
            <div className="no-schedule">
              <h3>Không tìm thấy lịch trình</h3>
            </div>
          )}
          {currentSchedules.length > 0 && (
            <div className="pagination-container">
              <button
                className="prev-button"
                onClick={() => {
                  paginate(currentPage - 1), // Cuộn đến vị trí (30px, 30px) với hiệu ứng mượt
                    window.scrollTo({
                      top: 10,
                      left: 10,
                      behavior: "smooth",
                    });
                }}
                disabled={currentPage === 1}
              >
                Trước
              </button>
              <span>{currentPage}</span>
              <button
                className="next-button"
                onClick={() => {
                  paginate(currentPage + 1),
                    window.scrollTo({
                      top: 10,
                      left: 10,
                      behavior: "smooth",
                    });
                }}
                disabled={
                  currentPage * schedulesPerPage >= filteredSchedules.length
                }
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchSchedule;

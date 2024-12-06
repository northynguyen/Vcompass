import React, { useState, useEffect, useContext, useRef } from "react";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";
import PostCard from "../../components/Poster/PostCard";
import { Range } from "react-range"; // Import react-range
import "./SearchSchedule.css";
import { useLocation, useNavigate } from "react-router-dom";

const SearchSchedule = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { url } = useContext(StoreContext);
  const hasSearchedRef = useRef(false);
  const [schedules, setSchedules] = useState([]);
  const [addressFilter, setAddressFilter] = useState("");
  const [scheduleNameFilter, setScheduleNameFilter] = useState ("");
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [filters, setFilters] = useState({
    activityType: "",
    sortBy: "",
    hasVideo: false,
    hasImage: false,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [schedulesPerPage] = useState(4); // Number of schedules per page

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
        const response = await axios.get(url + "/api/schedule/getAllSchedule");
        if (response.data.success) {
          setSchedules(response.data.schedules); // Ensure correct response property
          setFilteredSchedules(response.data.schedules);
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
          schedule.address.toLowerCase().includes(addressFilter.toLowerCase())) &&
        (scheduleNameFilter === "" ||
          schedule.scheduleName.toLowerCase().includes(scheduleNameFilter.toLowerCase()));

      const matchesPrice =
        calculateTotalCost(schedule.activities) >= priceRange[0] &&
        calculateTotalCost(schedule.activities) <= priceRange[1];

      const matchesType =
        !filters.activityType ||
        schedule.activities.some((day) =>
          day.activity.some(
            (act) =>
              act.activityType.toLowerCase() === filters.activityType.toLowerCase()
          )
        );

      const matchesDuration =
        !filters.days || filters.days === 0 || schedule.numDays === filters.days; // Directly compare as numbers

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
    if (city && !hasSearchedRef.current) {
      setAddressFilter(city);
      setScheduleNameFilter(name);
      hasSearchedRef.current = true; // Only set this flag once
    }
  }, [city, name]);  // Trigger only when city or name changes
  
  
  // Re-run search whenever filters change
  useEffect(() => {
    handleSearch();
  }, [ priceRange, filters]);

  return (
    <div className="search-schedule">
      {/* Search bar */}
      <div className="search-bar">
        <div className="search-group">
          <div className="search-header">
            <i className="fa fa-map-marker" aria-hidden="true"></i>
            <label className="search-label" htmlFor="destination">
              Địa điểm
            </label>
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
            <label className="search-label" htmlFor="schedule">
              Tên lịch trình
            </label>
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
                onChange={(e) =>
                  setFilters({ ...filters, days: parseInt(e.target.value, 10) }) // Convert to number
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
                    height: "8px",
                    background: "#ddd",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      height: "8px",
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
                    height: "16px",
                    width: "16px",
                    backgroundColor: "#007bff",
                    borderRadius: "50%",
                    border: "2px solid white",
                  }}
                />
              )}
            />
            <div className="price-range">
              <span>{priceRange[0].toLocaleString("vi-VN")}đ</span>
              <span>{priceRange[1].toLocaleString("vi-VN")}đ</span>
            </div>
          </div>
        </div>

        {/* Schedule List */}
        <div>
        <div className="schedule-list">
          {currentSchedules.map((schedule, index) => (
            <PostCard key={index} schedule={schedule} handleScheduleClick={handleScheduleClick} />
          ))}
        </div>

        {currentSchedules.length === 0 && 
          <div className="no-schedule">
             <h3>Không tìm thấy lịch trình</h3>
          </div>}
        { currentSchedules.length > 0 &&
        <div className="pagination-container">
          <button
            className="prev-button"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>{currentPage}</span>
          <button
            className="next-button"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage * schedulesPerPage >= filteredSchedules.length}
          >
            Next
          </button>
        </div>}
        </div>
        
      </div>
    </div>
  );
};

export default SearchSchedule;

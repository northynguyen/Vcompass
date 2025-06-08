import axios from "axios";
import PropTypes from "prop-types";
import { useContext, useEffect, useRef, useState } from "react";
import { Range } from "react-range"; // Import react-range
import { useLocation, useNavigate } from "react-router-dom";
import PostCard from "../../components/Poster/PostCard";
import PostCardSkeleton from "../../components/Poster/PostCardSkeleton";
import { StoreContext } from "../../Context/StoreContext";
import "./SearchSchedule.css";

const SearchSchedule = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { url, user } = useContext(StoreContext);
  const hasSearchedRef = useRef(false);
  
  // State cho search và filters
  const [addressFilter, setAddressFilter] = useState(location.state?.city || "");
  const [scheduleNameFilter, setScheduleNameFilter] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [filters, setFilters] = useState({
    activityType: "",
    sortBy: "",
    hasVideo: false,
    hasImage: false,
    days: 0,
  });

  // State cho API response
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    total: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [schedulesPerPage] = useState(4);
  const [debouncedPriceRange, setDebouncedPriceRange] = useState(priceRange);

  // Debounce price range
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [priceRange]);

  const city = location.state?.city || "";
  const name = location.state?.name || "";

  // Function để build query parameters
  const buildQueryParams = (page = 1) => {
    const params = new URLSearchParams();
    
    // Basic params
    params.append('page', page.toString());
    params.append('limit', schedulesPerPage.toString());
    
    // User exclusion
    if (user?._id) {
      params.append('userId', user._id);
    }
    
    // Search filters
    if (addressFilter.trim()) {
      params.append('cities', addressFilter.trim());
    }
    
    if (scheduleNameFilter.trim()) {
      params.append('scheduleName', scheduleNameFilter.trim());
    }
    
    // Price range
    if (debouncedPriceRange[0] > 0) {
      params.append('priceMin', debouncedPriceRange[0].toString());
    }
    if (debouncedPriceRange[1] < 10000000) {
      params.append('priceMax', debouncedPriceRange[1].toString());
    }
    
    // Activity type
    if (filters.activityType) {
      params.append('activityType', filters.activityType);
    }
    
    // Number of days
    if (filters.days && filters.days > 0) {
      params.append('numDays', filters.days.toString());
    }
    
    // Media filters
    if (filters.hasVideo) {
      params.append('hasVideo', 'true');
    }
    if (filters.hasImage) {
      params.append('hasImage', 'true');
    }
    
    // Sort by
    if (filters.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    
    return params.toString();
  };

  // Function để fetch schedules từ API
  const fetchSchedules = async (page = 1) => {
    setLoading(true);
    try {
      const queryString = buildQueryParams(page);
      const response = await axios.get(`${url}/api/schedule/getAllSchedule?${queryString}`);
      
      if (response.data.success) {
        setSchedules(response.data.schedules || []);
        setPagination({
          currentPage: response.data.currentPage || page,
          totalPages: response.data.totalPages || 0,
          total: response.data.total || 0,
        });
      } else {
        console.error("Failed to fetch schedules:", response.data.message);
        setSchedules([]);
        setPagination({ currentPage: page, totalPages: 0, total: 0 });
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setSchedules([]);
      setPagination({ currentPage: page, totalPages: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Handle search button click
  const handleSearch = () => {
    setCurrentPage(1);
    fetchSchedules(1);
  };

  // Handle pagination
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchSchedules(pageNumber);
  };

  const handleScheduleClick = (id) => {
    navigate(`/schedule-view/${id}`);
  };

  // Initial load và handle URL params
  useEffect(() => {
    if (city) {
      setScheduleNameFilter(name);
      setAddressFilter(city);
      hasSearchedRef.current = true;
    }
  }, [city, name]);

  // Auto search khi filter thay đổi (debounced)
  useEffect(() => {
    if (hasSearchedRef.current) {
      setCurrentPage(1);
      fetchSchedules(1);
    }
  }, [debouncedPriceRange, filters]);

  // Initial fetch
  useEffect(() => {
    if (!hasSearchedRef.current) {
      fetchSchedules(1);
      hasSearchedRef.current = true;
    }
  }, []);

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
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    days: parseInt(e.target.value, 10),
                  })
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
            {loading ? (
              <PostCardSkeleton count={schedulesPerPage} isSearchSchedule={true} />
            ) : (
              schedules.map((schedule, index) => (
                <PostCard
                  key={`${schedule._id}-${index}`}
                  schedule={schedule}
                  handleScheduleClick={handleScheduleClick}
                  setShowLogin={setShowLogin}
                />
              ))
            )}
          </div>

          {!loading && schedules.length === 0 && (
            <div className="no-schedule">
              <h3>Không tìm thấy lịch trình</h3>
              <p>Thử thay đổi bộ lọc để tìm thấy kết quả phù hợp.</p>
            </div>
          )}
          
          {!loading && schedules.length > 0 && (
            <div className="pagination-container">
              <button
                className="prev-button"
                onClick={() => {
                  paginate(currentPage - 1);
                  window.scrollTo({
                    top: 10,
                    left: 10,
                    behavior: "smooth",
                  });
                }}
                disabled={pagination.currentPage === 1}
              >
                Trước
              </button>
              <span>
                Trang {pagination.currentPage} / {pagination.totalPages}
              </span>
              
              <button
                className="next-button"
                onClick={() => {
                  paginate(currentPage + 1);
                  window.scrollTo({
                    top: 10,
                    left: 10,
                    behavior: "smooth",
                  });
                }}
                disabled={pagination.currentPage >= pagination.totalPages}
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

SearchSchedule.propTypes = {
  setShowLogin: PropTypes.func.isRequired,
};

export default SearchSchedule;

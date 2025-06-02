import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { VscCopilot } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import PostCardSkeleton from "../../components/Poster/PostCardSkeleton";
import PropTypes from 'prop-types';

import LeftSideBar from "../../components/LeftSideBar/LeftSideBar";
import AccommodationBanner from "../../components/Poster/AccommodationBanner ";
import PostCard from "../../components/Poster/PostCard";
import SlideBar from "../../components/SlideBar/SlideBar";
import ShortSwiper from "../../components/ShortSwiper/ShortSwiper";
import { StoreContext } from "../../Context/StoreContext";
import "./Home.css";

const Home = ({ setShowLogin }) => {
  const { url, user } = useContext(StoreContext);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [topCity, setTopCity] = useState([]);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [scheduleAI, setScheduleAI] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetching top cities and featured schedules
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch top cities
        const cityResponse = await axios.get(
          `${url}/api/schedule/getByCity/Top`
        );
        if (cityResponse.data.success) {
          setTopCity(cityResponse.data.addresses);
        }
        const href = user ? 
          `${url}/api/schedule/getAllSchedule?forHomePage=true&limit=10&userId=${user._id}` : 
          `${url}/api/schedule/getAllSchedule?forHomePage=true&limit=10`;
        const scheduleResponse = await axios.get(href);
        if (scheduleResponse.data.success) {
          const featuredSchedules = scheduleResponse.data.schedules;
          setFilteredSchedules(featuredSchedules);
          console.log("Featured schedules (auto-sorted by popularity)", featuredSchedules);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = user && user._id ? user._id : '';
        const response = await fetch(`${url}/api/schedule/scheduleforuser/${userId}`);
        const data = await response.json();

        if (data.success) {
          console.log("Recommended schedules by AI:", data.recommendedSchedules);
          setScheduleAI(data.recommendedSchedules);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url, user]);

  const handleScheduleClick = (id) => {
    navigate(`/schedule-view/${id}`);
  };

  // Xử lý sự kiện nhập liệu
  const handleAddressChange = (e) => {
    const input = e.target.value;
    setAddress(input);

    // Lọc danh sách gợi ý dựa trên dữ liệu nhập vào
    if (input) {
      // Lọc các thành phố thông thường
      const filteredRegular = cities.filter(city =>
        city.toLowerCase().includes(input.toLowerCase())
      );
      
      // Lọc các thành phố/địa điểm du lịch nổi tiếng
      const filteredPopular = Object.keys(popularCities).filter(city =>
        city.toLowerCase().includes(input.toLowerCase())
      ).map(city => `${city}, ${popularCities[city]}`);
      
      // Kết hợp cả hai kết quả
      setSuggestions([...filteredPopular, ...filteredRegular]);
    } else {
      setSuggestions([]);
    }
  };

  // Xử lý khi chọn một gợi ý
  const handleSuggestionClick = (selectedCity) => {
    // Kiểm tra nếu là định dạng "Tên thành phố, Tên tỉnh"
    if (selectedCity.includes(', ')) {
      const parts = selectedCity.split(', ');
      const province = parts[1];
      setAddress(province); // Lưu tên tỉnh làm giá trị thực tế
    } else {
      setAddress(selectedCity);
    }
    setSuggestions([]); // Xóa gợi ý sau khi chọn
  };

  const cities = [
    "Hà Nội",
    "TP Hồ Chí Minh",
    "Đà Nẵng",
    "Hải Phòng",
    "Cần Thơ",
    "An Giang",
    "Bà Rịa - Vũng Tàu",
    "Bắc Giang",
    "Bắc Kạn",
    "Bạc Liêu",
    "Bắc Ninh",
    "Bến Tre",
    "Bình Dương",
    "Bình Định",
    "Bình Phước",
    "Bình Thuận",
    "Cà Mau",
    "Cao Bằng",
    "Đắk Lắk",
    "Đắk Nông",
    "Điện Biên",
    "Đồng Nai",
    "Đồng Tháp",
    "Gia Lai",
    "Hà Giang",
    "Hà Nam",
    "Hà Tĩnh",
    "Hải Dương",
    "Hậu Giang",
    "Hòa Bình",
    "Hưng Yên",
    "Khánh Hòa",
    "Kiên Giang",
    "Kon Tum",
    "Lai Châu",
    "Lâm Đồng",
    "Lạng Sơn",
    "Lào Cai",
    "Long An",
    "Nam Định",
    "Nghệ An",
    "Ninh Bình",
    "Ninh Thuận",
    "Phú Thọ",
    "Phú Yên",
    "Quảng Bình",
    "Quảng Nam",
    "Quảng Ngãi",
    "Quảng Ninh",
    "Quảng Trị",
    "Sóc Trăng",
    "Sơn La",
    "Tây Ninh",
    "Thái Bình",
    "Thái Nguyên",
    "Thanh Hóa",
    "Thừa Thiên Huế",
    "Tiền Giang",
    "Trà Vinh",
    "Tuyên Quang",
    "Vĩnh Long",
    "Vĩnh Phúc",
    "Yên Bái",
  ];

  // Popular cities and their provinces
  const popularCities = {
    'Đà Lạt': 'Lâm Đồng',
    'Hạ Long': 'Quảng Ninh',
    'Long Hải': 'Bà Rịa - Vũng Tàu',
    'Nha Trang': 'Khánh Hòa',
    'Phan Thiết': 'Bình Thuận',
    'Huế': 'Thừa Thiên Huế',
    'Hội An': 'Quảng Nam',
    'Sapa': 'Lào Cai',
    'Vũng Tàu': 'Bà Rịa - Vũng Tàu',
    'Đồng Hới': 'Quảng Bình',
    'Tuy Hòa': 'Phú Yên',
    'Quy Nhơn': 'Bình Định',
    'Buôn Ma Thuột': 'Đắk Lắk',
    'Pleiku': 'Gia Lai',
    'Hà Tiên': 'Kiên Giang',
    'Phú Quốc': 'Kiên Giang',
    'Mũi Né': 'Bình Thuận',
    'Bắc Hà': 'Lào Cai',
    'Mộc Châu': 'Sơn La',
    'Mai Châu': 'Hòa Bình',
    'Tam Đảo': 'Vĩnh Phúc',
    'Ninh Bình': 'Ninh Bình',
    'Mỹ Tho': 'Tiền Giang',
    'Cần Giờ': 'TP Hồ Chí Minh',
    'Tây Ninh': 'Tây Ninh',
    'Cát Bà': 'Hải Phòng',
    'Sầm Sơn': 'Thanh Hóa',
    'Cửa Lò': 'Nghệ An',
    'Bảo Lộc': 'Lâm Đồng',
    'Hồ Tràm': 'Bà Rịa - Vũng Tàu',
    'Long Khánh': 'Đồng Nai',
    'Phan Rang': 'Ninh Thuận',
    'Cam Ranh': 'Khánh Hòa',
    'Quảng Ngãi': 'Quảng Ngãi',
    'Tam Kỳ': 'Quảng Nam',
    'Hà Giang': 'Hà Giang',
    'Cao Bằng': 'Cao Bằng',
    'Lạng Sơn': 'Lạng Sơn',
    'Móng Cái': 'Quảng Ninh',
    'Uông Bí': 'Quảng Ninh',
    'Cẩm Phả': 'Quảng Ninh',
    'Thái Nguyên': 'Thái Nguyên',
    'Việt Trì': 'Phú Thọ',
    'Lào Cai': 'Lào Cai',
    'Hà Tĩnh': 'Hà Tĩnh',
    'Đông Hà': 'Quảng Trị',
    'Phan Rang - Tháp Chàm': 'Ninh Thuận',
    'Kon Tum': 'Kon Tum',
    'Gia Nghĩa': 'Đắk Nông',
    'Bến Tre': 'Bến Tre',
    'Trà Vinh': 'Trà Vinh',
    'Vĩnh Long': 'Vĩnh Long',
    'Cao Lãnh': 'Đồng Tháp',
    'Long Xuyên': 'An Giang',
    'Châu Đốc': 'An Giang',
    'Rạch Giá': 'Kiên Giang',
    'Cà Mau': 'Cà Mau',
    'Bạc Liêu': 'Bạc Liêu',
    'Sóc Trăng': 'Sóc Trăng'
  };

  // Handle create schedule click
  const handleCreateScheduleClick = (type = 'manual') => {
    if (!user) {
      setShowLogin(true);
    } else {
      navigate(`/create-schedule/${type}`);
    }
  };

  return (
    <div className="home-layout">
      <div className={`sidebar-toggle-container ${sidebarOpen ? 'closed-sidebar-toggle' : ''}`}>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>
      </div>

      {sidebarOpen && (<div className="sidebar-overlay" onClick={toggleSidebar}></div>)}

      <div className={`sidebar-container ${sidebarOpen ? 'open' : ''}`}>
        <LeftSideBar setShowLogin={setShowLogin} />
      </div>

      

      <div className="home-main-content">
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
        <div className="home-container">
          
          <div className="tour-search">
            <div className="search-container">
              <div className="search-title">
                <div style={{ position: "relative", width: "300px" }}>
                  <i className="fa fa-map-marker search-icon" aria-hidden="true"></i>
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo địa điểm"
                    className="search-input"
                    id="destination"
                    value={address}
                    onChange={handleAddressChange}
                    autoComplete="off"
                  />
                  {/* Hiển thị gợi ý */}
                  {suggestions.length > 0 && (
                    <ul
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        listStyleType: "none",
                        margin: 0,
                        padding: "5px",
                        background: "white",
                        border: "1px solid #ddd",
                        zIndex: 10,
                        maxHeight: "200px",
                        overflowY: "auto",
                        cursor: "pointer",
                      }}
                    >
                      {suggestions.map((city, index) => (
                        <li
                          key={index}
                          onClick={() => handleSuggestionClick(city)}
                          style={{
                            padding: "8px",
                            borderBottom: "1px solid #f1f1f1",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.background = "#f0f0f0")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.background = "white")
                          }
                        >
                          {city}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <button
                className="search-button"
                onClick={() =>
                  navigate(`/searchSchedule`, {
                    state: {
                      city: address,
                      name: "",
                    },
                  })
                }
              >
                Tìm kiếm
              </button>
            </div>


            {/* Short Videos Section */}
           <div className="short-videos-section">      
            <ShortSwiper category="all" limit={8} />
          </div>

            {/* Popular Cities Section */}
            <section className="popular-cities">
              <h2 className="cities-title">Khám phá các thành phố nổi tiếng</h2>
              <p className="cities-description">
                Trải nghiệm chân thực, tận hưởng từng khoảnh khắc trong hành trình
                của bạn
              </p>
              <p className="cities-description">
                Mọi điểm đến trong tầm tay, lên kế hoạch cho chuyến đi trong mơ
                ngay hôm nay!
              </p>

              {/* City Buttons */}
              <div className="city-scroll-wrapper">

                <div className="city-buttons">
                  {topCity.map((city, index) => (
                    <button
                      key={index}
                      className="city-button"
                      onClick={() => navigate(`/searchSchedule`, {
                        state: {
                          city: city.name,
                          name: "",
                        },
                      })}
                    >
                      {city.name}
                    </button>
                  ))}
              </div>
              </div>
            </section>
          </div>


          {/* Short Videos Section */}
           

          <div className="city-slider">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              navigation={!isMobile}
              pagination={{ clickable: true }}
              autoplay={{ delay: 4000 }}
            >
              {topCity.map((city, index) => (
                <SwiperSlide key={index}>
                  <AccommodationBanner cityName={city.name} scheduleSize={city.count} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {scheduleAI && scheduleAI.length > 0 && (
            <div className="post-card-recommendations">
              <div className="post-card-header">
                <h3>Lịch trình dành cho bạn </h3>
              </div>
              <div className="post-card-recommendations__container">
                {isLoading ? (
                  <div className="skeleton-container" style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%"
                  }}>
                    <PostCardSkeleton count={1} />
                  </div>
                ) : (
                  <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={30}
                    slidesPerView={1}
                    navigation={!isMobile}
                    pagination={{ clickable: true }}
                    autoplay={{
                      delay: 4000,
                      pauseOnMouseEnter: true,
                      disableOnInteraction: true,
                    }}
                    breakpoints={{
                      768: { slidesPerView: 1 },
                    }}
                  >
                    {!isLoading &&
                      scheduleAI?.map((schedule, index) => (
                        <SwiperSlide key={index}>
                          <PostCard
                            key={schedule._id}
                            schedule={schedule}
                            handleScheduleClick={handleScheduleClick}
                            style={{ width: windowWidth < 780 ? "100%" : "80%" }}
                            setShowLogin={setShowLogin}
                          />
                        </SwiperSlide>
                      ))}
                    {scheduleAI?.length === 0 && (
                      <SwiperSlide>
                        <p className="post-card-recommendations__message">
                          Không có lịch trình phù hợp.
                        </p>
                      </SwiperSlide>
                    )}
                  </Swiper>
                )}
              </div>
            </div>
          )}

          <div className="post-card-recommendations">
            <div className="post-card-header">
              <h3>Lịch trình nổi bật </h3>
            </div>
            <div className="post-card-recommendations__container">
              {isLoading ? (
                <div className="skeleton-container" style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%"
                }}>
                  <PostCardSkeleton count={1} />
                </div>
              ) : (
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={30}
                  slidesPerView={1}
                  navigation={!isMobile}
                  breakpoints={{
                    768: { slidesPerView: 1 },
                  }}
                  pagination={{ clickable: true }}
                  autoplay={{
                    delay: 3000,
                    pauseOnMouseEnter: true,
                    disableOnInteraction: true,
                  }}
                >
                  {filteredSchedules?.map((schedule, index) => (
                    <SwiperSlide key={index}>
                      <PostCard
                        key={schedule._id}
                        schedule={schedule}
                        handleScheduleClick={handleScheduleClick}
                        style={{ width: windowWidth < 780 ? "100%" : "80%" }}
                        setShowLogin={setShowLogin}
                      />
                    </SwiperSlide>
                  ))}
                  {filteredSchedules?.length === 0 && (
                    <SwiperSlide>
                      <p className="post-card-recommendations__message">
                        Không có lịch trình phù hợp.
                      </p>
                    </SwiperSlide>
                  )}
                </Swiper>
              )}
            </div>
          </div>

         

          <SlideBar type="accommodation" />
          <span></span>
          <SlideBar type="food" />
          <span></span>
          <SlideBar type="attraction" />
        </div>
      </div>
    </div>
  );
};

Home.propTypes = {
  setShowLogin: PropTypes.func.isRequired,
};

export default Home;

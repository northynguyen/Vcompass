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

import LeftSideBar from "../../components/LeftSideBar/LeftSideBar";
import AccommodationBanner from "../../components/Poster/AccommodationBanner ";
import PostCard from "../../components/Poster/PostCard";
import SlideBar from "../../components/SlideBar/SlideBar";
import { StoreContext } from "../../Context/StoreContext";
import "./Home.css";

const Home = () => {
  const { url, token, user } = useContext(StoreContext);
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [topCity, setTopCity] = useState([]);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [scheduleAI, setScheduleAI] = useState([]);

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

  // Fetching all necessary data (Top Cities, Schedules, User Schedules) in a single useEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch top cities
        const cityResponse = await axios.get(
          `${url}/api/schedule/getByCity/Top`
        );
        if (cityResponse.data.success) {
          setTopCity(cityResponse.data.addresses);
        }

        // Fetch user schedules (to get cities)
        const userScheduleResponse = await axios.get(
          `${url}/api/schedule/user/getSchedules`,
          { headers: { token } }
        );

        // Extract unique cities from user schedules
        let userCities = [];
        if (userScheduleResponse.data.success && userScheduleResponse.data.schedules.length > 0) {
          userCities = [...new Set(userScheduleResponse.data.schedules
            .map(schedule => schedule.address)
            .filter(city => city))]; // Filter out undefined/null/empty values and remove duplicates
        }

        console.log("User cities:", userCities);

        // If we have cities from user schedules, get schedules for those cities
        // if (userCities.length > 0) {
        //   const scheduleResponse = await axios.get(
        //     `${url}/api/schedule/getAllSchedule?cities=${userCities.join(",")}&forHomePage=true&userId=${user._id}`
        //   );
        //   console.log("scheduleResponse", scheduleResponse);
        //   if (scheduleResponse.data.success) {
        //     const publicSchedules = scheduleResponse.data.schedules;
        //     setSchedules(publicSchedules);
        //     console.log("publicSchedules for user cities", publicSchedules);
        //   }
        // } else {
        //   // If no user cities, set schedules to empty array
        //   setSchedules([]);
        // }
        const scheduleResponse2 = await axios.get(
          user ?
            `${url}/api/schedule/getAllSchedule?forHomePage=true&userId=${user._id}`
            :
            `${url}/api/schedule/getAllSchedule?forHomePage=true`
        );
        if (scheduleResponse2.data.success) {
          const publicSchedules = scheduleResponse2.data.schedules;
          setFilteredSchedules(publicSchedules);
          console.log("Most liked schedules", publicSchedules);
        }



      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchData2 = async () => {
      try {
        const cityResponse = await axios.get(
          `${url}/api/schedule/getByCity/Top`
        );
        if (cityResponse.data.success) {
          setTopCity(cityResponse.data.addresses);
        }
        const scheduleResponse2 = await axios.get(
          `${url}/api/schedule/getAllSchedule?forHomePage=true`
        );
        if (scheduleResponse2.data.success) {
          const publicSchedules = scheduleResponse2.data.schedules;
          setFilteredSchedules(publicSchedules);
          console.log("Most liked schedules", publicSchedules);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      // Define a separate function for fetching data when user is not logged in
      const fetchData2 = async () => {
        try {
          setIsLoading(true);

          const cityResponse = await axios.get(
            `${url}/api/schedule/getByCity/Top`
          );
          if (cityResponse.data.success) {
            setTopCity(cityResponse.data.addresses);
          }

          const scheduleResponse = await axios.get(
            `${url}/api/schedule/getAllSchedule?forHomePage=true`
          );
          if (scheduleResponse.data.success) {
            const publicSchedules = scheduleResponse.data.schedules;
            setFilteredSchedules(publicSchedules);
            console.log("Most liked schedules", publicSchedules);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData2();
    }
  }, [url, token]);

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
    const value = e.target.value;
    setAddress(value);

    // Lọc danh sách gợi ý dựa trên dữ liệu nhập vào
    if (value) {
      const filtered = cities.filter((city) =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // Xử lý khi chọn một gợi ý
  const handleSuggestionClick = (city) => {
    setAddress(city);
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

  return (
    <div className="home-layout">
      <div className="sidebar-toggle-container">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>
      </div>

      {sidebarOpen && (<div className="sidebar-overlay" onClick={toggleSidebar}></div>)}

      <div className={`sidebar-container ${sidebarOpen ? 'open' : ''}`}>
        <LeftSideBar />
      </div>

      <div className="home-main-content">
        <div className="home-container">
          <header className="hero-section">
            <h1 className="create-schedule-title">Tạo lịch trình du lịch dễ dàng cho chuyến đi của bạn</h1>
            <p className="create-schedule-description">Chỉ mất 3-5 phút, bạn có thể tạo ngay cho mình lịch trình du lịch</p>
            <div className="create-schedule-btn-container">
              <div className="create-schedule-btn" onClick={() => navigate("/create-schedule/manual")}>
                <FiPlus style={{ marginRight: "6px" }} />
                <p>Tạo lịch trình</p>
              </div>
              <div className="create-schedule-btn" onClick={() => navigate("/create-schedule/ai")}>
                <VscCopilot style={{ marginRight: "6px" }} />
                <p>Tạo lịch trình với AI</p>
              </div>
            </div>
          </header>
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
            </section>
          </div>

          <div className="city-slider">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 4000 }}
            >
              {topCity.map((city, index) => (
                <SwiperSlide key={index}>
                  <AccommodationBanner cityName={city.name} />
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
                    navigation
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
                  navigation
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

export default Home;

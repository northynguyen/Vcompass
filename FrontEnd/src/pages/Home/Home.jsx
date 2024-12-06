import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import background from "../../assets/home_bg.jpg";
import AccommodationBanner from "../../components/Poster/AccommodationBanner ";
import PostCard from "../../components/Poster/PostCard";
import SlideBar from "../../components/SlideBar/SlideBar";
import { StoreContext } from "../../Context/StoreContext";
import "./Home.css";
import "swiper/swiper-bundle.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

const Home = () => {
  const { url, token, user } = useContext(StoreContext);
  const [schedules, setSchedules] = useState(null);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [topCity, setTopCity] = useState([]);
  const [address, setAddress] = useState("");
  const [scheduleName, setScheduleName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetching all necessary data (Top Cities, Schedules, User Schedules) in a single useEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cities = [];
        // Fetch top cities
        const cityResponse = await axios.get(`${url}/api/schedule/getByCity/Top`);
        if (cityResponse.data.success) {
          setTopCity(cityResponse.data.addresses);
        }

        // Fetch user schedules (to get cities)
        const userScheduleResponse = await axios.get(
          `${url}/api/schedule/user/getSchedules`,
          { headers: { token } }
        );
        if (userScheduleResponse.data.success) {
          cities.push(userScheduleResponse.data.schedules.map((schedule) => schedule.address));
        }
        if (cities.length > 0) {
        const scheduleResponse = await axios.get(
          `${url}/api/schedule/getAllSchedule?cities=${cities.join(",")}&sortBy=likes&page=1&limit=6`
        );
        if (scheduleResponse.data.success) {
          console.log(scheduleResponse.data);
          const publicSchedules = scheduleResponse.data.schedules.filter((schedule) => schedule.isPublic === true && schedule.idUser !== user._id);
          setSchedules(publicSchedules);
        }
      }

        const scheduleResponse2 = await axios.get(
          `${url}/api/schedule/getAllSchedule?sortBy=likes&page=1&limit=6`
        );
        if (scheduleResponse2.data.success) {
          const publicSchedules = scheduleResponse2.data.schedules.filter((schedule) => schedule.isPublic === true && schedule.idUser !== user._id);
          setFilteredSchedules(publicSchedules);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if(user){
    fetchData();
    }
  }, [url, token ]); 

  const handleScheduleClick = (id) => {
    navigate(`/schedule-view/${id}`);
  };

  const handleFilterByCity = (nameCity) => {
    const filtered = schedules.filter((schedule) => {
      const isAddressMatch = schedule.address
        .toLowerCase()
        .includes(nameCity.toLowerCase());
      return isAddressMatch;
    });
    setFilteredSchedules(filtered);
  };
  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  // Xử lý sự thay đổi cho tên lịch trình
  const handleScheduleChange = (e) => {
    setScheduleName(e.target.value);
  };

  return (
    <div className="home-container">
      <div className="tour-search-container">
        <div className="tour-search">
          {/* Hero Section */}
          <img className="home-background" src={background} alt="Alaska" />
          <div className="hero-section">
            <h1 className="hero-title">
              Chúng tôi mang đến lịch trình du lịch tốt nhất cho bạn
            </h1>
            <p className="hero-subtitle">
              Trải nghiệm hành trình hoàn hảo, khám phá mọi điểm đến mơ ước
            </p>
            <p className="hero-subtitle">
              Kế hoạch du lịch trong tầm tay, sẵn sàng cho những chuyến phiêu
              lưu!
            </p>

            {/* Search Section */}
            <div className="search-container">
              <div className="search-title">
                <div className="search-subtitle">
                  <i className="fa fa-map-marker" aria-hidden="true"></i>
                  <label className="search-icon" htmlFor="destination">
                    Địa điểm
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo địa điểm"
                  className="search-input"
                  id="destination"
                  value={address}
                  onChange={(e) => handleAddressChange(e)}
                />
              </div>

              <div className="search-title">
                <div className="search-subtitle">
                  <i className="fa-solid fa-calendar-days"></i>
                  <label className="search-icon" htmlFor="schedule">
                    Tên lịch trình
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên lịch trình"
                  className="search-input"
                  id="schedule"
                  value={scheduleName}
                  onChange={(e) => handleScheduleChange(e)}
                />
              </div>
              <button
                className="search-button"
                onClick={() =>
                  navigate(
                    `/searchSchedule`, {
                      state: {
                        city: address,
                        name : scheduleName
                      }
                    }
                  )
                }
              >
                Tìm kiếm
              </button>
            </div>
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
                  onClick={() => handleFilterByCity(city.name)}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </section>
        </div>
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

        {schedules && (
          console.log(schedules),
           <div className="post-card-recommendations">
           <div className="post-card-header">
             <h3>Lịch trình dành cho bạn </h3>
           </div>
           <div className="post-card-recommendations__container">
             <Swiper
               modules={[Navigation, Pagination, Autoplay]}
               spaceBetween={30}
               slidesPerView={schedules.length < 2 ? schedules.length : 2}
               navigation
               pagination={{ clickable: true }}
               autoplay={{ delay: 4000 ,
                 pauseOnMouseEnter: true, 
                 disableOnInteraction: true, 
               }}
             >
               {!isLoading &&
                 schedules
                   ?.map((schedule, index) => (
                     <SwiperSlide key={index}>  
                       <PostCard
                         key={schedule._id}
                         schedule={schedule}
                         handleScheduleClick={handleScheduleClick}
                       />
                   </SwiperSlide>              
                   ))}
                 {isLoading && <div className="spinner"> </div>}
               {schedules?.length === 0 && !isLoading && (
                <p className="post-card-recommendations__message"> Không có lịch trình phù hợp.</p>
               )}
             </Swiper>
           </div>
         </div>
        )}
     

      <div className="post-card-recommendations">
        <div className="post-card-header">
          <h3>Lịch trình nổi bật </h3>
        </div>
        <div className="post-card-recommendations__container">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={2}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000 ,
              pauseOnMouseEnter: true, 
              disableOnInteraction: true, 
            }}
          >
            {!isLoading &&
              filteredSchedules?.map((schedule, index) => (
                  <SwiperSlide key={index}>  
                    <PostCard
                      key={schedule._id}
                      schedule={schedule}
                      handleScheduleClick={handleScheduleClick}
                    />
                </SwiperSlide>              
                ))}
              {isLoading && <div className="spinner"> </div>}
            {filteredSchedules?.length === 0 && !isLoading && (
             <p className="post-card-recommendations__message"> Không có lịch trình phù hợp.</p>
            )}
          </Swiper>
        </div>
      </div>

      <SlideBar type="accommodation" />
      <span></span>
      <SlideBar type="food" />
      <span></span>
      <SlideBar type="attraction" />
    </div>
  );
};

export default Home;

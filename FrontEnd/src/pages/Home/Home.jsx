import axios from "axios";
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import background from '../../assets/home_bg.jpg';
import AccommodationBanner from '../../components/Poster/AccommodationBanner ';
import PostCard from '../../components/Poster/PostCard';
import SlideBar from '../../components/SlideBar/SlideBar';
import { StoreContext } from '../../Context/StoreContext';
import "./Home.css";
const Home = () => {
  const { url, user } = useContext(StoreContext)
  const [schedules, setSchedules] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [topCity, setTopCity] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    fetchTopAddress();
    fetchSchedules();
  }, [url]);
  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${url}/api/schedule/getAllSchedule`);
      if (response.data.success) {
        setSchedules(response.data.schedule);
        setIsLoading(false);
      } else {
        console.error("Failed to fetch schedules:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };
  const fetchTopAddress = async () => {
    try {
      const response = await axios.get(`${url}/api/schedule/getByCity/Top`);
      if (response.data.success) {
        setTopCity(response.data.addresses);
        setIsLoading(false);
      } else {
        console.error("Failed to fetch Cities:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };
  const handleScheduleClick = (id) => {
    navigate(`/schedule-view/${id}`);
  };

  return (
    <div className="home-container">
      <div className='tour-search-container'>
        <div className="tour-search">
          {/* Hero Section */}
          <img className='home-background' src={background} alt="Alaska" />
          <div className="hero-section">
            <h1 className="hero-title">Chúng tôi mang đến lịch trình du lịch tốt nhất cho bạn</h1>
            <p className="hero-subtitle">
              Trải nghiệm hành trình hoàn hảo, khám phá mọi điểm đến mơ ước

            </p>
            <p className="hero-subtitle">
              Kế hoạch du lịch trong tầm tay, sẵn sàng cho những chuyến phiêu lưu!
            </p>

            {/* Search Section */}
            <div className="search-container">
              <div className='search-title'>
                <div className='search-subtitle'>
                  <i className="fa fa-map-marker" aria-hidden="true"></i>
                  <label className='search-icon' htmlFor="destination">Location</label>
                </div>
                <input type="text" placeholder="Search For A Destination" className="search-input" id='destination' />
              </div>

              <div className='search-title'>
                <div className='search-subtitle'>
                  <i className="fa-solid fa-calendar-days"></i>
                  <label className='search-icon' htmlFor="schedule">Location</label>
                </div>
                <input type="text" placeholder="Search name Schedule" className="search-input" id='schedule' />
              </div>
              <button className="search-button">Search</button>
            </div>
          </div>

          {/* Popular Cities Section */}
          <section className="popular-cities">
            <h2 className="cities-title">Khám phá các thành phố nổi tiếng</h2>
            <p className="cities-description">Trải nghiệm chân thực, tận hưởng từng khoảnh khắc trong hành trình của bạn</p>
            <p className="cities-description">Mọi điểm đến trong tầm tay, lên kế hoạch cho chuyến đi trong mơ ngay hôm nay!</p>

            {/* City Buttons */}
            <div className="city-buttons">
              {topCity.map((city, index) => (
                <button key={index} className="city-button">{city.name}</button>
              ))}
            </div>
          </section>
        </div>
      </div>
      <div className='post-card-container'>
        {!isLoading && schedules?.filter(schedule => schedule.idUser._id !== user._id)
          .map(schedule => (
            <PostCard key={schedule._id} schedule={schedule} handleScheduleClick={handleScheduleClick} />
          ))
        }
      </div>

      <div>
        <AccommodationBanner />
      </div>
      <SlideBar type='accommodation' />
      <span></span>
      <SlideBar type='food' />
      <span></span>
      <SlideBar type='attraction' />
    </div>
  );
};

export default Home;

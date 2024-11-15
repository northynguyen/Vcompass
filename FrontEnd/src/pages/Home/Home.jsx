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
  const navigate = useNavigate();
  useEffect(() => {
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
    fetchSchedules();
  }, [url]);

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
            <h1 className="hero-title">We Find The Best Tours For You</h1>
            <p className="hero-subtitle">
              Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint.
            </p>
            <p className="hero-subtitle">
              Exercitation veniam consequat sunt nostrud amet.
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
            <h2 className="cities-title">Explore Popular Cities</h2>
            <p className="cities-description">Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint.</p>
            <p className="cities-description">Velit officia consequat duis enim velit mollit.</p>

            {/* City Buttons */}
            <div className="city-buttons">
              {['New York', 'California', 'Alaska', 'Sidney', 'Dubai', 'London', 'Tokyo', 'Delhi'].map((city) => (
                <button key={city} className="city-button">
                  {city}
                </button>
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

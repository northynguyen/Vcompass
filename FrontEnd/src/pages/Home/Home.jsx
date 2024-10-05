import background from '../../assets/home_bg.jpg';
import Header from '../../components/Header/Header';
import AccommodationBanner from '../../components/Poster/AccommodationBanner ';
import PostCard from '../../components/Poster/PostCard';
import "./Home.css";
const Home = () => {
  return (
   <div>
      <Header/>
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
    <PostCard/>
    </div>

    <div>
      <AccommodationBanner/>
    </div>


   </div>
  );
};

export default Home;

import { useState, useEffect, useContext, useRef } from 'react';
import { StoreContext } from '../../../Context/StoreContext';
import './RecommendPlace.css';
import axios from 'axios';
import PropTypes from 'prop-types';

const RecommendPlace = ({ city, onSelectPlace }) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const { url } = useContext(StoreContext);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const fetchRecommendedPlaces = async () => {
      try {
        setLoading(true);
        // Fetch attractions and food services near the city
        const attractionsResponse = await axios.get(`${url}/api/attractions?city=${city}&limit=100`);
        const foodServicesResponse = await axios.get(`${url}/api/foodservices/search?keyword=${city}&limit=100`);
        
        // Combine and organize the data
        const attractions = attractionsResponse.data.attractions || [];
        const foodServices = foodServicesResponse.data.data || [];
        
        const recommendedPlaces = [
          ...attractions.map(attraction => ({
            id: attraction._id,
            name: attraction.attractionName,
            images: attraction.images,
            type: 'Attraction',
            data: attraction
          })),
          ...foodServices.map(foodService => ({
            id: foodService._id,
            name: foodService.foodServiceName,
            images: foodService.images,
            type: 'FoodService',
            data: foodService
          }))
        ];
        
        setPlaces(recommendedPlaces);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recommended places:', error);
        setLoading(false);
      }
    };

    if (city) {
      fetchRecommendedPlaces();
    } else {
      setPlaces([]);
      setLoading(false);
    }
  }, [city, url]);

  useEffect(() => {
    if (scrollRef.current) {
      checkScrollability();
    }
  }, [places, expanded]);

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const handleScroll = () => {
    checkScrollability();
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
      setTimeout(checkScrollability, 500);
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
      setTimeout(checkScrollability, 500);
    }
  };

  const handleAddPlace = (place) => {
    if (onSelectPlace) {
      onSelectPlace(place);
    }
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Helper function to get image URL
  const getImageUrl = (place) => {
    if (!place.images || !place.images.length) {
      return 'https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg';
    }
    
    const image = place.images[0];
    if (image.includes('http')) {
      return image;
    }
    
    return `${url}/images/${image}`;
  };

  if (loading) {
    return <div className="recommend-place-loading">Đang tải...</div>;
  }

  return (
    <div className="recommend-place-container">
      <div className="recommend-place-header" onClick={toggleExpanded}>
        <i className={`fa-solid fa-chevron-${expanded ? 'down' : 'right'}`}></i>
        <h3>Địa điểm đề xuất</h3>
      </div>
      
      {expanded && (
        <div className="recommend-place-wrapper">
          <button 
            className={`recommend-place-nav-btn recommend-place-prev-btn ${!canScrollLeft ? 'disabled' : ''}`}
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          
          <div 
            className="recommend-place-scroll"
            ref={scrollRef}
            onScroll={handleScroll}
          >
            {places.length > 0 ? (
              <div className="recommend-place-cards">
                {places.map((place) => (
                  <div key={place.id} className="recommend-place-card">
                    <div className="recommend-place-image">
                      <img 
                        src={getImageUrl(place)} 
                        alt={place.name}
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.src = 'https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg';
                        }}
                      />
                    </div>
                    <div className="recommend-place-info">
                      <h4>{place.name}</h4>
                    </div>
                    <button 
                      className="recommend-place-add-btn"
                      onClick={() => handleAddPlace(place)}
                    >
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="recommend-place-empty">
                Không có địa điểm đề xuất cho khu vực này
              </div>
            )}
          </div>
          
          <button 
            className={`recommend-place-nav-btn recommend-place-next-btn ${!canScrollRight ? 'disabled' : ''}`}
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

RecommendPlace.propTypes = {
  city: PropTypes.string,
  onSelectPlace: PropTypes.func
};

export default RecommendPlace; 
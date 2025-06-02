import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { FaPlay } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { StoreContext } from '../../Context/StoreContext';
import PropTypes from 'prop-types';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './ShortSwiper.css';

const ShortSwiper = ({ category = 'all', limit = 8 }) => {
  const { url, token } = useContext(StoreContext);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch videos từ API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let endpoint = `${url}/api/shortvideo/videos`;
        const params = {
          limit,
          page: 1
        };
        
        // Thêm category nếu không phải 'all'
        if (category !== 'all') {
          params.category = category;
        }

        const response = await axios.get(endpoint, {
          headers: token ? { token } : {},
          params
        });

        if (response.data.success) {
          setVideos(response.data.videos || []);
        } else {
          setError('Không thể tải video');
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Có lỗi xảy ra khi tải video');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [url, token, category, limit]);

  // Handle video click
  const handleVideoClick = (video) => {
    window.open(`/short-video?videoId=${video._id}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="short-swiper-loading">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="short-swiper-skeleton">
            <div className="skeleton-video"></div>
            <div className="skeleton-avatar"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="short-swiper-error">
        <p>{error}</p>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="short-swiper-empty">
        <p>Không có video nào</p>
      </div>
    );
  }

  return (
    <div className="short-swiper-container">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView="auto"
        centeredSlides={true}
        navigation={{
          nextEl: '.short-swiper-button-next',
          prevEl: '.short-swiper-button-prev',
        }}
        pagination={{
          el: '.short-swiper-pagination',
          clickable: true,
          dynamicBullets: true,
          dynamicMainBullets: 3,
        }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={videos.length > 5}
        grabCursor={true}
        watchOverflow={true}
        breakpoints={{
          320: {
            slidesPerView: 2,
            spaceBetween: 15,
            centeredSlides: false,
          },
          480: {
            slidesPerView: 3,
            spaceBetween: 15,
            centeredSlides: false,
          },
          768: {
            slidesPerView: 4,
            spaceBetween: 20,
            centeredSlides: true,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 20,
            centeredSlides: true,
          },
          1200: {
            slidesPerView: 6,
            spaceBetween: 25,
            centeredSlides: true,
          },
        }}
        className="short-swiper"
      >
        {videos.map((video) => (
          <SwiperSlide key={video._id} className="short-swiper-slide">
            <div 
              className="short-swiper-item"
              onClick={() => handleVideoClick(video)}
            >
              {/* Video Thumbnail/Preview */}
              <div className="short-video-preview">
                {video.thumbnailUrl ? (
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title || 'Video thumbnail'}
                    className="video-thumbnail"
                  />
                ) : (
                  <div className="video-placeholder">
                    <FaPlay className="play-icon" />
                  </div>
                )}
                
                {/* Play Overlay */}
                <div className="video-overlay">
                  <FaPlay className="play-button" />
                </div>

                {/* Duration Badge */}
                {video.duration && (
                  <div className="duration-badge">
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>

              {/* User Avatar */}
              <div className="user-avatar">
                <img 
                  src={
                    video.userId?.avatar?.includes('http') 
                      ? video.userId.avatar 
                      : video.userId?.avatar 
                        ? `${url}/images/${video.userId.avatar}` 
                        : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt={video.userId?.name || 'User'}
                />
              </div>

              {/* Video Info */}
              <div className="video-info">
                <h4 className="video-title">
                  {video.title || video.userId?.name || 'Untitled'}
                </h4>
                {video.views > 0 && (
                  <span className="video-views">
                    {video.views > 1000 
                      ? `${(video.views / 1000).toFixed(1)}K views`
                      : `${video.views} views`
                    }
                  </span>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <div className="short-swiper-button-prev short-swiper-nav">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="short-swiper-button-next short-swiper-nav">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Custom Pagination */}
      <div className="short-swiper-pagination"></div>
    </div>
  );
};

ShortSwiper.propTypes = {
  category: PropTypes.string,
  limit: PropTypes.number
};

export default ShortSwiper; 
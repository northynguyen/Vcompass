import { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaPlay } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { StoreContext } from '../../Context/StoreContext';
import PropTypes from 'prop-types';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import './ShortSwiper.css';

const ShortSwiper = ({ category = 'all', limit = 8 }) => {
  const { url, token } = useContext(StoreContext);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        {[...Array(isMobile ? 4 : 8)].map((_, index) => (
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
        modules={[Navigation, Autoplay]}
        spaceBetween={5}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation={!isMobile}
        loop={videos.length > 8}
        breakpoints={{
          1024: {
            slidesPerView: 8,
          },
          300: {
            slidesPerView: 4,
          },
        }}
      >
        {videos.map((video) => (
          <SwiperSlide key={video._id}>
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
                    className="video-thumbnail-swiper "
                  />
                ) : (
                  <div className="video-placeholder-swiper">
                    <FaPlay className="play-icon-swiper" />
                  </div>
                )}
                
                {/* Play Overlay */}
                <div className="video-overlay-swiper">
                  <div className="play-button-swiper">
                    <FaPlay className="" />
                  </div>
                </div>

                
              </div>

              {/* User Avatar */}
              <div className="user-avatar-short-swiper">
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
    </div>
  );
};

ShortSwiper.propTypes = {
  category: PropTypes.string,
  limit: PropTypes.number
};

export default ShortSwiper; 
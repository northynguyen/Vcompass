import { useState, useEffect, useContext } from 'react';
import { FaChevronLeft, FaSearch, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import PropTypes from 'prop-types';
import axios from 'axios';
import { StoreContext } from '../../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';
import './ExploreView.css';

const ExploreView = ({ onClose }) => {
  const { url, token } = useContext(StoreContext);
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  
  const categories = [
    { id: 'trending', name: 'Xu hướng' },
    { id: 'music', name: 'Âm nhạc' },
    { id: 'dance', name: 'Nhảy múa' },
    { id: 'comedy', name: 'Hài hước' },
    { id: 'food', name: 'Ẩm thực' },
    { id: 'travel', name: 'Du lịch' },
    { id: 'fashion', name: 'Thời trang' },
    { id: 'sports', name: 'Thể thao' },
    { id: 'education', name: 'Giáo dục' },
    { id: 'gaming', name: 'Gaming' }
  ];
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const fetchVideos = async (category, page = 1, isNewCategory = false) => {
    try {
      setLoading(true);
      setError(null);
      let endpoint = `${url}/api/shortvideo/videos`;
      
      // Nếu là trending, gọi API trending
      if (category === 'trending') {
        endpoint = `${url}/api/shortvideo/all/trending`;
      }

      console.log('Fetching videos from:', endpoint);
      console.log('With params:', {
        category: category !== 'trending' ? category : undefined,
        page,
        limit: 12
      });

      const response = await axios.get(endpoint, {
        headers: { token },
        params: {
          category: category !== 'trending' ? category : undefined,
          page,
          limit: 12
        }
      });

      console.log('API Response:', response.data);

      if (response.data.success) {
        const newVideos = response.data.videos || [];
        console.log('Received videos:', newVideos.length);
        
        if (isNewCategory) {
          setVideos(newVideos);
          setCurrentPage(1);
        } else {
          setVideos(prev => [...prev, ...newVideos]);
        }
        setHasMore(newVideos.length === 12);
      } else {
        console.error('API returned error:', response.data.message);
        setError(response.data.message || 'Không thể tải video');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Có lỗi xảy ra khi tải video');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchVideos(activeCategory, 1, true);
  }, [activeCategory]);
  
  const loadMoreVideos = () => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchVideos(activeCategory, nextPage);
    }
  };
  
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        loadMoreVideos();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage, loading, hasMore]);
  
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    window.scrollTo(0, 0);
  };
  
  const handleSearch = () => {
    setSearchTerm(searchQuery);
    setCurrentPage(1);
    setVideos([]);
    fetchVideos(activeCategory, 1, true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const filteredVideos = videos?.filter(video => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    
    // Tìm kiếm theo tiêu đề
    const titleMatch = video.title?.toLowerCase().includes(term);
    
    // Tìm kiếm theo mô tả
    const descriptionMatch = video.description?.toLowerCase().includes(term);
    
    // Tìm kiếm theo thể loại
    const categoryMatch = video.category?.toLowerCase().includes(term);
    
    // Tìm kiếm theo tên người dùng
    const usernameMatch = video.userId?.name?.toLowerCase().includes(term);
    
    // Tìm kiếm theo tags
    const tagsMatch = video.tags?.some(tag => 
      tag.toLowerCase().includes(term)
    );
    
    // Trả về true nếu bất kỳ tiêu chí nào khớp
    return titleMatch || descriptionMatch || categoryMatch || usernameMatch || tagsMatch;
  });
  
  const handleVideoClick = (video) => {
    // Đóng ExploreView
    onClose();
    
    // Chuyển đến trang ShortVideo với videoId
    navigate(`/short-video?videoId=${video._id}`);
  };
  
  return (
    <div className="explore-container">
      <div className="explore-header-wrapper">
        <div className="explore-header">
          <div className="explore-header-left">
            <button className="back-button" onClick={onClose}>
              <FaArrowLeft />
            </button>
            <h2>Khám phá</h2>
          </div>
          
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm video..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <FaSearch 
              className="search-icon" 
              onClick={handleSearch}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>
        
        <div className={`categories-scrollbar ${scrollPosition > 0 ? 'with-shadow' : ''}`}>
          {categories.map(category => (
            <div 
              key={category.id}
              className={`category-item ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </div>
          ))}
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="videos-grid">
        {filteredVideos?.map(video => (
          <div 
            key={video._id} 
            className="video-card"
            onClick={() => handleVideoClick(video)}
            style={{ cursor: 'pointer' }}
          >
            <div className="video-thumbnail">
              <img src={video.thumbnailUrl} alt={video.title} />
              <div className="video-overlay">
                <div className="video-title">{video.title}</div>
                <div className="video-views">{video.views} lượt xem</div>
              </div>
              <div className="video-info-explore">
                <div className="video-username-explore">
                  @{video.userId?.name}
                  {video.userId?.verified && <span className="verified-badge">✓</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {loading && (
        <div className="loading-more">
          Đang tải thêm video...
        </div>
      )}
    </div>
  );
};

ExploreView.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default ExploreView; 
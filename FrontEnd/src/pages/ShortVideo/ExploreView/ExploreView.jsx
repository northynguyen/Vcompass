import React, { useState } from 'react';
import { FaChevronLeft, FaSearch } from 'react-icons/fa';
import './ExploreView.css';

const ExploreView = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'singing', name: 'Singing & Dancing' },
    { id: 'comedy', name: 'Comedy' },
    { id: 'sports', name: 'Sports' },
    { id: 'anime', name: 'Anime & Comics' },
    { id: 'relationship', name: 'Relationship' },
    { id: 'shows', name: 'Shows' },
    { id: 'lipsync', name: 'Lipsync' },
    { id: 'dailylife', name: 'Daily Life' },
    { id: 'beauty', name: 'Beauty Care' },
    { id: 'games', name: 'Games' },
    { id: 'society', name: 'Society' },
    { id: 'outfit', name: 'Outfit' },
    { id: 'cars', name: 'Cars' },
    { id: 'food', name: 'Food' },
    { id: 'animals', name: 'Animals' },
    { id: 'family', name: 'Family' }
  ];
  
  const videos = [
    {
      id: 1,
      thumbnail: 'https://picsum.photos/300/500?random=1',
      views: '91.2K',
      username: 'vitaminyn_133',
      verified: false
    },
    {
      id: 2,
      thumbnail: 'https://picsum.photos/300/500?random=2',
      views: '174.6K',
      username: 'khaungtiepvn',
      verified: false
    },
    {
      id: 3,
      thumbnail: 'https://picsum.photos/300/500?random=3',
      views: '862.1K',
      username: 'meonhaminh1111',
      verified: false
    },
    {
      id: 4,
      thumbnail: 'https://picsum.photos/300/500?random=4',
      views: '531.3K',
      username: 'letrunghoang',
      verified: true
    },
    {
      id: 5,
      thumbnail: 'https://picsum.photos/300/500?random=5',
      views: '596.2K',
      username: 'theanh28entertainment',
      verified: true
    },
    {
      id: 6,
      thumbnail: 'https://picsum.photos/300/500?random=6',
      views: '235.8K',
      username: 'user123',
      verified: false
    },
    {
      id: 7,
      thumbnail: 'https://picsum.photos/300/500?random=7',
      views: '782.4K',
      username: 'trendy_videos',
      verified: true
    },
    {
      id: 8,
      thumbnail: 'https://picsum.photos/300/500?random=8',
      views: '412.9K',
      username: 'funny_clips',
      verified: false
    },
    {
      id: 9,
      thumbnail: 'https://picsum.photos/300/500?random=9',
      views: '325.7K',
      username: 'daily_trends',
      verified: true
    },
    {
      id: 10,
      thumbnail: 'https://picsum.photos/300/500?random=10',
      views: '912.3K',
      username: 'viral_content',
      verified: true
    }
  ];
  
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
  };
  
  const filteredVideos = searchQuery
    ? videos.filter(video => video.username.toLowerCase().includes(searchQuery.toLowerCase()))
    : videos;
  
  return (
    <div className="explore-container">
      <div className="explore-header">
        <button className="back-button" onClick={onClose}>
          <FaChevronLeft />
        </button>
        <h2>Explore</h2>
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search videos" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="categories-scrollbar">
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
      
      <div className="videos-grid">
        {filteredVideos.map(video => (
          <div key={video.id} className="video-card">
            <div className="video-thumbnail">
              <img src={video.thumbnail} alt="Video thumbnail" />
              <div className="video-views">
                <span>{video.views}</span>
              </div>
            </div>
            <div className="video-info">
              <div className="video-username">
                @{video.username}
                {video.verified && (
                  <span className="verified-badge">✓</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExploreView; 
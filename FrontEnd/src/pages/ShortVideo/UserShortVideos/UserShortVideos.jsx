import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaPlay, FaHeart, FaComment, FaEye, FaLock } from 'react-icons/fa';
import { StoreContext } from '../../../Context/StoreContext';
import axios from 'axios';
import './UserShortVideos.css';

const UserShortVideos = ({ onClose, currentUserId, hideHeader = false }) => {
  const { userId } = useParams(); // Lấy userId từ URL nếu có
  const { url, token, user } = useContext(StoreContext);
  const navigate = useNavigate();
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userInfo, setUserInfo] = useState(null);
  
  // Xác định userId cần hiển thị video
  const targetUserId = userId || currentUserId || (user && user._id);
  
  // Lấy thông tin người dùng
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (!targetUserId) return;
        
        const response = await axios.get(`${url}/api/user/${targetUserId}`, {
          headers: { token }
        });
        
        if (response.data.success) {
          setUserInfo(response.data.user);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
    
    fetchUserInfo();
  }, [targetUserId, url, token]);
  
  // Lấy danh sách video ngắn của người dùng
  useEffect(() => {
    const fetchUserVideos = async () => {
      try {
        if (!targetUserId) return;
        
        setLoading(true);
        const response = await axios.get(`${url}/api/shortvideo/user/${targetUserId}`, {
          params: { page, limit: 12 },
          headers: { token }
        });
        
        if (response.data.success) {
          setVideos(response.data.shortVideos);
          setTotalPages(response.data.totalPages);
        }
      } catch (error) {
        console.error('Error fetching user videos:', error);
        setError('Không thể tải video. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserVideos();
  }, [targetUserId, page, url, token]);
  
  // Xử lý khi click vào video
  const handleVideoClick = (videoId) => {
    if (onClose) onClose(); // Đóng popup trước
    // Chuyển hướng đến trang ShortVideo với ID của video
    navigate(`/short-video?videoId=${videoId}`);
  };
  
  // Xử lý phân trang
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo(0, 0);
    }
  };
  
  // Format số lượng để hiển thị (1000 -> 1K, 1000000 -> 1M)
  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count;
  };
  
  return (
    <div className="user-short-videos-container">
      {!hideHeader && (
        <div className="user-videos-header">
          <button className="back-button" onClick={onClose}>
            <FaChevronLeft />
          </button>
          <h2>
            {userInfo ? (
              <>
                Video của {userInfo.name}
                {targetUserId === (user && user._id) ? ' (Bạn)' : ''}
              </>
            ) : (
              'Video ngắn'
            )}
          </h2>
        </div>
      )}
      
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải video...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => setPage(1)}>Thử lại</button>
        </div>
      ) : videos.length === 0 ? (
        <div className="empty-videos">
          <p>Không có video nào</p>
          {targetUserId === (user && user._id) && (
            <button onClick={() => navigate('/short-video/upload')}>
              Tạo video mới
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="videos-grid">
            {videos.map(video => (
              <div 
                key={video._id} 
                className="video-card"
                onClick={() => handleVideoClick(video._id)}
              >
                <div className="video-thumbnail">
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt={video.title} />
                  ) : (
                    <div className="default-thumbnail">
                      <FaPlay />
                    </div>
                  )}
                  {!video.isPublic && (
                    <div className="private-badge">
                      <FaLock />
                    </div>
                  )}
                  <div className="video-duration">
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="video-info-user">
                  <h3>{video.title || 'Video không có tiêu đề'}</h3>
                  <div className="video-stats">
                    <span><FaEye /> {formatCount(video.views)}</span>
                    <span><FaHeart /> {formatCount(video.likes.length)}</span>
                    <span><FaComment /> {formatCount(video.comments.length)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                Trước
              </button>
              <span>Trang {page} / {totalPages}</span>
              <button 
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserShortVideos; 
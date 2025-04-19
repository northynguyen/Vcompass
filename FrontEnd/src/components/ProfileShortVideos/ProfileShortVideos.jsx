/* eslint-disable react/prop-types */
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaHeart, FaComment, FaEye, FaLock } from 'react-icons/fa';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import './ProfileShortVideos.css';

const ProfileShortVideos = ({ currentUserId }) => {
  const { url, token, user } = useContext(StoreContext);
  const navigate = useNavigate();
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userInfo, setUserInfo] = useState(null);
  
  // Xác định userId cần hiển thị video
  const targetUserId = currentUserId || (user && user._id);
  
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
      } catch (err) {
        console.error('Error fetching user info:', err);
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
      } catch (err) {
        console.error('Error fetching user videos:', err);
        setError('Không thể tải video. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserVideos();
  }, [targetUserId, page, url, token]);
  
  // Xử lý khi click vào video
  const handleVideoClick = (videoId) => {
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
    <div className="profile-short-videos-container">
      {loading ? (
        <div className="profile-loading-container">
          <div className="profile-loading-spinner"></div>
          <p>Đang tải video...</p>
        </div>
      ) : error ? (
        <div className="profile-error-container">
          <p>{error}</p>
          <button onClick={() => setPage(1)}>Thử lại</button>
        </div>
      ) : videos.length === 0 ? (
        <div className="profile-empty-videos">
          <p>Không có video nào</p>
          {targetUserId === (user && user._id) && (
            <button onClick={() => navigate('/short-video/upload')}>
              Tạo video mới
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="profile-videos-grid">
            {videos.map(video => (
              <div 
                key={video._id} 
                className="profile-video-card"
                onClick={() => handleVideoClick(video._id)}
              >
                <div className="profile-video-thumbnail">
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt={video.title} />
                  ) : (
                    <div className="profile-default-thumbnail">
                      <FaPlay />
                    </div>
                  )}
                  {!video.isPublic && (
                    <div className="profile-private-badge">
                      <FaLock />
                    </div>
                  )}
                  <div className="profile-video-duration">
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="profile-video-info">
                  <h3>{video.title || 'Video không có tiêu đề'}</h3>
                  <div className="profile-video-stats">
                    <span><FaEye /> {formatCount(video.views)}</span>
                    <span><FaHeart /> {formatCount(video.likes.length)}</span>
                    <span><FaComment /> {formatCount(video.comments.length)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="profile-pagination">
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

export default ProfileShortVideos; 
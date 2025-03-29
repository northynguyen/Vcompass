import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHeart, FaCommentDots, FaShare, FaBookmark, FaHome, 
  FaCompass, FaUser, FaUpload, FaSearch, FaEllipsisH,
  FaUserFriends, FaBell, FaEnvelope, FaVideo,
  FaChevronUp, FaChevronDown, FaTimes
} from 'react-icons/fa';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import VideoPlayer from './VideoPlayer/VideoPlayer';
import Comments from './Comments/Comments';
import UploadVideo from './UploadVideo/UploadVideo';
import ExploreView from './ExploreView/ExploreView';
import UserShortVideos from './UserShortVideos/UserShortVideos';
import './ShortVideo.css';

const ShortVideo = () => {
  const { url, token, user } = useContext(StoreContext);
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [showUserVideos, setShowUserVideos] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeOption, setActiveOption] = useState('home');
  const [localLikedVideos, setLocalLikedVideos] = useState([]);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy videoId từ URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const videoIdFromUrl = queryParams.get('videoId');
  
  // Khởi tạo localLikedVideos từ dữ liệu videos khi videos thay đổi
  useEffect(() => {
    if (user && videos.length > 0) {
      // Lấy danh sách ID của các video đã được like bởi user hiện tại
      const likedVideoIds = videos
        .filter(video => video.likes && Array.isArray(video.likes) && video.likes.includes(user._id))
        .map(video => video._id);
      
      setLocalLikedVideos(likedVideoIds);
    }
  }, [videos, user]);
  
  // Hàm chung để xử lý hiển thị tab
  const showTab = (tab) => {
    // Đóng tất cả các tab
    setShowComments(false);
    setShowUpload(false);
    setShowExplore(false);
    setShowUserVideos(false);
    
    // Mở tab được chọn và cập nhật activeOption
    switch(tab) {
      case 'comments':
        setShowComments(true);
        // Không thay đổi activeOption vì comments không phải là tab chính
        break;
      case 'upload':
        setShowUpload(true);
        setActiveOption('upload');
        break;
      case 'explore':
        setShowExplore(true);
        setActiveOption('explore');
        break;
      case 'userVideos':
        setShowUserVideos(true);
        setActiveOption('profile');
        break;
      case 'home':
        setActiveOption('home');
        break;
      case 'following':
        setActiveOption('following');
        break;
      case 'friends':
        setActiveOption('friends');
        break;
      case 'activity':
        setActiveOption('activity');
        break;
      case 'messages':
        setActiveOption('messages');
        break;
      case 'live':
        setActiveOption('live');
        break;
      default:
        // Khi đóng tất cả tab, quay lại tab home
        setActiveOption('home');
        break;
    }
  };
  
  // Cập nhật các hàm xử lý để sử dụng hàm showTab
  const handleCommentsClick = () => {
    showTab('comments');
  };
  
  const handleUploadClick = () => {
    showTab('upload');
  };
  
  const handleExploreClick = () => {
    showTab('explore');
  };
  
  const handleUserVideosClick = (userId) => {
    setSelectedUserId(userId);
    showTab('userVideos');
  };
  
  const handleMyVideosClick = () => {
    if (user) {
      setSelectedUserId(user._id);
      showTab('userVideos');
    }
  };
  
  const handleHomeClick = () => {
    showTab('home');
  };
  
  const handleFollowingClick = () => {
    showTab('following');
  };
  
  const handleFriendsClick = () => {
    showTab('friends');
  };
  
  const handleActivityClick = () => {
    showTab('activity');
  };
  
  const handleMessagesClick = () => {
    showTab('messages');
  };
  
  const handleLiveClick = () => {
    showTab('live');
  };
  
  // Lấy danh sách video ngắn
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${url}/api/shortvideo/videos`, {
          headers: { token }
        });
        
        if (response.data.success) {
          setVideos(response.data.shortVideos);
          
          // Nếu có videoId trong URL, tìm index của video đó
          if (videoIdFromUrl) {
            const videoIndex = response.data.shortVideos.findIndex(
              video => video._id === videoIdFromUrl
            );
            
            if (videoIndex !== -1) {
              setCurrentVideoIndex(videoIndex);
            } else {
              // Nếu không tìm thấy video, lấy thông tin video đó riêng biệt
              fetchSingleVideo(videoIdFromUrl);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Lấy thông tin của một video cụ thể
    const fetchSingleVideo = async (videoId) => {
      try {
        const response = await axios.get(`${url}/api/shortvideo/videos/${videoId}`, {
          headers: { token }
        });
        
        if (response.data.success) {
          // Thêm video vào đầu danh sách
          setVideos(prevVideos => [response.data.shortVideo, ...prevVideos]);
          setCurrentVideoIndex(0);
        }
      } catch (error) {
        console.error('Error fetching single video:', error);
      }
    };
    
    fetchVideos();
    
    // Xóa videoId khỏi URL sau khi đã xử lý
    if (videoIdFromUrl) {
      navigate('/short-video', { replace: true });
    }
  }, [url, token, videoIdFromUrl, navigate]);
  
  // Xử lý khi chuyển video
  const handleNext = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };
  
  // Xử lý khi like video
  const handleLike = async () => {
    if (!user) {
      // Xử lý khi chưa đăng nhập
      return;
    }
    
    // Lấy ID của video hiện tại
    const videoId = videos[currentVideoIndex]?._id;
    if (!videoId) return;
    
    // Kiểm tra xem video đã được like chưa
    const isLiked = localLikedVideos.includes(videoId);
    
    // Cập nhật UI ngay lập tức
    if (isLiked) {
      // Nếu đã like, bỏ like
      setLocalLikedVideos(prev => prev.filter(id => id !== videoId));
      
      // Cập nhật số lượng like trong videos
      setVideos(prev => {
        const newVideos = [...prev];
        const video = newVideos[currentVideoIndex];
        if (video && Array.isArray(video.likes)) {
          video.likes = video.likes.filter(id => id !== user._id);
        }
        return newVideos;
      });
    } else {
      // Nếu chưa like, thêm like
      setLocalLikedVideos(prev => [...prev, videoId]);
      
      // Cập nhật số lượng like trong videos
      setVideos(prev => {
        const newVideos = [...prev];
        const video = newVideos[currentVideoIndex];
        if (video) {
          if (!Array.isArray(video.likes)) {
            video.likes = [];
          }
          video.likes.push(user._id);
        }
        return newVideos;
      });
    }
    
    // Gửi request đến server (không đợi phản hồi để cập nhật UI)
    try {
      await axios.post(
        `${url}/api/shortvideo/videos/${videoId}/like`,
        {},
        { headers: { token } }
      );
    } catch (error) {
      console.error('Error liking video:', error);
      // Nếu có lỗi, hoàn tác thay đổi UI
      if (isLiked) {
        setLocalLikedVideos(prev => [...prev, videoId]);
      } else {
        setLocalLikedVideos(prev => prev.filter(id => id !== videoId));
      }
    }
  };
  
  // Xử lý khi share video
  const handleShare = () => {
    // Tạo URL để share
    const shareUrl = `${window.location.origin}/short-video?videoId=${videos[currentVideoIndex]._id}`;
    
    // Kiểm tra xem trình duyệt có hỗ trợ Web Share API không
    if (navigator.share) {
      navigator.share({
        title: videos[currentVideoIndex].title || 'Check out this video',
        text: videos[currentVideoIndex].description || 'Watch this awesome video',
        url: shareUrl
      })
      .catch(error => console.error('Error sharing:', error));
    } else {
      // Fallback: Copy URL vào clipboard
      navigator.clipboard.writeText(shareUrl)
        .then(() => alert('Link copied to clipboard!'))
        .catch(error => console.error('Error copying to clipboard:', error));
    }
  };
  
  // Thêm hàm để cập nhật comments trong ShortVideo.jsx
  const updateComments = (videoId, newComment, isReply = false) => {
    if (!videos || !videos.length || currentVideoIndex < 0 || currentVideoIndex >= videos.length) {
      return;
    }
    
    if (videos[currentVideoIndex]._id === videoId) {
      const updatedVideos = [...videos];
      
      if (isReply) {
        // Nếu là reply, cập nhật comment hiện có
        updatedVideos[currentVideoIndex] = {
          ...updatedVideos[currentVideoIndex],
          comments: updatedVideos[currentVideoIndex].comments.map(comment => {
            if (comment._id === newComment._id) {
              return newComment;
            }
            return comment;
          })
        };
      } else {
        // Nếu là comment mới, thêm vào đầu danh sách
        updatedVideos[currentVideoIndex] = {
          ...updatedVideos[currentVideoIndex],
          comments: [newComment, ...(updatedVideos[currentVideoIndex].comments || [])]
        };
      }
      
      setVideos(updatedVideos);
    }
  };
  
  // Kiểm tra xem video hiện tại có được like bởi người dùng hiện tại không
  const isLikedByCurrentUser = () => {
    // Kiểm tra nếu user chưa đăng nhập hoặc videos chưa được tải
    if (!user || !videos || !videos[currentVideoIndex]) {
      return false;
    }
    
    // Sử dụng localLikedVideos để kiểm tra
    return localLikedVideos.includes(videos[currentVideoIndex]._id);
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải video...</p>
      </div>
    );
  }
  
  if (videos.length === 0) {
    return (
      <div className="empty-container">
        <p>Không có video nào.</p>
        <button onClick={() => showTab('upload')}>Tạo video mới</button>
      </div>
    );
  }
  
  return (
    <div className={`short-video-container ${showComments ? 'with-comments' : ''}`}>
      
      <div className="tiktok-sidebar">       
        <div className="sidebar-menu">
          <div 
            className={`menu-item ${activeOption === 'home' ? 'active' : ''}`}
            onClick={handleHomeClick}
          >
            <FaHome />
            <span>For You</span>
          </div>
          
          <div 
            className={`menu-item ${activeOption === 'explore' ? 'active' : ''}`}
            onClick={handleExploreClick}
          >
            <FaCompass />
            <span>Explore</span>
          </div>
          
          <div 
            className={`menu-item ${activeOption === 'following' ? 'active' : ''}`}
            onClick={handleFollowingClick}
          >
            <FaUserFriends />
            <span>Following</span>
          </div>
          
          <div 
            className={`menu-item ${activeOption === 'friends' ? 'active' : ''}`}
            onClick={handleFriendsClick}
          >
            <FaUser />
            <span>Friends</span>
          </div>
          
          <div 
            className={`menu-item ${activeOption === 'upload' ? 'active' : ''}`}
            onClick={handleUploadClick}
          >
            <FaUpload />
            <span>Upload</span>
          </div>
          
          <div 
            className={`menu-item ${activeOption === 'activity' ? 'active' : ''}`}
            onClick={handleActivityClick}
          >
            <FaBell />
            <span>Activity</span>
          </div>
          
          <div 
            className={`menu-item ${activeOption === 'messages' ? 'active' : ''}`}
            onClick={handleMessagesClick}
          >
            <FaEnvelope />
            <span>Messages</span>
          </div>
          
          <div 
            className={`menu-item ${activeOption === 'live' ? 'active' : ''}`}
            onClick={handleLiveClick}
          >
            <FaVideo />
            <span>LIVE</span>
          </div>
          
          <div 
            className={`menu-item ${activeOption === 'profile' ? 'active' : ''}`}
            onClick={handleMyVideosClick}
          >
            <FaUser />
            <span>Profile</span>
          </div>
        </div>
        
      </div>
      
      {!showUpload && !showExplore && !showUserVideos && (
        <div className="tiktok-content">
          
          {videos.length > 0 && (
            <div className="video-feed">
              <VideoPlayer 
                videoUrl={videos[currentVideoIndex].videoUrl}
                videoId={videos[currentVideoIndex]._id}
                onNext={handleNext}
                onPrev={handlePrev}
                title={videos[currentVideoIndex].title}
                subtitle={videos[currentVideoIndex].description}
              />
              
              <div className="navigation-buttons">
                <button 
                  className="nav-arrow up-arrow" 
                  onClick={handlePrev}
                  disabled={currentVideoIndex === 0}
                >
                  <FaChevronUp />
                </button>
                <button 
                  className="nav-arrow down-arrow" 
                  onClick={handleNext}
                  disabled={currentVideoIndex === videos.length - 1}
                >
                  <FaChevronDown />
                </button>
              </div>
              
              <div className="video-actions-sidebar">
                <div className="user-avatar-container">
                  <img 
                    src={videos[currentVideoIndex].userId.avatar || "https://via.placeholder.com/40"} 
                    alt="User avatar" 
                    className="user-avatar"
                    onClick={() => navigate(`/otherUserProfile/${videos[currentVideoIndex].userId._id}`)}
                  />
                  <div className="follow-button">+</div>
                </div>
                
                <div 
                  className={`action-button ${isLikedByCurrentUser() ? 'liked' : ''}`}
                  onClick={handleLike}
                >
                  <FaHeart className="action-icon" />
                  <span>
                    {videos[currentVideoIndex]?.likes?.length || 0}
                  </span>
                </div>
                
                <div 
                  className="action-button"
                  onClick={handleCommentsClick}
                >
                  <FaCommentDots className="action-icon" />
                  <span>
                    {videos[currentVideoIndex]?.comments?.length || 0}
                  </span>
                </div>
                
                <div 
                  className="action-button"
                  onClick={handleShare}
                >
                  <FaShare className="action-icon" />
                  <span>
                    {videos[currentVideoIndex]?.shares || 0}
                  </span>
                </div>
                
                <div className="action-button">
                  <FaBookmark className="action-icon" />
                </div>
                
                <div className="action-button">
                  <FaEllipsisH className="action-icon" />
                </div>
                
                <div className="music-disc">
                  <img 
                    src={videos[currentVideoIndex].userId.avatar || "https://via.placeholder.com/40"} 
                    alt="Music" 
                    className="music-image"
                  />
                </div>
              </div>
              
              <div className="video-info">
                <div className="user-info">
                  <span className="username">@{videos[currentVideoIndex].userId.name}</span>
                  <button className="follow-button-inline">Follow</button>
                </div>
                
                <div className="video-description">
                  {videos[currentVideoIndex].description}
                </div>
                
                <div className="video-tags">
                  {videos[currentVideoIndex].tags && videos[currentVideoIndex].tags.map((tag, index) => (
                    <span key={index} className="video-tag">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {showComments && videos.length > 0 && (
        <div className="comments-container">
          <div className="comments-header">
            <h3>Comments ({videos[currentVideoIndex]?.comments?.length || 0})</h3>
            <button className="close-comments" onClick={() => showTab(null)}>
              <FaTimes />
            </button>
          </div>
          <Comments 
            videoId={videos[currentVideoIndex]._id}
            commentsData={videos[currentVideoIndex]?.comments || []}
            onClose={() => showTab(null)}
            onCommentAdded={updateComments}
          />
        </div>
      )}
      
      {showUpload && (
        <div className="upload-overlay">
          <UploadVideo onClose={() => showTab(null)} />
        </div>
      )}
      
      {showExplore && (
        <div className="explore-overlay">
          <ExploreView onClose={() => showTab(null)} />
        </div>
      )}
      
      {showUserVideos && (
        <div className="user-videos-overlay">
          <UserShortVideos 
            onClose={() => showTab(null)}
            currentUserId={selectedUserId}
          />
        </div>
      )}
    </div>
  );
};

export default ShortVideo; 
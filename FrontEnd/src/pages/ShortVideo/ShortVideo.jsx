import { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHeart, FaCommentDots, FaShare, FaBookmark, FaHome, 
  FaCompass, FaUser, FaUpload, FaEllipsisH,
  FaUserFriends, FaBell, FaEnvelope, FaVideo,
  FaChevronUp, FaChevronDown, FaTimes, FaInfoCircle
} from 'react-icons/fa';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import VideoPlayer from './VideoPlayer/VideoPlayer';
import Comments from './Comments/Comments';
import UploadVideo from './UploadVideo/UploadVideo';
import ExploreView from './ExploreView/ExploreView';
import UserShortVideos from './UserShortVideos/UserShortVideos';
import PostCard from '../../components/Poster/PostCard';
import './ShortVideo.css';
import { toast } from 'react-toastify';

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
  const [showScrollHelp, setShowScrollHelp] = useState(true);
  const [followingVideos, setFollowingVideos] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [showSchedulePopup, setShowSchedulePopup] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  
  const videoFeedRef = useRef(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy videoId từ URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const videoIdFromUrl = queryParams.get('videoId');
  
  // Lấy danh sách người dùng đang theo dõi
  useEffect(() => {
    const fetchFollowingUsers = async () => {
      if (!user) return;
      
      setFollowingUsers(user.following);
    };
    
    fetchFollowingUsers();
  }, [user, url, token]);
  
  // Lấy video của những người đang theo dõi
  useEffect(() => {
    const fetchFollowingVideos = async () => {
      if (!user || followingUsers.length === 0) return;
      
      try {
        const response = await axios.get(`${url}/api/shortvideo/videos`, {
          headers: { token },
          params: {
            following: true
          }
        });
        
        if (response.data.success) {
          setFollowingVideos(response.data.videos);
        }
      } catch (error) {
        console.error('Error fetching following videos:', error);
      }
    };
    
    if (activeOption === 'following') {
      fetchFollowingVideos();
    }
  }, [user, followingUsers, activeOption, url, token]);
  
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
  
  // Xử lý sự kiện cuộn chuột để chuyển video
  useEffect(() => {
    const handleScroll = (e) => {
      if (!videoFeedRef.current) return;
      
      // Ẩn hướng dẫn scroll sau 3 giây
      if (showScrollHelp) {
        setTimeout(() => {
          setShowScrollHelp(false);
        }, 3000);
      }
      
      // Tính toán hướng cuộn
      const scrollDirection = e.deltaY > 0 ? 'down' : 'up';
      
      // Chỉ xử lý khi cuộn đủ lớn
      if (Math.abs(e.deltaY) < 50) return;
      
      // Ngăn cuộn mặc định của trình duyệt
      e.preventDefault();
      
      // Di chuyển đến video tiếp theo hoặc trước đó
      if (scrollDirection === 'down' && currentVideoIndex < videos.length - 1) {
        setCurrentVideoIndex(currentVideoIndex + 1);
      } else if (scrollDirection === 'up' && currentVideoIndex > 0) {
        setCurrentVideoIndex(currentVideoIndex - 1);
      }
    };
    
    const feedElement = videoFeedRef.current;
    if (feedElement) {
      feedElement.addEventListener('wheel', handleScroll, { passive: false });
    }
    
    return () => {
      if (feedElement) {
        feedElement.removeEventListener('wheel', handleScroll);
      }
    };
  }, [currentVideoIndex, videos.length, showScrollHelp]);
  
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
    setActiveOption('explore');
  };
  

  
  const handleMyVideosClick = () => {
    if (user) {
      setSelectedUserId(user._id);
      showTab('userVideos');
    }
  };
  
  const handleForYouClick = () => {
    showTab('home');
  };

  const handleHomeClick = () => { 
    navigate('/') ;
  }
  
  const handleFollowingClick = () => {
    showTab('following');
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
          setVideos(response.data.videos);
          
          // Nếu có videoId trong URL, tìm index của video đó
          if (videoIdFromUrl) {
            const videoIndex = response.data.videos.findIndex(
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

    const fetchFollowingVideos = async () => {
      if (!user || followingUsers.length === 0) return;
      setLoading(true);
      try {
        const response = await axios.get(`${url}/api/shortvideo/all/following`, {
          headers: { token }
        });
        if (response.data.success) {
          setFollowingVideos(response.data.videos);
        }
      } catch (error) {
        console.error('Error fetching following videos:', error);
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
    if (activeOption === 'following') {
      fetchFollowingVideos();
    } else {
      fetchVideos();
    }
    
    // Xóa videoId khỏi URL sau khi đã xử lý
    if (videoIdFromUrl) {
      navigate('/short-video', { replace: true });
    }
  }, [url, token, videoIdFromUrl, navigate, activeOption, followingUsers]);
  
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
  
  // Hàm xử lý follow/unfollow
  const handleFollow = async (id) => {
    try {
      const response = await fetch(
        `${url}/api/user/user/follow-or-unfollow?otherUserId=${id}&action=add`,
        {
          method: "PUT",
          headers: { token: token },
        }
      );
      const result = await response.json();
      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
        setFollowingUsers(prev => [...prev, id]);
      }

    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Có lỗi xảy ra khi theo dõi');
    }
  };
  
  const handleUnfollow = async (userId) => {
    try {
      const response = await axios.put(
        `${url}/api/user/user/follow-or-unfollow`,
        {
          otherUserId: userId,
          action: 'unfollow'
        },
        { headers: { token } }
      );
      
      if (response.data.success) {
        // Cập nhật danh sách following
        setFollowingUsers(prev => prev.filter(id => id !== userId));
        toast.success('Đã bỏ theo dõi người dùng');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error('Có lỗi xảy ra khi bỏ theo dõi');
    }
  };
  
  // Kiểm tra xem đã follow người dùng chưa
  const isFollowing = (userId) => {
    return followingUsers.includes(userId) || userId === user._id;
  // Kiểm tra nếu người dùng là chính mình
  };
  
  const handleScheduleClick = async (scheduleId) => {
    try {
      const response = await axios.get(`${url}/api/schedule/${scheduleId._id}`, {
        headers: { token }
      });

      console.log(response.data.schedule);
      
      if (response.data.success) {
        setCurrentSchedule(response.data.schedule);
        setShowSchedulePopup(true);
      } else {
        toast.error('Không thể tải thông tin lịch trình');
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Có lỗi xảy ra khi tải lịch trình');
    }
  };
  const handleViewSchedule = (id) => {
    navigate(`/schedule-view/${id}`);
  };
  
  if (loading) {
    return (
      <div className="loading-container">
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
      
      {/* Sidebar Menu - sẽ ẩn trên mobile */}
      <div className="tiktok-sidebar">       
        <div className="sidebar-menu">
          <div           
            onClick={handleHomeClick}
            className={`menu-item `}
          >
            <FaHome />
            <span>Trang chủ </span>
          </div>

          <div 
            className={`menu-item ${activeOption === 'home' ? 'active' : ''}`}
            onClick={handleForYouClick}
          >
            <FaUser />
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
            className={`menu-item ${activeOption === 'upload' ? 'active' : ''}`}
            onClick={handleUploadClick}
          >
            <FaUpload />
            <span>Upload</span>
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
      
      {/* Main Content Area */}
      <div className="tiktok-content">
        {activeOption === 'explore' ? (
          <div className="explore-tab">
            <ExploreView onClose={() => setActiveOption('home')} />
          </div>
        ) : activeOption === 'following' && followingVideos.length === 0 ? (
          <div className="empty-following-container">
            <p>Bạn chưa theo dõi ai. Hãy theo dõi thêm người dùng để xem video của họ!</p>
            <button onClick={handleForYouClick}>Xem video để theo dõi</button>
          </div>
        ) : !showUpload && !showUserVideos && (
          <div className="video-feed" ref={videoFeedRef}>
            {/* Thông báo cuộn chuột */}
            {showScrollHelp && (
              <div className="scroll-help">
                <FaInfoCircle />
                <span>Cuộn lên/xuống để xem video tiếp theo</span>
              </div>
            )}
            
            {/* Video Player Component */}
            <VideoPlayer 
              videoUrl={activeOption === 'following' ? 
                (followingVideos[currentVideoIndex]?.videoUrl || '') : 
                (videos[currentVideoIndex]?.videoUrl || '')}
              videoId={activeOption === 'following' ? 
                (followingVideos[currentVideoIndex]?._id || '') : 
                (videos[currentVideoIndex]?._id || '')}
              onNext={handleNext}
              onPrev={handlePrev}
              title={activeOption === 'following' ? 
                (followingVideos[currentVideoIndex]?.title || '') : 
                (videos[currentVideoIndex]?.title || '')}
              subtitle={activeOption === 'following' ? 
                (followingVideos[currentVideoIndex]?.description || '') : 
                (videos[currentVideoIndex]?.description || '')}
            />
            
            {/* Navigation Arrows - chỉ hiển thị trên desktop */}
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
                disabled={currentVideoIndex === (activeOption === 'following' ? followingVideos.length - 1 : videos.length - 1)}
              >
                <FaChevronDown />
              </button>
            </div>
            
            {/* Video Actions - luôn nằm dọc bên phải video */}
            <div className="video-actions-sidebar">
              <div className="user-avatar-container">
                <img 
                  src={activeOption === 'following' ? 
                    (followingVideos[currentVideoIndex]?.userId?.avatar || "https://via.placeholder.com/40") : 
                    (videos[currentVideoIndex]?.userId?.avatar || "https://via.placeholder.com/40")} 
                  alt="User avatar" 
                  className="user-avatar"
                  onClick={() => navigate(`/otherUserProfile/${activeOption === 'following' ? 
                    followingVideos[currentVideoIndex]?.userId?._id : 
                    videos[currentVideoIndex]?.userId?._id}`)}
                />
                {!isFollowing(activeOption === 'following' ? 
                  followingVideos[currentVideoIndex]?.userId?._id : 
                  videos[currentVideoIndex]?.userId?._id) && (
                  <div 
                    className="follow-button"
                    onClick={() => handleFollow(activeOption === 'following' ? 
                      followingVideos[currentVideoIndex]?.userId?._id : 
                      videos[currentVideoIndex]?.userId?._id)}
                  >
                    +
                  </div>
                )}
              </div>
              
              <div 
                className={`action-button ${isLikedByCurrentUser() ? 'liked' : ''}`}
                onClick={handleLike}
              >
                <FaHeart className="action-icon" />
                <span>
                  {activeOption === 'following' ? 
                    (followingVideos[currentVideoIndex]?.likes?.length || 0) : 
                    (videos[currentVideoIndex]?.likes?.length || 0)}
                </span>
              </div>
              
              <div 
                className="action-button"
                onClick={handleCommentsClick}
              >
                <FaCommentDots className="action-icon" />
                <span>
                  {activeOption === 'following' ? 
                    (followingVideos[currentVideoIndex]?.comments?.length || 0) : 
                    (videos[currentVideoIndex]?.comments?.length || 0)}
                </span>
              </div>
              
              <div 
                className="action-button"
                onClick={handleShare}
              >
                <FaShare className="action-icon" />
                <span>
                  {activeOption === 'following' ? 
                    (followingVideos[currentVideoIndex]?.shares || 0) : 
                    (videos[currentVideoIndex]?.shares || 0)}
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
                  src={activeOption === 'following' ? 
                    (followingVideos[currentVideoIndex]?.userId?.avatar || "https://via.placeholder.com/40") : 
                    (videos[currentVideoIndex]?.userId?.avatar || "https://via.placeholder.com/40")} 
                  alt="Music" 
                  className="music-image"
                />
              </div>
            </div>
            
            {/* Video Info - bottom left */}
            <div className="video-info">
              <div className="user-info">
                <span className="username">
                  @{activeOption === 'following' ? 
                    (followingVideos[currentVideoIndex]?.userId?.name || '') : 
                    (videos[currentVideoIndex]?.userId?.name || '')}
                </span>
                {!isFollowing(activeOption === 'following' ? 
                  followingVideos[currentVideoIndex]?.userId?._id : 
                  videos[currentVideoIndex]?.userId?._id) && (
                  <button 
                    className="follow-button-inline"
                    onClick={() => handleFollow(activeOption === 'following' ? 
                      followingVideos[currentVideoIndex]?.userId?._id : 
                      videos[currentVideoIndex]?.userId?._id)}
                  >
                    Follow
                  </button>
                )}
              </div>
              
                <div className="video-description">
                {activeOption === 'following' ? 
                  (followingVideos[currentVideoIndex]?.description || '') : 
                  (videos[currentVideoIndex]?.description || '')}
              </div>
              
              <div className="video-tags">
                {activeOption === 'following' ? 
                  (followingVideos[currentVideoIndex]?.tags || []).map((tag, index) => (
                    <span key={index} className="video-tag">#{tag}</span>
                  )) : 
                  (videos[currentVideoIndex]?.tags || []).map((tag, index) => (
                    <span key={index} className="video-tag">#{tag}</span>
                  ))}
              </div>

              <div className="video-schedule">
                {activeOption === 'following' ? 
                  (followingVideos[currentVideoIndex]?.scheduleId?._id && (
                    <button 
                      className="schedule-button"
                      onClick={() => handleScheduleClick(followingVideos[currentVideoIndex]?.scheduleId)}
                    >
                      <i className="fas fa-calendar-alt"></i>
                      <span>Lịch trình</span>
                    </button>
                  )) : 
                  (videos[currentVideoIndex]?.scheduleId?._id && (
                    <button 
                      className="schedule-button"
                      onClick={() => handleScheduleClick(videos[currentVideoIndex]?.scheduleId)}
                    >
                      <i className="fas fa-calendar-alt"></i>
                      <span>Lịch trình</span>
                    </button>
                  ))
                }
              </div>
            </div>
          </div>
        )}
        
        {/* Comments overlay - full width on mobile, side panel on desktop/tablet */}
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
        
        {/* Upload overlay */}
        {showUpload && (
          <div className="upload-overlay">
            <UploadVideo onClose={() => showTab(null)} />
          </div>
        )}
        
        {/* Explore overlay */}
        {showExplore && (
          <div className="explore-overlay">
            <ExploreView onClose={() => showTab(null)} />
          </div>
        )}
        
        {/* User videos overlay */}
        {showUserVideos && (
          <div className="user-videos-overlay">
            <UserShortVideos 
              onClose={() => showTab(null)}
              currentUserId={selectedUserId}
              setShowUpload={() => showTab('upload')}
            />
          </div>
        )}
        
        {/* Schedule Popup */}
        {showSchedulePopup && currentSchedule && (
          <div className="schedule-popup">
            <div className="schedule-popup-content">
              <button 
                className="close-popup"
                onClick={() => {
                  setShowSchedulePopup(false);
                  setCurrentSchedule(null);
                }}
              >
                <FaTimes />
              </button>
              <PostCard schedule={currentSchedule} handleScheduleClick={handleViewSchedule} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShortVideo; 
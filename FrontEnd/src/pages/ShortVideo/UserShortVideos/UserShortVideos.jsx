import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaPlay, FaHeart, FaComment, FaEye, FaLock, FaEllipsisV, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { StoreContext } from '../../../Context/StoreContext';
import axios from 'axios';
import PropTypes from 'prop-types';
import './UserShortVideos.css';

const UserShortVideos = ({ onClose, currentUserId, hideHeader = false, setShowUpload }) => {
  const { userId } = useParams(); // Lấy userId từ URL nếu có
  const { url, token, user } = useContext(StoreContext);
  const navigate = useNavigate();
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userInfo, setUserInfo] = useState(null);
  
  // State cho dropdown menu
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // State cho popup xác nhận xóa
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // State cho modal chỉnh sửa
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    tags: '',
    category: '',
    isPublic: true,
    scheduleId: ''
  });
  const [updating, setUpdating] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  // Xác định userId cần hiển thị video
  const targetUserId = userId || currentUserId || (user && user._id);
  const isOwner = targetUserId === (user && user._id);
  
  // Đóng dropdown khi click bên ngoài - sử dụng document listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Kiểm tra xem click có nằm trong dropdown nào không
      const isDropdownClick = event.target.closest('.video-actions-dropdown');
      if (!isDropdownClick) {
        setOpenDropdown(null);
      }
    };
    
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdown]);
  
  // Lấy thông tin người dùng
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (!targetUserId) return;
        
        const response = await axios.get(`${url}/api/user/user/${targetUserId}`, {
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
  const handleVideoClick = (videoId, event) => {
    // Ngăn chặn click nếu click vào dropdown menu
    if (event.target.closest('.video-actions-dropdown') || event.target.closest('.dropdown-menu')) {
      return;
    }
    
    if (onClose) onClose();
    navigate(`/short-video?videoId=${videoId}`);
  };
  
  // Xử lý toggle dropdown
  const handleDropdownToggle = (videoId, event) => {
    event.stopPropagation();
    event.preventDefault();
    setOpenDropdown(openDropdown === videoId ? null : videoId);
  };
  
  // Xử lý chỉnh sửa video
  const handleEditVideo = (video, event) => {
    event.stopPropagation();
    event.preventDefault();
    setEditingVideo(video);
    setEditForm({
      title: video.title || '',
      description: video.description || '',
      tags: Array.isArray(video.tags) ? video.tags.join(', ') : (video.tags || ''),
      category: video.category || 'general',
      isPublic: video.isPublic,
      scheduleId: video.scheduleId || ''
    });
    setShowEditModal(true);
    setOpenDropdown(null);
    // Fetch schedules khi mở modal
    fetchUserSchedules();
  };
  
  // Fetch user schedules
  const fetchUserSchedules = async () => {
    try {
      const response = await axios.get(`${url}/api/schedule/user/getSchedules?limit=100`, {
        headers: { token }
      });
      if (response.data.success) {
        setSchedules(response.data.schedules || []);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  // Handle schedule selection
  const handleScheduleSelect = (schedule) => {
    setEditForm({...editForm, scheduleId: schedule._id});
    setShowScheduleModal(false);
  };
  
  // Xử lý xóa video
  const handleDeleteVideo = (video, event) => {
    event.stopPropagation();
    event.preventDefault();
    setVideoToDelete(video);
    setShowDeleteConfirm(true);
    setOpenDropdown(null);
  };
  
  // Xác nhận xóa video
  const confirmDeleteVideo = async () => {
    if (!videoToDelete) return;
    
    try {
      setDeleting(true);
      const response = await axios.delete(`${url}/api/shortvideo/videos/${videoToDelete._id}`, {
        headers: { token }
      });
      
      if (response.data.success) {
        // Cập nhật danh sách video
        setVideos(videos.filter(v => v._id !== videoToDelete._id));
        setShowDeleteConfirm(false);
        setVideoToDelete(null);
      } else {
        alert('Có lỗi xảy ra khi xóa video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Có lỗi xảy ra khi xóa video');
    } finally {
      setDeleting(false);
    }
  };
  
  // Lưu thay đổi video
  const saveVideoChanges = async () => {
    if (!editingVideo) return;
    
    // Validate input
    if (!editForm.title.trim()) {
      alert('Tiêu đề không được để trống');
      return;
    }
    
    try {
      setUpdating(true);
      
      const updateData = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        tags: editForm.tags.trim(),
        category: editForm.category,
        isPublic: editForm.isPublic,
        scheduleId: editForm.scheduleId || null
      };
      
      console.log('Updating video with data:', updateData);
      
      const response = await axios.put(`${url}/api/shortvideo/videos/${editingVideo._id}`, updateData, {
        headers: { token }
      });
      
      if (response.data.success) {
        console.log('Video updated successfully:', response.data);
        // Cập nhật video trong danh sách
        setVideos(videos.map(v => 
          v._id === editingVideo._id 
            ? { 
                ...v, 
                title: editForm.title.trim(),
                description: editForm.description.trim(),
                tags: editForm.tags.trim().split(',').map(tag => tag.trim()).filter(tag => tag),
                category: editForm.category,
                isPublic: editForm.isPublic,
                scheduleId: editForm.scheduleId || null
              }
            : v
        ));
        setShowEditModal(false);
        setEditingVideo(null);
      } else {
        alert(response.data.message || 'Có lỗi xảy ra khi cập nhật video');
      }
    } catch (error) {
      console.error('Error updating video:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Có lỗi xảy ra khi cập nhật video');
      }
    } finally {
      setUpdating(false);
    }
  };
  
  // Hủy chỉnh sửa
  const cancelEdit = () => {
    setShowEditModal(false);
    setEditingVideo(null);
    setShowScheduleModal(false);
    setEditForm({
      title: '',
      description: '',
      tags: '',
      category: '',
      isPublic: true,
      scheduleId: ''
    });
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
  
  // Categories list matching UploadVideo
  const categories = [
    { id: 'general', name: 'Chung' },
    { id: 'comedy', name: 'Hài hước' },
    { id: 'music', name: 'Âm nhạc' },
    { id: 'dance', name: 'Nhảy múa' },
    { id: 'sports', name: 'Thể thao' },
    { id: 'food', name: 'Ẩm thực' },
    { id: 'travel', name: 'Du lịch' },
    { id: 'education', name: 'Giáo dục' },
    { id: 'pets', name: 'Thú cưng' },
    { id: 'beauty', name: 'Làm đẹp' }
  ];
  
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
          {isOwner && (
            <button onClick={() => setShowUpload(true)}>
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
                onClick={(event) => handleVideoClick(video._id, event)}
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
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString()}
                  </div>
                  
                  {/* Actions dropdown - chỉ hiển thị cho chủ video */}
                  {isOwner && (
                    <div className="video-actions-dropdown">
                      <button 
                        className="dropdown-trigger"
                        onClick={(event) => handleDropdownToggle(video._id, event)}
                      >
                        <FaEllipsisV />
                      </button>
                      
                      {openDropdown === video._id && (
                        <div className="dropdown-menu">
                          <button 
                            className="dropdown-item edit-item"
                            onClick={(event) => handleEditVideo(video, event)}
                          >
                            <FaEdit /> Chỉnh sửa
                          </button>
                          <button 
                            className="dropdown-item delete-item"
                            onClick={(event) => handleDeleteVideo(video, event)}
                          >
                            <FaTrash /> Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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

      {/* Popup xác nhận xóa */}
      {showDeleteConfirm && (
        <div className="modal-delete-overlay">
          <div className="confirm-delete-modal">
            <h3>Xác nhận xóa video</h3>
            <p>Bạn có chắc chắn muốn xóa video &quot;<strong>{videoToDelete?.title || 'Video không có tiêu đề'}</strong>&quot;?</p>
            <p className="warning-text">Hành động này không thể hoàn tác.</p>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setVideoToDelete(null);
                }}
                disabled={deleting}
              >
                Hủy
              </button>
              <button 
                className="delete-btn"
                onClick={confirmDeleteVideo}
                disabled={deleting}
              >
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa video */}
      {showEditModal && (
        <div className="modal-delete-overlay">
          <div className="edit-video-modal">
            <div className="modal-header">
              <h3>Chỉnh sửa video</h3>
              <button className="close-btn" onClick={cancelEdit}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="edit-title">Tiêu đề video</label>
                <input
                  id="edit-title"
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  placeholder="Nhập tiêu đề video..."
                  maxLength={100}
                />
                <small>{editForm.title.length}/100 ký tự</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-description">Mô tả video</label>
                <textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  placeholder="Nhập mô tả video..."
                  rows={4}
                  maxLength={500}
                />
                <small>{editForm.description.length}/500 ký tự</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-tags">Tags</label>
                <input
                  id="edit-tags"
                  type="text"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({...editForm, tags: e.target.value})}
                  placeholder="Nhập tags (cách nhau bởi dấu phẩy)"
                />
                <small>{editForm.tags.length}/500 ký tự</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-category">Category</label>
                <select
                  id="edit-category"
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-visibility">Quyền riêng tư</label>
                <div className="privacy-options">
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      checked={editForm.isPublic} 
                      onChange={() => setEditForm({...editForm, isPublic: true})}
                    />
                    Công khai
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      checked={!editForm.isPublic} 
                      onChange={() => setEditForm({...editForm, isPublic: false})}
                    />
                    Riêng tư
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-schedule">Lịch trình</label>
                <div className="schedule-selection">
                  <button 
                    type="button" 
                    className="select-schedule-btn"
                    onClick={() => setShowScheduleModal(true)}
                  >
                    {editForm.scheduleId ? 
                      schedules.find(s => s._id === editForm.scheduleId)?.scheduleName || 'Chọn lịch trình'
                      : 'Chọn lịch trình'
                    }
                  </button>
                  {editForm.scheduleId && (
                    <button 
                      type="button" 
                      className="clear-schedule-btn"
                      onClick={() => setEditForm({...editForm, scheduleId: ''})}
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={cancelEdit}
                disabled={updating}
              >
                Hủy
              </button>
              <button 
                className="save-btn"
                onClick={saveVideoChanges}
                disabled={updating || !editForm.title.trim()}
              >
                {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Selection Modal */}
      {showScheduleModal && (
        <div className="schedule-modal">
          <div className="schedule-modal-content">
            <h3>Chọn lịch trình</h3>
            <div className="schedule-list">
              {schedules.length > 0 ? (
                schedules.map(schedule => (
                  <div 
                    key={schedule._id} 
                    className="schedule-item"
                    onClick={() => handleScheduleSelect(schedule)}
                  >
                    <h4>{schedule.scheduleName}</h4>
                    <p>{schedule.description}</p>
                    <span>{new Date(schedule.dateStart).toLocaleDateString()} - {new Date(schedule.dateEnd).toLocaleDateString()}</span>
                  </div>
                ))
              ) : (
                <p>Không có lịch trình nào</p>
              )}
            </div>
            <button 
              className="close-modal-btn"
              onClick={() => setShowScheduleModal(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

UserShortVideos.propTypes = {
  onClose: PropTypes.func.isRequired,
  currentUserId: PropTypes.string,
  hideHeader: PropTypes.bool,
  setShowUpload: PropTypes.func.isRequired
};

export default UserShortVideos; 
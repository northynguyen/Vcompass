import React, { useState, useContext, useRef, useEffect } from 'react';
import { FaCloudUploadAlt, FaTimes, FaChevronLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { StoreContext } from '../../../Context/StoreContext';
import axios from 'axios';
import './UploadVideo.css';

const UploadVideo = ({ onClose }) => {
  const { url, token } = useContext(StoreContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('general');
  const [isPublic, setIsPublic] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  // Thêm refs để tham chiếu đến input file
  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  
  // Thay đổi state uploadStatus để theo dõi chi tiết hơn
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle', 'uploading', 'processing', 'success', 'error'
  const [uploadPhase, setUploadPhase] = useState(0); // 0-100: upload to server, 101-200: processing on server
  const processingTimerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Hàm để mô phỏng tiến trình xử lý dựa trên kích thước file
  const simulateProcessingProgress = (fileSize) => {
    // Ước tính thời gian xử lý dựa trên kích thước file
    const estimatedTime = Math.min(60000, fileSize / 10000); // Tối đa 60 giây
    const interval = Math.floor(estimatedTime / 100);
    
    let progress = 0;
    
    if (processingTimerRef.current) {
      clearInterval(processingTimerRef.current);
    }
    
    processingTimerRef.current = setInterval(() => {
      progress += 1;
      
      // Tính toán tiến trình từ 101-200 (phần xử lý server)
      const processingProgress = 100 + progress;
      
      if (progress >= 99) {
        clearInterval(processingTimerRef.current);
      } else {
        setUploadPhase(processingProgress);
      }
    }, interval);
  };
  
  // Dọn dẹp timer khi component unmount
  useEffect(() => {
    return () => {
      if (processingTimerRef.current) {
        clearInterval(processingTimerRef.current);
      }
    };
  }, []);
  
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
  
  // Hàm lấy frame ngẫu nhiên từ video
  const extractRandomFrame = async (videoUrl) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.src = videoUrl;
      video.crossOrigin = 'anonymous';

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Chọn thời điểm ngẫu nhiên trong video
        const randomTime = Math.random() * video.duration;
        video.currentTime = randomTime;

        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            const file = new File([blob], 'thumbnail.png', { type: 'image/png' });
            resolve(file);
          }, 'image/png');
        };
      };
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        const fileUrl = URL.createObjectURL(file);
        setPreviewUrl(fileUrl);

        // Nếu chưa có thumbnail, tự động tạo từ video
        if (!thumbnailFile) {
          try {
            const thumbnail = await extractRandomFrame(fileUrl);
            setThumbnailFile(thumbnail);
            const thumbnailUrl = URL.createObjectURL(thumbnail);
            setThumbnailPreviewUrl(thumbnailUrl);
          } catch (error) {
            console.error('Error extracting thumbnail:', error);
            toast.error('Không thể tạo thumbnail tự động');
          }
        }
      } else {
        toast.error('Vui lòng chọn file video hợp lệ');
      }
    }
  };
  
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setThumbnailFile(file);
        const fileUrl = URL.createObjectURL(file);
        setThumbnailPreviewUrl(fileUrl);
      } else {
        toast.error('Vui lòng chọn file hình ảnh hợp lệ');
      }
    }
  };
  
  // Hàm kích hoạt click vào input file
  const triggerVideoInput = () => {
    videoInputRef.current.click();
  };
  
  // Hàm kích hoạt click vào input thumbnail
  const triggerThumbnailInput = () => {
    thumbnailInputRef.current.click();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    } else {
      toast.error('Vui lòng chọn file video hợp lệ');
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Vui lòng chọn video để tải lên');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadPhase(0);
    setUploadStatus('uploading');
    
    try {
      // Kiểm tra kích thước file
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast.error('File quá lớn, giới hạn là 100MB');
        setIsUploading(false);
        return;
      }
      
      // Kiểm tra định dạng file
      if (!selectedFile.type.startsWith('video/')) {
        toast.error('Vui lòng chọn file video hợp lệ');
        setIsUploading(false);
        return;
      }
      
      // Kiểm tra thumbnail nếu có
      if (thumbnailFile && !thumbnailFile.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh hợp lệ cho thumbnail');
        setIsUploading(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('video', selectedFile);
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      if (selectedSchedule) {
        formData.append('scheduleId', selectedSchedule._id);
      }
      formData.append('title', title || 'Video không có tiêu đề');
      formData.append('description', description || '');
      formData.append('tags', tags || '');
      formData.append('category', category || 'general');
      formData.append('isPublic', isPublic);
      
      // Thêm userId vào formData
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData && userData._id) {
        formData.append('userId', userData._id);
      }
      
      console.log('Sending video:', selectedFile.name, selectedFile.size, selectedFile.type);
      if (thumbnailFile) {
        console.log('Sending thumbnail:', thumbnailFile.name, thumbnailFile.size, thumbnailFile.type);
      }
      
      // Gửi request lên server
      const response = await axios.post(
        `${url}/api/shortvideo/videos`, 
        formData, 
        {
          headers: {
            'token': token,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
            setUploadPhase(percentCompleted);
            
            // Khi upload lên server hoàn tất, bắt đầu mô phỏng tiến trình xử lý
            if (percentCompleted === 100) {
              setUploadStatus('processing');
              simulateProcessingProgress(selectedFile.size);
            }
          }
        }
      );
      
      if (response.status === 201) {
        clearInterval(processingTimerRef.current);
        setUploadPhase(200); // Đánh dấu hoàn thành
        setUploadStatus('success');
        
        if (response.data.processing) {
          toast.success('Video đã được tải lên thành công và đang được xử lý!');
        } else {
          toast.success('Video đã được tải lên thành công!');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      clearInterval(processingTimerRef.current);
      setUploadStatus('error');
      toast.error(`Lỗi: ${error.response?.data?.message || error.message || 'Không thể tải lên video'}`);
      setIsUploading(false);
    }
  };
  
  // Tính toán phần trăm hiển thị dựa trên giai đoạn upload
  const calculateDisplayProgress = () => {
    if (uploadPhase <= 100) {
      // Giai đoạn 1: Upload lên server (0-50%)
      return uploadPhase * 0.5;
    } else if (uploadPhase <= 200) {
      // Giai đoạn 2: Xử lý trên server (50-100%)
      return 50 + (uploadPhase - 100) * 0.5;
    }
    return 100;
  };
  
  // Hiển thị thông báo dựa trên trạng thái
  const getUploadStatusMessage = () => {
    const displayProgress = Math.floor(calculateDisplayProgress());
    
    switch (uploadStatus) {
      case 'uploading':
        return `Đang tải lên server: ${uploadProgress}%`;
      case 'processing':
        if (uploadPhase <= 120) return `Đang xử lý video: Chuẩn bị xử lý (${displayProgress}%)`;
        else if (uploadPhase <= 150) return `Đang xử lý video: Tối ưu hóa (${displayProgress}%)`;
        else if (uploadPhase <= 180) return `Đang xử lý video: Hoàn thiện (${displayProgress}%)`;
        else return `Đang xử lý video: Gần hoàn thành (${displayProgress}%)`;
      case 'success':
        return 'Tải lên thành công!';
      case 'error':
        return 'Đã xảy ra lỗi';
      default:
        return '';
    }
  };
  
  useEffect(() => {
    fetchUserSchedules();
  }, []);

  const fetchUserSchedules = async () => {
    try {
      const response = await axios.get(`${url}/api/schedule/user/getSchedules`, {
        headers: { token }
      });
      setSchedules(response.data.schedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);  
      toast.error('Không thể tải danh sách lịch trình');
    }
  };

  const handleScheduleSelect = (schedule) => {
    setSelectedSchedule(schedule);
    setShowScheduleModal(false);
  };
  
  useEffect(() => {
    if (uploadStatus === 'success' && calculateDisplayProgress() === 100) {
      onClose();
    }
    // eslint-disable-next-line
  }, [uploadStatus, uploadPhase]);
  
  return (
    <div className="upload-container">
      <div className="upload-header">
        <button className="back-button" onClick={onClose}>
          <FaChevronLeft />
        </button>
        <h2>Tải lên video</h2>
        <div></div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="upload-content">
          <div className="upload-preview">
            {previewUrl ? (
              <div className="video-preview-container">
                <video 
                  src={previewUrl} 
                  controls 
                  className="video-preview"
                />
                <button 
                  type="button" 
                  className="remove-video-button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl('');
                  }}
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <div 
                className="upload-area"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={triggerVideoInput}
              >
                <FaCloudUploadAlt className="upload-icon" />
                <p>Kéo và thả video vào đây hoặc nhấp để chọn</p>
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={handleFileChange}
                  className="file-input"
                  ref={videoInputRef}
                />
                <button 
                  type="button" 
                  className="select-file-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerVideoInput();
                  }}
                >
                  Chọn video
                </button>
              </div>
            )}
          </div>
          
          <div className="upload-form">
            <div className="form-group">
              <label>Tiêu đề</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề video"
                maxLength="100"
              />
            </div>
            
            <div className="form-group">
              <label>Mô tả</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả về video của bạn"
                maxLength="500"
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label>Thẻ</label>
              <input 
                type="text" 
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Nhập các thẻ, phân cách bằng dấu phẩy"
              />
            </div>
            
            <div className="form-group">
              <label>Danh mục</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Thumbnail</label>
              <div className="thumbnail-upload">
                {thumbnailPreviewUrl ? (
                  <div className="thumbnail-preview-container">
                    <img 
                      src={thumbnailPreviewUrl} 
                      alt="Thumbnail preview" 
                      className="thumbnail-preview"
                    />
                    <button 
                      type="button" 
                      className="remove-thumbnail-button"
                      onClick={() => {
                        setThumbnailFile(null);
                        setThumbnailPreviewUrl('');
                      }}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <div 
                    className="thumbnail-upload-area"
                    onClick={triggerThumbnailInput}
                  >
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleThumbnailChange}
                      className="file-input"
                      ref={thumbnailInputRef}
                    />
                    <button 
                      type="button" 
                      className="select-thumbnail-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerThumbnailInput();
                      }}
                    >
                      Chọn ảnh thumbnail
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label>Quyền riêng tư</label>
              <div className="privacy-options">
                <label className="radio-label">
                  <input 
                    type="radio" 
                    checked={isPublic} 
                    onChange={() => setIsPublic(true)}
                  />
                  Công khai
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    checked={!isPublic} 
                    onChange={() => setIsPublic(false)}
                  />
                  Riêng tư
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <label>Lịch trình</label>
              <div className="schedule-selection">
                <button 
                  type="button" 
                  className="select-schedule-btn"
                  onClick={() => setShowScheduleModal(true)}
                >
                  {selectedSchedule ? selectedSchedule.scheduleName : 'Chọn lịch trình'}
                </button>
                {selectedSchedule && (
                  <button 
                    type="button" 
                    className="clear-schedule-btn"
                    onClick={() => setSelectedSchedule(null)}
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {isUploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className={`progress-fill ${uploadStatus === 'processing' ? 'progress-processing' : ''}`}
                style={{ 
                  width: `${calculateDisplayProgress()}%` 
                }}
              ></div>
            </div>
            <p>{getUploadStatusMessage()}</p>
          </div>
        )}
        
        <div className="upload-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={onClose}
            disabled={isUploading}
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className="upload-button"
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Đang tải lên...' : 'Tải lên'}
          </button>
        </div>
      </form>

      {showScheduleModal && (
        <div className="schedule-modal">
          <div className="schedule-modal-content">
            <h3>Chọn lịch trình</h3>
            <div className="schedule-list">
              {schedules.map(schedule => (
                <div 
                  key={schedule._id} 
                  className="schedule-item"
                  onClick={() => handleScheduleSelect(schedule)}
                >
                  <h4>{schedule.scheduleName}</h4>
                  <p>{schedule.description}</p>
                  <span>{schedule.dateStart} - {schedule.dateEnd}</span>
                </div>
              ))}
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

export default UploadVideo; 
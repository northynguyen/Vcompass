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
  
  // Thêm refs để tham chiếu đến input file
  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  
  // Thay đổi state uploadStatus để theo dõi chi tiết hơn
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle', 'uploading', 'processing', 'success', 'error'
  const [uploadPhase, setUploadPhase] = useState(0); // 0-100: upload to server, 101-200: processing on server
  const processingTimerRef = useRef(null);
  
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
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        const fileUrl = URL.createObjectURL(file);
        setPreviewUrl(fileUrl);
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
        
        setTimeout(() => {
          onClose(); // Đóng form upload sau 1 giây
        }, 1000);
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
    </div>
  );
};

export default UploadVideo; 
import React, { useRef, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { StoreContext } from '../../../Context/StoreContext';
import axios from 'axios';
import './VideoPlayer.css';

const VideoPlayer = ({ videoUrl, onNext, onPrev, videoId }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [viewLogged, setViewLogged] = useState(false);
  const { url, token } = useContext(StoreContext);
  
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (videoRef.current) {
            videoRef.current.play().catch(err => {
              console.error("Error playing video:", err);
              setIsPlaying(false);
            });
            setIsPlaying(true);
          }
        } else {
          if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      });
    }, options);
    
    if (videoRef.current) {
      observer.observe(videoRef.current);
    }
    
    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [videoUrl]);
  
  useEffect(() => {
    const viewedVideos = JSON.parse(sessionStorage.getItem('viewedVideos') || '{}');
    if (viewedVideos[videoId]) {
      setViewLogged(true);
    }
  }, [videoId]);
  
  useEffect(() => {
    const videoElement = videoRef.current;
    
    const handleTimeUpdate = () => {
      if (videoElement) {
        const duration = videoElement.duration;
        const currentTime = videoElement.currentTime;
        const progressPercent = (currentTime / duration) * 100;
        
        setProgress(progressPercent);
        
        if (progressPercent >= 70 && !viewLogged) {
          updateViewCount();
          setViewLogged(true);
          
          const viewedVideos = JSON.parse(sessionStorage.getItem('viewedVideos') || '{}');
          viewedVideos[videoId] = true;
          sessionStorage.setItem('viewedVideos', JSON.stringify(viewedVideos));
        }
      }
    };
    
    if (videoElement) {
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
    }
    
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [videoId, viewLogged, url, token]);
  
  useEffect(() => {
    setViewLogged(false);
    setProgress(0);
  }, [videoId]);
  
  const updateViewCount = async () => {
    try {
      await axios.post(
        `${url}/api/shortvideo/videos/${videoId}/view`,
        {},
        { headers: { token } }
      );
      console.log('View count updated at 70% of video');
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };
  
  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(err => {
        console.error("Error playing video:", err);
      });
      setIsPlaying(true);
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };
  
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      if (duration) {
        const progressPercent = (current / duration) * 100;
        setProgress(progressPercent);
      }
    }
  };
  
  const handleVideoEnd = () => {
    onNext();
  };
  
  const handleLoadedData = () => {
    setIsLoaded(true);
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error("Error playing video:", err);
        setIsPlaying(false);
      });
    }
  };
  
  const handleError = (e) => {
    console.error("Video error:", e);
    setIsPlaying(false);
  };
  
  let touchStartY = 0;
  
  const onTouchStart = (e) => {
    touchStartY = e.touches[0].clientY;
  };
  
  const onTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        onNext();
      } else {
        onPrev();
      }
    }
  };
  
  return (
    <div 
      className="video-player-container"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {!isLoaded && <div className="loading-spinner"></div>}
      
      <video
        ref={videoRef}
        src={videoUrl}
        className="video-player"
        loop={false}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnd}
        onLoadedData={handleLoadedData}
        onError={handleError}
        playsInline
        muted={isMuted}
        controls={false}
        preload="auto"
      />
      
      {!isPlaying && (
        <div className="play-icon-container" onClick={togglePlay}>
          <div className="play-icon"></div>
        </div>
      )}
      
      <div className="mute-button" onClick={toggleMute}>
        {isMuted ? (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
            <path d="M12 3.5L6 8H2v8h4l6 4.5V3.5z"/>
            <line x1="18" y1="6" x2="8" y2="18" stroke="white" strokeWidth="2"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
            <path d="M12 3.5L6 8H2v8h4l6 4.5V3.5z"/>
            <path d="M19 12c0-3.3-2.7-6-6-6v12c3.3 0 6-2.7 6-6z"/>
          </svg>
        )}
      </div>
      
      <div className="progress-bar-container">
        <div 
          className="progress-bar" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

VideoPlayer.propTypes = {
  videoUrl: PropTypes.string.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
  videoId: PropTypes.string.isRequired
};

export default VideoPlayer; 
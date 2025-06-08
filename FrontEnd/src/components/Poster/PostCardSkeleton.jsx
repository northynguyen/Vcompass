import PropTypes from 'prop-types';
import './PostCardSkeleton.css';

const PostCardSkeleton = ({ count = 1, isSearchSchedule = false }) => {
  // Create array based on count parameter
  const skeletonItems = Array(count).fill(null);
  
  return (
    <>
      {skeletonItems.map((_, index) => (
        <div key={index} className={`skeleton-card-container ${isSearchSchedule ? 'max-width-search' : ''}`}>
          <header className="skeleton-card-header">
            <div className="skeleton-user-info">
              <div className="skeleton-avatar-postcard"></div>
              <div className="skeleton-user-details">
                <div className="skeleton-username"></div>
                <div className="skeleton-date"></div>
              </div>
            </div>
            <div className="skeleton-menu-icon"></div>
          </header>
          
          <div className="skeleton-content-container">
            <div className="skeleton-image"></div>
          </div>
          
          <div className="skeleton-card-content">
            <div className="skeleton-details">
              <div className="skeleton-title"></div>
              <div className="skeleton-description"></div>
            </div>
            
            <div className="skeleton-pricing-box">
              <div className="skeleton-pricing-title"></div>
              <div className="skeleton-price-item"></div>
              <div className="skeleton-price-item"></div>
              <div className="skeleton-total"></div>
            </div>
            
            <div className="skeleton-attractions-box">
              <div className="skeleton-attractions-title"></div>
              <div className="skeleton-attractions-list">
                <div className="skeleton-attraction-item"></div>
                <div className="skeleton-attraction-item"></div>
                <div className="skeleton-attraction-item"></div>
              </div>
            </div>
          </div>
          
          <footer className="skeleton-card-footer">
            <div className="skeleton-schedule-actions">
              <div className="skeleton-action-button"></div>
              <div className="skeleton-action-button"></div>
              <div className="skeleton-action-button"></div>
            </div>
          </footer>
        </div>
      ))}
    </>
  );
};

PostCardSkeleton.propTypes = {
  count: PropTypes.number
};

export default PostCardSkeleton; 
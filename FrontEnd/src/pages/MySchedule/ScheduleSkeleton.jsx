import './ScheduleSkeleton.css';

const ScheduleSkeleton = () => {
    return (
        <div className="skeleton-schedule-card">
            <div className="skeleton-schedule-image"></div>
            <div className="skeleton-schedule-info">
                <div className="skeleton-schedule-title"></div>
                <div className="skeleton-schedule-dates"></div>
            </div>
            <div className="skeleton-schedule-dots"></div>
        </div>
    );
};

export default ScheduleSkeleton; 
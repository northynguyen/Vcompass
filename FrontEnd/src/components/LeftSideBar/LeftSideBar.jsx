import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { 
  FaRegBookmark, 
  FaPlus, 
  FaHome
} from 'react-icons/fa';
import { MdTravelExplore, MdOutlineRecommend } from 'react-icons/md';
import { StoreContext } from '../../Context/StoreContext';
import PropTypes from 'prop-types';
import './LeftSideBar.css';

const LeftSideBar = ({ setShowLogin }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(StoreContext);
  const { pathname } = location;

  // Function to check if a link is active
  const isActive = (path) => {
    if (path === '/' && pathname === '/') {
      return true;
    }
    return pathname.startsWith(path) && path !== '/';
  };

  // Handle follow schedules click
  const handleFollowClick = (e) => {
    e.preventDefault();
    if (!user) {
      setShowLogin(true);
    } else {
      navigate('/schedules/follow');
    }
  };

  // Handle create schedule click
  const handleCreateScheduleClick = (e) => {
    e.preventDefault();
    if (!user) {
      setShowLogin(true);
    } else {
      navigate('/create-schedule/manual');
    }
  };

  return (
    <div className="left-side-bar">
      <Link to="/" className={`left-side-bar-item ${isActive('/') ? 'active' : ''}`}>
        <FaHome className="left-side-bar-icon" />
        <span>Trang chủ</span>
      </Link>
      
      <Link to="/schedules/foryou" className={`left-side-bar-item ${isActive('/schedules/foryou') ? 'active' : ''}`}>
        <MdOutlineRecommend className="left-side-bar-icon" />
        <span>Dành cho bạn</span>
      </Link>

      <div 
        onClick={handleFollowClick} 
        className={`left-side-bar-item ${isActive('/schedules/follow') ? 'active' : ''}`}
        style={{ cursor: 'pointer' }}
      >
        <FaRegBookmark className="left-side-bar-icon" />
        <span>Đang theo dõi</span>
      </div>

      <Link to="/short-video" className={`left-side-bar-item ${isActive('/short-video') ? 'active' : ''}`}>
        <MdTravelExplore className="left-side-bar-icon" />
        <span>Khám phá</span>
      </Link>

      <div 
        onClick={handleCreateScheduleClick} 
        className={`left-side-bar-item ${isActive('/create-schedule') ? 'active' : ''}`}
        style={{ cursor: 'pointer' }}
      >
        <FaPlus className="left-side-bar-icon" />
        <span>Tạo lịch trình</span>
      </div>
    </div>
  );
};

LeftSideBar.propTypes = {
  setShowLogin: PropTypes.func.isRequired,
};

export default LeftSideBar; 
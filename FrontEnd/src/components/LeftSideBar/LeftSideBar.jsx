import { Link, useLocation } from 'react-router-dom';
import { 
  FaRegBookmark, 
  FaPlus, 
  FaPhotoVideo, 
  FaHome
} from 'react-icons/fa';
import { MdTravelExplore, MdOutlineRecommend } from 'react-icons/md';
import './LeftSideBar.css';

const LeftSideBar = () => {
  const location = useLocation();
  const { pathname } = location;

  // Function to check if a link is active
  const isActive = (path) => {
    if (path === '/' && pathname === '/') {
      return true;
    }
    return pathname.startsWith(path) && path !== '/';
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


      <Link to="/schedules/follow" className={`left-side-bar-item ${isActive('/schedules/follow') ? 'active' : ''}`}>
        <FaRegBookmark className="left-side-bar-icon" />
        <span>Đang theo dõi</span>
      </Link>

      <Link to="/short-video" className={`left-side-bar-item ${isActive('/short-video') ? 'active' : ''}`}>
        <MdTravelExplore className="left-side-bar-icon" />
        <span>Khám phá</span>

      </Link>

      <Link to="/create-schedule/manual" className={`left-side-bar-item ${isActive('/create-schedule') ? 'active' : ''}`}>
        <FaPlus className="left-side-bar-icon" />
        <span>Tạo lịch trình</span>
      </Link>


      
    </div>
  );
};

export default LeftSideBar; 
/* eslint-disable react/prop-types */
import { FaCalendarAlt, FaConciergeBell, FaHome, FaStar, FaThLarge } from 'react-icons/fa'; // Import icons
import { Link, useLocation } from 'react-router-dom'; // Import Link and useLocation from react-router-dom
import './MenuBar.css';

const MenuBar = () => {
  // Use useLocation hook to get the current route
  const location = useLocation();

  return (
    <aside className="sidebar">
      {/* Menu Items */}
      <nav className="menu">
        <ul>
          <Link to="/dashboard">
            <li className={location.pathname === '/dashboard' ? 'active' : ''}>
              <FaThLarge />
              Tổng quan
            </li>
          </Link>
          <Link to="/reservation">
            <li className={location.pathname === '/reservation' ? 'active' : ''}>
              <FaCalendarAlt />
              Đặt phòng
            </li>
          </Link>
          <Link to="/hotels">
            <li className={location.pathname === '/hotels' ? 'active' : ''}>
              <FaHome />
              Khách sạn
            </li>
          </Link>
          <Link to="/concierge">
            <li className={location.pathname === '/concierge' ? 'active' : ''}>
              <FaConciergeBell />
              Ăn uống
            </li>
          </Link>
          <Link to="/review">
            <li className={location.pathname === '/review' ? 'active' : ''}>
              <FaStar />
              Đánh giá
            </li>
          </Link>
        </ul>
      </nav>
    </aside>
  );
};

export default MenuBar;

/* eslint-disable react/prop-types */
import './MenuBar.css';
import { Link, useLocation } from 'react-router-dom'; // Import Link and useLocation from react-router-dom
import { FaThLarge, FaCalendarAlt, FaHome, FaEnvelope, FaBroom, FaBox, FaDollarSign, FaStar, FaConciergeBell } from 'react-icons/fa'; // Import icons

const MenuBar = () => {
  // Use useLocation hook to get the current route
  const location = useLocation();

  return (
    <aside className="sidebar">
      {/* Menu Items */}
      <nav className="menu">
        <ul>
          <li className={location.pathname === '/dashboard' ? 'active' : ''}>
            <Link to="/dashboard">
              <FaThLarge />
              Tổng quan
            </Link>
          </li>
          <li className={location.pathname === '/reservation' ? 'active' : ''}>
            <Link to="/reservation">
              <FaCalendarAlt />
              Quản lý đặt phòng
            </Link>
          </li>
          <li className={location.pathname === '/hotels' ? 'active' : ''}>
            <Link to="/hotels">
              <FaHome />
              Dịch vụ chỗ ở
            </Link>
          </li>
          <li className={location.pathname === '/concierge' ? 'active' : ''}>
            <Link to="/concierge">
              <FaConciergeBell />
              Dịch vụ ăn uống
            </Link>
          </li>
          {/* <li className={location.pathname === '/messages' ? 'active' : ''}>
            <Link to="/messages">
              <FaEnvelope />
              Messages
              <span className="notification-badge">5</span>
            </Link>
          </li> */}
          {/* <li className={location.pathname === '/housekeeping' ? 'active' : ''}>
            <Link to="/housekeeping">
              <FaBroom />
              Housekeeping
            </Link>
          </li> */}
          {/* <li className={location.pathname === '/inventory' ? 'active' : ''}>
            <Link to="/inventory">
              <FaBox />
              Inventory
            </Link>
          </li>
          <li className={location.pathname === '/calendar' ? 'active' : ''}>
            <Link to="/calendar">
              <FaCalendarAlt />
              Calendar
            </Link>
          </li> */}
          {/* <li className={location.pathname === '/financials' ? 'active' : ''}>
            <Link to="/financials">
              <FaDollarSign />
              Financials
            </Link>
          </li> */}
          {/* <ul className="submenu">
            <li className={location.pathname === '/invoice' ? 'active' : ''}>
              <Link to="/invoice">
                Invoice
              </Link>
            </li>
            <li className={location.pathname === '/expenses' ? 'active' : ''}>
              <Link to="/expenses">
                <span className="highlight">Expenses</span>
              </Link>
            </li>
          </ul> */}
          <li className={location.pathname === '/review' ? 'active' : ''}>
            <Link to="/review">
              <FaStar />
              Đánh giá
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default MenuBar;

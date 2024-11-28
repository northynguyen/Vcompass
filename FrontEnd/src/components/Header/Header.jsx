/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import "./Header.css";
import profile_icon from "../../assets/profile_icon.png";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect, useContext } from "react";
import { CiViewList, CiSettings, CiLogout } from "react-icons/ci"; // Import icons from react-icons
import { AiOutlineSchedule } from "react-icons/ai"; // Import icons from react-icons
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext'
import { toast } from 'react-toastify';

const Header = ({ setShowLogin }) => {
  const { token, setToken, user } = useContext(StoreContext);
  console.log(user)
  const [activeTab, setActiveTab] = useState('');
  const [menuVisible, setMenuVisible] = useState(false); // State for menu visibility
  const menuRef = useRef(null); // Reference for the menu
  const navigate = useNavigate();
  const location = useLocation();

  const onClick = (tab) => {
    setActiveTab(tab);
    navigate(`/user-service/${tab}`, { state: { tab }, replace: true }); // Gửi tab qua state
    setMenuVisible(false);
  };

  const handleLogout = () => {
    setShowLogin(false);
    navigate('/');
    toast.success("Đăng xuất thành công");
    localStorage.removeItem('token');

    setToken(null);

  }
  const toggleMenu = () => {

    setMenuVisible(!menuVisible);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the click is outside the menu and the menu is visible, hide it
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuVisible(false);

      }
    };

    // Add event listener when the menu is visible
    if (menuVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Clean up event listener on component unmount or when menuVisible changes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuVisible]);

  const isHomePage = location.pathname === '/';


  return (
    <div className={isHomePage ? 'home-header' : 'header'}>
      <div className="logo">
        <h1>VCompass</h1>
      </div>

      <div className="header-right">
        <ul className="header-menu">
          <Link to="/" className="header-menu-page">Trang chủ</Link>
          <Link to="/booking" className="header-menu-page">Đặt phòng</Link>
          <Link to="/attractions" className="header-menu-page">Tham quan</Link>
          <Link to="/foodservices" className="header-menu-page">Nhà hàng</Link>
          <Link to="/my-schedule" className="header-menu-page">Lịch trình của tôi</Link>
          <Link to="/partnership" className="header-menu-page">Quan hệ đối tác</Link>
          <Link to="/help" className="header-menu-page">Trợ giúp</Link>
        </ul>

        {/* Chờ chèn token vào  */}
        {token === null ? <button onClick={() => setShowLogin(true)}>Đăng nhập</button> :
          <div className="header-profile" ref={menuRef}>
            <div className="profile-section" onClick={toggleMenu}>
              <img src={profile_icon} alt="Profile" className="profile-pic" />
            </div>

            {/* Menu that appears on profile image click */}
            {menuVisible && (
              <div className="profile-menu" >
                <div className="profile-name">
                  <img src={user.avatar} alt="Profile" className="profile-pic" />
                  <h3>{user.name} </h3>
                </div>

                <hr></hr>
                <ul className="menu">
                  <li
                    onClick={() => onClick('booking')}>
                    <CiViewList /> My Booking
                  </li>
                  <li
                    onClick={() => onClick('account')}>
                    <CiSettings /> My Account
                  </li>
                  <li
                    onClick={() => onClick('schedule')}>
                    <AiOutlineSchedule /> My Schedule
                  </li>
                  <hr />
                  <li
                    onClick={() => handleLogout()}>
                    <CiLogout /> Log Out
                  </li>
                </ul>
              </div>
            )}
          </div>
        }
      </div>
    </div>
  );
};

export default Header;  
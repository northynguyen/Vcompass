import { useContext, useEffect, useRef, useState } from 'react';
import { CiLogout, CiSettings } from "react-icons/ci";
import { FaBell } from "react-icons/fa"; // Importing Bell icon from react-icons
import { MdManageAccounts } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { StoreContext } from '../../Context/StoreContext';
import './Header.css';
const Header = () => {
  // State to handle the visibility of the profile popup
  const [isProfilePopupVisible, setProfilePopupVisible] = useState(false);
  const [isNotificationsVisible, setNotificationsVisible] = useState(false); // State for notifications dropdown
  const menuRef = useRef(null);
  const notificationRef = useRef(null); // Reference for the notifications dropdown
  const { token, setToken, admin } = useContext(StoreContext);
  const navigate = useNavigate();
  // Sample notifications array
  const notifications = [
    {
      id: 1,
      user: "Tuan Kùng",
      content: "đã gắn thẻ bạn và những người khác vào một ảnh trong THANH LÝ UNIQLO CHÍNH HÃNG",
      image: "https://scontent.fsgn8-4.fna.fbcdn.net/v/t39.30808-1/322550024_839445640689536_4961462336093581748_n.jpg?stp=cp0_dst-jpg_s40x40&_nc_cat=105&ccb=1-7&_nc_sid=0ecb9b&_nc_eui2=AeHL1GYVZ9WwyqLejlMn2ntK545RmbWPU9HnjlGZtY9T0U98Wje6cSi2T1vblvEu6lorGjsDzFxUXt5-FFnKWQDv&_nc_ohc=n2W3pUe425MQ7kNvgGaV_YJ&_nc_ht=scontent.fsgn8-4.fna&_nc_gid=ADaDCAF8IkQoCPdMcRHB6Hu&oh=00_AYBlG5v-cIX696vGJRMk6l8WShxIml3hrt5Y-wINXWvYnA&oe=6703CA30",
      time: "13 hours ago",
      isUnread: true,
    },
    {
      id: 2,
      user: "Tien Vu",
      content: "đã gắn thẻ bạn vào một ảnh trong Cộng Đồng Fan Leo Messi Tại Việt Nam",
      image: "https://scontent.fsgn8-4.fna.fbcdn.net/v/t39.30808-1/264778127_3108269189497712_7784999328014109379_n.jpg?stp=cp0_dst-jpg_s40x40&_nc_cat=105&ccb=1-7&_nc_sid=0ecb9b&_nc_eui2=AeEN5b4W_dA3NQNYQiEhCYLeMRj4OtVoeDYxGPg61Wh4NjEoOgbX_Iar6Y7GxoM6-cAu4qtMEBEhzLYlcW0CEkAz&_nc_ohc=V_1LB3RAZdYQ7kNvgG7arNl&_nc_ht=scontent.fsgn8-4.fna&_nc_gid=ADaDCAF8IkQoCPdMcRHB6Hu&oh=00_AYBcsTFX5BmA_5k8j7PwXXgfrCa-BH911L2fIgiYJJjYTw&oe=6703C571",
      time: "1 ngày trước",
      isUnread: true,
    },
    {
      id: 3,
      user: "LEGO - Leading Gen Organization",
      content: "đã nhắc đến bạn và những người khác trong Project X",
      image: "https://scontent.fsgn8-4.fna.fbcdn.net/v/t39.30808-1/455344148_1632076224032785_2241770548559965588_n.jpg?stp=cp0_dst-jpg_s40x40&_nc_cat=108&ccb=1-7&_nc_sid=0ecb9b&_nc_eui2=AeGKQk-2I9PBJ69Zj6_gY0ELS-86aMTLaDRL7zpoxMtoNK3LIGavXHLsVFJMtdpaBWKwiL3QfKDSmFDs1vUyvkq2&_nc_ohc=1gSfi-v1HJ0Q7kNvgFwn-5W&_nc_ht=scontent.fsgn8-4.fna&_nc_gid=ADaDCAF8IkQoCPdMcRHB6Hu&oh=00_AYA6Qz7V0l2bX8JKHoSQsxxxdSxJgAIOl48nAPNJtQhPlw&oe=6703C128",
      time: "2 ngày trước",
      isUnread: false,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    toast.success('Đăng xuất thành công');
    setToken(null);
  };

  // Toggle profile popup visibility
  const toggleProfilePopup = () => {
    setProfilePopupVisible(!isProfilePopupVisible);
  };

  // Toggle notifications dropdown
  const toggleNotifications = () => {
    setNotificationsVisible(!isNotificationsVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setProfilePopupVisible(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsVisible(false);
      }
    };

    // Add event listener when either menu is visible
    if (isProfilePopupVisible || isNotificationsVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfilePopupVisible, isNotificationsVisible]);

  return (
    <header className="header-container">
      {/* Left section (Logo and Title) */}
      <div className="header-left">
        <h1>VComppass</h1>
      </div>

      {/* Right section (Icons and User Profile) */}
      <div className="header-right">
        {/* Notification Icon with Badge */}
        <div className="notification-container">
          <button className="icon-button" onClick={toggleNotifications}>
            <FaBell className="bell-icon" />
            <span className="notification-badge">{notifications.length}</span> {/* Red badge with the number of notifications */}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsVisible && (
            <div className="notifications-dropdown" ref={notificationRef}>
              <ul className="notifications-list">
                {notifications.map((notification) => (
                  <li key={notification.id} className={`notification-item ${notification.isUnread ? 'unread' : ''}`}>
                    <img src={notification.image} alt={notification.user} className="notification-image" />
                    <div className="notification-content">
                      <p><strong>{notification.user}</strong> {notification.content}</p>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                    {notification.isUnread && <span className="unread-dot"></span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Settings Icon */}
        <button className="icon-button">
          <i className="fas fa-cog"></i>
        </button>

        {/* User Profile */}
        {admin &&
          <div className="user-profile">
            <img
              src={admin.avatar}
              alt="User Avatar"
              className="user-avatar"
              onClick={toggleProfilePopup} // Toggle profile popup on click
            />
            <div className="user-info">
              <p>{admin.name}</p>
              <span>Admin</span>
            </div>
          </div>}

        {/* Profile Popup Menu */}
        {isProfilePopupVisible && (
          <div className="profile-popup" ref={menuRef}>
            <ul className="menu">
              <li><CiSettings /> My Settings</li>
              <li><MdManageAccounts /> My Profile</li>
              <hr />
              <li onClick={handleLogout}><CiLogout /> Log Out</li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;

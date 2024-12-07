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
import { FaBell } from "react-icons/fa";
import axios from 'axios';
import {io} from 'socket.io-client'

const Header = ({ setShowLogin }) => {
  const { token, setToken, user,url } = useContext(StoreContext);
  const [activeTab, setActiveTab] = useState('');
  const [menuVisible, setMenuVisible] = useState(false); // State for menu visibility
  const menuRef = useRef(null); // Reference for the menu
  const navigate = useNavigate();
  const location = useLocation();
  const notificationRef = useRef(null); // Reference for the notifications dropdown
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newNotification, setNewNotification] = useState(null);

  const handleNotificationClick = async (id) => {
    try {
      const response = await axios.put(`${url}/api/notifications/${id}`, 
        { status: "read" }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.status === 200) {
        toast.success("Thành công!");
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification._id === id ? { ...notification, status: "read" } : notification
          )
        );
        setUnreadCount((prevCount) => prevCount - 1);
      }
      else {
        toast.error("Không thể cập nhật trạng thái thông báo!");
      }
     
    } catch (error) {
      console.error("Error updating notification status:", error);
      toast.error("Không thể cập nhật trạng thái thông báo!");
    }
  };
  

  const fetchNotifications = async () => {
    try {
      setLoading(true); // Bật trạng thái loading
      const response = await axios.get(`${url}/api/notifications/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Gửi token để xác thực nếu cần
        },
      });
      setNotifications(response.data.notifications); 
      setUnreadCount(response.data.notifications.filter(notification => notification.status === "unread").length); 
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Không thể tải thông báo!");
    } finally {
      setLoading(false); // Tắt trạng thái loading
    }
  };


  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  useEffect(() => {
    if (!user?._id) return;
  
    console.log("Connecting to socket...");
    const socket = io("http://localhost:4000");
  
    socket.on(`${user._id}`, (notification) => {
      console.log("Received notification:", notification);
      setNotifications((prev) => [notification, ...prev]); // Cập nhật danh sách thông báo
      setUnreadCount((prev) => prev + 1); // Tăng số lượng chưa đọc
      toast.info(
        <div className="custom-toast">
          <h4>🔔 {notification.nameSender} </h4>
          <p>{notification.content}</p>
          <small>{new Date(notification.createdAt).toLocaleString()}</small>
        </div>,
        {
          autoClose: 5000,
          pauseOnHover: true,
          theme: "light",
          position: "top-right",
        }
      );
      
      
    });
  
    // Ngắt kết nối khi component unmounts
    return () => {
      socket.disconnect();
      console.log("Disconnected from socket");
    };
  }, [url, user?._id]);
  


  const toggleNotifications = () => {
    setNotificationsVisible(!notificationsVisible);
  };

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
    localStorage.removeItem('user');

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
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsVisible(false);
      }

    };

    // Add event listener when the menu is visible
    if (menuVisible || notificationsVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Clean up event listener on component unmount or when menuVisible changes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuVisible, notificationsVisible]);

  const isHomePage = location.pathname === '/';

  
  return (
    <div className={isHomePage ? 'home-header' : 'header'}>
      <div className="logo" onClick={() => window.location.replace('/')}>
        <h1>VCompass</h1>
      </div>

      <div className="header-right">
        <ul className="header-menu">
          <Link to="/" className="header-menu-page" onClick={() => window.location.replace('/')}>Trang chủ</Link>
          <Link to="/booking" className="header-menu-page">Đặt phòng</Link>
          <Link to="/attractions" className="header-menu-page">Tham quan</Link>
          <Link to="/foodservices" className="header-menu-page">Nhà hàng</Link>
          <Link to="/my-schedule" className="header-menu-page">Lịch trình của tôi</Link>
          <Link to="/partnership" className="header-menu-page">Quan hệ đối tác</Link>
          <Link to="/help" className="header-menu-page">Trợ giúp</Link>
        </ul>

        {/* Chờ chèn token vào  */}
        {token === null ? <button className="header-login" onClick={() => setShowLogin(true)}>Đăng nhập</button> :
          <div className="header-profile" ref={menuRef}>
            <div className="profile-section" onClick={toggleMenu}>
              <img src={`${url}/images/${user.avatar}`} alt="Profile" className="user-avatar" />
            </div>

            

            {menuVisible && (
              <div className="profile-menu" >
                <div className="profile-name">
                  <img src={user.avatar ? `${url}/images/${user.avatar}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="Profile" className="user-avatar" />
                  <h3>{user.name} </h3>
                </div>

                <hr></hr>
                <ul className="menu">
                  <li
                    onClick={() => onClick('booking')}>
                    <CiViewList /> Booking của tôi
                  </li>
                  <li
                    onClick={() => onClick('account')}>
                    <CiSettings /> Tài khoản
                  </li>
                  <li
                    onClick={() => onClick('schedule')}>
                    <AiOutlineSchedule /> Đã lưu
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


       {token !== null && 
        <div className="notification-container">
              <button className="icon-button" onClick={toggleNotifications}>
                <FaBell className="bell-icon" />
                {unreadCount > 0 && 
                <span className="notification-badge">
                  {<span className="unread-count">{unreadCount}</span>}
                </span>
                } 

              </button>

              {/* Notifications Dropdown */}
              {notificationsVisible && (
                <div className="notifications-dropdown" ref={notificationRef}>
                  <ul className="notifications-list">
                    {loading && <p>Loading notifications...</p>}
                    {!loading && notifications.length === 0 && <p>No notifications</p>}
                    {notifications.map((notification, index) => (
                      <li key={index} className={`notification-item ${notification.status === 'unread' ? 'unread' : ''}` } onClick={() =>{ notification.status === 'unread' && handleNotificationClick(notification._id)}}>
                        <div className="notification-avatar"> 
                          <img src={notification.imgSender ? notification.imgSender : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt={notification.user} className="notification-image" />
                          <p><strong>{notification.nameSender ? notification.nameSender : "Admin" }</strong></p>
                        </div>
                        <div className="notification-content">
                          <p> {notification.content}</p>
                          <span className="notification-time">{new Date(notification.createdAt).toLocaleString()}</span>
                        </div>
                        {notification.status === 'unread' && <span className="unread-dot"></span>}
                      </li>
                    ))}
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
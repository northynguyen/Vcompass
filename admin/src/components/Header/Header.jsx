import axios from 'axios';
import { useContext, useEffect, useRef, useState } from 'react';
import { CiLogout, CiSettings } from "react-icons/ci";
import { FaBell } from "react-icons/fa"; // Importing Bell icon from react-icons
import { MdManageAccounts } from "react-icons/md";
import { TiArrowSortedDown } from "react-icons/ti";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import logo from '../../assets/logo.png';
import { StoreContext } from '../../Context/StoreContext';
import './Header.css';
const Header = () => {
  // State to handle the visibility of the profile popup
  const [isProfilePopupVisible, setIsProfilePopupVisible] = useState(false);
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  const menuRef = useRef(null);
  const notificationRef = useRef(null); // Reference for the notifications dropdown
  const { token, setToken, admin, url } = useContext(StoreContext);


  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  // Sample notifications array


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
      const response = await axios.get(`${url}/api/notifications/admin`, {
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
    if (!admin?._id) return;

    console.log("Connecting to socket...");
    const socket = io("http://localhost:4000");

    socket.on(`admin`, (notification) => {
      console.log("Received notification:", notification);
      fetchNotifications();
      setUnreadCount((prev) => prev + 1);
      toast.info(
        <div className="custom-toast">
          <h4>🔔 {notification.nameSender} </h4>
          <p>{notification.content}</p>
          <small>{new Date(notification.createdAt).toLocaleString()}</small>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
          closeOnClick: true,
        }
      );
    });

    // Ngắt kết nối khi component unmounts
    return () => {
      socket.disconnect();
      console.log("Disconnected from socket");
    };
  }, [url, admin?._id]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    toast.success('Đăng xuất thành công');
    setToken(null);
  };
  const handleMyProfile = () => {
    navigate('/myprofile');
  }
  // Toggle profile popup visibility
  const toggleProfilePopup = () => {
    setIsProfilePopupVisible(!isProfilePopupVisible);
  };

  // Toggle notifications dropdown
  const toggleNotifications = () => {
    setIsNotificationsVisible(!isNotificationsVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfilePopupVisible(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsVisible(false);
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
        <div className="logo" onClick={() => window.location.replace('/')}>
          <img src={logo} className="logo-image"></img>
        </div>
      </div>

      {/* Right section (Icons and User Profile) */}
      <div className="header-right">
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
          {isNotificationsVisible && (
            <div className="notifications-dropdown" ref={notificationRef}>
              <ul className="notifications-list">
                {loading && <p>Loading notifications...</p>}
                {!loading && notifications.length === 0 && <p>No notifications</p>}
                {notifications.map((notification, index) => (
                  <li key={index} className={`notification-item ${notification.status === 'unread' ? 'unread' : ''}`} onClick={() => { notification.status === 'unread' && handleNotificationClick(notification._id) }}>
                    <div className="notification-avatar">
                      <img src={notification.idSender && notification.idSender.avatar ? notification.idSender.avatar : notification.idSender ? `${url}/images/${notification.idSender.avatar}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt={notification.user} className="notification-image" />
                    </div>
                    <div className="notification-content">
                      <p><strong>{notification.idSender ? notification.idSender.name : "Admin"}</strong></p>
                      <p className="notification-text"> {notification.content}</p>
                      <span className="notification-time">{new Date(notification.createdAt).toLocaleString()}</span>
                    </div>
                    {notification.status === 'unread' && <span className="unread-dot"></span>}
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
          <div className="user-profile" onClick={toggleProfilePopup}>
            <div className="user-info">
              <p>{admin.name}</p>
            </div>
            <img
              src={admin.avatar && admin.avatar.includes('http') ? admin.avatar : admin.avatar ? `${url}/images/${admin.avatar}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              alt="User Avatar" className="user-avatar"/>
            <div className="arrow-down-infor">
              <TiArrowSortedDown />
            </div>

          </div>
        }

        {isProfilePopupVisible && (
          <div className="profile-popup" ref={menuRef}>
            <ul className="profile-dropdown">
              <li onClick={handleMyProfile}><MdManageAccounts />Thông tin cá nhân</li>
              <hr />
              <li onClick={handleLogout}><CiLogout />Đăng xuất</li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;

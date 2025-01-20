import axios from 'axios';
import { useContext, useEffect, useRef, useState } from 'react';
import { CiLogout, CiSettings } from "react-icons/ci";
import { FaBell } from "react-icons/fa"; // Importing Bell icon from react-icons
import { MdManageAccounts } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import { StoreContext } from '../../Context/StoreContext';
import './Header.css';
import logo from '../../assets/logo.png'

const Header = () => {
  // State to handle the visibility of the profile popup
  const [isProfilePopupVisible, setProfilePopupVisible] = useState(false);
  const [isNotificationsVisible, setNotificationsVisible] = useState(false); // State for notifications dropdown
  const menuRef = useRef(null);
  const notificationRef = useRef(null); // Reference for the notifications dropdown

  const { token, setToken, user, url } = useContext(StoreContext);

  const navigate = useNavigate();

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
    const socket = io(url);

    socket.on(`${user._id}`, (notification) => {
      console.log("Received notification:", notification);
      fetchNotifications(); // Cập nhật danh sách thông báo
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


    socket.on(`${user._id}status`, (updateUser) => {

      let countdown = 10;

      // Gọi toast.error lần đầu tiên
      const toastId = toast.error(
        <div className="custom-toast">
          <h4>🔔</h4>
          <p>Tài khoản của bạn sẽ bị khóa trong {countdown}s nữa</p>
        </div>,
        {
          autoClose: false,  // Giữ thông báo trên màn hình
          pauseOnHover: true,
          theme: "light",
          position: "top-right",
        }
      );

      const countdownInterval = setInterval(() => {
        countdown--;

        // Cập nhật thông báo với toast.update()
        toast.update(toastId, {
          render: (
            <div className="custom-toast">
              <h4>🔔</h4>
              <p>Tài khoản của bạn sẽ bị khóa trong {countdown}s nữa</p>
            </div>
          ),
          autoClose: false, // Đảm bảo toast vẫn hiển thị
        });

        if (countdown === 0) {
          clearInterval(countdownInterval);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }, 1000); // Đếm ngược mỗi giây
    });

    // Ngắt kết nối khi component unmounts
    return () => {
      socket.disconnect();
      console.log("Disconnected from socket");
    };
  }, [url, user?._id]);

  const handleLogout = () => {
    localStorage.removeItem('token');
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
  const handleMyProfile = () => {
    navigate('/myprofile');
  }
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
                      <img src={notification.idSender && notification.idSender.avatar.includes("http") ? notification.idSender.avatar : notification.idSender ? `${url}/images/${notification.idSender.avatar}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt={notification.user} className="notification-image" />

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
        {
          user &&
          <div className="user-profile">
            <img
              src={` ${user.avatar && user.avatar.includes('http') ? user.avatar : user.avatar? `${url}/images/${user.avatar}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}` }
              alt="User Avatar"
              className="user-avatar"
              onClick={toggleProfilePopup} // Toggle profile popup on click
            />
            <div className="user-info">
              <p>{user.name}</p>
              <span>Partner</span>
            </div>
          </div>
        }

        {/* Profile Popup Menu */}
        {isProfilePopupVisible && (
          <div className="profile-popup" ref={menuRef}>
            <ul className="menu">
              <li><CiSettings /> My Settings</li>
              <li onClick={handleMyProfile}><MdManageAccounts /> My Profile</li>
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

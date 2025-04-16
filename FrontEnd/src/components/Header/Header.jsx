/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import axios from 'axios';
import { useContext, useEffect, useRef, useState } from "react";
import { AiOutlineSchedule } from "react-icons/ai"; // Import icons from react-icons
import { CgProfile } from "react-icons/cg";
import { CiLogout, CiSettings, CiViewList } from "react-icons/ci"; // Import icons from react-icons
import { FaBell } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import logo from '../../assets/logo.png';
import { StoreContext } from '../../Context/StoreContext';
import "./Header.css";

const Header = ({ setShowLogin }) => {
  const { token, setToken, user, url } = useContext(StoreContext);
  const [activeTab, setActiveTab] = useState('');
  const [menuVisible, setMenuVisible] = useState(false); // State for menu visibility
  const menuRef = useRef(null); // Reference for the menu
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const notificationRef = useRef(null); // Reference for the notifications dropdown
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newNotification, setNewNotification] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);

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
  }, [token, notificationsVisible]);

  useEffect(() => {
    if (!user?._id) return;

    console.log("Connecting to socket...");
    const socket = io(url);

    socket.on(`${user._id}`, (notification) => {
      console.log("Received notification:", notification);
      fetchNotifications(); // Cập nhật danh sách thông báo
      setUnreadCount((prev) => prev + 1); // Tăng số lượng chưa đọc
      toast(
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

          // Xóa thông tin người dùng và điều hướng đến trang login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
        }
      }, 1000); // Đếm ngược mỗi giây
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
  const onMyProfileClick = () => {
    navigate(`/otherUserProfile/${user._id}`);
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

      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarVisible(false);
      }

    };

    // Add event listener when the menu is visible
    if (sidebarVisible || menuVisible || notificationsVisible) {
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
    <div className={ 'header'}>
      <div className="logo" onClick={() => window.location.replace('/')}>
        <img src={logo} className="logo-image"></img>
      </div>

      <div className="header-right-container">

        {/* Menu chính khi màn hình lớn */}
        <ul className="header-menu">
          <Link to="/" className="header-menu-page">
            Trang chủ
          </Link>
          <Link to="/booking" className="header-menu-page">
            Đặt phòng
          </Link>
          <Link to="/attractions" className="header-menu-page">
            Tham quan
          </Link>
          <Link to="/foodservices" className="header-menu-page">
            Nhà hàng
          </Link>
          <Link to="/my-schedule" className="header-menu-page">
            Lịch trình của tôi
          </Link>
          <Link to="/partnership" className="header-menu-page">
            Quan hệ đối tác
          </Link>
          <Link to="/help" className="header-menu-page">
            Trợ giúp
          </Link>
        </ul>


        {sidebarVisible && (console.log(sidebarVisible),
          <div className="sidebar visible" ref={sidebarRef}>
            <button className="close-sidebar" onClick={toggleSidebar}>
              x
            </button>
            <ul className="sidebar-menu">
              <Link to="/" onClick={toggleSidebar}>
                Trang chủ
              </Link>
              <Link to="/booking" onClick={toggleSidebar}>
                Đặt phòng
              </Link>
              <Link to="/attractions" onClick={toggleSidebar}>
                Tham quan
              </Link>
              <Link to="/foodservices" onClick={toggleSidebar}>
                Nhà hàng
              </Link>
              <Link to="/my-schedule" onClick={toggleSidebar}>
                Lịch trình của tôi
              </Link>
              <Link to="/partnership" onClick={toggleSidebar}>
                Quan hệ đối tác
              </Link>
              <Link to="/help" onClick={toggleSidebar}>
                Trợ giúp
              </Link>
            </ul>
          </div>
        )}

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
                    <li key={index} className={`notification-item ${notification.status === 'unread' ? 'unread' : ''}`} onClick={() => { notification.status === 'unread' && handleNotificationClick(notification._id) }}>
                      <div className="notification-avatar">
                        <img src={notification.idSender && notification.idSender.avatar ? notification.idSender.avatar : notification.idSender ? `${url}/images/${notification.idSender.avatar}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt={notification.user} className="notification-image" />
                      </div>
                      <div className="notification-content">
                        <p><strong>{notification.idSender ? notification.idSender.name : "Admin"}</strong></p>
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

        {/* Chờ chèn token vào  */}
        {token === null ? <button className="header-login" onClick={() => {setShowLogin(true), console.log("ddanwg nhap ")}}>Đăng nhập</button> :
          <div className="header-profile" ref={menuRef}>
            <div className="profile-section" onClick={toggleMenu}>
              <img
                src={user && user.avatar && user.avatar.includes('http') ? `${user.avatar}` : user && user.avatar ? `${url}/images/${user.avatar}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt="Profile"
                className="user-avatar"
              />
            </div>



            {menuVisible && (
              <div className="profile-menu" >
                <div className="profile-name">
                  <img
                    src={user && user.avatar && user.avatar.includes('http') ? `${user.avatar}` : user && user.avatar ? `${url}/images/${user.avatar}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    alt="Profile"
                    className="user-avatar"
                  />
                  <h3>{user.name} </h3>
                </div>

                <hr></hr>
                <ul className="menu">
                  <li
                    onClick={() => onMyProfileClick()}>
                    <CgProfile /> Trang cá nhân
                  </li>
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




        <button className="menu-toggle" onClick={toggleSidebar}>
          ☰
        </button>
      </div>
    </div>
  );
};

export default Header;  

/* eslint-disable react/prop-types */
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { FaThLarge, FaUsers, FaUmbrellaBeach, FaLocationArrow, FaBell, FaEnvelope, FaServicestack, FaUserFriends } from 'react-icons/fa'; // Import icons
import { FaBuildingUser } from "react-icons/fa6";
const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Lấy thông tin URL hiện tại

    const handleNavigation = (path) => {
        if (location.pathname !== path) {
            navigate(path); // Điều hướng nếu URL khác với đường dẫn mong muốn
        }
    };

    // Hàm kiểm tra nếu đường dẫn hiện tại trùng với đường dẫn của tab
    const isActive = (path) => location.pathname === path;

    return (
        <aside className="sidebar">
            {/* Menu Items */}
            <nav className="menu">
                <ul>
                    <li
                        className={isActive('/dashboard') ? 'active' : ''}
                        onClick={() => handleNavigation('/dashboard')}
                    >
                        <FaThLarge />
                        Tổng quan
                    </li>
                    <li
                        className={isActive('/attraction') ? 'active' : ''}
                        onClick={() => handleNavigation('/attraction')}
                    >
                        <FaUmbrellaBeach />
                        Quản lý điểm tham quan
                    </li>
                    <li
                        className={isActive('/users') || isActive('/users/user/') ? 'active' : ''}
                        onClick={() => handleNavigation('/users')}
                    >
                        <FaUsers />
                        Quản lý người dùng
                    </li>
                    <li
                        className={isActive('/partners') || isActive('/partners/partner/') ? 'active' : ''}
                        onClick={() => handleNavigation('/partners')}
                    >
                        <FaBuildingUser />
                        Quản lý nhà cung cấp
                    </li>
                    {/* <li
                        className={isActive('/tours') ? 'active' : ''}
                        onClick={() => handleNavigation('/tours')}
                    >
                        <FaCalendarAlt />
                        Tours
                    </li>
                    <li
                        className={isActive('/services') ? 'active' : ''}
                        onClick={() => handleNavigation('/services')}
                    >
                        <FaServicestack />
                        Services
                    </li> */}
                    <li
                        className={isActive('/notification') ? 'active' : ''}
                        onClick={() => handleNavigation('/notification')}
                    >
                        <FaBell />
                        Gửi thông báo
                    </li>
                    {/* <li
                        className={isActive('/message') ? 'active' : ''}
                        onClick={() => handleNavigation('/message')}
                    >
                        <FaEnvelope />
                        Tin nhắn
                    </li> */}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;

/* eslint-disable react/prop-types */
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { FaThLarge, FaUser, FaCalendarAlt, FaLocationArrow, FaBell, FaEnvelope, FaServicestack } from 'react-icons/fa'; // Import icons

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
                        Dashboard
                    </li>
                    <li
                        className={isActive('/attraction') ? 'active' : ''}
                        onClick={() => handleNavigation('/attraction')}
                    >
                        <FaLocationArrow />
                        Attraction
                    </li>
                    <li
                        className={isActive('/users') ? 'active' : ''}
                        onClick={() => handleNavigation('/users')}
                    >
                        <FaUser />
                        Users
                    </li>
                    <li
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
                    </li>
                    <li
                        className={isActive('/notification') ? 'active' : ''}
                        onClick={() => handleNavigation('/notification')}
                    >
                        <FaBell />
                        Notification
                    </li>
                    <li
                        className={isActive('/message') ? 'active' : ''}
                        onClick={() => handleNavigation('/message')}
                    >
                        <FaEnvelope />
                        Message
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;

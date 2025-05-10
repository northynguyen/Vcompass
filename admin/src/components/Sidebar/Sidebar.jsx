/* eslint-disable react/prop-types */
import { FaHotel, FaThLarge, FaUmbrellaBeach, FaUsers } from 'react-icons/fa'; // Import icons
import { FaBuildingUser } from "react-icons/fa6";
import { IoExtensionPuzzle } from "react-icons/io5";
import { RiCopilotFill } from "react-icons/ri";
import { TbMessageReportFilled } from "react-icons/tb";
import { useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';
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
                        Tham quan
                    </li>
                    <li
                        className={isActive('/services') ? 'active' : ''}
                        onClick={() => handleNavigation('/services')}
                    >
                        <FaHotel />
                        Dịch vụ
                    </li>
                    <li
                        className={isActive('/extensions') ? 'active' : ''}
                        onClick={() => handleNavigation('/extensions')}
                    >
                        <IoExtensionPuzzle />
                        Tiện ích
                    </li>
                    <li
                        className={isActive('/users') || isActive('/users/user/') ? 'active' : ''}
                        onClick={() => handleNavigation('/users')}
                    >
                        <FaUsers />
                        Người dùng
                    </li>
                    <li
                        className={isActive('/partners') || isActive('/partners/partner/') ? 'active' : ''}
                        onClick={() => handleNavigation('/partners')}
                    >
                        <FaBuildingUser />
                        Nhà cung cấp
                    </li>
                    <li
                        className={isActive('/trainAI') ? 'active' : ''}
                        onClick={() => handleNavigation('/trainAI')}
                    >
                        <RiCopilotFill />
                        AI
                    </li>
                    <li
                        className={isActive('/reportmanagement') ? 'active' : ''}
                        onClick={() => handleNavigation('/reportmanagement')}
                    >
                        <TbMessageReportFilled />
                        Báo cáo
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

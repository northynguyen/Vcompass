/* eslint-disable react/prop-types */
import { useState } from 'react';
import './Sidebar.css';
import { FaThLarge, FaUser, FaCalendarAlt, FaLocationArrow, FaConciergeBell, FaEnvelope, FaBell, FaServicestack } from 'react-icons/fa'; // Import icons

const Sidebar = ({ onTabChange }) => {
    // State to manage the active tab
    const [activeTab, setActiveTab] = useState('Dashboard');

    const onClickTab = (tab) => {
        setActiveTab(tab); // Set the active tab
        onTabChange(tab);  // Notify the parent component of the tab change
    };

    return (
        <aside className="sidebar">
            {/* Menu Items */}
            <nav className="menu">
                <ul>
                    <li className={activeTab === 'Dashboard' ? 'active' : ''} onClick={() => onClickTab('Dashboard')}>
                        <FaThLarge />
                        Dashboard
                    </li>
                    <li className={activeTab === 'Attractions' ? 'active' : ''} onClick={() => onClickTab('Attraction')}>
                        <FaLocationArrow />
                        Attraction
                    </li>
                    <li className={activeTab === 'Users' ? 'active' : ''} onClick={() => onClickTab('Users')}>
                        <FaUser />
                        Users
                    </li>
                    <li className={activeTab === 'Tours' ? 'active' : ''} onClick={() => onClickTab('Tours')}>
                        <FaCalendarAlt />
                        Tours
                    </li>
                    <li className={activeTab === 'Services' ? 'active' : ''} onClick={() => onClickTab('Services')}>
                        <FaServicestack />
                        Services
                    </li>
                    <li className={activeTab === 'Notification' ? 'active' : ''} onClick={() => onClickTab('Notification')}>
                        <FaBell />
                        Notification
                    </li>
                    <li className={activeTab === 'Message' ? 'active' : ''} onClick={() => onClickTab('Message')}>
                        <FaEnvelope />
                        Message
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;

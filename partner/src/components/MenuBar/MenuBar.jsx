/* eslint-disable react/prop-types */
import { useState } from 'react';
import './MenuBar.css';
import { FaThLarge, FaCalendarAlt, FaHome, FaEnvelope, FaBroom, FaBox, FaDollarSign, FaStar, FaConciergeBell } from 'react-icons/fa'; // Import icons

const MenuBar = ({ onTabChange }) => {
  // State to manage the active tab
  const [activeTab, setActiveTab] = useState('Expenses');

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
          <li className={activeTab === 'Reservation' ? 'active' : ''} onClick={() => onClickTab('Reservation')}>
            <FaCalendarAlt />
            Reservation
          </li>
          <li className={activeTab === 'Hotels' ? 'active' : ''} onClick={() => onClickTab('Hotels')}>
            <FaHome />
            Hotels
          </li>
          <li className={activeTab === 'Concierge' ? 'active' : ''} onClick={() => onClickTab('Concierge')}>
            <FaConciergeBell />
            FABS
          </li>
          <li className={activeTab === 'Messages' ? 'active' : ''} onClick={() => onClickTab('Messages')}>
            <FaEnvelope />
            Messages
            <span className="notification-badge">5</span>
          </li>
          <li className={activeTab === 'Housekeeping' ? 'active' : ''} onClick={() => onClickTab('Housekeeping')}>
            <FaBroom />
            Housekeeping
          </li>
          <li className={activeTab === 'Inventory' ? 'active' : ''} onClick={() => onClickTab('Inventory')}>
            <FaBox />
            Inventory
          </li>
          <li className={activeTab === 'Calendar' ? 'active' : ''} onClick={() => onClickTab('Calendar')}>
            <FaCalendarAlt />
            Calendar
          </li>
          <li className={activeTab === 'Financials' ? 'active' : ''} onClick={() => onClickTab('Financials')}>
            <FaDollarSign />
            Financials
          </li>
          <ul className="submenu">
            <li className={activeTab === 'Invoice' ? 'active' : ''} onClick={() => onClickTab('Invoice')}>
              Invoice
            </li>
            <li className={activeTab === 'Expenses' ? 'active' : ''} onClick={() => onClickTab('Expenses')}>
              <span className="highlight">Expenses</span>
            </li>
          </ul>
          <li className={activeTab === 'Reviews' ? 'active' : ''} onClick={() => onClickTab('Reviews')}>
            <FaStar />
            Reviews
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default MenuBar;

/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import "./Header.css";
import profile_icon from "../../assets/profile_icon.png";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { CiViewList, CiSettings, CiLogout } from "react-icons/ci"; // Import icons from react-icons
import { AiOutlineSchedule } from "react-icons/ai"; // Import icons from react-icons
import { useNavigate } from 'react-router-dom'

const Header = ({setShowLogin}) => {
  const [token, setToken] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [menuVisible, setMenuVisible] = useState(false); // State for menu visibility
  const menuRef = useRef(null); // Reference for the menu
  const navigate = useNavigate();
  const onClick = (tab) => {
    setActiveTab(tab);
    navigate('/user-service', { state: { tab }, replace: true }); // Gửi tab qua state
    setMenuVisible(false);
  };

  const toggleMenu = () => {

    setMenuVisible(!menuVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the click is outside the menu and the menu is visible, hide it
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuVisible(false);
      }
    };

    // Add event listener when the menu is visible
    if (menuVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Clean up event listener on component unmount or when menuVisible changes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuVisible]);



  return (
    <div className="header">
      <div className="logo">
        <h1>VCompass</h1>
      </div>

      <div className="header-right">
        <ul className="header-menu">
          <Link to="/" className="">Home</Link>
          <Link to="/about" className="">About Us</Link>
          <Link to="/booking" className="">Booking</Link>
          <Link to="/partnership" className="">Partnership</Link>
          <Link to="/help" className="">Help</Link>
        </ul>

        {/* Chờ chèn token vào  */}
        {!token ?   <button onClick={()=>setShowLogin(true)}>Sign in</button>: 
          <div className="header-profile" ref={menuRef}>
            <div className="profile-section" onClick={toggleMenu}>
              <img src={profile_icon} alt="Profile" className="profile-pic" />
            </div>

            {/* Menu that appears on profile image click */}
            {menuVisible && (
              <div className="profile-menu" >
                <div className="profile-name">
                  <img src={profile_icon} alt="Profile" className="profile-pic" />
                   <h3>Phạm Thành </h3>
                </div>
                
                <hr></hr>
                <ul className="menu">
                  <li 
                    onClick={() => onClick('booking')}>
                    <CiViewList /> My Booking
                  </li>
                  <li 
                    onClick={() => onClick('account')}>
                    <CiSettings /> My Account
                  </li>
                  <li 
                    onClick={() => onClick('schedule')}>
                    <AiOutlineSchedule /> My Schedule
                  </li>
                  <hr />
                  <li 
                    onClick={() => onClick('logout')}>
                    <CiLogout /> Log Out
                  </li>
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

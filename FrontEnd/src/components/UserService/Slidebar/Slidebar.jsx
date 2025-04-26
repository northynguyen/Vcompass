/* eslint-disable no-unused-vars */
import React from 'react';
import { useState, useContext } from 'react';
import { CiViewList, CiSettings, CiLogout } from "react-icons/ci";
import { AiOutlineSchedule } from "react-icons/ai";
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../../Context/StoreContext';
import './Slidebar.css';
// eslint-disable-next-line react/prop-types
const Sidebar = ({ activeTab, onTabChange, img }) => {
    const navigate = useNavigate();
    const { url, token, user, setToken } = useContext(StoreContext);
    const onClick = (tab) => {
        onTabChange(tab);
        navigate(`/user-service/${tab}`, { state: { tab }, replace: true });
    };

    return (
        <div className="my-account-sidebar">
            <div className="profile-section">
                <img 
                    src={user.avatar && user.avatar.includes('http') ? user.avatar : user.avatar ? `${url}/images/${user.avatar}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                    alt="Profile" className="profile-pic" 
                    onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = 'https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg';
                    }}
                />
                <div className="profile-name">{user.name}</div>
                <div className="priority-status">Bronze Priority</div>
            </div>
            <ul className="menu">
                <li
                    className={activeTab === 'booking' ? 'active-tab' : ''}
                    onClick={() => onClick('booking')}>
                    <CiViewList /> Booking của tôi
                </li>
                <li
                    className={activeTab === 'account' ? 'active-tab' : ''}
                    onClick={() => onClick('account')}>
                    <CiSettings /> Tài khoản
                </li>
                <li
                    className={activeTab === 'schedule' ? 'active-tab' : ''}
                    onClick={() => onClick('schedule')}>
                    <AiOutlineSchedule /> Đã lưu
                </li>
                {/* <hr />
                <li className={activeTab === 'logout' ? 'active-tab' : ''}
                    onClick={() => onClick('logout')}>
                    <CiLogout /> Log Out
                </li> */}
            </ul>
        </div>
    );
};
export default Sidebar;

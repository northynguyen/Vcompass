/* eslint-disable no-unused-vars */
import React from 'react';
import { useState } from 'react';
import { CiViewList ,CiSettings , CiLogout } from "react-icons/ci";
import { AiOutlineSchedule } from "react-icons/ai";
import { useNavigate } from 'react-router-dom';
import './Slidebar.css';
// eslint-disable-next-line react/prop-types
const Sidebar = ({ activeTab, onTabChange , img} ) => {
    const navigate = useNavigate();
    const onClick = (tab) => {
        onTabChange(tab);
        navigate(`/user-service/${tab}`, { state: { tab } ,replace: true });
    };

    return (
        <div className="my-account-sidebar">
            <div className="profile-section">
                {img?
                <img src={img} alt="Profile" className="profile-pic" />
                : <div className="profile-pic">PT</div>}
                
               
                <div className="profile-name">Phạm Thành</div>
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
                <hr />
                <li  className={activeTab === 'logout' ? 'active-tab' : ''} 
                    onClick={() => onClick('logout')}>
                    <CiLogout /> Log Out
                </li>
            </ul>
        </div>
    );
};
export default Sidebar;

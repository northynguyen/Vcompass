import React from "react";
import logo from '../../assets/logo.png';
import "./Loading.css"; // Tạo file CSS riêng hoặc dùng Tailwind nếu có
const Loading = ({ title }) => {
    return (
        <div className="loading-screen">
            <div className="logo-container">
                <img src={logo} alt="Logo" className="logo" />
                <div className="spinner" />
                <p className="loading-title">{title}</p>
            </div>
        </div>
    );
};

export default Loading;

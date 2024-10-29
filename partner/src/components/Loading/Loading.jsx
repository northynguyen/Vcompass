import React from 'react';
import './Loading.css'; // Tạo file CSS cho component

const Loading = ({ size = '50px', color = '#000' }) => {
    return (
        <div className="loading-spinner" style={{ width: size, height: size, borderColor: `${color} transparent ${color} transparent` }} />
    );
};

export default Loading;


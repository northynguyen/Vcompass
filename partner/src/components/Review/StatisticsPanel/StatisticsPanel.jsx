import React from 'react';
import { FaStar, FaChartBar, FaConciergeBell, FaUtensils } from 'react-icons/fa';
import './StatisticsPanel.css';

const StatisticsPanel = ({ ratings }) => {
    const totalReviews = ratings.length;
    const avgStarRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating.rate, 0) / ratings.length : 0;

    return (
        <div className="statistics-panel">
            <div className="stat">
                <FaChartBar className="stat-icon" />
                <h4>Tổng lượt đánh giá</h4>
                <p>{totalReviews}</p>
            </div>
            <div className="stat">
                <FaStar className="stat-icon" />
                <h4>Đánh giá trung bình</h4>
                <p>{avgStarRating.toFixed(1)} / 5.0</p>
            </div>
        </div>
    );
};

export default StatisticsPanel;
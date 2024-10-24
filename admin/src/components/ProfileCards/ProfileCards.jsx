import React, { useState, useContext } from 'react';
import './ProfileCards.css';
import { useNavigate } from 'react-router-dom';
const ProfileCards = ({ user }) => {
    const navigate = useNavigate();
    const handleNavigate = () => {
        // Navigate to the profile details page and pass user data through state
        navigate(`/users/user`, { state: { user } });
    };
    return (
        <div className="profile-card">
            <div className="profile-avatar" onClick={handleNavigate}>
                <img src={user.avatar} alt={user.name} />
            </div>
            <div className="profile-info">
                <h2 onClick={handleNavigate}>{user.name}</h2>
                <div className="info-container">
                    <p><strong>Gender:</strong> {user.gender}</p>
                    <p><strong>Date of Birth:</strong> {new Date(user.date_of_birth).toLocaleDateString()}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Phone:</strong> {user.phone_number}</p>
                    <p><strong>Address:</strong> {user.address}</p>
                    <p><strong>Account Created:</strong> {new Date(Date.parse(user.createdAt)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>
        </div>
    );

};

export default ProfileCards;

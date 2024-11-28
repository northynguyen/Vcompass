import React from 'react';
import './ProfileCards.css';
import { useNavigate } from 'react-router-dom';


const ProfileCards = ({ profile, type }) => {
    const navigate = useNavigate();

    const handleNavigate = () => {
        // Navigate to the appropriate profile details page based on the type
        const baseUrl = type === 'user' ? `/users/user/` : `/partners/partner/`;
        navigate(baseUrl, { state: { profile } }); // Giữ nguyên để truyền profile
    };

    return (
        <div className="profile-card">
            <div className="profile-avatar" onClick={handleNavigate}>
                <img src={profile.avatar} alt={profile.name} />
            </div>
            <div className="profile-info">
                <h2 onClick={handleNavigate}>{profile.name}</h2>
                <div className="info-container">
                    <p><strong>Gender:</strong> {profile.gender}</p>
                    <p><strong>Date of Birth:</strong> {new Date(profile.date_of_birth).toLocaleDateString()}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Phone:</strong> {profile.phone_number}</p>
                    <p><strong>Address:</strong> {profile.address}</p>
                    <p><strong>Account Created:</strong> {new Date(Date.parse(profile.createdAt)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

        </div>
    );
};

export default ProfileCards;

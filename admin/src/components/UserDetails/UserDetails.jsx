import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import './UserDetails.css';

const ProfileDetails = () => {
    const location = useLocation();
    // Check if the user data is passed via state, fallback to an empty object if not
    const user = location.state?.user;

    if (!user) {
        return <div>Error: No user data available</div>;
    }
    console.log(user._id);
    return (
        <div className="profile-details">
            <h1>{user.name}</h1>
            <div className="profile-avatar">
                <img src={user.avatar} alt={user.name} />
            </div>
            <div className="profile-info">
                <p><strong>Gender:</strong> {user.gender}</p>

                <p><strong>Date of Birth:</strong> {new Date(user.date_of_birth).toLocaleDateString()}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone_number}</p>
                <p><strong>Address:</strong> {user.address}</p>
                <p><strong>Account Created:</strong> {new Date(Date.parse(user.createdAt)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
        </div>
    );
};

export default ProfileDetails;

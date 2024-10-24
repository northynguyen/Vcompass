import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import './PartnerDetails.css';
const PartnerDetails = () => {
    const location = useLocation();
    // Check if the user data is passed via state, fallback to an empty object if not
    const partner = location.state?.profile;

    if (!partner) {
        return <div>Error: No Partner data available</div>;
    }
    console.log(partner._id);
    return (
        <div className="profile-details">
            <h1>{partner.name}</h1>
            <div className="profile-avatar">
                <img src={partner.avatar} alt={partner.name} />
            </div>
            <div className="profile-info">
                <p><strong>Gender:</strong> {partner.gender}</p>

                <p><strong>Date of Birth:</strong> {new Date(partner.date_of_birth).toLocaleDateString()}</p>
                <p><strong>Email:</strong> {partner.email}</p>
                <p><strong>Phone:</strong> {partner.phone_number}</p>
                <p><strong>Address:</strong> {partner.address}</p>
                <p><strong>Account Created:</strong> {new Date(Date.parse(partner.createdAt)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
        </div>
    );
};

export default PartnerDetails;

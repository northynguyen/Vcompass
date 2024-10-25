import React from 'react';
import { useLocation } from 'react-router-dom';
import './PartnerDetails.css';

const PartnerDetails = () => {
    const location = useLocation();
    const partner = location.state?.profile;

    if (!partner) {
        return <div>Error: No Partner data available</div>;
    }

    return (
        <div className="partner-details">
            <h1>{partner.name}</h1>
            <div className="partner-avatar">
                <img src={partner.avatar} alt={partner.name} />
            </div>
            <div className="partner-info">
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

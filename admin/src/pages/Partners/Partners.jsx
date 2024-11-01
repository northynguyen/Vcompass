// Partner.js
import React, { useState, useEffect, useContext } from 'react';
import ProfileCards from '../../components/ProfileCards/ProfileCards';
import './Partners.css';
import { StoreContext } from '../../Context/StoreContext';

const Partner = () => {
    const [partners, setPartners] = useState([]);
    const { url } = useContext(StoreContext);

    useEffect(() => {
        // Fetch partners from the API
        fetch(`${url}/api/user/partners/getall`)
            .then(response => response.json())
            .then(data => setPartners(data))
            .catch(error => console.error('Error fetching partners:', error));
    }, [url]);
    return (
        <div className="partners-container">
            {partners.map((partner, index) => (
                <ProfileCards
                    key={index}
                    profile={partner} // Pass partner as profile
                    type="partner" // Specify type as partner
                />
            ))}
        </div>
    );
}

export default Partner;

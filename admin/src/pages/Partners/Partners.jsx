// Partner.js
import React, { useContext, useEffect, useState } from 'react';
import ProfileCards from '../../components/ProfileCards/ProfileCards';
import { StoreContext } from '../../Context/StoreContext';
import './Partners.css';

const Partner = () => {
    const [partners, setPartners] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { url } = useContext(StoreContext);

    useEffect(() => {
        // Fetch partners from the API
        fetch(`${url}/api/user/partners/`)
            .then(response => response.json())
            .then(data => setPartners(data))
            .catch(error => console.error('Error fetching partners:', error));
    }, [url]);
    const filteredPartners = searchTerm
        ? partners.filter(partner =>
            partner.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : partners;
    return (
        <div className="partners-container">
            <h2 className="main-title">Quản lý nhà cung cấp</h2>
            <input
                type="text"
                placeholder="Tìm theo tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />
            {filteredPartners.map((partner, index) => (
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

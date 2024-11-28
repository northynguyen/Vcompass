import React, { useContext, useEffect, useState } from 'react';
import './AttractionsCards.css';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';

const AttractionsCards = () => {
    const { url } = useContext(StoreContext);
    const [attractions, setAttractions] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchAttractions = async () => {
            try {
                const response = await axios.get(`${url}/api/attractions`);
                setAttractions(response.data.attractions);

            } catch (error) {
                console.error('Error fetching attractions:', error);
            }
        };
        fetchAttractions();
    }, [url]);
    const onClick = (serviceId) => {
        const encryptedServiceId = CryptoJS.AES.encrypt(serviceId, 'mySecretKey').toString();
        const safeEncryptedServiceId = encodeURIComponent(encryptedServiceId);
        navigate(`/place-details/attraction/${safeEncryptedServiceId}`);
        window.scrollTo(0, 0);
    };
    return (
        <div className="accomodation-cards">
            <h2>Danh sách điểm đến</h2>
            <div className="card-list">
                {attractions.map((item) => {
                    return (
                        <div key={item._id} className="accomodation-card-home">
                            <div className='card-content-container'>
                                <div className='card-content-img' onClick={() => onClick(item._id)}>
                                    <img src={`${url}/images/${item.images[0]}`} alt={item.attractionName} />
                                </div>
                                <div className='card-content'>
                                    <h3 onClick={() => onClick(item._id)}>{item.attractionName}</h3>
                                    <a href={`https://www.google.com/maps/?q=${item.location.latitude},${item.location.longitude}`}>{item.location.address}</a>
                                    <p>{item.description}</p>
                                </div>
                                <div className='card-content-price'>
                                    <p>{item.price > 0 ? `${item.price} VND` : 'Free'}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AttractionsCards;

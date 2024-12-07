import React, { useContext, useEffect, useState } from 'react';
import './AccomodationCards.css';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';

const AccomodationCards = ({ accommodationsFound, startDay, endDay, adults, children }) => {
    const { url } = useContext(StoreContext);
    const [accomodations, setAccomodations] = useState([]);
    const navigate = useNavigate();
    const filterData = { startDay, endDay, adults, children };
    useEffect(() => {
        setAccomodations(accommodationsFound);
    }, [url, accommodationsFound]);

    const onClick = (serviceId) => {
        const encryptedServiceId = CryptoJS.AES.encrypt(serviceId, 'mySecretKey').toString();
        const safeEncryptedServiceId = encodeURIComponent(encryptedServiceId);
        navigate(`/place-details/accommodation/${safeEncryptedServiceId}`, { state: { filterData } });
        window.scrollTo(0, 0);
    };

    return (
        <div className="accomodation-cards">
            <h2>Danh sách khách sạn</h2>
            {accomodations.length === 0 && <p>Không tìm thấy khách sạn</p>}
            <div className="card-list">
                {accomodations.map((item) => {
                    const prices = item.roomTypes.map(room => room.pricePerNight);
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);

                    return (
                        <div key={item._id} className="accomodation-card-home">
                            <div className='card-content-container'>
                                <div className='card-content-img' onClick={() => onClick(item._id)}>
                                    <img src={`${url}/images/${item.images[0]}`} alt={item.name} />
                                </div>
                                <div className='card-content'>
                                    <h3 onClick={() => onClick(item._id)}>{item.name}</h3>
                                    <a href={`https://www.google.com/maps/?q=${item.location.latitude},${item.location.longitude}`}>{item.location.address}</a>
                                    <p>{item.description}</p>
                                </div>
                                <div className='card-content-price'>
                                    <p>{minPrice} - {maxPrice}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AccomodationCards;
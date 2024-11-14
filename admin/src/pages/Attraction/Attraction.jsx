import React, { useState, useEffect, useContext } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './Attraction.css';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';

const Attraction = ({ data }) => {
    const navigate = useNavigate();
    const { url } = useContext(StoreContext);
    console.log(data._id);
    const handleEdit = () => {
        navigate(`/attraction/details`, { state: { attractionData: data, } });
    }
    const handleDelete = () => {
        try {
            axios.delete(`${url}/api/attractions/${data._id}`);
            window.location.reload();
        } catch (err) {
            console.log(err);
        }
    }
    return (

        <div className="attraction-card">

            <div className="image-container" onClick={handleEdit}>
                <img src={data.images[0]} alt={data.attractionName} />
            </div>
            <div className="content">
                <h3 onClick={handleEdit}>{data.attractionName}</h3>
                <p>{data.description}</p>
                <div className='info'>
                    <a href='#'><strong>Location:</strong> {data.location.address}</a>
                    <p><strong>City:</strong> {data.city}</p>
                    <p><strong>Price:</strong> {data.price > 0 ? `${data.price} VND` : 'Free'}</p>
                    <p>
                        <strong>Operating Hours:</strong> {data.operatingHours[0].openTime} - {data.operatingHours[0].closeTime}
                    </p>
                    <p><strong>Amenities:</strong> {data.amenities.join(', ')}</p>
                </div>
            </div>
            <div className='actions'>
                <button onClick={handleEdit}><FaEdit /></button>
                <button onClick={handleDelete}> <FaTrash /></button>
            </div>
        </div>
    );
};



const AttractionList = () => {
    const navigate = useNavigate();
    const handleEdit = () => {
        navigate(`/attraction/details`, { state: { attractionData: "", } });
    }
    const [attractions, setAttractions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { url } = useContext(StoreContext);


    useEffect(() => {
        const fetchAttractions = async () => {
            try {
                const response = await fetch(`${url}/api/attractions/`);
                const data = await response.json();

                if (data.success) {
                    setAttractions(data.attractions); // assuming the response includes an `attractions` array
                } else {
                    setError("Failed to load attractions.");
                }
            } catch (err) {
                console.error("Error fetching attractions:", err);
                setError("An error occurred while fetching attractions.");
            } finally {
                setLoading(false);
            }
        };

        fetchAttractions();
    }, [url]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    return (
        <div className="">
            <button className='button-add' onClick={handleEdit}>Thêm địa điểm mới</button>
            {attractions.map(attraction => (
                <Attraction
                    key={attraction._id}
                    data={attraction}

                />
            ))}
        </div>
    );
};

export default AttractionList;

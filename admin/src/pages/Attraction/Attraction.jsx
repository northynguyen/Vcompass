import React, { useState, useEffect, useContext } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './Attraction.css';
import {  useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import Pagination from '../../components/Pagination/Pagination';
import { toast } from 'react-toastify';

const Attraction = ({ data }) => {
    const navigate = useNavigate();
    const { url } = useContext(StoreContext);
    
    const handleEdit = () => {
        navigate(`/attraction/details`, { state: { attractionData: data } });
    };

    const handleDelete = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa địa điểm này?')) {
            try {
                await axios.delete(`${url}/api/attractions/${data._id}`);
                window.location.reload();
            } catch (err) {
                console.error('Error deleting attraction:', err);
                toast.error('Có lỗi xảy ra khi xóa địa điểm');
            }
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    return (
        <div className="attraction-card">
            <div className="image-container" onClick={handleEdit}>
                <img 
                    src={data.images[0].includes('http') ? data.images[0] : `${url}/images/${data.images[0]}`} 
                    alt={data.attractionName}
                />
            </div>
            <div className="content">
                <h3 onClick={handleEdit}>{data.attractionName}</h3>
                <p>{data.description}</p>
                <div className="info">
                    <p>
                        <i className="fas fa-map-marker-alt"></i>
                        <strong>Địa điểm:</strong> {data.location.address}
                    </p>
                    <p>
                        <i className="fas fa-city"></i>
                        <strong>Thành phố:</strong> {data.city}
                    </p>
                    <p>
                        <i className="fas fa-tag"></i>
                        <strong>Giá:</strong> {data.price > 0 ? formatPrice(data.price) : 'Miễn phí'}
                    </p>
                    <p>
                        <i className="fas fa-clock"></i>
                        <strong>Giờ mở cửa:</strong> {data.operatingHours[0].openTime} - {data.operatingHours[0].closeTime}
                    </p>
                </div>
            </div>
            <div className="actions">
                <button onClick={handleEdit}>
                    <FaEdit /> Chỉnh sửa
                </button>
                <button onClick={handleDelete}>
                    <FaTrash /> Xóa
                </button>
            </div>
        </div>
    );
};

const AttractionList = () => {
    const navigate = useNavigate();
    const { url } = useContext(StoreContext);
    
    const [attractions, setAttractions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 9;

    const handleEdit = () => {
        navigate(`/attraction/details`, { state: { attractionData: "" } });
    };

    useEffect(() => {
        fetchAttractions();
    }, [currentPage, url]);

    const fetchAttractions = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${url}/api/attractions?page=${currentPage}&limit=${itemsPerPage}`
            );
            const data = await response.json();

            if (data.success) {
                setAttractions(data.attractions);
                setTotalPages(data.totalPages);
                setTotalItems(data.total);
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

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="attraction-list-container">
            <div className="attraction-list-header">
                <h1>Danh sách địa điểm tham quan</h1>
                <button className='button-add' onClick={handleEdit}>
                    Thêm địa điểm mới
                </button>
            </div>

            <div className="attractions-grid">
                {attractions.map(attraction => (
                    <Attraction
                        key={attraction._id}
                        data={attraction}
                    />
                ))}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
            />
        </div>
    );
};

export default AttractionList;

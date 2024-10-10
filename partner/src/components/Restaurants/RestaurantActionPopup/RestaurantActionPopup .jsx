/* eslint-disable react/prop-types */
// src/components/FABS/RestaurantActionPopup/RestaurantActionPopup.js
import  { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './RestaurantActionPopup.css';

Modal.setAppElement('#root'); // Quan trọng để accessibility

const RestaurantActionPopup = ({ action, restaurant, isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        description: '',
        image: null,
        amenities: [],
       contactNumber: '',
       email: '',
        website: '',
    });

    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (restaurant && (action === 'edit' || action === 'view')) {
            setFormData({
                name: restaurant.name || '',
                location: restaurant.location.address || '',
                description: restaurant.description || '',
                image: null, // Không thay đổi hình ảnh khi chỉnh sửa
                amenities: restaurant.amenities || [],
                contactNumber: restaurant.contactNumber || '',
                email: restaurant.email || '',
                website: restaurant.website || '',
            });
            setImagePreview(restaurant.images[0] || null);
        } else if (action === 'add') {
            setFormData({
                name: '',
                location: '',
                description: '',
                image: null,
                amenities: [],
                contactNumber: '',
                email: '',
                website: '',
            });
            setImagePreview(null);
        }
    }, [restaurant, action]);

    const handleChange = (e) => {
        const { name, value } = e.target;
       
            setFormData({
                ...formData,
                [name]: value,
            });
        
    };

    const handleAmenitiesChange = (e) => {
        const { value, checked } = e.target;
        setFormData((prevData) => {
            const amenities = checked
                ? [...prevData.amenities, value]
                : prevData.amenities.filter((amenity) => amenity !== value);
            return { ...prevData, amenities };
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Kiểm tra dữ liệu
        if (!formData.name || !formData.location || !formData.description || (!formData.image && action === 'add')) {
            alert('Vui lòng điền đầy đủ các trường yêu cầu.');
            return;
        }

        // Chuẩn bị dữ liệu để gửi
        const submittedData = {
            ...formData,
            image: imagePreview, // Trong thực tế, bạn nên tải ảnh lên server và lưu URL
        };

        onSubmit(submittedData);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Restaurant Action"
            className="modal"
            overlayClassName="overlay"
        >
            {action === 'add' && <h2>Thêm Nhà Hàng/Quán Nước Mới</h2>}
            {action === 'edit' && <h2>Chỉnh Sửa Nhà Hàng/Quán Nước</h2>}
            {action === 'view' && <h2>Xem Chi Tiết Nhà Hàng/Quán Nước</h2>}
            {action === 'lock' && <h2>Khóa Nhà Hàng/Quán Nước</h2>}

            {(action === 'add' || action === 'edit') && (
                <form onSubmit={handleSubmit} className="restaurant-action-form">
                    <label>
                        Tên Nhà Hàng/Quán Nước:
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={action === 'view'}
                        />
                    </label>

                    <label>
                        Địa Điểm:
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            disabled={action === 'view'}
                        />
                    </label>

                    <label>
                        Mô Tả:
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            disabled={action === 'view'}
                        />
                    </label>

                    <label>
                        Hình Ảnh:
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={action === 'view'}
                        />
                    </label>

                    {imagePreview && (
                        <div className="image-preview">
                            <img src={imagePreview} alt="Preview" />
                        </div>
                    )}

                    <label>
                        Tiện Nghi:
                        <div className="amenities-checkboxes">
                            <label>
                                <input
                                    type="checkbox"
                                    value="Free Wi-Fi"
                                    checked={formData.amenities.includes('Free Wi-Fi')}
                                    onChange={handleAmenitiesChange}
                                    disabled={action === 'view'}
                                />
                                Free Wi-Fi
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    value="Breakfast Included"
                                    checked={formData.amenities.includes('Breakfast Included')}
                                    onChange={handleAmenitiesChange}
                                    disabled={action === 'view'}
                                />
                                Breakfast Included
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    value="Swimming Pool"
                                    checked={formData.amenities.includes('Swimming Pool')}
                                    onChange={handleAmenitiesChange}
                                    disabled={action === 'view'}
                                />
                                Swimming Pool
                            </label>
                            {/* Thêm các tiện nghi khác nếu cần */}
                        </div>
                    </label>

                    <label>
                        Số Điện Thoại:
                        <input
                            type="text"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleChange}
                            disabled={action === 'view'}
                        />
                    </label>

                    <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={action === 'view'}
                        />
                    </label>

                    <label>
                        Website:
                        <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            disabled={action === 'view'}
                        />
                    </label>

                    <div className="form-buttons">
                        {action !== 'view' && <button type="submit" className="save-button">Lưu</button>}
                        <button type="button" onClick={onClose} className="cancel-button">Đóng</button>
                    </div>
                </form>
            )}

            {action === 'lock' && restaurant && (
                <div className="lock-popup">
                    <p>Bạn có chắc chắn muốn khóa nhà hàng/quán nước <strong>{restaurant.name}</strong> không?</p>
                    <div className="form-buttons">
                        <button onClick={() => { onSubmit(); onClose(); }} className="save-button">Có</button>
                        <button onClick={onClose} className="cancel-button">Không</button>
                    </div>
                </div>
            )}

            {action === 'view' && restaurant && (
                <div className="view-popup">
                    <img src={restaurant.images[0]} alt={restaurant.name} className="restaurant-image-view" />
                    <h3>{restaurant.name}</h3>
                    <p><strong>Địa Điểm:</strong> {restaurant.location.address}</p>
                    <p><strong>Mô Tả:</strong> {restaurant.description}</p>
                    <p><strong>Tiện Nghi:</strong> {restaurant.amenities.join(', ')}</p>
                    <p><strong>Liên Hệ:</strong> {restaurant.contactNumber} | {restaurant.email}</p>
                    <p><strong>Website:</strong> <a href={restaurant.website} target="_blank" rel="noopener noreferrer">{restaurant.website}</a></p>
                    <div className="form-buttons">
                        <button type="button" onClick={onClose} className="cancel-button">Đóng</button>
                    </div>
                </div>
            )}
        </Modal>
    );

};

export default RestaurantActionPopup;

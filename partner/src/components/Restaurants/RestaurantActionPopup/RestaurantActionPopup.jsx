/* eslint-disable react/prop-types */
// src/components/FABS/RestaurantActionPopup/RestaurantActionPopup.js
import  { useEffect } from 'react';
import Modal from 'react-modal';
import './RestaurantActionPopup.css';

Modal.setAppElement('#root'); // For accessibility

const RestaurantActionPopup = ({ action, restaurant, isOpen, onClose, onSubmit }) => {
    useEffect(() => {
        if (restaurant && action === 'lock') {
            // Additional logic if needed
        }
    }, [restaurant, action]);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Restaurant Lock Action"
            className="modal"
            overlayClassName="overlay"
        >
            { restaurant && (
                <div className="lock-popup">
                    <h2>{action === 'lock' ? 'Khóa Nhà Hàng' : 'Mở khóa'} </h2>
                    {action === 'lock'? <p>Bắc có chắc chắn muốn khóa nhà hàng <strong>{restaurant.name}</strong> không?</p>
                    : <p>Bắc có chắc chắn muốn mở nhà hàng/quán nước <strong>{restaurant.name}</strong>?</p>}
                    <div className="form-buttons">
                        <button onClick={() => { onSubmit(); onClose(); }} className="save-button">Có</button>
                        <button onClick={onClose} className="cancel-button">Không</button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default RestaurantActionPopup;

import React, { useEffect, useState, useContext } from 'react';
import './BookingFinalStep.css';
import Modal from 'react-modal';
import { FaLock } from 'react-icons/fa';
import { StoreContext } from '../../../Context/StoreContext';
import {toast} from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const BookingModal = ({ isOpen, onRequestClose, bookingDetails , onSubmit}) => {
    Modal.setAppElement('#root');
    
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Booking Details"
            className="booking-modal"
            overlayClassName="booking-modal-overlay"
        >
            <button className="close-button" onClick={onRequestClose}>×</button>
            
            <h2>{bookingDetails.hotel.name}</h2>
            <a 
                className="location" 
                href={`https://www.google.com/maps/?q=${bookingDetails.hotel.location.latitude},${bookingDetails.hotel.location.longitude}`} 
                target="_blank" 
                rel="noopener noreferrer"
                >
                {bookingDetails.hotel.location.address}
            </a>
            
            <div className="booking-info">
                <p><strong>Total length of stay:</strong> {bookingDetails.bookingInfo.diffDays + 1} night(s), {bookingDetails.bookingInfo.adults} adults</p>
                
                <div className="dates">
                    <div>
                        <strong>Check-in</strong>
                        <p>{bookingDetails.bookingInfo.startDate}</p>
                        <span>From 14:00</span>
                    </div>
                    <div>
                        <strong>Check-out</strong>
                        <p>{bookingDetails.bookingInfo.endDate}</p>
                        <span>Until 12:00</span>
                    </div>
                </div>
                
                <div className="room-details">
                    
                        <p >
                            1× {bookingDetails.room.nameRoomType} <br />
                            <span className="free-cancellation">Free cancellation anytime</span>
                        </p>
    
                </div>
                
                <div className="price-section">
                    <p>Price</p>
                    <p className="total-price">{bookingDetails.bookingInfo.totalPrice.toLocaleString()} VND</p>
                </div>
                
                <p className="info-text">
                    * This price is converted to show you the approximate cost in VND. The exchange rate may change before you pay.
                    Bear in mind that your card issuer may charge you a foreign transaction fee.
                </p>
            </div>

            <button className="confirm-button" onClick={() => {alert("Booking confirmed!") , onSubmit}}>
                <FaLock />
                Looks good, complete my booking!
            </button>
        </Modal>
    );
};

const BookingFinalStep = ({bookingDetails}) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const {url} = useContext(StoreContext);
    const navigate = useNavigate();
    const handleSubmit = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"))
            const response = await fetch(`${url}/api/bookings/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user._id, // Replace with the actual user ID
                    partnerId: bookingDetails.hotel.idPartner,
                    accommodationId: bookingDetails.hotel._id,
                    roomId: bookingDetails.room._id,
                    checkInDate: bookingDetails.bookingInfo.startDate,
                    checkOutDate: bookingDetails.bookingInfo.endDate,
                    numberOfGuests: {
                        adult: bookingDetails.bookingInfo.adults,
                        child: bookingDetails.bookingInfo.children
                    },
                    totalAmount: bookingDetails.bookingInfo.totalPrice,
                    specialRequest: "Late check-in", // You can change this based on user input if needed
                    guestInfo: {
                        name: bookingDetails.bookingInfo.firstName + " " + bookingDetails.bookingInfo.lastName, // Replace with actual guest name
                        email: bookingDetails.bookingInfo.email, // Replace with actual guest email
                        phone: bookingDetails.bookingInfo.phoneNumber,
                        nationality: bookingDetails.bookingInfo.country, // Replace with actual guest phone
                    },
                    createdAt: new Date().toISOString() // Current date/time
                }),
            });

            if (response.ok) {
                const bookingConfirmation = await response.json();
                toast.success("Booking created successfully");
                console.log("Booking created successfully:", bookingConfirmation);
                navigate('/user-service/booking', { state: { tab: 'booking', send: true }, replace: true });
                
            } else {
                console.error("Failed to create booking:", response.statusText);
                toast.error("Failed to create booking " );
            }
        } catch (error) {
            console.error("Error while creating booking:", error);
            toast.error("Error while creating booking " );  
        }
    };


   
    return (
        <div className="final-step-container">
            <h2 className="title">No payment details required</h2>
            <p>Your payment will be handled by Joi Hospitality - Hoang Anh, so you don’t need to enter any payment details for this booking.</p>

            <div className="checkbox-group">
                <input type="checkbox" id="marketing-emails" />
                <label htmlFor="marketing-emails">I consent to receiving marketing emails from Booking.com, including promotions, personalised recommendations, rewards, travel experiences and updates about Booking.com’s products and services.</label>
            </div>

            <div className="checkbox-group">
                <input type="checkbox" id="transport-emails" />
                <label htmlFor="transport-emails">I consent to receiving marketing emails from Booking.com, including promotions, personalised recommendations, rewards, travel experiences and updates about Booking.com Transport Limited’s products and services.</label>
            </div>

            <p className="note">By signing up, you let us tailor offers and content to your interests by monitoring how you use Booking.com through tracking technologies. Unsubscribe at any time. Read our <a href="#">privacy policy</a>.</p>

            <p>Your booking is with Joi Hospitality - Hoang Anh directly and by completing this booking you agree to the <a href="#">booking conditions</a>, <a href="#">general terms</a>, and <a href="#">privacy policy</a>.</p>

            <div className="button-container">
                <button className="button" onClick={() => setModalIsOpen(true)}>Check your booking</button>
                <button className="button" onClick={handleSubmit} >Complete booking</button>
            </div>

            <BookingModal 
                isOpen={modalIsOpen} 
                onRequestClose={() => setModalIsOpen(false)} 
                bookingDetails={bookingDetails} 
                onSubmit={handleSubmit}
            />

            <p className="note"><a href="#">What are my booking conditions?</a></p>
        </div>
    );
};

export default BookingFinalStep;

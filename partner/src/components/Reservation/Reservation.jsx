import './Reservation.css';
import ReservationList from './ReservationList/ReservationList';
import GuestProfile from './GuestProfile/GuestProfile';
import { useState } from 'react';

const Reservation = () => {
    const [selectedReservation, setSelectedReservation] = useState(null);

    const handleReservationSelect = (reservationData) => {
        setSelectedReservation(reservationData);
    };

    const handleBack = () => {
        setSelectedReservation(null);
    };

    return (
        <div className="reservation-container">
            {!selectedReservation ? (
                <ReservationList onReservationSelect={handleReservationSelect} />
            ) : (
                <GuestProfile selectedReservation={selectedReservation} onBack={handleBack} />
            )}
        </div>
    );
};

export default Reservation;

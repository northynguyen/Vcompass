/* eslint-disable react/prop-types */
import { useState } from 'react';
import './ReservationList.css';


const ReservationList = ({ onReservationSelect }) => {

  const guestData = {
    profile: {
      name: "Pham Thanh",
      membershipId: "G011-987654321",
      phone: "+1 (555) 789-1234",
      email: "angus.copper@example.com",
      dateOfBirth: "June 15, 1985",
      gender: "Male",
      nationality: "American",
      loyaltyProgram: {
        status: "Platinum Member",
        pointsBalance: "15,000 points",
      },
    },
    bookingInfo: {
      bookingId: "LG-B00109",
      roomType: "Deluxe",
      roomNumber: "101",
      pricePerNight: "$150/night",
      guests: "2 Adults",
      checkIn: {
        date: "June 19, 2024",
        time: "1:45 PM",
      },
      checkOut: {
        date: "June 22, 2024",
        time: "11:45 AM",
      },
      duration: "3 nights",
      requests: "Late Check-Out, Extra pillows and towels",
      specialAmenities: ["Complimentary breakfast", "Free Wi-Fi", "Access to gym and pool"],
      transportation: "Airport pickup arranged",
    },
    roomInfo: {
      size: "35 m²",
      bed: "King Bed",
      guests: "2 guests",
    },
    priceSummary: {
      roomAndOffer: "$450.00",
      extras: "$0.00",
      vat: "$36.00",
      cityTax: "$49.50",
      totalPrice: "$535.50",
    },
    bookingHistory: [
      {
        bookingId: "LG-B00109",
        bookingDate: "June 09, 2028",
        roomType: "Deluxe",
        roomNumber: "Room 101",
        checkIn: "June 19, 2024, 1:45 PM",
        checkOut: "June 21, 2024, 11:45 AM",
        guests: "2 Guests",
      },
      {
        bookingId: "LG-B00085",
        bookingDate: "March 20, 2028",
        roomType: "Suite",
        roomNumber: "Room 305",
        checkIn: "March 25, 2028, 1:45 PM",
        checkOut: "March 30, 2028, 11:45 AM",
        guests: "3 Guests",
      },
    ],
  };
  
  const [reservations, setReservations] = useState([
    {
      guest: 'Angus Copper',
      room: 'Deluxe 101',
      request: 'Late Check-Out',
      duration: '3 nights',
      checkIn: 'June 19, 2028',
      checkOut: 'June 22, 2028',
      status: 'Confirmed',
    },
    {
      guest: 'Catherine Lopp',
      room: 'Standard 202',
      request: 'None',
      duration: '2 nights',
      checkIn: 'June 19, 2028',
      checkOut: 'June 21, 2028',
      status: 'Confirmed',
    },
    {
      guest: 'Edgar Irving',
      room: 'Suite 303',
      request: 'Extra Pillows',
      duration: '5 nights',
      checkIn: 'June 19, 2028',
      checkOut: 'June 24, 2028',
      status: 'Pending',
    },
  ]);

  const handleStatusChange = (index, newStatus) => {
    const updatedReservations = [...reservations];
    updatedReservations[index].status = newStatus;
    setReservations(updatedReservations);
  };

  return (
    <div className="reservation-list">
      <div className="reservation-header">
        <h2>Reservation List</h2>
        <div className="filters">
          <input type="text" placeholder="Search guest, status, etc." />
          <select>
            <option>All Status</option>
            <option>Confirmed</option>
            <option>Pending</option>
            <option>Cancelled</option>
          </select>
          <input type="date" />
          <button className="add-booking-btn">Add Booking</button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Guest</th>
            <th>Room</th>
            <th>Request</th>
            <th>Duration</th>
            <th>Check-In & Check-Out</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation, index) => (
            <tr key={index} >
              <td>{reservation.guest}</td>
              <td>{reservation.room}</td>
              <td>{reservation.request}</td>
              <td>{reservation.duration}</td>
              <td>
                {reservation.checkIn} - {reservation.checkOut}
              </td>
              <td>
                <span
                  className={`status-label ${
                    reservation.status === 'Confirmed'
                      ? 'confirmed'
                      : reservation.status === 'Pending'
                      ? 'pending'
                      : 'cancelled'
                  }`}
                >
                  {reservation.status}
                </span>
              </td>
              <td>
                <button
                  className="action-btn view"
                  onClick={() => onReservationSelect(guestData)} // Pass the selected reservation to the parent
                >
                  👁
                </button>
                <button
                  className="action-btn edit"
                  onClick={() => alert('Editing reservation')}
                >
                  ✏️
                </button>
                {reservation.status === 'Pending' ? (
                  <button
                    className="action-btn confirm"
                    onClick={() => handleStatusChange(index, 'Confirmed')}
                  >
                    Confirm
                  </button>
                ) : (
                  <button
                    className="action-btn cancel"
                    onClick={() => handleStatusChange(index, 'Cancelled')}
                  >
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationList;

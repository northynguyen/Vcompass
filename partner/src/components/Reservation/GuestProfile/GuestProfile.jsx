import React, { useState, useEffect,useContext } from "react";
import './GuestProfile.css';
import axios from "axios";
import {StoreContext} from "../../../Context/StoreContext"

const GuestProfile = ({ selectedReservation, onBack }) => {

  const [bookingHistory, setBookingHistory] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [accommodationName, setAccommodationName] = useState(null);  // State to store accommodation name
  const {url} = useContext(StoreContext);

  useEffect(() => {
    console.log("Selected Reservation ID:", selectedReservation._id);
    const fetchBookingHistory = async () => {
      try {
        const response = await fetch(`${url}/api/bookings/user/${selectedReservation.userId}/booking-history`);
        const data = await response.json();
        const updatedHistory = await Promise.all(data.bookingHistory.map(async (history) => {
          const roomResponse = await fetch(`${url}/api/accommodations/${history.accommodationId}/rooms`);
          const roomData = await roomResponse.json();
          const room = roomData.rooms.find(room => room._id === history.roomId);

          // Update booking history with roomType name and accommodation name
          return {
            ...history,
            nameRoomType: room ? room.nameRoomType : "Unknown",
            accommodationName: roomData.accommodation ? roomData.accommodation.name : "Unknown",
          };
        }));

        setBookingHistory(updatedHistory);  // Set the fetched and updated booking history
      } catch (error) {
        console.error("Error fetching booking history:", error);
      }
    };

    const fetchRoomInfo = async () => {
      try {
        const response = await axios.get(`${url}/api/accommodations/${selectedReservation.accommodationId}/rooms`);
        
        if (response.data.success) {
          console.log("Room Info:", response.data.rooms);
          const room = response.data.rooms.find(room => room._id === selectedReservation.roomId);
          setRoomInfo(room);
          setAccommodationName(room.accommodationName);  // Store accommodation name
        } else {
          console.error("Error fetching room info:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching room info:", error);
      }
    };

    fetchRoomInfo();
    fetchBookingHistory();
  }, [selectedReservation, url]);
  
  // Re-run if userId changes
  if (!selectedReservation || !bookingHistory || !roomInfo) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="guest-profile-container">
      <div className="guest-profile-header">
        <button onClick={onBack}>← Back to Reservations</button>
      </div>
      <div className="guest-profile">
        {/* Profile Section */}
        <div className="profile">
          <div className="profile-info">
            <img
              src="https://via.placeholder.com/96"
              alt="Guest"
              className="profile-photo"
            />
            <h2>{selectedReservation.guestInfo.name}</h2>
            <hr />
            <div className="contact-info">
              <p><strong>Phone:</strong> {selectedReservation.guestInfo.phone}</p>
              <p><strong>Email:</strong> {selectedReservation.guestInfo.email}</p>
              <p><strong>Nationality:</strong> {selectedReservation.guestInfo.nationality}</p>
            </div>
          </div>
          
        </div>

        {/* Booking Info Section */}
        <div className="booking-info">
          <h3>Booking Info</h3>
          <p><strong>Booking ID:</strong> {selectedReservation._id}</p>
          <p><strong>Guests:</strong> {selectedReservation.numberOfGuests.adult} Adult and {selectedReservation.numberOfGuests.child} Children</p>
          <p><strong>Check-In:</strong> {new Date(selectedReservation.checkInDate).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })} , Check in at 14:00</p>
          <p><strong>Check-Out:</strong> {new Date(selectedReservation.checkOutDate).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric'})}, Check out at 12:00</p>
          <p><strong>Duration:</strong> {selectedReservation.duration} days</p>
          <p><strong>Requests:</strong> {selectedReservation.specialRequest}</p>
          <div className="loyalty-program">
            <h3>Booking status</h3>
            <p><strong>Status:</strong> {selectedReservation.status}</p>
            {selectedReservation.status === 'cancelled' && (
              <div className="cancellation-info">
                <h3>Cancellation Information</h3>
                <p><strong>Reason:</strong> {selectedReservation.cancellationReason}</p>
                {selectedReservation.additionalComments && (
                  <p><strong>Comments:</strong> {selectedReservation.additionalComments}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Room Info Section */}
        <div className="room-info">
          <h3>Room Info</h3>
          <img
            src={roomInfo.images && `${url}/images/${roomInfo.images[0]}` || "https://via.placeholder.com/1024x768"}
            alt="Room"
            className="room-photo"
          />
          <p><strong>Name:</strong> {roomInfo.nameRoomType}</p>
          <p><strong>Size:</strong> {roomInfo.roomSize} m<sup>2</sup></p>
          <p><strong>Bed:</strong> {roomInfo.numBed.map((bed) => `${bed.nameBed} - ${bed.number}`).join(", ")}</p>
          <p><strong>Guests:</strong> {roomInfo.numPeople.adult} adults, {roomInfo.numPeople.child} children</p>
          <p><strong>Description:</strong> {roomInfo.description}</p>
          <p style={{ color: "#ff23322", fontWeight: "bold", fontSize: "20px"}}><strong>Price:</strong> { new Intl.NumberFormat().format(roomInfo.pricePerNight)} VND</p>
        </div>

        {/* Price Summary Section */}
        <div className="price-summary">
          <h3>Price Summary</h3>
          <p><strong>Room and offer:</strong> {new Intl.NumberFormat().format(roomInfo.pricePerNight)} VND x {selectedReservation.duration} nights</p>
          <p><strong>Extras:</strong> 0 VND </p>
          <p><strong>VAT:</strong> {new Intl.NumberFormat().format(roomInfo.pricePerNight * selectedReservation.duration * 0.08)} VND </p>
          <p><strong>Total Price:</strong> {new Intl.NumberFormat().format(selectedReservation.totalAmount)} VND</p>
        </div>

        {/* Booking History Section */}
        <div className="booking-history">
          <h3>Booking History</h3>
          {bookingHistory.length === 0 ? (
            <p>No booking history available.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Booking Date</th>
                  <th>Room Type</th>
                  <th>Accommodation Name</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Guests</th>
                </tr>
              </thead>
              <tbody>
                {bookingHistory.map((history, index) => (
                  <tr key={index}>
                    <td>{history.bookingId}</td>
                    <td>{history.createdAt}</td>
                    <td>{history.nameRoomType}</td> {/* Display nameRoomType */}
                    <td>{history.accommodationName}</td> {/* Display accommodationName */}
                    <td>{new Date(history.checkInDate).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    <td>{new Date(history.checkOutDate).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}</td> 
                    <td>{history.numberOfGuests.adult} adult + {history.numberOfGuests.child} child</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestProfile;

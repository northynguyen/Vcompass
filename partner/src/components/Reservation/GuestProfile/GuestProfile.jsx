/* eslint-disable react/prop-types */

import './GuestProfile.css';

const GuestProfile = ({ guestData, onBack }) => {
  const { profile, bookingInfo, roomInfo, priceSummary, bookingHistory } = guestData;

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
            src={profile.photoUrl || "https://via.placeholder.com/96"}
            alt="Guest"
            className="profile-photo"
          />
          <h2>{profile.name}</h2>
          <p>{profile.membershipId}</p>
          <hr />
          <div className="contact-info">
            <p><strong>Phone:</strong> {profile.phone}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Nationality:</strong> {profile.nationality}</p>
          </div>
        </div>
        <div className="loyalty-program">
          <h3>Loyalty Program</h3>
          <p><strong>Membership Status:</strong> {profile.loyaltyProgram.status}</p>
          <p><strong>Points Balance:</strong> {profile.loyaltyProgram.pointsBalance}</p>
        </div>
      </div>

      {/* Booking Info Section */}
      <div className="booking-info">
        <h3>Booking Info</h3>
        <p><strong>Booking ID:</strong> {bookingInfo.bookingId}</p>
        <p><strong>Room Type:</strong> {bookingInfo.roomType}</p>
        <p><strong>Price:</strong> {bookingInfo.pricePerNight}</p>
        <p><strong>Guests:</strong> {bookingInfo.guests}</p>
        <p><strong>Check-In:</strong> {bookingInfo.checkIn.date}, {bookingInfo.checkIn.time}</p>
        <p><strong>Check-Out:</strong> {bookingInfo.checkOut.date}, {bookingInfo.checkOut.time}</p>
        <p><strong>Duration:</strong> {bookingInfo.duration}</p>
        <p><strong>Requests:</strong> {bookingInfo.requests}</p>
        <p><strong>Amenities:</strong> {bookingInfo.specialAmenities.join(", ")}</p>
        <p><strong>Transportation:</strong> {bookingInfo.transportation}</p>
      </div>

      {/* Room Info Section */}
      <div className="room-info">
        <h3>Room Info</h3>
        <img
          src={roomInfo.imageUrl || "https://via.placeholder.com/1024x768"}
          alt="Room"
          className="room-photo"
        />
        <p><strong>Size:</strong> {roomInfo.size}</p>
        <p><strong>Bed:</strong> {roomInfo.bed}</p>
        <p><strong>Guests:</strong> {roomInfo.guests}</p>
      </div>

      {/* Price Summary Section */}
      <div className="price-summary">
        <h3>Price Summary</h3>
        <p><strong>Room and offer:</strong> {priceSummary.roomAndOffer}</p>
        <p><strong>Extras:</strong> {priceSummary.extras}</p>
        <p><strong>VAT:</strong> {priceSummary.vat}</p>
        <p><strong>City Tax:</strong> {priceSummary.cityTax}</p>
        <p><strong>Total Price:</strong> {priceSummary.totalPrice}</p>
      </div>

      {/* Booking History Section */}
      <div className="booking-history">
        <h3>Booking History</h3>
        <table>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Booking Date</th>
              <th>Room Type</th>
              <th>Room Number</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Guests</th>
            </tr>
          </thead>
          <tbody>
            {bookingHistory.map((history, index) => (
              <tr key={index}>
                <td>{history.bookingId}</td>
                <td>{history.bookingDate}</td>
                <td>{history.roomType}</td>
                <td>{history.roomNumber}</td>
                <td>{history.checkIn}</td>
                <td>{history.checkOut}</td>
                <td>{history.guests}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default GuestProfile;

import React, { useState } from 'react';
import './Rooms.css'; // Import the CSS file

const roomData = [
  {
    id: 1,
    type: 'Standard',
    size: '25 m²',
    bed: '2 Queen Beds',
    guests: '2 guests',
    availability: '22/30 Rooms',
    price: '$100/night',
    status: 'Occupied',
  },
  {
    id: 2,
    type: 'Deluxe',
    size: '35 m²',
    bed: '1 King Bed',
    guests: '2 guests',
    availability: '18/25 Rooms',
    price: '$150/night',
    status: 'Available',
  },
  {
    id: 3,
    type: 'Suite',
    size: '50 m²',
    bed: '1 King Bed',
    guests: '3 guests',
    availability: '8/10 Rooms',
    price: '$250/night',
    status: 'Available',
  },
  {
    id: 4,
    type: 'Family',
    size: '45 m²',
    bed: '2 Queen Beds',
    guests: '4 guests',
    availability: '12/15 Rooms',
    price: '$200/night',
    status: 'Occupied',
  },
  {
    id: 5,
    type: 'Single',
    size: '20 m²',
    bed: '1 Single Bed',
    guests: '1 guest',
    availability: '17/20 Rooms',
    price: '$70/night',
    status: 'Available',
  },
];

const Rooms = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setIsEditing(false); // Reset editing state
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Logic to save changes goes here
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="rooms-container">
      <div className="rooms-list">
        <h2 className="rooms-list-title">Rooms</h2>
        {roomData.map((room) => (
          <div
            key={room.id}
            className={`room-card ${room.status === 'Occupied' ? 'occupied' : 'available'}`}
            onClick={() => handleRoomSelect(room)}
          >
            <img
              src="https://via.placeholder.com/150"
              alt={room.type}
              className="room-image"
            />
            <h3 className="room-type">{room.type}</h3>
            <p className="room-details">{room.size} • {room.bed} • {room.guests}</p>
            <p className="room-availability">Availability: {room.availability}</p>
            <p className="price">{room.price}</p>
            <p className={`status ${room.status.toLowerCase()}`}>{room.status}</p>
          </div>
        ))}
      </div>

      <div className="room-detail">
        {selectedRoom ? (
          <>
            <h2 className="room-detail-title">{selectedRoom.type} Room</h2>
            {isEditing ? (
              <div className="edit-form">
                <label>
                  Room Type:
                  <input type="text" defaultValue={selectedRoom.type} />
                </label>
                <label>
                  Size:
                  <input type="text" defaultValue={selectedRoom.size} />
                </label>
                <label>
                  Bed:
                  <input type="text" defaultValue={selectedRoom.bed} />
                </label>
                <label>
                  Guests:
                  <input type="text" defaultValue={selectedRoom.guests} />
                </label>
                <label>
                  Price:
                  <input type="text" defaultValue={selectedRoom.price} />
                </label>
                <div className="edit-buttons">
                  <button onClick={handleSave}>Save</button>
                  <button onClick={handleCancel}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <p className="room-detail-size"><strong>Size:</strong> {selectedRoom.size}</p>
                <p className="room-detail-bed"><strong>Bed:</strong> {selectedRoom.bed}</p>
                <p className="room-detail-guests"><strong>Guests:</strong> {selectedRoom.guests}</p>
                <p className="room-detail-price"><strong>Price:</strong> {selectedRoom.price}</p>
                <p className="room-detail-status"><strong>Status:</strong> {selectedRoom.status}</p>
                <button onClick={handleEditClick}>Edit</button>
              </>
            )}
          </>
        ) : (
          <p className="select-room-message">Select a room to see details.</p>
        )}
      </div>
    </div>
  );
};

export default Rooms;

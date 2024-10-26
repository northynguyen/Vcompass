/* eslint-disable react/prop-types */

const RoomCard = ({ room, handleRoomClick ,url}) => {
  return (
    <div className="room-card">
      <div className="room-image">
        {room.images.length > 0 ? (
          <img src={`${url}/images/${room.images[0]}`} alt={room.nameRoomType} className="room-image" />
        ) : (
          <p>No image available</p>
        )}

        <button className="details-btn" onClick={(e) => handleRoomClick(room, e)}>
          See Room Details
        </button>

      </div>

      <div className="room-details">
        <h3>{room.nameRoomType}</h3>

        <div className="room-options">
          <p>Without Breakfast</p>
          <p>Non-refundable</p>
          <p>Your child can stay for free</p>
        </div>

        <div className="room-info">
          <div className="room-size">
            <span>🏠</span> {room.roomSize} m²
          </div>
          <div className="room-beds-guests">
            <span>🛏️</span>
            {room.numBed.map((bed, index) => (
              <span key={index}>
                {bed.number} {bed.nameBed}
                {index < room.numBed.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
          <div className="room-guests">
            <span>👥</span> {room.numPeople.adult} adults, {room.numPeople.child} children
          </div>
        </div>
      </div>
      <div className='room-left'>
        <div className="room-price">
            <p>
              <span>💲</span> <s>{(room.pricePerNight * 1.2).toLocaleString()}</s> VND
            </p>
            <p>
              <strong>{room.pricePerNight.toLocaleString()} VND</strong> per night
            </p>
          </div>

          <button className="book-room-btn" onClick={(e) => e.preventDefault()}>
            Choose
          </button>
        </div>
    </div>
  );
};

export default RoomCard;

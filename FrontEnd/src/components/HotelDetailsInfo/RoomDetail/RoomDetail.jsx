/* eslint-disable react/prop-types */
import  { useState, useContext } from 'react';
import './RoomDetail.css'; // Ensure the CSS file styles the carousel properly
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";
import { StoreContext } from '../../../Context/StoreContext';

const RoomDetail = ({ room, onClose,handleRoomSelect }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const {url} = useContext(StoreContext)
  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handleNextClick = () => {
    setSelectedImageIndex((prevIndex) => (prevIndex + 1) % room.images.length);
  };

  const handleBackClick = () => {
    setSelectedImageIndex((prevIndex) => (prevIndex - 1 + room.images.length) % room.images.length);
  };

  return (
    <div className="room-detail-modal">
      <div className="room-detail-content">
        <button className="close-button" onClick={onClose}>×</button>
        
        {/* Room Image Carousel */}
        <div className="room-detail-image">
            
                <button className="back-btn" onClick={handleBackClick}><IoIosArrowDropleft/></button>
                <img src={`${url}/images/${room.images[selectedImageIndex]}`} alt={room.nameRoomType} className="main-room-image" />
                <button className="next-btn" onClick={handleNextClick}><IoIosArrowDropright/></button>
            
         
          <div className="room-thumbnails">
            {room.images.map((image, index) => (
              <img
                key={index}
                src={`${url}/images/${image}`}
                alt={`Thumbnail ${index + 1}`}
                className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                onClick={() => handleImageClick(index)}
              />
            ))}
          </div>
        </div>

        {/* Room Information */}
        <div className="room-detail-info">
          <h3>{room.nameRoomType}</h3>
          <div className="room-info">
            <p>🏠 {room.roomSize} m²</p>
            <p>👥 {room.numPeople.adult} adults, {room.numPeople.child} children</p>
            <div className="room-beds-guests">
            <span>🛏️</span>
            {room.numBed.map((bed, index) => (
              <span key={index}>
                {bed.number} {bed.nameBed}
                {index < room.numBed.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
          </div>
            
          <div className="room-features">
            <h4>Room Features You May Like</h4>
            {room.amenities.map((amenity, index) => (
              <p key={index}>✔️ {amenity}</p>
            ))}
          </div>
          
          <div className="room-price">
            <p> <strong>{room.pricePerNight.toLocaleString()} VND</strong> per night</p>
          </div>
          
          <button className="booking-now-btn" onClick={(e) => handleRoomSelect(e ,room)}>Booking Now</button>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;

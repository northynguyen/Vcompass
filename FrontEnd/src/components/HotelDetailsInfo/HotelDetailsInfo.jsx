/* eslint-disable react/prop-types */
import './HotelDetailsInfo.css';
import React,{ useState , useRef, useEffect} from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ImagesModal from '../ImagesModal/ImagesModal';
import RoomDetail from './RoomDetail/RoomDetail';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import RoomCard from './RoomCard'; // Nhập RoomCard từ file mới


const HotelDetailsInfo = ({serviceId}) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);
  const [numRooms, setNumRooms] = useState(1);
  const { url } = React.useContext(StoreContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [accommodation, setAccommodation] = useState(null);

  
  useEffect(() => {
    console.log("useEffect called"); // Log khi useEffect được gọi
  }, []); // Không có phụ thuộc

  useEffect(() => {
    let isMounted = true; // Track if the component is mounted
    const fetchAccommodation = async () => {
      try {
        const response = await axios.get(`${url}/api/accommodations/`);
        console.log("API Response:", response.data); // Log the entire response for debugging
        const accommodationData = response.data.accommodations.find((accommodation) => accommodation._id === serviceId);
        if (isMounted) {
          if (accommodationData) {
            setAccommodation(accommodationData);
          } else {
            console.error('Accommodation not found for serviceId:', serviceId);
          }
        }
      } catch (error) {
        console.error('Error fetching accommodation:', error);
      }
    };

    fetchAccommodation();

    return () => {
      isMounted = false; // Cleanup function to set isMounted to false
    };
  }, [serviceId, url]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowGuestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  console.log("Accommodation",accommodation);


  const calculateNights = (start, end) => {
    if (!start || !end) return '';  
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} night(s)`;
  };
  

  const handleRoomClick = (room,e) => {
    e.preventDefault();
    setSelectedRoom(room);
  };

  const handleRoomClose = () => {
    setSelectedRoom(null);
  };

  // Handle click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowGuestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  // Open Modal and set the clicked image
  const openModal = (index) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  // Close the Modal
  const closeModal = () => {
    setIsModalOpen(false);
   
  };


  const handleButtonClick = (action, type, event) => {
    event.preventDefault(); // Ngăn việc tải lại trang
    event.stopPropagation(); // Ngăn đóng dropdown
  
    if (type === 'adults') {
      setAdults((prev) => (action === 'increment' ? prev + 1 : Math.max(1, prev - 1)));
    } else if (type === 'children') {
      setChildren((prev) => (action === 'increment' ? prev + 1 : Math.max(0, prev - 1)));
    } else if (type === 'rooms') {
      setNumRooms((prev) => (action === 'increment' ? prev + 1 : Math.max(1, prev - 1)));
    }
  };
  
  if (!accommodation) {
    return <div>Loading...</div>;
  }

  return (
    <div className="hotel-details-info">
      {/* Search Bar */}
      <form className="search-form-hotel" onSubmit={(e) => e.preventDefault()}>
        {/* Ô nhập vị trí */}
        <div className="search-item">
          <span role="img" aria-label="location">📍</span>
          <input type="text" placeholder="Milan Homestay - The Song Vung Tau" />
        </div>

        {/* Chọn ngày */}
        <div className="search-item">
          <span role="img" aria-label="calendar">📅</span>
          <DatePicker
            selected={startDate}
            onChange={(update) => setDateRange(update)}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            placeholderText="Chọn ngày"
          />
          {startDate && endDate && (
            <span>{calculateNights(startDate, endDate)}</span>
          )}
        </div>

        {/* Số người và phòng */}
        <div className="search-item" onClick={() => setShowGuestDropdown(!showGuestDropdown)}>
          <span role="img" aria-label="people">👥</span>
          <input
            type="text"
            value={`${adults} người lớn, ${children} trẻ em, ${numRooms} phòng`}
            readOnly
          />
          {showGuestDropdown && (
            <div className="guest-dropdown" ref={dropdownRef}>
              <div className="guest-option">
                <span>Người lớn</span>
                <button onClick={(e) => handleButtonClick('decrement', 'adults', e)}>-</button>
                <span>{adults}</span>
                <button onClick={(e) => handleButtonClick('increment', 'adults', e)}>+</button>
              </div>
              <div className="guest-option">
                <span>Trẻ em</span>
                <button onClick={(e) => handleButtonClick('decrement', 'children', e)}>-</button>
                <span>{children}</span>
                <button onClick={(e) => handleButtonClick('increment', 'children', e)}>+</button>
              </div>
              <div className="guest-option">
                <span>Phòng</span>
                <button onClick={(e) => handleButtonClick('decrement', 'rooms', e)}>-</button>
                <span>{numRooms}</span>
                <button onClick={(e) => handleButtonClick('increment', 'rooms', e)}>+</button>
              </div>

              <button onClick={() => setShowGuestDropdown(false)}>Xong</button>
            </div>
          )}
        </div>

        {/* Nút tìm kiếm */}
        <button type="submit" className="search-btn">Tìm kiếm</button>
      </form>

      {/* Left Column: Hotel Details */}
      <div className="tour-details">
        <h1>{accommodation.name}</h1>
        <p>{accommodation.city} ★★★★☆ (348 reviews)</p>

        {/* Image Gallery */}
        <div className="gallery">
          <div className="main-image">
            <img src={`${url}/images/${accommodation.images[0]}`} alt="Main" className="main-img" />
          </div>
          <div className="thumbnails">
            {accommodation.images.slice(1).map((img, index) => {
              if (index < 5) {
                return (
                  <img
                    key={index}
                    src={`${url}/images/${img}`}
                    alt={`Thumb ${index + 1}`}
                    className="thumbnail-img"
                    onClick={() => openModal(index + 1)}
                  />
                );
              } else if (index === 5) {
                return (
                  <div
                    key={index}
                    className="thumbnail-img overlay"
                    onClick={() => openModal(index + 1)}
                    style={{ position: 'relative', cursor: 'pointer' }}
                  >
                    <img
                      src={img}
                      alt={`Thumb ${index + 1}`}
                      style={{ filter: 'blur(2px)', opacity: 0.7 }}
                    />
                    <div className="overlay-text">
                      See All Photos
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Features */}
        <div className="features">
          {accommodation.amenities.map((amenity, index) => (
            <p key={index}>✔️ {amenity}</p>
          ))}
        </div>

        {/* Description */}
        <div className="description">
          <h3>Description</h3>
          <p>{accommodation.description}</p>
        </div>

        {/* Embed Google Map */}
        <div className="map">
          <h3 style={{ marginBottom: '20px' }}>Location</h3>
          <iframe
            title="map"
            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao&q=${accommodation.location.latitude},${accommodation.location.longitude}`}
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>

      {/* Rooms Section */}
      <div className="rooms-section">
        <h2>Available Rooms</h2>
        {accommodation.roomTypes.map((room, index) => (
          <RoomCard key={index} room={room} handleRoomClick={handleRoomClick} url={url} />
        ))}
      </div>


      {/* Modal for displaying clicked images */}
      <ImagesModal
        isOpen={isModalOpen}
        images={accommodation.images}
        selectedIndex={selectedImageIndex}
        onClose={closeModal}
      />

    {selectedRoom && <RoomDetail room={selectedRoom} onClose={handleRoomClose} />}
    </div>
  );
};




export default HotelDetailsInfo;




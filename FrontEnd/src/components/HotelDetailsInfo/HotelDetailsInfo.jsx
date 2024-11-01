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
import { useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate();
  const [dataSend, setDataSend] = useState({ bookingInfo :{
    startDate: null,
    endDate: null,
    adults: 2,
    children: 0,
    diffDays: ""}
  })

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
  }, [serviceId]);

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

  

  const calculateNights = (start, end) => {
    if (!start || !end) return '';  
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays ;
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

 

  const handleSearch = async () => {
    setIsModalOpen(false);
    const options = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
    if (!startDate || !endDate) {
      alert('Please select a check-in and check-out date');
      return;
    }
    // Update bookingInfo state
    setDataSend({
      ...dataSend,
      bookingInfo: {
        ...dataSend.bookingInfo,
        startDate: startDate.toLocaleDateString('en-GB', options),
        endDate: endDate.toLocaleDateString('en-GB', options),
        adults,
        children,
        diffDays: calculateNights(startDate, endDate),
      }
    });
  
    try {
      // Call API to get available rooms
      const response = await axios.get(`${url}/api/bookings/getAvailableRoom`, {
        params: {
          accommodationId: serviceId,
          startDate: startDate.toISOString().split('T')[0], // Chỉ lấy phần ngày
          endDate: endDate.toISOString().split('T')[0],     // Chỉ lấy phần ngày
          adults,
          children
        }
      });
  
      // Log response for debugging
      console.log("Available Rooms:", serviceId, startDate.toISOString(), endDate.toISOString());
      setAccommodation((prev) => ({
        ...prev,
        roomTypes: response.data.availableRooms
      }));
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      alert("Unable to find available rooms for the selected dates.");
    }
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

  const handleRoomSelect = (e, room) => {
    e.preventDefault();
  
    // Update the state using the functional form
    setDataSend((prevDataSend) => ({
      ...prevDataSend,
      hotel: accommodation,
      room: room,
    }));

    if (!startDate || !endDate) {
      setSelectedRoom(null);
      window.scrollTo(0, 0);
      alert('Please select a check-in and check-out date');
      
      return;
    }
    
    // Navigate to the new route
    navigate(`/booking-process/step2`, { state: { dataSend: { ...dataSend, hotel: accommodation, room: room } } });
  
    // Scroll to the top of the page
    window.scrollTo(0, 0);
  };
  

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
            monthsShown={2}
            placeholderText="Chọn ngày"
            dateFormat="dd/MM/yyyy"
        
          />
          {startDate && endDate && (
            <span> &nbsp;&nbsp;{calculateNights(startDate, endDate)} nights</span>
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
                <span className='num'>{adults}</span>
                <button onClick={(e) => handleButtonClick('increment', 'adults', e)}>+</button>
              </div>
              <div className="guest-option">
                <span>Trẻ em</span>
                <button onClick={(e) => handleButtonClick('decrement', 'children', e)}>-</button>
                <span className='num'>{children}</span>
                <button onClick={(e) => handleButtonClick('increment', 'children', e)}>+</button>
              </div>
              <div className="guest-option">
                <span>Phòng</span>
                <button onClick={(e) => handleButtonClick('decrement', 'rooms', e)}>-</button>
                <span className='num'>{numRooms}</span>
                <button onClick={(e) => handleButtonClick('increment', 'rooms', e)}>+</button>
              </div>

              <button className="ok-btn" onClick={() => setShowGuestDropdown(false)}>Xong</button>
            </div>
          )}
        </div>

        {/* Nút tìm kiếm */}
        <button type="submit" className="search-btn" onClick={handleSearch}>Tìm kiếm</button>
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
        {accommodation.roomTypes?.map((room, index) => (
          <RoomCard key={index} room={room} handleRoomClick={handleRoomClick} url={url} handleRoomSelect={handleRoomSelect} />
        ))}
      </div>


      {/* Modal for displaying clicked images */}
      <ImagesModal
        isOpen={isModalOpen}
        images={accommodation.images}
        selectedIndex={selectedImageIndex}
        onClose={closeModal}
      />

    {selectedRoom && <RoomDetail room={selectedRoom} onClose={handleRoomClose}  handleRoomSelect={handleRoomSelect}/>}
    </div>
  );
};




export default HotelDetailsInfo;




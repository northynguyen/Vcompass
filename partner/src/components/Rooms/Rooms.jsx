/* eslint-disable react/prop-types */
// src/components/Hotels/Rooms/Rooms.js
import  { useState } from 'react';
import './Rooms.css';
import { FaPlus, FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';

const initialRoomData = [
  {
    id: 1,
    type: 'Standard',
    size: '25 m²',
    bed: '2 Queen Beds',
    guests: '2 guests',
    amenities: ['Wi-Fi', 'Breakfast Included'],
    price: '$100/night',
    status: 'Occupied',
    images: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150'],
  },
  {
    id: 2,
    type: 'Deluxe',
    size: '35 m²',
    bed: '1 King Bed',
    guests: '2 guests',
    amenities: ['Wi-Fi', 'Breakfast Included', 'Gym Access'],
    price: '$150/night',
    status: 'Available',
    images: ['https://via.placeholder.com/150'],
  },
  // Thêm các phòng khác nếu cần
];

const Rooms = ({ onBack}) => {
  const [rooms, setRooms] = useState(initialRoomData);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 6;

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setIsEditing(false);
    setIsAdding(false);
  };

  const handleBackClick = () => {
    onBack();
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleDeleteClick = (roomId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng này không?')) {
      setRooms(rooms.filter((room) => room.id !== roomId));
      setSelectedRoom(null);
    }
  };

  const handleSave = (updatedRoom) => {
    const updatedRooms = rooms.map((room) =>
      room.id === updatedRoom.id ? updatedRoom : room
    );
    setRooms(updatedRooms);
    setSelectedRoom(updatedRoom);
    setIsEditing(false);
  };

  const handleAddClick = () => {
    setIsAdding(true);
    setSelectedRoom(null);
    setIsEditing(false);
  };

  const handleAddSave = (newRoom) => {
    const newRoomWithId = { ...newRoom, id: rooms.length > 0 ? rooms[rooms.length - 1].id + 1 : 1 };
    setRooms([...rooms, newRoomWithId]);
    setIsAdding(false);
    setSelectedRoom(newRoomWithId);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
  };

  // Phân trang
  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = rooms.slice(indexOfFirstRoom, indexOfLastRoom);
  const totalPages = Math.ceil(rooms.length / roomsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="rooms-container">
     
      <div className="rooms-list">
        <button className="back-button" onClick={handleBackClick}>
          <FaArrowLeft /> Back to Hotels
        </button>
        <div className="rooms-header">
        
          <h2>Rooms</h2>
          <button className="add-room-button" onClick={handleAddClick}>
            <FaPlus /> Thêm Phòng Mới
          </button>
        </div>
        <div className="rooms-cards">
          {currentRooms.map((room) => (
            <div
              key={room.id}
              className={`room-card ${room.status === 'Occupied' ? 'occupied' : 'available'}`}
              onClick={() => handleRoomSelect(room)}
            >
              <img
                src={room.images[0] || 'https://via.placeholder.com/150'}
                alt={room.type}
                className="room-image"
              />
              <h3 className="room-type">{room.type}</h3>
              <p className="room-details">{room.size} • {room.bed} • {room.guests}</p>
              <p className="room-availability"> Availability: {room.amenities.join(', ')}</p>
              <p className="price">{room.price} $/night</p>
              <p className={`status ${room.status.toLowerCase()}`}>{room.status}</p>
            </div>
          ))}
        </div>
        {/* Phân Trang */}
        {totalPages > 1 && (
          <div className="pagination">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => paginate(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="room-detail">
        {isAdding ? (
          <AddEditRoomForm onSave={handleAddSave} onCancel={handleCancel} />
        ) : selectedRoom ? (
          <div className="room-detail-content">
            <div className="room-detail-header">
              <h2>{selectedRoom.type} Room</h2>
              <div className="room-detail-actions">
                <button onClick={handleEditClick} className="edit-button">
                  <FaEdit /> Chỉnh Sửa
                </button>
                <button onClick={() => handleDeleteClick(selectedRoom.id)} className="delete-button">
                  <FaTrash /> Xóa
                </button>
              </div>
            </div>
            {isEditing ? (
              <AddEditRoomForm room={selectedRoom} onSave={handleSave} onCancel={handleCancel} />
            ) : (
              <div className="room-detail-info">
                <div className="room-images">
                  {selectedRoom.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`${selectedRoom.type} ${idx + 1}`} className="detail-image" />
                  ))}
                </div>
                <p><strong>Size:</strong> {selectedRoom.size}</p>
                <p><strong>Bed:</strong> {selectedRoom.bed}</p>
                <p><strong>Guests:</strong> {selectedRoom.guests}</p>
                <p><strong>Price:</strong> {selectedRoom.price} $/night</p>
                <p><strong>Status:</strong> {selectedRoom.status}</p>
                <p><strong>Amenities:</strong> {selectedRoom.amenities.join(', ')}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="select-room-message">Select a room to see details.</p>
        )}
      </div>
    </div>
  );
};

const AddEditRoomForm = ({ room = {}, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type: room.type || '',
    size: room.size || '',
    bed: room.bed || '',
    guests: room.guests || '',
    amenities: room.amenities || [],
    price: room.price || 0,
    status: room.status || 'Available',
    images: room.images || [],
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState(room.images || []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAmenitiesChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevData) => {
      const amenities = checked
        ? [...prevData.amenities, value]
        : prevData.amenities.filter((amenity) => amenity !== value);
      return { ...prevData, amenities };
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imagePreviews.length > 8) {
      alert('Bạn chỉ có thể chọn tối đa 8 hình ảnh.');
      return;
    }
    setImageFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...previews]);
  };

  const handleImageRemove = (index) => {
    const updatedPreviews = imagePreviews.filter((_, idx) => idx !== index);
    setImagePreviews(updatedPreviews);
    setImageFiles(imageFiles.filter((_, idx) => idx !== index));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedRoom = {
      ...room,
      ...formData,
      images: imagePreviews,
    };
    onSave(updatedRoom);
  };

  return (
    <form className="add-edit-form" onSubmit={handleSubmit}>
      <label>
        Room Type:
        <select name="type" value={formData.type} onChange={handleChange} required>
          <option value="Single">Single</option>
          <option value="Double">Double</option>
          <option value="Suite">Suite</option>
          <option value="Deluxe">Deluxe</option>
        </select>
      </label>

      <label>
        Size:
        <select name="size" value={formData.size} onChange={handleChange} required>
          <option value="Small">Small</option>
          <option value="Medium">Medium</option>
          <option value="Large">Large</option>
        </select>
      </label>

      <label>
        Bed:
        <select name="bed" value={formData.bed} onChange={handleChange} required>
          <option value="Single Bed">Single Bed</option>
          <option value="Queen Bed">Queen Bed</option>
          <option value="King Bed">King Bed</option>
        </select>
      </label>

      <label>
        Guests:
        <select name="guests" value={formData.guests} onChange={handleChange} required>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </label>

      <label>
        Amenities:
        <div>
          <label>
            <input
              type="checkbox"
              value="Wi-Fi"
              checked={formData.amenities.includes('Wi-Fi')}
              onChange={handleAmenitiesChange}
            />
            Wi-Fi
          </label>
          <label>
            <input
              type="checkbox"
              value="Breakfast Included"
              checked={formData.amenities.includes('Breakfast Included')}
              onChange={handleAmenitiesChange}
            />
            Breakfast Included
          </label>
          <label>
            <input
              type="checkbox"
              value="Gym Access"
              checked={formData.amenities.includes('Gym Access')}
              onChange={handleAmenitiesChange}
            />
            Gym Access
          </label>
          <label>
            <input
              type="checkbox"
              value="Swimming Pool"
              checked={formData.amenities.includes('Swimming Pool')}
              onChange={handleAmenitiesChange}
            />
            Swimming Pool
          </label>
          <label>
            <input
              type="checkbox"
              value="Spa"
              checked={formData.amenities.includes('Spa')}
              onChange={handleAmenitiesChange}
            />
            Spa
          </label>
          <label>
            <input
              type="checkbox"
              value="Air Conditioning"
              checked={formData.amenities.includes('Air Conditioning')}
              onChange={handleAmenitiesChange}
            />
            Air Conditioning
          </label>
          <label>
            <input
              type="checkbox"
              value="Mini Bar"
              checked={formData.amenities.includes('Mini Bar')}
              onChange={handleAmenitiesChange}
            />
            Mini Bar
          </label>
          <label>
            <input
              type="checkbox"
              value="Balcony"
              checked={formData.amenities.includes('Balcony')}
              onChange={handleAmenitiesChange}
            />
            Balcony
          </label>
        </div>
      </label>

      <label>
        Price:
        <div className="price-control">
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={(e) => handleChange({ target: { name: 'price', value: e.target.value } })}
            min="0"
            step="1"
            required
          />
          $/Night
        </div>
      </label>

      <label>
        Status:
        <select name="status" value={formData.status} onChange={handleChange} required>
          <option value="Available">Available</option>
          <option value="Occupied">Occupied</option>
        </select>
      </label>

      <label>
        Images:
        <input
          type="file"
          name="images"
          accept="image/*"
          multiple
          onChange={handleImageChange}
        />
      </label>

      <div className="image-previews">
        {imagePreviews.map((img, idx) => (
          <div key={idx} className="image-preview">
            <img src={img} alt={`Room ${idx + 1}`} />
            <button type="button" onClick={() => handleImageRemove(idx)}>x</button>
          </div>
        ))}
      </div>

      <div className="form-buttons">
        <button type="submit" className="save-button">Save</button>
        <button type="button" onClick={onCancel} className="cancel-button">Cancel</button>
      </div>
    </form>
  );
};

export default Rooms;

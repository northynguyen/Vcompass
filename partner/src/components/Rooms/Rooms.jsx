import { useState, useEffect, useContext } from 'react';
import './Rooms.css';
import { FaPlus, FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import { toast } from 'react-toastify';
import AddEditRoomForm from './AddEditRoomForm/AddEditRoomForm';

const Rooms = ({ onBack, hotel }) => {
  const [rooms, setRooms] = useState(hotel.roomTypes || []);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { url } = useContext(StoreContext);
  const roomsPerPage = 5;

  // Fetching room data
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${url}/api/accommodations/${hotel._id}/rooms`);
        setRooms(response.data.rooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        toast.error('Không thể tải dữ liệu phòng.');
      }
    };
    fetchRooms();
  }, [hotel._id, url]);

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

  const handleDeleteClick = async (roomId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng này không?')) {
      try {
        const response = await axios.delete(`${url}/api/accommodations/${hotel._id}/rooms/${roomId}`);
        if (response.data.success) {
          setRooms(response.data.rooms);
          setSelectedRoom(null);
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error('Error deleting room:', error);
        toast.error('Xóa phòng thất bại.');
      }
    }
  };

  const handleSave = async (formDataToSend) => {
    try {
      const response = await axios.put(
        `${url}/api/accommodations/${hotel._id}/rooms/${selectedRoom._id}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setRooms(response.data.rooms);
        setSelectedRoom(response.data.updatedRoom); // Assuming the server returns the updated room
        setIsEditing(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating room:', error);
      toast.error('Cập nhật phòng thất bại.');
    }
  };

  const handleAddSave = async (formDataToSend) => {
    console.log('Form data:', formDataToSend);
    try {
      const response = await axios.post(
        `${url}/api/accommodations/${hotel._id}/rooms`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setRooms(response.data.rooms);
        setIsAdding(false);
        setSelectedRoom(null);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error adding new room:', error);
      toast.error('Thêm phòng mới thất bại.');
    }
  };

  const handleAddClick = () => {
    setIsAdding(true);
    setSelectedRoom(null);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
  };

  // Pagination logic
  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = rooms.slice(indexOfFirstRoom, indexOfLastRoom);
  const totalPages = Math.ceil(rooms.length / roomsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="rooms-container">
  <div className="rooms-list">
    <button className="back-button" onClick={handleBackClick}>
      <FaArrowLeft /> Trở về khách sạn
    </button>
    <div className="rooms-header">
      <h2>Danh sách phòng</h2>
      <button className="add-room-button" onClick={handleAddClick}>
        <FaPlus /> Thêm Phòng Mới
      </button>
    </div>
    <div className="rooms-cards">
      {currentRooms.map((room) => (
        <div
          key={room.idRoomType}
          className={`room-card ${room.status === 'Occupied' ? 'occupied' : 'available'}`}
          onClick={() => handleRoomSelect(room)}
        >
          <img
            src={room?.images[0]?.includes('http') ? room.images[0] : `${url}/images/${room.images[0]}`}
            alt={room.nameRoomType}
            className="room-image"
          />
          <h3 className="room-type">{room.nameRoomType}</h3>
          <p className="room-details">
            {room.roomSize} m² •{' '}
            {room.numBed
              .map((bed) => `${bed.number} ${bed.nameBed}`)
              .join(', ')}
          </p>
          <p className="room-guests">
            Số khách: {room.numPeople.adult} người lớn, {room.numPeople.child} trẻ em
          </p>
          <p className="room-amenities">Tiện nghi: {room.amenities.join(', ')}</p>
          <p className="price">{room.pricePerNight.toLocaleString('vi-VN', { style: 'currency', currency: 'VND'})} /đêm</p>
          <p className={`status ${room.status.toLowerCase()}`}>{room.status === 'Occupied' ? 'Đã đặt' : 'Còn trống'}</p>
        </div>
      ))}
    </div>
    {/* Phân trang */}
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
          <h2> {selectedRoom.nameRoomType}</h2>
          <div className="room-detail-actions">
            <button onClick={handleEditClick} className="edit-button">
              <FaEdit /> Chỉnh sửa
            </button>
            <button onClick={() => handleDeleteClick(selectedRoom._id)} className="delete-button">
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
                <img key={idx} src={img?.includes('http') ? img :  `${url}/images/${img}`} alt={`${selectedRoom.nameRoomType} ${idx + 1}`} className="detail-image" />
              ))}
            </div>
            <p><strong>Kích thước:</strong> {selectedRoom.roomSize} m²</p>
            <p><strong>Giường:</strong> {selectedRoom.numBed.map(bed => `${bed.number} ${bed.nameBed}`).join(', ')}</p>
            <p><strong>Số khách:</strong> {selectedRoom.numPeople.adult} người lớn, {selectedRoom.numPeople.child} trẻ em</p>
            <p><strong>Giá:</strong> {selectedRoom.pricePerNight.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} /đêm</p>
            <p><strong>Trạng thái:</strong> {selectedRoom.status === 'Occupied' ? 'Đã đặt' : 'Còn trống'}</p>
            <p><strong>Tiện nghi:</strong> {selectedRoom.amenities.join(', ')}</p>
          </div>
        )}
      </div>
    ) : (
      <p className="select-room-message">Chọn một phòng để xem chi tiết.</p>
    )}
  </div>
</div>

  );
};








export default Rooms;
/* eslint-disable react/prop-types */
import { useState, useEffect, useContext } from 'react';
import './ReservationList.css';
import { StoreContext } from '../../../Context/StoreContext';

const ReservationList = ({ onReservationSelect }) => {
  const [reservations, setReservations] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
  });

  const { url, user } = useContext(StoreContext);

  const fetchReservations = async () => {
    try {
      const { startDate, endDate, status } = filters;
      const queryParams = new URLSearchParams({
        page,
        limit: 5,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(status && { status }),
      });
      
      const response = await fetch(`${url}/api/bookings/getAll?${queryParams.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        const updateBookings = await Promise.all(data.bookings.map(async (history) => {
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

        setReservations(updateBookings);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [page, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleStatusChange = async (index, newStatus) => {
    try {
      const bookingId = reservations[index]._id; 
  
      const response = await fetch(`${url}/api/bookings/updateStatus`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId, status: newStatus }),
      });
  
      const data = await response.json();
  
      if (data.success) {
        const updatedReservations = [...reservations];
        updatedReservations[index].status = newStatus;
        setReservations(updatedReservations); 
        fetchReservations(); 
      } else {
        console.error('Failed to update status:', data.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="reservation-list">
      <div className="reservation-header">
        <h2>Reservation List</h2>
        <div className="filters">
          <input 
            type="text" 
            placeholder="Search guest, status, etc." 
            onChange={handleFilterChange} 
            name="search" 
          />
          <select name="status" onChange={handleFilterChange}>
            <option value="">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input type="date" name="startDate" onChange={handleFilterChange} />
          <input type="date" name="endDate" onChange={handleFilterChange} />
          <button className="add-booking-btn">Add Booking</button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Booking Date</th>
            <th>Room Type</th>
            <th>Accommodation</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Guests</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation, index) => (
            <tr key={index}>
              <td>{new Date (reservation.createdAt).toLocaleDateString('vi-VN')}</td>
              <td>{reservation.nameRoomType}</td>
              <td>{reservation.accommodationName}</td>
              <td>{new Date(reservation.checkInDate).toLocaleDateString('vi-VN')}</td>
              <td>{new Date (reservation.checkOutDate).toLocaleDateString('vi-VN')}</td>
              <td>
                {reservation.numberOfGuests.adult} adult{reservation.numberOfGuests.adult > 1 ? 's' : ''} 
                + {reservation.numberOfGuests.child} child{reservation.numberOfGuests.child > 1 ? 'ren' : ''}
              </td>
              <td>
                <span
                  className={`status-label ${
                    reservation.status === 'confirmed'
                      ? 'confirmed'
                      : reservation.status === 'pending'
                      ? 'pending'
                      : reservation.status === 'cancelled'?
                       'cancelled': 'expired'
                  }`}
                >
                  {reservation.status}
                </span>
              </td>
              <td>
                <button
                  className="action-btn view"
                  onClick={() => onReservationSelect(reservation)}
                >
                  👁
                </button>
              
                {reservation.status === 'pending' && (
                  <button
                    className="action-btn confirm"
                    onClick={() => handleStatusChange(index, 'confirmed')}
                  >
                    Confirm
                  </button>
                ) }

                { reservation.status === 'confirmed' && (
                  <button
                    className="action-btn cancel"
                    onClick={() => handleStatusChange(index, 'expired')}
                  >
                    Complete
                  </button>
                )}  
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="pagination">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ReservationList;

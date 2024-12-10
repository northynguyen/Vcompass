/* eslint-disable react/prop-types */
import { useState, useEffect, useContext } from "react";
import "./ReservationList.css";
import { StoreContext } from "../../../Context/StoreContext";

const ReservationList = ({ onReservationSelect }) => {
  const [reservations, setReservations] = useState([]);
  const [hotels, setHotels] = useState([]); // Danh sách khách sạn cho combobox
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    hotel: "", // Bộ lọc mới cho khách sạn
  });

  const { url, user } = useContext(StoreContext);

  // Lấy danh sách đặt phòng
  const fetchReservations = async () => {
    try {
      const { startDate, endDate, status, hotel } = filters;
      const queryParams = new URLSearchParams({
        partnerId: user._id,
        page,
        limit: 6,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(status && { status }),
        ...(hotel && { accommodationId: hotel }),
      });

      const response = await fetch(`${url}/api/bookings/getAll?${queryParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        const updatedReservations = await Promise.all(
          data.bookings.map(async (booking) => {
            const roomResponse = await fetch(`${url}/api/accommodations/${booking.accommodationId}/rooms`);
            const roomData = await roomResponse.json();
            const room = roomData.rooms.find((r) => r._id === booking.roomId);

            return {
              ...booking,
              nameRoomType: room ? room.nameRoomType : "Không xác định",
              accommodationName: roomData.accommodation ? roomData.accommodation.name : "Không xác định",
            };
          })
        );

        setReservations(updatedReservations);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đặt phòng:", error);
    }
  };

  // Lấy danh sách khách sạn
  const fetchHotels = async () => {
    try {
      const response = await fetch(`${url}/api/accommodations/${user._id}`);
      const data = await response.json();

      if (data.success) {
        setHotels(data.accommodations);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khách sạn:", error);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

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
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId, status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedReservations = [...reservations];
        updatedReservations[index].status = newStatus;
        setReservations(updatedReservations);
        fetchReservations(); // Làm mới dữ liệu
      } else {
        console.error("Không thể cập nhật trạng thái:", data.message);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  return (
    <div className="reservation-list">
      <div className="reservation-header">
        <h2>Danh sách đặt phòng</h2>
        <div className="filters">
          <select name="hotel" onChange={handleFilterChange}>
            <option value="">Tất cả khách sạn</option>
            {hotels.map((hotel) => (
              <option key={hotel._id} value={hotel._id}>
                {hotel.name}
              </option>
            ))}
          </select>
          <select name="status" onChange={handleFilterChange}>
            <option value="">Tất cả trạng thái</option>
            <option value="confirmed">Đã duyệt</option>
            <option value="pending">Đang chờ duyệt</option>
            <option value="cancelled">Đã hủy</option>
            <option value="expired">Đã hoàn thành</option>
          </select>
          <input type="date" name="startDate" onChange={handleFilterChange} />
          <input type="date" name="endDate" onChange={handleFilterChange} />
        </div>
      </div>

      <div className="reservation-cards">
        {reservations.map((reservation, index) => (
          <div key={index} className="reservation-card">
            <div className="card-header">
              <h3>{reservation.accommodationName}</h3>
              <span className={`status-label ${reservation.status}`}>
                {
                  reservation.status === 'confirmed' ? 'Đã duyệt' :
                    reservation.status === 'pending' ? 'Chờ duyệt' :
                      reservation.status === 'cancelled' ? 'Đã hủy' :
                        reservation.status === 'expired' ? 'hoàn thành' :
                          'Không xác định'
                }
              </span>

            </div>
            <div className="card-body">
              <p>
                <strong>Loại phòng:</strong> {reservation.nameRoomType}
              </p>
              <p>
                <strong>Ngày đặt:</strong> {new Date(reservation.createdAt).toLocaleDateString("vi-VN")}
              </p>
              <p>
                <strong>Nhận phòng:</strong> {new Date(reservation.checkInDate).toLocaleDateString("vi-VN")}
              </p>
              <p>
                <strong>Trả phòng:</strong> {new Date(reservation.checkOutDate).toLocaleDateString("vi-VN")}
              </p>
              <p>
                <strong>Số khách:</strong> {reservation.numberOfGuests.adult} người lớn{" "}
                {reservation.numberOfGuests.child} trẻ em
              </p>
            </div>
            <div className="card-actions">
              <button className="action-btn view" onClick={() => onReservationSelect(reservation)}>
                Xem chi tiết
              </button>
              {reservation.status === "pending" && (
                <button
                  className="action-btn confirm"
                  onClick={() => handleStatusChange(index, "confirmed")}
                >
                  Duyệt
                </button>
              )}
              {reservation.status === "confirmed" && (
                <button
                  className="action-btn cancel"
                  onClick={() => handleStatusChange(index, "expired")}
                >
                  Hoàn thành
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
          Trang trước
        </button>
        <span>
          Trang {page} trên {totalPages}
        </span>
        <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}>
          Trang sau
        </button>
      </div>
    </div>
  );
};

export default ReservationList;

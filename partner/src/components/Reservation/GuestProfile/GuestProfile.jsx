import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../../Context/StoreContext";
import "./GuestProfile.css";

const GuestProfile = ({ selectedReservation, onBack }) => {
  const [bookingHistory, setBookingHistory] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const { url } = useContext(StoreContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    console.log("Selected Reservation ID:", selectedReservation._id);
    const fetchBookingHistory = async () => {
      try {
        const response = await fetch(
          `${url}/api/bookings/user/${selectedReservation.userId._id}/booking-history?page=${currentPage}&limit=5&partnerId=${selectedReservation.partnerId}`
        );
        const data = await response.json();
        setTotalPages(data.totalPages);
        const updatedHistory = await Promise.all(
          data.bookingHistory.map(async (history) => {
            const roomResponse = await fetch(
              `${url}/api/accommodations/${history.accommodationId}/rooms`
            );
            const roomData = await roomResponse.json();
            const room = roomData.rooms.find(
              (room) => room._id === history.roomId
            );

            return {
              ...history,
              nameRoomType: room ? room.nameRoomType : "Không xác định",
              accommodationName: roomData.accommodation
                ? roomData.accommodation.name
                : "Không xác định",
            };
          })
        );

        setBookingHistory(updatedHistory);
        console.log("Updated Booking History:", updatedHistory);
      } catch (error) {
        console.error("Error fetching booking history:", error);
      }
    };

    const fetchRoomInfo = async () => {
      try {
        const response = await axios.get(
          `${url}/api/accommodations/${selectedReservation.accommodationId}/rooms`
        );

        if (response.data.success) {
          console.log("Room Info:", response.data.rooms);
          const room = response.data.rooms.find(
            (room) => room._id === selectedReservation.roomId
          );
          setRoomInfo(room);
        } else {
          console.error("Error fetching room info:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching room info:", error);
      }
    };

    fetchRoomInfo();
    fetchBookingHistory();
  }, [selectedReservation, url, currentPage]);

  if (!selectedReservation || !bookingHistory || !roomInfo) {
    return <div>{"Đang tải..."}</div>;
  }

  return (
    <div className="guest-profile-container">
      <div className="guest-profile-header">
        <button onClick={onBack}>← Quay lại Đặt phòng</button>
      </div>
      <div className="guest-profile">
        <div className="profile">
          <div className="profile-info">
            <div className="user-infor">
              <img
                src={`${selectedReservation.userId.avatar}`}
                alt="Khách hàng"
                className="profile-photo"
              />
              <h2>{selectedReservation.userId.name}</h2>
              <hr />
            </div>
            <div className="contact-info">
              <p>
                <strong>Số điện thoại:</strong> {selectedReservation.userId.phone_number}
              </p>
              <p>
                <strong>Email:</strong> {selectedReservation.userId.email}
              </p>
              <p>
                <strong>Quốc tịch:</strong> {selectedReservation.userId.nationality ? selectedReservation.userId.nationality : "Việt NamNam"}
              </p>
            </div>
          </div>
        </div>

        <div className="accommodation-infor">
          {/* Booking Info Section */}
          <div className="booking-info">
            <h3>Thông tin đặt phòng</h3>
            <p>
              <strong>Mã đặt phòng:</strong> {selectedReservation._id}
            </p>
            <p>
              <strong>Số khách:</strong> {selectedReservation.numberOfGuests.adult}{" "}
              Người lớn và {selectedReservation.numberOfGuests.child} Trẻ em
            </p>
            <p>
              <strong>Ngày nhận phòng:</strong>{" "}
              {new Date(selectedReservation.checkInDate).toLocaleDateString(
                "vi-VN",
                { year: "numeric", month: "long", day: "numeric" }
              )}{" "}
              , Nhận phòng lúc 14:00
            </p>
            <p>
              <strong>Ngày trả phòng:</strong>{" "}
              {new Date(selectedReservation.checkOutDate).toLocaleDateString(
                "vi-VN",
                { year: "numeric", month: "long", day: "numeric" }
              )}
              , Trả phòng lúc 12:00
            </p>
            <p>
              <strong>Thời gian lưu trú:</strong> {selectedReservation.duration} ngày
            </p>
            <p>
              <strong>Yêu cầu đặc biệt:</strong> {selectedReservation.specialRequest}
            </p>
            <div
              className={`loyalty-program ${selectedReservation.status === "cancelled"
                ? "cancelled"
                : selectedReservation.status === "confirmed"
                  ? "confirmed"
                  : "completed"
                }`}
            >
              <h3>Trạng thái đặt phòng</h3>
              <p>
                <strong>Trạng thái:</strong> {selectedReservation.status}
              </p>
              {selectedReservation.status === "cancelled" && (
                <div className="cancellation-info">
                  <h3>Thông tin hủy</h3>
                  <p>
                    <strong>Lý do:</strong>{" "}
                    {selectedReservation.cancellationReason}
                  </p>
                  {selectedReservation.additionalComments && (
                    <p>
                      <strong>Ghi chú:</strong>{" "}
                      {selectedReservation.additionalComments}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Price Summary Section */}
            <div className="price-summary">
              <h3>Tóm tắt giá</h3>
              <p>
                <strong>Phòng và ưu đãi:</strong>{" "}
                {new Intl.NumberFormat().format(roomInfo.pricePerNight)} VND x{" "}
                {selectedReservation.duration} đêm
              </p>
              <p>
                <strong>Phụ phí:</strong> 0 VND{" "}
              </p>
              <p>
                <strong>VAT:</strong>{" "}
                {new Intl.NumberFormat().format(
                  roomInfo.pricePerNight * selectedReservation.duration * 0.08
                )}{" "}
                VND{" "}
              </p>
              <p>
                <strong>Tổng cộng:</strong>{" "}
                {new Intl.NumberFormat().format(selectedReservation.totalAmount)}{" "}
                VND
              </p>
            </div>
          </div>

          {/* Room Info Section */}
          <div className="room-info">
            <h3>Thông tin phòng</h3>
            <img
              src={
                roomInfo.images? roomInfo.images[0].includes("https") ? roomInfo.images[0] : `${url}/images/${roomInfo.images[0]}` : "https://via.placeholder.com/1024x768"
               
              }
              alt="Phòng"
              className="room-photo"
            />
            <p>
              <strong>Tên:</strong> {roomInfo.nameRoomType}
            </p>
            <p>
              <strong>Diện tích:</strong> {roomInfo.roomSize} m<sup>2</sup>
            </p>
            <p>
              <strong>Loại giường:</strong>{" "}
              {roomInfo.numBed
                .map((bed) => `${bed.nameBed} - ${bed.number}`)
                .join(", ")}
            </p>
            <p>
              <strong>Số khách:</strong> {roomInfo.numPeople.adult} người lớn,{" "}
              {roomInfo.numPeople.child} trẻ em
            </p>
            <p>
              <strong>Mô tả:</strong> {roomInfo.description}
            </p>
            <p
              style={{ color: "#ff23322", fontWeight: "bold", fontSize: "20px" }}
            >
              <strong>Giá:</strong>{" "}
              {new Intl.NumberFormat().format(roomInfo.pricePerNight)} VND
            </p>
          </div>

        </div>
        {/* Booking History Section */}
        <div className="booking-history">
          <h3>Lịch sử đặt phòng</h3>
          {bookingHistory.length === 0 ? (
            <p>Không có lịch sử đặt phòng.</p>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Loại phòng</th>
                    <th>Tên </th>
                    <th>Ngày nhận</th>
                    <th>Ngày trả</th>
                    <th>Số khách</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingHistory.map((history, index) => (
                    <tr key={index}>
                      <td>
                        {new Date(history.createdAt).toLocaleDateString(
                          "vi-VN",
                          { year: "numeric", month: "long", day: "numeric" }
                        )}
                      </td>
                      <td>{history.nameRoomType}</td>
                      <td>{history.accommodationName}</td>
                      <td>
                        {new Date(history.checkInDate).toLocaleDateString(
                          "vi-VN",
                          { year: "numeric", month: "long", day: "numeric" }
                        )}
                      </td>
                      <td>
                        {new Date(history.checkOutDate).toLocaleDateString(
                          "vi-VN",
                          { year: "numeric", month: "long", day: "numeric" }
                        )}
                      </td>
                      <td>
                        {history.numberOfGuests.adult} Người lớn{" "}
                        {history.numberOfGuests.child} Trẻ em
                      </td>
                      <td>{history.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  Trang trước
                </button>
                <span>
                  Trang {currentPage} trên {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Trang sau
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestProfile;

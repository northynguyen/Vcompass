/* eslint-disable react/prop-types */
import CryptoJS from "crypto-js";
import { useContext, useEffect, useState } from "react";
import { FaEdit, FaHeart, FaRegClock, FaRegHeart } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { SlNotebook } from "react-icons/sl";
import { toast } from "react-toastify";
import ImagesModal from "../../../components/ImagesModal/ImagesModal";
import { StoreContext } from "../../../Context/StoreContext";
import "./ActivityTime.css";
const ActivityTime = ({ activity, setInforSchedule, mode, socket, inforSchedule }) => {
  const timeStart = activity.timeStart;
  const timeEnd = activity.timeEnd;
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedTime = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        options.push(formattedTime);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();
  const [startTime, setStartTime] = useState(timeStart || timeOptions[0]);
  const [endTime, setEndTime] = useState(timeEnd || timeOptions[1]);

  useEffect(() => {
    if (timeStart) {
      setStartTime(timeStart);
    }
    if (timeEnd) {
      setEndTime(timeEnd);
    }
  }, [timeStart, timeEnd]);
  useEffect(() => {
    setInforSchedule((prevSchedule) => {
      const updatedActivities = prevSchedule.activities.map((day) => {
        return {
          ...day,
          activity: day.activity.map((act) =>
            act._id === activity._id
              ? { ...act, timeStart: startTime, timeEnd: endTime }
              : act
          ),
        };
      });

      // Emit sự kiện để update real-time
      if (socket?.current) {
        socket.current.emit('updateActivities', {
          scheduleId: inforSchedule._id,
          activities: updatedActivities
        });
      }

      return { ...prevSchedule, activities: updatedActivities };
    });
  }, [startTime, endTime]);
  const handleStartChange = (e) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    if (newStartTime >= endTime) {
      const nextValidEndTime =
        timeOptions.find((option) => option > newStartTime) || endTime;
      setEndTime(nextValidEndTime);
    }
  };
  const handleEndChange = (e) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);
  };
  const filteredEndTimeOptions = timeOptions.filter(
    (option) => option > startTime
  );
  return (
    <div className="time-container">
      <div className="time-select-wrapper">
        <FaRegClock className="icon" />
        <select
          className="time-schedule"
          value={startTime}
          onChange={handleStartChange}
          disabled={mode === "view"}
        >
          {timeOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <h6>To</h6>
      <div className="time-select-wrapper">
        <FaRegClock className="icon" />
        <select
          className="time-schedule"
          value={endTime}
          onChange={handleEndChange}
          disabled={mode === "view"}
        >
          {filteredEndTimeOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};


export const AccomActivity = ({
  activity,
  data,
  handleEdit,
  setIsOpenModal,
  mode,
  setShowLogin
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [bookingInfo, setBookingInfo] = useState(null);
  const { url, user, token, getImageUrl } = useContext(StoreContext);

  // Fetch booking information if bookingId exists
  useEffect(() => {
    const fetchBookingInfo = async () => {
      if (activity.bookingId) {
        try {
          const response = await fetch(`${url}/api/bookings/${activity.bookingId}`);
          const data = await response.json();
          if (data.success) {
            console.log("Booking data:", data.booking);
            const formatBookingData = (booking) => ({
              checkIn: booking.checkInDate ? new Date(booking.checkInDate ).toLocaleDateString('vi-VN') : 'Chưa xác định',
              checkOut: booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('vi-VN') : 'Chưa xác định',
              roomType: booking.accommodationId.roomTypes.find(
                (room) => room._id === booking.roomId
              )?.nameRoomType || 'Chưa xác định',
              numberOfGuests: booking.numberOfGuests || 0,
              totalAmount: booking.totalAmount || 0,
            });
            setBookingInfo(formatBookingData(data.booking));
          }
        } catch (error) {
          console.error("Error fetching booking info:", error);
        }
      }
    };

    fetchBookingInfo();
  }, [activity.bookingId, url]);

  const toggleWishlist = async () => {
    try {
      if (!user) {
        setShowLogin(true);
        return;
      }
      const newStatus = !isSaved;
      const action = newStatus ? "add" : "remove";

      const response = await fetch(
        `${url}/api/user/user/${user._id}/addtoWishlist?type=accommodation&itemId=${data._id}&action=${action}`,
        {
          method: "POST",
          headers: { token: token },
        }
      );

      const result = await response.json();

      if (result.success) {
        const updatedFavorites = newStatus
          ? [...user.favorites.accommodation, data._id]
          : user.favorites.accommodation.filter((id) => id !== data._id);

        const updatedUserData = {
          ...user,
          favorites: { ...user.favorites, accommodation: updatedFavorites },
        };

        localStorage.setItem("user", JSON.stringify(updatedUserData));
        setIsSaved(newStatus);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error.message);
      setIsSaved((prevState) => !prevState);
    }
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData && userData.favorites.accommodation && userData.favorites.accommodation.includes(data._id)) {
      setIsSaved(true)
    }
  }, [user, data])

  const onNavigateToDetails = () => {
    const encryptedServiceId = CryptoJS.AES.encrypt(
      data._id,
      "mySecretKey"
    ).toString();
    const safeEncryptedServiceId = encodeURIComponent(encryptedServiceId);
    window.open(
      `/place-details/accommodation/${safeEncryptedServiceId}`,
      "_blank"
    );
  };

  if (!data) {
    return <div className="div">...</div>;
  }

  return (
    <div className="time-schedule-item">
      <div className="activity-item-header">
        <div className="type-activity">
          <p>NGHỈ NGƠI</p>
          
        </div>
        {mode === "view" && (
          <div className="expense-actions">
            <button className="wishlist-btn" onClick={toggleWishlist}>
              {isSaved ? (
                <FaHeart className="wishlist-icon saved" />
              ) : (
                <FaRegHeart className="wishlist-icon not-saved" />
              )}
            </button>
          </div>
        )}
        {mode === "edit" && (
          <div className="expense-actions">
            <button className="edit-btn" onClick={handleEdit}>
              <FaEdit />
            </button>
            <button className="edit-btn" onClick={() => setIsOpenModal(true)}>
              <MdDelete />
            </button>
          </div>
        )}
      </div>
      <div className="activity-content-card" onClick={onNavigateToDetails}>
        <div className="time-schedule-left">
          <img
            src={getImageUrl(data)}
            alt={data.title || "Image"}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg';
            }}
            className="time-schedule-image"
          />
        </div>
        <div className="time-schedule-details">
          <div className="time-schedule-header">
            <h3>{data.name}</h3>
            <span className="time-schedule-rating">
              <i className="fa-solid fa-star"></i>
              {data.ratings?.length > 0
                ? (data.ratings.map((rating) => rating.rate ).reduce((a, b) => a + b, 0) / data.ratings.length).toFixed(1)
                : "Chưa có đánh giá"}
            </span> 
          </div>
          <div className="time-schedule-location">
              <i className="fa-solid fa-location-dot"></i>
              <a
                href={`https://www.google.com/maps/?q=${data.location.latitude},${data.location.longitude}`}
              >
                {data.location.address}
              </a>
            </div>
            {mode === "edit" && (
              <div className="time-schedule-info">
              
                {activity.bookingId && bookingInfo  ? (
                  <div className="booking-info">
                    <div className="booking-info-row">
                      <div className="booking-info-item">
                        <i className="fa-solid fa-calendar-check"></i>
                        <span>Nhận phòng: {bookingInfo.checkIn}</span>
                      </div>
                      <div className="booking-info-item">
                        <i className="fa-solid fa-calendar-xmark"></i>
                        <span>Trả phòng: {bookingInfo.checkOut}</span>
                      </div>
                    </div>
                    <div className="booking-info-row">
                      <div className="booking-info-item">
                        <i className="fa-solid fa-bed"></i>
                        <span>Loại phòng: {bookingInfo.roomType}</span>
                      </div>
                      <div className="booking-info-item">
                        <i className="fa-solid fa-users"></i>
                        <span>Số khách: {bookingInfo?.numberOfGuests?.adult} người lớn, {bookingInfo?.numberOfGuests?.children} trẻ em </span>
                      </div>
                    </div>
                    <div className="booking-info-row">
                      <div className="booking-info-item">
                        <i className="fa-solid fa-money-bill-wave"></i>
                        <span>Giá: {bookingInfo.totalAmount?.toLocaleString()} VND</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="booking-warning">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    <span>Phòng này chưa được đặt</span>
                  </div>
                )}
              </div>
              )}
          <div className="time-schedule-info">
              <i className="fa-solid fa-file"></i>
              <span>
                {data.description.length > 150
                  ? data.description.substring(0, 150) + "..."
                  : data.description}
              </span>
            </div>
          {data.amenities && data.amenities.length > 0 && (
            <div className="list-accom__tour-facilities">
              {data.amenities.slice(0, 8).map((facility, index) => (
                <span className="tour-facilities-span" key={index}>{facility}</span>
              ))}
              {data.amenities.length > 8 && <span>...</span>}
            </div>
          )}
        </div>
        <div className="time-schedule-right">
          <div className="time-schedule-price">
            <p className="price-text">
              {activity.cost.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </p>
          </div>
          {activity.bookingId && (
            <span className="booking-badge">
              <i className="fa-solid fa-check"></i> Đã đặt
            </span>
          )}
          <div />
        </div>
      </div>
      <div className="time-schedule-usernote">
        <div className="note-icon-wrapper">
          <SlNotebook className="note-icon" />
          <p>Ghi chú :</p>
        </div>
        <p>{activity.description}</p>
      </div>
    </div>
  );
};


export const FoodServiceActivity = ({
  activity,
  data,
  handleEdit,
  setIsOpenModal,
  mode, socket, setShowLogin
}) => {
  const [isSaved, setIsSaved] = useState(false); // State to track wishlist status
  const { url, user, token, getImageUrl } = useContext(StoreContext);
  const toggleWishlist = async () => {
    try {
      if (!user) {
        setShowLogin(true);
        return;
      }
      const newStatus = !isSaved; // Đảo ngược trạng thái hiện tại
      const action = newStatus ? "add" : "remove"; // Chọn hành động dựa trên trạng thái mới

      // Gửi yêu cầu tới API
      const response = await fetch(
        `${url}/api/user/user/${user._id}/addtoWishlist?type=foodService&itemId=${data._id}&action=${action}`,
        {
          method: "POST",
          headers: { token: token },
        }
      );

      const result = await response.json();

      if (result.success) {
        // Nếu API trả về thành công, cập nhật favorites.foodService
        const updatedFavorites = newStatus
          ? [...user.favorites.foodService, data._id] // Thêm item vào danh sách
          : user.favorites.foodService.filter((id) => id !== data._id); // Xóa item khỏi danh sách

        const updatedUserData = {
          ...user,
          favorites: { ...user.favorites, foodService: updatedFavorites },
        };

        // Lưu dữ liệu đã cập nhật vào localStorage
        localStorage.setItem("user", JSON.stringify(updatedUserData));

        // Hiển thị thông báo thành công
        toast.success(result.message);
        console.log(result.message);

        // Cập nhật trạng thái `isSaved`
        setIsSaved(newStatus);
      } else {
        // Nếu thất bại, hiển thị lỗi
        toast.error(result.message);
      }
    } catch (error) {
      // Xử lý lỗi khi gửi yêu cầu
      console.error("Failed to update wishlist:", error.message);

      // Đảo lại trạng thái `isSaved` nếu có lỗi
      setIsSaved((prevState) => !prevState);
    }
  };


  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData && userData.favorites.foodService && userData.favorites.foodService.includes(data?._id)) {
      setIsSaved(true)
    }
  }, [user, data?._id])

  const onNavigateToDetails = () => {
    const encryptedServiceId = CryptoJS.AES.encrypt(
      data._id,
      "mySecretKey"
    ).toString();
    const safeEncryptedServiceId = encodeURIComponent(encryptedServiceId);
    window.open(`/place-details/food/${safeEncryptedServiceId}`, "_blank");
  };
  //console.log("data", data);
  if (!data || data.length === 0) {
    return <div className="div">...</div>;
  }


  return (
    <div className="time-schedule-item">
      <div className="activity-item-header">
        <div className="type-activity">
          <p>ĂN UỐNG</p>
        </div>

        {mode === "view" && (
          <div className="expense-actions">
            <button className="wishlist-btn" onClick={toggleWishlist}>
              {isSaved ? (
                <FaHeart className="wishlist-icon saved" />
              ) : (
                <FaRegHeart className="wishlist-icon not-saved" />
              )}
            </button>
          </div>
        )}
        {mode === "edit" && (
          <div className="expense-actions">
            <button className="edit-btn" onClick={handleEdit}>
              <FaEdit />
            </button>

            <button className="edit-btn" onClick={() => setIsOpenModal(true)}>
              <MdDelete />
            </button>
          </div>
        )}
      </div>
      <div className="activity-content-card" onClick={onNavigateToDetails}>
        <div className="time-schedule-left">
          <img
            src={getImageUrl(data)}
            alt={data.title || "Image"}
            className="time-schedule-image"
          />
        </div>
        <div className="time-schedule-details">
          <div className="time-schedule-header">
            <h3>{data.foodServiceName}</h3>
            <span className="time-schedule-rating">
              <i className="fa-solid fa-star"></i>
              {data.ratings?.length > 0
                ? (data.ratings.map((rating) => rating.rate ).reduce((a, b) => a + b, 0) / data.ratings.length).toFixed(1)
                : "Chưa có đánh giá"}
            </span>
            <div className="time-schedule-location">
              <i className="fa-solid fa-location-dot"></i>
              <a
                href={`https://www.google.com/maps/?q=${data.location.latitude},${data.location.longitude}`}
              >
                {data.location.address}
              </a>
            </div>
            <div className="time-schedule-info">
              <i className="fa-solid fa-file"></i>
              <span>
                {data.description.length > 150
                  ? data.description.substring(0, 150) + "..."
                  : data.description}
              </span>
            </div>
            <div className="list-accom__tour-facilities">
              {data.amenities.slice(0, 8).map((facility, index) => (
                <span className="tour-facilities-span" key={index}>{facility}</span>
              ))}
              {data.amenities.length > 8 && <span>...</span>}
            </div>
          </div>
        </div>

        <div className="time-schedule-right">
          <div className="time-schedule-price">
            <p className="price-text">
              {activity.cost.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </p>
          </div>
          <div />
        </div>
      </div>
      <div className="time-schedule-usernote">
        <div className="note-icon-wrapper">
          <SlNotebook className="note-icon" />
          <p>Ghi chú :</p>
        </div>
        <p>{activity.description}</p>
      </div>
    </div>
  );
};


export const AttractionActivity = ({
  activity,
  data,
  handleEdit,
  setIsOpenModal,
  mode, socket, setShowLogin
}) => {
  const [isSaved, setIsSaved] = useState(false); // State to track wishlist status
  const { url, user, token, getImageUrl } = useContext(StoreContext);
  const toggleWishlist = async () => {
    try {
      if (!user) {
        setShowLogin(true);
        return;
      }
      const newStatus = !isSaved; // Đảo ngược trạng thái hiện tại
      const action = newStatus ? "add" : "remove"; // Chọn hành động dựa trên trạng thái mới

      // Gửi yêu cầu tới API
      const response = await fetch(
        `${url}/api/user/user/${user._id}/addtoWishlist?type=attraction&itemId=${data._id}&action=${action}`,
        {
          method: "POST",
          headers: { token: token },
        }
      );

      const result = await response.json();

      // Xử lý kết quả từ API
      if (result.success) {
        // Nếu thành công, cập nhật trạng thái `isSaved` và thêm/xóa item vào/from `favorites.attraction`
        const updatedFavorites = newStatus
          ? [...user.favorites.attraction, data._id] // Thêm item vào danh sách
          : user.favorites.attraction.filter((id) => id !== data._id); // Xóa item khỏi danh sách

        const updatedUserData = {
          ...user,
          favorites: { ...user.favorites, attraction: updatedFavorites },
        };

        // Lưu dữ liệu đã cập nhật vào localStorage
        localStorage.setItem("user", JSON.stringify(updatedUserData));

        // Hiển thị thông báo thành công
        toast.success(result.message);
        console.log(result.message);
      } else {
        // Nếu thất bại, hiển thị lỗi
        toast.error(result.message);
      }

      // Cập nhật trạng thái isSaved
      setIsSaved(newStatus);
    } catch (error) {
      // Xử lý lỗi khi gửi yêu cầu
      console.error("Failed to update wishlist:", error.message);

      // Đảo lại trạng thái `isSaved` nếu có lỗi
      setIsSaved((prevState) => !prevState);
    }
  };


  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData && userData.favorites.attraction && userData.favorites.attraction.includes(data._id)) {
      setIsSaved(true)
    }
  }, [data._id])

  const onNavigateToDetails = () => {
    const encryptedServiceId = CryptoJS.AES.encrypt(
      data._id,
      "mySecretKey"
    ).toString();
    const safeEncryptedServiceId = encodeURIComponent(encryptedServiceId);
    window.open(
      `/place-details/attraction/${safeEncryptedServiceId}`,
      "_blank"
    );
  };
  if (!data) {
    return <div className="div">...</div>;
  }
  return (
    <div className="time-schedule-item">
      <div className="activity-item-header">
        <div className="type-activity">
          <p>THAM QUAN</p>
        </div>
        {mode === "view" && (
          <div className="expense-actions">
            <button className="wishlist-btn" onClick={toggleWishlist}>
              {isSaved ? (
                <FaHeart className="wishlist-icon saved" />
              ) : (
                <FaRegHeart className="wishlist-icon not-saved" />
              )}
            </button>
          </div>
        )}

        {mode === "edit" && (
          <div className="expense-actions">
            <button className="edit-btn" onClick={handleEdit}>
              <FaEdit />
            </button>

            <button className="edit-btn" onClick={() => setIsOpenModal(true)}>
              <MdDelete />
            </button>
          </div>
        )}
      </div>
      <div className="activity-content-card" onClick={onNavigateToDetails}>
        <div className="time-schedule-left">
          <img
            src={getImageUrl(data)}
            alt={data.title || "Image"}
            className="time-schedule-image"
          />
        </div>

        <div className="time-schedule-details">
          <div className="time-schedule-header">
            <h3>{data.attractionName}</h3>
            <span className="time-schedule-rating">
              <i className="fa-solid fa-star"></i>
              {data.ratings?.length > 0
                ? (data.ratings.map((rating) => rating.rate ).reduce((a, b) => a + b, 0) / data.ratings.length).toFixed(1)
                : "Chưa có đánh giá"}
            </span>
            <div className="time-schedule-location">
              <i className="fa-solid fa-location-dot"></i>
              <a
                href={`https://www.google.com/maps/?q=${data.location.latitude},${data.location.longitude}`}
              >
                {data.location.address}
              </a>
            </div>
            <div className="time-schedule-info">
              <i className="fa-solid fa-file"></i>
              <span>
                {data.description.length > 150
                  ? data.description.substring(0, 150) + "..."
                  : data.description}
              </span>
            </div>
          </div>
          <div className="list-accom__tour-facilities">
            {data.amenities.slice(0, 8).map((facility, index) => (
              <span key={index}>{facility}</span>
            ))}
            {data.amenities.length > 8 && <span>...</span>}
          </div>
        </div>

        <div className="time-schedule-right">
          <div className="time-schedule-price">
            <p className="price-text">
              {activity.cost.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </p>
          </div>
          <div />
        </div>
      </div>
      <div className="time-schedule-usernote">
        <div className="note-icon-wrapper">
          <SlNotebook className="note-icon" />
          <p>Ghi chú : </p>
        </div>
        <p>{activity.description}</p>
      </div>
    </div>
  );
};

export const OtherActivity = ({
  activity,
  handleEdit,
  setIsOpenModal,
  mode, socket
}) => {
  const { url, getImageUrl } = useContext(StoreContext);

  // State điều khiển modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Hàm mở modal và chọn ảnh
  const openModal = (index) => {
    setSelectedImageIndex(index); // Lưu chỉ mục ảnh được chọn
    setIsModalOpen(true); // Mở modal
  };

  // Hàm đóng modal
  const closeModal = () => {
    setIsModalOpen(false); // Đóng modal
  };

  return (
    <div className="time-schedule-item">
      <div className="activity-item-header">
        <div className="type-activity">
          <p>HOẠT ĐỘNG KHÁC</p>
        </div>
        {mode === "edit" && (
          <div className="expense-actions">
            <button className="edit-btn" onClick={handleEdit}>
              <FaEdit />
            </button>

            <button className="edit-btn" onClick={() => setIsOpenModal(true)}>
              <MdDelete />
            </button>
          </div>
        )}
      </div>
      <div className="other-activity-body">
        <div className="other-left">
          <div className="other-activity-info">
            <h3 className="other-activity-name">{activity.name}</h3>
            <div className="other-activity-address">
              <i className="fa-solid fa-location-dot"></i>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  activity.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {activity.address}
              </a>
            </div>
          </div>

          {activity.imgSrc && activity.imgSrc.length > 0 && (
            <div className="other-activity-images">
              {activity.imgSrc.map((image, index) => (
                <img
                  key={index}
                  src={image.includes("http") ? image : `${url}/images/${image}`}
                  alt={activity.name}
                  className="other-activity-image"
                  onClick={() => openModal(index)} // Mở modal khi nhấp vào ảnh
                />
              ))}
            </div>
          )}
        </div>
        <div className="time-schedule-right">
          <div className="time-schedule-price">
            <p className="price-text">
              {activity.cost.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </p>
          </div>
          <div />
        </div>
      </div>

      <div className="time-schedule-usernote">
        <div className="note-icon-wrapper">
          <SlNotebook className="note-icon" />
          <p>Ghi chú : </p>
        </div>
        <p>{activity.description}</p>
      </div>

      {/* Hiển thị modal khi isModalOpen là true */}
      <ImagesModal
        isOpen={isModalOpen}
        images={activity.imgSrc}
        selectedIndex={selectedImageIndex}
        onClose={closeModal}
      />
    </div>
  );
};

export default ActivityTime;

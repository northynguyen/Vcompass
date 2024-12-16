/* eslint-disable react/prop-types */
import CryptoJS from "crypto-js";
import { useContext, useEffect, useState } from "react";
import { FaEdit, FaRegClock, FaHeart, FaRegHeart } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import { SlNotebook } from "react-icons/sl";
import { StoreContext } from "../../../Context/StoreContext";
import "./ActivityTime.css";
import ImagesModal from "../../../components/ImagesModal/ImagesModal";
import { use } from "react";
const ActivityTime = ({ activity, setInforSchedule, mode }) => {
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
}) => {

  
  const [isSaved, setIsSaved] = useState(false); 
  const { url, user, token } = useContext(StoreContext);
  const toggleWishlist = async () => {
    try {
      const newStatus = !isSaved; // Đảo ngược trạng thái hiện tại
      const action = newStatus ? "add" : "remove"; // Chọn hành động dựa trên trạng thái mới
  
      // Gửi yêu cầu tới API
      const response = await fetch(
        `${url}/api/user/user/${user._id}/addtoWishlist?type=accommodation&itemId=${data._id}&action=${action}`,
        {
          method: "POST",
          headers: { token: token },
        }
      );
  
      const result = await response.json();
  
      if (result.success) {
        // Nếu API trả về thành công, cập nhật danh sách `favorites.accommodation`
        const updatedFavorites = newStatus
          ? [...user.favorites.accommodation, data._id] // Thêm item vào danh sách
          : user.favorites.accommodation.filter((id) => id !== data._id); // Xóa item khỏi danh sách
  
        const updatedUserData = {
          ...user,
          favorites: { ...user.favorites, accommodation: updatedFavorites },
        };
  
        // Lưu dữ liệu đã cập nhật vào localStorage
        localStorage.setItem("user", JSON.stringify(updatedUserData));
  
        // Cập nhật trạng thái `isSaved`
        setIsSaved(newStatus);
  
        // Hiển thị thông báo thành công
        toast.success(result.message);
        console.log(result.message);
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
    console.log("user",userData);
     if( userData.favorites.accommodation && userData.favorites.accommodation.includes(data._id)) {
       setIsSaved(true)
     }
  } , [user ,data])

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
            src={`${url}/images/${data.images[0]}`}
            alt={data.title || "Image"}
            className="time-schedule-image"
          />
        </div>
        <div className="time-schedule-details">
          <div className="time-schedule-header">
            <span className="time-schedule-rating">
              ★★★★☆ ({data?.ratings?.length || 0} reviews)
            </span>
            <h3>{data.name}</h3>
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
                <span>
                  {data.description.length > 150
                    ? data.description.substring(0, 150) + "..."
                    : data.description}
                </span>
              </span>
            </div>
            <div className="list-accom__tour-facilities">
              {data.amenities.map((facility, index) => (
                <span key={index}>{facility}</span>
              ))}
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


export const FoodServiceActivity = ({
  activity,
  data,
  handleEdit,
  setIsOpenModal,
  mode,
}) => {
  const [isSaved, setIsSaved] = useState(false); // State to track wishlist status
  const { url, user, token } = useContext(StoreContext);
  const toggleWishlist = async () => {
    try {
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
     if(userData.favorites.foodService &&userData.favorites.foodService.includes(data._id)){
       setIsSaved(true)     
     }
  } , [data._id])

  const onNavigateToDetails = () => {
    const encryptedServiceId = CryptoJS.AES.encrypt(
      data._id,
      "mySecretKey"
    ).toString();
    const safeEncryptedServiceId = encodeURIComponent(encryptedServiceId);
    window.open(`/place-details/food/${safeEncryptedServiceId}`, "_blank");
  };
  console.log("data", data);
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
            src={`${url}/images/${data.images[0]}`}
            alt={data.title || "Image"}
            className="time-schedule-image"
          />
        </div>
        <div className="time-schedule-details">
          <div className="time-schedule-header">
            <span className="time-schedule-rating">
              ★★★★☆ ({data?.ratings?.length || 0} reviews)
            </span>
            <h3>{data.foodServiceName}</h3>
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
              {data.amenities.map((facility, index) => (
                <span key={index}>{facility}</span>
              ))}
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
  mode,
}) => {
  const [isSaved, setIsSaved] = useState(false); // State to track wishlist status
  const { url, user, token } = useContext(StoreContext);
  const toggleWishlist = async () => {
    try {
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
    if(userData.favorites.attraction && userData.favorites.attraction.includes(data._id)){
      setIsSaved(true)  
    }
 } , [data._id])

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
            src={`${url}/images/${data.images[0]}`}
            alt={data.title || "Image"}
            className="time-schedule-image"
          />
        </div>

        <div className="time-schedule-details">
          <div className="time-schedule-header">
            <span className="time-schedule-rating">
              ★★★★☆ ({data?.ratings?.length || 0} reviews)
            </span>
            <h3>{data.name}</h3>
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
            {data.amenities.map((facility, index) => (
              <span key={index}>{facility}</span>
            ))}
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
  mode,
}) => {
  const { url } = useContext(StoreContext);
  
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
        <div className ="other-left">
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
                  src={`${url}/images/${image}`}
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

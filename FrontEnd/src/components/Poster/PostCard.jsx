import axios from "axios";
import React, { useContext, useState, useEffect } from "react";
import { BsFillInfoCircleFill } from "react-icons/bs";
import { StoreContext } from "../../Context/StoreContext";
import CryptoJS from "crypto-js";
import "./PostCard.css";
import { FaHeart } from "react-icons/fa";


const PostCard = ({ schedule, handleScheduleClick }) => {
  const { url, user, token } = useContext(StoreContext);
  const [likes, setLikes] = useState(schedule?.likes || []);
  const [isFavorite, setIsFavorite] = useState(false);
  const activityCosts = {
    Accommodation: 0,
    FoodService: 0,
    Attraction: 0,
    Additional: 0,
  };
  const [showCosts, setShowCosts] = useState(false); // Trạng thái hiển thị chi phí
  const [attractions, setAttractions] = useState(null);
  const isLike = () => {
    return likes.some((like) => like.idUser === user?._id);
  };
  const handleComment = () => {
    handleScheduleClick(schedule._id);
    const targetPosition =
      document.documentElement.scrollHeight - window.innerHeight - 200;

    // Nếu vị trí nhỏ hơn chiều cao trang, thực hiện cuộn
    if (targetPosition > 0) {
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    } else {
      console.warn("Target position is invalid or too small:", targetPosition);
    }
  };
  const handleLike = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập trước");
      return;
    }
    try {
      const response = await axios.post(
        `${url}/api/schedule/user/updateLikeComment`,
        {
          scheduleId: schedule._id,
          userId: user._id,
          action: isLike() ? "unlike" : "like",
        },
        { headers: { token } }
      );
      if (response.data.success) {
        console.log("data", response.data);
        setLikes(response.data.schedule.likes);
      } else {
        console.error("Error liking schedule:", response.data.message);
      }
    } catch (error) {
      console.error("Error liking schedule:", error);
    }
  };
  const handleReplyCount = (comments) => {
    let count = 0;
    comments.forEach((comment) => {
      count += comment.replies.length;
    });
    return count;
  };

  useEffect(() => {
    const fetchAttractions = async () => {
      const idAttractions = [];

      schedule.activities.forEach((day) => {
        day.activity.forEach((activity) => {
          if (activity.activityType === "Attraction") {
            idAttractions.push(activity.idDestination);
          }
        });
      });

      try {
        const response = await axios.get(`${url}/api/attractions`);
        if (response.data.success) {
          const attractions = response.data.attractions.filter((attraction) =>
            idAttractions.includes(attraction._id)
          );
          setAttractions(attractions);
        }
      } catch (error) {
        console.error("Error fetching attractions:", error);
      }
    };

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${url}/api/user/user/${user._id}`);
        if (response.data.success) {
          const user = response.data.user;
          user.favorites.schedule.forEach((scheduleId) => {
            if (scheduleId === schedule._id) {
              setIsFavorite(true);
            }
          })
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    if(user){
       fetchUser();
    }
    fetchAttractions();
  }, [  schedule, user, url]);

  schedule.activities.forEach((day) => {
    day.activity.forEach((activity) => {
      switch (activity.activityType) {
        case "Accommodation":
          activityCosts.Accommodation += activity.cost;
          break;
        case "FoodService":
          activityCosts.FoodService += activity.cost;
          break;
        case "Attraction":
          activityCosts.Attraction += activity.cost;
          break;
        default:
          activityCosts.Additional += activity.cost;
          break;
      }
    });
  });
  schedule.additionalExpenses.forEach((activity) => {
    activityCosts.Additional += activity.cost;
  });

  const onClick = (serviceId) => {
    console.log(serviceId);
    const encryptedServiceId = CryptoJS.AES.encrypt(
      serviceId,
      "mySecretKey"
    ).toString();
    const safeEncryptedServiceId = encodeURIComponent(encryptedServiceId);
    window.open(`/place-details/attraction/${safeEncryptedServiceId}`);
    window.scrollTo(0, 0);
  };
  const totalCost =
    activityCosts.Accommodation +
    activityCosts.FoodService +
    activityCosts.Attraction +
    activityCosts.Additional;


  const handleHeartClick = async (id) => {
    if (!user) {
      alert("Vui lòng đăng nhập trước");
      return;
    }
    try {
      
      const action = isFavorite ? "remove" : "add";
      const requestUrl = `${url}/api/user/user/${user._id}/addtoWishlist?type=schedule&itemId=${id}&action=${action}`;
  
      const response = await fetch(requestUrl, {
          method: "POST",
          headers: { token },
      });

      if (response.ok) {
          console.log("data", response.data);
          setIsFavorite(!isFavorite);

        } else {
          console.error("Error liking schedule:");
          alert("Lỗi khi thêm vào danh sách yêu thích!");
        }
        
    } catch (error) {
      console.error("Error liking schedule:", error);
    }
  };
   
  return (
    <div className="card-container">
      <header className="card-header">
        <div className="user-info">
          <img
            className="user-avatar"
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="user avatar"
          />
          <div>
            <h5>
              {schedule.idUser.name} <span className="verified">✔</span>
            </h5>
            <p className="user-date">
              {new Date(schedule.createdAt).toLocaleString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="post-location">
          <i className="fa fa-map-marker" aria-hidden="true"></i>
          <label className="location-text" htmlFor="null">
            {schedule.address}
          </label>
        </div>
      </header>

      <div className="content-container">
        <div className="heart-container">
          {schedule.imgSrc && schedule.imgSrc[0] ? (
            // Hiển thị ảnh nếu có imgSrc
            <img
              className="content-image"
              src={`${url}/images/${schedule.imgSrc[0]}`}
              alt="Schedule Image"
            />
          ) : schedule.videoSrc ? (
            // Hiển thị video từ Cloudinary nếu có videoSrc
            <video
              className="content-video"
              src={schedule.videoSrc}
              autoPlay
              loop
              muted
              controls
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            // Hiển thị ảnh mặc định nếu không có cả imgSrc lẫn videoSrc
            <img
              className="content-image"
              src="https://bazantravel.com/cdn/medias/uploads/83/83317-khu-nghi-duong-lan-rung-700x420.jpg"
              alt="Default Image"
            />
          )}

            <button
              className={isFavorite=== true ?  "heart-icon" : "heart-icon-empty"}
              title={isFavorite ? "Xóa khỏi wishlist" : "Lưu vào wishlist"}
              onClick={() => {
                handleHeartClick(schedule._id);
              }}
            >
              <FaHeart />
            </button>
        </div>
      </div>

      <div className="content-container">
        <div className="card-content">
          <div className="details">
            <h2>{schedule.scheduleName}</h2>
            <p className="schedule-description">{schedule.description}</p>
          </div>
          <br />
          <BsFillInfoCircleFill
            className="info-icon"
            onClick={() => handleScheduleClick(schedule._id)}
          />
        </div>
      </div>
      {attractions && attractions.length > 0 && (
        <div className="attractions-box">
          <h3 className="attractions-title">Điểm tham quan</h3>
          <div className="attractions-list">
            {attractions?.map((attraction) => (
              <div
                key={attraction._id}
                className="attraction-item"
                onClick={() => onClick(attraction._id)}
              >
                <img
                  src={
                    attraction.images[0]
                      ? `${url}/images/${attraction.images[0]}`
                      : "https://bazantravel.com/cdn/medias/uploads/83/83317-khu-nghi-duong-lan-rung-700x420.jpg"
                  }
                  alt={attraction.name}
                />
                <p>{attraction.attractionName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pricing-box">
        <h3 className="pricing-title">Chi phí</h3>
        <div className="cost-actions">
          <button
            className="toggle-costs-btn"
            onClick={() => setShowCosts(!showCosts)}
          >
            {showCosts ? "Thu gọn" : "Xem thêm"}
          </button>
        </div>
        {!showCosts && (
          <p className="hidden-costs">
            Tổng chi phí: &nbsp;
            <span>
              {totalCost.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </span>
          </p>
        )}
        {showCosts && (
          <ul className="schedule-description">
            <li>
              <span>Chi phí chỗ ở</span>
              <span>
                {activityCosts.Accommodation.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
            </li>
            <li>
              <span>Chi phí ăn uống</span>
              <span>
                {activityCosts.FoodService.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
            </li>
            <li>
              <span>Chi phí vui chơi</span>
              <span>
                {activityCosts.Attraction.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
            </li>
            <li>
              <span>Chi phí phát sinh</span>
              <span>
                {activityCosts.Additional.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
            </li>
          </ul>
        )}
      </div>

      <footer className="card-footer">
        <div className="actions">
          <i
            className={`fa-solid fa-heart favorite-icon ${
              isLike() ? "enabled" : ""
            }`}
            onClick={handleLike}
          ></i>
          <label className="action-text" htmlFor="null">
            {likes.length}
          </label>
          <i
            className="fa-solid fa-comment comment-icon"
            onClick={handleComment}
          ></i>
          <label className="action-text" htmlFor="null">
            {schedule.comments.length + handleReplyCount(schedule.comments)}
          </label>
        </div>

        <button
          className="custom-now"
          onClick={() => handleScheduleClick(schedule._id)}
        >
          Xem chi tiết
        </button>
      </footer>
    </div>
  );
};

export default PostCard;

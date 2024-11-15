import axios from 'axios';
import React, { useContext, useState } from 'react';
import { BsFillInfoCircleFill } from "react-icons/bs";
import { StoreContext } from '../../Context/StoreContext';
import './PostCard.css';
const PostCard = ({ schedule, handleScheduleClick }) => {
  const { url, user, token } = useContext(StoreContext);
  const [likes, setLikes] = useState(schedule?.likes || []);
  const activityCosts = {
    Accommodation: 0,
    FoodService: 0,
    Attraction: 0,
    Additional: 0,
  };
  const isLike = () => {
    return likes.some(like => like.idUser === user._id);
  };
  const handleComment = () => {
    handleScheduleClick(schedule._id)
  };
  const handleLike = async () => {
    try {
      const response = await axios.post(`${url}/api/schedule/user/updateLikeComment`, {
        scheduleId: schedule._id,
        userId: user._id,
        action: isLike() ? 'unlike' : 'like',
      }, { headers: { token } });
      if (response.data.success) {
        console.log("data", response.data)
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

  schedule.activities.forEach(day => {
    day.activity.forEach(activity => {
      switch (activity.activityType) {
        case 'Accommodation':
          activityCosts.Accommodation += activity.cost;
          break;
        case 'FoodService':
          activityCosts.FoodService += activity.cost;
          break;
        case 'Attraction':
          activityCosts.Attraction += activity.cost;
          break;
        default:
          activityCosts.Additional += activity.cost;
          break;
      }
    });
  });
  schedule.additionalExpenses.forEach(activity => {
    activityCosts.Additional += activity.cost;
  });
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
            <h5>{schedule.idUser.name} <span className="verified">✔</span></h5>
            <p className="user-date">{new Date(schedule.createdAt).toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </div>
        <div className='post-location'>
          <i className="fa fa-map-marker" aria-hidden="true"></i>
          <label className='location-text' htmlFor="null">{schedule.address}</label>
        </div>
      </header>

      <img
        className="content-image"
        src={schedule.imgSrc}
        alt="Alaska"
      />
      <div className='content-container'>
        <div className="card-content">
          <div className="details">
            <h2>{schedule.scheduleName}</h2>
            <p className="schedule-description">{schedule.description}</p>
          </div>
          <br />
          <BsFillInfoCircleFill className="info-icon" onClick={() => handleScheduleClick(schedule._id)} />
        </div>

      </div>
      <div className="pricing-box">
        <h3>Chi phí</h3>
        <ul className="schedule-description">
          <li><span>Chi phí chỗ ở</span><span>{activityCosts.Accommodation.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span></li>
          <li><span>Chi phí ăn uống</span><span >{activityCosts.FoodService.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span></li>
          <li><span>Chi phí vui chơi</span><span>{activityCosts.Attraction.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span></li>
          <li><span>Chi phí phát sinh</span><span>{activityCosts.Additional.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span></li>
        </ul>
        <div className="total"><span>Tổng cộng</span>
          <span>
            {
              (activityCosts.Accommodation + activityCosts.FoodService +
                activityCosts.Attraction + activityCosts.Additional)
                .toLocaleString("vi-VN", { style: "currency", currency: "VND" })
            }
          </span>
        </div>
      </div>
      <footer className="card-footer">
        <div className="actions">
          <i className={`fa-solid fa-heart favorite-icon ${isLike() ? "enabled" : ""}`} onClick={handleLike}></i>
          <label className='action-text' htmlFor="null">{likes.length}</label>
          <i className="fa-solid fa-comment comment-icon" onClick={handleComment}></i>
          <label className='action-text' htmlFor="null">{schedule.comments.length + handleReplyCount(schedule.comments)}</label>
          <i className="fa-solid fa-share share-icon"></i>
        </div>

        <button className="custom-now" onClick={() => handleScheduleClick(schedule._id)}>Xem chi tiết</button>
      </footer>

    </div>
  );
};

export default PostCard;

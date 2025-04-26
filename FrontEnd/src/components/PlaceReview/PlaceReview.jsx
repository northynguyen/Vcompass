/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import Review from '../Review/Review';
import './PlaceReview.css';
export const StarRating = ({ rating }) => {
  return (
    <div className="star-rating">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < rating ? "filled-star" : "empty-star"}>
          ★
        </span>
      ))}
    </div>
  );
};

const ReviewCard = ({ review, type }) => (
  <div className="review-card">
    <div className="user-review-container">
      <div className="review-avatar">
        <img src={review.idUser.avatar } alt={`${review.userName} avatar`} />
        {type === "accommodation" && (
          <div className="additional-info">
            <p><strong>Số đêm ở:</strong> {review.duration}</p>
            <p><strong>Loại phòng:</strong> {review.roomType}</p>
            <p><strong>Số lượng người:</strong> {review.numPeople}</p>
          </div>
        )}   
      </div>
      <div className="review-content">
        <div className="review-header">
          <h4>{review.idUser.name }</h4>
          <p>{new Date(review.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="overall-rating" >
          <StarRating rating={review.rate} />
        </div>
        {type === "accommodation" && (
          <div>
            <div>
              <p><strong>Chất lượng chỗ ở:</strong> </p>
              <StarRating rating={review.roomRate} />
            </div>

            <div>
              <p><strong>Dịch vụ:</strong> </p>
              <StarRating rating={review.serviceRate} />
            </div>
          </div>
        )}

        {type === "food" && (
          <div>
            <div>
              <p><strong>Chất đồ ăn:</strong> </p>
              <StarRating rating={review.foodRate} />
            </div>
            <div>
              <p><strong>Dịch vụ:</strong> </p>
              <StarRating rating={review.serviceRate} />
            </div>
          </div>
        )}

        {type === "attraction" && (
          <div>
            <div>
              <p><strong>Chất lượng địa điểm:</strong> </p>
              <StarRating rating={review.attractionRate} />
            </div>
            <div>
              <p><strong>Dịch vụ:</strong> </p>
              <StarRating rating={review.serviceRate} />
            </div>
          </div>
        )}

        <p>{review.content}</p>
      </div>
    </div>
    {review.response && (
      <div className="existing-response">
        <p><strong>{`Phản hồi từ nhà cung cấp: `} </strong> {review.response}</p>
        <p className='response-time'>Đã phản hồi lúc: {new Date(review.responseTime).toLocaleString()}</p>
      </div>
    )}
  </div>
);


const PlaceReview = ({ type, id , isPopup   }) => {
  const [reviews, setReviews] = useState([]);
  const [visibleReviews, setVisibleReviews] = useState(5);
  const [filterRating, setFilterRating] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(true);
  const { url } = useContext(StoreContext);
  const [showAddReview, setShowAddReview] = useState(false);
  // Fetch reviews based on the type and id props
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const href = type === "accommodation"
          ? `${url}/api/accommodations/getAccomm/${id}`
          : type === "food"
            ? `${url}/api/foodservices/${id}`
            : `${url}/api/attractions/${id}`;
        const response = await fetch(href);
        const data = await response.json();
        const reviewsData = type === "accommodation"
          ? data.accommodation.ratings
          : type === "food"
            ? data.foodService.ratings
            : data.attraction.ratings;

        // Sort reviews by creation date (most recent first)
        const sortedReviews = reviewsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setReviews(sortedReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [type, id, url, showAddReview]);


  // Calculate the average rating
  const totalRating = reviews.length
    ? reviews.reduce((acc, review) => acc + review.rate, 0) / reviews.length
    : 0;

  const showMoreReviews = () => {
    setVisibleReviews(filteredReviews.length);
    setShowAllReviews(false);
  };

  const showLessReviews = () => {
    setVisibleReviews(5);
    setShowAllReviews(true);
  };

  const handleRatingFilter = (rating) => {
    setFilterRating(rating);
    setVisibleReviews(5);
    setShowAllReviews(true);
  };

  const onClickAddReview = (e) => {
    e.preventDefault();
    setShowAddReview(true);
  }
  const filteredReviews = filterRating > 0
    ? reviews.filter(review => review.rate === filterRating)
    : reviews;

  return (
    <div className="reviews-container">
      <h3>Đánh giá của khách hàng</h3>
      <div className="average-rating">
        <div className="overall-rating">
          <div>
            <h1>{totalRating.toFixed(2)} / 5.0</h1>
            <StarRating rating={Math.round(totalRating)} />
          </div>
          <div>
            <p>{reviews.length} Lượt đánh giá</p>
          </div>
        </div>

        {(type !== "accommodation" || isPopup === true) && !showAddReview && (
          <button className="write-review-btn" onClick={onClickAddReview}>Viết đánh giá</button>
        )}

      </div>

      {/* Rating Filter */}
      <div className="filter-container">
        <button onClick={() => handleRatingFilter(0)} className={filterRating === 0 ? 'active' : ''}>All</button>
        {[5, 4, 3, 2, 1].map(star => (
          <button
            key={star}
            onClick={() => handleRatingFilter(star)}
            className={filterRating === star ? 'active' : ''}
          >
            {star} Sao
          </button>
        ))}
      </div>

      <div className="reviews-list">
        {filteredReviews.slice(0, visibleReviews).map((review) => (
          <ReviewCard key={review._id} review={review} type={type} />
        ))}
      </div>
      <div className="show-more-container">
        {visibleReviews < filteredReviews.length && (
          <button onClick={showMoreReviews} className="show-more-btn">
            Show More
          </button>
        )}
        {visibleReviews === filteredReviews.length && visibleReviews > 5 && (
          <button onClick={showLessReviews} className="show-more-btn">
            Show Less
          </button>
        )}
      </div>

      {showAddReview && (
        <div className="add-review-container">
          <div className="popup-review ">
            <div className="popup-content" >
              <button className="close-popup-review " onClick={() => setShowAddReview(false)}>×</button>
              <Review id={id} type={type} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default PlaceReview;
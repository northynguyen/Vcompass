/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import './PlaceReview.css';

const reviews = [
  {
    id: 1,
    name: "Arlene McCoy",
    date: "2 October 2012",
    rating: 5,
    comment: "Good Tour, Really Well Organised!",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    numberOfNights: 3,
    roomType: "Deluxe",
    numberOfPeople: 2
  },
  {
    id: 2,
    name: "Jenny Wilson",
    date: "2 October 2012",
    rating: 4,
    comment: "Informative But Disappointed Not Seeing Changing Of The Guards",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    numberOfNights: 2,
    roomType: "Standard",
    numberOfPeople: 1
  },
  {
    id: 3,
    name: "Ralph Edwards",
    date: "2 October 2012",
    rating: 4,
    comment: "I Love Their Way Of Style. The tour was very well organised. One minus is that you get completely bombarded with information...",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    numberOfNights: 4,
    roomType: "Suite",
    numberOfPeople: 3
  },
  {
    id: 4,
    name: "Courtney Henry",
    date: "2 October 2012",
    rating: 4,
    comment: "Enjoyed Very Much. The tour was very well organised. One minus is that you get completely bombarded with information...",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    numberOfNights: 1,
    roomType: "Standard",
    numberOfPeople: 2
  },
  {
    id: 5,
    name: "Devon Lane",
    date: "2 October 2012",
    rating: 4,
    comment: "Nice!!!!!!! The tour was very well organised. One minus is that you get completely bombarded with information...",
    avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    numberOfNights: 2,
    roomType: "Deluxe",
    numberOfPeople: 4
  },
  {
    id: 6,
    name: "Mark Simpson",
    date: "2 October 2012",
    rating: 5,
    comment: "Amazing experience, great guide and wonderful service...",
    avatar: "https://randomuser.me/api/portraits/men/6.jpg",
    numberOfNights: 5,
    roomType: "Suite",
    numberOfPeople: 2
  },
  {
    id: 7,
    name: "Alice Brown",
    date: "2 October 2012",
    rating: 3,
    comment: "It was good, but could have been better...",
    avatar: "https://randomuser.me/api/portraits/women/7.jpg",
    numberOfNights: 3,
    roomType: "Standard",
    numberOfPeople: 1
  },
  // Thêm các đánh giá khác ở đây nếu cần
];

// Tính tổng số sao trung bình
const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

const StarRating = ({ rating }) => {
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

const ReviewCard = ({ review }) => (
  <div className="review-card">
    <div className="review-avatar">
      <img src={review.avatar} alt={`${review.name} avatar`} />
      {/* Thông tin mới */}
      <div className="additional-info">
        <p><strong>Số đêm ở:</strong> {review.numberOfNights}</p>
        <p><strong>Loại phòng:</strong> {review.roomType}</p>
        <p><strong>Số lượng người:</strong> {review.numberOfPeople}</p>
      </div>
    </div>
    <div className="review-content">
      <div className="review-header">
        <h4>{review.name}</h4>
        <p>{review.date}</p>
      </div>
      <StarRating rating={review.rating} />
      <p>{review.comment}</p>
      
      
    </div>
  </div>
);

const PlaceReview = () => {
  const [visibleReviews, setVisibleReviews] = useState(5); // Hiển thị 5 review đầu tiên
  const [filterRating, setFilterRating] = useState(0); // Lọc theo số sao, 0 là không lọc
  const [showAllReviews, setShowAllReviews] = useState(true); // Trạng thái của "Show More/Less"

  // Hàm hiển thị toàn bộ review
  const showMoreReviews = () => {
    setVisibleReviews(filteredReviews.length); // Hiển thị toàn bộ review
    setShowAllReviews(false); // Đổi trạng thái để hiển thị nút "Show Less"
  };

  // Hàm thu gọn lại review
  const showLessReviews = () => {
    setVisibleReviews(5); // Thu gọn lại chỉ hiển thị 5 review
    setShowAllReviews(true); // Đổi trạng thái về "Show More"
  };

  const handleRatingFilter = (rating) => {
    setFilterRating(rating);
    setVisibleReviews(5); // Reset lại số review hiển thị khi lọc
    setShowAllReviews(true); // Khi lọc mới, đặt lại trạng thái nút về "Show More"
  };

  // Lọc các review theo số sao đã chọn (nếu có)
  const filteredReviews = filterRating > 0
    ? reviews.filter(review => review.rating === filterRating)
    : reviews;

  return (
    <div className="reviews-container">
      <h3>Customer Review</h3>
      <div className="average-rating">
        <div>
          <h1>{totalRating.toFixed(2)} / 5.0</h1>
          <StarRating rating={Math.round(totalRating)} />
        </div>
        <p>{reviews.length} Reviews</p>
      </div>

      {/* Bộ lọc theo số sao */}
      <div className="filter-container">
        <button onClick={() => handleRatingFilter(0)} className={filterRating === 0 ? 'active' : ''}>All</button>
        <button onClick={() => handleRatingFilter(5)} className={filterRating === 5 ? 'active' : ''}>5 Stars</button>
        <button onClick={() => handleRatingFilter(4)} className={filterRating === 4 ? 'active' : ''}>4 Stars</button>
        <button onClick={() => handleRatingFilter(3)} className={filterRating === 3 ? 'active' : ''}>3 Stars</button>
        <button onClick={() => handleRatingFilter(2)} className={filterRating === 2 ? 'active' : ''}>2 Stars</button>
        <button onClick={() => handleRatingFilter(1)} className={filterRating === 1 ? 'active' : ''}>1 Star</button>
      </div>

      <div className="reviews-list">
        {filteredReviews.slice(0, visibleReviews).map((review) => (
          <ReviewCard key={review.id} review={review} />
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
      
    </div>
  );
};

export default PlaceReview;

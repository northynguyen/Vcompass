import  { useState, useRef, useEffect } from 'react';

import './Review.css';
import PlaceReview from '../PlaceReview/PlaceReview';
const Review = () => {
    const [rating, setRating] = useState({
        overall: 0,
        room: 0,
        service: 0,
        location: 0,
        value: 0,
    });
    const [comments, setComments] = useState('');

    // Tạo ref cho phần reviews
    const reviewsRef = useRef(null);

    useEffect(() => {
        // Cuộn đến phần reviews khi component được mount
        if (reviewsRef.current) {
            reviewsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    const handleRatingChange = (criteria, value) => {
        setRating((prev) => ({
            ...prev,
            [criteria]: value,
        }));
    };

    const handleCommentsChange = (e) => {
        setComments(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic gửi dữ liệu (ví dụ: gửi đến API)
        console.log('Rating:', rating);
        console.log('Comments:', comments);
        // Reset form sau khi gửi
        setRating({
            overall: 0,
            room: 0,
            service: 0,
            location: 0,
            value: 0,
        });
        setComments('');
    };

    return (
        <div className="review-container">
            {/* Gán ref vào PlaceReview hoặc một div bao quanh */}
            <div >
                <PlaceReview />
            </div>
            <h3>Review Your Stay</h3>
            <form onSubmit={handleSubmit} ref={reviewsRef}>
                <div className="rating-group">
                    <label>Overall Rating:</label>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            onClick={() => handleRatingChange('overall', star)}
                            style={{ cursor: 'pointer', fontSize: '1.5em', color: star <= rating.overall ? '#FFD700' : '#CCCCCC' }}
                        >
                            {star <= rating.overall ? '★' : '☆'}
                        </span>
                    ))}
                </div>

                <div className="rating-group">
                    <label>Room Rating:</label>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            onClick={() => handleRatingChange('room', star)}
                            style={{ cursor: 'pointer', fontSize: '1.5em', color: star <= rating.room ? '#FFD700' : '#CCCCCC' }}
                        >
                            {star <= rating.room ? '★' : '☆'}
                        </span>
                    ))}
                </div>

                <div className="rating-group">
                    <label>Service Rating:</label>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            onClick={() => handleRatingChange('service', star)}
                            style={{ cursor: 'pointer', fontSize: '1.5em', color: star <= rating.service ? '#FFD700' : '#CCCCCC' }}
                        >
                            {star <= rating.service ? '★' : '☆'}
                        </span>
                    ))}
                </div>

                <div className="rating-group">
                    <label>Location Rating:</label>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            onClick={() => handleRatingChange('location', star)}
                            style={{ cursor: 'pointer', fontSize: '1.5em', color: star <= rating.location ? '#FFD700' : '#CCCCCC' }}
                        >
                            {star <= rating.location ? '★' : '☆'}
                        </span>
                    ))}
                </div>

                <div className="rating-group">
                    <label>Value Rating:</label>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            onClick={() => handleRatingChange('value', star)}
                            style={{ cursor: 'pointer', fontSize: '1.5em', color: star <= rating.value ? '#FFD700' : '#CCCCCC' }}
                        >
                            {star <= rating.value ? '★' : '☆'}
                        </span>
                    ))}
                </div>

                <div className="comment-section">
                    <label>Comments:</label>
                    <textarea 
                        value={comments} 
                        onChange={handleCommentsChange} 
                        placeholder="Write your review here..."
                        required
                        style={{ width: '100%', height: '100px', padding: '10px', marginTop: '5px' }}
                    />
                </div>

                <button type="submit" className="submit-btn">Submit Review</button>
            </form>
        </div>
    );
};

export default Review;

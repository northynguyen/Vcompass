import { useContext, useEffect, useRef, useState } from "react";
import { StoreContext } from "../../Context/StoreContext";
import PlaceReview from "../PlaceReview/PlaceReview";
import "./Review.css";

const Review = ({ type, id, booking, onClose }) => {
    const [rating, setRating] = useState({
        overall: 0,
        room: 0,
        service: 0,
        food: 0,
        location: 0,
        value: 0,
    });
    const { url, user } = useContext(StoreContext);
    const [comments, setComments] = useState("");

    const reviewsRef = useRef(null);

    useEffect(() => {
        if (reviewsRef.current) {
            reviewsRef.current.scrollIntoView({ behavior: "smooth" });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Rating:", rating);
        console.log("Comments:", comments);
        const href =
            type === "accommodation"
                ? `${url}/api/accommodations/addReview/${id}`
                : type === "food"
                ? `${url}/api/foodservices/addReview/${id}`
                : `${url}/api/attractions/addReview/${id}`;

        try {
            const response = await fetch(href, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    idUser: user._id,
                    userName: user?.name || user.email,
                    userImage: user.image || "https://via.placeholder.com/150",
                    rate: rating.overall,
                    content: comments,
                    serviceRate: rating.service,
                    roomRate: rating?.room || 0,
                    foodRate: rating?.food || 0,
                    attractionRate: rating?.location || 0,
                    duration: booking?.duration || null,
                    roomType: booking?.roomType || null,
                    numPeople: booking
                        ? `${booking.numberOfGuests.adult} người lớn - ${booking.numberOfGuests.child} trẻ em`
                        : null,
                }),
            });

            const responseData = await response.json();

            if (response.ok) {
                console.log("Đánh giá đã được gửi thành công");
                alert(responseData.message);
            } else {
                alert(responseData.message);
            }
        } catch (error) {
            console.error("Lỗi khi gửi đánh giá:", error);
            alert("Đã xảy ra lỗi khi gửi đánh giá.");
        }

        setRating({
            overall: 0,
            room: 0,
            service: 0,
            location: 0,
            food: 0,
            value: 0,
        });
        setComments("");
        onClose();
    };

    return (
        <div className="review-container">
            <div>
                <PlaceReview id={id} type={type} />
            </div>
            <h3>Đánh giá của bạn</h3>
            <form onSubmit={handleSubmit} ref={reviewsRef}>
                <div className="rating-group">
                    <label>Đánh giá tổng quan:</label>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            onClick={() => handleRatingChange("overall", star)}
                            style={{
                                cursor: "pointer",
                                fontSize: "1.5em",
                                color: star <= rating.overall ? "#FFD700" : "#CCCCCC",
                            }}
                        >
                            {star <= rating.overall ? "★" : "☆"}
                        </span>
                    ))}
                </div>
                {type === "accommodation" && (
                    <div className="rating-group">
                        <label>Đánh giá phòng:</label>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                onClick={() => handleRatingChange("room", star)}
                                style={{
                                    cursor: "pointer",
                                    fontSize: "1.5em",
                                    color: star <= rating.room ? "#FFD700" : "#CCCCCC",
                                }}
                            >
                                {star <= rating.room ? "★" : "☆"}
                            </span>
                        ))}
                    </div>
                )}

                {type === "food" && (
                    <div className="rating-group">
                        <label>Đánh giá món ăn:</label>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                onClick={() => handleRatingChange("food", star)}
                                style={{
                                    cursor: "pointer",
                                    fontSize: "1.5em",
                                    color: star <= rating.food ? "#FFD700" : "#CCCCCC",
                                }}
                            >
                                {star <= rating.food ? "★" : "☆"}
                            </span>
                        ))}
                    </div>
                )}

                {type === "attraction" && (
                    <div className="rating-group">
                        <label>Đánh giá địa điểm:</label>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                onClick={() => handleRatingChange("location", star)}
                                style={{
                                    cursor: "pointer",
                                    fontSize: "1.5em",
                                    color: star <= rating.location ? "#FFD700" : "#CCCCCC",
                                }}
                            >
                                {star <= rating.location ? "★" : "☆"}
                            </span>
                        ))}
                    </div>
                )}

                <div className="rating-group">
                    <label>Đánh giá dịch vụ:</label>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            onClick={() => handleRatingChange("service", star)}
                            style={{
                                cursor: "pointer",
                                fontSize: "1.5em",
                                color: star <= rating.service ? "#FFD700" : "#CCCCCC",
                            }}
                        >
                            {star <= rating.service ? "★" : "☆"}
                        </span>
                    ))}
                </div>

                <div className="comment-section">
                    <label>Bình luận:</label>
                    <textarea
                        value={comments}
                        onChange={handleCommentsChange}
                        placeholder="Viết đánh giá của bạn tại đây..."
                        required
                        style={{
                            width: "100%",
                            height: "100px",
                            padding: "10px",
                            marginTop: "5px",
                        }}
                    />
                </div>

                <button type="submit" className="submit-btn">
                    Gửi đánh giá
                </button>
            </form>
        </div>
    );
};

export default Review;

import React, { useEffect, useState, useContext } from "react";
import "./ListAttractions.css";
import axios from "axios";
import { StoreContext } from "../../Context/StoreContext";

// Tính tổng số sao và đánh giá
const calculateTotalRate = (ratings) => {
  const totalReviews = ratings.length;
  if (totalReviews === 0) return "No reviews"; // Tránh chia cho 0
  const averageRating = ratings.reduce((sum, review) => sum + review.rate, 0) / totalReviews;
  const stars = "★".repeat(Math.floor(averageRating)) + "☆".repeat(5 - Math.floor(averageRating));
  return `${stars} (${totalReviews} reviews)`;
};

// TourItem Component
const TourItem = ({ imgSrc, name, description, price, totalRate }) => (
  <div className="tour-item">
    <img src={imgSrc} alt={name} className="tour-image" />
    <div className="tour-details">
      <div className="tour-header">
        <span className="tour-rating">{totalRate}</span>
      </div>
      <h3>{name}</h3>
      <div className="tour-info">
        <p>{description}</p>
      </div>
    </div>
    <div className="tour-price">
      <span className="price-text">{price}</span>
      <span className="persion-text">per person</span>
    </div>
  </div>
);

// TourList Component
const TourList = ({ tours, sortOption, status }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [toursPerPage] = useState(status === "Schedule" ? 3 : 8);

  const sortedTours = [...tours].sort((a, b) => {
    switch (sortOption) {
      case "PriceLowToHigh":
        return parseFloat(a.price.replace(/₫/g, "").replace(/,/g, "")) - parseFloat(b.price.replace(/₫/g, "").replace(/,/g, ""));
      case "PriceHighToLow":
        return parseFloat(b.price.replace(/₫/g, "").replace(/,/g, "")) - parseFloat(a.price.replace(/₫/g, "").replace(/,/g, ""));
      case "Rating":
        // Assuming rating-based sorting logic can be added here
        return 0; // Placeholder
      case "Popularity":
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedTours.length / toursPerPage);
  const currentTours = sortedTours.slice(
    (currentPage - 1) * toursPerPage,
    currentPage * toursPerPage
  );

  return (
    <div className="tour-list">
      {currentTours.map((tour, index) => (
        <TourItem
          key={index}
          imgSrc={tour.imgSrc}
          name={tour.name}
          description={tour.description}
          price={tour.price}
          totalRate={tour.totalRate}
        />
      ))}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

// Component cho Filters
const Filters = ({ sortOption, setSortOption }) => {
  return (
    <div className="filters">
      <div className="filter-section">

        <h4>Availability</h4>
        <div>
          <label>From</label>
          <input type="date" />
        </div>
        <div>
          <label>To</label>
          <input type="date" />
        </div>
        <button>Check Availability</button>
        <hr />
        <h4>Sort by Price</h4>
        <label>
          <input
            type="radio"
            value="PriceLowToHigh"
            checked={sortOption === "PriceLowToHigh"}
            onChange={() => setSortOption("PriceLowToHigh")}
          />
          Price Low to High
        </label>
        <label>
          <input
            type="radio"
            value="PriceHighToLow"
            checked={sortOption === "PriceHighToLow"}
            onChange={() => setSortOption("PriceHighToLow")}
          />
          Price High to Low
        </label>
      </div>
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
  return (
    <div className="pagination">
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};

// Main ListAccom Component
const ListAccom = ({ status }) => {
  const { url } = useContext(StoreContext);
  const [tours, setTours] = useState([]);
  const [sortOption, setSortOption] = useState("Popularity");

  // Lấy dữ liệu từ API khi component được render lần đầu
  useEffect(() => {
    axios.get(`${url}/api/attractions/`)
      .then(response => {
        const dbAttractions = response.data.attractions;
        console.log(dbAttractions); // Lấy dữ liệu trực tiếp từ response

        // Chuyển đổi dữ liệu từ API sang định dạng tours
        const mappedTours = dbAttractions.map(attraction => ({
          imgSrc: attraction.image[0], // Dùng ảnh đầu tiên
          name: attraction.attraction_name,
          description: attraction.description,
          price: `${(attraction.price).toLocaleString()}₫`, // Chuyển đổi giá thành chuỗi
          totalRate: calculateTotalRate(attraction.rating),
        }));

        setTours(mappedTours); // Cập nhật state tours với dữ liệu mới
      })
      .catch(error => {
        console.error('Error fetching data from API:', error);
      });
  }, [url]);

  return (
    <div className="app-container">
      <div className="main-content-container">
        <div className="main-content">
          <Filters sortOption={sortOption} setSortOption={setSortOption} />
          <div className="tour-list-container">
            <TourList tours={tours} sortOption={sortOption} status={status} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListAccom;

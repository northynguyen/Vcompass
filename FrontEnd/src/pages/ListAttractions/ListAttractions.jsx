import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../Context/StoreContext";
import "./ListAttractions.css";

// Tính tổng số sao và đánh giá
const calculateTotalRate = (ratings) => {
  const totalReviews = ratings.length;
  if (totalReviews === 0) return "No reviews"; // Tránh chia cho 0
  const averageRating = ratings.reduce((sum, review) => sum + review.rate, 0) / totalReviews;
  const stars = "★".repeat(Math.floor(averageRating)) + "☆".repeat(5 - Math.floor(averageRating));
  return `${stars} (${totalReviews} reviews)`;
};

// TourItem Component
const TourItem = ({ imgSrc, name, description, price, totalRate, status, setCurrentActivity }) => {

  const handleSelect = () => {
    setCurrentActivity({
      imgSrc,
      name,
      description,
      price,
      totalRate
    });
    console.log(name)
  };

  return (
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
        <div className="price-container">
          <span className="price-text" >{price}</span>
          <span className="persion-text">per person</span>
        </div>
        {
          status === "Schedule" && <SelectButton onClick={handleSelect} />
        }
      </div>
    </div>
  );
}
const SelectButton = () => {
  return (
    <div className="select-container">
      <button className="selection-btn">Chọn</button>
    </div>
  );
}
// TourList Component
const TourList = ({ tours, sortOption, status, setCurrentActivity }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [toursPerPage] = useState(status === "Schedule" ? 3 : 8);

  const sortedTours = [...tours].sort((a, b) => {
    switch (sortOption) {
      case "PriceLowToHigh":
        return parseFloat(a.price.replace(/₫/g, "").replace(/,/g, "")) - parseFloat(b.price.replace(/₫/g, "").replace(/,/g, ""));
      case "PriceHighToLow":
        return parseFloat(b.price.replace(/₫/g, "").replace(/,/g, "")) - parseFloat(a.price.replace(/₫/g, "").replace(/,/g, ""));
      case "Rating":
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
    <div className="list-accom__tour-list">
      {currentTours.map((tour, index) => (
        <TourItem
          key={index}
          imgSrc={tour.imgSrc}
          name={tour.name}
          description={tour.description}
          price={tour.price}
          totalRate={tour.totalRate}
          status={status}
          setCurrentActivity={setCurrentActivity}
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
    <div className="list-accom__filters">
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
    <div className="list-accom__pagination">
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
const ListAccom = ({ status, setCurrentActivity }) => {
  const { url } = useContext(StoreContext);
  const [tours, setTours] = useState([]);
  const [sortOption, setSortOption] = useState("Popularity");

  useEffect(() => {
    axios.get(`${url}/api/attractions/`)
      .then(response => {
        const dbAttractions = response.data.attractions;
        console.log(dbAttractions);

        const mappedTours = dbAttractions.map(attraction => ({
          imgSrc: attraction.image[0],
          name: attraction.attraction_name,
          description: attraction.description,
          price: `${(attraction.price).toLocaleString()}₫`,
          totalRate: calculateTotalRate(attraction.rating),
        }));

        setTours(mappedTours);
      })
      .catch(error => {
        console.error('Error fetching data from API:', error);
      });
  }, [url]);

  return (
    <div className="list-accom__container">
          <Filters sortOption={sortOption} setSortOption={setSortOption} />
          <div className="tour-list-container">
            <TourList tours={tours} sortOption={sortOption} status={status}
              setCurrentActivity={setCurrentActivity} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListAccom;
export { TourItem };


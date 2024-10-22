import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "./ListFoodServices.css";
import { StoreContext } from "../../Context/StoreContext";

// Helper function for calculating ratings
const calculateTotalRate = (ratings) => {
  const totalReviews = ratings.length;
  if (totalReviews === 0) return "No reviews";
  const averageRating = ratings.reduce((sum, review) => sum + review.rate, 0) / totalReviews;
  const stars = "★".repeat(Math.floor(averageRating)) + "☆".repeat(5 - Math.floor(averageRating));
  return `${stars} (${totalReviews} reviews)`;
};

// TourItem Component
const TourItem = ({ imgSrc, name, description, totalRate, location, facilities, url , price}) => (
  <div className="list-accom__tour-item">
    <img src={`${url}/images/${imgSrc}`} alt={name} className="list-accom__tour-item-image" />
    <div className="list-accom__tour-details">
      <h3>{name}</h3>
      <div className="list-accom__tour-location">
        <a href="#">{location}</a>
      </div>
      <div className="list-accom__tour-facilities">
        {facilities.map((facility, index) => (
          <span key={index}>{facility}</span>
        ))}
      </div>
      <p>{description}</p>
      <div className="list-accom__tour-rating">{totalRate}</div>
    </div>
    <div className="list-accom__tour-price">
      <p>{price.minPrice} VND - {price.maxPrice} VND</p>
      <button className="list-accom__show-prices-button">Show prices</button>
    </div>
  </div>
);

// TourList Component
const TourList = ({ tours, sortOption, status, url }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const toursPerPage = status === "Schedule" ? 3 : 8;
  const sortedTours = [...tours].sort((a, b) => {
    switch (sortOption) {
      case "PriceLowToHigh":
        return parseFloat(a.price.replace(/₫/g, "").replace(/,/g, "")) - parseFloat(b.price.replace(/₫/g, "").replace(/,/g, ""));
      case "PriceHighToLow":
        return parseFloat(b.price.replace(/₫/g, "").replace(/,/g, "")) - parseFloat(a.price.replace(/₫/g, "").replace(/,/g, ""));
      case "Rating":
      default:
        return 0;
    }
  });
  const totalPages = Math.ceil(sortedTours.length / toursPerPage);
  const currentTours = sortedTours.slice((currentPage - 1) * toursPerPage, currentPage * toursPerPage);

  return (
    <div className="list-accom__tour-list">
      {currentTours.map((tour, index) => (
        <TourItem key={index} {...tour} url={url} />
      ))}
      <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
    </div>
  );
};

// Filters Component
const Filters = ({ sortOption, setSortOption }) => (
  <div className="list-accom__filters">
    <h4>Availability</h4>
    <label>From</label>
    <input type="date" />
    <label>To</label>
    <input type="date" />
    <button>Check Availability</button>
    <hr />
    <h4>Sort by Price</h4>
    <label>
      <input type="radio" value="PriceLowToHigh" checked={sortOption === "PriceLowToHigh"} onChange={() => setSortOption("PriceLowToHigh")} />
      Price Low to High
    </label>
    <label>
      <input type="radio" value="PriceHighToLow" checked={sortOption === "PriceHighToLow"} onChange={() => setSortOption("PriceHighToLow")} />
      Price High to Low
    </label>
  </div>
);

// Pagination Component
const Pagination = ({ currentPage, totalPages, setCurrentPage }) => (
  <div className="list-accom__pagination">
    <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
    <span>Page {currentPage} of {totalPages}</span>
    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
  </div>
);

// Main ListAccom Component
const ListFoodServices = ({ status }) => {
  const { url } = useContext(StoreContext);
  const [tours, setTours] = useState([]);
  const [sortOption, setSortOption] = useState("Popularity");

  useEffect(() => {
    axios.get(`${url}/api/foodservices/`)
      .then(response => {
        const mappedTours = response.data.foodService.map(foodservice => ({
          imgSrc: foodservice.images[0],
          name: foodservice.foodServiceName,
          description: foodservice.description,
          price: foodservice.price,
          totalRate: calculateTotalRate(foodservice.ratings),
          location: foodservice.location.address,
          facilities: foodservice.amenities,
        }));
        setTours(mappedTours);
      })
      .catch(error => console.error('Error fetching data from API:', error));
  }, [url]);

  return (
    <div className="list-accom__container">
      <Filters sortOption={sortOption} setSortOption={setSortOption} />
      <TourList tours={tours} sortOption={sortOption} status={status} url={url} />
    </div>
  );
};

export default ListFoodServices;

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
const AttractionItem = ({ imgSrc, name, description, price,
  totalRate, location, facilities, status, setCurrentActivity, idDestination }) => {
  const { url } = useContext(StoreContext);
  console.log("id:", idDestination)
  const handleSelect = () => {
    setCurrentActivity({
      idDestination,
      imgSrc,
      name,
      description,
      price,
      location,
      facilities,
      totalRate,
      activityType: "Attraction",
      visible: true
    });
    console.log(name)
  };

  return (
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
        <div className="price-container">
          <p className="price-text">{price}</p>
        </div>
        {
          status === "Schedule" && <SelectButton onClick={handleSelect} />
        }
      </div>
    </div>
  );
}
const SelectButton = ({ onClick }) => {
  return (
    <div onClick={onClick} className="select-container">
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
  console.log("currrentTour:", currentTours)
  return (
    <div className="list-accom__tour-list">
      {currentTours.map((tour, index) => (
        <AttractionItem
          key={index}
          {...tour}
          idDestination={tour.idDestination}
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
        const mappedTours = dbAttractions.map(attraction => ({
          idDestination: attraction._id,
          imgSrc: attraction.images[0],
          name: attraction.attractionName,
          description: attraction.description,
          price: `${(attraction.price).toLocaleString()}₫`,
          totalRate: calculateTotalRate(attraction.ratings),
          location: attraction.location.address,
          facilities: attraction.amenities,
        }));
        console.log("attraction", response)
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
  )
};

export default ListAccom;
export { AttractionItem, SelectButton };


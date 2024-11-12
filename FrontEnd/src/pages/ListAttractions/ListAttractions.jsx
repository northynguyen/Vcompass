import CryptoJS from "crypto-js";
import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../Context/StoreContext";
import "./ListAttractions.css";

export const calculateTotalRate = (ratings) => {
  const totalReviews = ratings.length;
  if (totalReviews === 0) return "No reviews";
  const averageRating = ratings.reduce((sum, review) => sum + review.rate, 0) / totalReviews;
  const stars = "★".repeat(Math.floor(averageRating)) + "☆".repeat(5 - Math.floor(averageRating));
  return `${stars} (${totalReviews} reviews)`;
};

const AttractionItem = ({ attraction, status, setCurDes, id }) => {
  const { url } = useContext(StoreContext);
  const handleSelect = (e) => {
    e.stopPropagation();
    attraction.activityType = "Attraction";
    setCurDes(attraction);
  };

  const onNavigateToDetails = () => {
    const encryptedServiceId = CryptoJS.AES.encrypt(attraction._id, 'mySecretKey').toString();
    const safeEncryptedServiceId = encodeURIComponent(encryptedServiceId);
    window.open(`/place-details/attraction/${safeEncryptedServiceId}`, "_blank");
  };

  return (
    <div className="list-accom__tour-item" onClick={onNavigateToDetails}>
      <img src={`${url}/images/${attraction.images[0]}`} alt={attraction.name} className="list-accom__tour-item-image" />
      <div className="list-accom__tour-details">
        <h3>{attraction.attractionName}</h3>
        <div className="list-accom__tour-location">
          <a
            href={`https://www.google.com/maps/?q=${attraction.location.latitude},${attraction.location.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {attraction.location.address}
          </a>
        </div>
        <div className="list-accom__tour-facilities">
          {attraction.amenities.map((facility, index) => (
            <span key={index}>{facility}</span>
          ))}
        </div>
        <p>{attraction.description}</p>
        <div className="list-accom__tour-rating">{calculateTotalRate(attraction.ratings)}</div>
      </div>
      <div className="list-accom__tour-price">
        <div className="price-container">
          <p className="price-text">{attraction.price}đ</p>
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
const AttractionList = ({ attractions, sortOption, status, setCurDes }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [toursPerPage] = useState(status === "Schedule" ? 3 : 8);

  const sortedTours = Object.values(attractions).sort((a, b) => {
    switch (sortOption) {
      case "PriceLowToHigh":
        return parseFloat(a.price.replace(/₫/g, "").replace(/,/g, "")) - parseFloat(b.price.replace(/₫/g, "").replace(/,/g, ""));
      case "PriceHighToLow":
        return parseFloat(b.price.replace(/₫/g, "").replace(/,/g, "")) - parseFloat(a.price.replace(/₫/g, "").replace(/,/g, ""));
      case "Rating":
        return 0;
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
      {currentTours.map((tour) => (
        <AttractionItem
          key={tour._id}
          attraction={tour}
          status={status}
          setCurDes={setCurDes}
          id={tour._id}
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
const ListAccom = ({ status, setCurDes }) => {
  const { url } = useContext(StoreContext);
  const [attractions, setAttractions] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState("Popularity");
  const fetchData = async () => {
    try {
      let response = await fetch(`${url}/api/attractions/`)
      const result = await response.json();
      setIsLoading(false)
      if (!response.ok) {
        throw new Error(result.message || 'Error fetching data');
      }
      setAttractions(result.attractions);
    } catch (err) {
      console.log(err)
    }
  }
  useEffect(() => {
    fetchData();
  }, [url]);
  if (isLoading) {
    return (
      <div>...</div>
    )
  }
  return (
    <div className="list-accom__container">
      <Filters sortOption={sortOption} setSortOption={setSortOption} />
      <div className="tour-list-container">
        <AttractionList attractions={attractions} sortOption={sortOption} status={status}
          setCurDes={setCurDes} />
      </div>
    </div>
  )
};

export default ListAccom;
export { AttractionItem, SelectButton };


import CryptoJS from "crypto-js";
import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../Context/StoreContext";
import { calculateTotalRate, SelectButton } from "../ListAttractions/ListAttractions";
import "./ListFoodServices.css";

// TourItem Component
const FoodServiceItem = ({ foodService, status, setCurDes, id }) => {
  const { url } = useContext(StoreContext);
  const handleSelect = (e) => {
    e.stopPropagation();
    foodService.activityType = "FoodService";
    setCurDes(foodService);
  };

  const onNavigateToDetails = () => {
    const encryptedServiceId = CryptoJS.AES.encrypt(foodService._id, 'mySecretKey').toString();
    const safeEncryptedServiceId = encodeURIComponent(encryptedServiceId);
    window.open(`/place-details/food/${safeEncryptedServiceId}`, "_blank");
  };
  return (
    <div className="list-accom__tour-item" onClick={onNavigateToDetails}>
      <img src={`${url}/images/${foodService.images[0]}`} alt={foodService.name} className="list-accom__tour-item-image" />
      <div className="list-accom__tour-details">
        <h3>{foodService.foodServiceName}</h3>
        <div className="list-accom__tour-location">
          <a
            href={`https://www.google.com/maps/?q=${foodService.location.latitude},${foodService.location.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {foodService.location.address}
          </a>
        </div>
        <div className="list-accom__tour-facilities">
          {foodService.amenities.map((facility, index) => (
            <span key={index}>{facility}</span>
          ))}
        </div>
        <p>{foodService.description}</p>
        <div className="list-accom__tour-rating">{calculateTotalRate(foodService.ratings)}</div>
      </div>
      <div className="list-accom__tour-price">
        <div className="price-container">
          <p className="price-text">{foodService.price.minPrice} - {foodService.price.maxPrice}₫</p>
        </div>
        {
          status === "Schedule" && <SelectButton onClick={handleSelect} />
        }
      </div>
    </div>
  );
}

// TourList Component
const TourList = ({ foodServices, sortOption, status, setCurDes }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const toursPerPage = status === "Schedule" ? 3 : 8;
  const sortedTours = Object.values(foodServices).sort((a, b) => {
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
        <FoodServiceItem key={tour._id} foodService={tour}
          status={status} setCurDes={setCurDes} id={tour._id} />
      ))}
      <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
    </div>
  );
};

// Filters Component
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
const Pagination = ({ currentPage, totalPages, setCurrentPage }) => (
  <div className="list-accom__pagination">
    <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
    <span>Page {currentPage} of {totalPages}</span>
    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
  </div>
);

// Main ListAccom Component
const ListFoodServices = ({ status, setCurDes }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [foodServices, setFoodServices] = useState();
  const [sortOption, setSortOption] = useState("Popularity");
  const { url } = useContext(StoreContext);
  const fetchData = async () => {
    try {
      let response = await fetch(`${url}/api/foodServices/`)
      const result = await response.json();
      setIsLoading(false)
      if (!response.ok) {
        throw new Error(result.message || 'Error fetching data');
      }
      setFoodServices(result.foodService);
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
      <TourList foodServices={foodServices} sortOption={sortOption}
        status={status} setCurDes={setCurDes} />
    </div>
  );
};

export default ListFoodServices;
export { FoodServiceItem };


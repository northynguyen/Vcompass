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
        <span>{foodService.description.length > 150 ? foodService.description.substring(0, 150) + "..." : foodService.description}</span>
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
const Filters = ({ 
  sortOption, setSortOption, setNameFilter, setMinPrice, setMaxPrice, 
  nameFilter, minPrice, maxPrice, fetchAccommodations, isLoading
}) => {
  const handleFilterChange = () => {
    fetchAccommodations(); // Trigger fetch when filters are changed
  };

  return (
    <div className="list-accom__filters">
      {/* Name Filter */}
      <h4>Filter by Name</h4>
      <input type="text" placeholder="Accommodation Name" value={nameFilter} 
        onChange={(e) => setNameFilter(e.target.value)} />
      
      <hr />

      {/* Price Range Filter */}
      <h4>Filter by Price</h4>
      <label>Price Range</label>
      <div className="price-range-slider">
        <input 
          type="range" 
          min="0" 
          max="1000000" 
          defaultValue={0}
          value={minPrice} 
          onChange={(e) => setMinPrice(e.target.value)} 
        />
        <input 
          type="range" 
          min="0" 
          max="20000000" 
          defaultValue={1000000}
          value={maxPrice} 
          onChange={(e) => setMaxPrice(e.target.value)} 
        />
        <div>Min: {minPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} - Max: {maxPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
      </div>

      <button onClick={handleFilterChange} disabled={isLoading}>
        {isLoading ? <div className="loading-spinner"></div> : 'Apply Filters'}
      </button>

      <hr />
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
const ListFoodServices = ({ status, setCurDes, city }) => {
  const { url } = useContext(StoreContext);
  const [foodServices, setFoodServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const [sortOption, setSortOption] = useState("Popularity");
  const [nameFilter, setNameFilter] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);

  const fetchFoodServices = async () => {
    console.log("city", city);
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        ...(nameFilter && { name: nameFilter }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
        ...(city && { city: city }),

      });
      console.log(`${url}/api/foodservices?${queryParams}`);
      const response = await fetch(`${url}/api/foodservices?${queryParams}`);
      const result = await response.json();
      setIsLoading(false);

      if (!response.ok) {
        throw new Error(result.message || 'Error fetching data');
      }
      setFoodServices(result.foodService);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodServices();
  }, [url]);

  if (isLoading) {
    return <div>Loading accommodations...</div>;
  }

  return (
    <div className="list-accom__container">
      <Filters
        sortOption={sortOption}
        setSortOption={setSortOption}
        setNameFilter={setNameFilter}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
        nameFilter={nameFilter}
        minPrice={minPrice}
        maxPrice={maxPrice}
        fetchAccommodations={fetchFoodServices}
        isLoading={isLoading}
      />
      <TourList foodServices={foodServices} sortOption={sortOption} status={status} setCurDes={setCurDes} />
    </div>
  );
};


export default ListFoodServices;
export { FoodServiceItem };
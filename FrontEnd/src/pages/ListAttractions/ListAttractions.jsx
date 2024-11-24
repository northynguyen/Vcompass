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
    window.scrollTo(40, 0);
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
        <span>{attraction.description.length > 150 ? attraction.description.substring(0, 150) + "..." : attraction.description}</span>
        <div className="list-accom__tour-rating">{calculateTotalRate(attraction.ratings)}</div>
      </div>
      <div className="list-accom__tour-price">
        <div className="price-container">
          <p className="price-text">{attraction.price}đ</p>
        </div>
        {
          (status === "Schedule" || status === "WishList") && <SelectButton onClick={handleSelect} />
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
      <h4>Lọc theo tên</h4>
      <input type="text" placeholder="Tên điểm đến " value={nameFilter} 
        onChange={(e) => setNameFilter(e.target.value)} />
      
      <hr />

      {/* Price Range Filter */}
      <h4>Lọc theo giá</h4>
      <label>Giá</label>
      <div className="price-range-slider">
        <input 
          type="range" 
          min="0" 
          max="1000000" 
          value={minPrice} 
          onChange={(e) => setMinPrice(e.target.value)} 
        />
        <input 
          type="range" 
          min="0" 
          max="20000000" 
          value={maxPrice} 
          onChange={(e) => setMaxPrice(e.target.value)} 
        />
        <div>Min: {minPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} - Max: {maxPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
      </div>

      <button onClick={handleFilterChange} disabled={isLoading}>
        {isLoading ? <div className="loading-spinner"></div> : 'Lọc'}
      </button>

      <hr />
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
const ListAccom = ({ status, setCurDes, city }) => {
  const { url, user } = useContext(StoreContext);
  const [attractions, setAttractions] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const [sortOption, setSortOption] = useState("Popularity");
  const [nameFilter, setNameFilter] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);

  const fetchAccommodations = async () => {
    console.log("city", city);
    setIsLoading(true);
    try {
      let response;
      let result;
  
      if (status === "WishList") {
        // Fetch wishList từ user
        response = await fetch(`${url}/api/user/user/favorites-with-details?userId=${user._id}&type=attraction`);
        result = await response.json();
      } else {
        // Fetch bình thường cho các trường hợp khác
        const queryParams = new URLSearchParams({
          ...(nameFilter && { name: nameFilter }),
          ...(minPrice && { minPrice }),
          ...(maxPrice && { maxPrice }),
          ...(city && { city }),
          sortOption,
        });
  
        response = await fetch(`${url}/api/attractions?${queryParams}`);
        result = await response.json();
      }
  
      setIsLoading(false);
  
      if (!response.ok) {
        throw new Error(result.message || "Error fetching data");
      }
  
      if (status === "WishList") {
        // Gán dữ liệu wishList
       setAttractions( result.favorites.filter((favorite) => favorite.city === city))
      } else {
        // Gán dữ liệu attractions
        setAttractions(result.attractions || []);
      }
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };
  

  useEffect(() => {
    fetchAccommodations();
  }, [url]);

  if (isLoading) {
    return <div>Loading accommodations...</div>;
  }

  return (
    <div className="list-accom__container">
      {status === "Schedule" &&
      <Filters
        sortOption={sortOption}
        setSortOption={setSortOption}
        setNameFilter={setNameFilter}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
        nameFilter={nameFilter}
        minPrice={minPrice}
        maxPrice={maxPrice}
        fetchAccommodations={fetchAccommodations}
        isLoading={isLoading}
      />
}
      <AttractionList attractions={attractions} sortOption={sortOption} status={status} setCurDes={setCurDes} />
    </div>
  );
};

export default ListAccom;
export { AttractionItem, SelectButton };
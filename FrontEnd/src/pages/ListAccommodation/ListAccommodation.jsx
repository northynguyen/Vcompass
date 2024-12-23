import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../Context/StoreContext";
import { calculateTotalRate, SelectButton } from "../ListAttractions/ListAttractions";
import CryptoJS from "crypto-js";
import "./ListAccommodation.css";
import { Range } from 'react-range';
// Accommodation Item Component
const AccomItem = ({ accommodation, status, setCurDes, id }) => {
  const handleSelect = (e) => {
    e.stopPropagation();
    accommodation.activityType = "Accommodation";
    setCurDes(accommodation);
  };

  const onNavigateToDetails = () => {
    const encryptedServiceId = CryptoJS.AES.encrypt(accommodation._id, 'mySecretKey').toString();
    const safeEncryptedServiceId = encodeURIComponent(encryptedServiceId);
    window.open(`/place-details/accommodation/${safeEncryptedServiceId}`, "_blank");
  };

  const { url } = useContext(StoreContext);

  return (
    <div className="list-accom__tour-item" onClick={onNavigateToDetails}>
      <img src={`${url}/images/${accommodation.images[0]}`} alt={accommodation.name} className="list-accom__tour-item-image" />
      <div className="list-accom__tour-details">
        <h3>{accommodation.name}</h3>
        <div className="list-accom__tour-location">
          <a 
            href={`https://www.google.com/maps/?q=${accommodation.location.latitude},${accommodation.location.longitude}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {accommodation.location.address}
          </a>
        </div>
        <div className="list-accom__tour-facilities">
          {accommodation.amenities.map((facility, index) => (
            <span key={index}>{facility}</span>
          ))}
        </div>
        <span>{accommodation.description.length > 150 ? accommodation.description.substring(0, 150) + "..." : accommodation.description}</span>
        <div className="list-accom__tour-rating">{calculateTotalRate(accommodation.ratings)}</div>
      </div>
      <div className="list-accom__tour-price">
        {(status === "Schedule" || status ==="WishList")  && <SelectButton onClick={handleSelect} />}
      </div>
    </div>
  );
};

// Accommodation List Component
const AccomList = ({ accommodations, sortOption, status, setCurDes }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const accomPerPage = status === "Schedule" ? 3 : 3;
  const sortedAccom = Object.values(accommodations).sort((a, b) => {
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
  const totalPages = Math.ceil(sortedAccom.length / accomPerPage);
  const currentAccoms = sortedAccom.slice((currentPage - 1) * accomPerPage, currentPage * accomPerPage);

  return (
    <div className="list-accom__tour-list">
      {currentAccoms.map((accommodation) => (
        <AccomItem key={accommodation._id} accommodation={accommodation} status={status}
          setCurDes={setCurDes} id={accommodation._id} />
      ))}
      <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
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

// Filters Component with a single range slider for both min and max price
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
      <input type="text" placeholder="Tên khách sạn" value={nameFilter} 
        onChange={(e) => setNameFilter(e.target.value)} />
      
      <hr />

      {/* Price Range Filter */}
      <h4>Lọc theo giá</h4>
      <label>Giá </label>
      <div className="price-range-slider">
        <Range
          step={100000}
          min={0}
          max={2000000}
          values={[minPrice, maxPrice]}
          onChange={([newMinPrice, newMaxPrice]) => {
            setMinPrice(newMinPrice);
            setMaxPrice(newMaxPrice);
          }}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: '6px',
                width: '100%',
                backgroundColor: '#ddd',
                borderRadius: '3px',
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ props, index }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: '20px',
                width: '20px',
                borderRadius: '50%',
                backgroundColor: '#007bff',
                boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
              }}
            />
          )}
        />
        <div className="price-range-value">
         {minPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} - {maxPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </div>
      </div>
      <button onClick={handleFilterChange} disabled={isLoading}>
        {isLoading ? <div className="loading-spinner"></div> : 'Lọc'}
      </button>

      <hr />
    </div>
  );
};

// Main ListAccom Component
const ListAccom = ({ status, setCurDes ,city}) => {
  const { url , user} = useContext(StoreContext);
  const [accommodations, setAccommodations] = useState([]);
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
        console.log(`${url}/api/user/user/favorites-with-details?userId=${user._id}&type=attraction`);
        response = await fetch(`${url}/api/user/user/favorites-with-details?userId=${user._id}&type=accommodation`);
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
  
       response = await fetch(`${url}/api/accommodations?${queryParams}`);
        result = await response.json();
      }
  
      setIsLoading(false);
  
      if (!response.ok) {
        throw new Error(result.message || "Error fetching data");
      }
  
      if (status === "WishList") {
        // Gán dữ liệu wishList
        setAccommodations(result.favorites.filter((favorite) => favorite.city === city));
      } else {
        // Gán dữ liệu attractions
        setAccommodations(result.accommodations || []);
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
      {status === "Schedule" && (
        
      
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
    )}
      <AccomList accommodations={accommodations} sortOption={sortOption} status={status} setCurDes={setCurDes} />
    </div>
  );
};

export default ListAccom;

export { AccomItem };
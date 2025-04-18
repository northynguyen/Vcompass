import CryptoJS from "crypto-js";
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from "react";
import { Range } from 'react-range';
import { StoreContext } from "../../Context/StoreContext";
import { calculateTotalRate, SelectButton } from "../ListAttractions/ListAttractions";
import "./ListFoodServices.css";

// TourItem Component
const FoodServiceItem = ({ foodService, status, setCurDes }) => {
  const { url } = useContext(StoreContext);
  const handleSelect = (e) => {
    e.stopPropagation();
    foodService.activityType = "FoodService";
    setCurDes(foodService);
    window.scrollTo(40, 0);
  };

  const onNavigateToDetails = () => {
    const encryptedServiceId = CryptoJS.AES.encrypt(foodService._id, 'mySecretKey').toString();
    const safeEncryptedServiceId = encodeURIComponent(encryptedServiceId);
    window.open(`/place-details/food/${safeEncryptedServiceId}`, "_blank");
  };
  return (
    <div className="list-accom__tour-item" onClick={onNavigateToDetails}>
      <div className="accom-card-header">
        <img src={`${url}/images/${foodService.images[0]}`} alt={foodService.name} className="list-accom__tour-item-image" />
        <div className="accom-card-header-right">
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
          <div className="list-accom__tour-rating">{calculateTotalRate(foodService.ratings)}</div>
        </div>
      </div>
      <div className="list-accom__tour-details">
        <div className="list-accom__tour-facilities">
          {foodService.amenities.slice(0, 6).map((facility, index) => (
            <span key={index}>{facility}</span>
          ))}
          {foodService.amenities.length > 6 && <span>...</span>}
        </div>
        <span>{foodService.description.length > 150 ? foodService.description.substring(0, 150) + "..." : foodService.description}</span>
      </div>
      <div className="list-accom__tour-price">
        <div className="price-container">
          <p className="price-text">{foodService.price.minPrice} - {foodService.price.maxPrice} ₫</p>
        </div>
        {
          (status === "Schedule" || status === "WishList") && <SelectButton onClick={handleSelect} />
        }
      </div>
    </div>
  );
}

FoodServiceItem.propTypes = {
  foodService: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    foodServiceName: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    name: PropTypes.string,
    location: PropTypes.shape({
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
      address: PropTypes.string.isRequired
    }).isRequired,
    amenities: PropTypes.arrayOf(PropTypes.string).isRequired,
    description: PropTypes.string.isRequired,
    ratings: PropTypes.array.isRequired,
    price: PropTypes.shape({
      minPrice: PropTypes.number.isRequired,
      maxPrice: PropTypes.number.isRequired
    }).isRequired,
    activityType: PropTypes.string
  }).isRequired,
  status: PropTypes.string.isRequired,
  setCurDes: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired
};

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
      {currentTours.map((tour) => (
        <FoodServiceItem key={tour._id} foodService={tour}
          status={status} setCurDes={setCurDes} />
      ))}
      <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
    </div>
  );
};

TourList.propTypes = {
  foodServices: PropTypes.array.isRequired,
  sortOption: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  setCurDes: PropTypes.func.isRequired
};

// Filters Component
const Filters = ({
  setNameFilter, setMinPrice, setMaxPrice,
  nameFilter, minPrice, maxPrice, fetchAccommodations, isLoading
}) => {
  const handleFilterChange = () => {
    fetchAccommodations(); // Trigger fetch when filters are changed
  };

  return (
    <div className="list-accom__filters">
      {/* Name Filter */}
      <input
        type="text"
        placeholder="Tên nhà hàng, quán ăn"
        value={nameFilter}
        onChange={(e) => setNameFilter(e.target.value)}
      />


      {/* Price Range Filter */}
      <div className="price-range-slider">
        <Range
          values={[minPrice, maxPrice]} // Current min and max price
          step={10000} // The step for each slider tick
          min={0} // Minimum value
          max={10000000} // Maximum value
          onChange={(values) => {
            setMinPrice(values[0]);
            setMaxPrice(values[1]);
          }}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: '6px',
                width: '100%',
                backgroundColor: '#ddd',
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: '16px',
                width: '16px',
                borderRadius: '50%',
                backgroundColor: '#007BFF',
                cursor: 'pointer',
                boxShadow: '0 0 2px rgba(0, 0, 0, 0.5)',
              }}
            />
          )}
        />
        <div className="price-range-value">
          {minPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₫
          -  {maxPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₫
        </div>
      </div>

      <button onClick={handleFilterChange} disabled={isLoading}>
        {isLoading ? <div className="loading-spinner"></div> : 'Lọc'}
      </button>

      <hr />
    </div>
  );
};

Filters.propTypes = {
  sortOption: PropTypes.string.isRequired,
  setSortOption: PropTypes.func.isRequired,
  setNameFilter: PropTypes.func.isRequired,
  setMinPrice: PropTypes.func.isRequired,
  setMaxPrice: PropTypes.func.isRequired,
  nameFilter: PropTypes.string.isRequired,
  minPrice: PropTypes.number.isRequired,
  maxPrice: PropTypes.number.isRequired,
  fetchAccommodations: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  style: PropTypes.object
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, setCurrentPage }) => (
  <div className="list-accom__pagination">
    <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
    <span>Page {currentPage} of {totalPages}</span>
    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
  </div>
);

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired
};

// Main ListAccom Component
const ListFoodServices = ({ status, setCurDes, city, setListData }) => {
  const { url, user } = useContext(StoreContext);
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
      let response;
      let result;

      if (status === "WishList") {
        // Fetch wishList từ user
        response = await fetch(`${url}/api/user/user/favorites-with-details?userId=${user._id}&type=foodService`);
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

        response = await fetch(`${url}/api/foodservices?${queryParams}`);
        result = await response.json();
      }

      setIsLoading(false);

      if (!response.ok) {
        throw new Error(result.message || "Error fetching data");
      }

      if (status === "WishList") {
        // Gán dữ liệu wishList
        setFoodServices(result.favorites);
      } else {
        // Gán dữ liệu attractions
        setFoodServices(result.foodService || []);
      }
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodServices();
  }, [url]);

  useEffect(() => {
    if (foodServices.length > 0) {
      setListData(foodServices);
    }
  }, [foodServices, setListData]);

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

ListFoodServices.propTypes = {
  status: PropTypes.string.isRequired,
  setCurDes: PropTypes.func.isRequired,
  city: PropTypes.string,
  setListData: PropTypes.func
};

export default ListFoodServices;
export { FoodServiceItem };


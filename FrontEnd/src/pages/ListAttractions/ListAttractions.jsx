import CryptoJS from "crypto-js";
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from "react";
import { Range } from 'react-range';
import { StoreContext } from "../../Context/StoreContext";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import "./ListAttractions.css";

export const calculateTotalRate = (ratings) => {
  const totalReviews = ratings.length;
  if (totalReviews === 0) return "No reviews";
  const averageRating = ratings.reduce((sum, review) => sum + review.rate, 0) / totalReviews;
  const stars = "★".repeat(Math.floor(averageRating)) + "☆".repeat(5 - Math.floor(averageRating));
  return `${stars} (${totalReviews} reviews)`;
};

const AttractionItem = ({ attraction, status, setCurDes }) => {
  const { url } = useContext(StoreContext);
  const handleSelect = (e) => {
    e.stopPropagation();
    attraction.activityType = "Attraction";
    setCurDes(attraction);
    window.scrollTo(40, 0);
  };
  const getImageUrl = (place) => {
    if (!place.images || !place.images.length) {
      return 'https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg';
    }
    
    const image = place.images[0];
    if (image.includes('http')) {
      return image;
    }
    
    return `${url}/images/${image}`;
  };

  
  const onNavigateToDetails = () => {
    const encryptedServiceId = CryptoJS.AES.encrypt(attraction._id, 'mySecretKey').toString();
    const safeEncryptedServiceId = encodeURIComponent(encryptedServiceId);
    window.open(`/place-details/attraction/${safeEncryptedServiceId}`, "_blank");
  };

  return (
    <div className="list-accom__tour-item" onClick={onNavigateToDetails}>
      <div className="accom-card-header">
        <img 
          src={getImageUrl(attraction)} 
          alt={attraction.attractionName} 
          className="list-accom__tour-item-image" 
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = 'https://t3.ftcdn.net/jpg/07/86/72/92/360_F_786729270_zRVnfyxvQgOIPrGYzCweGV1bi5X9fgSz.jpg';
          }}
        />
        <div className="accom-card-header-right">
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
          <div className="list-accom__tour-rating">{calculateTotalRate(attraction.ratings)}</div>
        </div>
      </div>
      <div className="list-accom__tour-details">
        <div className="list-accom__tour-facilities">
          {attraction.amenities.slice(0, 6).map((facility, index) => (
            <span key={index}>{facility}</span>
          ))}
          {attraction.amenities.length > 6 && <span>...</span>}
        </div>
        <span>{attraction.description.length > 150 ? attraction.description.substring(0, 150) + "..." : attraction.description}</span>

      </div>
      <div className="list-accom__tour-price">
        <div className="price-container">
          <p className="price-text">{attraction.price.toLocaleString().replace(/,/g, '.')} ₫</p>
        </div>
        {
          (status === "Schedule" || status === "WishList") && <SelectButton onClick={handleSelect} />
        }
      </div>
    </div>
  );
}

AttractionItem.propTypes = {
  attraction: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    attractionName: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    location: PropTypes.shape({
      address: PropTypes.string.isRequired,
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired
    }).isRequired,
    amenities: PropTypes.arrayOf(PropTypes.string).isRequired,
    description: PropTypes.string.isRequired,
    ratings: PropTypes.array.isRequired,
    price: PropTypes.number.isRequired,
    activityType: PropTypes.string
  }).isRequired,
  status: PropTypes.string.isRequired,
  setCurDes: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired
};

const SelectButton = ({ onClick }) => {
  return (
    <div onClick={onClick} className="select-container">
      <button className="selection-btn">Chọn</button>
    </div>
  );
};

SelectButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

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

  AttractionList.propTypes = {
    attractions: PropTypes.array.isRequired,
    sortOption: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    setCurDes: PropTypes.func.isRequired
  };

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

// Component cho Filtersconst Filters = ({ 
const Filters = ({ setNameFilter, setMinPrice, setMaxPrice,
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
        placeholder="Tên điểm đến"
        value={nameFilter}
        onChange={(e) => setNameFilter(e.target.value)}
      />

      {/* Price Range Filter */}
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
          renderThumb={({ props }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: '16px',
                width: '16px',
                borderRadius: '50%',
                backgroundColor: '#007bff',
                boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
              }}
            />
          )}
        />
        <div className="price-range-value">
          {minPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₫ - {maxPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₫
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
const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
  return (
    <div className="list-accom__pagination">
      <button
        disabled={currentPage === 1 || totalPages === 0}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        <IoIosArrowBack />

      </button>
      <span>
        {currentPage} / {totalPages}
      </span>
      <button
        disabled={currentPage === totalPages || totalPages === 0}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        <IoIosArrowForward />
      </button>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired
};

// Main ListAccom Component
const ListAccom = ({ status, setCurDes, city, setListData }) => {
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
        setAttractions(result.favorites.filter((favorite) => favorite.city === city))
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

  useEffect(() => {
    if (attractions.length > 0) {
      setListData(attractions);
    }
  }, [attractions, setListData]);

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

ListAccom.propTypes = {
  status: PropTypes.string.isRequired,
  setCurDes: PropTypes.func.isRequired,
  city: PropTypes.string,
  setListData: PropTypes.func
};

export default ListAccom;
export { AttractionItem, SelectButton };


import { useContext, useEffect, useState, useRef } from "react";
import PropTypes from 'prop-types';
import { StoreContext } from "../../Context/StoreContext";
import Filters from "./Filters";
import List from "./List";
import "./ListPlaces.css";

const ListPlaces = ({ status, setCurDes, city, setListData, type }) => {
  const { url, user, token } = useContext(StoreContext);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOption, setSortOption] = useState("Popularity");
  const [nameFilter, setNameFilter] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(
    type === "foodService" ? 10000000 : 2000000
  );
  const [isScrolling, setIsScrolling] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const containerRef = useRef(null);
  let scrollTimer = useRef(null);

  // Scroll event handler
  const handleScroll = () => {
    if (!hasScrolled && containerRef.current.scrollTop > 50) {
      setHasScrolled(true);
    }
    
    setIsScrolling(true);
    
    // Clear previous timer
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    
    // Set new timer to detect when scrolling stops
    scrollTimer.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1500); // Keep scrollbar visible longer (1.5 seconds)
  };

  // Handle API fetch based on type
  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const endpoint = getEndpoint();
      let response;
      const queryParams = new URLSearchParams();
      if (city) queryParams.append("city", city);
      if (nameFilter) queryParams.append("name", nameFilter);
      queryParams.append("minPrice", minPrice);
      queryParams.append("maxPrice", maxPrice);
      if (status === "WishList") {
        // Fetch wishlist data with POST request
        response = await fetch(`${url}/api/${endpoint}/user/wishlist?${queryParams.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token ,
          },
        });
      } else if (status === "Schedule") {
        // Fetch regular data with query parameters
       
        
        response = await fetch(`${url}/api/${endpoint}?${queryParams.toString()}`);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Xử lý dữ liệu dựa trên từng loại endpoint và status
      let processedData = [];
      
      if (status === "WishList") {
        // For wishlist, use the correct field names from backend response
        if (endpoint === "attractions") {
          processedData = Array.isArray(data.attractions) ? data.attractions : [];
        } else if (endpoint === "accommodations") {
          processedData = Array.isArray(data.accommodations) ? data.accommodations : [];
        } else if (endpoint === "foodservices") {
          processedData = Array.isArray(data.foodService) ? data.foodService : [];
        }
      } else {
        // For regular endpoints
        if (endpoint === "attractions") {
          processedData = Array.isArray(data.attractions) ? data.attractions : [];
        } else if (endpoint === "accommodations") {
          processedData = Array.isArray(data.accommodations) ? data.accommodations : [];
        } else if (endpoint === "foodservices") {
          processedData = Array.isArray(data.foodService) ? data.foodService : [];
        }
      }

      setItems(processedData);
      
      // If this is used within a Trip Planner context, update parent component
      if (setListData && (status === "Schedule" || status === "WishList")) {
        setListData(processedData);
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      setItems([]); // Đặt items là mảng rỗng trong trường hợp lỗi
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 200); 
    }
  };

  // Determine endpoint based on type
  const getEndpoint = () => {
    switch (type) {
      case "attraction":
        return "attractions";
      case "foodService":
        return "foodservices";
      case "accommodation":
      default:
        return "accommodations";
    }
  };

  // Set up scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
        if (scrollTimer.current) clearTimeout(scrollTimer.current);
      };
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [city, url, user]); // Re-fetch when city, url or user changes

  return (
    <div 
      className={`list-accom__container ${isScrolling ? 'is-scrolling' : ''} `}
      ref={containerRef}
    >
      <div className="scroll-padding-top"></div>
      
      <Filters
        setNameFilter={setNameFilter}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
        nameFilter={nameFilter}
        minPrice={minPrice}
        maxPrice={maxPrice}
        fetchItems={fetchItems}
        isLoading={isLoading}
        type={type}
        sortOption={sortOption}
        setSortOption={setSortOption}
      />
      <div className="list-scroll-container">
        <List
          items={items}
          sortOption={sortOption}
          status={status}
          setCurDes={setCurDes}
          type={type}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

ListPlaces.propTypes = {
  status: PropTypes.string,
  setCurDes: PropTypes.func.isRequired,
  city: PropTypes.string,
  setListData: PropTypes.func,
  type: PropTypes.oneOf(['attraction', 'foodService', 'accommodation']).isRequired
};

ListPlaces.defaultProps = {
  status: "Default",
  city: ""
};

export default ListPlaces; 
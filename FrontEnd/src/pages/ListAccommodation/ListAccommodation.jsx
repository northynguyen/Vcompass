import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../Context/StoreContext";
import CryptoJS from "crypto-js";
import { calculateTotalRate, SelectButton } from "../ListAttractions/ListAttractions";
import "./ListAccommodation.css";


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
        {status === "Schedule" && <SelectButton onClick={handleSelect} />}
      </div>
    </div>
  );
};


const AccomList = ({ accommodations, sortOption, status, setCurDes }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const accomPerPage = status === "Schedule" ? 3 : 8;
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
const ListAccom = ({ status, setCurDes }) => {
  const { url } = useContext(StoreContext);
  const [accommodations, setAccommodations] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState("Popularity");

  const fetchData = async () => {
    try {
      let response = await fetch(`${url}/api/accommodations/`)
      const result = await response.json();
      setIsLoading(false)
      if (!response.ok) {
        throw new Error(result.message || 'Error fetching data');
      }
      setAccommodations(result.accommodations);
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [url]);
  if (isLoading) {
    return (
      <div>...</div>
    )
  }
  return (
    <div className="list-accom__container">
      <Filters sortOption={sortOption} setSortOption={setSortOption} />
      <AccomList accommodations={accommodations} sortOption={sortOption}
        status={status} url={url} setCurDes={setCurDes} />
    </div>
  );
};

export default ListAccom;
export { AccomItem };


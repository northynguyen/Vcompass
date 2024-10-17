import React, { useState } from "react";
import "./ListAccommodation.css";

// Component cho từng mục Tour
const Header = () => {
    const [sortOption, setSortOption] = useState("Popularity");
  
    return (
      <div className="header-accom">
        <div className="header-left">
          <h1 className="num-title">Things To Do In London</h1>
          <span className="num-text">49 Activities Found</span>
        </div>
        <div className="header-right">
          <label htmlFor="sort-by">Sort by:</label>
          <select
            id="sort-by"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="Popularity">Popularity</option>
            <option value="PriceLowToHigh">Price: Low to High</option>
            <option value="PriceHighToLow">Price: High to Low</option>
            <option value="Rating">Rating</option>
          </select>
        </div>
      </div>
    );
  };
const TourItem = ({ imgSrc, title, time, price }) => (
  <div className="tour-item">
    <img src={imgSrc} alt={title} className="tour-image" />
    <div className="tour-details">
      <div className="tour-header">
        <span className="tour-rating">★★★★☆ (584 reviews)</span>
      </div>
      <h3>{title}</h3>
      <div className="tour-info">
        <span>{time}</span>
        <span>Transport</span>
        <span>Family Plan</span>
      </div>
    </div>
    <div className="tour-price">
      <span className="price-text" >{price}</span>
      <span className="persion-text">per person</span>
    </div>
  </div>
);

// Component cho danh sách Tour
const TourList = () => {
  const tours = [
    {
      imgSrc: "https://bazantravel.com/cdn/medias/uploads/83/83317-khu-nghi-duong-lan-rung-700x420.jpg",
      title: "Westminster to Greenwich River Thames",
      time: "2 hours",
      price: "$35.00",
    },
    // Thêm nhiều mục tour khác nếu cần
  ];

  return (
    <div className="tour-list">
      {tours.map((tour, index) => (
        <TourItem
          key={index}
          imgSrc={tour.imgSrc}
          title={tour.title}
          time={tour.time}
          price={tour.price}
        />
      ))}
    </div>
  );
};

// Component cho Filters
const Filters = () => {
  return (
    <div className="filters">
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
      </div>
    </div>
  );
};

// Thành phần chính của ứng dụng
const ListAccom = () => {
  return (
    <div className="app-container">
    <Header />
    <div className="main-content-container">
        <div className="main-content">
        <Filters />
        <div className="tour-list-container">
          <TourList />
          <TourList />
          <TourList />
        </div>
        </div>
    </div>
  </div>
  );
};

export default ListAccom;
export { TourList };

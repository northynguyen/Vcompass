import React from 'react';
import './PostCard.css';

const AccommodationBanner = () => {
  return (
    <div className="accommodation-banner">
        <div className="image-container">
        <img src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/29/aa/6d/exterior.jpg?w=1200&h=-1&s=1" 
        alt="Wilderlife of Alaska" className="banner-image" />
        <div className="decorative-shapes"></div>
      </div>
      <div className="banner-bg"></div>
     <div className="overlay"></div>
     
      <div className="banner-content">
        <span className="trending">TRENDING NOW</span>
        <h1 className="title">Wilderlife of Alaska</h1>
        <div className="location">
        <i className="fa fa-map-marker" aria-hidden="true">
            <span className='accom-banner'>Alaska, USA</span></i>
          <div>
            <i className="fa-solid fa-star icon-rating"></i>
            <i className="fa-solid fa-star icon-rating"></i>
            <i className="fa-solid fa-star icon-rating"></i>
            <i className="fa-solid fa-star icon-rating"></i>
            <i className="fa-solid fa-star icon-rating"></i>
          </div>
          <span className="rating accom-banner">4.9 (300 reviews)</span>
        </div>
        <p className="description">
          Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit.
        </p>
        <div className="actions">
          <button className="book-now">Book Now</button>
          <i className="fa-solid fa-heart fa-shake book-schedule-icon"></i>
          <i className="fa-solid fa-share fa-shake book-schedule-icon"></i>
        </div>
      </div>
    </div>
  );
};

export default AccommodationBanner;

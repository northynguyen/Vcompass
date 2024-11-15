import React from 'react';
import './PostCard.css';

const AccommodationBanner = () => {
  return (
    <div className="accommodation-banner">
      <div className="image-container">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/B%E1%BB%9D_bi%E1%BB%83n_V%C5%A9ng_T%C3%A0u.JPG/1280px-B%E1%BB%9D_bi%E1%BB%83n_V%C5%A9ng_T%C3%A0u.JPG"
          alt="Wilderlife of Alaska" className="banner-image" />
        <div className="decorative-shapes"></div>
      </div>
      <div className="banner-bg"></div>
      <div className="overlay"></div>

      <div className="banner-content">
        <span className="trending">THỊNH HÀNH</span>
        <h1 className="title">Vũng tàu</h1>
        <div className="location">
          <i className="fa fa-map-marker" aria-hidden="true">
            <span className='accom-banner'>Bà Rịa - Vũng Tàu</span></i>
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
          Vũng Tàu là một thành phố thuộc tỉnh Bà Rịa – Vũng Tàu, vùng Đông Nam Bộ, Việt Nam. Đây là trung tâm kinh tế, tài chính, văn hóa, du lịch, và là một trong những trung tâm kinh tế của tỉnh và vùng kinh tế trọng điểm phía Nam
        </p>
        <div className="actions">
          <button className="book-now">Đặt ngay</button>
          <i className="fa-solid fa-heart fa-shake book-schedule-icon"></i>
          <i className="fa-solid fa-share fa-shake book-schedule-icon"></i>
        </div>
      </div>
    </div>
  );
};

export default AccommodationBanner;

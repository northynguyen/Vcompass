import React from 'react';
import './PostCard.css';

const PostCard = () => {
  return (
    <div className="card-container">
      <header className="card-header">
        <div className="user-info">
          <img
            className="user-avatar"
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="user avatar"
          />
          <div>
            <h5>Phạm Bá Thành <span className="verified">✔</span></h5>
            <p className="user-date">01-11-2024</p>
          </div>
          <div className='post-location'>
            <i className="fa fa-map-marker" aria-hidden="true"></i>
            <label className='location-text' htmlFor="null">Vũng Tàu</label>
          </div>
        </div>
        <div className="rating-container">
          <label className='rating-text' htmlFor="null">4,30</label>
          <label className='review-text' htmlFor="null">854 Reviews</label>
          <br />
          <i className="fa-solid fa-star icon-rating"></i>
          <i className="fa-solid fa-star icon-rating"></i>
          <i className="fa-solid fa-star icon-rating"></i>
          <i className="fa-solid fa-star icon-rating"></i>
          <i className="fa-solid fa-star icon-not-rating"></i>
        </div>
      </header>

      <img
        className="content-image"
        src="https://www.travelalaska.com/sites/default/files/2022-01/Haida-GlacierBay-GettyImages-1147753605.jpg"
        alt="Alaska"
      />
      <div className='content-container'>
        <div className="card-content">
          <div className="details">
            <h1>Tour Vũng Tàu</h1>
            <p>
              Đây là một địa điểm du lịch cực kì thu hút du khách với nhiều địa điểm đẹp, độc, đỉnh
              Đây là một địa điểm du lịch cực kì thu hút du khách với nhiều địa điểm đẹp, độc, đỉnh
              Đây là một địa điểm du lịch cực kì thu hút du khách với nhiều địa điểm đẹp, độc, đỉnh
            </p>
          </div>

          <div className="pricing-box">
            <ul>
              <li><span>$79 × 7 nights</span><span>$555</span></li>
              <li><span>Weekly discount</span><span className="discount">−$28</span></li>
              <li><span>Cleaning fee</span><span>$62</span></li>
              <li><span>Service fee</span><span>$83</span></li>
              <li><span>Occupancy taxes and fees</span><span>$29</span></li>
            </ul>
            <button className="see-more">See more</button>
            <div className="total"><span>Total</span><span>$701</span></div>
          </div>
          <br />
        </div>
        <footer className="card-footer">
          <div className="actions">
            <i className="fa-solid fa-heart" style={{ color: 'red' }}></i>
            <label className='action-text' htmlFor="null">903</label>
            <i className="fa-solid fa-comment"></i>
            <label className='action-text' htmlFor="null">903</label>
            <i className="fa-solid fa-share"></i>
            <label className='action-text' htmlFor="null">903</label>
          </div>

          <button className="custom-now">Custom now</button>
        </footer>
      </div>


    </div>
  );
};

export default PostCard;

/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
import './PlaceDetailsInfo.css'
import { useState } from 'react'

const ImageModal = ({ isOpen, imageSrc, onClose }) => {
  if (!isOpen) return null; // Don't render the modal if it's not open

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={imageSrc} alt="Modal" />
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
      </div>
    </div>
  );
};

const PlaceDetailsInfo = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');


  // Open Modal and set the clicked image
  const openModal = (imageSrc) => {
    setSelectedImage(imageSrc);
    setIsModalOpen(true);
  };

  // Close the Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage('');
  };




  return (
    <div className="place-details-info">
      {/* Left Column: Tour Details */}
      <div className="tour-details">
        <h1>Vintage Double Decker Bus Tour & Thames River Cruise</h1>
        <p>Gothenburg ★★★★☆ (348 reviews)</p>

        {/* Image Gallery */}
        <div className="gallery">
          <img src="https://media.istockphoto.com/id/501057465/vi/anh/d%C3%A3y-n%C3%BAi-himalaya-ph%E1%BB%A7-%C4%91%E1%BA%A7y-s%C6%B0%C6%A1ng-m%C3%B9-v%C3%A0-s%C6%B0%C6%A1ng-m%C3%B9.jpg?s=612x612&w=0&k=20&c=eN_J5-6a4z5g3XOZUanHCmkma-ljDgxG-CFUS5ey8gc=" alt="Main" className="main-img" />
          <div className="thumbnails">
            <img src="https://png.pngtree.com/thumb_back/fh260/background/20230511/pngtree-nature-background-sunset-wallpaer-with-beautiful-flower-farms-image_2592160.jpg" alt="Thumb 1" onClick={() => openModal('https://png.pngtree.com/thumb_back/fh260/background/20230511/pngtree-nature-background-sunset-wallpaer-with-beautiful-flower-farms-image_2592160.jpg')} />
            <img src="https://vcdn1-vnexpress.vnecdn.net/2019/07/30/anh-thien-nhien-dep-thang-7-1564483719.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=Nl3znv-VRtPyhJYhLwwRfA" alt="Thumb 2" />
            <img src="https://cdn.vntrip.vn/cam-nang/wp-content/uploads/2020/03/sapa-ruong-bac-thang.jpg" alt="Thumb 3" />
            <img src="https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474111PXL/anh-dep-nhat-the-gioi-ve-thien-nhien_041753462.jpg" onClick={() => openModal('https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474111PXL/anh-dep-nhat-the-gioi-ve-thien-nhien_041753462.jpg')} alt="Thumb 4" />
            <img src="https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474111PXL/anh-dep-nhat-the-gioi-ve-thien-nhien_041753462.jpg" onClick={() => openModal('https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474111PXL/anh-dep-nhat-the-gioi-ve-thien-nhien_041753462.jpg')} alt="Thumb 4" />
            <img src="https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474111PXL/anh-dep-nhat-the-gioi-ve-thien-nhien_041753462.jpg" alt="Thumb 4" />
            <img src="https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474111PXL/anh-dep-nhat-the-gioi-ve-thien-nhien_041753462.jpg" alt="Thumb 4" />
          </div>
        </div>

        {/* Features */}
        <div className="features">
          <p>✔️ Free Cancellation</p>
          <p>✔️ Mobile Ticketing</p>
          <p>✔️ Instant Confirmation</p>
          <p>✔️ Health Precautions</p>
          <p>✔️ Live Tour Guide in English</p>
          <p>✔️ Duration 3.5 Hours</p>
        </div>

        {/* Description */}
        <div className="description">
          <h3>Description</h3>
          <p>
            See the highlights of London via 2 classic modes of transport on
            this half-day adventure. First, you will enjoy great views of
            Westminster Abbey, the Houses of Parliament, and the London Eye, as
            you meander through the historic streets on board a vintage double
            decker bus...
          </p>
        </div>

        {/* Embed Google Map */}
        <div className="map">
          <h3 style={{ marginBottom: "20px" }}>Location</h3>
          <iframe
            title="map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4854676752075!2d106.76933817614251!3d10.85063238930265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752763f23816ab%3A0x282f711441b6916f!2sHCMC%20University%20of%20Technology%20and%20Education!5e0!3m2!1sen!2s!4v1727189441256!5m2!1sen!2s" 
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>

      {/* Right Column: Booking Form */}
      <div className="booking-form">
        <form >
          <h2>Booking</h2>

          <label htmlFor="from">From</label>
          <input
            type="date"
            id="from"
            onChange={(e) => setFromDate(e.target.value)}
          />

          <label htmlFor="to">To</label>
          <input
            type="date"
            id="to"
            onChange={(e) => setToDate(e.target.value)}
          />

          <label htmlFor="guests">No. of Guests</label>
          <select
            id="guests"
            // eslint-disable-next-line no-undef
            onChange={(e) => setGuests(e.target.value)}
          >
            <option value="1">1 adult</option>
            <option value="2">2 adults</option>
          </select>

          <div className="total-price">
            <h3>Subtotal: $78.90</h3>
          </div>

          <button type="submit" className="book-btn">Confirm Booking</button>
          <button type="button" className="wishlist-btn" onClick={() => alert('Saved to wishlist')}>
            Save to Wishlist
          </button>
          <button type="button" className="share-btn" onClick={() => alert('Shared the activity')}>
            Share the Activity
          </button>
        </form>
      </div>

      {/* Modal for displaying clicked images */}
      <ImageModal isOpen={isModalOpen} imageSrc={selectedImage} onClose={closeModal} />


    </div>
  )
}

export default PlaceDetailsInfo
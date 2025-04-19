/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react";
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";
import { StoreContext } from "../../Context/StoreContext";
import './ImagesModal.css';

const ImagesModal = ({ isOpen, images, selectedIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);
  const { url } = useContext(StoreContext)

  useEffect(() => {
    setCurrentIndex(selectedIndex)
  }, [isOpen, selectedIndex]);
  if (!isOpen) return null;
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Ảnh đang hiển thị */}
        <div className="image-display">
          <img src={images[currentIndex].includes("http") ? images[currentIndex] : `${url}/images/${images[currentIndex]}`} alt={`Image ${currentIndex + 1}`} className="main-image" />
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>

          <div className="navigation">
            <button className="prev-btn" onClick={handlePrev}>
              <IoIosArrowDropleft />
            </button>
            <button className="next-btn" onClick={handleNext}>
              <IoIosArrowDropright />
            </button>
          </div>
        </div>

        {/* Danh sách ảnh nhỏ ở dưới */}
        <div className="thumbnail-grid">
          {images.map((img, index) => (
            <img
              key={index}
              src={img.includes("http") ? img : `${url}/images/${img}`}
              alt={`Thumbnail ${index + 1}`}
              className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              style={{ opacity: index === currentIndex ? 1 : 0.5 }} // Ảnh đang hiển thị không có opacity
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImagesModal
import PropTypes from 'prop-types';
import { useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import ListItem from './ListItem';

// Skeleton Item for loading state
export const SkeletonItem = () => {
  return (
    <div className="list-accom__tour-item skeleton">
      <div className="accom-card-header">
        <div className="skeleton-image-container"></div>
        <div className="accom-card-header-right">
          <div className="skeleton-title"></div>
          <div className="skeleton-location"></div>
          <div className="skeleton-rating"></div>
        </div>
      </div>
      <div className="list-accom__tour-details">
        <div className="skeleton-facilities">
          <div className="skeleton-facility"></div>
          <div className="skeleton-facility"></div>
          <div className="skeleton-facility"></div>
          <div className="skeleton-facility"></div>
        </div>
        <div className="skeleton-description"></div>
      </div>
      <div className="list-accom__tour-price">
        <div className="skeleton-price"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );
};

// Pagination Component
export const Pagination = ({ currentPage, totalPages, setCurrentPage }) => (
  <div className="list-accom__pagination">
    <button disabled={currentPage === 1 || totalPages === 0} onClick={() => setCurrentPage(currentPage - 1)}>
      <IoIosArrowBack />    
    </button>
    <span>{currentPage} / {totalPages}</span>
    <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)}>
      <IoIosArrowForward />
    </button>
  </div>
);

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired
};

// Reusable List Component
const List = ({ items, sortOption, status, setCurDes, type, isLoading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = status === "Schedule" ? 3 : 8;
  
  // Đảm bảo items luôn là một mảng
  const itemsArray = Array.isArray(items) ? items : [];
  
  // Tính toán rating trước khi vào switch để tránh khai báo trong case
  const calculateRating = (a, b) => {
    const avgRatingA = a.ratings?.length > 0 
      ? a.ratings.reduce((sum, r) => sum + r.rate, 0) / a.ratings.length 
      : 0;
    const avgRatingB = b.ratings?.length > 0 
      ? b.ratings.reduce((sum, r) => sum + r.rate, 0) / b.ratings.length 
      : 0;
    return avgRatingB - avgRatingA;
  };
  
  // Sort items according to the sort option
  const sortedItems = [...itemsArray].sort((a, b) => {
    switch (sortOption) {
      case "PriceLowToHigh":
        if (type === "foodService") {
          return a.price?.minPrice - b.price?.minPrice;
        } else if (type === "attraction" || type === "accommodation") {
          return a.price - b.price;
        }
        return 0;
      case "PriceHighToLow":
        if (type === "foodService") {
          return b.price?.minPrice - a.price?.minPrice;
        } else if (type === "attraction" || type === "accommodation") {
          return b.price - a.price;
        }
        return 0;
      case "Rating":
        return calculateRating(a, b);
      case "Popularity":
      default:
        return 0;
    }
  });
  
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const currentItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="list-accom__tour-list">
      {isLoading ? (
        // Show 4 skeleton items when loading for better user experience
        <>
          <SkeletonItem />
          <SkeletonItem />
          <SkeletonItem />
          <SkeletonItem />
        </>
      ) : (
        currentItems.map((item) => (
          <ListItem
            key={item._id}
            item={item}
            status={status}
            setCurDes={setCurDes}
            type={type}
          />
        ))
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

List.propTypes = {
  items: PropTypes.array.isRequired,
  sortOption: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  setCurDes: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['attraction', 'foodService', 'accommodation']).isRequired,
  isLoading: PropTypes.bool
};

List.defaultProps = {
  isLoading: false
};

export default List; 
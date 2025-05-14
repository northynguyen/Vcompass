import PropTypes from 'prop-types';
import { Range } from 'react-range';
import { useState } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const Filters = ({
  setNameFilter,
  setMinPrice,
  setMaxPrice,
  nameFilter,
  minPrice,
  maxPrice,
  fetchItems,
  isLoading,
  type,
  sortOption,
  setSortOption
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleFilterChange = () => {
    fetchItems(); // Trigger fetch when filters are changed
  };

  const getPlaceholder = () => {
    switch (type) {
      case "attraction":
        return "Tên điểm đến";
      case "foodService":
        return "Tên nhà hàng, quán ăn";
      case "accommodation":
      default:
        return "Tên khách sạn";
    }
  };

  const getMaxPriceDefault = () => {
    switch (type) {
      case "foodService":
        return 10000000;
      case "attraction":
      case "accommodation":
      default:
        return 2000000;
    }
  };

  return (
    <div className="list-accom__filters sticky-filter">
      {/* Name Filter */}
      <div className="filter-basic">
        <div className="filter-search-container">
          <input
            type="text"
            placeholder={getPlaceholder()}
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
          <button 
            className="advanced-filter-toggle" 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            {showAdvancedFilters ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </button>
        </div>
        
        <button onClick={handleFilterChange} disabled={isLoading} className="filter-button">
          {isLoading ? 
            null 
            : 'Lọc'}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="advanced-filters">
          {/* Sort Options */}
          <div className="sort-options">
            <label className="filter-label">Sắp xếp theo:</label>
            <select
              className="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="Popularity">Phổ biến</option>
              <option value="PriceLowToHigh">Giá: Thấp đến Cao</option>
              <option value="PriceHighToLow">Giá: Cao đến Thấp</option>
              <option value="Rating">Đánh giá</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="price-filter-container">
            <label className="filter-label">Khoảng giá:</label>
            <div className="price-range-slider">
              <Range
                step={100000}
                min={0}
                max={getMaxPriceDefault()}
                values={[minPrice, maxPrice]}
                onChange={([newMinPrice, newMaxPrice]) => {
                  setMinPrice(newMinPrice);
                  setMaxPrice(newMaxPrice);
                }}
                /* eslint-disable react/prop-types */
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
                /* eslint-enable react/prop-types */
              />
              <div className="price-range-value">
                {minPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₫ - {maxPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₫
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Filters.propTypes = {
  setNameFilter: PropTypes.func.isRequired,
  setMinPrice: PropTypes.func.isRequired,
  setMaxPrice: PropTypes.func.isRequired,
  nameFilter: PropTypes.string.isRequired,
  minPrice: PropTypes.number.isRequired,
  maxPrice: PropTypes.number.isRequired,
  fetchItems: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  type: PropTypes.oneOf(['attraction', 'foodService', 'accommodation']).isRequired,
  sortOption: PropTypes.string.isRequired,
  setSortOption: PropTypes.func.isRequired
};

export default Filters; 
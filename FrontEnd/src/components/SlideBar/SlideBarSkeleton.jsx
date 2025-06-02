import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import './SlideBarSkeleton.css';
import PropTypes from 'prop-types';

const SlideBarSkeleton = ({ type }) => {
    // Create array of 4 items for skeleton placeholders
    const skeletonItems = Array(4).fill(null);
    
    const getTypeInVietnamese = (type) => {
        const typeMapping = {
            accommodation: "chỗ ở",
            food: "dịch vụ ăn uống",
            attraction: "điểm tham quan",
            transport: "phương tiện di chuyển",
            activity: "hoạt động giải trí"
        };
        return typeMapping[type] || "loại khác";
    };

    return (
        <div className="slidebar-container">
            <h3 className="title">Những {getTypeInVietnamese(type)} phổ biến</h3>
            <Swiper
                spaceBetween={10}
                slidesPerView={1}
                breakpoints={{
                    380: { slidesPerView: 2, spaceBetween: 10 },
                    768: { slidesPerView: 3, spaceBetween: 15 },
                    1024: { slidesPerView: 4, spaceBetween: 20 }
                }}
                className="custom-swiper"
            >
                {skeletonItems.map((_, index) => (
                    <SwiperSlide key={index} className="custom-slide">
                        <div className="card skeleton-card">
                            <div className="skeleton-image"></div>
                            <div className="card-content">
                                <div className="skeleton-title"></div>
                                {/* Different layouts based on type */}
                                {(type === 'food' || type === 'attraction') && (
                                    <>
                                        <div className="skeleton-duration"></div>
                                        <div className="skeleton-duration"></div>
                                    </>
                                )}
                                <div className="skeleton-facilities"></div>
                                <div className="skeleton-price"></div>
                                <div className="skeleton-reviews"></div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

// Add prop validation
SlideBarSkeleton.propTypes = {
    type: PropTypes.string.isRequired
};

export default SlideBarSkeleton; 
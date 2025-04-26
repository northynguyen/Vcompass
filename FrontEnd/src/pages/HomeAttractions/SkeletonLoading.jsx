import './SkeletonLoading.css';

const SkeletonLoading = ({type}) => {
    // Create an array of 6 items to match the limit in fetchAttractions
    const skeletonItems = Array(6).fill(null);
    
    return (
        <div className="attractions-list-skeleton ">
            <h2>Danh sách {type}</h2>
            {skeletonItems.map((_, index) => (
                <div key={index} className="skeleton-hotel-card">
                    <div className="skeleton-hotel-image"></div>
                    <div className="skeleton-hotel-content">
                        <div className="skeleton-hotel-title"></div>
                        <div className="skeleton-hotel-address"></div>
                        <div className="skeleton-hotel-description"></div>
                        <div className="skeleton-hotel-rating">
                            <div className="skeleton-star"></div>
                            <div className="skeleton-reviews"></div>
                        </div>
                    </div>
                    <div className="skeleton-hotel-price">
                        <div className="skeleton-price-tag"></div>
                        <div className="skeleton-price-range"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SkeletonLoading; 
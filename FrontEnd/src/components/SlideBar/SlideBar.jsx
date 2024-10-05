import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import './SlideBar.css';

const SlideBar = () => {
    //Có thể truyền  dữ liệu vô đây {slidesData}
    const slidesData = [
        {
          image: 'https://via.placeholder.com/300x200',
          title: 'Alaska: Westminster to Greenwich River Thames',
          duration: '2 hours',
          facilities: ['Transport Facility', 'Family Plan'],
          price: '$35.00',
          reviews: '584 reviews',
          rating: 4.5,
        },
        {
            image: 'https://via.placeholder.com/300x200',
            title: 'Alaska: Westminster to Greenwich River Thames',
            duration: '2 hours',
            facilities: ['Transport Facility', 'Family Plan'],
            price: '$35.00',
            reviews: '584 reviews',
            rating: 4.5,
          },
          {
            image: 'https://via.placeholder.com/300x200',
            title: 'Alaska: Westminster to Greenwich River Thames',
            duration: '2 hours',
            facilities: ['Transport Facility', 'Family Plan'],
            price: '$35.00',
            reviews: '584 reviews',
            rating: 4.5,
          },

        {
          image: 'https://via.placeholder.com/300x200',
          title: 'Alaska: Vintage Double Decker Bus Tour & Thames',
          duration: '2 hours',
          facilities: ['Transport Facility', 'Family Plan'],
          price: '$35.00',
          reviews: '584 reviews',
          rating: 4.5,
        },
        {
          image: 'https://via.placeholder.com/300x200',
          title: 'Alaska: Magic of London Tour with Afternoon Tea',
          duration: '2 hours',
          facilities: ['Transport Facility', 'Family Plan'],
          price: '$35.00',
          reviews: '584 reviews',
          rating: 4.5,
        },
        {
          image: 'https://via.placeholder.com/300x200',
          title: 'Alaska: Magic of London Tour with Afternoon Tea',
          duration: '2 hours',
          facilities: ['Transport Facility', 'Family Plan'],
          price: '$35.00',
          reviews: '584 reviews',
          rating: 4.5,
        },
      ];
  return (
   
    <div className="slidebar-container">
      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={4}
        navigation
        className="custom-swiper"
      >
        {slidesData.map((slide, index) => (
          <SwiperSlide key={index} className="custom-slide">
            <div className="card">
              <img src={slide.image} alt={slide.title} className="card-image" />
              <div className="card-content">
                <h3 className="card-title">{slide.title}</h3>
                <p className="card-duration">Duration: {slide.duration}</p>
                <p className="card-facilities">
                  {slide.facilities.join(' • ')}
                </p>
                <p className="card-reviews">
                  ⭐ {slide.rating} ({slide.reviews})
                </p>
                <p className="card-price">{slide.price} per person</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default SlideBar;

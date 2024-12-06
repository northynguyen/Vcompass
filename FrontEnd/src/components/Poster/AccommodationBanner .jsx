import React from 'react';
import './PostCard.css';
import { useNavigate } from 'react-router-dom';

const AccommodationBanner = ({ cityName }) => {
  const navigate = useNavigate();

  const cities = [
    {
      name: "Hà Nội",
      image: "https://media.vneconomy.vn/images/upload/2023/06/18/quy-hoach-ha-noi.png",
      description: "Thủ đô của Việt Nam, nổi tiếng với lịch sử nghìn năm văn hiến và các di sản văn hóa."
    },
    {
      name: "Hồ Chí Minh",
      image: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Saigon_skyline.jpg",
      description: "Trung tâm kinh tế lớn nhất Việt Nam với nhịp sống hiện đại và sôi động."
    },
    {
      name: "Đà Nẵng",
      image: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Da_Nang_at_night.jpg",
      description: "Thành phố đáng sống với các bãi biển đẹp và những cây cầu nổi tiếng."
    },
    {
      name: "Hải Phòng",
      image: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Cang_Hai_Phong.jpg",
      description: "Thành phố cảng lớn nhất Việt Nam, cửa ngõ giao thương quan trọng ở miền Bắc."
    },
    {
      name: "Cần Thơ",
      image: "https://upload.wikimedia.org/wikipedia/commons/6/63/Can_Tho_Bridge.jpg",
      description: "Thủ phủ của miền Tây sông nước, nổi tiếng với chợ nổi và các khu du lịch sinh thái."
    },
    {
      name: "Bà Rịa - Vũng Tàu",
      image: "https://upload.wikimedia.org/wikipedia/commons/8/83/B%E1%BB%9D_bi%E1%BB%83n_V%C5%A9ng_T%C3%A0u.JPG",
      description: "Điểm đến du lịch biển nổi tiếng với các bãi tắm đẹp và khí hậu mát mẻ."
    },
    {
      name: "Quảng Ninh",
      image: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Ha_Long_Bay.jpg",
      description: "Nơi có Vịnh Hạ Long, di sản thiên nhiên thế giới với hàng ngàn đảo đá vôi."
    },
    {
      name: "Lâm Đồng",
      image: "https://upload.wikimedia.org/wikipedia/commons/2/23/Dalat_flowers.jpg",
      description: "Đà Lạt, thành phố ngàn hoa, là trung tâm du lịch nổi tiếng với khí hậu ôn đới mát mẻ."
    },
    {
      name: "Thanh Hóa",
      image: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Sam_Son_Beach.jpg",
      description: "Nổi tiếng với bãi biển Sầm Sơn và di tích lịch sử Thành Nhà Hồ."
    },
    {
      name: "Nghệ An",
      image: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Cua_Lo_Beach.jpg",
      description: "Quê hương của Chủ tịch Hồ Chí Minh, với các điểm du lịch như Cửa Lò và đồi chè."
    },
    {
      name: "Thừa Thiên Huế",
      image: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Hue_Citadel.jpg",
      description: "Kinh đô của triều đại Nguyễn với các di sản như Đại Nội và lăng tẩm."
    },
    {
      name: "Kiên Giang",
      image: "https://upload.wikimedia.org/wikipedia/commons/6/68/Phu_Quoc_Island.jpg",
      description: "Nơi có đảo Phú Quốc, thiên đường du lịch biển với các resort sang trọng."
    },
    {
      name: "Bình Thuận",
      image: "https://upload.wikimedia.org/wikipedia/commons/5/51/Mui_Ne_Beach.jpg",
      description: "Mũi Né, thủ phủ của các resort biển, nổi tiếng với đồi cát đỏ và hải sản tươi ngon."
    },
    {
      name: "An Giang",
      image: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Sao_Linh_Phu_Quoc.jpg",
      description: "Miền đất tâm linh với Châu Đốc, núi Cấm và nhiều lễ hội đặc sắc."
    },
    {
      name: "Phú Yên",
      image: "https://upload.wikimedia.org/wikipedia/commons/2/29/Ganh_Da_Dia.jpg",
      description: "Nổi bật với Ghềnh Đá Đĩa, nơi có khung cảnh thiên nhiên hùng vĩ."
    },
    // Thêm 48 tỉnh thành còn lại
  ];
  

  const city = cities.find((c) => c.name === cityName);

  if (!city) {
    return <div>Không tìm thấy thông tin về tỉnh/thành phố này.</div>;
  }

  return (
    <div className="accommodation-banner">
      <div className="image-container">
        <img src={city.image} alt={city.name} className="banner-image" />
        <div className="decorative-shapes"></div>
      </div>
      <div className="banner-bg"></div>
      <div className="overlay"></div>

      <div className="banner-content">
        <span className="trending">THỊNH HÀNH</span>
        <h1 className="title">{city.name}</h1>
        <div className="location">
          <i className="fa fa-map-marker" aria-hidden="true">
            <span className="accom-banner">{city.name}</span>
          </i>
          <div>
            <i className="fa-solid fa-star icon-rating"></i>
            <i className="fa-solid fa-star icon-rating"></i>
            <i className="fa-solid fa-star icon-rating"></i>
            <i className="fa-solid fa-star icon-rating"></i>
            <i className="fa-solid fa-star icon-rating"></i>
          </div>
          <span className="rating accom-banner">4.9 (300 reviews)</span>
        </div>
        <p className="description">{city.description}</p>
        <div className="actions">
          <button className="book-now" onClick={() => navigate(`/searchSchedule` , { state: { city: city.name } }) }>Đặt ngay</button>
          <i className="fa-solid fa-heart fa-shake book-schedule-icon"></i>
          <i className="fa-solid fa-share fa-shake book-schedule-icon"></i>
        </div>
      </div>
    </div>
  );
};

export default AccommodationBanner;

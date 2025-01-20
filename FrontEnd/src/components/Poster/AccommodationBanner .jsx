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
        image: "https://cdn.haiphong.gov.vn/gov-hpg/SiteFolders/Root/1/thuvienanh/8403.jpg",
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
    {
        name: "Quảng Bình",
        image: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Phong_Nha_Cave.jpg",
        description: "Nổi tiếng với động Phong Nha - Kẻ Bàng, di sản thiên nhiên thế giới."
    },
    {
        name: "Quảng Trị",
        image: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Quang_Tri_Relics.jpg",
        description: "Mảnh đất lịch sử với nhiều di tích cách mạng và cảnh đẹp thiên nhiên."
    },
    {
        name: "Hòa Bình",
        image: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Hoa_Binh_Lake.jpg",
        description: "Nơi có thủy điện Hòa Bình và nhiều cảnh đẹp vùng núi Tây Bắc."
    },
    {
        name: "Sơn La",
        image: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Son_La_Tea_Hill.jpg",
        description: "Nổi bật với các đồi chè và văn hóa các dân tộc thiểu số."
    },
    {
        name: "Yên Bái",
        image: "https://upload.wikimedia.org/wikipedia/commons/9/91/Mu_Cang_Chai.jpg",
        description: "Nơi có ruộng bậc thang Mù Cang Chải nổi tiếng."
    },
    {
        name: "Tuyên Quang",
        image: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Tuyen_Quang.jpg",
        description: "Vùng đất cách mạng với nhiều di tích lịch sử quan trọng."
    },
    {
        name: "Lào Cai",
        image: "https://upload.wikimedia.org/wikipedia/commons/2/23/Fansipan.jpg",
        description: "Nơi có đỉnh Fansipan - nóc nhà Đông Dương."
    },
    {
        name: "Điện Biên",
        image: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Dien_Bien_Phu.jpg",
        description: "Mảnh đất lịch sử gắn liền với chiến thắng Điện Biên Phủ."
    },
    {
        name: "Lai Châu",
        image: "https://upload.wikimedia.org/wikipedia/commons/6/68/Lai_Chau.jpg",
        description: "Nơi có phong cảnh hùng vĩ và văn hóa đặc sắc của các dân tộc thiểu số."
    },
    {
        name: "Hà Giang",
        image: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Dong_Van_Ha_Giang.jpg",
        description: "Điểm cực Bắc của Việt Nam, nổi tiếng với cao nguyên đá Đồng Văn."
    },
    {
        name: "Cao Bằng",
        image: "https://upload.wikimedia.org/wikipedia/commons/2/25/Ban_Gioc_Waterfall.jpg",
        description: "Nơi có thác Bản Giốc và các di tích lịch sử cách mạng."
    },
    {
        name: "Bắc Kạn",
        image: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Ba_Be_Lake.jpg",
        description: "Nổi tiếng với hồ Ba Bể và cảnh quan thiên nhiên tuyệt đẹp."
    },
    {
        name: "Thái Nguyên",
        image: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Thai_Nguyen.jpg",
        description: "Vùng đất chè nổi tiếng với văn hóa trà đặc trưng."
    },
    {
        name: "Lạng Sơn",
        image: "https://upload.wikimedia.org/wikipedia/commons/6/67/Lang_Son.jpg",
        description: "Vùng biên giới phía Bắc với nhiều danh lam thắng cảnh và cửa khẩu quốc tế."
    },
    {
        name: "Bắc Giang",
        image: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Bac_Giang.jpg",
        description: "Nơi có chùa Vĩnh Nghiêm và các làng nghề truyền thống."
    },
    {
        name: "Bắc Ninh",
        image: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Bac_Ninh.jpg",
        description: "Cái nôi của dân ca quan họ Bắc Ninh."
    },
    {
        name: "Vĩnh Phúc",
        image: "https://upload.wikimedia.org/wikipedia/commons/7/71/Vinh_Phuc.jpg",
        description: "Nổi tiếng với Tam Đảo và các khu nghỉ dưỡng trên núi."
    },
    {
        name: "Hải Dương",
        image: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Hai_Duong.jpg",
        description: "Vùng đất nổi tiếng với bánh đậu xanh và nhiều di tích lịch sử."
    },
    {
        name: "Hưng Yên",
        image: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Hung_Yen.jpg",
        description: "Nơi có phố Hiến và nhãn lồng nổi tiếng."
    },
    {
        name: "Nam Định",
        image: "https://upload.wikimedia.org/wikipedia/commons/2/27/Nam_Dinh.jpg",
        description: "Vùng đất văn hóa với nhà thờ Phát Diệm và nhiều lễ hội."
    },
    {
        name: "Thái Bình",
        image: "https://upload.wikimedia.org/wikipedia/commons/5/54/Thai_Binh.jpg",
        description: "Vùng quê lúa với nhiều di tích và cảnh đẹp thanh bình."
    },
    {
        name: "Ninh Bình",
        image: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Trang_An.jpg",
        description: "Di sản thế giới Tràng An với cảnh quan núi non hùng vĩ."
    },
    {
        name: "Quảng Ngãi",
        image: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Quang_Ngai.jpg",
        description: "Nơi có Lý Sơn, hòn đảo thiên đường của miền Trung."
    },
    {
        name: "Quảng Nam",
        image: "https://upload.wikimedia.org/wikipedia/commons/3/30/Hoi_An.jpg",
        description: "Nơi có phố cổ Hội An, một di sản văn hóa thế giới."
    },
    {
        name: "Bình Định",
        image: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Binh_Dinh.jpg",
        description: "Vùng đất võ Bình Định và bãi biển Quy Nhơn tuyệt đẹp."
    },
    {
        name: "Khánh Hòa",
        image: "https://upload.wikimedia.org/wikipedia/commons/9/99/Nha_Trang.jpg",
        description: "Nơi có thành phố biển Nha Trang nổi tiếng."
    },
    {
        name: "Ninh Thuận",
        image: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Ninh_Thuan.jpg",
        description: "Nổi tiếng với vườn quốc gia Núi Chúa và văn hóa người Chăm."
    },
    {
        name: "Gia Lai",
        image: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Gia_Lai.jpg",
        description: "Vùng đất đỏ bazan với nhiều thác nước và văn hóa Tây Nguyên."
    },
    {
        name: "Kon Tum",
        image: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Kon_Tum.jpg",
        description: "Vùng đất với những nhà rông và văn hóa đặc sắc."
    },
    {
        name: "Đắk Lắk",
        image: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Dak_Lak.jpg",
        description: "Nổi tiếng với Buôn Đôn, nơi có văn hóa săn voi."
    },
    {
        name: "Đắk Nông",
        image: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Dak_Nong.jpg",
        description: "Nơi có hồ Tà Đùng, được mệnh danh là Hạ Long của Tây Nguyên."
    },
    {
        name: "Bình Phước",
        image: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Binh_Phước.jpg",
        description: "Nơi có rừng cao su bạt ngàn và các khu di tích lịch sử."
    }
];
;
  

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

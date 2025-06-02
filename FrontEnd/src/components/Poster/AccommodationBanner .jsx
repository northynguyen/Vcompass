import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AccommodationBanner.css';

const AccommodationBanner = ({ cityName, scheduleSize }) => {
    const navigate = useNavigate();

    const cities = [
        {
            name: "Hà Nội",
            image: "https://media.vneconomy.vn/images/upload/2023/06/18/quy-hoach-ha-noi.png",
            description: "Thủ đô của Việt Nam, nổi tiếng với lịch sử nghìn năm văn hiến và các di sản văn hóa."
        },
        {
            name: "Hồ Chí Minh",
            image: "https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcRx4xRc2D5_z6cGu3cFbFN_Nhd76ulKhEt1r8kmZc9YkcR_QKthMhm8t60SVE6j3njfROAOSSjFVco6HM-XDNW0q00xIi9pIzdTuLDkEg",
            description: "Trung tâm kinh tế lớn nhất Việt Nam với nhịp sống hiện đại và sôi động."
        },
        {
            name: "Đà Nẵng",
            image: "https://docs.portal.danang.gov.vn/images/image/anhdanang_1490838715897.jpg",
            description: "Thành phố đáng sống với các bãi biển đẹp và những cây cầu nổi tiếng."
        },
        {
            name: "Hải Phòng",
            image: "https://images2.thanhnien.vn/528068263637045248/2025/4/14/nhung-dau-an-hp-220221124153443-1744624646930522691252.jpg",
            description: "Thành phố cảng lớn nhất Việt Nam, cửa ngõ giao thương quan trọng ở miền Bắc."
        },
        {
            name: "Cần Thơ",
            image: "https://tway-air.vn/wp-content/uploads/2024/12/hinh-anh-thanh-pho-can-tho.jpg",
            description: "Thủ phủ của miền Tây sông nước, nổi tiếng với chợ nổi và các khu du lịch sinh thái."
        },
        {
            name: "Bà Rịa - Vũng Tàu",
            image: "https://eggyolk.vn/wp-content/uploads/2024/05/bariavungtau-17027988756532145792606.jpg",
            description: "Điểm đến du lịch biển nổi tiếng với các bãi tắm đẹp và khí hậu mát mẻ."
        },
        {
            name: "Quảng Ninh",
            image: "https://media.vneconomy.vn/w800/images/upload/2025/04/22/1-1607009060-29-1568x1045.jpg",
            description: "Nơi có Vịnh Hạ Long, di sản thiên nhiên thế giới với hàng ngàn đảo đá vôi."
        },
        {
            name: "Lâm Đồng",
            image: "https://dulichhangkhong.com.vn/ve-may-bay/vnt_upload/news/10_2023/maxresdefault_7_1.jpg",
            description: "Đà Lạt, thành phố ngàn hoa, là trung tâm du lịch nổi tiếng với khí hậu ôn đới mát mẻ."
        },
        {
            name: "Thanh Hóa",
            image: "https://iwater.vn/Image/Picture/New/333/tinh_thanh_hoa.jpg",
            description: "Nổi tiếng với bãi biển Sầm Sơn và di tích lịch sử Thành Nhà Hồ."
        },
        {
            name: "Nghệ An",
            image: "https://bna.1cdn.vn/thumbs/1200x630/2019/01/07/uploaded-hagiangbna-2019_01_07-_bna_1vinh_sachnguyen3199499_712019.jpg",
            description: "Quê hương của Chủ tịch Hồ Chí Minh, với các điểm du lịch như Cửa Lò và đồi chè."
        },
        {
            name: "Thừa Thiên Huế",
            image: "https://static-images.vnncdn.net/files/publish/2022/8/24/emag-cover-desk-240.jpg?width=0&s=G6YvaRqM9_6S67asebgCXQ",
            description: "Kinh đô của triều đại Nguyễn với các di sản như Đại Nội và lăng tẩm."
        },
        {
            name: "Kiên Giang",
            image: "https://cdn-media.sforum.vn/storage/app/media/ctvseo_MH/%E1%BA%A3nh%20%C4%91%E1%BA%B9p%20ki%C3%AAn%20giang/anh-dep-kien-giang-5.jpg",
            description: "Nơi có đảo Phú Quốc, thiên đường du lịch biển với các resort sang trọng."
        },
        {
            name: "Bình Thuận",
            image: "https://media.thuonghieucongluan.vn/uploads/2024/08/28/1-1724816233.jpeg",
            description: "Mũi Né, thủ phủ của các resort biển, nổi tiếng với đồi cát đỏ và hải sản tươi ngon."
        },
        {
            name: "An Giang",
            image: "https://intour.vn/upload/img/0f70a9710eb8c8bd31bb847ec81b5dd0/2022/03/29/gia_ve_cac_diem_tham_quan_tai_an_giang_moi_nhat_1648526372.jpg",
            description: "Miền đất tâm linh với Châu Đốc, núi Cấm và nhiều lễ hội đặc sắc."
        },
        {
            name: "Phú Yên",
            image: "https://images2.thanhnien.vn/528068263637045248/2025/4/15/z65068944699020fdcef20a79d6c81dfa3d96d6c9def6c-1744718530765319778765.jpg",
            description: "Nổi bật với Ghềnh Đá Đĩa, nơi có khung cảnh thiên nhiên hùng vĩ."
        },
        {
            name: "Quảng Bình",
            image: "https://nads.1cdn.vn/2024/08/30/w_59-tbtl-pham-van-thuc-quang-binh-binh-minh-tu-lan.jpg",
            description: "Nổi tiếng với động Phong Nha - Kẻ Bàng, di sản thiên nhiên thế giới."
        },
        {
            name: "Quảng Trị",
            image: "https://image.thanhnien.vn/Uploaded/phucndh/2022_12_28/0020a-hoang-hon-dong-ha-1510.jpg",
            description: "Mảnh đất lịch sử với nhiều di tích cách mạng và cảnh đẹp thiên nhiên."
        },
        {
            name: "Hòa Bình",
            image: "https://vietimes.com.vn/wp-content/uploads/2023/04/hoa-binh-o-dau-2.jpg",
            description: "Nơi có thủy điện Hòa Bình và nhiều cảnh đẹp vùng núi Tây Bắc."
        },
        {
            name: "Sơn La",
            image: "https://res.cloudinary.com/dqpdjk8jy/image/upload/v1715162226/sonla_mocchau_teahills_mountains_morning_yt21fa.jpg",
            description: "Nổi bật với các đồi chè và văn hóa các dân tộc thiểu số."
        },
        {
            name: "Yên Bái",
            image: "https://res.cloudinary.com/dqpdjk8jy/image/upload/v1715162268/yenbai_mucangchai_terraced_rice_fields_golden_harvest_kbf1qf.jpg",
            description: "Nơi có ruộng bậc thang Mù Cang Chải nổi tiếng."
        },
        {
            name: "Tuyên Quang",
            image: "https://res.cloudinary.com/dqpdjk8jy/image/upload/v1715162319/tuyenquang_nalake_morning_fog_mountains_oa88sz.jpg",
            description: "Vùng đất cách mạng với nhiều di tích lịch sử quan trọng."
        },
        {
            name: "Lào Cai",
            image: "https://res.cloudinary.com/dqrv3j1vz/image/upload/v1697000742/sapa_terraced_rice_fields_fog_morning_t1fvzx.jpg",
            description: "Nơi có đỉnh Fansipan - nóc nhà Đông Dương."
        },
        {
            name: "Điện Biên",
            image: "https://res.cloudinary.com/dqpdjk8jy/image/upload/v1715162381/dienbienphu_victory_monument_historic_battlefield_zcxvrw.jpg",
            description: "Mảnh đất lịch sử gắn liền với chiến thắng Điện Biên Phủ."
        },
        {
            name: "Lai Châu",
            image: "https://res.cloudinary.com/dqpdjk8jy/image/upload/v1715162437/laichau_mountains_rice_terraces_clouds_ethnic_villages_dfmjpg.jpg",
            description: "Nơi có phong cảnh hùng vĩ và văn hóa đặc sắc của các dân tộc thiểu số."
        },
        {
            name: "Hà Giang",
            image: "https://cdn.xanhsm.com/2025/02/e17bf167-dia-diem-du-lich-ha-giang-1.jpg",
            description: "Điểm cực Bắc của Việt Nam, nổi tiếng với cao nguyên đá Đồng Văn."
        },
        {
            name: "Cao Bằng",
            image: "https://res.cloudinary.com/dqrv3j1vz/image/upload/v1697001048/bangioc_waterfall_majestic_flowing_limestone_jkrfoe.jpg",
            description: "Nơi có thác Bản Giốc và các di tích lịch sử cách mạng."
        },
        {
            name: "Bắc Kạn",
            image: "https://res.cloudinary.com/dqpdjk8jy/image/upload/v1715162500/backan_babe_lake_morning_mist_mountain_reflections_nzyzqt.jpg",
            description: "Nổi tiếng với hồ Ba Bể và cảnh quan thiên nhiên tuyệt đẹp."
        },
        {
            name: "Thái Nguyên",
            image: "https://res.cloudinary.com/dqpdjk8jy/image/upload/v1715162564/thainguyen_tea_plantation_morning_light_workers_csoub5.jpg",
            description: "Vùng đất chè nổi tiếng với văn hóa trà đặc trưng."
        },
        {
            name: "Lạng Sơn",
            image: "https://res.cloudinary.com/dqpdjk8jy/image/upload/v1715162614/langson_tamthanh_pagoda_misty_morning_vfznmn.jpg",
            description: "Vùng biên giới phía Bắc với nhiều danh lam thắng cảnh và cửa khẩu quốc tế."
        },
        {
            name: "Bắc Giang",
            image: "https://res.cloudinary.com/dqpdjk8jy/image/upload/v1715162659/bacgiang_yentu_pagoda_buddhist_temple_misty_mountains_mtvbek.jpg",
            description: "Nơi có chùa Vĩnh Nghiêm và các làng nghề truyền thống."
        },
        {
            name: "Bắc Ninh",
            image: "https://res.cloudinary.com/dqpdjk8jy/image/upload/v1715162706/bacninh_dotemple_historic_pagoda_traditional_architecture_njgahp.jpg",
            description: "Cái nôi của dân ca quan họ Bắc Ninh."
        },
        {
            name: "Vĩnh Phúc",
            image: "https://res.cloudinary.com/dqpdjk8jy/image/upload/v1715162739/vinhphuc_tamdao_mountains_resorts_fog_kqwmlw.jpg",
            description: "Nổi tiếng với Tam Đảo và các khu nghỉ dưỡng trên núi."
        },
        {
            name: "Hải Dương",
            image: "https://res.cloudinary.com/dqpdjk8jy/image/upload/v1715162781/haiduong_conson_pagoda_historic_temple_river_bxhytv.jpg",
            description: "Vùng đất nổi tiếng với bánh đậu xanh và nhiều di tích lịch sử."
        },
        {
            name: "Hưng Yên",
            image: "https://res.cloudinary.com/dqpdjk8jy/image/upload/v1715162830/hungyen_longan_orchard_harvest_season_rural_beauty_pvxvdm.jpg",
            description: "Nơi có phố Hiến và nhãn lồng nổi tiếng."
        },
        {
            name: "Nam Định",
            image: "https://res.cloudinary.com/dqpdjk8jy/image/upload/v1715162871/namdinh_phatdiem_stone_cathedral_gothic_architecture_rwtsnm.jpg",
            description: "Vùng đất văn hóa với nhà thờ Phát Diệm và nhiều lễ hội."
        },
        {
            name: "Thái Bình",
            image: "https://res.cloudinary.com/dqpdjk8jy/image/upload/v1715162917/thaibinh_rice_fields_golden_harvest_rural_landscape_wuv35o.jpg",
            description: "Vùng quê lúa với nhiều di tích và cảnh đẹp thanh bình."
        },
        {
            name: "Ninh Bình",
            image: "https://res.cloudinary.com/dqrv3j1vz/image/upload/v1697000765/ninhbinh_tranganh_limestone_boat_tour_ug7xmd.jpg",
            description: "Di sản thế giới Tràng An với cảnh quan núi non hùng vĩ."
        },
        {
            name: "Quảng Ngãi",
            image: "https://res.cloudinary.com/dqpdjk8jy/image/upload/v1715162962/quangngai_lyson_island_garlic_fields_ocean_view_lkv9ef.jpg",
            description: "Nơi có Lý Sơn, hòn đảo thiên đường của miền Trung."
        },
        {
            name: "Quảng Nam",
            image: "https://res.cloudinary.com/dqrv3j1vz/image/upload/v1697000675/hoian_ancient_town_lanterns_night_ykxgve.jpg",
            description: "Nơi có phố cổ Hội An, một di sản văn hóa thế giới."
        },
        {
            name: "Bình Định",
            image: "https://res.cloudinary.com/dqrv3j1vz/image/upload/v1697000988/quynhon_eogio_bay_crystal_clear_waters_cjkpga.jpg",
            description: "Vùng đất võ Bình Định và bãi biển Quy Nhơn tuyệt đẹp."
        },
        {
            name: "Khánh Hòa",
            image: "https://media.vneconomy.vn/w800/images/upload/2022/03/22/nhatrangkh.jpeg",
            description: "Nơi có thành phố biển Nha Trang nổi tiếng."
        },
        {
            name: "Ninh Thuận",
            image: "https://res.cloudinary.com/dqpdjk8jy/image/upload/v1715163000/ninhthuan_vineyards_grape_harvest_winery_landscape_qe2vbz.jpg",
            description: "Nổi tiếng với vườn quốc gia Núi Chúa và văn hóa người Chăm."
        },
        {
            name: "Gia Lai",
            image: "https://res.cloudinary.com/dqpdjk8jy/image/upload/v1715163047/gialai_bienho_tea_plantation_highlands_morning_mist_ogjr6a.jpg",
            description: "Vùng đất đỏ bazan với nhiều thác nước và văn hóa Tây Nguyên."
        },
        {
            name: "Kon Tum",
            image: "https://res.cloudinary.com/dqpdjk8jy/image/upload/v1715163093/kontum_wooden_church_ethnic_minority_architecture_nbfjcx.jpg",
            description: "Vùng đất với những nhà rông và văn hóa đặc sắc."
        },
        {
            name: "Đắk Lắk",
            image: "https://res.cloudinary.com/dqpdjk8jy/image/upload/v1715163129/daklak_elephant_festival_traditional_event_central_highlands_nolnrm.jpg",
            description: "Nổi tiếng với Buôn Đôn, nơi có văn hóa săn voi."
        },
        {
            name: "Đắk Nông",
            image: "https://res.cloudinary.com/dqpdjk8jy/image/upload/v1715163166/daknong_tadung_lake_aerial_view_islands_highland_landscape_v5ymwc.jpg",
            description: "Nơi có hồ Tà Đùng, được mệnh danh là Hạ Long của Tây Nguyên."
        },
        {
            name: "Bình Phước",
            image: "https://res.cloudinary.com/dqpdjk8jy/image/upload/v1715163203/binhphuoc_rubber_plantation_sunrise_red_soil_landscape_ipoqrx.jpg",
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
                <div className="banner-city-name">
                    <span className="trending">THỊNH HÀNH</span>
                    <h1 className="title">{city.name}</h1>
                </div>
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
                   <span className="rating accom-banner">{scheduleSize? scheduleSize + " lịch trình" : "0 lịch trình"}</span>
                </div>
                <p className="description">{city.description}</p>
                <div className="actions">
                    <button className="book-now" onClick={() => navigate(`/searchSchedule`, { state: { city: city.name } })}>Khám phá ngay</button>
                    <i className="fa-solid fa-heart fa-shake book-schedule-icon"></i>
                    <i className="fa-solid fa-share fa-shake book-schedule-icon"></i>
                </div>
            </div>
        </div>
    );
};

export default AccommodationBanner;

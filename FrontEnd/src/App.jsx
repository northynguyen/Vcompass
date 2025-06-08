import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet/dist/leaflet.css";
import  { lazy, Suspense, useState, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ChatBox from "./components/ChatBox/ChatBox";
import ShortVideo from './pages/ShortVideo/ShortVideo';
import SignIn from './components/SignIn/SignIn';
import PageSchedules from './pages/PageSchedules/PageSchedules';
import { Helmet } from "react-helmet-async";
import PropTypes from 'prop-types';

const Page404 = lazy(() => import('./components/Page404/Page404'));
const AuthRedirect = lazy(() => import('./pages/AuthRedirect/AuthRedirect'));
const BookingProcess = lazy(() => import('./pages/Booking/Booking'));
const CreateSchedule = lazy(() => import('./pages/CreateSchedule/CreateSchedule'));
const Home = lazy(() => import('./pages/Home/Home'));
const HomeAttractions = lazy(() => import('./pages/HomeAttractions/HomeAttractions'));
const HomeBooking = lazy(() => import('./pages/HomeBooking/HomeBooking'));
const HomeFoodService = lazy(() => import('./pages/HomeFoodService/HomeFoodService'));
const MySchedule = lazy(() => import('./pages/MySchedule/MySchedule'));
const Partnership = lazy(() => import('./pages/Partnership/Partnership'));
const PlaceDetails = lazy(() => import('./pages/PlaceDetails/PlaceDetails'));
const Schedule = lazy(() => import('./pages/Schedule/Schedule'));
const UserService = lazy(() => import('./pages/UserService/UserService'));
const OtherUserProfile = lazy(() => import("./pages/OtherUserProfile/OtherUserProfile"));
const SearchSchedule = lazy(() => import('./pages/SearchSchedule/SearchSchedule'));
const ValidateEmail = lazy(() => import("./components/ValidateEmail/ValidateEmail"));
const MapTest = lazy(() => import("./components/MapTest"));

// Component for default meta tags
const DefaultMetaTags = ({ title, description, image, url }) => {
  return (
    <Helmet>
      <title>{title || "VCompass - Du lịch theo cách của bạn"}</title>
      <meta name="description" content={description || "VCompass - Nền tảng du lịch thông minh giúp bạn lập kế hoạch, chia sẻ lịch trình và khám phá những điểm đến tuyệt vời tại Việt Nam."} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={title || "VCompass - Du lịch theo cách của bạn"} />
      <meta property="og:description" content={description || "Nền tảng du lịch thông minh giúp bạn lập kế hoạch, chia sẻ lịch trình và khám phá những điểm đến tuyệt vời tại Việt Nam."} />
      <meta property="og:image" content={image || "https://vcompass.onrender.com/logo_no_cap.png"} />
      <meta property="og:url" content={url || "https://vcompass.onrender.com"} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="VCompass" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || "VCompass - Du lịch theo cách của bạn"} />
      <meta name="twitter:description" content={description || "Nền tảng du lịch thông minh giúp bạn lập kế hoạch, chia sẻ lịch trình và khám phá những điểm đến tuyệt vời tại Việt Nam."} />
      <meta name="twitter:image" content={image || "https://vcompass.onrender.com/logo_no_cap.png"} />
    </Helmet>
  );
};

DefaultMetaTags.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string
};

// Component wrapper để kiểm tra route hiện tại
const AppContent = () => {
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [currentConversation, setCurrentConversation] = useState();
  
  // Kiểm tra nếu đang ở trang ShortVideo
  const isShortVideoPage = location.pathname === '/short-video';
  
  // Log khi showLogin thay đổi (ngoài JSX)
  useEffect(() => {
    console.log("showLogin changed:", showLogin);
  }, [showLogin]);

  // Function to get meta tags based on current path
  const getPageMetaTags = () => {
    const path = location.pathname;
    const currentUrl = `https://vcompass.onrender.com${path}`;
    
    switch (true) {
      case path === '/':
        return {
          title: "VCompass - Du lịch theo cách của bạn",
          description: "Khám phá Việt Nam với VCompass - Nền tảng du lịch thông minh giúp bạn lập kế hoạch, chia sẻ lịch trình và tìm kiếm điểm đến tuyệt vời.",
          url: currentUrl
        };
      case path === '/short-video':
        return {
          title: "Video ngắn du lịch - VCompass",
          description: "Khám phá những video ngắn thú vị về du lịch Việt Nam. Chia sẻ trải nghiệm và cảm hứng du lịch của bạn.",
          url: currentUrl
        };
      case path.includes('/attractions'):
        return {
          title: "Điểm tham quan - VCompass",
          description: "Khám phá các điểm tham quan hấp dẫn nhất Việt Nam. Tìm kiếm và đặt vé các địa điểm du lịch nổi tiếng.",
          url: currentUrl
        };
      case path.includes('/foodservices'):
        return {
          title: "Ẩm thực - VCompass", 
          description: "Khám phá ẩm thực Việt Nam đa dạng. Tìm kiếm nhà hàng, quán ăn ngon và đặt bàn dễ dàng.",
          url: currentUrl
        };
      case path.includes('/booking'):
        return {
          title: "Đặt phòng khách sạn - VCompass",
          description: "Đặt phòng khách sạn, resort với giá tốt nhất. So sánh và lựa chọn chỗ nghỉ phù hợp cho chuyến đi.",
          url: currentUrl
        };
      case path.includes('/my-schedule'):
        return {
          title: "Lịch trình của tôi - VCompass",
          description: "Quản lý và xem lại các lịch trình du lịch của bạn. Chia sẻ kế hoạch với bạn bè và gia đình.",
          url: currentUrl
        };
      case path.includes('/create-schedule'):
        return {
          title: "Tạo lịch trình du lịch - VCompass",
          description: "Tạo lịch trình du lịch chi tiết với AI thông minh. Lập kế hoạch hoàn hảo cho chuyến đi của bạn.",
          url: currentUrl
        };
      case path.includes('/searchSchedule'):
        return {
          title: "Tìm kiếm lịch trình - VCompass",
          description: "Tìm kiếm và khám phá hàng ngàn lịch trình du lịch được chia sẻ bởi cộng đồng VCompass.",
          url: currentUrl
        };
      default:
        return {
          title: "VCompass - Du lịch theo cách của bạn",
          description: "VCompass - Nền tảng du lịch thông minh giúp bạn lập kế hoạch, chia sẻ lịch trình và khám phá những điểm đến tuyệt vời tại Việt Nam.",
          url: currentUrl
        };
    }
  };
  
  return (
    <div className="app-container">
      {/* Dynamic Meta Tags based on current page */}
      <DefaultMetaTags {...getPageMetaTags()} />
      
      {/* Only show Header if not on ShortVideo page */}
      {!isShortVideoPage && <Header setShowLogin={setShowLogin} />}
      <div className="app-content">
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable={false}
          theme="light"
          limit={3}
          style={{ zIndex: 9999 }}
        />
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home setShowLogin={setShowLogin} />} />
            <Route path="/place-details/:type/:serviceId" element={<PlaceDetails setShowLogin={setShowLogin} />} />
            <Route path="/partnership" element={<Partnership />} />
            <Route path="/about" element={<Schedule />} />
            <Route path="/create-schedule/:type" element={<CreateSchedule setShowLogin={setShowLogin} />} />
            <Route path="/user-service/*" element={<UserService setShowLogin={setShowLogin} />} />
            <Route path="/booking" element={<HomeBooking />} />
            <Route path="/attractions" element={<HomeAttractions />} />
            <Route path="/foodservices" element={<HomeFoodService />} />
            <Route path="/schedule/validate-email" element={<ValidateEmail setShowLogin={setShowLogin}/>} />
            <Route path="/my-schedule" element={<MySchedule setShowLogin={setShowLogin} />} />
            <Route path="/schedule-edit/:id" element={<Schedule mode="edit" setShowLogin={setShowLogin} />} />
            <Route path="/schedule-view/:id" element={<Schedule mode="view" setShowLogin={setShowLogin} />} />
            <Route path="/booking-process/step2" element={<BookingProcess setShowLogin={setShowLogin} />} />
            <Route path="/searchSchedule" element={<SearchSchedule setShowLogin={setShowLogin} />} />
            <Route path="/otherUserProfile/:id" element={<OtherUserProfile setCurrentConversation={setCurrentConversation} setShowLogin={setShowLogin} />} />
            <Route path="/booking-process/finalstep" element={<BookingProcess setShowLogin={setShowLogin} />} />
            <Route path="/short-video" element={<ShortVideo setShowLogin={setShowLogin} />} />
            <Route path="/schedules/:type" element={<PageSchedules setShowLogin={setShowLogin} />} />
            <Route path="*" element={<Page404 />} />
            <Route path="/404" element={<Page404 />} />
            <Route path="/mapplace" element={<MapTest />} />
            <Route path="/auth/success" element={<AuthRedirect />} />
          </Routes>
        </Suspense>
        <ChatBox currentConversation={currentConversation} setCurrentConversation={setCurrentConversation} />
      </div>
      {/* Only show Footer if not on ShortVideo page */}
      {!isShortVideoPage && <Footer />}
      {/* Hiển thị SignIn khi showLogin = true */}
      {showLogin && <SignIn setShowLogin={setShowLogin} />}
    </div>
  );
};

function App() {
  return (
    <AppContent />
  );
}

export default App;

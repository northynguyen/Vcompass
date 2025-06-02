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
  
  return (
    <div className="app-container">
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

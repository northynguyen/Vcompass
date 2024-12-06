import { Routes, Route } from 'react-router-dom'; // Import routing components
import MenuBar from '../../components/MenuBar/MenuBar';
import Dashboard from '../../components/DashBoard/DashBoard';
import Reservation from '../../components/Reservation/Reservation';
import Message from '../../components/Message/Message';
import Hotels from '../../components/Hotels/Hotels';
import Restaurent from '../../components/Restaurants/Restaurants';
import Calendar from '../../components/Calendar/Calendar';
import './MainPage.css';
import Header from '../../components/Header/Header';
import ReviewDashboard from '../../components/Review/ReviewDashBoard/ReviewDashBoard';

const MainPage = () => {
  return (
    <>
      <Header />
      <div className="main-page">
        <MenuBar />
        <div className="content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/review" element={<ReviewDashboard />} />
            <Route path="/reservation" element={<Reservation />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/messages" element={<Message />} />
            <Route path="/concierge" element={<Restaurent />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

// export default MainPage;

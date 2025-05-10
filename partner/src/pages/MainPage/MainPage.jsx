import { Navigate, Route, Routes } from 'react-router-dom'; // Import routing components
import Calendar from '../../components/Calendar/Calendar';
import Dashboard from '../../components/DashBoard/DashBoard';
import Header from '../../components/Header/Header';
import Hotels from '../../components/Hotels/Hotels';
import MenuBar from '../../components/MenuBar/MenuBar';
import Message from '../../components/Message/Message';
import Reservation from '../../components/Reservation/Reservation';
import Restaurent from '../../components/Restaurants/Restaurants';
import './MainPage.css';

import MyProfileContainer from '../../components/MyProfile/MyProfile';

import ReviewDashboard from '../../components/Review/ReviewDashBoard/ReviewDashBoard';


const MainPage = () => {
  return (
    <div className="main-container">
      <Header />
      <div className="main-page">
        <MenuBar />
        <div className="content ">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="reservation" element={<Reservation />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="hotels" element={<Hotels />} />
            <Route path="messages" element={<Message />} />
            <Route path="concierge" element={<Restaurent />} />
            <Route path="review" element={<ReviewDashboard />} />
            <Route index element={<Dashboard />} />
            <Route path="/myprofile" element={<MyProfileContainer />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default MainPage;

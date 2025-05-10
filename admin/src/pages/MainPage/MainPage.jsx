import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Headers from '../../components/Header/Header';
import PartnerDetails from '../../components/PartnerDetails/PartnerDetails';
import Sidebar from '../../components/Sidebar/Sidebar';
import UserDetails from '../../components/UserDetails/UserDetails';
import Attraction from '../Attraction/Attraction';
import AttractionDetails from '../Attraction/AttractionDetails';
import Dashboard from '../Dashboard/Dashboard';
import Extensions from '../Extensions/ListExtensions';
import Message from '../Message/Message';
import MyProfileContainer from '../MyProfile/MyProfile';
import Notification from '../Notification/Notification';
import Partners from '../Partners/Partners';
import ReportManagement from '../ReportManagement/ReportManagement';
import Services from '../Services/Services';
import TrainAI from '../TrainAI/TrainAI'
import Tours from '../Tours/Tours';
import Users from '../Users/Users';
import './MainPage.css';
const MainPage = () => {
  return (
    <div className="main-container">
      <Headers />
      <div className="main-page">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notification" element={<Notification />} />
            <Route path="/services" element={<Services />} />
            <Route path="/tours" element={<Tours />} />
            <Route path="/users" element={<Users />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/users/:idUser" element={<UserDetails />} />
            <Route path="/partners/:idPartner" element={<PartnerDetails />} />
            <Route path="/attraction" element={<Attraction />} />
            <Route path="/attraction/details" element={<AttractionDetails />} />
            <Route path="/message" element={<Message />} />
            <Route path="/myprofile" element={<MyProfileContainer />} />
            <Route path="/extensions" element={<Extensions />} />
            <Route path="/reportmanagement" element={<ReportManagement />} />
            <Route path="/trainAI" element={<TrainAI />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default MainPage;

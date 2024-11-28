import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './MainPage.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import Headers from '../../components/Header/Header';
import Dashboard from '../Dashboard/Dashboard';
import Notification from '../Notification/Notification';
import Services from '../Services/Services';
import Tours from '../Tours/Tours';
import Users from '../Users/Users';
import Partners from '../Partners/Partners';
import Message from '../Message/Message';
import UserDetails from '../../components/UserDetails/UserDetails';
import PartnerDetails from '../../components/PartnerDetails/PartnerDetails';
import Attraction from '../Attraction/Attraction';
import AttractionDetails from '../Attraction/AttractionDetails';

const MainPage = () => {
  return (
    <>
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
            <Route path="/users/user" element={<UserDetails />} />
            <Route path="/partners/partner" element={<PartnerDetails />} />
            <Route path="/attraction" element={<Attraction />} />
            <Route path="/attraction/details" element={<AttractionDetails />} />
            <Route path="/message" element={<Message />} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default MainPage;

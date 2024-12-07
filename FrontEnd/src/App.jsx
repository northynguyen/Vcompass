/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer/Footer'
import Header from './components/Header/Header'
import SignIn from './components/SignIn/SignIn'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'
import CreateSchedule from './pages/CreateSchedule/CreateSchedule'
import Home from './pages/Home/Home'
import ListAttrac from './pages/ListAttractions/ListAttractions'
import MySchedule from './pages/MySchedule/MySchedule'
import Partnership from './pages/Partnership/Partnership'
import PlaceDetails from './pages/PlaceDetails/PlaceDetails'
import Schedule from './pages/Schedule/Schedule'
import UserService from './pages/UserService/UserService'
import { ToastContainer } from 'react-toastify';
import BookingProcess from './pages/Booking/Booking'
import Page404 from '../src/components/Page404/Page404'
import HomeBooking from './pages/HomeBooking/HomeBooking'
import HomeAttractions from './pages/HomeAttractions/HomeAttractions';
import HomeFoodService from './pages/HomeFoodService/HomeFoodService'

import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

import SearchSchedule  from './pages/SearchSchedule/SearchSchedule'


function App() {
  const [showLogin, setShowLogin] = useState(false)
  return (
    <>
      {showLogin && <SignIn setShowLogin={setShowLogin} />}
      <div className="app">
        <ToastContainer />
        <Header setShowLogin={setShowLogin} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/place-details/:type/:serviceId" element={<PlaceDetails />} />
          <Route path="/partnership" element={<Partnership />} />
          <Route path="/about" element={<Schedule />} />
          <Route path="/create-schedule" element={<CreateSchedule />} />
          <Route path="/user-service/*" element={<UserService setShowLogin={setShowLogin} />} />
          <Route path="/booking" element={<HomeBooking />} />
          <Route path="/attractions" element={<HomeAttractions />} />
          <Route path="/foodservices" element={<HomeFoodService />} />
          <Route path="/my-schedule" element={<MySchedule setShowLogin={setShowLogin} />} />

          <Route path="/schedule-edit/:id" element={<Schedule mode = {"edit"}/>} />
          <Route path="/schedule-view/:id" element={<Schedule mode = {"view"}/>} />
          <Route path="/booking-process/step2" element={<BookingProcess />}/>
          <Route path="/searchSchedule" element={<SearchSchedule />} />
          
          <Route path="/booking-process/finalstep" element={<BookingProcess />}/>    
          <Route path="*" element={<Page404 />} />
          <Route path="/404" element={<Page404 />}/>
        </Routes>
        <Footer />
      </div>
    </>

  )
}

export default App

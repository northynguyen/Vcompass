/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer/Footer'
import Header from './components/Header/Header'
import SignIn from './components/SignIn/SignIn'
import './index.css'



import ListAttrac from './pages/ListAttractions/ListAttractions'
import Partnership from './pages/Partnership/Partnership'
import PlaceDetails from './pages/PlaceDetails/PlaceDetails'
import Schedule from './pages/Schedule/Schedule'
import UserService from './pages/UserService/UserService'
import Home from './pages/Home/Home'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify';







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
          <Route path="/place-details" element={<PlaceDetails />} />
          <Route path="/partnership" element={<Partnership />} />
          <Route path="/about" element={<Schedule />} />

          <Route path="/user-service" element={<UserService />} />
          <Route path="/booking" element={<ListAttrac />} />

        </Routes>
        <Footer />
      </div>
    </>

  )
}

export default App

/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import reactLogo from './assets/react.svg'
import PlaceDetails from './pages/PlaceDetails/PlaceDetails'
import UserService from './pages/UserService/UserService'
import Partnership from './pages/Partnership/Partnership'
import Header from './components/Header/Header'
import './index.css'
import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer/Footer'
import SignIn from './components/SignIn/SignIn'

function App() {
  const [showLogin, setShowLogin] = useState(false)
  return (
    <>
      {showLogin && <SignIn setShowLogin={setShowLogin} />}
      <div className="app">
        <Header setShowLogin={setShowLogin} />
        <Routes>
          <Route path="/" element={<PlaceDetails />} />
          <Route path="/partnership" element={<Partnership />} />
          <Route path="/user-service" element={<UserService />} />
        </Routes>
        <Footer />
      </div>
    </>

  )
}

export default App

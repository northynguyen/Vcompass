/* eslint-disable no-unused-vars */
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import PlaceDetails from './pages/PlaceDetails/PlaceDetails'
import UserService from './pages/UserService/UserService'
import Partnership from './pages/Partnership/Partnership'
import Header from './components/Header/Header'
import './index.css'
import {Route, Routes} from 'react-router-dom'

function App() {

  return (
  
      <div className="app">
      <Header />
      <Routes>
          <Route path="/" element={<PlaceDetails />} />
          <Route path="/partnership" element={<Partnership />} />
          <Route path="/user-service" element={<UserService />} />
      </Routes>
      </div>
  )
}

export default App

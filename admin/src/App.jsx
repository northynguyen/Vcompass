import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard/Dashboard'
import Notification from './pages/Notification/Notification'
import Services from './pages/Services/Services'
import Service from './pages/Services/Service'
import NewService from './pages/Services/New'
import Tours from './pages/Tours/Tours'
import Tour from './pages/Tours/Tour'
import NewTour from './pages/Tours/New'
import Users from './pages/Users/Users'
import User from './pages/Users/User'
import NewUser from './pages/Users/New'

const App = () => {
  return (
    <div>
      <Navbar />
      <hr />
      <div className='app-content'>
        <Sidebar />
        <Routes>
          <Route index path='/dashboard' element={<Dashboard />}></Route>
          <Route path='/users'>
            <Route index element={<Users />}></Route>
            <Route path=':userId' element={<User />}></Route>
            <Route path='new' element={<NewUser />}></Route>
          </Route>
          <Route path='/tours'>
            <Route index element={<Tours />}></Route>
            <Route path=':tourId' element={<Tour />}></Route>
            <Route path='new' element={<NewTour />}></Route>
          </Route>
          <Route path='/services'>
            <Route index element={<Services />}></Route>
            <Route path=':serviceId' element={<Service />}></Route>
            <Route path='new' element={<NewService />}></Route>
          </Route>
          <Route path='/notifications' element={<Notification />}></Route>
        </Routes>
      </div>
    </div>
  )
}

export default App
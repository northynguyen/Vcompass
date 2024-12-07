import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StoreContext } from './Context/StoreContext';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MenuBar from '../src/components/MenuBar/MenuBar';
import Dashboard from '../src/components/DashBoard/DashBoard';
import Reservation from '../src/components/Reservation/Reservation';
import Message from '../src/components/Message/Message';
import Hotels from '../src/components/Hotels/Hotels';
import Restaurent from '../src/components/Restaurants/Restaurants';
import Calendar from '../src/components/Calendar/Calendar';
import ReviewDashboard from '../src/components/Review/ReviewDashBoard/ReviewDashBoard';
import MyProfileContainer from '../src/components/MyProfile/MyProfile';
import './index.css';
import Header from '../src/components/Header/Header';

function App() {
  const { token } = React.useContext(StoreContext);

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" replace />;
  };

  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/" replace /> : <Register />}
        />

        {/* Protected Routes */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <div>
                <Header />
                <div className="main-page">
                  <MenuBar />
                  <div className="content">
                    <Routes>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="reservation" element={<Reservation />} />
                      <Route path="calendar" element={<Calendar />} />
                      <Route path="hotels" element={<Hotels />} />
                      <Route path="messages" element={<Message />} />
                      <Route path="concierge" element={<Restaurent />} />
                      <Route path="review" element={<ReviewDashboard />} />
                      <Route index element={<ReviewDashboard />} />
                      <Route path="/myprofile" element={<MyProfileContainer />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;

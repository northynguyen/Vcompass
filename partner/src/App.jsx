import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StoreContext } from './Context/StoreContext';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import MainPage from './pages/MainPage/MainPage';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {
  const { token } = React.useContext(StoreContext);

  return (
    <div>
      <ToastContainer />
      <Routes>  

      <Route
        path="/"
        element={token ? <MainPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/login"
        element={token ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={token ? <Navigate to="/" replace /> : <Register />}
      />
    </Routes>
    </div>
    
  );
}

export default App;

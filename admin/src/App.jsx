import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StoreContext } from './Context/StoreContext';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import MainPage from './pages/MainPage/MainPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { token } = useContext(StoreContext);

  return (
    <div>
      <ToastContainer />
      <Routes>
        {token ? (
          <Route path="/*" element={<MainPage />} />
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;

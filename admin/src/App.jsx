import React, { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { StoreContext } from './Context/StoreContext';
import Login from './pages/Login/Login';
import MainPage from './pages/MainPage/MainPage';
import Register from './pages/Register/Register';

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

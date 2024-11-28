import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import StoreContextProvider from './Context/StoreContext.jsx'; // Context để quản lý trạng thái

// Tạo root cho ứng dụng
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <StoreContextProvider>
        <App />  {/* App bao gồm các route */}
      </StoreContextProvider>
    </BrowserRouter>
  </StrictMode>
);

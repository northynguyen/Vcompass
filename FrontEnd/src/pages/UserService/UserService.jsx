import { useLocation , useNavigate,Navigate} from 'react-router-dom';
import { useEffect, useState , useContext } from 'react';
import './UserService.css';
import MyBooking from '../../components/UserService/MyBooking/MyBooking';
import MyAccount from '../../components/UserService/MyAccount/MyAccount';
import MyWishList from '../../components/UserService/MyWishList/MyWishList';
import Sidebar from '../../components/UserService/Slidebar/Slidebar';
import { Route, Routes } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';

const UserService = () => {
  const navigate = useNavigate();
  const {token} = useContext(StoreContext);
  const location = useLocation();
  const initialTab = location.state?.tab || 'booking'; // Lấy tab từ state hoặc mặc định là 'booking'
  const [activeTab, setActiveTab] = useState(initialTab); // Đặt giá trị tab ban đầu dựa trên state được gửi
  const [send, setSend] = useState(false);
  
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab); // Cập nhật tab nếu có thay đổi
    }
    console.log(location.state);
    if (location.state?.send) {
      setSend(true);
  }
  }, [location.state]);

  console.log(send);



  return (
    
    <>    
    <div className="user-service-container">
        
       <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="content">
        <Routes >
          <Route path="/booking" element={<MyBooking  send={send} />} />
          <Route path="/account" element={<MyAccount />} />
          <Route path="/schedule" element={<MyWishList />} />
        </Routes>
      </div>
    </div>
    </>
  );
};

export default UserService;

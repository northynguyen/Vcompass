import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './UserService.css';
import MyBooking from '../../components/UserService/MyBooking/MyBooking';
import MyAccount from '../../components/UserService/MyAccount/MyAccount';
import MySchedule from '../../components/UserService/MySchedule/MySchedule';
import Sidebar from '../../components/UserService/Slidebar/Slidebar';

const UserService = () => {
  const location = useLocation();
  const initialTab = location.state?.tab || 'booking'; // Lấy tab từ state hoặc mặc định là 'booking'
  const [activeTab, setActiveTab] = useState(initialTab); // Đặt giá trị tab ban đầu dựa trên state được gửi

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab); // Cập nhật tab nếu có thay đổi
    }
  }, [location.state?.tab]);

  const renderTab = () => {
    switch (activeTab) {
      case 'booking':
        return <MyBooking />;
      case 'account':
        return <MyAccount />;
      case 'schedule':
        return <MySchedule />;
      default:
        return <MyBooking />;
    }
  };

  return (
    <div className="user-service-container">
       <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="content">
        {renderTab()}
      </div>
    </div>
  );
};

export default UserService;

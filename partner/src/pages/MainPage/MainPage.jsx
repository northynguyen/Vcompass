
import { useState } from 'react';
import MenuBar from '../../components/MenuBar/MenuBar';
import Dashboard from '../../components/DashBoard/DashBoard';
import Reservation from '../../components/Reservation/Reservation';
import Rooms from '../../components/Rooms/Rooms';
import Message from '../../components/Message/Message';
import Calendar from '../../components/Calendar/Calendar';
import './MainPage.css';

const MainPage = () => {
  const [currentTab, setCurrentTab] = useState('Dashboard');

  const renderContent = () => {
    switch (currentTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Reservation':
        return <Reservation />;
      case 'Rooms':
        return <Rooms />;
      case 'Messages':
        return <Message />;
      case 'Calendar':
        return <Calendar />
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="main-page">
      <MenuBar onTabChange={setCurrentTab} />
      <div className="content">
        {renderContent()}
      </div>
    </div>
  );
};

export default MainPage;

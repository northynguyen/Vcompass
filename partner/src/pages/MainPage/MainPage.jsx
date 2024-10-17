
import { useState } from 'react';
import MenuBar from '../../components/MenuBar/MenuBar';
import Dashboard from '../../components/DashBoard/DashBoard';
import Reservation from '../../components/Reservation/Reservation';
import Message from '../../components/Message/Message';
import Hotels from '../../components/Hotels/Hotels';
import Restaurent from '../../components/Restaurants/Restaurants';
import './MainPage.css';
import Header from '../../components/Header/Header';

const MainPage = () => {
  const [currentTab, setCurrentTab] = useState('Dashboard');

  const renderContent = () => {
    switch (currentTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Reservation':
        return <Reservation />;
      case 'Hotels':
        return <Hotels />;
      case 'Messages':
        return <Message />;
      case 'Concierge':
        return <Restaurent />
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Header></Header>
      <div className="main-page">
      <MenuBar onTabChange={setCurrentTab} />
      <div className="content">
        {renderContent()}
      </div>
    </div>
    </>
    
  );
};

export default MainPage;

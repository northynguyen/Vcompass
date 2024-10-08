
import { useState } from 'react';
import './MainPage.css';
import Message from '../Message/Message';
import Dashboard from '../Dashboard/Dashboard';
import Notification from '../Notification/Notification';
import Services from '../Services/Services';
import Tours from '../Tours/Tours';
import Users from '../Users/Users';
import Sidebar from '../../components/Sidebar/Sidebar';

const MainPage = () => {
  const [currentTab, setCurrentTab] = useState('Dashboard');

  const renderContent = () => {
    switch (currentTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Notification':
        return <Notification />;
      case 'Services':
        return <Services />;
      case 'Tours':
        return <Tours />;
      case 'Users':
        return <Users />
      case 'Message':
        return <Message />
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="main-page">
      <Sidebar onTabChange={setCurrentTab} />
      <div className="content">
        {renderContent()}
      </div>
    </div>
  );
};

export default MainPage;

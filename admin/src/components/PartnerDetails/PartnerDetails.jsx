import React, { useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import './PartnerDetails.css';
import { StoreContext } from '../../Context/StoreContext';
import Notification from '../../pages/Notification/Notification';
import AccomodationCards from '../AccomodationCards/AccomodationCards';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import FoodServiceCards from '../FoodServiceCards/FoodServiceCard';

const PartnerDetails = () => {
    const location = useLocation();
    const partner = location.state?.profile;
    const admin = useContext(StoreContext).admin;
    const [status, setStatus] = useState(partner.status);
    const [showForm, setShowForm] = useState(false);
    const [notificationData, setNotificationData] = useState(null);
    const [accommodationData, setAccommodationData] = useState(null);
    const [foodserviceData, setFoodserviceData] = useState(null); // Thêm state cho foodservice

    const handleTabChange = () => {
        setShowForm(false);
    };
    const handleStatusChange = (event) => {
        const newStatus = event.target.value;
        setStatus(newStatus);
        setNotificationData({ type: "partner", _id: partner._id, name: partner.name, status: newStatus });
        setShowForm(true);
    };

    const handleAccommodationNotification = (data) => {
        const enrichedData = {
            ...data,
            partnerId: partner._id, // ID của đối tác (người nhận)
            partnerName: partner.name, // Tên đối tác
        };
        setAccommodationData(enrichedData);
        setShowForm(true);
    };

    const handleFoodserviceNotification = (data) => {
        const enrichedData = {
            ...data,
            partnerId: partner._id, // ID của đối tác (người nhận)
            partnerName: partner.name, // Tên đối tác
        };
        setFoodserviceData(enrichedData);
        setShowForm(true);
    };

    return (
        <div className="partner-details">
            <div className='partner-info-container'>
                <h1>{partner.name}</h1>
                <Tabs onSelect={handleTabChange}>
                    {/* Tabs Header */}
                    <TabList>
                        <Tab>Partner Info</Tab>
                        <Tab>Accommodations</Tab>
                        <Tab>Food Services</Tab>
                    </TabList>

                    {/* Tab Panels */}
                    <TabPanel>
                        {/* Partner Info */}
                        <div className="partner-info">
                            <div className="partner-avatar">
                                <img src={partner.avatar} alt={partner.name} />
                            </div>
                            <p><strong>Gender:</strong> {partner.gender}</p>
                            <p><strong>Date of Birth:</strong> {new Date(partner.date_of_birth).toLocaleDateString()}</p>
                            <p><strong>Email:</strong> {partner.email}</p>
                            <p><strong>Phone:</strong> {partner.phone_number}</p>
                            <p><strong>Address:</strong> {partner.address}</p>
                            <p><strong>Account Created:</strong> {new Date(Date.parse(partner.createdAt)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p>
                                <strong>Status:</strong>
                                <select value={status} onChange={handleStatusChange}>
                                    <option value="active">Active</option>
                                    <option value="blocked">Blocked</option>
                                </select>
                            </p>
                        </div>
                    </TabPanel>
                    <TabPanel>
                        {/* Accommodations */}
                        <AccomodationCards
                            partnerId={partner._id}
                            onStatusChange={handleAccommodationNotification}
                        />
                    </TabPanel>
                    <TabPanel>
                        {/* Food Services */}
                        <FoodServiceCards
                            partnerId={partner._id}
                            onStatusChange={handleFoodserviceNotification}
                        />
                    </TabPanel>
                </Tabs>

                {/* Notification Form */}
                {showForm && (
                    <Notification
                        userData={notificationData}
                        accommodationData={accommodationData}
                        foodserviceData={foodserviceData} // Truyền foodserviceData vào Notification
                    />
                )}
            </div>
        </div>
    );
};

export default PartnerDetails;

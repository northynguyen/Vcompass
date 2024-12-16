import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import Modal from 'react-modal';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import AccomodationCards from '../../components/AccomodationCards/AccomodationCards';
import FoodServiceCards from '../../components/FoodServiceCards/FoodServiceCard';
import { StoreContext } from '../../Context/StoreContext';
import Notification from '../../pages/Notification/Notification';
import './Services.css';
const Services = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notificationData, setNotificationData] = useState(null);
    const [accommodationData, setAccommodationData] = useState(null);
    const [foodserviceData, setFoodserviceData] = useState(null);
    const [accommodations, setAccommodations] = useState(null);
    const [foodservices, setFoodservices] = useState(null);
    const { token, url } = useContext(StoreContext);

    const handleTabChange = () => {
        setIsModalOpen(false);
    };

    const handleStatusChange = (event) => {
        const newStatus = event.target.value;
        setStatus(newStatus);
        setNotificationData({ type: "partner", _id: partner._id, name: partner.name, status: newStatus });
        setIsModalOpen(true); // Open modal
    };

    const handleAccommodationNotification = (data) => {
        const enrichedData = {
            ...data,
            partnerId: partner._id,
            partnerName: partner.name,
        };
        setAccommodationData(enrichedData);
        setIsModalOpen(true); // Open modal
    };

    const handleFoodserviceNotification = (data) => {
        const enrichedData = {
            ...data,
            partnerId: partner._id,
            partnerName: partner.name,
        };
        setFoodserviceData(enrichedData);
        setIsModalOpen(true); // Open modal
    };

    const closeModal = (isConfirmed) => {
        if (!isConfirmed) {
            setStatus(partner.status);
        }
        setIsModalOpen(false);
        setNotificationData(null);
        setAccommodationData(null);
        setFoodserviceData(null);
    };
    useEffect(() => {
        const fetchAccommodations = async () => {
            try {
                const response = await axios.get(
                    `${url}/api/accommodations`
                );
                if (response.data.success) {
                    setAccommodations(response.data.accommodations);
                    console.log(response);
                } else {
                    console.error("Error fetching accommodations:");
                }
            } catch (error) {
            }
        };
        const fetchFoodServices = async () => {
            try {
                const response = await axios.get(
                    `${url}/api/foodservices`
                );
                if (response.data.success) {
                    setFoodservices(response.data.foodService);
                    console.log("foodService", response.data);
                } else {
                    console.error("Error fetching accommodations:");
                }
            } catch (error) {
            }
        };
        fetchAccommodations()
        fetchFoodServices()
    }, [token, url]);

    return (
        <div className="partner-details">
            <div className="partner-info-container">
                <h1>Quản lý dịch vụ</h1>
                {accommodations && foodservices &&
                    <Tabs onSelect={handleTabChange}>
                        {/* Tabs Header */}
                        <TabList>
                            <Tab>Chỗ ở chưa duyệt</Tab>
                            <Tab>Dịch vụ ăn uống chưa duyệt</Tab>
                            <Tab>Chỗ ở</Tab>
                            <Tab>Dịch vụ ăn uống</Tab>
                        </TabList>

                        {/* Tab Panels */}
                        <TabPanel>
                            <AccomodationCards
                                accomList={accommodations.filter(accom => accom.status === 'pending')}
                                onStatusChange={handleAccommodationNotification}
                            />
                        </TabPanel>
                        <TabPanel>
                            <FoodServiceCards
                                foodServiceList={foodservices.filter(accom => accom.status === 'pending')}
                                onStatusChange={handleFoodserviceNotification}
                            />
                        </TabPanel>
                        <TabPanel>
                            <AccomodationCards
                                accomList={accommodations.filter(accom => accom.status !== 'pending')}
                                onStatusChange={handleAccommodationNotification}
                            />
                        </TabPanel>
                        <TabPanel>
                            <FoodServiceCards
                                foodServiceList={foodservices.filter(accom => accom.status !== 'pending')}
                                onStatusChange={handleFoodserviceNotification}
                            />
                        </TabPanel>

                    </Tabs>
                }

                {/* Notification Popup */}
                <Modal
                    isOpen={isModalOpen}
                    onRequestClose={() => closeModal(false)}
                    className="notification-modal"
                    overlayClassName="modal-overlay"
                >
                    <button className="close-button" onClick={() => closeModal(false)}>×</button>
                    <Notification
                        userData={notificationData}
                        accommodationData={accommodationData}
                        foodserviceData={foodserviceData}
                        onClose={closeModal}
                    />
                </Modal>
            </div>
        </div>
    );
};

export default Services
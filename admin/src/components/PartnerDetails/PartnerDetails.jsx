import React, { useContext, useState } from "react";
import Modal from "react-modal";
import { useLocation } from "react-router-dom";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { StoreContext } from "../../Context/StoreContext";
import Notification from "../../pages/Notification/Notification";
import AccomodationCards from "../AccomodationCards/AccomodationCards";
import FoodServiceCards from "../FoodServiceCards/FoodServiceCard";
import "./PartnerDetails.css";

// Configure Modal
Modal.setAppElement("#root"); // Ensure modal complies with accessibility

const PartnerDetails = () => {
  const location = useLocation();
  const partner = location.state?.profile;
  const { url } = useContext(StoreContext);
  const [status, setStatus] = useState(partner.status);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationData, setNotificationData] = useState(null);
  const [accommodationData, setAccommodationData] = useState(null);
  const [foodserviceData, setFoodserviceData] = useState(null);

  // Ensure partner data exists
  if (!partner) {
    return <div>Error: Partner data is missing</div>;
  }

  const handleTabChange = () => {
    setIsModalOpen(false);
  };

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setStatus(newStatus);
    setNotificationData({
      type: "partner",
      _id: partner._id,
      name: partner.name,
      status: newStatus,
      email: partner.email,
    });
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

  return (
    <div className="partner-details">
      <div className="partner-info-container">
        <h2 className="main-title">{partner.name}</h2>
        <Tabs onSelect={handleTabChange}>
          {/* Tabs Header */}
          <TabList className="tab-list">
            <Tab className="tab">Thông tin đối tác</Tab>
            <Tab className="tab">Chỗ ở</Tab>
            <Tab className="tab">Dịch vụ ăn uống</Tab>
          </TabList>

          {/* Tab Panels */}
          <TabPanel>
            <div className="partner-info">
              <div className="partner-avatar">
                <img
                  src={
                    partner.avatar && partner.avatar.includes("http")
                      ? partner.avatar
                      : `${url}/images/${partner.avatar}`
                  }
                  alt={partner.name}
                />
              </div>
              <div className="info-container">
                <p>
                  <strong>Giới tính:</strong>{" "}
                  {partner.gender === "male"
                    ? "Nam"
                    : partner.gender === "female"
                      ? "Nữ"
                      : "Khác"}
                </p>
                <p>
                  <strong>Ngày sinh:</strong>{" "}
                  {new Date(partner.date_of_birth).toLocaleDateString("vi-VN")}
                </p>
                <p>
                  <strong>Email:</strong> {partner.email}
                </p>
                <p>
                  <strong>Số điện thoại:</strong> {partner.phone_number}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {partner.address}
                </p>
                <p>
                  <strong>Ngày tạo tài khoản:</strong>{" "}
                  {new Date(Date.parse(partner.createdAt)).toLocaleDateString(
                    "vi-VN",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
                <p>
                  <strong>Trạng thái:</strong>
                  <select value={status} onChange={handleStatusChange}>
                    <option value="active">Hoạt động</option>
                    <option value="blocked">Khóa tài khoản</option>
                  </select>
                </p>
              </div>
            </div>
          </TabPanel>
          <TabPanel>
            <AccomodationCards
              partnerId={partner._id}
              onStatusChange={handleAccommodationNotification}
            />
          </TabPanel>
          <TabPanel>
            <FoodServiceCards
              partnerId={partner._id}
              onStatusChange={handleFoodserviceNotification}
            />
          </TabPanel>
        </Tabs>

        {/* Notification Popup */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => closeModal(false)}
          className="notification-modal"
          overlayClassName="modal-overlay"
        >
          <button className="close-button" onClick={() => closeModal(false)}>
            ×
          </button>
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

export default PartnerDetails;

import React, { useState } from "react";
import Modal from "react-modal";
import { v4 as uuidv4 } from 'uuid';
import ListAccommodation, { AccomItem } from "../../ListAccommodation/ListAccommodation";
import ListAttractions, { AttractionItem } from "../../ListAttractions/ListAttractions";
import ListFoodServices, { FoodServiceItem } from "../../ListFoodServices/ListFoodServices";
import "./AddActivity.css";
// Thiết lập root element cho modal
Modal.setAppElement("#root");


const Header = ({ option, setOption, setCurrentActivity }) => {

  const onChange = (value) => {
    setOption(value)
    setCurrentActivity({
      visible: false,
    })
  }

  return (
    <div className="header-accom">
      <div className="header-left">
        <h1 className="num-title">What do you want to do?</h1>
        <span className="num-text">Choose your activity</span>
      </div>
      <div className="header-right">
        <label htmlFor="sort-by">Select your activity</label>
        <select
          id="sort-by"
          value={option}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="Accommodations">Accommodations</option>
          <option value="FoodServices">FoodServices</option>
          <option value="Attractions">Attractions</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
  );
};

const AddActivity = ({ isOpen, closeModal, currentDay, idActivity, setInforSchedule }) => {
  const [option, setOption] = React.useState("Accommodations");
  const [currentActivity, setCurrentActivity] = useState({
    visible: false,
  })
  const [cost, setCost] = React.useState("")
  const [description, setDescription] = React.useState("")
  const handleSave = () => {
    console.log("currentAcc: ", currentActivity)
    const newActivity = {
      idActivity: idActivity || uuidv4(),
      activityType: currentActivity.activityType,
      idDestination: currentActivity.idDestination || "default-id",
      cost: parseInt(cost) || 0,
      description: description,
      timeStart: currentActivity.timeStart || "00:00",
      timeEnd: currentActivity.timeEnd || "00:10",
    };
    console.log(newActivity)
    setInforSchedule((prevSchedule) => {
      const updatedActivities = prevSchedule.activities.map((day) => {
        if (day.day === currentDay) {
          const existingActivityIndex = day.activity.findIndex((act) => act.idActivity === idActivity);
          if (idActivity !== "" && existingActivityIndex !== -1) {
            day.activity[existingActivityIndex] = { ...day.activity[existingActivityIndex], ...newActivity };
            console.log("add")
          } else {
            day.activity.push(newActivity);
            console.log("edit")
          }
        }
        return day;
      });
      return { ...prevSchedule, activities: updatedActivities };
    });
    closeModal();
  };
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      className="add-activity-modal"
      overlayClassName="modal-overlay"
    >
      <div className="add-activity">
        <div className="modal-header">
          <h2>Thêm mới hoạt động</h2>
          <button onClick={closeModal} className="close-btn">
            <i className="fa-regular fa-circle-xmark"></i>
          </button>
        </div>
        <div className="modal-body">
          <Header setOption={setOption} setCurrentActivity={setCurrentActivity} />
          {option === "Attractions" && <ListAttractions status="Schedule"
            setCurrentActivity={setCurrentActivity} />}
          {option === "Accommodations" && <ListAccommodation status="Schedule"
            setCurrentActivity={setCurrentActivity} />}
          {option === "FoodServices" && <ListFoodServices status="Schedule"
            setCurrentActivity={setCurrentActivity} />}
          {option === "Other" &&
            <div className="form-group">
              <select className="input-field">
                <option>Vui lòng chọn hoạt động</option>
                <option>Chỗ nghỉ</option>
                <option>Vui chơi</option>
                <option>An uong </option>
                <option>Tự chọn </option>
              </select>
            </div>}
          <div className="activity-infor-container">
            {option === "Accommodations" && currentActivity.visible && (
              <AccomItem
                imgSrc={currentActivity.imgSrc}
                name={currentActivity.name}
                description={currentActivity.description}
                totalRate={currentActivity.totalRate}
                location={currentActivity.location}
                facilities={currentActivity.facilities}
                url={currentActivity.url}
              />
            )}
            {option === "FoodServices" && currentActivity.visible && (
              <FoodServiceItem
                imgSrc={currentActivity.imgSrc}
                name={currentActivity.name}
                description={currentActivity.description}
                totalRate={currentActivity.totalRate}
                price={currentActivity.price}
                location={currentActivity.location}
                facilities={currentActivity.facilities}
                url={currentActivity.url}
              />
            )}
            {option === "Attractions" && currentActivity.visible && (
              <AttractionItem
                imgSrc={currentActivity.imgSrc}
                name={currentActivity.name}
                description={currentActivity.description}
                price={currentActivity.price}
                totalRate={currentActivity.totalRate}
              />
            )}
            <FormAddActivity cost={cost} setCost={setCost}
              description={description} setDescription={setDescription} />
          </div>
        </div>
        <div className="modal-footer">
          {
            idActivity &&
            <button className="delete-btn" onClick={handleSave}>Xóa</button>
          }
          <button className="save-btn" onClick={handleSave}>Lưu</button>
        </div>
      </div>
    </Modal >

  )
};

const FormAddActivity = ({ cost, setCost, description, setDescription }) => {
  return (
    <div className="form-group">
      <div className="name-price-container">
        <div className="title-container">
          <label className="expense-sub-title" htmlFor="name-expense">Tên chi phí</label>
          <input className="input-field"
            id="name-expense" required
            name="name"
            placeholder="Nhập chi phí"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
          <label className="expense-sub-title" htmlFor="des">Ghi chú</label>
          <textarea
            placeholder="Nhập ghi chú chi tiết"
            className="input-field" id="des"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div className="img-add-activity-container">
          <img className="add-schedule-img" src="http://localhost:4000/images/1729143987255-669062125.png"></img>
        </div>
      </div>
    </div>
  )
}

export default AddActivity;

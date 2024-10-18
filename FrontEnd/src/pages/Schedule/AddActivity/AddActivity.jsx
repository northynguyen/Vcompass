import React, { useState } from "react";
import Modal from "react-modal";

import ListAttractions from "../../ListAttractions/ListAttractions";
import ListAccommodation from "../../ListAccommodation/ListAccommodation";
import ListFoodServices from "../../ListFoodServices/ListFoodServices";
import "./AddActivity.css";
// Thiết lập root element cho modal
Modal.setAppElement("#root");


const Header = ({ option, setOption }) => {
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
          onChange={(e) => setOption(e.target.value)}
        >
          <option value="Attractions">Attractions</option>
          <option value="Accommodations">Accommodations</option>
          <option value="FoodServices">FoodServices</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
  );
};

const AddActivity = ({ isOpen, closeModal }) => {
  
  const [option, setOption] = React.useState("Attractions");
  const [currentActivity, setCurrentActivity] = useState({
    imgSrc: "https://bazantravel.com/cdn/medias/uploads/83/83317-khu-nghi-duong-lan-rung-700x420.jpg",
    name: "Westminster to Greenwich River Thames",
    description: "Westminster to Greenwich River Thames",
    price: "$35.00",
    totalRate: " ★★★★☆ (2 reviews)"
  })

  const [activity, setActivity] = React.useState(null);
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


            <i className="fa-regular fa-circle-xmark"></i>

          </button>
        </div>

        <div className="modal-body">

          <Header setOption={setOption} />
          {option === "Attractions" && <ListAttractions status="Schedule"
            setCurrentActivity={setCurrentActivity} />}

          <div className="activity-infor-container">
            <TourItem
              imgSrc={currentActivity.imgSrc}
              name={currentActivity.name}
              description={currentActivity.description}
              price={currentActivity.price}
              totalRate={currentActivity.totalRate}

            />
            <div className="form-group">
              <div className="name-price-container">
                <div className="title-container">
                  <label className="expense-sub-title" htmlFor="name-expense">Tên chi phí</label>
                  <input className="input-field"
                    id="name-expense" required
                    name="name"
                    placeholder="Nhập tên chi phí"
                    value={currentActivity.title}
                  // onChange={handleChange}
                  ></input>
                </div>
                <div className="title-container">
                  <label className="expense-sub-title" htmlFor="expense">Số tiền</label>
                  <input className="input-field"
                    type="number"
                    id="expense"
                    name="cost"
                    required
                    placeholder="Nhập số tiền"
                    value={currentActivity.price}
                  // onChange={handleChange}
                  >
                  </input>
                </div>
              </div>
              <label className="expense-sub-title" htmlFor="des">Ghi chú</label>
              <textarea
                placeholder="Nhập ghi chú chi tiết"
                className="input-field" id="des"
                name="description"
                value={currentActivity.description}
              //  onChange={handleChange}
              ></textarea>
            </div>
          {option === "Attractions" && <ListAttractions status="Schedule" setActivity={setActivity} />}
          {option === "Accommodations" && <ListAccommodation status="Schedule" setActivity={setActivity}/>}
          {option === "FoodServices" && <ListFoodServices status="Schedule" setActivity={setActivity}/>}
          
          <div className="form-group">
            <select className="input-field">
              <option>Vui lòng chọn hoạt động</option>
              <option>Chỗ nghỉ</option>
              <option>Vui chơi</option>
              <option>An uong </option>
              <option>Tự chọn </option>
            </select>
          </div>

          <div className="form-group">
            <textarea placeholder="Ghi chú" className="input-field"></textarea>
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button className="save-btn">Lưu</button>
      </div>

    </Modal >
  );
};

export default AddActivity;

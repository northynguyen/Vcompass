import React from "react";
import Modal from "react-modal";

import ListAttractions from "../../ListAttractions/ListAttractions";


import "./AddActivity.css";
// Thiết lập root element cho modal
Modal.setAppElement("#root");


const Header = ({ option, setOption }) => {
  return (
    <div className="header-accom">
      <div className="header-left">
        <h1 className="num-title">Things To Do In London</h1>
        <span className="num-text">49 Activities Found</span>
      </div>
      <div className="header-right">
        <label htmlFor="sort-by">Sort by:</label>
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

          <Header setOption={setOption} />
          {option === "Attractions" && <ListAttractions status="Schedule" />}

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

        <div className="modal-footer">
          <button className="save-btn">Lưu</button>
        </div>
      </div>
    </Modal>
  );
};

export default AddActivity;

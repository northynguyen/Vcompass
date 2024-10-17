import React, { useState } from "react";
import Modal from "react-modal";
import { ListAccom, TourItem } from "../../ListAccommodation/ListAccommodation.jsx";
import "./AddActivity.css";
// Thiết lập root element cho modal
Modal.setAppElement("#root");

const AddActivity = ({ isOpen, closeModal }) => {
  const [currentActivity, setCurrentActivity] = useState({
    imgSrc: "https://bazantravel.com/cdn/medias/uploads/83/83317-khu-nghi-duong-lan-rung-700x420.jpg",
    title: "Westminster to Greenwich River Thames",
    time: "2 hours",
    price: "$35.00",
  })
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
          <ListAccom isSchedule={false} />
          <div className="form-group">
            <select className="input-field">
              <option>Vui lòng chọn hoạt động</option>
              <option>Chỗ nghỉ</option>
              <option>Vui chơi</option>
              <option>An uong </option>
              <option>Tự chọn </option>
            </select>
          </div>

          <div className="activity-infor-container">
            <TourItem
              item={currentActivity}
              isHaveButton={false}
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

import React, { useState } from "react";
import Modal from "react-modal";
import "./AddActivity.css";
import ListAccommodation from "../../ListAccommodation/ListAccommodation";
// Thiết lập root element cho modal
Modal.setAppElement("#root");

const AddActivity = ({ isOpen, closeModal }) => {
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
          <button onClick={closeModal} className="close-btn">X</button>
        </div>

        <div className="modal-body">
            <ListAccommodation />
          <div className="form-group">
            <select className="input-field">
              <option>Vui lòng chọn hoạt động</option>
              <option>Chỗ nghỉ</option>
              <option>Vui chơi</option>
              <option>An uong </option>
              <option>Tự chọn </option>
            </select>
            <input
              type="text"
              placeholder="Nhập nội dung"
              className="input-field"
            />
          </div>

          <div className="form-group time-group">
            <div>
              <label>Từ</label>
              <input type="time" className="input-field" />
            </div>
            <div>
              <label>Đến</label>
              <input type="time" className="input-field" />
            </div>
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Nhập địa chỉ"
              className="input-field"
            />
          </div>

          <div className="form-group">
            <input
              type="number"
              placeholder="Nhập chi phí"
              className="input-field"
            />
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

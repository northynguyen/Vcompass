import React from "react";
import Modal from "react-modal";
import ListAccommodation from "../../ListAccommodation/ListAccommodation";
import "./AddActivity.css";
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
          <button onClick={closeModal} className="close-btn">
          <i className="fa-regular fa-circle-xmark"></i>
          </button>
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

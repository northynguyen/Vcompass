/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import Modal from "react-modal";
import ConfirmDialog from "../../../components/Dialog/ConfirmDialog";
import "./Expense.css";


const AddExpense = ({ isOpen, closeModal, selectedExpense, setAddtionExpense }) => {
  const isEditMode = !!selectedExpense;
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cost: 0,
    description: '',
  });
  useEffect(() => {
    if (selectedExpense) {
      setFormData({
        name: selectedExpense.name,
        cost: selectedExpense.cost,
        description: selectedExpense.description,
      });
    } else {
      // Khi không có selectedExpense, reset formData
      setFormData({
        name: '',
        cost: 0,
        description: '',
      });
    }
  }, [selectedExpense]);
  const handleDeleteClick = () => {
    setIsConfirmDeleteOpen(true);
  };
  const handleConfirmDelete = () => {
    setAddtionExpense((prev) => prev.filter((exp) => exp.id !== selectedExpense.id));
    closeModal();
    setIsConfirmDeleteOpen(false);
  };

  const handleCancelDelete = () => {
    setIsConfirmDeleteOpen(false);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'cost' ? Number(value) : value,
    }));
  };
  const handleSubmit = () => {
    if (isEditMode) {
      setAddtionExpense((prev) =>
        prev.map((exp) => exp.id === selectedExpense.id ? { ...exp, ...formData } : exp)
      );
      console.log("Updating expense: ", formData);
    } else {
      const newExpense = {
        id: Date.now().toString(), // Chuyển thành string để đảm bảo tính duy nhất
        ...formData,
      };
      setAddtionExpense((prev) => [...prev, newExpense]);
      console.log("Adding new expense: ", newExpense);
    }
    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      className="add-expense-modal"
      overlayClassName="modal-overlay"
    >
      <div className="add-activity">
        <div className="modal-header">
          <h4>Thêm chi phí phát sinh</h4>
          <button onClick={closeModal} className="close-btn">
            <i className="fa-regular fa-circle-xmark"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="expense-sub-title" htmlFor="name-expense">Tên chi phí</label>
            <input className="input-field"
              id="name-expense" required
              name="name"
              placeholder="Nhập tên chi phí"
              value={formData.name}
              onChange={handleChange}
            ></input>
            <label className="expense-sub-title" htmlFor="expense">Số tiền</label>
            <input className="input-field"
              type="number"
              id="expense"
              name="cost"
              required
              placeholder="Nhập số tiền"
              value={formData.cost}
              onChange={handleChange}></input>
            <label className="expense-sub-title" htmlFor="des">Ghi chú</label>
            <textarea
              placeholder="Nhập ghi chú chi tiết"
              className="input-field" id="des"
              name="description"
              value={formData.description}
              onChange={handleChange}></textarea>
          </div>
        </div>
        <div className="modal-footer">
          {isEditMode && (
            <button className="delete-btn" onClick={handleDeleteClick}>
              Xóa
            </button>
          )}
          <button className="save-btn"
            onClick={handleSubmit}>Lưu</button>
        </div>
        <ConfirmDialog
          isOpen={isConfirmDeleteOpen}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          message="Bạn có chắc chắn muốn xóa mục này không?"
        />
      </div>
    </Modal>
  );
};

const Expense = ({ expenses, additionExpenses, setAddtionExpense }) => {
  const totalCost = [...expenses, ...additionExpenses].reduce((acc, expense) => acc + expense.cost, 0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const openModalForAdd = () => {
    setSelectedExpense(null); // Khi thêm mới, không có expense nào được chọn
    setIsModalOpen(true); // Mở popup
  };

  const openModalForEdit = (expense) => {
    setSelectedExpense(expense); // Lưu expense cần chỉnh sửa
    setIsModalOpen(true); // Mở popup
  };

  const closeModal = () => {
    setIsModalOpen(false); // Đóng popup
    setSelectedExpense(null); // Reset lại trạng thái
  };

  return (
    <div className="expense-container">
      <h1>Chi phí</h1>
      {expenses.map((expense) => (
        <div className="expense-item" key={expense.id}>
          <div className="expense-icon">
            <img src={expense.icon} alt={expense.name} />
          </div>
          <div className="expense-details">
            <h3>{expense.name}</h3>
            <p>{expense.location}</p>
          </div>
          <div className="expense-cost">
            <p>{expense.cost.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</p>
          </div>
          <div className="expense-actions">
            <button className="edit-btn">
              <FaEdit />
            </button>
          </div>
        </div>
      ))}
      {additionExpenses.map((additionExpen) => (
        <div className="expense-item" key={additionExpen.id}>
          <div className="expense-icon">
            <img src="https://png.pngtree.com/png-clipart/20230504/original/pngtree-money-flat-icon-png-image_9138340.png"
              alt={additionExpen.name} />
          </div>
          <div className="expense-details">
            <h3>{additionExpen.name}</h3>
            <p>{additionExpen.description}</p>
          </div>
          <div className="expense-cost">
            <p>{additionExpen.cost.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</p>
          </div>
          <div className="expense-actions">
            <button className="edit-btn"
              onClick={() => openModalForEdit(additionExpen)}>
              <FaEdit />
            </button>
          </div>
        </div>
      ))}

      <div className="add-new">
        <button onClick={openModalForAdd} className="add-expense">
          <i className="fa-solid fa-plus add-icon"></i>
          Add New
        </button>
      </div>
      <h1>Ngân sách</h1>
      <div className="expense-summary">
        <div className="total-cost">
          <h3>Tổng chi phí thực tế</h3>
          <h1>{totalCost.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</h1>
        </div>
      </div>
      <AddExpense
        isOpen={isModalOpen}
        closeModal={closeModal}
        selectedExpense={selectedExpense}
        setAddtionExpense={setAddtionExpense} />
    </div>
  );
};

export default Expense;

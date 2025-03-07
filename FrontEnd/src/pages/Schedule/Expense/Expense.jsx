/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { FaEdit, FaAngleDown, FaAngleUp } from "react-icons/fa"; // Import icon xổ xuống và thu gọn
import Modal from "react-modal";
import ConfirmDialog from "../../../components/Dialog/ConfirmDialog";
import "./Expense.css";
import { v4 as uuidv4 } from 'uuid';


const AddExpense = ({ isOpen, closeModal, selectedExpense, setInforSchedule, socket, inforSchedule }) => {
  const isEditMode = !!selectedExpense;
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cost: 0,
    description: '',
  });
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        cost: 0,
        description: '',
      });
    }
  }, [isOpen]);

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
    setInforSchedule(prev => {
      const updatedExpenses = prev.additionalExpenses.filter(
        exp => exp._id !== selectedExpense._id
      );

      // Emit sự kiện để update real-time khi xóa
      if (socket?.current) {
        socket.current.emit('updateExpenses', {
          scheduleId: inforSchedule._id,
          expenses: updatedExpenses
        });
      }

      return {
        ...prev,
        additionalExpenses: updatedExpenses
      };
    });

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
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Tạo expense mới với id
    const newExpense = {
      ...formData,
      _id: selectedExpense?._id || uuidv4() // Sử dụng id cũ nếu đang edit, tạo mới nếu đang thêm
    };

    setInforSchedule(prev => {
      const updatedExpenses = selectedExpense 
        ? prev.additionalExpenses.map(exp => exp._id === selectedExpense._id ? newExpense : exp)
        : [...prev.additionalExpenses, newExpense];

      const newSchedule = {
        ...prev,
        additionalExpenses: updatedExpenses
      };

      // Emit sự kiện để update real-time
      if (socket?.current) {
        socket.current.emit('updateExpenses', {
          scheduleId: inforSchedule._id,
          expenses: updatedExpenses
        });
      }

      return newSchedule;
    });

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



const Expense = ({ expenses, additionExpenses, setInforSchedule, mode, socket, inforSchedule }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const openModalForAdd = () => {
    setSelectedExpense(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (expense) => {
    setSelectedExpense(expense); // Lưu expense cần chỉnh sửa
    setIsModalOpen(true); // Mở popup
  };

  const closeModal = () => {
    setIsModalOpen(false); // Đóng popup
    setSelectedExpense(null); // Reset lại trạng thái
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded); // Đảo ngược trạng thái mở/đóng chi phí
  };

  const handleExpenseChange = (updatedExpenses) => {
    setInforSchedule(prev => {
      const newSchedule = {
        ...prev,
        additionalExpenses: updatedExpenses
      };

      // Emit sự kiện để update real-time
      if (socket?.current) {
        socket.current.emit('updateExpenses', {
          scheduleId: inforSchedule._id,
          expenses: updatedExpenses
        });
      }

      return newSchedule;
    });
  };

  // Thêm useEffect để lắng nghe sự kiện cập nhật từ server
  useEffect(() => {
    if (socket?.current) {
      socket.current.on('expensesUpdated', (updatedExpenses) => {
        setInforSchedule(prev => ({
          ...prev,
          additionalExpenses: updatedExpenses
        }));
      });
    }
  }, [socket]);

  const calculateTotalCost = () => {
    const activityCosts = expenses.reduce((acc, exp) => acc + (exp.cost || 0), 0);
    const additionalCosts = additionExpenses.reduce((acc, exp) => acc + (exp.cost || 0), 0);
    return activityCosts + additionalCosts;
  };

  const totalCost = calculateTotalCost();

  return (
    <div className="expense-container">
      <h1>
        Chi phí
        <button className="expand-toggle" onClick={toggleExpand} aria-label="Toggle expenses">
          {isExpanded ? <FaAngleUp /> : <FaAngleDown />} {/* Chỉ hiển thị icon xổ xuống/thu gọn */}
        </button>
      </h1>

      {/* Hiển thị chi phí khi mở rộng */}
      {isExpanded && (
        <>
          {expenses.map((expense) => (
            <div className="expense-item" key={expense.id}>
              <div className="expense-icon">
                <img src="https://png.pngtree.com/png-clipart/20230504/original/pngtree-money-flat-icon-png-image_9138340.png" alt={expense.name} />
              </div>
              <div className="expense-details">
                <h3>{expense.costDescription}</h3>
              </div>
              <div className="expense-cost">
                <p>{expense.cost.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</p>
              </div>
              {mode === "edit" && (
                <div className="expense-actions">
                  <button className="edit-btn">
                    <FaEdit />
                  </button>
                </div>
              )}
            </div>
          ))}

          {additionExpenses.map((additionExpen) => (
            <div className="expense-item" key={additionExpen._id}>
              <div className="expense-icon">
                <img src="https://png.pngtree.com/png-clipart/20230504/original/pngtree-money-flat-icon-png-image_9138340.png" alt={additionExpen.name} />
              </div>
              <div className="expense-details">
                <h3>{additionExpen.name}</h3>
                <p>{additionExpen.description}</p>
              </div>
              <div className="expense-cost">
                <p>{additionExpen.cost.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</p>
              </div>
              {mode === "edit" && (
                <div className="expense-actions">
                  <button className="edit-btn" onClick={() => openModalForEdit(additionExpen)}>
                    <FaEdit />
                  </button>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Nút thêm chi phí phát sinh */}
      {mode === "edit" && (
        <div className="add-new">
          <button onClick={openModalForAdd} className="add-expense">
            <i className="fa-solid fa-plus add-icon"></i>
            Thêm chi phí phát sinh
          </button>
        </div>
      )}

      <h1>Ngân sách</h1>
      <div className="expense-summary">
        <div className="total-cost">
          <h3>Tổng chi phí thực tế</h3>
          <h1>{totalCost.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</h1>
        </div>
        {mode === "edit" && (
          <button className="add-expense-btn" onClick={openModalForAdd}>
            Thêm chi phí
          </button>
        )}
      </div>

      <AddExpense 
        isOpen={isModalOpen}
        closeModal={closeModal}
        selectedExpense={selectedExpense}
        setInforSchedule={setInforSchedule}
        socket={socket}
        inforSchedule={inforSchedule}
      />
    </div>
  );
};

export default Expense;

/* eslint-disable react/prop-types */
import React from "react";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import "./Expense.css";
const Expense = ({ expenses }) => {
  const totalCost = expenses.reduce((acc, expense) => acc + expense.cost, 0);

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
        <h1>Ngân sách</h1>
      <div className="expense-summary">
        <div className="total-cost">
          <h3>Tổng chi phí thực tế</h3>
          <h1>{totalCost.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</h1>
        </div>
      </div>
    </div>
  );
};

export default Expense;

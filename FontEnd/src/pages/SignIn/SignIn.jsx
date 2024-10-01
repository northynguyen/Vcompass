/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import './SignIn.css'; // Bạn có thể tạo file CSS riêng cho SignIn

const SignIn = ({ onClose }) => {
    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Sign In</h2>
                <form>
                    <div>
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" required />
                    </div>
                    <div>
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" required />
                    </div>
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default SignIn;

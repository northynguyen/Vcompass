import React, { useState } from 'react';
import './SignIn.css'; // Đảm bảo rằng bạn có CSS cho form

const SignIn = () => {
    const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái điều khiển modal

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleOverlayClick = (e) => {
        // Đảm bảo chỉ đóng modal khi người dùng nhấp vào overlay, không phải nội dung modal
        if (e.target.className === 'overlay') {
            closeModal();
        }
    };

    return (
        <>
            <button onClick={openModal}>Sign in</button>
            {isModalOpen && (
                <>
                    <div className="overlay" onClick={handleOverlayClick}></div>
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
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
                </>
            )}
        </>
    );
};

export default SignIn;

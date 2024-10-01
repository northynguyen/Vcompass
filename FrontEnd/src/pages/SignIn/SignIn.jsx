import React, { useState } from 'react';
import './SignIn.css'; // Đảm bảo rằng bạn có CSS cho form

const SignIn = () => {
    const [isFormOpen, setIsFormOpen] = useState(false); // Trạng thái điều khiển Form

    const openForm = () => {
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
    };

    const handleOverlayClick = (e) => {
        // Đảm bảo chỉ đóng Form khi người dùng nhấp vào overlay, không phải nội dung Form
        if (e.target.className === 'overlay') {
            closeForm();
        }
    };

    return (
        <>
            <button onClick={openForm}>Sign in</button>
            {isFormOpen && (
                <>
                    <div className="overlay" onClick={handleOverlayClick}></div>
                    <div className="form-content">
                        <span className="close" onClick={closeForm}>&times;</span>
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

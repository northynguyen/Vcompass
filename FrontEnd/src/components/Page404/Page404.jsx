import React from 'react';
import './Page404.css';

const NotFound = () => {
    return (
        <div className="not-found-container">
            <div className="error-code">404</div>
            <h1 className="error-message">Oops! Page Not Found</h1>
            <p className="description">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <a href="/" className="home-button">Go Back to Home</a>
            <div className="animation">
                <img 
                    src="https://cdn-icons-png.flaticon.com/512/753/753345.png" 
                    alt="Lost icon" 
                />
            </div>
        </div>
    );
};

export default NotFound;

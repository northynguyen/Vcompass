import "./Header.css";
import SignIn from "../../pages/SignIn/SignIn";
import { Link } from "react-router-dom";
import profile_icon from "../../assets/profile_icon.png";
import logout_icon from "../../assets/logout_icon.png";
import { useState } from "react";
const Header = () => {
  const [token, setToken] = useState(false);

  // SignIn
  const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái điều khiển modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleOverlayClick = (e) => {
    // Kiểm tra nếu click vào overlay, nếu có thì đóng modal
    if (e.target.className === 'overlay') {
      closeModal();
    }
  };
  //End Signin

  return (
    <div className="header">
      <div className="logo">
        <h1>VCompass</h1>
      </div>

      <div className="header-right">
        <ul className="header-menu">
          <a href="" className="">
            Home
          </a>
          <a href="">About Us</a>
          <a href="">Booking</a>
          <a href="">Partnership</a>
          <a href="">Help</a>
        </ul>

        {/* Chờ chèn token vào  */}
        {!token ? (
          <>
            <button onClick={openModal} >Sign in</button>
            {isModalOpen && <SignIn onClose={closeModal} />}
            {isModalOpen && <div className="overlay" onClick={handleOverlayClick}></div>}
          </>
        ) : (
          <div className="header-profile">
            <img src={profile_icon} alt="" />
            <ul className="nav-profile-dropdown">
              <li>
                <img src={logout_icon} alt="" />
                <p>Orders</p>
              </li>
              <hr />
              <li>
                <img src={logout_icon} alt="" />
                <p>Logout</p>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;

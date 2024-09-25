import "./Header.css";
import { Link } from "react-router-dom";
import profile_icon from "../../assets/profile_icon.png";
import logout_icon from "../../assets/logout_icon.png";
import { useState } from "react";
const Header = () => {
  const [token, setToken] = useState(false);
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
          <button>Sign in</button>
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

import React from "react";
import "./ProfileCards.css";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../Context/StoreContext";

const ProfileCards = ({ profile, type }) => {
  const navigate = useNavigate();
  const { url } = React.useContext(StoreContext);
  const handleNavigate = () => {
    // Navigate to the appropriate profile details page based on the type
    const baseUrl = type === "user" ? `/users/${profile._id}` : type === "partner" ? `/partners/${profile.id}` : "";
    navigate(baseUrl, { state: { profile } }); // Giữ nguyên để truyền profile
  };

  return (
    <div className="profile-card">
      <div className="profile-avatar" onClick={handleNavigate}>
        <img
          src={
            profile.avatar && profile.avatar.includes("http")
              ? profile.avatar
              : `${url}/images/${profile.avatar}`
          }
          alt={profile.name}
        />
      </div>
      <div className="profile-info">
        <h2 onClick={handleNavigate}>{profile.name}</h2>
        <div className="info-container">
          <p>
            <strong>Giới tính:</strong>{" "}
            {profile.gender === "male"
              ? "Nam"
              : profile.gender === "female"
                ? "Nữ"
                : "Khác"}
          </p>
          <p>
            <strong>Ngày sinh:</strong>{" "}
            {new Date(profile.date_of_birth).toLocaleDateString("vi-VN")}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Số điện thoại:</strong> {profile.phone_number}
          </p>
          <p>
            <strong>Địa chỉ:</strong> {profile.address}
          </p>
          <p>
            <strong>Ngày tạo tài khoản:</strong>
            {new Date(Date.parse(profile.createdAt)).toLocaleDateString(
              "vi-VN",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCards;

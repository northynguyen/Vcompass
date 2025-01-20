import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { StoreContext } from "../../Context/StoreContext";

const AuthRedirect = () => {
  const navigate = useNavigate();
  const { url, setUser, setToken } = useContext(StoreContext);

  useEffect(() => {
    // Hàm bất đồng bộ để xử lý logic bên trong useEffect
    const handleRedirect = async () => {
      // Lấy token từ URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (token) {
        // Lưu token vào localStorage
        localStorage.setItem("token", token);
        setToken(token);

        try {
          // Gửi request để lấy thông tin user
          const response = await axios.post(
            `${url}/api/user/user/getbyid`,
            {},
            { headers: { token } } // Dùng token từ URL
          );

          // Lưu thông tin người dùng
          setUser(response.data.user);
          localStorage.setItem("user", JSON.stringify(response.data.user));

          // Chuyển hướng về Home
          navigate("/");
        } catch (error) {
          console.error("Error loading user data:", error);
          // Nếu xảy ra lỗi, điều hướng về trang login
          navigate("/login");
        }
      } else {
        // Nếu không có token, chuyển hướng về trang login
        navigate("/login");
      }
    };

    handleRedirect();
  }, [navigate, setToken, setUser, url]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div className="loading">
        <p>Đang xử lý, vui lòng chờ...</p>
        <div className="spinner" style={{ marginTop: "10px" }}>
          {/* Spinner */}
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "5px solid #ccc",
              borderTop: "5px solid #000",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
        </div>
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AuthRedirect;

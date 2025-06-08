import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { StoreContext } from "../../Context/StoreContext";

const AuthRedirect = () => {
  const navigate = useNavigate();
  const { url, setUser, setToken } = useContext(StoreContext);

  useEffect(() => {
    const handleRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (token) {
        localStorage.setItem("token", token);
        setToken(token);

        try {
          const response = await axios.post(
            `${url}/api/user/user/getbyid`,
            {},
            { headers: { token } } 
          );

          setUser(response.data.user);
          localStorage.setItem("user", JSON.stringify(response.data.user));

          navigate("/");
        } catch (error) {
          console.error("Error loading user data:", error);
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    };

    handleRedirect();
  }, [navigate, setToken, setUser, url]);

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh",
      backgroundColor: "#f8f9fa",
      fontFamily: "Arial, sans-serif"
    }}>
      <div className="auth-redirect-container">
        <p style={{ 
          fontSize: "18px", 
          color: "#495057", 
          marginBottom: "20px",
          textAlign: "center"
        }}>
          Đang xử lý, vui lòng chờ...
        </p>
        <div className="loading-spinner-wrapper" style={{ 
          display: "flex", 
          justifyContent: "center" 
        }}>
          <div
            className="rotating-spinner"
            style={{
              width: "60px",
              height: "60px",
              border: "4px solid #e9ecef",
              borderTop: "4px solid #007bff",
              borderRadius: "50%",
              animation: "spinRotation 1s linear infinite",
            }}
          ></div>
        </div>
      </div>
      <style>
        {`
          .auth-redirect-container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
            min-width: 300px;
          }
          
          @keyframes spinRotation {
            0% { 
              transform: rotate(0deg); 
            }
            100% { 
              transform: rotate(360deg); 
            }
          }
          
          .loading-spinner-wrapper {
            margin-top: 10px;
          }
          
          .rotating-spinner {
            transition: all 0.3s ease;
          }
          
          .rotating-spinner:hover {
            transform: scale(1.1);
          }
        `}
      </style>
    </div>
  );
};

export default AuthRedirect;

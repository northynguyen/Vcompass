import { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const StoreContext = createContext(null)
const StoreContextProvider = (props) => {
  const [token, setToken] = useState("")
  const [admin, setAdmin] = useState({})
  const url = "https://vcompass-backend.onrender.com"


  const fetchAdmin = async (authtoken) => {
    if (authtoken) {
      try {
        const response = await axios.post(`${url}/api/user/admin/getbyid`, {}, { headers: { token: authtoken } });
        setAdmin(response.data.user);
      } catch (error) {
        console.error("Error loading admin data:", error);
      }
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        await fetchAdmin(storedToken);// Tải dữ liệu giỏ hàng      
      }
    };

    fetchData();
  }, []);

  console.log("admin", admin)

  const contextValue = {
    token,
    setToken,
    url,
    admin,
    setAdmin
  }
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  )
}

export default StoreContextProvider

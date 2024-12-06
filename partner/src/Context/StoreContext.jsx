import { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const StoreContext = createContext(null)
const StoreContextProvider = (props) => {
  const [token, setToken] = useState("")
  const [user, setUser] = useState({})
  const url = "http://localhost:4000"

  const fetchpartner = async (authtoken) => {
    if (authtoken) {
      try {
        const response = await axios.post(`${url}/api/user/partner/getbyid`, {}, { headers: { token: authtoken } });
        setUser(response.data.user);
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
        await fetchpartner(storedToken);// Tải dữ liệu giỏ hàng      
      }
    };
    fetchData();
  }, [])

  const contextValue = {
    token,
    setToken,
    url,
    user,
    setUser
  }
  console.log("user", user)
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  )
}

export default StoreContextProvider
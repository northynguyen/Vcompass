import { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const StoreContext = createContext(null)
const StoreContextProvider = (props) => {
  const [token, setToken] = useState("")
  const [user, setUser] = useState(null)
  const url = "https://vcompass-backend.onrender.com"
  // const url = "http://localhost:4000"

  const fetchpartner = async (authtoken) => {
    if (authtoken) {
      try {
        const response = await axios.post(`${url}/api/user/partner/getbyid`, {}, { headers: { token: authtoken } });
        if (response.data && response.data.user && response.data.user._id) {
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error("Error loading admin data:", error);
        setUser(null);
        localStorage.removeItem('user');
      }
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        await fetchpartner(storedToken);  
      } else {
        setUser(null);
        localStorage.removeItem('user');
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

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  )
}

export default StoreContextProvider

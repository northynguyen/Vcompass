/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {
  const url = "https://vcompass-backend.onrender.com"
  // const url = "http://localhost:4000"
  const [token, setToken] = useState("")
  const [user, setUser] = useState({})

  const [accommodations, setAccommodations] = useState({})

  useEffect(() => {
    const token = localStorage.getItem("token");
    setToken(token);
    setUser(JSON.parse(localStorage.getItem("user")));
    fetchAccommodation()
    fetchUser(token);
  }, [])

  const fetchAccommodation = async () => {
    try {
      const response = await axios.get(`${url}/api/accommodations/`);
      setAccommodations(response.data.accommodations);
    } catch (error) {
      console.error('Error fetching accommodation:', error);
    }
  };
  const fetchUser = async (authtoken) => {
    if (authtoken) {
      try {
        const response = await axios.post(`${url}/api/user/user/getbyid`, {}, { headers: { token: authtoken } });
        setUser(response.data.user);
      } catch (error) {
        console.error("Error loading admin data:", error);
      }
    }
  };
  const contextValue = {
    url,
    token,
    setToken,
    user,
    setUser,
    accommodations
  }

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  )
}

export default StoreContextProvider


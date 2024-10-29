/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {
  const url = "http://localhost:4000"
  const [token, setToken] = useState("")
  const [user, setUser] = useState({})

  const [accommodations, setAccommodations] = useState({})

  useEffect(() => {
    const token = localStorage.getItem("token");
    setToken(token);
    fetchAccommodation()
  }, [])

  const fetchAccommodation = async () => {
    try {
      const response = await axios.get(`${url}/api/accommodations/`);
      setAccommodations(response.data.accommodations);
    } catch (error) {
      console.error('Error fetching accommodation:', error);
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


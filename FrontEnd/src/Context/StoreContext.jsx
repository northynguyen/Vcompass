/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const url = "http://localhost:4000"; // Base URL for your API
  const [token, setToken] = useState("");
  const [user, setUser] = useState({});
  const [attractions, setAttractions] = useState([]); // State to store attractions
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [error, setError] = useState(null); // State to handle errors

  useEffect(() => {
    const token = localStorage.getItem("token");
    setToken(token);
  }, []);

  // Fetch attractions from the backend



  const contextValue = {
    url,
    token,
    setToken,
    user,
    setUser,
    attractions,
    loading,
    error,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;

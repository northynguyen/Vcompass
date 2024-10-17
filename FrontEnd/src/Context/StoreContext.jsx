/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { createContext, useEffect , useState} from "react";
import axios from "axios";

export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {
    const url = "http://localhost:4000"
    const [token, setToken] = useState("")
    const [user, setUser] = useState({})

    useEffect(() => {
      const token = localStorage.getItem("token");
      setToken(token)

    
    }, [])

    const contextValue = {
      url,
      token,
      setToken ,
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
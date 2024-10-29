import { createContext, useState, useEffect } from 'react'


export const StoreContext = createContext(null)
const StoreContextProvider = (props) => {
  const [token, setToken] = useState("")
  const [user, setUser] = useState({})
  const [admin, setAdmin] = useState({})
  const url = "http://localhost:4000"
  useEffect(() => {
    const token = localStorage.getItem("token")
    setToken(token)
    const user = JSON.parse(localStorage.getItem("user"))
    const admin = JSON.parse(localStorage.getItem("user"))
    setUser(user)
    setAdmin(user)
    console.log(admin)
  }, [])

  const contextValue = {
    token,
    setToken,
    url,
    user,
    setUser,
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
import { createContext , useState, useEffect} from 'react'


export const StoreContext = createContext(null)
const StoreContextProvider = (props) => {
    const [token, setToken] = useState("")
    const [user, setUser] = useState({})
    const url = "http://localhost:4000"
    useEffect(() => { 
      const token = localStorage.getItem("token")
      setToken(token)
      const user = JSON.parse(localStorage.getItem("user"))
      setUser(user)

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

export default  StoreContextProvider
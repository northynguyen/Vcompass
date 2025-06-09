import axios from 'axios'
import { createContext, useEffect, useState } from 'react'

export const StoreContext = createContext(null)
const StoreContextProvider = (props) => {
  const [token, setToken] = useState("")
  const [admin, setAdmin] = useState({})
  const url = "https://vcompass-backend.onrender.com"
//  const url = "http://localhost:4000"


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
  const getImageUrl = (place, index) => {
    if (!place.images || !place.images.length) {
      return 'https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg';
    }

    const image = index ? place.images[index] : place.images[0];
    if (image.includes('http')) {
      return image;
    }

    return `${url}/images/${image}`;
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
    setAdmin,
    getImageUrl
  }
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  )
}

export default StoreContextProvider

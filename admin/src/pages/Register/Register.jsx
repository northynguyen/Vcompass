import { useState, useContext } from 'react';
import './Register.css';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';


const Register = () => {
  const { url, setToken, setUser } = useContext(StoreContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [repassword, setRepassword] = useState('');

  const onRegister = async (event) => {
    event.preventDefault();
    if (password !== repassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const response = await axios.post(`${url}/api/user/register/admin`, { name, email, password });
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message || 'There was an error');
    }
  }

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={onRegister}>
        <h2>Register</h2>
        <input type="text" placeholder="Name" required onChange={(e) => setName(e.target.value)} />
        <input type="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
        <input type="password" placeholder="Confirm Password" required onChange={(e) => setRepassword(e.target.value)} />
        <button type="submit">Sign Up</button>
        <div className="text-center">
          <p>Already a member? <a href="/login">Login</a></p>
        </div>
      </form>
    </div>
  );
}

export default Register;

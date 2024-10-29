// SignIn.js
import { useState, useContext } from 'react';
import './Login.css';
import { toast } from 'react-toastify';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';

const Login = () => {
    const { url, setToken, setUser } = useContext(StoreContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onLogin = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(`${url}/api/user/login/admin`, { email, password });
            console.log(response.data);
            if (response.data.success) {
                setToken(response.data.token);
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.user));
                setUser(response.data.user);
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message || "There was an error!");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='login-container'>
            <form onSubmit={onLogin} className="login-form ">
                <h2>Login Admin</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Login'}
                </button>
                <p className="text-center">
                    Don't have an account?
                    <a href="/register" className="register-link">
                        Sign Up here
                    </a>
                </p>
            </form>
        </div>
    );
}

export default Login;

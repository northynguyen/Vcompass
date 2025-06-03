// SignIn.js
import axios from 'axios';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import cross from '../../assets/cross_icon.png';
import { StoreContext } from '../../Context/StoreContext';
import './SignIn.css';

const SignIn = ({ setShowLogin }) => {
    const { url, setToken, setUser } = useContext(StoreContext);
    const [curentState, setCurrentState] = useState("Login");
    const [data, setData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordConfirm, setPasswordConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Add loading state

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
    }

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    }

    const toggleConfirmPasswordVisibility = () => {
        setPasswordConfirm(!passwordConfirm);
    }

    const onLogin = async (event) => {
        event.preventDefault();
        setIsLoading(true); // Set loading to true before the API call

        if (curentState === "Sign Up" && data.password !== data.confirmPassword) {
            toast.error("Passwords do not match. Please try again.");
            setIsLoading(false); // Set loading to false if there's an error
            return;
        }

        let newUrl = url;
        if (curentState === "Login") {
            newUrl = `${url}/api/user/login/user`;
        } else if (curentState === "Sign Up") {
            newUrl = `${url}/api/user/register/user`;
        }


        try {
            const response = await axios.post(newUrl, data);
            if (response.data.success) {
                if (curentState === "Login" || curentState === "Sign Up") {
                    setToken(response.data.token);
                    localStorage.setItem("token", response.data.token);
                    setUser(response.data.user);
                    localStorage.setItem("user", JSON.stringify(response.data.user));
                    toast.success(response.data.message);
                }
                setShowLogin(false);

            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("There was an error!", error);
            toast.error(error.response.data.message);
        } finally {
            setIsLoading(false); // Set loading to false after the API call
        }
    }

    const onForgetPassword = async (event) => {
        event.preventDefault();
        try {
            setIsLoading(true);
            const response = await axios.post(`${url}/api/email/password`, { type: "user", email: data.email });
            if (response.data.success) {
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("There was an error!", error);
            toast.error(error.response.data.message);
        }
        finally {
            setIsLoading(false);
        }
    }
    const onGoogleLogin = () => {
        window.open(`${url}/api/user/google`, "_self");
    }

    return (
        <div className='login-popup'>
            <form onSubmit={curentState === "Forgot Password" ? onForgetPassword : onLogin} className="login-popup-container">
                <div className="login-popup-title">
                    <div className='login-popup-close'>
                        <img
                            src={cross}
                            onClick={() => setShowLogin(false)}
                            className="close"
                            alt="close"
                        />
                    </div>
                    <h2> {
                        curentState === "Login"
                            ? "Đăng nhập"
                            : curentState === "Forgot Password"
                                ? "Quên mật khẩu"
                                : "Đăng ký"
                    }</h2>
                </div>
                <div className="login-popup-inputs">
                    {curentState === "Sign Up" && <input name="name" onChange={onChangeHandler} value={data.name} type="text" placeholder="Name" required />}
                    <input name="email" onChange={onChangeHandler} value={data.email} type="email" placeholder="Email" required />
                    {(curentState === "Login" || curentState === "Sign Up") && (
                        <div className="password-container">
                            <input
                                name="password"
                                onChange={onChangeHandler}
                                value={data.password}
                                type={passwordVisible ? "text" : "password"}
                                placeholder="Mật khẩu"
                                required
                            />
                            <a onClick={togglePasswordVisibility}>{passwordVisible ? "Ẩn" : "Hiện"}</a>
                        </div>
                    )}
                    {curentState === "Sign Up" && (
                        <div className="password-container">
                            <input
                                name="confirmPassword"
                                onChange={onChangeHandler}
                                value={data.confirmPassword}
                                type={passwordConfirm ? "text" : "password"}
                                placeholder="Xác nhận mật khẩu"
                                required
                            />
                            <a onClick={toggleConfirmPasswordVisibility}>
                                {passwordConfirm ? "Ẩn" : "Hiện"}
                            </a>
                        </div>
                    )}
                    {curentState === "Login" && (
                        <p style={{ textAlign: "right", color: "#0B69A3 " }}>
                            <span className="link" onClick={() => setCurrentState("Forgot Password")}>
                                &nbsp;Quên mật khẩu?
                            </span>
                        </p>
                    )}
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <span className="spinner-1"></span>
                        ) : (
                            curentState === "Sign Up" ? "Tạo tài khoản" : (curentState === "Forgot Password" ? "Gửi Email" : "Đăng nhập")
                        )}
                    </button>
                </div>

                {curentState === "Sign Up" && (
                    <div className="login-popup-condition">
                        <input type="checkbox" required />
                        <p>Bằng cách tạo tài khoản, bạn đồng ý với <span>Điều khoản dịch vụ của chúng tôi.</span></p>
                    </div>
                )}

                {curentState === "Login" && (
                    <div>
                        <p>
                            Tạo tài khoản mới
                            <span className="link" onClick={() => setCurrentState("Sign Up")}>
                                &nbsp;Nhấn vào đây
                            </span>
                        </p>
                        <div className="divider-container">
                            <hr className="divider" />
                            <span className="divider-text">Hoặc</span>
                            <hr className="divider" />
                        </div>
                        <div className='button-container'>
                            <button type="button" className="continue-google" onClick={onGoogleLogin}>
                                <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="google" />
                                <span>Tiếp tục với Google</span>
                            </button>
                        </div>
                    </div>
                )}

                {curentState === "Sign Up" && (
                    <p>
                        Đã có tài khoản?
                        <span className="link" onClick={() => setCurrentState("Login")}>
                            &nbsp;Đăng nhập ngay
                        </span>
                    </p>
                )}

                {curentState === "Forgot Password" && (
                    <p>
                        Quay lại
                        <span className="link" onClick={() => setCurrentState("Login")}>
                            &nbsp;Đăng nhập
                        </span>
                    </p>
                )}
            </form>
        </div>
    );
}

export default SignIn;

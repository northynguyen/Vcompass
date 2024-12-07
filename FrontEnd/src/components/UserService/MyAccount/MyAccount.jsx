import React, { useState, useContext, useEffect } from 'react';
import './MyAccount.css';
import { StoreContext } from '../../../Context/StoreContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const MyAccount = () => {
    const { url, user, setUser } = useContext(StoreContext);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const togglePasswordVisibility = (field) => {
        setShowPassword((prevState) => ({
            ...prevState,
            [field]: !prevState[field],
        }));
    };

    const handlePasswordUpdate = (e) => {
        e.preventDefault();
        // Kiểm tra nếu mật khẩu mới và xác nhận mật khẩu không trùng khớp
        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xac nhận không trùng khớp.');
            return;
        }
        checkPassword(currentPassword);
    };
    const checkPassword = async (currentPassword) => {
        try {
            // Gửi yêu cầu kiểm tra mật khẩu hiện tại
            const response = await fetch(`${url}/api/user/check-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    password: currentPassword,
                    id: user._id,
                    type: "user",
                }),
            });

            const data = await response.json();

            if (!data.success) {
                toast.error("Mật khẩu hiện tại không chính xác.");

                return;
            }
            else {
                UpdatePassword();
                toast.success("Câp nhật mật khẩu thành công.");
                setCurrentPassword(''); 
                setNewPassword(''); 
                setConfirmPassword(''); 
                               
            }
        } catch (error) {
            // Xử lý lỗi và thông báo người dùng
            toast.error("There was an error while verifying the password.");
            console.error(error);
        }
    };

    const UpdatePassword = async () => {
        const response = axios.put(`${url}/api/user/users/${user._id}`, { password: newPassword, type: "user" });
        try {

            if (response.success) {
                toast.success("Password updated successfully.");
               

            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error(error.response.message.message || 'There was an error');
        }
    };
    // Initialize formData with the user data from context
    const [formData, setFormData] = useState({
        name: user.name || '',
        gender: user.gender || '',
        date_of_birth: user.date_of_birth || '',
        address: user.address || '',
        phoneNumber: user.phoneNumber || '' // Single phone number as a string
    });

    const [activeTab, setActiveTab] = useState('personal');
    const [isEditing, setIsEditing] = useState(false);
    useEffect(() => {
        // Ensure formData updates if user data changes
        setFormData({
            name: user.name || '',
            gender: user.gender || '',
            date_of_birth: user.date_of_birth || '',
            address: user.address || '',
            phone_number: user.phone_number || '' // Single phone number as a string
        });

    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Optionally reset formData to original user data if needed
        setFormData({
            name: user.name || '',
            gender: user.gender || '',
            date_of_birth: user.date_of_birth || '',
            address: user.address || '',
            phone_number: user.phone_number || ''
        });
    };
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formDataUser = new FormData();

        formDataUser.append('type', 'user');
        if (selectedAvatar && selectedAvatar instanceof File) {
            formDataUser.append('image', selectedAvatar);
        }
        for (const key in formData) {
            if (formData.hasOwnProperty(key)) {
                formDataUser.append(key, formData[key]);
            }
        }

        try {
            const response = await axios.put(`${url}/api/user/users/${user._id}`, formDataUser, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(response.data);
            if (response.data.success) {
                
                localStorage.setItem("user", JSON.stringify(response.data.user));
                setUser(response.data.user);
                setIsEditing(false);
                toast.success('Profile updated successfully.');
                window.location.reload();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('Failed to update profile.');
            console.error(error);
        }
        setIsEditing(false);
    };
    
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedAvatar(file); // Lưu trực tiếp File vào state thay vì base64
        }
    };

    return (
        <div className="my-account">
            <h2>Account Information</h2>
            <div >
                <img
                    src={selectedAvatar ? URL.createObjectURL(selectedAvatar) : `${url}/images/${user.avatar}`}
                    alt="Avatar"
                    className="profile-pic"
                />
                {isEditing && (
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="avatar-input"
                    />
                )}
            </div>
            <div className="tab-navigation">

                <button
                    className={activeTab === 'personal' ? 'active-tab' : ''}
                    onClick={() => setActiveTab('personal')}
                >
                    Personal Data
                </button>
                <button
                    className={activeTab === 'password' ? 'active-tab' : ''}
                    onClick={() => setActiveTab('password')}
                >
                    Reset Password
                </button>
            </div>

            {activeTab === 'personal' && (
                <form onSubmit={handleFormSubmit}>
                    <div className="personal-data">
                        <h3>Personal Data</h3>
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />

                        <label>Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>

                        <label>Date of Birth</label>
                        <input
                            type="text"
                            name="date_of_birth"
                            value={formData.date_of_birth ? new Date(formData.date_of_birth).toISOString().split('T')[0] : ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}

                        />

                        <label>Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />

                        <label>Phone Number</label>
                        <input
                            type="text"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleInputChange}
                            placeholder="Enter phone number"
                            disabled={!isEditing}
                        />

                        {!isEditing ? (
                            <button type="button" onClick={toggleEdit} className="edit-btn">
                                Edit
                            </button>
                        ) : (
                            <>
                                <button type="button" onClick={handleCancel} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn">
                                    Save
                                </button>
                            </>
                        )}
                    </div>

                    <div className="email-section">
                        <h3>Email</h3>
                        <input
                            type="email"
                            value={user.email}
                            disabled={true}
                            readOnly
                        />
                    </div>
                </form>
            )}

            {activeTab === 'password' && (
                <form className="reset-password" onSubmit={handlePasswordUpdate}>
                    <h3>Reset Password</h3>

                    <label>Mật khẩu hiện tại</label>
            <div className="password-input">
                <input
                    type={showPassword.current ? "text" : "password"}
                    name="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                />
                <button
                    type="button"
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility("current")}
                >
                    {showPassword.current ? "Hide" : "Show"}
                </button>
            </div>

            <label>Mật khẩu mới</label>
            <div className="password-input">
                <input
                    type={showPassword.new ? "text" : "password"}
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <button
                    type="button"
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility("new")}
                >
                    {showPassword.new ? "Hide" : "Show"}
                </button>
            </div>

            <label>Xác nhận mật khẩu</label>
            <div className="password-input">
                <input
                    type={showPassword.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <button
                    type="button"
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility("confirm")}
                >
                    {showPassword.confirm ? "Hide" : "Show"}
                </button>
            </div>

                    <button type="button" className="cancel-btn">Cancel</button>
                    <button type="submit" className="save-btn">Update Password</button>
                </form>
            )}
        </div>
    );
};

export default MyAccount;

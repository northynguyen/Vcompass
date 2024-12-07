import React, { useState, useContext } from 'react';
import './MyProfile.css';
import edit_icon from '../../assets/edit-alt-regular-24.png';
import default_avatar from '../../assets/profile_icon.png';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Navigate, useNavigate } from 'react-router-dom';
export const MyProfileContainer = () => {
    const { admin, setAdmin } = useContext(StoreContext);
    const [activeTab, setActiveTab] = useState('profile');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="profile-wrapper">
            <div className="profile-sidebar">
                <div className="sidebar-menu">
                    <button
                        className={activeTab === 'profile' ? 'sidebar-button active' : 'sidebar-button'}
                        onClick={() => handleTabClick('profile')}
                    >
                        My Profile
                    </button>
                    <button
                        className={activeTab === 'update-password' ? 'sidebar-button active' : 'sidebar-button'}
                        onClick={() => handleTabClick('update-password')}
                    >
                        Update Password
                    </button>
                </div>
            </div>

            <div className="profile-main-content">
                {activeTab === 'profile' && (
                    <MyProfile
                        admin={admin}
                        setAdmin={setAdmin}
                    />
                )}
                {activeTab === 'update-password' && <UpdatePassword />}
            </div>
        </div>
    );
};

const MyProfile = ({ admin, setAdmin }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedInfo, setEditedInfo] = useState({ ...admin });
    delete editedInfo.password;
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const { url } = useContext(StoreContext);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = async () => {
        try {
            const formData = new FormData();
            formData.append('type', 'admin');

            // Gửi trực tiếp file từ state
            if (selectedAvatar && selectedAvatar instanceof File) {
                formData.append('image', selectedAvatar);
            }

            // Append các trường khác
            for (const key in editedInfo) {
                if (editedInfo.hasOwnProperty(key)) {
                    formData.append(key, editedInfo[key]);
                }
            }

            const response = await axios.put(`${url}/api/user/admin/${admin._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {

                setAdmin(response.data.user);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setIsEditing(false);
                toast.success('Profile updated successfully.');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'There was an error');
        }
    };


    const handleChange = (e) => {
        setEditedInfo({
            ...editedInfo,
            [e.target.name]: e.target.value,
        });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedAvatar(file); // Lưu trực tiếp File vào state thay vì base64
        }
    };
    const formatDateForDisplay = (isoDate) => {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleDateChange = (e) => {
        const isoDate = e.target.value;
        setEditedInfo((prevState) => ({
            ...prevState,
            date_of_birth: isoDate,
        }));
    };

    return (
        <div className="profile-section-wrapper">
            <div className="profile-header">
                <h2 className="profile-title">My Profile</h2>
                <img
                    src={edit_icon}
                    alt="Edit"
                    className="profile-edit-icon"
                    onClick={handleEditClick}
                />
            </div>
            <div className="avatar-section">
                <img
                    src={selectedAvatar ? URL.createObjectURL(selectedAvatar) : `${url}/images/${admin.avatar}`}
                    alt="Avatar"
                    className="avatar-image"
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
            <div className="details-section">
                <p>
                    <strong>Name:</strong>{' '}
                    {isEditing ? (
                        <input
                            type="text"
                            name="name"
                            value={editedInfo.name || ''}
                            onChange={handleChange}
                            className="details-input"
                        />
                    ) : (
                        admin.name
                    )}
                </p>
                <p>
                    <strong>Email:</strong>{' '}
                    <input
                        type="email"
                        name="email"
                        value={admin.email || ''}
                        readOnly
                        className="readonly-input"
                    />
                </p>
                <p>
                    <strong>Phone:</strong>{' '}
                    {isEditing ? (
                        <input
                            type="text"
                            name="phone_number"
                            value={editedInfo.phone_number || ''}
                            onChange={handleChange}
                            className="details-input"
                        />
                    ) : (
                        admin.phone_number
                    )}
                </p>
                <p>
                    <strong>Address:</strong>{' '}
                    {isEditing ? (
                        <input
                            type="text"
                            name="address"
                            value={editedInfo.address || ''}
                            onChange={handleChange}
                            className="details-input"
                        />
                    ) : (
                        admin.address
                    )}
                </p>
                <p>
                    <strong>Gender:</strong>{' '}
                    {isEditing ? (
                        <select
                            name="gender"
                            value={editedInfo.gender || ''}
                            onChange={handleChange}
                            className="gender-select"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="">Other</option>
                        </select>
                    ) : (
                        admin.gender
                    )}
                </p>
                <p>
                    <strong>Date of Birth:</strong>
                    {isEditing ? (
                        <input
                            type="date"
                            name="date_of_birth"
                            value={editedInfo.date_of_birth || ''}
                            onChange={handleDateChange}
                            className="details-input"
                        />
                    ) : (
                        formatDateForDisplay(admin.date_of_birth)
                    )}
                </p>
            </div>
            {isEditing && (
                <button className="save-button" onClick={handleSaveClick}>
                    Save
                </button>
            )}
        </div>
    );
};

const UpdatePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { url, admin, token, setToken } = useContext(StoreContext);
    const navigate = useNavigate();

    const handlePasswordUpdate = (e) => {
        e.preventDefault();
        // Kiểm tra nếu mật khẩu mới và xác nhận mật khẩu không trùng khớp
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match.');
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
                    id: admin._id,
                    type: "admin",
                }),
            });

            const data = await response.json();

            if (!data.success) {
                toast.error("Current password is incorrect.");

                return;
            }
            else {
                UpdatePassword();
                toast.success("Password updated successfully.");
                handleLogout();
            }
        } catch (error) {
            // Xử lý lỗi và thông báo người dùng
            toast.error("There was an error while verifying the password.");
            console.error(error);
        }
    };

    const UpdatePassword = async () => {
        const response = axios.put(`${url}/api/user/admin/${admin._id}`, { password: newPassword, type: "admin" });
        try {

            if (response.success) {
                toast.success(response.message);

            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error(error.response.message.message || 'There was an error');
        }
    };
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
        toast.success('Đăng xuất thành công');
        setToken(null);
    };
    return (
        <div className="password-section">
            <h2>Update Password</h2>
            <form onSubmit={handlePasswordUpdate}>
                <div className="password-field">
                    <label className="password-label">Current Password</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="password-input"
                    />
                </div>
                <div className="password-field">
                    <label className="password-label">New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="password-input"
                    />
                </div>
                <div className="password-field">
                    <label className="password-label">Confirm New Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="password-input"
                    />
                </div>
                <button type="submit" className="update-password-button">Update Password</button>
            </form>
        </div>
    );
};

export default MyProfileContainer;

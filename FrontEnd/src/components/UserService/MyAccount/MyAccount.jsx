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
        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không trùng khớp.');
            return;
        }
        checkPassword(currentPassword);
    };

    const checkPassword = async (currentPassword) => {
        try {
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
                toast.error("Mật khẩu hiện tại không chính xác.");
                return;
            } else {
                UpdatePassword();
                toast.success("Cập nhật mật khẩu thành công.");
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error) {
            toast.error("Đã có lỗi khi xác minh mật khẩu.");
            console.error(error);
        }
    };

    const UpdatePassword = async () => {
        const response = axios.put(`${url}/api/user/users/${user._id}`, { password: newPassword, type: "user" });
        try {
            if (response.success) {
                toast.success("Cập nhật mật khẩu thành công.");
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error(error.response.message.message || 'Có lỗi xảy ra.');
        }
    };

    const [formData, setFormData] = useState({
        name: user.name || '',
        gender: user.gender || '',
        date_of_birth: user.date_of_birth || '',
        address: user.address || '',
        phoneNumber: user.phoneNumber || ''
    });

    const [activeTab, setActiveTab] = useState('personal');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setFormData({
            name: user.name || '',
            gender: user.gender || '',
            date_of_birth: user.date_of_birth || '',
            address: user.address || '',
            phone_number: user.phone_number || ''
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
                toast.success('Cập nhật hồ sơ thành công.');
                window.location.reload();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('Cập nhật hồ sơ thất bại.');
            console.error(error);
        }
        setIsEditing(false);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedAvatar(file);
        }
    };

    return (
        <div className="my-account">
            <h2>Thông Tin Tài Khoản</h2>

            <div className="tab-navigation">
                <button
                    className={activeTab === 'personal' ? 'active-tab' : ''}
                    onClick={() => setActiveTab('personal')}
                >
                    Dữ Liệu Cá Nhân
                </button>
                <button
                    className={activeTab === 'password' ? 'active-tab' : ''}
                    onClick={() => setActiveTab('password')}
                >
                    Đổi Mật Khẩu
                </button>
            </div>

            {activeTab === 'personal' && (
                <form onSubmit={handleFormSubmit}>
                    <div className="personal-data">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3>Thông Tin Cá Nhân</h3>
                            <button type="button" onClick={toggleEdit} className="edit-btn">
                                Chỉnh Sửa
                            </button>
                        </div>

                        <div>
                            <img
                                src={selectedAvatar ? URL.createObjectURL(selectedAvatar) : user.avatar && user.avatar.includes('http') ? user.avatar : user.avatar && `${url}/images/${user.avatar}`}
                                alt="Avatar"
                                className="profile-pic"
                                style={{ width: '150px', height: '150px', borderRadius: '50%' }}
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
                        <label>Họ Tên</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />

                        <label>Giới Tính</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        >
                            <option value="">Chọn Giới Tính</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                        </select>

                        <label>Ngày Sinh</label>
                        <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth ? new Date(formData.date_of_birth).toISOString().split('T')[0] : ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />

                        <label>Địa Chỉ</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />

                        <label>Số Điện Thoại</label>
                        <input
                            type="text"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleInputChange}
                            placeholder="Nhập số điện thoại"
                            disabled={!isEditing}
                        />

                        {isEditing && (
                            <>
                                <button type="button" onClick={handleCancel} className="cancel-btn">
                                    Hủy
                                </button>
                                <button type="submit" className="save-btn">
                                    Lưu
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
                    <h3>Đổi Mật Khẩu</h3>

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
                            {!showPassword.current ? "Hiện" : "Ẩn"}
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
                            {!showPassword.new ? "Hiện" : "Ẩn"}
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
                           {!showPassword.confirm ? "Hiện" : "Ẩn"}
                        </button>
                    </div>

                    <button type="submit" className="update-password-btn">
                        Đổi Mật Khẩu
                    </button>
                </form>
            )}
        </div>
    );
};

export default MyAccount;

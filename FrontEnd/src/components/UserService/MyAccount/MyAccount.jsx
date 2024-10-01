import { useState } from 'react';
import './MyAccount.css';

const MyAccount = () => {
    const [formData, setFormData] = useState({
        fullName: "Phạm Thành",
        gender: "",
        birthdate: "",
        city: ""
    });

    const [email] = useState("phambathanh1803@gmail.com"); // Không cho phép thay đổi email
    const [mobileNumbers, setMobileNumbers] = useState([]);
    const [activeTab, setActiveTab] = useState('personal'); // New state for tab control
    const [isEditing, setIsEditing] = useState(false); // State to control editing

   
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleMobileChange = (e, index) => {
        const updatedMobileNumbers = [...mobileNumbers];
        updatedMobileNumbers[index] = e.target.value;
        setMobileNumbers(updatedMobileNumbers);
    };

    const addMobileNumber = () => {
        // Chỉ thêm số điện thoại mới nếu số hiện tại đã được nhập
        if (mobileNumbers.length < 3 && mobileNumbers[mobileNumbers.length - 1] !== '') {
            setMobileNumbers([...mobileNumbers, '']); // Thêm một mục trống
        }
    };


    const toggleEdit = () => {
        setIsEditing(!isEditing); // Chuyển đổi trạng thái giữa edit và view
    };

    const handleCancel = () => {
        setIsEditing(false); // Hủy bỏ chỉnh sửa
        // Khôi phục lại giá trị cũ nếu cần (nếu có lưu trữ dữ liệu ban đầu)
    };

    const [passwordVisibility, setPasswordVisibility] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    });


    const handlePasswordChange = () => {
        // Handle password input changes
    };

    const togglePasswordVisibility = (field) => {
        setPasswordVisibility((prevState) => ({
            ...prevState,
            [field]: !prevState[field]
        }));
    };

    return (
        <div className="my-account">
            <h2>Account Information</h2>

            {/* Tab Navigation */}
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

            {/* Tab Content */}
            {activeTab === 'personal' && (
                <form>
                    {/* Personal Data Section */}
                    <div className="personal-data">
                        <h3>Personal Data</h3>
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            disabled={!isEditing} // Disable nếu không ở trạng thái edit
                        />

                        <label>Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            disabled={!isEditing} // Disable nếu không ở trạng thái edit
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>

                        <label>Birthdate</label>
                        <input
                            type="date"
                            name="birthdate"
                            value={formData.birthdate}
                            onChange={handleInputChange}
                            disabled={!isEditing} // Disable nếu không ở trạng thái edit
                        />

                        <label>City of Residence</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            disabled={!isEditing} // Disable nếu không ở trạng thái edit
                        />
                        {/* Mobile Number Section */}
                    <div className="mobile-section">
                        <label>Mobile Number</label>
                        <p>You may use up to 3 mobile numbers.</p>
                        {mobileNumbers.map((number, index) => (
                            <div key={index}>
                                <input
                                    type="text"
                                    value={number}
                                    onChange={(e) => handleMobileChange(e, index)}
                                    placeholder="Enter mobile number"
                                    disabled={!isEditing} // Disable nếu không ở trạng thái edit
                                />
                            </div>
                        ))}
                        {isEditing && (
                            <button type="button" onClick={addMobileNumber}>
                                + Add Mobile Number
                            </button>
                        )}
                    </div>
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

                    {/* Email Section */}
                    <div className="email-section">
                        <h3>Email</h3>
                        
                                <input
                                    type="email"
                                    value={email}
                                    disabled={true} // Không cho phép thay đổi email
                                />
                       
                    </div>
                </form>
            )}

            {/* Reset Password Tab */}
            {activeTab === 'password' && (
                <form className="reset-password">
                    <h3>Reset Password</h3>

                    <label>Current Password</label>
                    <div className="password-input">
                        <input
                            type={passwordVisibility.currentPassword ? 'text' : 'password'}
                            name="currentPassword"
                            onChange={handlePasswordChange}
                        />
                        <button type="button" className="toggle-password" onClick={() => togglePasswordVisibility('currentPassword')}>
                            {passwordVisibility.currentPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    <label>New Password</label>
                    <div className="password-input">
                        <input
                            type={passwordVisibility.newPassword ? 'text' : 'password'}
                            name="newPassword"
                            onChange={handlePasswordChange}
                        />
                        <button type="button" className="toggle-password" onClick={() => togglePasswordVisibility('newPassword')}>
                            {passwordVisibility.newPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    <label>Confirm New Password</label>
                    <div className="password-input">
                        <input
                            type={passwordVisibility.confirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            onChange={handlePasswordChange}
                        />
                        <button type="button" className="toggle-password" onClick={() => togglePasswordVisibility('confirmPassword')}>
                            {passwordVisibility.confirmPassword ? 'Hide' : 'Show'}
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

import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { StoreContext } from '../../Context/StoreContext';
import './Notification.css';

const Notification = ({ userData, accommodationData, foodserviceData, scheduleData, hideName, onClose }) => {
    const { admin, url } = useContext(StoreContext);
    const [userName, setUserName] = useState(userData?.name || "");
    const [content, setContent] = useState("");
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        // Set nội dung mẫu khi có userData, accommodationData hoặc foodserviceData
        if (accommodationData) {
            // Nội dung mẫu cho chỗ ở
            let statusMessage = "";
            switch (accommodationData.status) {
                case "active":
                    statusMessage = `Chỗ ở ${accommodationData.name} hiện đang hoạt động. Cảm ơn bạn đã hợp tác cùng chúng tôi!`;
                    break;
                case "inactive":
                    statusMessage = `Chỗ ở ${accommodationData.name} hiện không hoạt động. Nếu cần hỗ trợ, vui lòng liên hệ với chúng tôi.`;
                    break;
                case "pending":
                    statusMessage = `Chỗ ở ${accommodationData.name} đang chờ duyệt. Chúng tôi sẽ sớm cập nhật trạng thái cho bạn.`;
                    break;
                case "block":
                    statusMessage = `Chỗ ở ${accommodationData.name} đã bị khóa. Vui lòng liên hệ với bộ phận hỗ trợ để giải quyết.`;
                    break;
                default:
                    statusMessage = `Thông báo trạng thái chỗ ở.`;
            }
            setContent(statusMessage);
        } else if (foodserviceData) {
            // Nội dung mẫu cho dịch vụ ăn uống
            let statusMessage = "";
            switch (foodserviceData.status) {
                case "active":
                    statusMessage = `Dịch vụ ăn uống ${foodserviceData.foodServiceName} hiện đang hoạt động. Cảm ơn bạn đã hợp tác cùng chúng tôi!`;
                    break;
                case "inactive":
                    statusMessage = `Dịch vụ ăn uống ${foodserviceData.foodServiceName} hiện không hoạt động. Nếu cần hỗ trợ, vui lòng liên hệ với chúng tôi.`;
                    break;
                case "pending":
                    statusMessage = `Dịch vụ ăn uống ${foodserviceData.foodServiceName} đang chờ duyệt. Chúng tôi sẽ sớm cập nhật trạng thái cho bạn.`;
                    break;
                case "block":
                    statusMessage = `Dịch vụ ăn uống ${foodserviceData.foodServiceName} đã bị khóa. Vui lòng liên hệ với bộ phận hỗ trợ để giải quyết.`;
                    break;
                default:
                    statusMessage = `Thông báo trạng thái dịch vụ ăn uống.`;
            }
            setContent(statusMessage);
        } else if (userData) {
            // Nội dung mẫu cho người dùng
            let statusMessage = "";
            if (userData.status === "active") {
                statusMessage = `Tài khoản của bạn, ${userData.name}, hiện đang hoạt động. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!`;
            } else if (userData.status === "blocked") {
                statusMessage = `Tài khoản của bạn, ${userData.name}, đã bị khóa. Vui lòng liên hệ với bộ phận hỗ trợ để được giải quyết.`;
            } else {
                statusMessage = `Thông báo trạng thái tài khoản. Nếu bạn có thắc mắc, vui lòng liên hệ với chúng tôi.`;
            }
            setContent(statusMessage);
        }
        else if (scheduleData) {
            // Nội dung mẫu thông báo cho người dùng về schedule của họ
            let statusMessage = "";
            if (scheduleData.status === "unactive") {
                statusMessage = `Lịch trình của bạn, ${scheduleData.scheduleName} đã bị báo cáo vi phạm. Sau khi xem xét chúng tôi đã đưa lịch trình về trạng thái private để bạn có thể sửa chữa. Chúng tôi sẽ nặng tay hơn nếu có những báo cáo tương tự`;
            }
            setContent(statusMessage);
        }
    }, [userData, accommodationData, foodserviceData, scheduleData]); // Chạy lại khi có dữ liệu mới

    // const getTypeNo = () => {
    //     if (userData) {
    //         return userData.status === "blocked" ? "blockedUser" : "activeUser";
    //     }
    //     if (accommodationData) {
    //         return accommodationData.status + "Accommodation";
    //     }
    //     if (foodserviceData) {
    //         return foodserviceData.status + "FoodService";
    //     }
    //     return "normal";
    // };

    // Xử lý gửi form
    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setIsLoading(true);
            if (accommodationData) {
                // Gửi thông báo liên quan đến chỗ ở
                await axios.post(`${url}/api/notifications/notifications/`, {
                    idSender: admin._id,
                    idReceiver: accommodationData.partnerId,
                    content,
                    typeNo: "partner",
                    nameSender: "Admin",
                    imgSender: admin.img || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                });

                // Cập nhật trạng thái của chỗ ở
                const response = await axios.put(`${url}/api/accommodations/${accommodationData._id}`, {
                    status: accommodationData.status,
                    adminId: admin._id,
                });

                if (response.status === 200) {
                    setContent("");
                    toast.success("Cập nhật trang thái thành công!");
                    onClose();

                }


            } else if (foodserviceData) {
                // Gửi thông báo liên quan đến dịch vụ ăn uống
                await axios.post(`${url}/api/notifications/notifications/`, {
                    idSender: admin._id,
                    idReceiver: foodserviceData.partnerId,
                    content,
                    typeNo: "partner",
                    nameSender: "Admin",
                    imgSender: admin.img || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                });

                // Cập nhật trạng thái của dịch vụ ăn uống
                const response = await axios.put(`${url}/api/foodservices/${foodserviceData._id}`, {
                    status: foodserviceData.status,
                    adminId: admin._id,
                });

                if (response.status === 200) {
                    setContent("");
                    toast.success("Cập nhật trang thái thành công!");
                    onClose();
                }


            } else if (scheduleData) {
                // Gửi thông báo liên quan đến lịch trình
                await axios.post(`${url}/api/notifications/notifications/`, {
                    idSender: admin._id,
                    idReceiver: scheduleData.idUser,
                    content,
                    typeNo: "user",
                    nameSender: "Admin",
                    imgSender: admin.img || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                });

                // Cập nhật trạng thái của lịch trình
                const response = await fetch(`${url}/api/schedule/update/${scheduleData._id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ isPublic: false }),
                });
                if (response.status === 200) {
                    setContent("");
                    toast.success("Cập nhật trang thái thành công!");
                    onClose();
                }

            } else if (userData) {
                // Gửi thông báo liên quan đến người dùng hoặc đối tác
                await axios.post(`${url}/api/notifications/notifications/`, {
                    idSender: admin._id,
                    idReceiver: userData._id,
                    content,
                    typeNo: userData.type === "user" ? "user" : "partner",
                    nameSender: admin.name || "Admin",
                    imgSender: admin.img || "https://cdn-icons-png.flaticon.com/512/149/149071.png",

                });
                await axios.post(`${url}/api/email/user/status`, {
                    email: userData.email,
                    reason: content,
                    admin: {
                        name: admin.name || "Admin",
                        email: "weather.api.dashboard.1803@gmail.com"
                    }    , 
                    isBlocked: userData.status === "blocked" ? true : false             
                });

                // Cập nhật trạng thái người dùng/đối tác
                const response = await axios.put(`${url}/api/user/${userData.type === "user" ? "users" : "partners"}/${userData._id}`, {
                    type: userData.type,
                    status: userData.status,
                });

                if (response.status === 200) {
                    setContent("");
                    toast.success("Cập nhật trang thái thành công!");
                    userData.type === "user" ? onClose(true) : onClose();

                }
            }
        } catch (error) {
            console.error("Error adding notification:", error);
        }
        
        finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="block-user-form">
            <div className="form-group">
                <label>Tên Admin:</label>
                <input type="text" value={admin.name} disabled className="form-control" />
            </div>
            {!hideName &&
                <div className="form-group">
                    <label>{accommodationData || foodserviceData ? "Tên Partner " : "Tên người dùng "}:</label>
                    <input
                        type="text"
                        value={
                            accommodationData
                                ? accommodationData.partnerName
                                : foodserviceData
                                    ? foodserviceData.partnerName
                                    : scheduleData
                                        ? scheduleData.name
                                        : userName
                        }
                        onChange={(e) => setUserName(e.target.value)}
                        disabled={!!accommodationData || !!foodserviceData || !!userData?.name}
                        required
                        className="form-control"
                    />
                </div>
            }
            <div className="form-group">
                <label>Nội dung :</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    className="form-control"
                />
            </div>
            <div className={"form-buttons-noti" + (isLoading ? " loading" : "")}>
                {isLoading && <span className="loading-spinner"></span>}
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    Gửi
                </button>
            </div>

        </form>
    );
};

export default Notification;

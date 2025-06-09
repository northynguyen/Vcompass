import { useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import { StoreContext } from "../../Context/StoreContext";
import Notification from "../Notification/Notification";

const ReportDetail = ({ report, onClose, onStatusChange }) => {
    const [profile, setProfile] = useState(null);
    const { url } = useContext(StoreContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    console.log("report", profile);
    const handleUpdate = (status) => {
        onStatusChange(report._id, status);
    };


    const closeModal = (updated) => {
        if (updated) handleUpdate("resolved");
        setIsModalOpen(false);
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (report.targetType === "User") {
                try {
                    const response = await fetch(`${url}/api/user/user/${report.targetId}`);
                    if (!response.ok) {
                        throw new Error("Lỗi khi lấy thông tin người dùng");
                    }
                    const data = await response.json();
                    setProfile(data.user);
                } catch (error) {
                    console.error("Lỗi khi lấy thông tin người dùng:", error);
                }
            }
            if (report.targetType === "Schedule") {
                try {
                    const response = await fetch(`${url}/api/schedule/${report.targetId}`);
                    if (!response.ok) {
                        throw new Error("Lỗi khi lấy thông tin người dùng");
                    }
                    const data = await response.json();
                    setProfile(data.schedule);
                } catch (error) {
                    console.error("Lỗi khi lấy thông tin người dùng:", error);
                }
            }
        };

        fetchUserProfile();
    }, [report.targetId, report.targetType, url]);

    return (
        <div className="report-overlay" onClick={onClose}>
            <div className="report-popup" onClick={(e) => e.stopPropagation()}>
                <h2>Chi tiết Báo Cáo</h2>
                <p><strong>Người gửi:</strong> {report.reporterId.name}</p>
                <p><strong>Loại nội dung:</strong> {report.targetType}</p>
                <p><strong>Lý do:</strong> {report.reason}</p>
                <p><strong>Mô tả:</strong> {report.description || "Không có mô tả"}</p>

                {report.targetType === "User" && (
                    <a
                        href={`https://vcompass.onrender.com/otherUserProfile/${report.targetId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <strong>Link:</strong> Click vào đây
                    </a>
                )}

                {report.targetType === "Schedule" && (
                    <a
                        href={`https://vcompass.onrender.com/schedule-view/${report.targetId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <strong>Link:</strong> Click vào đây
                    </a>
                )}


                {/* Nút hành động */}
                <div className="actions">
                    {report.status === "pending" ? (
                        <>
                            <button onClick={() => setIsModalOpen(true)}>Duyệt</button>
                            <button onClick={() => handleUpdate("rejected")}>Từ chối</button>
                        </>
                    ) : (
                        <p className="status-note">Báo cáo này đã được xử lý.</p>
                    )}
                    <button onClick={onClose}>Đóng</button>
                </div>

                <Modal
                    isOpen={isModalOpen}
                    onRequestClose={() => closeModal(false)}
                    className="notification-modal"
                    overlayClassName="modal-overlay"
                >
                    <button className="close-button" onClick={() => closeModal(false)}>×</button>
                    {report.targetType === "User" && (
                        <Notification
                            userData={{ type: report.targetType.toLowerCase(), _id: report.targetId, name: profile?.name, status: "blocked" }}
                            onClose={closeModal}
                        />
                    )}
                    {report.targetType === "Schedule" && (
                        <Notification
                            scheduleData={{
                                type: "schedule",
                                _id: report.targetId,
                                name: profile?.idUser.name,
                                idUser: profile?.idUser._id,
                                status: "unactive",
                                scheduleName: profile?.scheduleName,
                            }}
                            onClose={closeModal}
                        />
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default ReportDetail;

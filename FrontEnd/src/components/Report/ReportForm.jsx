import { useState, useContext } from "react";
import "./ReportForm.css";
import { StoreContext } from "../../Context/StoreContext";
import SignIn from "../SignIn/SignIn";

const ReportForm = ({ targetId, targetType, onClose }) => {
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const { url, token } = useContext(StoreContext);
    const [showLogin, setShowLogin] = useState(false);
    console.log(targetId, targetType);
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra nếu chưa có token thì hiện form đăng nhập
        if (!token) {
            setShowLogin(true);
            return;
        }

        try {
            const reportData = { targetId, targetType, reason, description };

            const response = await fetch(`${url}/api/reports`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    token: token,
                },
                body: JSON.stringify(reportData),
            });

            const result = await response.json();

            if (response.ok) {
                alert("Báo cáo thành công!");
                setReason("");
                setDescription("");
                onClose();
            } else {
                alert(`Báo cáo thất bại: ${result.message}`);
            }
        } catch (error) {
            console.error("Lỗi khi gửi báo cáo:", error);
            alert("Đã xảy ra lỗi, vui lòng thử lại.");
        }
    };

    return (
        <div className="report-overlay" onClick={onClose}>
            {showLogin ? (
                <div onClick={(e) => e.stopPropagation()}>
                    <SignIn setShowLogin={setShowLogin} />
                </div>
            ) : (
                <div className="report-popup" onClick={(e) => e.stopPropagation()}>
                    <button className="report-close" onClick={onClose}>×</button>
                    <form className="report-form" onSubmit={handleSubmit}>
                        <h3 className="report-title">Báo cáo nội dung</h3>

                        <label className="report-label">Lý do báo cáo:</label>
                        <select
                            className="report-select"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        >
                            <option value="">-- Chọn lý do --</option>
                            <option value="Spam or Ads">Spam hoặc Quảng cáo</option>
                            <option value="Inappropriate Content">Nội dung không phù hợp</option>
                            <option value="False Information">Thông tin sai lệch</option>
                            <option value="Copyright Violation">Vi phạm bản quyền</option>
                            <option value="Harassment">Quấy rối</option>
                            <option value="Other">Khác</option>
                        </select>

                        <label className="report-label">Mô tả chi tiết (tuỳ chọn):</label>
                        <textarea
                            className="report-textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Chi tiết thêm (nếu có)..."
                            style={{ resize: "none" }}
                        />

                        <button className="report-submit" type="submit">Gửi báo cáo</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ReportForm;

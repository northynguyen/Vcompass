import { useState, useEffect, useContext } from "react";
import ReportList from "./ReportList";
import ReportDetail from "./ReportDetail";
import { StoreContext } from "../../Context/StoreContext";
import "./Report.css";

const ReportManagement = () => {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [filterStatus, setFilterStatus] = useState("All");
    const { url, token } = useContext(StoreContext);

    // Lấy danh sách báo cáo
    const fetchReports = async (status) => {
        try {
            const query = status !== "All" ? `?status=${status}` : "";
            const response = await fetch(`${url}/api/reports/${query}`, {
                headers: { token: token },
            });

            if (!response.ok) {
                throw new Error("Lỗi khi lấy báo cáo");
            }

            const data = await response.json();

            if (data.success) {
                setReports(data.reports);
            }
        } catch (error) {
            console.error("Lỗi khi lấy báo cáo:", error);
        }
    };

    useEffect(() => {
        fetchReports(filterStatus);
    }, [filterStatus]);

    // Xử lý cập nhật trạng thái
    const handleUpdateStatus = async (reportId, status) => {
        try {
            const response = await fetch(`${url}/api/reports/${reportId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json", // Đảm bảo header đúng
                    token: token,
                },
                body: JSON.stringify({ status }), // Chuỗi hóa JSON
            });

            if (!response.ok) {
                throw new Error("Lỗi khi cập nhật trạng thái");
            }


            alert("Cập nhật trạng thái thành công!");

            // Tải lại danh sách báo cáo sau khi cập nhật
            fetchReports(filterStatus);

            // Đóng chi tiết báo cáo
            setSelectedReport(null);
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            alert("Cập nhật trạng thái thất bại!");
        }
    };


    return (
        <div className="report-container">
            <h2 className="main-title">Quản lý Báo Cáo</h2>

            {/* Bộ lọc trạng thái */}
            <div className="filter-section">
                <label>Lọc theo trạng thái: </label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">Tất cả</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="resolved">Đã xử lý</option>
                    <option value="rejected">Đã từ chối</option>
                </select>
            </div>

            {/* Danh sách báo cáo */}
            <ReportList reports={reports} onSelectReport={setSelectedReport} />

            {/* Chi tiết báo cáo */}
            {selectedReport && (
                <ReportDetail
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                    onStatusChange={handleUpdateStatus}
                />
            )}
        </div>
    );
};

export default ReportManagement;

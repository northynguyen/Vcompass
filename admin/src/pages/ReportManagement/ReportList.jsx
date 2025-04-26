const ReportList = ({ reports, onSelectReport }) => {
    const getTargetTypeLabel = (type) => {
        switch (type) {
            case "User":
                return "Người dùng";
            case "Schedule":
                return "Lịch trình";
            case "Service":
                return "Dịch vụ";
            default:
                return "Không xác định";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "pending":
                return "Chờ xử lý";
            case "resolved":
                return "Đã xử lý";
            case "rejected":
                return "Đã từ chối";
            default:
                return "Không xác định";
        }
    };
    const getStatusColorClass = (status) => {
        switch (status) {
            case "pending":
                return "row-pending";
            case "resolved":
                return "row-resolved";
            case "rejected":
                return "row-rejected";
            default:
                return "";
        }
    };
    return (
        <table className="report-table">
            <thead>
                <tr>
                    <th>Người gửi</th>
                    <th>Loại nội dung</th>
                    <th>Lý do</th>
                    <th>Ngày báo cáo</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                </tr>
            </thead>
            <tbody>
                {reports.map((report) => (
                    <tr key={report.reporterId._id} className={getStatusColorClass(report.status)}>
                        <td>{report.reporterId.name}</td>
                        <td>{getTargetTypeLabel(report.targetType)}</td>
                        <td>{report.reason}</td>
                        <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                        <td>{getStatusLabel(report.status)}</td>
                        <td>
                            <button onClick={() => onSelectReport(report)}>Xem chi tiết</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default ReportList;

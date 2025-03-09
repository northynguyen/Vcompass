const ReportList = ({ reports, onSelectReport }) => {
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
                    <tr key={report.reporterId._id}>
                        <td>{report.reporterId.name}</td>
                        <td>{report.targetType}</td>
                        <td>{report.reason}</td>
                        <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                        <td>{report.status}</td>
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

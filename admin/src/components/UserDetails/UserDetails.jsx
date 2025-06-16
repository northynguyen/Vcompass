import React, { useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import Modal from 'react-modal';
import './UserDetails.css';
import { StoreContext } from '../../Context/StoreContext';
import Notification from '../../pages/Notification/Notification';

Modal.setAppElement('#root');

const ChiTietNguoiDung = () => {
    const location = useLocation();
    const nguoiDung = location.state?.profile;
    const { url } = useContext(StoreContext);
    const [trangThai, setTrangThai] = useState(nguoiDung.status);
    const [trangThaiTruoc, setTrangThaiTruoc] = useState(nguoiDung.status);
    const [moModal, setMoModal] = useState(false);

    if (!nguoiDung) {
        return <div>Lỗi truy cập nguồn dữ liệu</div>;
    }

    const xuLyThayDoiTrangThai = (event) => {
        const trangThaiMoi = event.target.value;
        setTrangThaiTruoc(trangThai);
        setTrangThai(trangThaiMoi);
        setMoModal(true);
    };

    const dongModal = (xacNhan) => {
        if (!xacNhan) {
            setTrangThai(trangThaiTruoc);
        }
        setMoModal(false);
    };

    return (
        <div className="user-details">
            <div className="partner-info">
                <div className="partner-avatar">
                    <img
                        src={
                            nguoiDung.avatar && nguoiDung.avatar.includes('http')
                                ? nguoiDung.avatar
                                : `${url}/images/${nguoiDung.avatar}`
                        }
                        alt={nguoiDung.name}
                    />
                </div>
                <div style={{ width: '100%', textAlign: 'center' }}>
                    <h3>{nguoiDung.name}</h3>
                </div>
                <div className="info-container">
                    <p><strong>Giới tính:</strong> {nguoiDung.gender=== 'male' ? "Nam" : "Nữ"}</p>
                    <p><strong>Ngày sinh:</strong> {new Date(nguoiDung.date_of_birth).toLocaleDateString()}</p>
                    <p><strong>Email:</strong> {nguoiDung.email}</p>
                    <p><strong>Số điện thoại:</strong> {nguoiDung.phone_number}</p>
                    <p><strong>Địa chỉ:</strong> {nguoiDung.address}</p>
                    <p><strong>Ngày tạo tài khoản:</strong> {new Date(Date.parse(nguoiDung.createdAt)).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p>
                        <strong>Trạng thái:</strong>
                        <select value={trangThai} onChange={xuLyThayDoiTrangThai}>
                            <option value="active">Hoạt động</option>
                            <option value="blocked">Khóa tài khoản</option>
                        </select>
                    </p>
                </div>

                {/* Modal thông báo xác nhận */}
                <Modal
                    isOpen={moModal}
                    onRequestClose={() => dongModal(false)}
                    className="notification-modal"
                    overlayClassName="modal-overlay"
                >
                    <button className="close-button" onClick={() => dongModal(false)}>×</button>
                    <Notification
                        userData={{
                            type: "user",
                            _id: nguoiDung._id,
                            name: nguoiDung.name,
                            status: trangThai,
                            email: nguoiDung.email
                        }}
                        onClose={dongModal}
                    />
                </Modal>
            </div>
        </div>
    );
};

export default ChiTietNguoiDung;

import React, { useContext, useEffect, useState } from "react";
import { FaEdit, FaTrash } from 'react-icons/fa';
import { StoreContext } from "../../Context/StoreContext";
import "./ListExtensions.css";

const ListExtensions = () => {
    const [extensions, setExtensions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", category: "" });
    const [customCategory, setCustomCategory] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const { url } = useContext(StoreContext);

    useEffect(() => {
        fetchExtensions(currentPage);
        fetchCategories();
    }, [currentPage]);

    const fetchExtensions = async (page) => {
        try {
            const response = await fetch(`${url}/api/extensions?page=${page}&limit=${pageSize}`);
            const data = await response.json();
            if (data.success) {
                setExtensions(data.extensions);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${url}/api/extensions/categories`);
            const data = await response.json();
            if (data.success) {
                setCategories(data.categories);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách categories:", error);
        }
    };

    const openModal = (extension = null) => {
        if (extension) {
            setFormData({ name: extension.name, category: extension.category });
            setEditingId(extension._id);
        } else {
            setFormData({ name: "", category: "" });
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCustomCategory("");
    };

    const handleSave = async () => {
        const category = formData.category === "Khác" ? customCategory : formData.category;
        if (!formData.name.trim() || !category.trim()) return;

        const urlPath = editingId ? `${url}/api/extensions/${editingId}` : `${url}/api/extensions/add`;
        const method = editingId ? "PUT" : "POST";

        try {
            const response = await fetch(urlPath, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: formData.name, category }),
            });
            if (response.ok) {
                fetchExtensions(currentPage);
                fetchCategories();
                closeModal();
            }
        } catch (error) {
            console.error("Lỗi khi lưu dữ liệu:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${url}/api/extensions/${id}`, { method: "DELETE" });
            if (response.ok) {
                fetchExtensions(currentPage);
                fetchCategories();
            }
        } catch (error) {
            console.error("Lỗi khi xóa:", error);
        }
    };

    const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

    return (
        <div className="extension-container">
            <h2 className="main-title">Quản lý tiện ích</h2>
            <button onClick={() => openModal()} className="add-btn">+ Thêm</button>
            <table className="extension-table">
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Loại dịch vụ</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {extensions.map((ext) => (
                        <tr key={ext._id}>
                            <td>{ext.name}</td>
                            <td>{ext.category}</td>
                            <td className="actions button">
                                <button onClick={() => openModal(ext)}>
                                    <FaEdit />
                                </button>
                                <button onClick={() => handleDelete(ext._id)}>
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                <button onClick={prevPage} disabled={currentPage === 1}>«</button>
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={currentPage === index + 1 ? "active" : "inactive"}
                    >
                        {index + 1}
                    </button>
                ))}
                <button onClick={nextPage} disabled={currentPage === totalPages}>»</button>
            </div>

            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>{editingId ? "Chỉnh sửa" : "Thêm mới"} dịch vụ</h3>
                        <input
                            type="text"
                            placeholder="Tên dịch vụ"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="">Chọn loại dịch vụ</option>
                            {categories.map((category, index) => (
                                <option key={index} value={category}>{category}</option>
                            ))}
                            <option value="Khác">Khác</option>
                        </select>

                        {formData.category === "Khác" && (
                            <input
                                type="text"
                                placeholder="Nhập loại dịch vụ mới"
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                            />
                        )}

                        <button onClick={handleSave}>{editingId ? "Cập nhật" : "Thêm"}</button>
                        <button onClick={closeModal}>Hủy</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListExtensions;

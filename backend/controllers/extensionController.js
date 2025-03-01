import mongoose from "mongoose";
import ExtensionModal from "../models/extensions.js"; // Đường dẫn đến model

// Lấy tất cả extensions với phân trang
export const getAllExtensions = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Mặc định page = 1, limit = 10
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);

        const extensions = await ExtensionModal.find()
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);

        const totalExtensions = await ExtensionModal.countDocuments();

        res.json({
            success: true,
            message: "Get extensions with pagination success",
            extensions,
            pagination: {
                totalItems: totalExtensions,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalExtensions / pageSize),
                pageSize,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving extensions",
            error,
        });
    }
};

export const getAllCategories = async (req, res) => {
    try {
        const categories = await ExtensionModal.distinct("category");
        res.status(200).json({ success: true, categories });
    } catch (error) {
        console.error("Lỗi lấy danh sách categories:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách categories" });
    }
};

// Lấy extension theo ID
export const getExtensionById = async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID format" });
        }

        const extension = await ExtensionModal.findById(id);

        if (!extension) {
            return res.status(404).json({ success: false, message: "Extension not found" });
        }

        res.json({
            success: true,
            message: "Get extension success",
            extension,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving extension",
            error,
        });
    }
};

// Tạo mới extension
export const createExtension = async (req, res) => {
    const { name, category } = req.body;
    try {
        const newExtension = new ExtensionModal({ name, category });
        await newExtension.save();
        res.status(201).json({
            success: true,
            message: "Extension created successfully",
            extension: newExtension,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating extension",
            error,
        });
    }
};

// Cập nhật extension theo ID
export const updateExtension = async (req, res) => {
    const { id } = req.params;
    const { name, category } = req.body;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID format" });
        }

        const updatedExtension = await ExtensionModal.findByIdAndUpdate(
            id,
            { name, category },
            { new: true } // Trả về dữ liệu sau khi cập nhật
        );

        if (!updatedExtension) {
            return res.status(404).json({ success: false, message: "Extension not found" });
        }

        res.json({
            success: true,
            message: "Extension updated successfully",
            extension: updatedExtension,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating extension",
            error,
        });
    }
};

// Xóa extension theo ID
export const deleteExtension = async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID format" });
        }

        const deletedExtension = await ExtensionModal.findByIdAndDelete(id);

        if (!deletedExtension) {
            return res.status(404).json({ success: false, message: "Extension not found" });
        }

        res.json({
            success: true,
            message: "Extension deleted successfully",
            extension: deletedExtension,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting extension",
            error,
        });
    }

};
// Lấy extensions theo category
export const getExtensionsByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const extensions = await ExtensionModal.find({ category });

        if (!extensions.length) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy extensions cho category này",
            });
        }

        res.json({
            success: true,
            message: "Lấy danh sách extensions theo category thành công",
            extensions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy extensions theo category",
            error,
        });
    }
};

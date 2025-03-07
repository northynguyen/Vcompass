import express from "express";
import {
    getAllExtensions,
    getExtensionById,
    createExtension,
    updateExtension,
    deleteExtension,
    getExtensionsByCategory,
    getAllCategories
} from "../controllers/extensionController.js";
import authMiddleware from "../middleware/auth.js";

const extensionRoutes = express.Router();
// Lấy danh sách tất cả extensions
extensionRoutes.get("/", getAllExtensions);

// Lấy tất cả categories (route tĩnh nên đặt trước route động)
extensionRoutes.get("/categories", getAllCategories);

// Lấy extension theo ID (route động nên đặt sau)
// Lấy extension theo ID
extensionRoutes.get("/:id", getExtensionById);

extensionRoutes.post("/add", createExtension);

extensionRoutes.put("/:id", updateExtension);

extensionRoutes.delete("/:id", deleteExtension);
extensionRoutes.get("/category/:category", getExtensionsByCategory);
export default extensionRoutes;

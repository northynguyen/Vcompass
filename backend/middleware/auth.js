import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";

const authMiddleware = async (req, res, next) => {
    const { token } = req.headers;
    console.log("token", token);
    if (!token) {
        return res.json({ success: false, message: "Not authorized. Login again." });
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);

        req.body.userId = token_decode.id;
        req.userId = token_decode.id;
        console.log("req.body.userId:", req.body.userId);
        console.log(req.userId)
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}
// Kiểm tra người dùng đã đăng nhập
export const verifyUser = (req, res, next) => {
    if (!req.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized: User not logged in." });
    }
    next();
};

// Kiểm tra quyền admin bằng cách kiểm tra trong bảng admins
export const verifyAdmin = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.userId);
        if (!admin) {
            return res.status(403).json({ success: false, message: "Forbidden: Admin access required." });
        }
        next();
    } catch (error) {
        console.error("Admin verification error:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};
export default authMiddleware;
// routes/authRoutes.js

import express from "express";
import {
    loginUser,
    registerUser,
    loginPartner,
    loginAdmin,
    registerPartner,
    registerAdmin,
    loginWithGoogle,
    googleCallback,
    getAllUsers,
    getAllPartners,
    updateUserOrPartner
} from "../controllers/userController.js";

const userRoutes = express.Router();

// Routes cho đăng nhập và đăng ký
userRoutes.post("/login/user", loginUser);
userRoutes.post("/register/user", registerUser);
userRoutes.post("/login/partner", loginPartner);
userRoutes.post("/register/partner", registerPartner);
userRoutes.post("/login/admin", loginAdmin);
userRoutes.post("/register/admin", registerAdmin);

// Routes cho đăng nhập bằng Google
userRoutes.get("/google", loginWithGoogle); // Redirect đến Google
userRoutes.get("/google/callback", googleCallback); // Google callback

//Get all users
userRoutes.get('/users', getAllUsers);
userRoutes.get('/partners', getAllPartners);

//update user
userRoutes.put('/', updateUserOrPartner);
export default userRoutes;

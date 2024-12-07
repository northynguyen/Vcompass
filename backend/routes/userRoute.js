// routes/authRoutes.js

import express from "express";
import { upload } from "../middleware/upload.js";
import authMiddleware from './../middleware/auth.js';

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

    updateUserOrPartnerOrAdmin,
    getAdminById, addtoWishlist, getUserFavoritesWithDetails, checkPassword,
    getPartnerById, getUserById,

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
userRoutes.get('/users/', getAllUsers);
userRoutes.get('/partners/', getAllPartners);

//update user
userRoutes.put('/partners/:id', upload.fields([{ name: "image", maxCount: 1 }]), updateUserOrPartnerOrAdmin);
userRoutes.put('/users/:id', upload.fields([{ name: "image", maxCount: 1 }]), updateUserOrPartnerOrAdmin);
userRoutes.put('/admin/:id', upload.fields([{ name: "image", maxCount: 1 }]), updateUserOrPartnerOrAdmin);

userRoutes.post('/admin/getbyid', authMiddleware, getAdminById);
userRoutes.post('/partner/getbyid', authMiddleware, getPartnerById);
userRoutes.post('/user/getbyid', authMiddleware, getUserById);

userRoutes.post('/user/:userId/addtoWishlist', authMiddleware, addtoWishlist);
userRoutes.get('/user/favorites-with-details', getUserFavoritesWithDetails);


userRoutes.post('/check-password', checkPassword);

userRoutes.get('/partner/:id', getPartnerById);
userRoutes.get('/user/:id', getUserById);

export default userRoutes;

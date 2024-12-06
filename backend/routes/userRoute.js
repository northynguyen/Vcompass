// routes/authRoutes.js

import express from "express";

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
    updateUserOrPartner,
    getAdminById, addtoWishlist, getUserFavoritesWithDetails,getPartnerById, getUserById
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
userRoutes.put('/partners/:id', updateUserOrPartner);
userRoutes.put('/users/:id', updateUserOrPartner);

userRoutes.post('/admin/getbyid', authMiddleware, getAdminById);
userRoutes.post('/user/:userId/addtoWishlist', authMiddleware, addtoWishlist);
userRoutes.get('/user/favorites-with-details', getUserFavoritesWithDetails);

userRoutes.get('/partner/:id', getPartnerById);
userRoutes.get('/user/:id', getUserById);
export default userRoutes;

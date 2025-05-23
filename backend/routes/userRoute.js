// routes/authRoutes.js

import express from "express";
import { upload ,uploadAvatar} from "../middleware/upload.js";
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
    getPartnerById, getUserById,googleSignIn, followOrUnFollowUser,
    getUserByIdHaveFollower

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
userRoutes.get("/login/google", googleSignIn); // Redirect đầu Google

// Routes cho đăng nhập bằng Google
userRoutes.get("/google", loginWithGoogle); // Redirect đến Google
userRoutes.get("/auth/google/callback", googleCallback); // Google callback

//Get all users
userRoutes.get('/users/', getAllUsers);
userRoutes.get('/partners/', getAllPartners);

//update user
userRoutes.put('/partners/:id',uploadAvatar, updateUserOrPartnerOrAdmin);
userRoutes.put('/users/:id',uploadAvatar, updateUserOrPartnerOrAdmin);
userRoutes.put('/admin/:id',uploadAvatar, updateUserOrPartnerOrAdmin);

userRoutes.post('/admin/getbyid', authMiddleware, getAdminById);
userRoutes.post('/partner/getbyid', authMiddleware, getPartnerById);
userRoutes.post('/user/getbyid', authMiddleware, getUserById);

userRoutes.post('/user/:userId/addtoWishlist', authMiddleware, addtoWishlist);
userRoutes.put('/user/follow-or-unfollow',authMiddleware, followOrUnFollowUser);
userRoutes.get('/user/favorites-with-details', getUserFavoritesWithDetails);


userRoutes.post('/check-password', checkPassword);

userRoutes.get('/partner/:id', getPartnerById);
userRoutes.get('/user/:id', getUserById);




userRoutes.get('/user/:id/followers', getUserByIdHaveFollower);

export default userRoutes;

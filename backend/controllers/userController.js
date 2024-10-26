// controllers/authController.js

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/user.js";
import partnerModel from "../models/partner.js";
import {passport} from "../config/passport.js"; // Import passport

// Helper function to create JWT
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
};

// Helper function to handle login
const handleLogin = async (req, res, model, requiredRole = null) => {
    const { email, password } = req.body;

    // Validate email format
    if (!validator.isEmail(email)) {
        return res.json({ success: false, message: "Email không hợp lệ." });
    }

    try {
        // Construct query based on requiredRole
        

        // Find user by email and role (if required)
        const user = await model.findOne({email});

        if (!user) {
            const roleMessage = requiredRole ? `với vai trò ${requiredRole} ` : '';
            return res.json({ success: false, message: `Người dùng không tồn tại${roleMessage}.` });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: "Mật khẩu không chính xác." });
        }

        // Create JWT token
        const token = createToken(user._id);

        res.json({ success: true, token, message: "Đăng nhập thành công.", user });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Đã xảy ra lỗi máy chủ." });
    }
};

// Helper function to handle registration
const handleRegister = async (req, res, model, userRole = "user") => {
    const { name, email, password } = req.body;

    // Validate name
    if (!name || name.length < 3 || name.length > 30) {
        return res.json({ success: false, message: "Tên phải từ 3 đến 30 ký tự." });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
        return res.json({ success: false, message: "Email không hợp lệ." });
    }

    // Validate password length
    if (!password || password.length < 8) {
        return res.json({ success: false, message: "Mật khẩu phải ít nhất 8 ký tự." });
    }

    try {
        // Check if a user with the same email and role already exists
        const existingUser = await model.findOne({ email, roles: userRole });
        if (existingUser) {
            return res.json({ success: false, message: "Người dùng đã tồn tại với vai trò này." });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new model({
            name,
            email,
            password: hashedPassword,
            roles: [userRole],
            address: "Ho Chi Minh City",
            date_of_birth: "01-01-2000",
            gender: "male",
            avatar: "https://t4.ftcdn.net/jpg/00/65/77/27/360_F_65772719_A1UV5kLi5nCEWI0BNLLiFaBPEkUbv5Fv.jpg",
            status: "active" // Initialize roles array with the specified role\
        });

        const savedUser = await newUser.save();

        // Create JWT token
        const token = createToken(savedUser._id);

        res.json({ success: true, token, message: "Đăng ký thành công.", user: savedUser });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Đã xảy ra lỗi máy chủ 23423452345." });
    }
};

// Login with Google (Redirect-based)
const loginWithGoogle = async (req, res) => {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
};

// Google callback route (Redirect-based)
const googleCallback = async (req, res) => {
    passport.authenticate('google', { failureRedirect: '/login' }, async (err, user, info) => {
        if (err || !user) {
            return res.status(401).json({ success: false, message: "Đăng nhập không thành công." });
        }

        // Kiểm tra vai trò của người dùng
        if (!user.roles.includes("user")) {
            return res.status(403).json({ success: false, message: "Chỉ người dùng mới có thể đăng nhập." });
        }

        // Create JWT token
        const token = createToken(user._id);

        // Redirect hoặc gửi token về frontend
        res.redirect(`/auth/success?token=${token}`);
    })(req, res);
};

// New function for token-based Google login
const googleSignIn = async (req, res) => {
    const { tokenId } = req.body;

    if (!tokenId) {
        return res.status(400).json({ success: false, message: "Token không hợp lệ." });
    }

    try {
        // Verify the token with Google
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name } = payload;

        // Find the user by email
        let user = await userModel.findOne({ email });

        if (user) {
            // If user exists, check if they have 'user' role
            if (!user.roles.includes("user")) {
                return res.status(403).json({ success: false, message: "Chỉ người dùng mới có thể đăng nhập." });
            }
        } else {
            // If user does not exist, create a new user with 'user' role
            user = new userModel({
                name,
                email,
                password: "", // No password as user uses Google OAuth
                roles: ["user"],
                phone_number: "0123456789",
                address: "Ho Chi Minh City",
                date_of_birth: "01-01-2000",
                gender: "male",
                avatar: "https://t4.ftcdn.net/jpg/00/65/77/27/360_F_65772719_A1UV5kLi5nCEWI0BNLLiFaBPEkUbv5Fv.jpg",
                status: "active",
            });

            await user.save();
        }

        // Create JWT token
        const token = createToken(user._id);

        res.json({ success: true, token, message: "Đăng nhập Google thành công.", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Đã xảy ra lỗi máy chủ." });
    }
};

// Exported functions for different roles
const loginUser = async (req, res) => {
    await handleLogin(req, res, userModel, "user"); // Require 'user' role
};

const loginPartner = async (req, res) => {
    await handleLogin(req, res, partnerModel, "partner"); // Require 'partner' role
};

const loginAdmin = async (req, res) => {
    await handleLogin(req, res, userModel, "admin"); // Require 'admin' role
};

const registerUser = async (req, res) => {
    await handleRegister(req, res, userModel, "user"); // Register as 'user'
};

const registerPartner = async (req, res) => {
    await handleRegister(req, res, partnerModel, "partner"); // Register as 'partner'
};

export {
    loginUser,
    registerUser,
    loginPartner,
    loginAdmin,
    registerPartner,
    loginWithGoogle,
    googleCallback,
    googleSignIn // Export the new function
};

// controllers/authController.js

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import { passport } from "../config/passport.js"; // Import passport
import partnerModel from "../models/partner.js";
import adminModel from "../models/admin.js";
import userModel from "../models/user.js";
import mongoose, { model } from 'mongoose';

import Attraction from '../models/attraction.js'; // Import Attraction
import Accommodation from '../models/accommodation.js'; // Import Accommodation
import FoodService from '../models/foodService.js'; // Import FoodService

export const getUserFavoritesWithDetails = async (req, res) => {
  const { userId, type } = req.query;

  try {
    // Kiểm tra loại hợp lệ
    const validTypes = ['attraction', 'accommodation', 'foodService'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid type parameter' });
    }

    // Tìm user và populate trường liên quan
    const user = await userModel
      .findById(userId)
      .populate({
        path: `favorites.${type}`, // Populate theo type
        model: getModelByType(type), // Xác định model dựa trên type
      });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Lấy danh sách yêu thích tuỳ thuộc vào `type`
    const favorites = user.favorites[type];
    return res.status(200).json({ success: true, favorites });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Hàm trả về model dựa trên type
const getModelByType = (type) => {
  switch (type) {
    case 'attraction':
      return Attraction;
    case 'accommodation':
      return Accommodation;
    case 'foodService':
      return FoodService;
    default:
      throw new Error('Invalid type for model mapping');
  }
};


// Import passport
const handlegetInfoById = async (req, res, model) => {
  const id = req.body.userId;
  console.log(id);
  try {
    const user = await model.findById(id);
    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy người dùng." });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
  }
}
// Helper function to create JWT
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET,); // Token expires in 1 hour
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
    const user = await model.findOne({ email });

    if (!user) {
      const roleMessage = requiredRole ? `với vai trò ${requiredRole} ` : "";
      return res.json({
        success: false,
        message: `Người dùng không tồn tại${roleMessage}.`,
      });
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
    return res.json({
      success: false,
      message: "Mật khẩu phải ít nhất 8 ký tự.",
    });
  }

  try {
    // Check if a user with the same email and role already exists
    const existingUser = await model.findOne({ email, roles: userRole });
    if (existingUser) {
      return res.json({
        success: false,
        message: "Người dùng đã tồn tại với vai trò này.",
      });
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
      phone_number: "",
      avatar: "https://t4.ftcdn.net/jpg/00/65/77/27/360_F_65772719_A1UV5kLi5nCEWI0BNLLiFaBPEkUbv5Fv.jpg",
      status: "active" // Initialize roles array with the specified role\
    });

    const savedUser = await newUser.save();

    // Create JWT token
    const token = createToken(savedUser._id);

    res.json({
      success: true,
      token,
      message: "Đăng ký thành công.",
      user: savedUser
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Đã xảy ra lỗi máy chủ 23423452345." });
  }
};

const loginWithGoogle = async (req, res) => {
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res);
};

// Google callback route (Redirect-based)
const googleCallback = async (req, res) => {
  passport.authenticate(
    "google",
    { failureRedirect: "/login" },
    async (err, user, info) => {
      if (err || !user) {
        return res
          .status(401)
          .json({ success: false, message: "Đăng nhập không thành công." });
      }

      // Kiểm tra vai trò của người dùng
      if (!user.roles.includes("user")) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Chỉ người dùng mới có thể đăng nhập.",
          });
      }

      // Create JWT token
      const token = createToken(user._id);

      // Redirect hoặc gửi token về frontend
      res.redirect(`/auth/success?token=${token}`);
    }
  )(req, res);
};

// New function for token-based Google login
const googleSignIn = async (req, res) => {
  const { tokenId } = req.body;

  if (!tokenId) {
    return res
      .status(400)
      .json({ success: false, message: "Token không hợp lệ." });
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

    res.json({
      success: true,
      token,
      message: "Đăng nhập Google thành công.",
      user,
    });
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
  await handleLogin(req, res, adminModel, "admin"); // Require 'admin' role
};

const registerUser = async (req, res) => {
  await handleRegister(req, res, userModel, "user"); // Register as 'user'
};

const registerPartner = async (req, res) => {
  await handleRegister(req, res, partnerModel, "partner"); // Register as 'partner'
};
const registerAdmin = async (req, res) => {
  await handleRegister(req, res, adminModel, "admin"); // Require 'admin' role
};

const getUserById = async (req, res) => {
  await handlegetInfoById(req, res, userModel);
}

const getPartnerById = async (req, res) => {
  await handlegetInfoById(req, res, partnerModel);
}

const getAdminById = async (req, res) => {
  await handlegetInfoById(req, res, adminModel);
}

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const getAllPartners = async (req, res) => {
  try {
    const users = await partnerModel.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUserOrPartner = async (req, res) => {
  const { type, name, password, address, date_of_birth, gender, avatar, status } = req.body;
  const id = req.params.id;
  const updates = {};

  if (name) updates.name = name;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    updates.password = await bcrypt.hash(password, salt);
  }
  if (address) updates.address = address;
  if (date_of_birth) updates.date_of_birth = date_of_birth;
  if (gender) updates.gender = gender;
  if (avatar) updates.avatar = avatar;
  if (status) updates.status = status;

  if (type === "user") {
    try {
      // Tìm người dùng theo ID và cập nhật thông tin
      const user = await userModel.findByIdAndUpdate(id, updates, { new: true });

      if (!user) {
        return res.status(404).json({ success: false, message: "Người dùng không tồn tại." });
      }

      res.json({
        success: true,
        message: "Cập nhật thông tin thành công.",
        user
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Đã xảy ra lỗi máy chủ." });
    }
  }
  else if (type === "partner") {
    try {
      // Tìm người dùng theo ID và cập nhật thông tin
      const user = await partnerModel.findByIdAndUpdate(id, updates, { new: true });

      if (!user) {
        return res.status(404).json({ success: false, message: "Parner không tồn tại." });
      }

      res.json({
        success: true,
        message: "Cập nhật thông tin thành công.",
        user
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Đã xảy ra lỗi máy chủ." });
    }
  }
};

const addtoWishlist = async (req, res) => {
  const { userId } = req.params; // Lấy userId từ params
  const { type, itemId, action } = req.query; // Lấy type, itemId, and action từ query

  try {
    const validTypes = ["schedule", "accommodation", "attraction", "foodService"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${validTypes.join(", ")}`
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if item already exists in the wishlist
    const itemIndex = user.favorites[type].findIndex(
      (favoriteId) => favoriteId.toString() === itemId
    );

    if (action === "add") {
      if (itemIndex !== -1) {
        return res.status(400).json({
          success: false,
          message: "Item already exists in the wishlist"
        });
      }
      user.favorites[type].push(new mongoose.Types.ObjectId(itemId));

    } else if (action === "remove") {
      if (itemIndex === -1) {
        return res.status(400).json({
          success: false,
          message: "Item not found in the wishlist"
        });
      }
      user.favorites[type].splice(itemIndex, 1); // Remove the item
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'add' or 'remove'"
      });
    }

    await user.save();
    return res.status(200).json({
      success: true,
      message: `Item ${action === "add" ? "added to" : "removed from"} wishlist successfully`,
      favorites: user.favorites
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export {
  loginUser,
  registerUser,
  loginPartner,
  loginAdmin,
  registerPartner,
  loginWithGoogle,
  googleCallback,
  googleSignIn,
  registerAdmin,
  getAllUsers,
  getAllPartners,
  updateUserOrPartner, addtoWishlist,
  getUserById, getPartnerById, getAdminById // Export the new function
};



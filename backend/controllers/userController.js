// controllers/authController.js

import bcrypt from "bcrypt";
import cloudinary from "cloudinary";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import validator from "validator";
import { passport } from "../config/passport.js"; // Import passport
import { uploadToCloudinaryV2 } from "../controllers/videoController.js";
import adminModel from "../models/admin.js";
import partnerModel from "../models/partner.js";
import userModel from "../models/user.js";

import Accommodation from "../models/accommodation.js"; // Import Accommodation
import Attraction from "../models/attraction.js"; // Import Attraction
import FoodService from "../models/foodService.js"; // Import FoodService

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const getUserFavoritesWithDetails = async (req, res) => {
  const { userId, type, city } = req.query;

  try {
    // Kiểm tra loại hợp lệ
    const validTypes = ["attraction", "accommodation", "foodService"];
    if (!validTypes.includes(type)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid type parameter" });
    }

    // Tìm user và populate trường liên quan
    const user = await userModel.findById(userId).populate({
      path: `favorites.${type}`,
      model: getModelByType(type),
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Lấy danh sách yêu thích tuỳ thuộc vào `type`
    const favorites = user.favorites[type];
    return res.status(200).json({ success: true, favorites });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Hàm trả về model dựa trên type
const getModelByType = (type) => {
  switch (type) {
    case "attraction":
      return Attraction;
    case "accommodation":
      return Accommodation;
    case "foodService":
      return FoodService;
    default:
      throw new Error("Invalid type for model mapping");
  }
};

// Import passport
const handlegetInfoById = async (req, res, model) => {
  const id = req.params.id ? req.params.id : req.body.userId;
  try {
    const user = await model.findById(id);
    if (!user) {
      return res.json({
        success: false,
        message: "Không tìm thấy người dùng.",
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
  }
};
const handlegetInfoByIdHaveFollower = async (req, res, model) => {
  const id = req.params.id ? req.params.id : req.body.userId;
  try {
    const user = await model.findById(id).populate(['follower', 'following']);
    if (!user) {
      return res.json({
        success: false,
        message: "Không tìm thấy người dùng.",
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
  }
};
// Helper function to create JWT
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET); // Token expires in 1 hour
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

    if (user.status === "blocked") {
      return res.json({
        success: false,
        message: "Tài khoản đã bị khóa , liên hệ admin để giải quyết.",
      });
    }

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
    // Kiểm tra email đã tồn tại chưa (không quan tâm đến role)
    const emailExists = await model.findOne({ email });
    if (emailExists) {
      return res.json({
        success: false,
        message: "Email này đã được đăng ký, vui lòng sử dụng email khác.",
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
      address: "",
      date_of_birth: "",
      gender: "",
      phone_number: "",
      avatar: "https://media.istockphoto.com/id/1196083861/vi/vec-to/b%E1%BB%99-bi%E1%BB%83u-t%C6%B0%E1%BB%A3ng-%C4%91%E1%BA%A7u-ng%C6%B0%E1%BB%9Di-%C4%91%C3%A0n-%C3%B4ng-%C4%91%C6%A1n-gi%E1%BA%A3n.jpg?s=612x612&w=0&k=20&c=7juGotIovn0c2KFGhZ_DcEqpfiSyYl-zz2ty9XYnYNs=",
      status: "active", // Initialize roles array with the specified role\
    });

    const savedUser = await newUser.save();

    // Create JWT token
    const token = createToken(savedUser._id);

    res.json({
      success: true,
      token,
      message: "Đăng ký thành công.",
      user: savedUser,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Đã xảy ra lỗi máy chủ." });
  }
};

const loginWithGoogle = async (req, res) => {
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res);
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `https://vcompass-backend.onrender.com/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Lấy thông tin người dùng từ profile mà Google trả về
        const { email, name } = profile._json;

        // Tìm người dùng trong database dựa trên email
        let user = await userModel.findOne({ email });

        if (!user) {
          // Nếu người dùng chưa tồn tại, tạo người dùng mới
          user = await userModel.create({
            name: name || "Người dùng Google",
            email: email,
            password: "", // Không cần mật khẩu khi dùng Google OAuth
            roles: ["user"], // Đặt vai trò mặc định
            avatar: profile.photos?.[0]?.value || "default_avatar.png",
            status: "active",
          });
        }

        // Gọi `done` để chuyển tiếp người dùng
        return done(null, user);
      } catch (error) {
        console.error("Google Strategy Error:", error);
        return done(error, null);
      }
    }
  )
);

// Cấu hình lưu trữ người dùng vào session
passport.serializeUser((user, done) => {
  done(null, user.id); // Chỉ lưu user ID vào session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user); // Gắn lại user vào req.user
  } catch (error) {
    done(error, null);
  }
});

const googleCallback = async (req, res) => {
  passport.authenticate(
    "google",
    { failureRedirect: "https://vcompass.onrender.com/" },
    async (err, user, info) => {
      if (err || !user) {
        return res.redirect(`https://vcompass.onrender.com/`);
      }
      // Create JWT token
      const token = createToken(user._id);

      // Redirect hoặc gửi token về frontend
      res.redirect(`https://vcompass.onrender.com/auth/success?token=${token}`);
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
        return res
          .status(403)
          .json({
            success: false,
            message: "Chỉ người dùng mới có thể đăng nhập.",
          });
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
        avatar: "https://media.istockphoto.com/id/1196083861/vi/vec-to/b%E1%BB%99-bi%E1%BB%83u-t%C6%B0%E1%BB%A3ng-%C4%91%E1%BA%A7u-ng%C6%B0%E1%BB%9Di-%C4%91%C3%A0n-%C3%B4ng-%C4%91%C6%A1n-gi%E1%BA%A3n.jpg?s=612x612&w=0&k=20&c=7juGotIovn0c2KFGhZ_DcEqpfiSyYl-zz2ty9XYnYNs=",
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
};

const getUserByIdHaveFollower = async (req, res) => {
  await handlegetInfoByIdHaveFollower(req, res, userModel);
};

const getPartnerById = async (req, res) => {
  await handlegetInfoById(req, res, partnerModel);
};

const getAdminById = async (req, res) => {
  await handlegetInfoById(req, res, adminModel);
};

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

const updateUserOrPartnerOrAdmin = async (req, res) => {
  const {
    type,
    name,
    password,
    address,
    date_of_birth,
    gender,
    phone_number,
    status,
  } = req.body;
  const { id } = req.params;
  const updates = {};
  const isUpdateStatus = status !== undefined;

  try {
    // Lấy thông tin người dùng hiện tại để kiểm tra ảnh cũ
    const currentUser = await (type === "user"
      ? userModel.findById(id)
      : type === "partner"
      ? partnerModel.findById(id)
      : type === "admin"
      ? adminModel.findById(id)
      : null);

    if (!currentUser) {
      return res
        .status(404)
        .json({ success: false, message: `${type} not found.` });
    }

    if (req.files && req.files.image && req.files.image.length > 0) {
      const avatarBuffer = req.files.image[0].buffer;

      if (currentUser.avatar) {
        try {
          await cloudinary.v2.uploader.destroy(currentUser.avatar, {
            resource_type: "image",
          });
        } catch (error) {
          console.error("Error deleting old avatar:", error);
        }
      }

      try {
        const result = await uploadToCloudinaryV2(avatarBuffer, "avatars", [
          { width: 800, crop: "scale" },
          { quality: "auto" },
        ]);
        console.log(result);
        updates.avatar = result.secure_url;
      } catch (error) {
        console.error("Error uploading new avatar:", error);
        return res
          .status(500)
          .json({
            success: false,
            message: "Error uploading avatar",
            error: error.message,
          });
      }
    }

    // Thêm các trường khác vào đối tượng cập nhật
    if (name) updates.name = name;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }
    if (address) updates.address = address;
    if (date_of_birth && !isNaN(new Date(date_of_birth).getTime())) {
      updates.date_of_birth = new Date(date_of_birth)
        .toISOString()
        .split("T")[0];
    } else {
      console.error("Invalid date_of_birth:", date_of_birth);
      // hoặc xử lý fallback tùy bạn
    }
    if (gender) updates.gender = gender;
    if (status) updates.status = status;
    if (phone_number) updates.phone_number = phone_number;
    updates.updated_at = new Date().toISOString();

    // Cập nhật thông tin người dùng
    const updatedUser = await (type === "user"
      ? userModel.findByIdAndUpdate(id, updates, { new: true })
      : type === "partner"
      ? partnerModel.findByIdAndUpdate(id, updates, { new: true })
      : type === "admin"
      ? adminModel.findByIdAndUpdate(id, updates, { new: true })
      : null);

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: `${type} not found.` });
    }

    if (isUpdateStatus && updatedUser.status === "blocked") {
      
      global.io.emit(`${updatedUser._id}status`, updatedUser);
    }

    res.json({
      success: true,
      message: "Update successful.",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error occurred." });
  }
};

const addtoWishlist = async (req, res) => {
  const { userId } = req.params; // Lấy userId từ params
  const { type, itemId, action } = req.query; // Lấy type, itemId, and action từ query

  try {
    const validTypes = [
      "schedule",
      "accommodation",
      "attraction",
      "foodService",
    ];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
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
          message: "Item already exists in the wishlist",
        });
      }
      user.favorites[type].push(new mongoose.Types.ObjectId(itemId));
    } else if (action === "remove") {
      if (itemIndex === -1) {
        return res.status(400).json({
          success: false,
          message: "Item not found in the wishlist",
        });
      }
      user.favorites[type].splice(itemIndex, 1); // Remove the item
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'add' or 'remove'",
      });
    }

    await user.save();
    return res.status(200).json({
      success: true,
      message: `Item ${
        action === "add" ? "added to" : "removed from"
      } wishlist successfully`,
      favorites: user.favorites,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const checkPassword = async (req, res) => {
  try {
    const { password, type, id } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    let user = {};
    if (type === "user") {
      user = await userModel.findOne({ _id: id });
    } else if (type === "partner") {
      user = await partnerModel.findOne({ _id: id });
    } else if (type === "admin") {
      user = await adminModel.findOne({ _id: id });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} not found`,
      });
    }

    // So sánh mật khẩu đầu vào với mật khẩu lưu trữ
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password is correct",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const followOrUnFollowUser = async (req, res) => {
  const { userId } = req.body;
  const { otherUserId, action } = req.query;

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const otherUser = await userModel.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "Other user not found",
      });
    }

    if (action === "add") {
      if (!user.following.includes(otherUserId)) {
        user.following.push(new mongoose.Types.ObjectId(otherUserId));
        otherUser.follower.push(new mongoose.Types.ObjectId(userId));
      }
    } else if (action === "remove") {
      user.following = user.following.filter(
        (id) => id.toString() !== otherUserId
      );
      otherUser.follower = otherUser.follower.filter(
        (id) => id.toString() !== userId
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'add' or 'remove'",
      });
    }
    await user.save();
    await otherUser.save();
    return res.status(200).json({
      success: true,
      message: `Đã ${action === "add" ? "theo dõi" : "bỏ theo dõi"} thành công`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  addtoWishlist,
  checkPassword,
  followOrUnFollowUser, // Export the new function
  getAdminById,
  getAllPartners,
  getAllUsers,
  getPartnerById,
  getUserById, getUserByIdHaveFollower, googleCallback,
  googleSignIn,
  loginAdmin,
  loginPartner,
  loginUser,
  loginWithGoogle,
  registerAdmin,
  registerPartner,
  registerUser,
  updateUserOrPartnerOrAdmin
};


// config/passport.js

import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import userModel from "../models/user.js"; // Model người dùng
import 'dotenv/config';

// Cấu hình chiến lược Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Tìm người dùng theo ID từ Google
        let user = await userModel.findOne({ googleId: profile.id });
        if (!user) {
            // Nếu không tìm thấy, tạo người dùng mới
            user = await userModel.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                password: "", // Hoặc băm mật khẩu mặc định nếu cần
                role: "user" // Hoặc vai trò khác tùy theo nhu cầu
            });
        }
        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

// Xác thực người dùng với phiên
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export { passport };

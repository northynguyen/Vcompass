import mongoose, { Schema, model } from "mongoose";


const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        // Removed unique: true to allow duplicate emails across roles
    },
    phone_number: {
        type: String,
        // unique: true,
    },
    address: {
        type: String,
    },
    avatar: {
        type: String,

    },
    date_of_birth: {
        type: Date,

    },
    gender: {
        type: String,
        enum: ['male', 'female', ''],
        default: '',
    },

    password: {
        type: String,
        minlength: 8,
    },

    status: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    favorites: {
        schedule: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "schedule"
        }],
        accommodation: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "accommodation"
        }],
        attraction: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "attraction"
        }],
        foodService: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "foodservice"
        }],
    }
}, { timestamps: true });
const userModel = mongoose.models.User || model("user", UserSchema);

export default userModel;

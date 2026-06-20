import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role : {
        type: String,
        required: true,
        default: "User",
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
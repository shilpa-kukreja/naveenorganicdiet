// import mongoose from "mongoose";

// const adminUserSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     password: {
//         type: String,
//         required: true,
//     },
//     role : {
//         type: String,
//         required: true,
//         default: "admin",
//     },
//     isAdmin: {
//         type: Boolean,
//         required: true,
//         default: false,
//     },
// });

// const AdminUser = mongoose.models.AdminUser || mongoose.model("AdminUser", adminUserSchema);
// export default AdminUser;





import mongoose from "mongoose";

const adminUserSchema = new mongoose.Schema({
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
    phone: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        required: true,
        enum: ["admin", "team_member"],
        default: "team_member",
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true
});

const AdminUser = mongoose.models.AdminUser || mongoose.model("AdminUser", adminUserSchema);
export default AdminUser;
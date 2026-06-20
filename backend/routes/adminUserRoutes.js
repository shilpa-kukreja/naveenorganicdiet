import express from "express";
import {
    createAdminUser,
    getAllAdminUsers,
    getAdminUserById,
    updateAdminUser,
    deleteAdminUser,
    loginAdmin,
    getCurrentAdminProfile,
    changePassword
} from "../controllers/adminUserControllers.js";
import { authMiddleware, adminMiddleware, teamMemberMiddleware } from "../middleware/adminAuthMiddleware.js";

const adminUserRouter = express.Router();

// Public routes
adminUserRouter.post("/login", loginAdmin);

// Protected routes (both admin and team members)
adminUserRouter.get("/profile", authMiddleware, getCurrentAdminProfile);
adminUserRouter.put("/change-password", authMiddleware, changePassword);

// Admin only routes
adminUserRouter.post("/", authMiddleware, adminMiddleware, createAdminUser);
adminUserRouter.get("/", authMiddleware, adminMiddleware, getAllAdminUsers);
adminUserRouter.get("/:id", authMiddleware, adminMiddleware, getAdminUserById);
adminUserRouter.put("/:id", authMiddleware, adminMiddleware, updateAdminUser);
adminUserRouter.delete("/:id", authMiddleware, adminMiddleware, deleteAdminUser);

export default adminUserRouter;
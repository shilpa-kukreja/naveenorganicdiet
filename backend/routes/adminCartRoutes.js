// routes/adminRoutes.js
import express from "express";
import {
  createTestCarts,
  deleteAbandonedCart,
  exportAbandonedCarts,
  getAbandonedCartStats,
  getAllAbandonedCarts,
  getCartDetails,
  markAsRestored,
  sendManualReminder
} from "../controllers/adminCartController.js";

const adminRouter = express.Router();

// ✅ NO AUTHENTICATION MIDDLEWARE - सीधे access

// Test routes
adminRouter.post("/test/create-dummy", createTestCarts);

// Stats & Export
adminRouter.get("/stats", getAbandonedCartStats);
adminRouter.get("/export/data", exportAbandonedCarts);

// Main routes
adminRouter.get("/", getAllAbandonedCarts);
adminRouter.get("/:id", getCartDetails);
adminRouter.post("/:id/remind", sendManualReminder);
adminRouter.put("/:id/restore", markAsRestored);
adminRouter.delete("/:id", deleteAbandonedCart);

export default adminRouter;
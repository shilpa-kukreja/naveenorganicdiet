// routes/abandonedCartRoutes.js
import express from "express";
import { 
  saveAbandonedCart, 
  sendAbandonedCartReminder,
  getCartByToken,
  sendTestReminder,
  markCartAsRestored
} from "../controllers/abandonedCartController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const abandonedCartRouter = express.Router();

// Save cart (authenticated users only)
abandonedCartRouter.post("/save", authMiddleware, saveAbandonedCart);
// Send reminder manually (for testing)
abandonedCartRouter.post("/reminder/:cartId", sendAbandonedCartReminder);

// Send manual reminder (admin/testing)
abandonedCartRouter.post("/:cartId/remind", authMiddleware, sendAbandonedCartReminder);

// Get cart by token (public)
abandonedCartRouter.get("/token/:token", getCartByToken);
// Mark cart as restored
abandonedCartRouter.post("/restore/:token", markCartAsRestored);

// Test reminder route
abandonedCartRouter.post("/test-reminder/:cartId", sendTestReminder);

export default abandonedCartRouter;
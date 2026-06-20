import express from "express";
import { allOrders,  placeOrderCOD,  placeOrderRazorpay, updateOrderStatusCOD, updateStatus, userOrders, userSingleOrder, verifyRazorpay } from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/adminAuthMiddleware.js";
import { getOrderAnalytics, getUserAnalytics } from "../controllers/orderAnalyticsController.js";
import { requestReturn } from "../controllers/returnController.js";




const orderRoutes = express.Router();

orderRoutes.post("/cod",authMiddleware, placeOrderCOD);
orderRoutes.post("/razorpay",authMiddleware, placeOrderRazorpay);
orderRoutes.post("/verify",authMiddleware, verifyRazorpay);
orderRoutes.get("/all", allOrders);
orderRoutes.post("/user", userOrders);

// orderRoutes.get("/:id", userSingleOrder);
orderRoutes.get('/single-order/:id',authMiddleware, userSingleOrder);

orderRoutes.put("/status", updateStatus);
orderRoutes.post("/cod-payment-status", updateOrderStatusCOD);

// Add analytics routes
orderRoutes.get("/analytics/all", getOrderAnalytics);
orderRoutes.get("/analytics/user/:userId", getUserAnalytics);
orderRoutes.post('/request-return', authMiddleware,requestReturn );


export default orderRoutes;

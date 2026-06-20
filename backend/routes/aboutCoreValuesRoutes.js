import express from "express";
import { bulkUpdateOrders, createCoreValue, deleteCoreValue, getActiveCoreValues, getAllCoreValues, getCoreValueById, toggleActiveStatus, updateCoreValue } from "../controllers/aboutCoreValueController.js";






const aboutCoreValueRouter = express.Router();

// Public routes
aboutCoreValueRouter.get("/active", getActiveCoreValues);
aboutCoreValueRouter.get("/:id", getCoreValueById);

// Admin routes
aboutCoreValueRouter.get("/", getAllCoreValues);
aboutCoreValueRouter.post("/", createCoreValue);
aboutCoreValueRouter.put("/:id", updateCoreValue);
aboutCoreValueRouter.delete("/:id", deleteCoreValue);
aboutCoreValueRouter.put("/:id/toggle-active", toggleActiveStatus);
aboutCoreValueRouter.put("/:id/order", updateCoreValue);
aboutCoreValueRouter.put("/bulk/orders", bulkUpdateOrders);

export default aboutCoreValueRouter;
import express from "express";
import { addBanner, bulkUpdateOrders, deleteBanner, getActiveBannerByPage, getAllBanners, getBannerById, updateBanner, updateBannerOrder, updateBannerStatus } from "../controllers/bannerController.js";
import { upload } from "../middleware/bannerMiddleware.js";







const bannerRouter = express.Router();
// Public routes
bannerRouter.get("/page/:pageType",  getActiveBannerByPage);
bannerRouter.get("/:id", getBannerById);

// Admin routes
bannerRouter.get("/", getAllBanners);
bannerRouter.post("/", upload.single("image"), addBanner);
bannerRouter.put("/:id", upload.single("image"), updateBanner);
bannerRouter.put("/:id/status", updateBannerStatus);
bannerRouter.put("/:id/order", updateBannerOrder);
bannerRouter.delete("/:id", deleteBanner);
bannerRouter.put("/bulk/orders", bulkUpdateOrders);

export default  bannerRouter ;
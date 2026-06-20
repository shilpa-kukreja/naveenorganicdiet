import express from "express";
import { 
  addmainbanner, 
  getAllMainBanners, 
  deleteMainBanner, 
  updateMainBannerStatus 
} from "../controllers/addmainbannerController.js";
import { upload } from "../middleware/mainbannerMiddleware.js";

const mainbannerRouter = express.Router();

mainbannerRouter.post("/create", upload.single("image"), addmainbanner);
mainbannerRouter.get("/all", getAllMainBanners);
mainbannerRouter.delete("/delete/:id", deleteMainBanner);
mainbannerRouter.put("/status/:id", updateMainBannerStatus);
mainbannerRouter.put("/update/:id", upload.single("image"), updateMainBannerStatus);

export default mainbannerRouter;
import express from "express";
import { 
    addpromotionalBanner, 
    deletepromotionalbanner, 
    getpromotionalbanners, 
    updatepromotionalbannerimage, 
    updatepromotionalbannerstatus 
} from "../controllers/promotionalbannerController.js";
import { upload } from "../middleware/promotionalbannerMiddleware.js";

const promotionalbannerRoutes = express.Router();

promotionalbannerRoutes.post("/add", upload.single("image"), addpromotionalBanner);
promotionalbannerRoutes.get("/all", getpromotionalbanners);
promotionalbannerRoutes.delete("/delete/:id", deletepromotionalbanner);
promotionalbannerRoutes.put("/toggle-status/:id", updatepromotionalbannerstatus); // FIXED: No image upload for status toggle
promotionalbannerRoutes.put("/update-image/:id", upload.single("image"), updatepromotionalbannerimage); // FIXED: Changed route name and added upload middleware

export default promotionalbannerRoutes;
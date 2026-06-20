import express from "express";
import { createAboutSection, deleteAboutSection, getActiveAboutSection, getAllAboutSections, toggleActiveStatus, updateAboutSection, updateSectionOrder } from "../controllers/aboutController.js";
import { upload } from "../middleware/aboutMiddleware.js";


const aboutRouter = express.Router();



aboutRouter.get("/active", getActiveAboutSection);

// Admin routes
aboutRouter.get("/", getAllAboutSections);
aboutRouter.post("/", upload.single("image"), createAboutSection);
aboutRouter.put("/:id", upload.single("image"), updateAboutSection);
aboutRouter.delete("/:id", deleteAboutSection);
aboutRouter.put("/:id/toggle-active", toggleActiveStatus);
aboutRouter.put("/:id/order", updateSectionOrder);

export default aboutRouter;
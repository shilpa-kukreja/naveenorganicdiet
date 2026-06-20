import express from "express";
import { upload } from "../middleware/categoryMiddleware.js";
import {
    createcategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getCategoryBySlug
} from "../controllers/categoryControllers.js";

const categoryRouter = express.Router();

categoryRouter.post("/", upload.single("image"), createcategory);
categoryRouter.get("/get", getCategories);
categoryRouter.get("/:id", getCategoryById);
categoryRouter.put("/:id", upload.single("image"), updateCategory);
categoryRouter.delete("/:id", deleteCategory);
categoryRouter.get("/slug/:slug", getCategoryBySlug);


export default categoryRouter;

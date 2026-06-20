import express from "express";
import { createTestimonial, deleteTestimonial, getTestimonials, updateTestimonial } from "../controllers/testimonialController.js";



const testimonialRouter = express.Router();

testimonialRouter.post("/create", createTestimonial);  
testimonialRouter.get("/all", getTestimonials);
testimonialRouter.delete("/delete/:id", deleteTestimonial);
testimonialRouter.put("/update/:id", updateTestimonial);

export default testimonialRouter;
import express from "express";
import { addBlog, deleteBlog, getBlogById, getBlogs, updateBlog } from "../controllers/blogControllers.js";
import { upload } from "../middleware/blogMulter.js";




const blogRouter =express.Router();

blogRouter.post('/blog',upload.single('blogImg'), addBlog);
blogRouter.get('/blogs', getBlogs);
blogRouter.get('/blog/:id', getBlogById);
blogRouter.put('/blog/:id',upload.single('blogImg'), updateBlog);
blogRouter.delete('/blog/:id', deleteBlog);

export default blogRouter;
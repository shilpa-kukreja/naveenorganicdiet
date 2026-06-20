
import blogModel from "../models/blogModels.js";


export const addBlog = async (req, res) => {
    try {
        const blogdata=req.body;
        if(req.file){
            blogdata.blogImg=`/uploads/blogs/${req.file.filename}`;
        }
        const newBlog=new blogModel(blogdata);
        await newBlog.save();
        if(newBlog){
            return res.status(201).json({message:"Blog added successfully"});
        }
    } catch (error) {
        console.error("Error in addBlog:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


export const getBlogs = async (req, res) => {
    try {
        const blogs = await blogModel.find().sort({ createdAt: -1 });
        return res.status(200).json(blogs);
    } catch (error) {
        console.error("Error in getBlogs:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


export const deleteBlog = async (req, res) => {
    try {
        await blogModel.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        console.error("Error in deleteBlog:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}



export const getBlogById=async(req,res)=>{
    try {
        const blog=await blogModel.findById(req.params.id);
        return res.status(200).json(blog);
    } catch (error) {
        console.error("Error in getBlogById:",error);
        return res.status(500).json({message:"Internal Server Error"});
    }
}




export const updateBlog=async(req,res)=>{
    try {
        const blogdata=req.body;
        if(req.file){
            blogdata.blogImg=`/uploads/blogs/${req.file.filename}`;
        }
        const updatedBlog=await blogModel.findByIdAndUpdate(req.params.id,blogdata,{new:true});
        return res.status(200).json(updatedBlog);
    } catch (error) {
        console.error("Error in updateBlog:",error);
        return res.status(500).json({message:"Internal Server Error"});
    }
}

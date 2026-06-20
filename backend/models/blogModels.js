import mongoose from "mongoose";

const blogSchema=new mongoose.Schema({
    blogImg:{type:String,required:true},
    blogName:{type:String,required:true},
    blogSlug:{type:String,required:true},
    blogDate:{type:String,required:true},
    blogDetail:{type:String,required:true},
    metaTitle:{type:String},
    metaDescription:{type:String},
    metatag:{type:String},
},
{timestamps:true}
)
const blogModel=mongoose.models.Blog||mongoose.model("Blog",blogSchema);
export default blogModel;
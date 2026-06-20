import mongoose from "mongoose";


const subscriberSchema=new mongoose.Schema({
    email:{type:String,required:true,unique:true},
},
{timestamps:true}
)
const subscriberModel=mongoose.models.Subscriber||mongoose.model("Subscriber",subscriberSchema);
export default subscriberModel;
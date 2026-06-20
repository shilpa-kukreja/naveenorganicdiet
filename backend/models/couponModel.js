import mongoose from "mongoose";


const couponSchema = new mongoose.Schema({
   couponCode:{type:String,required:true,unique:true},
   discount:{type:Number,required:true},
   discounttype:{type:String,required:true},
   expiryDate:{type:Date,required:true},
   minPurchaseAmount:{type:Number, default:0},
   maxDiscountAmount:{type:Number,},
   isActive:{type:Boolean,required:true},
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });
const couponModel = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

export default couponModel;
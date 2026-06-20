import mongoose from "mongoose";
import categoryModel from "./categoryModel.js";


const variantSchema = new mongoose.Schema({
  pack: { type: String },
  price: { type: Number,  },
  discountPrice: { type: Number },
  stock: { type: Number, default: 0 }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  shortDescription: { type: String, required: true },
  description: { type: String, required: true },
  additionalInformation: { type: String, required: true },
  thumbImg: { type: String, required: true },
  galleryImg: [{ type: String, required: true }],
  stock: { type: Number, default: 0 },
  category: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  sku: { type: String },
  productType: { type: String,required: true },
  pack: { type: String },
  price: { type: Number, required: true },
  discountPrice: { type: Number, required: true },
  variant: [variantSchema],
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  width: { type: Number },
  height: { type: Number },
  weight: { type: Number },
  length: { type: Number },
  metatitle: { type: String },
  metadescription: { type: String }
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;

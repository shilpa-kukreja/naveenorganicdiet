import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true},
    slug: { type: String, required: true},
    image: { type: String, required: true},
}, { timestamps: true });

const categoryModel = mongoose.models.Category || mongoose.model("Category", categorySchema);
export default categoryModel;
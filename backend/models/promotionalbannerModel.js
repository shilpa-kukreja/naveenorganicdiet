import mongoose from "mongoose";


const promotionalBannerSchema = new mongoose.Schema({
    image: { type: String, required: true },
    status: { type: Boolean, default: true },
}, { timestamps: true });

const PromotionalBannerModel = mongoose.models.PromotionalBanner || mongoose.model("PromotionalBanner", promotionalBannerSchema);
export default PromotionalBannerModel;
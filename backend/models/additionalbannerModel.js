import mongoose from "mongoose";


const additionalBannerSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    status: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const AdditionalBannerModel = mongoose.models.AdditionalBanner || mongoose.model("AdditionalBanner", additionalBannerSchema);

export default AdditionalBannerModel;

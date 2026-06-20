import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true
    },
    image: { 
      type: String, 
      required: true 
    },
    pageType: {
      type: String,
      enum: ['about', 'contact', 'home', 'other'],
      default: 'about',
      required: true
    },
    status: { 
      type: Boolean, 
      default: true 
    },
    order: { 
      type: Number, 
      default: 0 
    },
    description: {
      type: String,
      default: ''
    },
    buttonText: {
      type: String,
      default: ''
    },
    buttonLink: {
      type: String,
      default: ''
    }
  },
  { 
    timestamps: true 
  }
);

// Index for better performance
bannerSchema.index({ pageType: 1, status: 1, order: 1 });

const Banner = mongoose.models.Banner || mongoose.model("Banner", bannerSchema);
export default Banner;
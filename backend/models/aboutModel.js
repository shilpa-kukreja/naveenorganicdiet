import mongoose from "mongoose";

const aboutSectionSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, "Title is required"],
      trim: true
    },
    content: { 
      type: String, 
      required: [true, "Content is required"] 
    },
    image: { 
      type: String, 
      required: [true, "Image is required"] 
    },
    points: [{
      text: { type: String, required: true },
      order: { type: Number, default: 0 }
    }],
    isActive: { 
      type: Boolean, 
      default: true 
    },
    order: { 
      type: Number, 
      default: 0 
    }
  },
  { 
    timestamps: true 
  }
);


aboutSectionSchema.index({ order: 1, isActive: 1 });

const AboutSection = mongoose.models.AboutSection || mongoose.model("AboutSection", aboutSectionSchema);
export default AboutSection;
import mongoose from "mongoose";

const coreValueSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, "Title is required"],
      trim: true
    },
    description: { 
      type: String, 
      required: [true, "Description is required"] 
    },
    icon: { 
      type: String, 
      required: [true, "Icon is required"],
      default: "🎯"
    },
    bgColor: { 
      type: String, 
      default: "bg-amber-50"
    },
    borderColor: { 
      type: String, 
      default: "border-amber-500"
    },
    iconBg: { 
      type: String, 
      default: "bg-amber-100"
    },
    order: { 
      type: Number, 
      default: 0 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    category: {
      type: String,
      enum: ['mission', 'vision', 'values', 'work', 'other'],
      default: 'mission'
    }
  },
  { 
    timestamps: true 
  }
);

// Create index for better performance
coreValueSchema.index({ order: 1, isActive: 1, category: 1 });

const CoreValue = mongoose.models.CoreValue || mongoose.model("CoreValue", coreValueSchema);
export default CoreValue;
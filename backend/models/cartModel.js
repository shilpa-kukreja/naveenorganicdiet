import mongoose from "mongoose";

const abandonedItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priceSnapshot: {
    type: Number,
    required: true
  },
  image: String,
  productUpdatedAt: {
    type: Date,
    required: true
  }
});

const abandonedCartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    email:{
      type: String
    },
    items: [abandonedItemSchema],
    restoreToken: { 
      type: String,
      index: true 
    },
    restoreTokenExpiry: { 
      type: Date,
      index: true 
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    isRestored: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for faster queries
abandonedCartSchema.index({ restoreTokenExpiry: 1 }, { expireAfterSeconds: 0 });
abandonedCartSchema.index({ userId: 1 });
abandonedCartSchema.index({ lastActivity: 1 });

export default mongoose.model("AbandonedCart", abandonedCartSchema);
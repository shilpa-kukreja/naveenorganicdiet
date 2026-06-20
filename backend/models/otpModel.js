import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  number: { 
    type: String, 
    required: true,
    index: true // Add index for faster queries
  }, 
  otp: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  // Add collection name to avoid any conflicts
  collection: 'otps'
});

// Create TTL index separately for better control
otpSchema.index({ "createdAt": 1 }, { 
  expireAfterSeconds: 300, // 5 minutes
  background: true 
});

// Create compound index for faster lookups
otpSchema.index({ number: 1, otp: 1 }, { background: true });

const otpModel = mongoose.models.Otp || mongoose.model("Otp", otpSchema);
export default otpModel;


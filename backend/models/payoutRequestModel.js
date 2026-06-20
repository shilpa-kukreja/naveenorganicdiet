import mongoose from "mongoose";

const payoutRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  method: { type: String, enum: ["UPI", "BANK"], required: true },
  upiId: { type: String },
  bankName: { type: String },
  accountNumber: { type: String },
  ifsc: { type: String },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }
    
}, { timestamps: true });

const PayoutRequest = mongoose.models.PayoutRequest || mongoose.model("PayoutRequest", payoutRequestSchema);
export default PayoutRequest;
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderid: { type: String, unique: true, sparse: true, default: null },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name: String,
      price: Number,
      quantity: Number,
      pack: String,
      image: String,
    }
  ],
  amount: { type: Number, required: true },
  address: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address1: { type: String, required: true },
    address2: { type: String },
    addresstype: {
      type: String,
      enum: ['Home', 'Work', 'Other',],
      default: 'Home'
    },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    landmark: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  status: { type: String, default: "Order Placed" },
  paymentMethod: { type: String, required: true },
  payment: { type: Boolean, default: false },
  paymentId: { // ✅ IMPORTANT: Add this field
    type: String,
    default: ''
  },
  razorpayOrderId: { // ✅ Store Razorpay order ID
    type: String,
    default: ''
  },
  razorpayPaymentInfo: { // ✅ Store complete payment info
    type: Object,
    default: {}
  },
  paymentStatus: { // ✅ Store payment status separately
    type: String,
    enum: ['pending', 'processing', 'captured', 'failed', 'refunded'],
    default: 'pending'
  },
  walletDiscount: {
    type: Number,
    default: 0
  },
  coinsUsed: {
    type: Number,
    default: 0
  },
  referralProcessed: {
    type: Boolean,
    default: false
  },
  referralCoinsAdded: {
    type: {
      user: Number,
      referrer: Number
    },
    default: null
  },
  smsSent: {
    confirmation: { type: Boolean, default: false },
    statusUpdate: { type: Boolean, default: false }
  },
  couponCode: { type: String },
  discount: { type: Number, default: 0 },
  referralDiscount: { type: Number, default: 0 },
  commissionEarned: { type: Number, default: 0 },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'VerifiedNumber' },
  referralConfigUsed: {
    userDiscountPercent: { type: Number, default: 5 },
    referrerCommissionPercent: { type: Number, default: 5 },
  },
shipmentStatus: String,
shipmentHistory: Array,
shipmozo: {
    orderId: String,           // Shipmozo's internal order ID
    referenceId: String,       // Shipmozo reference ID
    awb: String,              // AWB number for tracking
    courier: String,          // Courier name
    trackingUrl: String,      // Tracking URL
    estimatedDelivery: Date,  // Estimated delivery date
    expectedDeliveryDate: Date,
    labelUrl: String,         // Shipping label URL
    manifestUrl: String,      // Manifest URL
    pushedAt: Date,           // When pushed to Shipmozo
    lastUpdated: Date,        // Last update timestamp
    apiResponse: Object       // Full API response for debugging
  },
  
  // Shipping status
  shippingStatus: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'UNDELIVERED', 'RETURNED'],
    default: 'PENDING'
  },
  
  // Tracking info
  trackingNumber: String,
  courier: String,
  
  // Shipment history
  shipmentHistory: [{
    status: String,
    date: Date,
    location: String,
    remark: String,
    description: String
  }],
  
  // Shipping errors log
  shippingErrors: [{
    error: String,
    response: Object,
    timestamp: Date
  }],


}, { timestamps: true });

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;

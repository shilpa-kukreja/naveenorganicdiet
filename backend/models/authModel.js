// import mongoose from "mongoose";
// import crypto from "crypto";


// const addressSchema = new mongoose.Schema(
//   {
//     fullName: { type: String, required: true },
//     email: { type: String, required: true },
//     phone: { type: String, required: true },
//     address1: { type: String, required: true },
//     address2: { type: String },
//     addresstype: {
//       type: String,
//       enum: ['Home', 'Work', 'Other',],
//       default: 'Home'
//     }
//     ,
//     city: { type: String, required: true },
//     state: { type: String, required: true },
//     postalCode: { type: String, required: true },
//     landmark: { type: String },
//     isDefault: { type: Boolean, default: false },
//   },
//   { _id: true } // ensures each address gets its own _id
// );

// const userSchema = new mongoose.Schema(
//   {
//     username: { type: String },
//     email: { type: String, unique: true },
//     number: { type: String, required: true, unique: true },
//     // New coupon referral fields with proper defaults
    
//     couponDiscountPercent: {
//       type: Number,
//       default: 10, // Default 10% discount
//       min: 5,
//       max: 50
//     },
//     couponCommissionPercent: {
//       type: Number,
//       default: 5, // Default 5% commission
//       min: 1,
//       max: 20
//     },

//     referredBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "VerifiedNumber",
//       default: null,
//     },
//     totalReferral: { type: Number, default: 0 },
//     totalCommissionEarned: { type: Number, default: 0 },
//     usedReferral: { type: Boolean, default: false },
//     img: { type: String, default: null },
//     verifiedAt: { type: Date, default: Date.now },
//     address: { type: [addressSchema], default: [] }, // array of subdocuments
//   },
//   { timestamps: true }
// );

// // Auto-generate  personal coupon code
// userSchema.pre("save", function(next) {
//  if (!this.personalCouponCode) {
//     this.personalCouponCode = `HS${crypto.randomBytes(2).toString("hex").toUpperCase()}${Date.now().toString().slice(-4)}`;
//   }
//   next();
// });

// const userModel = mongoose.models.User || mongoose.model("User", userSchema);
// export default userModel;


import mongoose from "mongoose";
import crypto from "crypto";

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address1: { type: String, required: true },
    address2: { type: String },
    addresstype: {
      type: String,
      enum: ['Home', 'Work', 'Other'],
      default: 'Home'
    },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    landmark: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    username: { type: String },
    email: { type: String, unique: true },
    number: { type: String, required: true, unique: true },
    
    // Referral fields
    referralCode: { 
      type: String, 
      unique: true,
      sparse: true // Allows null values while maintaining uniqueness
    },
    couponCode: {  // Added this missing field
      type: String,
      unique: true,
      sparse: true
    },
    couponDiscountPercent: {
      type: Number,
      default: 10,
      min: 5,
      max: 50
    },
    couponCommissionPercent: {
      type: Number,
      default: 5,
      min: 1,
      max: 20
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",  // Corrected reference
      default: null,
    },
    totalReferral: { type: Number, default: 0 },
     walletCoins: {
    type: Number,
    default: 0
  },
  referralOrderCount: {
    type: Number,
    default: 0  // Tracks how many orders this user has placed through referral
  },
    totalCommissionEarned: { type: Number, default: 0 },
    usedReferral: { type: Boolean, default: false },
    img: { type: String, default: null },
    verifiedAt: { type: Date, default: Date.now },
    address: { type: [addressSchema], default: [] },
  },
  { timestamps: true }
);

// Auto-generate referral and coupon codes
userSchema.pre("save", function(next) {
  // Generate referral code
  if (!this.referralCode) {
    this.referralCode = `REF${crypto.randomBytes(2).toString("hex").toUpperCase()}${Date.now().toString().slice(-4)}`;
  }
  
  // Generate personal coupon code
  if (!this.couponCode) {
    this.couponCode = `HS${crypto.randomBytes(2).toString("hex").toUpperCase()}${Date.now().toString().slice(-4)}`;
  }
  next();
});

const userModel = mongoose.models.User || mongoose.model("User", userSchema);
export default userModel;
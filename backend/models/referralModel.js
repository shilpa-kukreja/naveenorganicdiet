// models/referralModel.js
import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  // Existing fields
  userDiscountPercent: {
    type: Number,
    default: 5
  },
  referrerCommissionPercent: {
    type: Number,
    default: 5
  },
  maxDirectDiscountPercent: {
    type: Number,
    default: 20
  },
  maxTotalDiscountPercent: {
    type: Number,
    default: 30
  },
  
  // NEW: Coin reward percentages
  firstOrderCoinPercent: {
    type: Number,
    default: 100, // 100% of order amount as coins for first referral order
    min: 0,
    max: 100
  },
  subsequentOrderCoinPercent: {
    type: Number,
    default: 1, // 1% of order amount as coins for subsequent orders
    min: 0,
    max: 100
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

referralSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const ReferralModel = mongoose.model('Referral', referralSchema);
export default ReferralModel;
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  product: {
    type: new mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true
},
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  images: [{
    type: String // URLs of review images
  }],
  // In Product model
rating: {
  type: Number,
  default: 0
},
reviewCount: {
  type: Number,
  default: 0
},
ratingCounts: {
  1: { type: Number, default: 0 },
  2: { type: Number, default: 0 },
  3: { type: Number, default: 0 },
  4: { type: Number, default: 0 },
  5: { type: Number, default: 0 }
},
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  helpful: {
    type: Number,
    default: 0
  },
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  adminResponse: {
    comment: String,
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Compound index for unique user review per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to get product ratings summary
reviewSchema.statics.getProductRatingSummary = async function(productId) {
  const result = await this.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingCounts: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length > 0) {
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    result[0].ratingCounts.forEach(rating => {
      ratingCounts[rating] += 1;
    });

    return {
      averageRating: Math.round(result[0].averageRating * 10) / 10,
      totalReviews: result[0].totalReviews,
      ratingCounts
    };
  }

  return {
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  };
};


const reviewModel = mongoose.model('Review', reviewSchema);
export default reviewModel;
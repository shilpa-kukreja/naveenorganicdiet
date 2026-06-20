
import Product from "../models/productModel.js";
import redis from "../config/redis.js";
import { PRODUCT_ALL, PRODUCT_SINGLE } from "../utils/cacheKeys.js";
import reviewModel from "../models/ReviewModel.js";
import mongoose from "mongoose";


// @access  Private
export const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment, images } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = await reviewModel.findOne({
      product: productId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Create review
    const review = await reviewModel.create({
      product: productId,
      rating,
      title,
      comment,
      images: images || [],
      verifiedPurchase: true // Set based on order history
    });

    // Update product rating summary
    await updateProductRatingSummary(productId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully and pending approval',
      data: review
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};



// @desc    Get all reviews with filtering and pagination
// @route   GET /api/admin/reviews
// @access  Private/Admin


export const getAdminReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || 'all';
    const rating = req.query.rating ? parseInt(req.query.rating) : null;
    const search = req.query.search || '';

    let matchCriteria = {};

    // Filter by status
    if (status !== 'all') {
      matchCriteria.status = status;
    }

    // Filter by rating
    if (rating) {
      matchCriteria.rating = rating;
    }

    // Search in title and comment
    if (search) {
      matchCriteria.$or = [
        { title: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } }
      ];
    }

    // Get reviews without populate
    const reviews = await reviewModel.find(matchCriteria)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    console.log('Raw reviews:', reviews);
    
    // Extract product IDs
    const productIds = reviews
      .map(r => r.product)
      .filter(id => id && mongoose.Types.ObjectId.isValid(id))
      .map(id => new mongoose.Types.ObjectId(id));

    console.log('Product IDs to fetch:', productIds);

    // Get products
    const products = await Product.find({ 
      _id: { $in: productIds } 
    })
    .select('name thumbImg price category')
    .lean();

    console.log('Fetched products:', products);

    // Create product map for easy lookup
    const productMap = {};
    products.forEach(product => {
      productMap[product._id.toString()] = product;
    });

    console.log('Product map:', productMap);

    // Attach products to reviews
    const reviewsWithProducts = reviews.map(review => {
      const productId = review.product?.toString();
      const productData = productMap[productId] || {
        _id: review.product,
        name: 'Product Not Found',
        thumbImg: '/placeholder-product.jpg',
        price: 0,
        category: []
      };
      
      return {
        ...review,
        product: productData
      };
    });

    console.log('Reviews with products:', reviewsWithProducts[0]);

    const total = await reviewModel.countDocuments(matchCriteria);

    // Get statistics
    const stats = await reviewModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: total
    };

    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        reviews: reviewsWithProducts,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        },
        stats: statusCounts
      }
    });

  } catch (error) {
    console.error('Get admin reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update review status
// @route   PUT /api/admin/reviews/:reviewId/status
// @access  Private/Admin
export const updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const review = await reviewModel.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true }
    ).populate('product');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Update product rating summary if status changed to/from approved
    if (status === 'approved' || review.status === 'approved') {
      await updateProductRatingSummary(review.product._id);
    }

    res.json({
      success: true,
      message: `Review ${status} successfully`,
      data: review
    });

  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:reviewId
// @access  Private/Admin
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await reviewModel.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const productId = review.product;
    await reviewModel.findByIdAndDelete(reviewId);

    // Update product rating summary
    await updateProductRatingSummary(productId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};



// @desc    Get approved reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const rating = req.query.rating ? parseInt(req.query.rating) : null;

    let matchCriteria = {
      product: productId,
      status: 'approved'
    };

    if (rating) {
      matchCriteria.rating = rating;
    }

    const reviews = await reviewModel.find(matchCriteria)
      .sort({ [sortBy]: sortOrder })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await reviewModel.countDocuments(matchCriteria);

    // Get rating summary
    const ratingSummary = await reviewModel.getProductRatingSummary(productId);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        },
        ratingSummary
      }
    });

  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update review helpful count
// @route   PUT /api/reviews/:reviewId/helpful
// @access  Private
export const markHelpful = async (req, res) => {
  try {
    const review = await reviewModel.findByIdAndUpdate(
      req.params.reviewId,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
// exports.getMyReviews = async (req, res) => {
//   try {
//     const reviews = await Review.find({ user: req.user._id })
//       .populate('product', 'name thumbImg price discountPrice')
//       .sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       data: reviews
//     });

//   } catch (error) {
//     console.error('Get my reviews error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// };

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await reviewModel.find().lean();
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}

// Helper function to update product rating summary
const updateProductRatingSummary = async (productId) => {
  try {
    const ratingSummary = await reviewModel.getProductRatingSummary(productId);

    await Product.findByIdAndUpdate(productId, {
      rating: ratingSummary.averageRating,
      reviewCount: ratingSummary.totalReviews,
      ratingCounts: ratingSummary.ratingCounts
    });

  } catch (error) {
    console.error('Update product rating summary error:', error);
  }
};
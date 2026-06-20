import express from 'express';
import { createReview, deleteReview, getAdminReviews, getAllReviews, getProductReviews, markHelpful, updateReviewStatus } from '../controllers/reviewsController.js';





const reviewRouter = express.Router();


reviewRouter.post('/create', createReview);
reviewRouter.get('/product/:productId', getProductReviews);
reviewRouter.put('/:reviewId/helpful', markHelpful);
reviewRouter.get('/all-reviews',  getAllReviews);
reviewRouter.get('/admin', getAdminReviews);
reviewRouter.put('/reviews/:reviewId/status', updateReviewStatus);
reviewRouter.delete('/reviews/:reviewId', deleteReview);


export default reviewRouter;
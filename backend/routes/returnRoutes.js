// routes/returnRoutes.js
import express from 'express';

import { authMiddleware } from '../middleware/adminAuthMiddleware.js';
import { approveReturn, confirmReturnReceived, getAllReturnRequests, getRefundStatus, getReturnStats, getReturnTracking, getUserReturnRequests, processRefund, pushReturnToShipmozo, rejectReturn } from '../controllers/returnController.js';



const returnRouter = express.Router();

// User routes

returnRouter.get('/my-returns', authMiddleware, getUserReturnRequests);
// Admin routes
returnRouter.get('/all-returns',  getAllReturnRequests);
returnRouter.post('/approve-return',  approveReturn);
returnRouter.post('/reject-return',  rejectReturn);
returnRouter.get('/return-stats', authMiddleware, getReturnStats);
returnRouter.get('/stats', getReturnStats);
returnRouter.post('/push-to-shipmozo', pushReturnToShipmozo);
returnRouter.post('/confirm-received', confirmReturnReceived);
returnRouter.get('/tracking/:returnId', getReturnTracking);
returnRouter.post('/process-refund', processRefund); // New route
returnRouter.get('/refund-status/:returnId', getRefundStatus); // New route

export default returnRouter;
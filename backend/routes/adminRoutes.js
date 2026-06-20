// routes/dashboardRoutes.js
import express from 'express';
import {
  getDashboardStats,
  exportDashboardData,  // Make sure this is imported
  getSalesAnalytics,
  getUserAnalytics,
  getInventoryAnalytics,
  getRecentActivity
} from '../controllers/adminController.js';

const dashboardRouter = express.Router();

// Dashboard routes
dashboardRouter.get('/dashboard/stats', getDashboardStats);
dashboardRouter.get('/dashboard/export', exportDashboardData);  // Add this route
dashboardRouter.get('/dashboard/sales-analytics', getSalesAnalytics);
dashboardRouter.get('/dashboard/user-analytics', getUserAnalytics);
dashboardRouter.get('/dashboard/inventory-analytics', getInventoryAnalytics);
dashboardRouter.get('/dashboard/recent-activity', getRecentActivity);

export default dashboardRouter;
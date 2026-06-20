import mongoose from 'mongoose';
import orderModel from '../models/orderModel.js';
import userModel from '../models/authModel.js';
import reviewModel from '../models/ReviewModel.js';
import productModel from '../models/productModel.js';
import PayoutRequest from '../models/payoutRequestModel.js';
import referrralModel from '../models/referralModel.js';

// 📊 Get Dashboard Statistics (Fixed and Optimized)
export const getDashboardStats = async (req, res) => {
  try {
    const { period = '30days' } = req.query;
    
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Calculate period start date
    let periodStartDate = new Date();
    let periodLabel = "Last 30 Days";
    
    switch(period) {
      case 'today':
        periodStartDate = startOfToday;
        periodLabel = "Today";
        break;
      case '7days':
        periodStartDate.setDate(today.getDate() - 7);
        periodLabel = "Last 7 Days";
        break;
      case '30days':
        periodStartDate.setDate(today.getDate() - 30);
        periodLabel = "Last 30 Days";
        break;
      case '3months':
        periodStartDate.setMonth(today.getMonth() - 3);
        periodLabel = "Last 3 Months";
        break;
      case '6months':
        periodStartDate.setMonth(today.getMonth() - 6);
        periodLabel = "Last 6 Months";
        break;
      case 'year':
        periodStartDate.setFullYear(today.getFullYear() - 1);
        periodLabel = "Last Year";
        break;
      default:
        periodStartDate = new Date(0);
        periodLabel = "All Time";
    }

    // Run all database queries in parallel for better performance
    const [
      totalOrders,
      totalRevenueResult,
      todayOrders,
      todayRevenueResult,
      periodOrders,
      periodRevenueResult,
      monthlyOrders,
      monthlyRevenueResult,
      lastMonthRevenueResult,
      totalUsers,
      newUsersToday,
      newUsersMonth,
      newUsersPeriod,
      totalProducts,
      activeProducts,
      outOfStockProducts,
      totalReviews,
      pendingReviews,
      approvedReviews,
      referralConfig,
      totalReferrals,
      referralRevenueResult,
      totalPayoutRequests,
      pendingPayouts,
      totalPayoutAmountResult,
      recentOrders,
      lowStockProductsCount,
      rejectedReviewsCount,
      approvedPayoutsCount,
      rejectedPayoutsCount
    ] = await Promise.all([
      // 1. Total Orders & Revenue
      orderModel.countDocuments(),
      orderModel.aggregate([
        { $match: { payment: true } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      
      // 2. Today's Orders & Revenue
      orderModel.countDocuments({ createdAt: { $gte: startOfToday } }),
      orderModel.aggregate([
        { $match: { payment: true, createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      
      // 3. Period-based Orders & Revenue
      orderModel.countDocuments({ createdAt: { $gte: periodStartDate } }),
      orderModel.aggregate([
        { $match: { payment: true, createdAt: { $gte: periodStartDate } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      
      // 4. Monthly Orders & Revenue
      orderModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
      orderModel.aggregate([
        { $match: { payment: true, createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      
      // 5. Last Month Revenue
      orderModel.aggregate([
        { $match: { payment: true, createdAt: { $gte: lastMonth, $lt: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      
      // 6. User Statistics
      userModel.countDocuments(),
      userModel.countDocuments({ verifiedAt: { $gte: startOfToday } }),
      userModel.countDocuments({ verifiedAt: { $gte: startOfMonth } }),
      userModel.countDocuments({ verifiedAt: { $gte: periodStartDate } }),
      
      // 7. Product Statistics
      productModel.countDocuments(),
      productModel.countDocuments({ status: 'active' }),
      productModel.countDocuments({ stock: 0 }),
      
      // 8. Review Statistics
      reviewModel.countDocuments(),
      reviewModel.countDocuments({ status: 'pending' }),
      reviewModel.countDocuments({ status: 'approved' }),
      
      // 9. Referral Statistics
      referrralModel.findOne(),
      orderModel.countDocuments({ referredBy: { $exists: true }, createdAt: { $gte: periodStartDate } }),
      orderModel.aggregate([
        { $match: { referredBy: { $exists: true }, payment: true, createdAt: { $gte: periodStartDate } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      
      // 10. Payout Statistics
      PayoutRequest.countDocuments(),
      PayoutRequest.countDocuments({ status: 'Pending' }),
      PayoutRequest.aggregate([
        { $match: { status: 'Approved', createdAt: { $gte: periodStartDate } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      
      // 11. Recent Orders
      orderModel.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'username number')
        .lean(),
      
      // 12. Additional counts
      productModel.countDocuments({ stock: { $gt: 0, $lte: 10 } }),
      reviewModel.countDocuments({ status: 'rejected' }),
      PayoutRequest.countDocuments({ status: 'Approved' }),
      PayoutRequest.countDocuments({ status: 'Rejected' })
    ]);

    // Extract values from aggregation results
    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const todayRevenue = todayRevenueResult[0]?.total || 0;
    const periodRevenue = periodRevenueResult[0]?.total || 0;
    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;
    const lastMonthRevenue = lastMonthRevenueResult[0]?.total || 0;
    const referralRevenue = referralRevenueResult[0]?.total || 0;
    const totalPayoutAmount = totalPayoutAmountResult[0]?.total || 0;

    // Calculate revenue growth
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(2)
      : monthlyRevenue > 0 ? 100 : 0;

    // Calculate period comparison
    let previousPeriodStart = new Date(periodStartDate);
    let periodComparison = 0;
    
    if (period === 'today') {
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 1);
    } else if (period === '7days') {
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
    } else if (period === '30days') {
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);
    } else if (period === '3months') {
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 3);
    } else if (period === '6months') {
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 6);
    } else if (period === 'year') {
      previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1);
    }
    
    const previousPeriodRevenueResult = await orderModel.aggregate([
      { $match: { payment: true, createdAt: { $gte: previousPeriodStart, $lt: periodStartDate } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    const previousPeriodRevenue = previousPeriodRevenueResult[0]?.total || 0;
    
    if (previousPeriodRevenue > 0) {
      periodComparison = ((periodRevenue - previousPeriodRevenue) / previousPeriodRevenue * 100).toFixed(2);
    } else if (periodRevenue > 0) {
      periodComparison = 100;
    }

    // Run chart and breakdown queries in parallel
    const [
      orderStatusBreakdown,
      paymentMethodBreakdown,
      topProducts,
      revenueChartData,
      userGrowthChartData,
      topCategories
    ] = await Promise.all([
      // Order Status Breakdown
      orderModel.aggregate([
        { $match: { createdAt: { $gte: periodStartDate } } },
        { $group: { _id: "$status", count: { $sum: 1 }, totalAmount: { $sum: "$amount" } } }
      ]),
      
      // Payment Method Breakdown
      orderModel.aggregate([
        { $match: { createdAt: { $gte: periodStartDate } } },
        { $group: { _id: "$paymentMethod", count: { $sum: 1 }, totalAmount: { $sum: "$amount" } } }
      ]),
      
      // Top Selling Products
      orderModel.aggregate([
        { $unwind: "$items" },
        { $match: { "items.productId": { $exists: true, $ne: null }, payment: true, createdAt: { $gte: periodStartDate } } },
        { $group: { _id: "$items.productId", totalQuantity: { $sum: "$items.quantity" }, totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }, orderCount: { $sum: 1 } } },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
        { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        { $project: { productId: "$_id", productName: { $ifNull: ["$product.name", "Unknown Product"] }, productImage: { $ifNull: ["$product.thumbImg", ""] }, category: { $ifNull: ["$product.category", "Uncategorized"] }, price: { $ifNull: ["$product.price", 0] }, stock: { $ifNull: ["$product.stock", 0] }, totalQuantity: 1, totalRevenue: 1, orderCount: 1 } }
      ]),
      
      // Revenue Chart Data
      getRevenueChartData(period, periodStartDate),
      
      // User Growth Chart Data
      getUserGrowthChartData(period, periodStartDate),
      
      // Top Categories
      orderModel.aggregate([
        { $unwind: "$items" },
        { $match: { payment: true, createdAt: { $gte: periodStartDate } } },
        { $lookup: { from: "products", localField: "items.productId", foreignField: "_id", as: "productDetails" } },
        { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
        { $group: { _id: { $ifNull: ["$productDetails.category", "Uncategorized"] }, totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }, totalQuantity: { $sum: "$items.quantity" }, productCount: { $addToSet: "$items.productId" } } },
        { $project: { category: "$_id", totalRevenue: 1, totalQuantity: 1, productCount: { $size: "$productCount" } } },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 }
      ])
    ]);

    // Low Stock Products
    const lowStockProducts = await productModel.find({ stock: { $gt: 0, $lte: 10 } })
      .select('name thumbImg price stock category')
      .sort({ stock: 1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: {
        period: {
          label: periodLabel,
          value: period,
          startDate: periodStartDate,
          endDate: today
        },
        
        summary: {
          totalRevenue,
          totalOrders,
          totalUsers,
          totalProducts,
          todayRevenue,
          todayOrders,
          periodRevenue,
          periodOrders,
          monthlyRevenue,
          monthlyOrders,
          revenueGrowth: parseFloat(revenueGrowth),
          periodGrowth: parseFloat(periodComparison),
          newUsersToday,
          newUsersPeriod,
          newUsersMonth,
          avgOrderValue: periodOrders > 0 ? (periodRevenue / periodOrders).toFixed(2) : 0,
          conversionRate: totalUsers > 0 ? ((periodOrders / totalUsers) * 100).toFixed(2) : 0
        },

        details: {
          products: {
            total: totalProducts,
            active: activeProducts,
            outOfStock: outOfStockProducts,
            lowStock: lowStockProductsCount
          },
          reviews: {
            total: totalReviews,
            pending: pendingReviews,
            approved: approvedReviews,
            rejected: rejectedReviewsCount
          },
          referrals: {
            total: totalReferrals,
            revenue: referralRevenue,
            config: referralConfig || {},
            referralRate: periodOrders > 0 ? ((totalReferrals / periodOrders) * 100).toFixed(2) : 0
          },
          payouts: {
            totalRequests: totalPayoutRequests,
            pending: pendingPayouts,
            totalAmount: totalPayoutAmount,
            approved: approvedPayoutsCount,
            rejected: rejectedPayoutsCount
          }
        },

        breakdowns: {
          orderStatus: orderStatusBreakdown,
          paymentMethods: paymentMethodBreakdown,
          topCategories
        },

        charts: {
          revenueChart: revenueChartData,
          userGrowth: userGrowthChartData
        },

        recent: {
          orders: recentOrders.map(order => ({
            id: order.orderid,
            customer: order.userId?.username || 'Unknown',
            customerId: order.userId?._id,
            email: order.address?.email,
            phone: order.address?.phone,
            amount: order.amount,
            status: order.status,
            items: order.items?.length || 0,
            date: order.createdAt,
            paymentMethod: order.paymentMethod,
            address: `${order.address?.address1 || ''}, ${order.address?.city || ''}`
          })),
          topProducts,
          lowStockProducts: lowStockProducts.map(product => ({
            ...product,
            thumbImg: product.thumbImg || ''
          }))
        }
      }
    });

  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard statistics',
      error: error.message
    });
  }
};

// Helper function for revenue chart data
async function getRevenueChartData(period, periodStartDate) {
  let groupBy = {};
  let chartLimit = 30;
  
  if (period === 'today') {
    groupBy = { $hour: "$createdAt" };
    chartLimit = 24;
  } else if (period === '7days') {
    groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    chartLimit = 7;
  } else if (period === '30days' || period === '3months') {
    groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    chartLimit = period === '3months' ? 90 : 30;
  } else {
    groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    chartLimit = period === '6months' ? 6 : 12;
  }

  const revenueChart = await orderModel.aggregate([
    { $match: { payment: true, createdAt: { $gte: periodStartDate } } },
    { $group: { _id: groupBy, revenue: { $sum: "$amount" }, orders: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $limit: chartLimit }
  ]);

  return revenueChart.map(item => ({
    label: typeof item._id === 'object' ? item._id.hour : item._id,
    revenue: item.revenue || 0,
    orders: item.orders || 0
  }));
}

// Helper function for user growth chart data
async function getUserGrowthChartData(period, periodStartDate) {
  let groupBy = {};
  
  if (period === 'today') {
    groupBy = { $hour: "$verifiedAt" };
  } else if (period === '7days' || period === '30days' || period === '3months') {
    groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$verifiedAt" } };
  } else {
    groupBy = { $dateToString: { format: "%Y-%m", date: "$verifiedAt" } };
  }

  const userGrowthChart = await userModel.aggregate([
    { $match: { verifiedAt: { $gte: periodStartDate } } },
    { $group: { _id: groupBy, users: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  return userGrowthChart.map(item => ({
    label: typeof item._id === 'object' ? item._id.hour : item._id,
    users: item.users || 0
  }));
}

// 📊 Export Dashboard Data




function convertToExcel(data) {
  // Simplified - in production, use a library like exceljs
  return JSON.stringify(data);
}

// Other controller functions remain the same...

// 📈 Get Sales Analytics
export const getSalesAnalytics = async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;
    
    let matchFilter = { payment: true };
    
    if (startDate && endDate) {
      matchFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      matchFilter.createdAt = { $gte: thirtyDaysAgo };
    }

    const analytics = await orderModel.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: period === 'daily' 
            ? { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
            : period === 'weekly'
            ? { $week: "$createdAt" }
            : { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalRevenue: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$amount" },
          customers: { $addToSet: "$userId" }
        }
      },
      {
        $project: {
          period: "$_id",
          totalRevenue: 1,
          totalOrders: 1,
          avgOrderValue: { $round: ["$avgOrderValue", 2] },
          uniqueCustomers: { $size: "$customers" }
        }
      },
      { $sort: { period: 1 } }
    ]);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Sales Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load sales analytics',
      error: error.message
    });
  }
};

// 👥 Get User Analytics
export const getUserAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // User growth over time
    const userGrowth = await userModel.aggregate([
      {
        $match: {
          verifiedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$verifiedAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // User demographics
    const userSources = await userModel.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$signupSource", "unknown"] },
          count: { $sum: 1 }
        }
      }
    ]);

    // Active users (users with orders)
    const activeUsers = await orderModel.distinct('userId', {
      createdAt: { $gte: startDate }
    });

    res.json({
      success: true,
      data: {
        totalUsers: await userModel.countDocuments(),
        newUsers: userGrowth.reduce((sum, day) => sum + day.count, 0),
        activeUsers: activeUsers.length,
        userGrowth,
        userSources
      }
    });
  } catch (error) {
    console.error('User Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load user analytics',
      error: error.message
    });
  }
};

// 📦 Get Inventory Analytics
export const getInventoryAnalytics = async (req, res) => {
  try {
    const products = await productModel.find()
      .select('name thumbImg price stock category status')
      .sort({ stock: 1 })
      .lean();

    const lowStockThreshold = 10;
    const lowStockProducts = products.filter(p => p.stock <= lowStockThreshold);
    const outOfStockProducts = products.filter(p => p.stock === 0);
    
    const categoryStats = await productModel.aggregate([
      {
        $group: {
          _id: "$category",
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          avgPrice: { $avg: "$price" }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalProducts: products.length,
        totalStockValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        categoryStats,
        lowStockProducts: lowStockProducts.slice(0, 10),
        topSellingProducts: [] // Would need order data integration
      }
    });
  } catch (error) {
    console.error('Inventory Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load inventory analytics',
      error: error.message
    });
  }
};

// 🔄 Get Recent Activity
export const getRecentActivity = async (req, res) => {
  try {
    const recentOrders = await orderModel.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('userId', 'username number')
      .lean();

    const recentUsers = await userModel.find()
      .sort({ verifiedAt: -1 })
      .limit(10)
      .select('username email number verifiedAt')
      .lean();

    const recentReviews = await reviewModel.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('product', 'name')
      .lean();

    const recentPayouts = await PayoutRequest.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('User', 'username number')
      .lean();

    res.json({
      success: true,
      data: {
        orders: recentOrders,
        users: recentUsers,
        reviews: recentReviews,
        payouts: recentPayouts
      }
    });
  } catch (error) {
    console.error('Recent Activity Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load recent activity',
      error: error.message
    });
  }
};




// Add this function at the end of your adminController.js
// 📊 Export Dashboard Data (Fixed Version)
export const exportDashboardData = async (req, res) => {
  try {
    const { period = '30days', format = 'csv' } = req.query;
    
    // Calculate date ranges (reuse the same logic as getDashboardStats)
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    let periodStartDate = new Date();
    
    switch(period) {
      case 'today':
        periodStartDate = startOfToday;
        break;
      case '7days':
        periodStartDate.setDate(today.getDate() - 7);
        break;
      case '30days':
        periodStartDate.setDate(today.getDate() - 30);
        break;
      case '3months':
        periodStartDate.setMonth(today.getMonth() - 3);
        break;
      case '6months':
        periodStartDate.setMonth(today.getMonth() - 6);
        break;
      case 'year':
        periodStartDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        periodStartDate = new Date(0);
    }

    // Get data for export
    const [
      orders,
      products,
      revenueChart,
      summaryStats
    ] = await Promise.all([
      // Recent Orders
      orderModel.find({ createdAt: { $gte: periodStartDate } })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('userId', 'username email number')
        .lean(),
      
      // Top Products
      orderModel.aggregate([
        { $unwind: "$items" },
        { $match: { "items.productId": { $exists: true, $ne: null }, payment: true, createdAt: { $gte: periodStartDate } } },
        { $group: { _id: "$items.productId", totalQuantity: { $sum: "$items.quantity" }, totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
        { $sort: { totalQuantity: -1 } },
        { $limit: 20 },
        { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        { $project: { productName: { $ifNull: ["$product.name", "Unknown"] }, category: { $ifNull: ["$product.category", "Uncategorized"] }, totalQuantity: 1, totalRevenue: 1 } }
      ]),
      
      // Revenue Chart Data
      orderModel.aggregate([
        { $match: { payment: true, createdAt: { $gte: periodStartDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$amount" }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      
      // Summary Stats
      orderModel.aggregate([
        { $match: { payment: true, createdAt: { $gte: periodStartDate } } },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" }, totalOrders: { $sum: 1 }, avgOrderValue: { $avg: "$amount" } } }
      ])
    ]);

    const summary = summaryStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

    // Prepare export data
    const exportData = {
      period,
      dateRange: {
        start: periodStartDate,
        end: today,
        label: getPeriodLabel(period)
      },
      summary: {
        totalRevenue: summary.totalRevenue,
        totalOrders: summary.totalOrders,
        avgOrderValue: summary.avgOrderValue,
        exportedAt: new Date()
      },
      orders: orders.map(order => ({
        orderId: order.orderid,
        customer: order.userId?.username || 'Unknown',
        email: order.address?.email,
        amount: order.amount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        date: order.createdAt,
        items: order.items?.length || 0
      })),
      products: products,
      revenueChart: revenueChart
    };

    if (format === 'csv') {
      const csvData = convertToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=dashboard-${period}-${Date.now()}.csv`);
      res.send(csvData);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=dashboard-${period}-${Date.now()}.json`);
      res.json(exportData);
    } else {
      // For Excel, you might want to use a library like exceljs
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=dashboard-${period}-${Date.now()}.json`);
      res.json(exportData);
    }

  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export dashboard data',
      error: error.message
    });
  }
};

// Helper function for period label
function getPeriodLabel(period) {
  const labels = {
    'today': 'Today',
    '7days': 'Last 7 Days',
    '30days': 'Last 30 Days',
    '3months': 'Last 3 Months',
    '6months': 'Last 6 Months',
    'year': 'Last Year',
    'all': 'All Time'
  };
  return labels[period] || 'Custom Period';
}

// Convert data to CSV
function convertToCSV(data) {
  const rows = [];
  
  // Add metadata
  rows.push('Dashboard Export');
  rows.push(`Period: ${data.dateRange.label}`);
  rows.push(`Exported At: ${new Date().toISOString()}`);
  rows.push('');
  
  // Add summary
  rows.push('SUMMARY');
  rows.push('Metric,Value');
  rows.push(`Total Revenue,${data.summary.totalRevenue}`);
  rows.push(`Total Orders,${data.summary.totalOrders}`);
  rows.push(`Average Order Value,${data.summary.avgOrderValue}`);
  rows.push('');
  
  // Add orders
  rows.push('RECENT ORDERS');
  rows.push('Order ID,Customer,Email,Amount,Status,Payment Method,Date,Items');
  data.orders.forEach(order => {
    rows.push(`${order.orderId},${order.customer},${order.email},${order.amount},${order.status},${order.paymentMethod},${order.date},${order.items}`);
  });
  rows.push('');
  
  // Add top products
  rows.push('TOP PRODUCTS');
  rows.push('Product Name,Category,Quantity Sold,Revenue');
  data.products.forEach(product => {
    rows.push(`${product.productName},${product.category},${product.totalQuantity},${product.totalRevenue}`);
  });
  rows.push('');
  
  // Add chart data
  rows.push('REVENUE CHART DATA');
  rows.push('Date,Revenue,Orders');
  data.revenueChart.forEach(item => {
    rows.push(`${item._id},${item.revenue},${item.orders}`);
  });
  
  return rows.join('\n');
}
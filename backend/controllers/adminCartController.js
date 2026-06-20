// controllers/adminCartController.js
import cartModel from "../models/cartModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";

/**
 * Get all carts (WITHOUT AUTH)
 */
// export const getAllAbandonedCarts = async (req, res) => {
//   try {
//     console.log("📦 Fetching all carts...");
    
//     const {
//       page = 1,
//       limit = 50,
//       sortBy = 'lastActivity',
//       sortOrder = 'desc',
//       search = '',
//       status = 'all',
//       fromDate,
//       toDate
//     } = req.query;

//     // ✅ SIMPLE QUERY - सभी carts लाओ
//     let query = {};

//     // Status filter
//     if (status === 'active') {
//       query.isRestored = false;
//     } else if (status === 'restored') {
//       query.isRestored = true;
//     }

//     // Date range filter
//     if (fromDate || toDate) {
//       query.lastActivity = {};
//       if (fromDate) {
//         query.lastActivity.$gte = new Date(fromDate);
//       }
//       if (toDate) {
//         query.lastActivity.$lte = new Date(toDate);
//       }
//     }

//     // Search
//     if (search) {
//       const searchRegex = new RegExp(search, 'i');
//       query.$or = [
//         { email: searchRegex },
//         { phoneNumber: searchRegex }
//       ];
//     }

//     // Pagination
//     const skip = (page - 1) * limit;

//     // Get total count
//     const total = await cartModel.countDocuments(query);
//     console.log(`📊 Total carts found: ${total}`);

//     // Get carts
//     const carts = await cartModel.find(query)
//       .populate('userId', 'email phoneNumber username')
//       .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
//       .skip(skip)
//       .limit(parseInt(limit))
//       .lean();

//     console.log(`✅ Fetched ${carts.length} carts`);

//     // Enrich cart data
//     const enrichedCarts = carts.map((cart) => {
//       const cartTotal = cart.items?.reduce((sum, item) => 
//         sum + ((item.priceSnapshot || 0) * (item.quantity || 0)), 0
//       ) || 0;

//       return {
//         _id: cart._id,
//         userId: cart.userId,
//         email: cart.email || (cart.userId?.email) || 'No Email',
//         phoneNumber: cart.phoneNumber || (cart.userId?.phoneNumber) || 'No Phone',
//         items: cart.items || [],
//         cartTotal: cartTotal.toFixed(2),
//         itemCount: cart.items?.length || 0,
//         lastActivity: cart.lastActivity,
//         isRestored: cart.isRestored || false,
//         restoredAt: cart.restoredAt,
//         restoreToken: cart.restoreToken,
//         remindersSent: cart.remindersSent || 0,
//         lastReminderSent: cart.lastReminderSent,
//         createdAt: cart.createdAt,
//         updatedAt: cart.updatedAt,
//         daysAbandoned: cart.lastActivity ? 
//           Math.floor((new Date() - new Date(cart.lastActivity)) / (1000 * 60 * 60 * 24)) : 0,
//         restoreLink: cart.restoreToken ? 
//           `${process.env.FRONTEND_URL || 'http://localhost:3000'}/restore-cart/${cart.restoreToken}` : null,
//         userDetails: {
//           email: cart.userId?.email || cart.email,
//           phone: cart.userId?.phoneNumber || cart.phoneNumber,
//           username: cart.userId?.username
//         }
//       };
//     });

//     res.json({
//       success: true,
//       message: `Successfully fetched ${enrichedCarts.length} carts`,
//       data: enrichedCarts,
//       pagination: {
//         total,
//         page: parseInt(page),
//         limit: parseInt(limit),
//         pages: Math.ceil(total / limit)
//       }
//     });
//   } catch (error) {
//     console.error("❌ Error fetching carts:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch carts",
//       error: error.message,
//       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// };


// controllers/adminCartController.js - Update the getAllAbandonedCarts function

export const getAllAbandonedCarts = async (req, res) => {
  try {
    console.log("📦 Fetching all carts...");
    
    const {
      page = 1,
      limit = 50,
      sortBy = 'lastActivity',
      sortOrder = 'desc',
      search = '',
      status = 'all',
      fromDate,
      toDate
    } = req.query;

    let query = {};

    // Status filter
    if (status === 'active') {
      query.isRestored = false;
    } else if (status === 'restored') {
      query.isRestored = true;
    }

    // Date range filter
    if (fromDate || toDate) {
      query.lastActivity = {};
      if (fromDate) {
        query.lastActivity.$gte = new Date(fromDate);
      }
      if (toDate) {
        query.lastActivity.$lte = new Date(toDate);
      }
    }

    // Search
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { email: searchRegex },
        { phoneNumber: searchRegex },
        { 'items.name': searchRegex }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await cartModel.countDocuments(query);
    console.log(`📊 Total carts found: ${total}`);

    // Get carts with detailed product population
    const carts = await cartModel.find(query)
      .populate('userId', 'email phoneNumber username')
      .populate({
        path: 'items.productId',
        model: 'Product',
        select: 'name price discountPrice description thumbImg images category pack stock status'
      })
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    console.log(`✅ Fetched ${carts.length} carts`);

    // Enrich cart data with complete product details
    const enrichedCarts = carts.map((cart) => {
      const cartTotal = cart.items?.reduce((sum, item) => {
        let price = 0;
        
        // If product is populated, use current price, otherwise use snapshot
        if (item.productId && typeof item.productId === 'object') {
          price = item.productId.discountPrice || item.productId.price || item.priceSnapshot || 0;
        } else {
          price = item.priceSnapshot || 0;
        }
        
        return sum + (price * (item.quantity || 0));
      }, 0) || 0;

      // Prepare detailed items
      const detailedItems = cart.items?.map(item => {
        let product = {};
        
        if (item.productId && typeof item.productId === 'object') {
          // Product is populated
          product = {
            _id: item.productId._id,
            name: item.productId.name || item.name,
            description: item.productId.description,
            price: item.productId.price,
            discountPrice: item.productId.discountPrice,
            currentPrice: item.productId.discountPrice || item.productId.price,
            originalPrice: item.priceSnapshot || item.productId.price,
            quantity: item.quantity,
            images: item.productId.images || [],
            thumbImg: item.productId.thumbImg || item.image,
            category: item.productId.category,
            pack: item.productId.pack,
            stock: item.productId.stock,
            status: item.productId.status
          };
        } else {
          // Product not populated, use snapshot data
          product = {
            _id: item.productId,
            name: item.name,
            price: item.priceSnapshot,
            discountPrice: null,
            currentPrice: item.priceSnapshot,
            originalPrice: item.priceSnapshot,
            quantity: item.quantity,
            images: [],
            thumbImg: item.image || '',
            category: '',
            pack: item.pack || '',
            stock: 0,
            status: 'unknown'
          };
        }
        
        return {
          ...item,
          productDetails: product,
          itemTotal: (product.currentPrice || 0) * (item.quantity || 1)
        };
      }) || [];

      return {
        _id: cart._id,
        userId: cart.userId,
        email: cart.email || (cart.userId?.email) || 'No Email',
        phoneNumber: cart.phoneNumber || (cart.userId?.phoneNumber) || 'No Phone',
        items: detailedItems, // Now includes complete product details
        cartTotal: cartTotal.toFixed(2),
        itemCount: detailedItems.length,
        lastActivity: cart.lastActivity,
        isRestored: cart.isRestored || false,
        restoredAt: cart.restoredAt,
        restoreToken: cart.restoreToken,
        remindersSent: cart.remindersSent || 0,
        lastReminderSent: cart.lastReminderSent,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
        daysAbandoned: cart.lastActivity ? 
          Math.floor((new Date() - new Date(cart.lastActivity)) / (1000 * 60 * 60 * 24)) : 0,
        restoreLink: cart.restoreToken ? 
          `${process.env.FRONTEND_URL || 'http://localhost:3000'}/restore-cart/${cart.restoreToken}` : null,
        userDetails: {
          email: cart.userId?.email || cart.email,
          phone: cart.userId?.phoneNumber || cart.phoneNumber,
          username: cart.userId?.username
        }
      };
    });

    res.json({
      success: true,
      message: `Successfully fetched ${enrichedCarts.length} carts`,
      data: enrichedCarts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("❌ Error fetching carts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch carts",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
/**
 * Get abandoned cart statistics
 */
export const getAbandonedCartStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Counts
    const totalCarts = await cartModel.countDocuments({
      lastActivity: { $gte: dateThreshold }
    });

    const cartsWithItems = await cartModel.countDocuments({
      items: { $exists: true, $not: { $size: 0 } },
      lastActivity: { $gte: dateThreshold }
    });

    const activeCarts = await cartModel.countDocuments({
      isRestored: false,
      items: { $exists: true, $not: { $size: 0 } },
      lastActivity: { $gte: dateThreshold }
    });

    const restoredCarts = await cartModel.countDocuments({
      isRestored: true,
      items: { $exists: true, $not: { $size: 0 } },
      lastActivity: { $gte: dateThreshold }
    });

    // Revenue calculation
    const carts = await cartModel.find({
      items: { $exists: true, $not: { $size: 0 } },
      lastActivity: { $gte: dateThreshold }
    }).lean();

    const totalPotentialRevenue = carts.reduce((total, cart) => {
      const cartTotal = cart.items.reduce((sum, item) => 
        sum + ((item.priceSnapshot || 0) * (item.quantity || 0)), 0
      );
      return total + cartTotal;
    }, 0);

    const avgCartValue = cartsWithItems > 0 ? totalPotentialRevenue / cartsWithItems : 0;

    res.json({
      success: true,
      stats: {
        totalCarts,
        cartsWithItems,
        activeCarts,
        restoredCarts,
        totalPotentialRevenue: totalPotentialRevenue.toFixed(2),
        avgCartValue: avgCartValue.toFixed(2),
        restorationRate: cartsWithItems > 0 ? (restoredCarts / cartsWithItems * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics"
    });
  }
};

/**
 * Get cart details by ID
 */
export const getCartDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const cart = await cartModel.findById(id)
      .populate('userId', 'email phoneNumber username address')
      .lean();

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    // Calculate cart total
    const cartTotal = cart.items.reduce((sum, item) => 
      sum + ((item.priceSnapshot || 0) * (item.quantity || 0)), 0
    );

    res.json({
      success: true,
      cart: {
        ...cart,
        cartTotal: cartTotal.toFixed(2),
        itemCount: cart.items.length,
        daysAbandoned: cart.lastActivity ? 
          Math.floor((new Date() - new Date(cart.lastActivity)) / (1000 * 60 * 60 * 24)) : 0
      }
    });
  } catch (error) {
    console.error("Error fetching cart details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart details"
    });
  }
};

/**
 * Send manual reminder
 */
export const sendManualReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'email' } = req.body;

    const cart = await cartModel.findById(id);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    if (cart.isRestored) {
      return res.status(400).json({
        success: false,
        message: "Cart has already been restored"
      });
    }

    // Update reminder count
    cart.remindersSent = (cart.remindersSent || 0) + 1;
    cart.lastReminderSent = new Date();
    cart.firstReminderSent = true;
    await cart.save();

    res.json({
      success: true,
      message: "Reminder sent successfully",
      remindersSent: cart.remindersSent
    });
  } catch (error) {
    console.error("Error sending manual reminder:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send reminder"
    });
  }
};

/**
 * Mark cart as restored manually
 */
export const markAsRestored = async (req, res) => {
  try {
    const { id } = req.params;

    const cart = await cartModel.findById(id);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    cart.isRestored = true;
    cart.restoredAt = new Date();
    await cart.save();

    res.json({
      success: true,
      message: "Cart marked as restored"
    });
  } catch (error) {
    console.error("Error marking cart as restored:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark cart as restored"
    });
  }
};

/**
 * Delete abandoned cart
 */
export const deleteAbandonedCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cart = await cartModel.findByIdAndDelete(id);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    res.json({
      success: true,
      message: "Cart deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete cart"
    });
  }
};

/**
 * Export carts data
 */
export const exportAbandonedCarts = async (req, res) => {
  try {
    const { format = 'csv', days = 30 } = req.query;
    const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const carts = await cartModel.find({
      lastActivity: { $gte: dateThreshold }
    })
    .populate('userId', 'email phoneNumber username')
    .sort({ lastActivity: -1 })
    .lean();

    // Format data
    const exportData = carts.map(cart => {
      const cartTotal = cart.items?.reduce((sum, item) => 
        sum + ((item.priceSnapshot || 0) * (item.quantity || 0)), 0
      ) || 0;

      return {
        CartID: cart._id.toString(),
        UserID: cart.userId?._id?.toString() || '',
        UserEmail: cart.userId?.email || cart.email || 'No Email',
        UserPhone: cart.userId?.phoneNumber || cart.phoneNumber || 'No Phone',
        ItemsCount: cart.items?.length || 0,
        CartTotal: cartTotal.toFixed(2),
        LastActivity: cart.lastActivity ? new Date(cart.lastActivity).toLocaleString() : '',
        IsRestored: cart.isRestored ? 'Yes' : 'No',
        RestoredAt: cart.restoredAt ? new Date(cart.restoredAt).toLocaleString() : '',
        RemindersSent: cart.remindersSent || 0,
        LastReminder: cart.lastReminderSent ? new Date(cart.lastReminderSent).toLocaleString() : '',
        DaysAbandoned: cart.lastActivity ? 
          Math.floor((new Date() - new Date(cart.lastActivity)) / (1000 * 60 * 60 * 24)) : 0
      };
    });

    if (format === 'csv') {
      const headers = Object.keys(exportData[0] || {});
      const csvRows = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => 
            `"${row[header] || ''}"`
          ).join(',')
        )
      ];

      const csv = csvRows.join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=carts_export.csv');
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: exportData
      });
    }
  } catch (error) {
    console.error("Error exporting carts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export data"
    });
  }
};

/**
 * TEST ENDPOINT: Create dummy cart data
 */
export const createTestCarts = async (req, res) => {
  try {
    // Clear existing
    await cartModel.deleteMany({});
    console.log("🗑️ Cleared existing carts");

    // Create dummy carts
    const dummyCarts = [
      {
        email: "customer1@example.com",
        phoneNumber: "9876543210",
        items: [
          {
            productId: "651234567890123456789012",
            name: "iPhone 15 Pro",
            priceSnapshot: 129999,
            quantity: 1,
            thumbImg: "iphone15.jpg"
          },
          {
            productId: "651234567890123456789013",
            name: "AirPods Pro",
            priceSnapshot: 24990,
            quantity: 1,
            thumbImg: "airpods.jpg"
          }
        ],
        lastActivity: new Date(),
        isRestored: false,
        remindersSent: 0
      },
      {
        email: "customer2@example.com",
        phoneNumber: "9876543211",
        items: [
          {
            productId: "651234567890123456789014",
            name: "MacBook Pro M3",
            priceSnapshot: 199999,
            quantity: 1,
            thumbImg: "macbook.jpg"
          }
        ],
        lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        isRestored: false,
        remindersSent: 1,
        lastReminderSent: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        email: "customer3@example.com",
        phoneNumber: "9876543212",
        items: [
          {
            productId: "651234567890123456789015",
            name: "iPad Air",
            priceSnapshot: 59990,
            quantity: 2,
            thumbImg: "ipad.jpg"
          }
        ],
        lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        isRestored: true,
        restoredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        remindersSent: 2
      },
      {
        email: "customer4@example.com",
        items: [], // Empty cart
        lastActivity: new Date(),
        isRestored: false
      }
    ];

    await cartModel.insertMany(dummyCarts);
    console.log("✅ Added 4 test carts");

    const total = await cartModel.countDocuments({});
    const withItems = await cartModel.countDocuments({ items: { $exists: true, $not: { $size: 0 } } });

    res.json({
      success: true,
      message: "Test carts created successfully",
      data: {
        totalCarts: total,
        cartsWithItems: withItems,
        emptyCarts: total - withItems
      }
    });
  } catch (error) {
    console.error("Error creating test carts:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
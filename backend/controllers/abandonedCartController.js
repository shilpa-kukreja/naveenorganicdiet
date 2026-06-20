// // controllers/abandonedCartController.js
// import cartModel from "../models/cartModel.js";
// import Product from "../models/productModel.js";
// import { generateRestoreToken } from "../utils/generateRestoreToken.js";
// import { sendCartReminder } from "../utils/sendSMS.js";
// import cron from "node-cron";

// /**
//  * Prepare restore link for abandoned cart
//  */
// export const prepareRestoreLink = async (cart) => {
//   const token = generateRestoreToken();

//   cart.restoreToken = token;
//   cart.restoreTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
//   await cart.save();

//   return `${process.env.FRONTEND_URL}/restore-cart/${token}`;
// };

// /**
//  * Save abandoned cart and schedule reminders
//  */
// export const saveAbandonedCart = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const phoneNumber = req.user.phoneNumber || req.user.number;
//     const email = req.user.email || req.user.address?.email;
//     const items = req.body.items;

//     console.log("=== ABANDONED CART SAVE ===");
//     console.log("User:", userId);
//     console.log("Email:", email);
//     console.log("Phone:", phoneNumber);
//     console.log("Items count:", items?.length);

//     if (!items || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No items in cart"
//       });
//     }

//     // Validate and save items
//     const enrichedItems = [];
    
//     for (const item of items) {
//       try {
//         if (!item.productId) {
//           console.warn("Item missing productId:", item);
//           continue;
//         }

//         const product = await Product.findById(item.productId);
        
//         if (!product) {
//           console.warn(`Product not found: ${item.productId}`);
//           enrichedItems.push({
//             productId: item.productId,
//             name: item.name || "Product",
//             quantity: item.quantity || 1,
//             priceSnapshot: item.price || 0,
//             image: item.image || "",
//             productUpdatedAt: new Date()
//           });
//           continue;
//         }

//         enrichedItems.push({
//           productId: product._id,
//           name: product.name,
//           quantity: item.quantity || 1,
//           priceSnapshot: item.price || product.discountPrice || product.price,
//           image: product.thumbImg || "",
//           productUpdatedAt: product.updatedAt || new Date(),
//           productStatus: product.status || "active"
//         });
        
//       } catch (error) {
//         console.error(`Error processing item:`, error);
//       }
//     }

//     if (enrichedItems.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No valid products found"
//       });
//     }

//     // Find or create cart
//     let abandonedCart = await cartModel.findOne({ userId });

//     if (!abandonedCart) {
//       abandonedCart = new cartModel({
//         userId,
//         phoneNumber,
//         email,
//         items: enrichedItems,
//         lastActivity: new Date(),
//         remindersSent: 0,
//         firstReminderSent: false
//       });
//     } else {
//       abandonedCart.items = enrichedItems;
//       abandonedCart.phoneNumber = phoneNumber;
//       abandonedCart.email = email;
//       abandonedCart.lastActivity = new Date();
//       abandonedCart.updatedAt = new Date();
//       abandonedCart.remindersSent = 0; // Reset counter on new cart activity
//       abandonedCart.firstReminderSent = false;
//     }

//     await abandonedCart.save();

//     console.log(`✅ Cart saved: ${abandonedCart._id}, Items: ${enrichedItems.length}`);

//     // Schedule reminder after 5 minutes
//     scheduleReminder(abandonedCart._id, 5 * 60 * 1000); // 5 minutes

//     res.status(200).json({
//       success: true,
//       message: "Cart saved successfully",
//       cartId: abandonedCart._id,
//       itemsCount: enrichedItems.length
//     });
    
//   } catch (error) {
//     console.error("Error saving abandoned cart:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// };

// /**
//  * Schedule reminder for abandoned cart
//  */
// const reminderSchedules = new Map();

// const scheduleReminder = (cartId, delay) => {
//   // Clear existing schedule if any
//   if (reminderSchedules.has(cartId)) {
//     clearTimeout(reminderSchedules.get(cartId));
//   }

//   const timeoutId = setTimeout(async () => {
//     try {
//       const cart = await cartModel.findById(cartId);
      
//       if (!cart || cart.isRestored || cart.items.length === 0) {
//         console.log(`Cart ${cartId} already restored or empty`);
//         return;
//       }

//       // Send first reminder
//       await sendCartReminder(cart);
      
//       // Update cart with reminder info
//       cart.firstReminderSent = true;
//       cart.remindersSent = 1;
//       cart.lastReminderSent = new Date();
//       await cart.save();

//       console.log(`✅ First reminder sent for cart ${cartId}`);
      
//       // Schedule second reminder after 1 hour
//       scheduleReminder(cartId, 60 * 60 * 1000); // 1 hour
      
//     } catch (error) {
//       console.error(`Error sending reminder for cart ${cartId}:`, error);
//     }
//   }, delay);

//   reminderSchedules.set(cartId, timeoutId);
// };

// /**
//  * Send manual reminder (for testing)
//  */
// export const sendAbandonedCartReminder = async (req, res) => {
//   try {
//     const { cartId } = req.params;
//     const cart = await cartModel.findById(cartId);

//     if (!cart || cart.items.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Cart not found or empty"
//       });
//     }

//     await sendCartReminder(cart);
    
//     cart.remindersSent += 1;
//     cart.lastReminderSent = new Date();
//     await cart.save();

//     res.json({
//       success: true,
//       message: "Reminder sent successfully"
//     });
//   } catch (error) {
//     console.error("Error sending reminder:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to send reminder"
//     });
//   }
// };

// /**
//  * Get cart by token
//  */
// export const getCartByToken = async (req, res) => {
//   try {
//     const { token } = req.params;

//     const cart = await cartModel.findOne({
//       restoreToken: token,
//       restoreTokenExpiry: { $gt: new Date() },
//       isRestored: false
//     });

//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         message: "Invalid or expired token"
//       });
//     }

//     res.json({
//       success: true,
//       cart: {
//         _id: cart._id,
//         items: cart.items,
//         createdAt: cart.createdAt,
//         lastActivity: cart.lastActivity
//       }
//     });
//   } catch (error) {
//     console.error("Error getting cart by token:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to get cart"
//     });
//   }
// };





import cartModel from "../models/cartModel.js";
import Product from "../models/productModel.js";
import { sendCartReminder } from "../utils/sendSMS.js";
import crypto from "crypto";
import User from "../models/userModel.js"; // Import User model

// Add this missing function at the top
const generateRestoreToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Prepare restore link for abandoned cart
 */
export const prepareRestoreLink = async (cart) => {
  const token = generateRestoreToken();

  cart.restoreToken = token;
  cart.restoreTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  await cart.save();

  return `${process.env.FRONTEND_URL}/restore-cart/${token}`;
};

const reminderSchedules = new Map();

const scheduleReminder = (cartId, delay) => {
  // Clear existing schedule if any
  if (reminderSchedules.has(cartId)) {
    console.log(`Clearing existing schedule for cart ${cartId}`);
    clearTimeout(reminderSchedules.get(cartId));
  }

  // const timeoutId = setTimeout(async () => {
  //   try {
  //     console.log(`⏰ Running reminder for cart ${cartId} after ${delay/1000/60} minutes`);
      
  //     const cart = await cartModel.findById(cartId);
      
  //     if (!cart) {
  //       console.log(`Cart ${cartId} not found`);
  //       reminderSchedules.delete(cartId);
  //       return;
  //     }
      
  //     if (cart.isRestored || cart.items.length === 0) {
  //       console.log(`Cart ${cartId} already restored or empty`);
  //       reminderSchedules.delete(cartId);
  //       return;
  //     }

  //     // Check if first reminder already sent
  //     const isFirstReminder = !cart.firstReminderSent;
      
  //     // Send reminder - pass prepareRestoreLink function
  //     const reminderSent = await sendCartReminder(cart, prepareRestoreLink);
      
  //     if (reminderSent) {
  //       // Update cart with reminder info
  //       if (isFirstReminder) {
  //         cart.firstReminderSent = true;
  //         cart.remindersSent = 1;
  //         console.log(`✅ First reminder sent for cart ${cartId}`);
  //       } else {
  //         cart.remindersSent += 1;
  //         console.log(`✅ Subsequent reminder sent for cart ${cartId}`);
  //       }
        
  //       cart.lastReminderSent = new Date();
  //       await cart.save();
        
  //       // Schedule next reminder if under limit (max 3 reminders)
  //       if (cart.remindersSent < 3) {
  //         let nextDelay;
          
  //         if (cart.remindersSent === 1) {
  //           // Second reminder after 1 minute
  //           nextDelay = 1 * 60 * 1000; // 1 minute
  //           console.log(`⏰ Scheduling second reminder for cart ${cartId} in 1 minute`);
  //         } else if (cart.remindersSent === 2) {
  //           // Third reminder after 2 minutes
  //           nextDelay = 2 * 60 * 1000; // 2 minutes
  //           console.log(`⏰ Scheduling third reminder for cart ${cartId} in 2 minutes`);
  //         }
          
  //         if (nextDelay) {
  //           scheduleReminder(cartId, nextDelay);
  //         } else {
  //           reminderSchedules.delete(cartId);
  //         }
  //       } else {
  //         console.log(`📭 Max reminders (3) reached for cart ${cartId}`);
  //         reminderSchedules.delete(cartId);
  //       }
  //     } else {
  //       console.log(`❌ Reminder failed for cart ${cartId}`);
  //       // Retry in 1 minute if first reminder failed
  //       if (isFirstReminder && cart.remindersSent === 0) {
  //         console.log(`🔄 Retrying reminder for cart ${cartId} in 1 minute`);
  //         scheduleReminder(cartId, 1 * 60 * 1000); // 1 minute for testing
  //       } else {
  //         reminderSchedules.delete(cartId);
  //       }
  //     }
      
  //   } catch (error) {
  //     console.error(`Error in reminder schedule for cart ${cartId}:`, error);
  //     reminderSchedules.delete(cartId);
  //   }
  // }, delay);

   const timeoutId = setTimeout(async () => {
    try {
      console.log(`⏰ Running reminder for cart ${cartId} after ${delay/1000/60} minutes`);
      
      const cart = await cartModel.findById(cartId);
      
      if (!cart) {
        console.log(`Cart ${cartId} not found`);
        reminderSchedules.delete(cartId);
        return;
      }
      
      if (cart.isRestored || cart.items.length === 0) {
        console.log(`Cart ${cartId} already restored or empty`);
        reminderSchedules.delete(cartId);
        return;
      }

      // Check if cart has email, if not try to get from user
      if (!cart.email) {
        console.log(`📧 No email in cart, fetching from user...`);
        const user = await User.findById(cart.userId);
        if (user) {
          // Priority 1: Email from address array
          if (user.address && user.address.length > 0 && user.address[0].email) {
            cart.email = user.address[0].email;
            console.log(`📧 Using address email: ${cart.email}`);
          }
          // Priority 2: Email field
          else if (user.email) {
            cart.email = user.email;
            console.log(`📧 Using user email: ${cart.email}`);
          }
          
          if (cart.email) {
            await cart.save();
            console.log(`✅ Updated cart with email: ${cart.email}`);
          } else {
            console.log(`⚠️ No email found for user ${user._id}`);
          }
        }
      }

      // Check if first reminder already sent
      const isFirstReminder = !cart.firstReminderSent;
      
      // Send reminder - pass prepareRestoreLink function
      const reminderSent = await sendCartReminder(cart, prepareRestoreLink);
      
           if (reminderSent) {
        // Update cart with reminder info
        if (isFirstReminder) {
          cart.firstReminderSent = true;
          cart.remindersSent = 1;
          console.log(`✅ First reminder sent for cart ${cartId}`);
        } else {
          cart.remindersSent += 1;
          console.log(`✅ Subsequent reminder sent for cart ${cartId}`);
        }
        
        cart.lastReminderSent = new Date();
        await cart.save();
        
        // Schedule next reminder if under limit (max 3 reminders)
        if (cart.remindersSent < 3) {
          let nextDelay;
          
          if (cart.remindersSent === 1) {
            // Second reminder after 1 minute
            nextDelay = 50* 60 * 1000; // 50 minute
            console.log(`⏰ Scheduling second reminder for cart ${cartId} in 1 minute`);
          } else if (cart.remindersSent === 2) {
            // Third reminder after 2 minutes
            nextDelay = 2*60 * 60 * 1000; // 50 minutes
            console.log(`⏰ Scheduling third reminder for cart ${cartId} in 2 minutes`);
          }
          
          if (nextDelay) {
            scheduleReminder(cartId, nextDelay);
          } else {
            reminderSchedules.delete(cartId);
          }
        } else {
          console.log(`📭 Max reminders (3) reached for cart ${cartId}`);
          reminderSchedules.delete(cartId);
        }
      } else {
        console.log(`❌ Reminder failed for cart ${cartId}`);
        // Retry in 1 minute if first reminder failed
        if (isFirstReminder && cart.remindersSent === 0) {
          console.log(`🔄 Retrying reminder for cart ${cartId} in 1 minute`);
          scheduleReminder(cartId,  50* 60 * 1000); // 1 minute for testing
        } else {
          reminderSchedules.delete(cartId);
        }
      }
      
      // Auto-cleanup after 24 hours
      setTimeout(() => {
        if (reminderSchedules.has(cartId)) {
          reminderSchedules.delete(cartId);
          console.log(`🧹 Cleaned up schedule for cart ${cartId}`);
        }
      }, 24 * 60 * 60 * 1000);
      
      console.log(`🧹 Cleaned up schedule for cart ${cartId}`);
    } catch (error) {
      console.error(`Error in reminder schedule for cart ${cartId}:`, error);
      reminderSchedules.delete(cartId);
    }
  }, delay);

  reminderSchedules.set(cartId, timeoutId);
  
  // Auto-cleanup after 24 hours
  setTimeout(() => {
    if (reminderSchedules.has(cartId)) {
      reminderSchedules.delete(cartId);
      console.log(`🧹 Cleaned up schedule for cart ${cartId}`);
    }
  }, 24 * 60 * 60 * 1000);
};

/**
 * Save abandoned cart and schedule reminders
 */
export const saveAbandonedCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const phoneNumber = req.user.phoneNumber || req.user.number;
    
    // Get user data to get email from address
    const user = await User.findById(userId);
    let email = "";
    
    if (user) {
      // Priority 1: Email from address array
      if (user.address && user.address.length > 0 && user.address[0].email) {
        email = user.address[0].email;
        console.log("Using email from address:", email);
      }
      // Priority 2: Email field
      else if (user.email) {
        email = user.email;
        console.log("Using email from user field:", email);
      }
    }
    
    // Fallback to request data
    if (!email && req.user.email) {
      email = req.user.email;
      console.log("Using email from request:", email);
    }
    
    const items = req.body.items;

    console.log("=== ABANDONED CART SAVE ===");
    console.log("User:", userId);
    console.log("User email from DB:", user?.email);
    console.log("User address email:", user?.address?.[0]?.email);
    console.log("Selected email for reminder:", email);
    console.log("Phone:", phoneNumber);
    console.log("Items count:", items?.length);

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items in cart"
      });
    }

    // Validate and save items
    const enrichedItems = [];
    
    for (const item of items) {
      try {
        if (!item.productId) {
          console.warn("Item missing productId:", item);
          continue;
        }

        const product = await Product.findById(item.productId);
        
        if (!product) {
          console.warn(`Product not found: ${item.productId}`);
          continue; // Skip invalid products
        }

        // Check product availability
        if (product.status !== 'active' && product.status !== 'published') {
          console.warn(`Product ${product._id} is not active: ${product.status}`);
          continue;
        }

        enrichedItems.push({
          productId: product._id,
          name: product.name,
          quantity: item.quantity || 1,
          priceSnapshot: item.price || product.discountPrice || product.price,
          image: product.thumbImg || "",
          productUpdatedAt: product.updatedAt || new Date(),
          productStatus: product.status || "active",
          pack: product.pack || ""
        });
        
      } catch (error) {
        console.error(`Error processing item:`, error);
      }
    }

    if (enrichedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid products found"
      });
    }

    // Find or create cart
    let abandonedCart = await cartModel.findOne({ 
      userId,
      isRestored: false 
    });

    if (!abandonedCart) {
      abandonedCart = new cartModel({
        userId,
        phoneNumber,
        email, // Save the extracted email
        items: enrichedItems,
        lastActivity: new Date(),
        remindersSent: 0,
        firstReminderSent: false,
        isRestored: false
      });
    } else {
      abandonedCart.items = enrichedItems;
      abandonedCart.phoneNumber = phoneNumber;
      abandonedCart.email = email; // Update with extracted email
      abandonedCart.lastActivity = new Date();
      abandonedCart.updatedAt = new Date();
      abandonedCart.remindersSent = 0; // Reset counter on new cart activity
      abandonedCart.firstReminderSent = false;
      abandonedCart.isRestored = false;
      abandonedCart.restoreToken = null;
      abandonedCart.restoreTokenExpiry = null;
    }

    await abandonedCart.save();

    console.log(`✅ Cart saved: ${abandonedCart._id}, Items: ${enrichedItems.length}`);
    console.log(`📧 Email saved in cart: ${abandonedCart.email}`);

    // Schedule first reminder after 1 minute
    scheduleReminder(abandonedCart._id, 50 * 60 * 1000); // 1 minute
    console.log(`⏰ Scheduled first reminder for cart ${abandonedCart._id} in 1 minute`);

    res.status(200).json({
      success: true,
      message: "Cart saved successfully",
      cartId: abandonedCart._id,
      itemsCount: enrichedItems.length,
      emailSentTo: email
    });
    
  } catch (error) {
    console.error("Error saving abandoned cart:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * Send abandoned cart reminder manually
 */
export const sendAbandonedCartReminder = async (req, res) => {
  try {
    const { cartId } = req.params;
    const cart = await cartModel.findById(cartId);

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart not found or empty"
      });
    }

    // Get user data to ensure we have latest email
    const user = await User.findById(cart.userId);
    if (user) {
      // Update cart email if user has address email
      if (user.address && user.address.length > 0 && user.address[0].email) {
        cart.email = user.address[0].email;
        await cart.save();
        console.log(`Updated cart email to: ${cart.email}`);
      }
    }

    const success = await sendCartReminder(cart, prepareRestoreLink);
    
    if (success) {
      cart.remindersSent += 1;
      cart.lastReminderSent = new Date();
      await cart.save();
      
      res.json({
        success: true,
        message: "Reminder sent successfully",
        emailSentTo: cart.email,
        phoneSentTo: cart.phoneNumber
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send reminder"
      });
    }
  } catch (error) {
    console.error("Error sending reminder:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send reminder"
    });
  }
};

/**
 * Get cart by token
 */
export const getCartByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const cart = await cartModel.findOne({
      restoreToken: token,
      restoreTokenExpiry: { $gt: new Date() },
      isRestored: false
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    res.json({
      success: true,
      cart: {
        _id: cart._id,
        items: cart.items,
        createdAt: cart.createdAt,
        lastActivity: cart.lastActivity
      }
    });
  } catch (error) {
    console.error("Error getting cart by token:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get cart"
    });
  }
};

/**
 * Mark cart as restored
 */
export const markCartAsRestored = async (req, res) => {
  try {
    const { token } = req.params;

    const cart = await cartModel.findOne({
      restoreToken: token,
      restoreTokenExpiry: { $gt: new Date() },
      isRestored: false
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    cart.isRestored = true;
    cart.restoredAt = new Date();
    await cart.save();

    // Clear any scheduled reminders
    if (reminderSchedules.has(cart._id)) {
      clearTimeout(reminderSchedules.get(cart._id));
      reminderSchedules.delete(cart._id);
    }

    res.json({
      success: true,
      message: "Cart restored successfully"
    });
  } catch (error) {
    console.error("Error marking cart as restored:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore cart"
    });
  }
};

/**
 * Send immediate test reminder
 */
export const sendTestReminder = async (req, res) => {
  try {
    const { cartId } = req.params;
    const cart = await cartModel.findById(cartId);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    console.log("=== TEST REMINDER ===");
    console.log("Cart ID:", cart._id);
    console.log("Current cart email:", cart.email);
    
    // Get user to check email in address
    const user = await User.findById(cart.userId);
    if (user) {
      console.log("User email:", user.email);
      console.log("User address email:", user.address?.[0]?.email);
      
      // Update cart email if available in address
      if (user.address && user.address.length > 0 && user.address[0].email) {
        cart.email = user.address[0].email;
        await cart.save();
        console.log("Updated cart email to:", cart.email);
      }
    }

    const restoreLink = await prepareRestoreLink(cart);
    console.log("Restore link:", restoreLink);
    
    // Send test reminder
    const success = await sendCartReminder(cart, prepareRestoreLink);
    
    if (success) {
      res.json({
        success: true,
        message: "Test reminder sent successfully",
        email: cart.email,
        phone: cart.phoneNumber,
        restoreLink: restoreLink
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send test reminder"
      });
    }
  } catch (error) {
    console.error("Error sending test reminder:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Export the generateRestoreToken for other modules
export { generateRestoreToken };
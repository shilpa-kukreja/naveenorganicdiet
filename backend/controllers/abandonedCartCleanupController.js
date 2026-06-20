
import Product from "../models/productModel.js";
import cartModel from "../models/cartModel.js";
import { sendAbandonedCartSMS } from "../utils/sendSMS.js";
import { prepareRestoreLink } from "./abandonedCartController.js";

/**
 * Cleanup abandoned carts with outdated products
 */

export const cleanupUpdatedProducts = async () => {
  try {
    console.log("Starting abandoned cart cleanup...");
    
    // Find carts with items that haven't been restored
    const carts = await cartModel.find({
      items: { $exists: true, $not: { $size: 0 } },
      isRestored: false,
      lastActivity: { 
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    }).populate('items.productId');

    let processedCarts = 0;
    let sentReminders = 0;

    for (const cart of carts) {
      try {
        const validItems = [];

        for (const item of cart.items) {
          // If productId is populated, use it directly
          const product = item.productId || await Product.findById(item.productId);

          // Skip if product doesn't exist or is inactive
          if (!product || !product.isActive) continue;
          
          // Skip if product was updated after cart was saved
          if (product.updatedAt > item.productUpdatedAt) continue;

          validItems.push({
            ...item.toObject(),
            productId: product._id
          });
        }

        // Update cart with valid items
        if (validItems.length !== cart.items.length) {
          cart.items = validItems;
          await cart.save();
        }

        // Send SMS if cart has items and hasn't been sent before
        if (validItems.length > 0 && !cart.restoreToken) {
          const restoreLink = await prepareRestoreLink(cart);
          await sendAbandonedCartSMS(cart.phoneNumber, restoreLink);
          sentReminders++;
        }

        // Remove cart if no valid items remain
        if (validItems.length === 0) {
          await cartModel.findByIdAndDelete(cart._id);
        }

        processedCarts++;
      } catch (cartError) {
        console.error(`Error processing cart ${cart._id}:`, cartError);
        continue;
      }
    }

    console.log(`Cleanup completed: Processed ${processedCarts} carts, sent ${sentReminders} reminders`);
  } catch (error) {
    console.error("Error in cleanup process:", error);
  }
};

/**
 * Remove expired abandoned carts
 */
export const removeExpiredCarts = async () => {
  try {
    const result = await cartModel.deleteMany({
      restoreTokenExpiry: { $lt: new Date() },
      isRestored: false
    });
    
    console.log(`Removed ${result.deletedCount} expired carts`);
    return result.deletedCount;
  } catch (error) {
    console.error("Error removing expired carts:", error);
    return 0;
  }
};
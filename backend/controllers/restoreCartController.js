// controllers/restoreCartController.js
import cartModel from "../models/cartModel.js";
import Product from "../models/productModel.js";

/**
 * Restore abandoned cart
 */
export const restoreCart = async (req, res) => {
  try {
    const { token } = req.params;

    console.log("=== RESTORE CART ===");
    console.log("Token:", token);
    console.log("Current time:", new Date());

    // Find cart with this token
    const cart = await cartModel.findOne({
      restoreToken: token,
      isRestored: false
    });

    if (!cart) {
      console.log("❌ Cart not found with token");
      return res.status(404).json({
        success: false,
        message: "Cart not found or already restored"
      });
    }

    // Check expiry
    if (cart.restoreTokenExpiry && cart.restoreTokenExpiry < new Date()) {
      console.log("❌ Token expired at:", cart.restoreTokenExpiry);
      return res.status(410).json({
        success: false,
        message: "This link has expired. Please add items to cart again."
      });
    }

    console.log("✅ Valid cart found:", cart._id);
    console.log("Items count:", cart.items.length);

    // Validate and prepare items for frontend
    const validatedItems = [];
    
    for (const item of cart.items) {
      try {
        const product = await Product.findById(item.productId);
        
        if (!product) {
          console.log(`Product ${item.productId} not found`);
          continue;
        }

        // Check if product is active
        if (product.status !== 'active' && product.status !== 'published') {
          console.log(`Product ${product._id} is not active: ${product.status}`);
          continue;
        }

        validatedItems.push({
          id: product._id,
          _id: product._id,
          slug: product.slug,
          name: item.name || product.name,
          image: product.thumbImg || item.image || "",
          quantity: item.quantity,
          pack: product.pack || "",
          price: item.priceSnapshot,
          discountPrice: product.discountPrice,
          status: product.status,
          isActive: product.status === "active"
        });
      } catch (error) {
        console.error(`Error validating product:`, error);
      }
    }

    if (validatedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "All items are no longer available"
      });
    }

    // Mark cart as restored
    cart.isRestored = true;
    cart.restoredAt = new Date();
    await cart.save();

    console.log(`✅ Cart restored: ${cart._id}, Items: ${validatedItems.length}`);

    res.json({
      success: true,
      items: validatedItems,
      cartId: cart._id,
      message: "Cart restored successfully"
    });
  } catch (error) {
    console.error("Error restoring cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore cart"
    });
  }
};

/**
 * Check if restore token is valid
 */
// controllers/restoreCartController.js में ये change करें
export const checkRestoreToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Current time को ISO format में convert करें
    const currentTime = new Date();
    
    console.log("Checking token:", token);
    console.log("Server time:", currentTime.toISOString());
    
    const cart = await cartModel.findOne({
      restoreToken: token,
      isRestored: false
    });
    
    if (!cart) {
      console.log("Cart not found");
      return res.json({ valid: false, message: "Cart not found" });
    }
    
    // Manual expiry check
    const expiryTime = new Date(cart.restoreTokenExpiry);
    const isExpired = expiryTime < currentTime;
    
    console.log("Expiry time from DB:", expiryTime.toISOString());
    console.log("Is expired?", isExpired);
    
    res.json({
      valid: !isExpired,
      cartId: cart._id,
      itemCount: cart.items.length,
      expiresAt: cart.restoreTokenExpiry,
      isExpired: isExpired
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ valid: false, message: "Server error" });
  }
};
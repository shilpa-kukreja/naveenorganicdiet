import express from "express";
import orderModel from "../models/orderModel.js";
import { emailQueue } from '../config/queue.js';
import crypto from 'crypto';

const router = express.Router();

// Verify webhook signature middleware
const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers['x-webhook-signature'] || 
                   req.headers['x-shipmozo-signature'] ||
                   req.headers['x-signature'];
  
  if (process.env.NODE_ENV === 'production') {
    if (!signature) {
      return res.status(401).json({ 
        success: false, 
        message: "Missing webhook signature" 
      });
    }

    const payload = JSON.stringify(req.body);
    const secret = process.env.SHIPMOZO_WEBHOOK_SECRET;
    
    if (!secret) {
      console.warn('⚠️ Webhook secret not configured');
      return res.status(500).json({ 
        success: false, 
        message: "Webhook configuration error" 
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (!crypto.timingSafeEqual(
      Buffer.from(signature), 
      Buffer.from(expectedSignature)
    )) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({ 
        success: false, 
        message: "Invalid signature" 
      });
    }
  }
  
  next();
};

// SINGLE webhook endpoint for ALL Shipmozo notifications
router.post("/webhook", verifyWebhookSignature, async (req, res) => {
  try {
    const { 
      event_type,           // "awb_update", "status_update", "delivery_update", etc.
      order_id,            // Your order ID
      awb_number,          // AWB number
      courier,             // Courier name
      tracking_url,        // Tracking URL
      estimated_delivery,  // Estimated delivery date
      status,              // Current status
      scan_date,           // Scan timestamp
      location,            // Scan location
      remarks,             // Remarks
      reference_id,        // Shipmozo reference ID
      data                 // Additional data
    } = req.body;
    
    console.log("📦 Shipmozo Webhook Received:", {
      event_type,
      order_id,
      awb_number,
      status,
      timestamp: new Date().toISOString()
    });

    // Validate required fields
    if (!order_id) {
      return res.status(400).json({ 
        success: false, 
        message: "Order ID is required" 
      });
    }

    // Find order by Shipmozo order ID or your order ID
    const order = await orderModel.findOne({ 
      $or: [
        { "shipmozo.orderId": order_id },
        { "shipmozo.referenceId": order_id },
        { orderid: order_id }
      ]
    });

    if (!order) {
      console.warn(`⚠️ Order not found for webhook: ${order_id}`);
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    let updateData = {};
    let notificationType = null;

    // Handle different event types
    switch (event_type) {
      case "awb_update":
      case "awb_generated":
        // AWB has been generated
        updateData = {
          "shipmozo.awb": awb_number,
          "shipmozo.courier": courier || "Shipmozo",
          "shipmozo.trackingUrl": tracking_url,
          "shipmozo.estimatedDelivery": estimated_delivery ? new Date(estimated_delivery) : null,
          "shipmozo.lastUpdated": new Date(),
          trackingNumber: awb_number,
          courier: courier || "Shipmozo",
          shippingStatus: "PROCESSING",
          $push: {
            shipmentHistory: {
              status: "AWB_GENERATED",
              date: new Date(),
              location: "Warehouse",
              remark: `AWB generated: ${awb_number}`,
              description: "Shipping label created and AWB assigned"
            }
          }
        };
        notificationType = "AWB_GENERATED";
        break;

      case "status_update":
      case "tracking_update":
        // Status update
        const statusMap = {
          'Pickup Pending': 'PROCESSING',
          'Pickup Completed': 'PICKED_UP',
          'In Transit': 'IN_TRANSIT',
          'Out For Delivery': 'OUT_FOR_DELIVERY',
          'Delivered': 'DELIVERED',
          'Undelivered': 'UNDELIVERED',
          'Returned': 'RETURNED'
        };

        const mappedStatus = statusMap[status] || status || "PROCESSING";
        
        updateData = {
          shippingStatus: mappedStatus,
          "shipmozo.lastUpdated": new Date(),
          "shipmozo.currentStatus": status,
          $push: {
            shipmentHistory: {
              status: mappedStatus,
              date: scan_date ? new Date(scan_date) : new Date(),
              location: location || "",
              remark: remarks || "",
              description: `Status updated to: ${status}`
            }
          }
        };
        notificationType = "STATUS_UPDATE";
        break;

      case "delivery_update":
        // Delivery update
        updateData = {
          shippingStatus: "DELIVERED",
          "shipmozo.lastUpdated": new Date(),
          "shipmozo.currentStatus": "Delivered",
          deliveredAt: new Date(),
          $push: {
            shipmentHistory: {
              status: "DELIVERED",
              date: new Date(),
              location: location || "Customer Location",
              remark: remarks || "Package delivered successfully",
              description: "Order delivered to customer"
            }
          }
        };
        notificationType = "DELIVERED";
        break;

      case "exception":
      case "undelivered":
        // Exception/Undelivered
        updateData = {
          shippingStatus: "UNDELIVERED",
          "shipmozo.lastUpdated": new Date(),
          "shipmozo.currentStatus": "Undelivered",
          $push: {
            shipmentHistory: {
              status: "UNDELIVERED",
              date: new Date(),
              location: location || "",
              remark: remarks || "Delivery attempt failed",
              description: "Package could not be delivered"
            }
          }
        };
        notificationType = "UNDELIVERED";
        break;

      default:
        // Generic update - save all data
        updateData = {
          "shipmozo.lastUpdated": new Date(),
          $set: {
            ...(awb_number && { "shipmozo.awb": awb_number }),
            ...(courier && { "shipmozo.courier": courier }),
            ...(status && { 
              shippingStatus: status,
              "shipmozo.currentStatus": status 
            })
          },
          $push: {
            shipmentHistory: {
              status: status || "UPDATE_RECEIVED",
              date: new Date(),
              location: location || "",
              remark: remarks || `Webhook event: ${event_type}`,
              description: "Webhook notification received"
            }
          }
        };
        notificationType = "GENERIC_UPDATE";
    }

    // Update order
    const result = await orderModel.updateOne(
      { _id: order._id },
      updateData
    );

    if (result.modifiedCount === 0) {
      console.warn(`⚠️ Order update failed: ${order_id}`);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to update order" 
      });
    }

    console.log("✅ Webhook processed successfully:", {
      order_id,
      event_type,
      notificationType,
      awb: awb_number
    });

    // Send email notifications based on event type
    if (order.address?.email && notificationType) {
      try {
        await emailQueue.add('sendShippingNotification', {
          to: order.address.email,
          order: {
            orderid: order.orderid,
            items: order.items,
            address: order.address
          },
          notificationType,
          awb: awb_number,
          courier: courier,
          status: status,
          estimatedDelivery: estimated_delivery,
          timestamp: new Date()
        });
      } catch (emailError) {
        console.error("Failed to queue email:", emailError);
      }
    }

    // Immediate response to Shipmozo
    res.json({ 
      success: true, 
      message: "Webhook processed successfully",
      order_id,
      awb: awb_number,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Webhook processing error:", {
      error: error.message,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({ 
      success: false, 
      message: "Webhook processing failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Optional: Webhook test endpoint (for debugging)
router.post("/webhook/test", async (req, res) => {
  console.log("🧪 Webhook test received:", req.body);
  res.json({ 
    success: true, 
    message: "Webhook test successful",
    received: req.body,
    timestamp: new Date().toISOString()
  });
});

export default router;
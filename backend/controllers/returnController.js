// // controllers/returnController.js
// import orderModel from '../models/orderModel.js';
// import userModel from '../models/authModel.js';
// import ReturnRequest from '../models/returnModel.js'; 
// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// dotenv.config();

// // Configure email transporter
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // Request Return
// export const requestReturn = async (req, res) => {
//   try {
//     const { orderId, reason, additionalNotes, returnType } = req.body;
//     const userId = req.user.id;

//     // Find the order
//     const order = await orderModel.findOne({ orderid: orderId });
    
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found"
//       });
//     }

//     // Check if order belongs to user
//     if (order.userId.toString() !== userId) {
//       return res.status(403).json({
//         success: false,
//         message: "Unauthorized"
//       });
//     }

//     // Check if order is delivered
//     if (order.status !== "delivered") {
//       return res.status(400).json({
//         success: false,
//         message: "Only delivered orders can be returned"
//       });
//     }

//     // Check if return already requested
//     const existingReturn = await ReturnRequest.findOne({ orderId: orderId });
//     if (existingReturn) {
//       return res.status(400).json({
//         success: false,
//         message: "Return already requested for this order"
//       });
//     }

//     // Create return request
//     const returnRequest = new ReturnRequest({
//       orderId: orderId,
//       userId: userId,
//       orderDetails: {
//         items: order.items,
//         amount: order.amount,
//         address: order.address
//       },
//       reason: reason,
//       additionalNotes: additionalNotes,
//       returnType: returnType,
//       status: 'pending',
//       requestedAt: new Date()
//     });

//     await returnRequest.save();

//     // Send email to admin
//     await sendReturnRequestEmailToAdmin(returnRequest, order);

//     // Send confirmation email to user
//     await sendReturnConfirmationEmailToUser(returnRequest, order);

//     res.json({
//       success: true,
//       message: "Return request submitted successfully",
//       returnRequest: returnRequest
//     });

//   } catch (error) {
//     console.error("Error in requestReturn:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server Error"
//     });
//   }
// };


import orderModel from '../models/orderModel.js';
import userModel from '../models/authModel.js';
import Razorpay from 'razorpay';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import ReturnRequest from '../models/returnModel.js';
import razorpay from '../utils/razorpay.js'; 
import axios from "axios";
dotenv.config();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Initialize Razorpay
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// Request Return with specific items
// export const requestReturn = async (req, res) => {
//   try {
//     const { orderId, reason, additionalNotes, returnType, returnItems, totalReturnAmount } = req.body;
//     const userId = req.user.id;

//     // Find the order
//     const order = await orderModel.findOne({ orderid: orderId });
    
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found"
//       });
//     }

//     // Check if order belongs to user
//     if (order.userId.toString() !== userId) {
//       return res.status(403).json({
//         success: false,
//         message: "Unauthorized"
//       });
//     }

//     // Check if order is delivered
//     if (order.status !== "delivered") {
//       return res.status(400).json({
//         success: false,
//         message: "Only delivered orders can be returned"
//       });
//     }

//     // Check if return already requested for this order
//     const existingReturn = await ReturnRequest.findOne({ orderId: orderId });
//     if (existingReturn) {
//       return res.status(400).json({
//         success: false,
//         message: "Return already requested for this order"
//       });
//     }

//     // Validate return items
//     const validatedReturnItems = [];
//     for (const returnItem of returnItems) {
//       const orderItem = order.items.find(item => item._id.toString() === returnItem.itemId);
//       if (!orderItem) {
//         return res.status(400).json({
//           success: false,
//           message: `Item ${returnItem.name} not found in order`
//         });
//       }
      
//       if (returnItem.quantity > orderItem.quantity) {
//         return res.status(400).json({
//           success: false,
//           message: `Cannot return more than ${orderItem.quantity} units of ${returnItem.name}`
//         });
//       }

//       validatedReturnItems.push({
//         ...returnItem,
//         originalQuantity: orderItem.quantity
//       });
//     }

//     // Create return request
//     const returnRequest = new ReturnRequest({
//       orderId: orderId,
//       userId: userId,
//       orderDetails: {
//         items: order.items,
//         amount: order.amount,
//         address: order.address,
//         originalOrderAmount: order.amount
//       },
//       returnItems: validatedReturnItems,
//       totalReturnAmount: totalReturnAmount,
//       reason: reason,
//       additionalNotes: additionalNotes,
//       returnType: returnType,
//       status: 'pending',
//       requestedAt: new Date()
//     });

//     await returnRequest.save();

//     // Send detailed email to admin
//     await sendReturnRequestEmailToAdmin(returnRequest, order);

//     // Send detailed confirmation email to user
//     await sendReturnConfirmationEmailToUser(returnRequest, order);

//     res.json({
//       success: true,
//       message: "Return request submitted successfully",
//       returnRequest: returnRequest
//     });

//   } catch (error) {
//     console.error("Error in requestReturn:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server Error"
//     });
//   }
// };

const razorpayPromisify = (method, ...args) => {
  return new Promise((resolve, reject) => {
    method(...args, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Update the requestReturn function to handle COD refund details
export const requestReturn = async (req, res) => {
  try {
    const { orderId, reason, additionalNotes, returnType, returnItems, totalReturnAmount, paymentDetails } = req.body;
    const userId = req.user.id;

    // Find the order
    const order = await orderModel.findOne({ orderid: orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check if order belongs to user
    if (order.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // Check if order is delivered
    if (order.status !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "Only delivered orders can be returned"
      });
    }

    // Check if return already requested for this order
    const existingReturn = await ReturnRequest.findOne({ orderId: orderId });
    if (existingReturn) {
      return res.status(400).json({
        success: false,
        message: "Return already requested for this order"
      });
    }

    // Validate return items
    const validatedReturnItems = [];
    for (const returnItem of returnItems) {
      const orderItem = order.items.find(item => item._id.toString() === returnItem.itemId);
      if (!orderItem) {
        return res.status(400).json({
          success: false,
          message: `Item ${returnItem.name} not found in order`
        });
      }
      
      if (returnItem.quantity > orderItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot return more than ${orderItem.quantity} units of ${returnItem.name}`
        });
      }

      validatedReturnItems.push({
        ...returnItem,
        originalQuantity: orderItem.quantity
      });
    }

    // Prepare return request data
    const returnData = {
      orderId: orderId,
      userId: userId,
      orderDetails: {
        items: order.items,
        amount: order.amount,
        address: order.address,
        originalOrderAmount: order.amount,
        paymentMethod: order.paymentMethod,
        razorpayPaymentId: order.paymentId
      },
      returnItems: validatedReturnItems,
      totalReturnAmount: totalReturnAmount,
      reason: reason,
      additionalNotes: additionalNotes,
      returnType: returnType,
      status: 'pending',
      requestedAt: new Date()
    };

    // If payment method is COD, require bank/UPI details
    if (order.paymentMethod === 'COD' && returnType === 'refund') {
      if (!paymentDetails || !paymentDetails.accountNumber || !paymentDetails.ifscCode || !paymentDetails.accountHolderName) {
        return res.status(400).json({
          success: false,
          message: "Bank account details are required for COD refund"
        });
      }
      
      // Add payment details for COD refund
      returnData.refundDetails = {
        method: 'Bank Transfer',
        status: 'pending',
        bankDetails: {
          accountHolderName: paymentDetails.accountHolderName,
          accountNumber: paymentDetails.accountNumber,
          ifscCode: paymentDetails.ifscCode,
          bankName: paymentDetails.bankName || '',
          upiId: paymentDetails.upiId || ''
        }
      };
    } else if (order.paymentMethod !== 'COD' && returnType === 'refund') {
      // For online payments, initialize refund details
      returnData.refundDetails = {
        method: 'Original Payment Method',
        status: 'pending',
        razorpayPaymentId: order.paymentId,
        amount: totalReturnAmount
      };
    }

    // Create return request
    const returnRequest = new ReturnRequest(returnData);
    await returnRequest.save();

    // Send emails
    await sendReturnRequestEmailToAdmin(returnRequest, order);
    await sendReturnConfirmationEmailToUser(returnRequest, order);

    res.json({
      success: true,
      message: "Return request submitted successfully",
      returnRequest: returnRequest
    });

  } catch (error) {
    console.error("Error in requestReturn:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// Get user's return requests
export const getUserReturnRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const returnRequests = await ReturnRequest.find({ userId })
      .sort({ requestedAt: -1 })
      

    res.json({
      success: true,
      returnRequests: returnRequests
    });

  } catch (error) {
    console.error("Error in getUserReturnRequests:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// Get all return requests (for admin)
export const getAllReturnRequests = async (req, res) => {
  try {
    const returnRequests = await ReturnRequest.find({})
      .sort({ requestedAt: -1 })
      .populate('userId', 'name email number')
      

    res.json({
      success: true,
      returnRequests: returnRequests
    });

  } catch (error) {
    console.error("Error in getAllReturnRequests:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// Admin approve return
// controllers/returnController.js - Update approveReturn function
export const approveReturn = async (req, res) => {
  try {
    const { returnId } = req.body;

    const returnRequest = await ReturnRequest.findById(returnId);
    
    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found"
      });
    }

    // Update return request status
    returnRequest.status = 'approved';
    returnRequest.returnStatus = 'approved'; // Add this line
    returnRequest.approvedAt = new Date();
    returnRequest.approvedBy = req.user?.id || 'admin_user';
    
    // Add to return timeline
    returnRequest.returnTimeline = returnRequest.returnTimeline || [];
    returnRequest.returnTimeline.push({
      status: 'approved',
      description: 'Return request approved by admin',
      date: new Date()
    });
    
    await returnRequest.save();

    // Update order status
    await orderModel.findOneAndUpdate(
      { orderid: returnRequest.orderId },
      { status: 'Return Approved' }
    );

    // Send approval email to user
    await sendReturnApprovalEmail(returnRequest);

    res.json({
      success: true,
      message: "Return approved successfully",
      returnRequest: returnRequest
    });

  } catch (error) {
    console.error("Error in approveReturn:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// Admin reject return
export const rejectReturn = async (req, res) => {
  try {
    const { returnId, rejectionReason } = req.body;

    const returnRequest = await ReturnRequest.findById(returnId);
    
    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found"
      });
    }

    // Update return request status
    returnRequest.status = 'rejected';
    returnRequest.rejectionReason = rejectionReason;
    returnRequest.rejectedAt = new Date();
    returnRequest.rejectedBy = req.user.id;
    await returnRequest.save();

    // Send rejection email to user
    await sendReturnRejectionEmail(returnRequest, rejectionReason);

    res.json({
      success: true,
      message: "Return rejected",
      returnRequest: returnRequest
    });

  } catch (error) {
    console.error("Error in rejectReturn:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};
// razorpayConfig.js - Add this to check your configuration


console.log("🔧 Checking Razorpay Configuration...");
console.log("Environment:", process.env.NODE_ENV);
console.log("Razorpay Key ID:", process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not Set');
console.log("Razorpay Key Secret:", process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not Set');



// Test function to verify Razorpay connection
export const testRazorpayConnection = async () => {
  try {
    console.log("🧪 Testing Razorpay API connection...");
    
    // Try to fetch any payment (using a dummy/test payment ID)
    const testPaymentId = 'dummy_for_test'; // This will fail but show auth status
    
    try {
      await razorpayInstance.payments.fetch(testPaymentId);
    } catch (authError) {
      // Check what kind of error we get
      console.log("🔐 Authentication response:", {
        statusCode: authError.statusCode,
        errorCode: authError.error?.code,
        description: authError.error?.description
      });
      
      if (authError.statusCode === 401) {
        console.log("❌ Razorpay Authentication Failed - Check API keys");
        return false;
      } else if (authError.statusCode === 404) {
        console.log("✅ Razorpay Authentication Successful (got 404 for invalid payment - expected)");
        return true;
      }
    }
    
    return true;
  } catch (error) {
    console.error("❌ Razorpay connection test failed:", error.message);
    return false;
  }
};

export default razorpayInstance;


// Add new function to process refund
// Updated processRefund function in returnController.js
// Updated processRefund function with auto-capture
export const processRefund = async (req, res) => {
  try {
    const { returnId } = req.body;

    const returnRequest = await ReturnRequest.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found"
      });
    }

    if (returnRequest.returnStatus !== 'ready_for_refund') {
      return res.status(400).json({
        success: false,
        message: "Return is not ready for refund processing"
      });
    }

    const order = await orderModel.findOne({ orderid: returnRequest.orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Original order not found"
      });
    }

    const paymentMethod = order.paymentMethod;
    const razorpayPaymentId = order.paymentId;

    console.log("💰 Payment details:", {
      paymentMethod,
      paymentId: razorpayPaymentId,
      returnAmount: returnRequest.totalReturnAmount,
      orderAmount: order.amount
    });

    if (paymentMethod !== 'COD') {
      if (!razorpayPaymentId) {
        return res.status(400).json({
          success: false,
          message: "Payment ID not found",
          code: "PAYMENT_ID_MISSING"
        });
      }

      // Test Razorpay connection first
      console.log("🔧 Testing Razorpay connection...");
      const isRazorpayConnected = await testRazorpayConnection();
      if (!isRazorpayConnected) {
        return res.status(500).json({
          success: false,
          message: "Razorpay authentication failed. Check API keys.",
          code: "RAZORPAY_AUTH_FAILED"
        });
      }

      let refundResponse = null;

      try {
        // Step 1: Fetch payment details with better error handling
        console.log("🔍 Fetching payment details for:", razorpayPaymentId);
        
        let paymentDetails;
        try {
          paymentDetails = await razorpayInstance.payments.fetch(razorpayPaymentId);
          console.log("✅ Payment details fetched successfully");
        } catch (fetchError) {
          console.error("❌ Failed to fetch payment details:", {
            statusCode: fetchError.statusCode,
            error: fetchError.error,
            description: fetchError.error?.description
          });
          
          if (fetchError.statusCode === 404) {
            return res.status(404).json({
              success: false,
              message: "Payment not found in Razorpay system",
              code: "PAYMENT_NOT_FOUND"
            });
          } else if (fetchError.statusCode === 401) {
            return res.status(401).json({
              success: false,
              message: "Razorpay authentication failed",
              code: "RAZORPAY_UNAUTHORIZED"
            });
          }
          
          throw fetchError;
        }
        
        console.log("📊 Payment details:", {
          id: paymentDetails.id,
          status: paymentDetails.status,
          captured: paymentDetails.captured,
          amount: paymentDetails.amount,
          amount_refunded: paymentDetails.amount_refunded || 0,
          currency: paymentDetails.currency,
          method: paymentDetails.method,
          created_at: new Date(paymentDetails.created_at * 1000)
        });

        // Check if payment is captured
        if (!paymentDetails.captured) {
          return res.status(400).json({
            success: false,
            message: "Payment is not captured. Cannot process refund.",
            code: "PAYMENT_NOT_CAPTURED",
            paymentStatus: paymentDetails.status
          });
        }

        // Check if payment is already fully refunded
        if (paymentDetails.amount_refunded >= paymentDetails.amount) {
          return res.status(400).json({
            success: false,
            message: "Payment has already been fully refunded",
            code: "ALREADY_FULLY_REFUNDED",
            amount_refunded: paymentDetails.amount_refunded / 100,
            amount_captured: paymentDetails.amount / 100
          });
        }

        // Calculate refund amount
        const refundAmountInPaise = Math.round(returnRequest.totalReturnAmount * 100);
        const availableForRefund = paymentDetails.amount - (paymentDetails.amount_refunded || 0);
        
        console.log("📊 Refund calculation:", {
          requestedRefundRupees: returnRequest.totalReturnAmount,
          requestedRefundPaise: refundAmountInPaise,
          availableForRefundPaise: availableForRefund,
          availableForRefundRupees: availableForRefund / 100,
          isSufficient: refundAmountInPaise <= availableForRefund
        });

        // Validate refund amount
        if (refundAmountInPaise <= 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid refund amount",
            amount: returnRequest.totalReturnAmount,
            code: "INVALID_REFUND_AMOUNT"
          });
        }

        if (refundAmountInPaise > availableForRefund) {
          return res.status(400).json({
            success: false,
            message: `Cannot refund ₹${returnRequest.totalReturnAmount}. Only ₹${availableForRefund/100} available for refund.`,
            available: availableForRefund / 100,
            requested: returnRequest.totalReturnAmount,
            code: "INSUFFICIENT_REFUND_BALANCE"
          });
        }

        // Prepare refund payload with minimal fields first
        const refundPayload = {
          amount: refundAmountInPaise,
          speed: "normal"
        };

        console.log("📦 Attempting refund with minimal payload:", refundPayload);

        // Try refund with minimal payload first
        try {
          refundResponse = await razorpayInstance.payments.refund(razorpayPaymentId, refundPayload);
          console.log("✅ Refund successful with minimal payload");
        } catch (minimalPayloadError) {
          console.log("⚠️ Minimal payload failed, trying with notes...");
          
          // Try with notes but keep it simple
          refundPayload.notes = {
            reason: "Product return",
            returnId: returnId.toString().substring(0, 20),
            orderId: returnRequest.orderId
          };
          
          refundResponse = await razorpayInstance.payments.refund(razorpayPaymentId, refundPayload);
          console.log("✅ Refund successful with notes");
        }

        console.log("🎉 Refund processed successfully:", {
          refundId: refundResponse.id,
          status: refundResponse.status,
          amount: refundResponse.amount / 100,
          entity: refundResponse.entity
        });

        // Update return request
        returnRequest.refundDetails = {
          method: 'Razorpay',
          status: refundResponse.status,
          processedAt: new Date(),
          razorpayRefundId: refundResponse.id,
          razorpayPaymentId: razorpayPaymentId,
          amount: refundResponse.amount / 100,
          transactionId: refundResponse.id,
          notes: `Refund processed. Razorpay Refund ID: ${refundResponse.id}`,
          refundResponse: {
            id: refundResponse.id,
            amount: refundResponse.amount,
            currency: refundResponse.currency,
            status: refundResponse.status
          }
        };

        returnRequest.returnStatus = 'refund_processed';
        
        // Update timeline
        returnRequest.returnTimeline.push({
          status: 'refund_processed',
          description: `Refund of ₹${refundResponse.amount / 100} processed via Razorpay`,
          date: new Date(),
          metadata: {
            razorpayRefundId: refundResponse.id,
            amount: refundResponse.amount / 100
          }
        });
        
        await returnRequest.save();

        // Update order
        await orderModel.findOneAndUpdate(
          { orderid: returnRequest.orderId },
          {
            $push: {
              orderHistory: {
                status: 'Refund Processed',
                date: new Date(),
                description: `Refund of ₹${refundResponse.amount / 100} processed via Razorpay. Refund ID: ${refundResponse.id}`,
                transactionId: refundResponse.id
              }
            },
            $set: {
              refundStatus: 'processed',
              lastRefundId: refundResponse.id
            }
          }
        );

        return res.json({
          success: true,
          message: "Refund processed successfully",
          refundDetails: returnRequest.refundDetails,
          refundId: refundResponse.id
        });

      } catch (razorpayError) {
        console.error("❌ Razorpay refund error:", {
          statusCode: razorpayError.statusCode,
          error: razorpayError.error,
          description: razorpayError.error?.description,
          field: razorpayError.error?.field,
          source: razorpayError.error?.source
        });

        // Return detailed error for debugging
        return res.status(razorpayError.statusCode || 400).json({
          success: false,
          message: razorpayError.error?.description || "Razorpay refund failed",
          code: razorpayError.error?.code || "RAZORPAY_ERROR",
          field: razorpayError.error?.field,
          source: razorpayError.error?.source,
          metadata: razorpayError.error?.metadata,
          troubleshooting: [
            "Check if payment is in captured state",
            "Verify payment method supports refunds",
            "Ensure amount is in paise (not rupees)",
            "Check Razorpay dashboard for payment status",
            "Verify API keys are correct for environment (test/live)"
          ]
        });
      }
    } else {
      // COD refund processing
      console.log("💸 Processing COD refund");
      
      returnRequest.refundDetails = {
        method: 'Bank Transfer',
        status: 'pending_manual_processing',
        processedAt: new Date(),
        transactionId: `MANUAL_${Date.now()}`,
        amount: returnRequest.totalReturnAmount,
        notes: 'COD refund requires manual bank transfer processing'
      };
      
      returnRequest.returnStatus = 'refund_pending_manual';
      
      // Update timeline
      returnRequest.returnTimeline.push({
        status: 'refund_pending_manual',
        description: `Refund of ₹${returnRequest.totalReturnAmount} marked for manual processing`,
        date: new Date()
      });
      
      await returnRequest.save();

      // Update order
      await orderModel.findOneAndUpdate(
        { orderid: returnRequest.orderId },
        {
          $push: {
            orderHistory: {
              status: 'Refund Pending (Manual)',
              date: new Date(),
              description: `Refund of ₹${returnRequest.totalReturnAmount} requires manual bank transfer`,
              transactionId: returnRequest.refundDetails.transactionId
            }
          },
          $set: {
            refundStatus: 'pending_manual'
          }
        }
      );

      return res.json({
        success: true,
        message: "COD refund marked for manual processing",
        refundDetails: returnRequest.refundDetails
      });
    }

  } catch (error) {
    console.error("🚨 Error in processRefund:", error.message, error.stack);
    
    return res.status(500).json({
      success: false,
      message: "Failed to process refund",
      error: error.message,
      code: "INTERNAL_SERVER_ERROR"
    });
  }
};

// Add function to get refund status
export const getRefundStatus = async (req, res) => {
  try {
    const { returnId } = req.params;

    const returnRequest = await ReturnRequest.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found"
      });
    }

    res.json({
      success: true,
      refundDetails: returnRequest.refundDetails,
      returnStatus: returnRequest.returnStatus
    });

  } catch (error) {
    console.error("Error in getRefundStatus:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get refund status"
    });
  }
};

// Add function to send refund processed email
const sendRefundProcessedEmail = async (returnRequest, order) => {
  try {
    const user = await userModel.findById(returnRequest.userId);
    
    if (!user || !user.email) return;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `✅ Refund Processed - Return #${returnRequest._id.toString().slice(-8).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #10b981; padding-bottom: 10px;">Your Refund Has Been Processed!</h2>
          
          <p>Dear ${user.name || 'Valued Customer'},</p>
          <p>We are pleased to inform you that your refund for <strong>Order #${returnRequest.orderId}</strong> has been successfully processed.</p>

          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="color: #047857; margin-top: 0;">Refund Details</h3>
            <p><strong>Refund Amount:</strong> ₹${returnRequest.totalReturnAmount}</p>
            <p><strong>Transaction ID:</strong> ${returnRequest.refundDetails.transactionId}</p>
            <p><strong>Processed Date:</strong> ${new Date(returnRequest.refundDetails.processedAt).toLocaleDateString('en-IN')}</p>
            <p><strong>Refund Method:</strong> ${returnRequest.refundDetails.method}</p>
            
            ${order.paymentMethod === 'COD' && returnRequest.refundDetails.bankDetails ? `
              <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #86efac;">
                <h4 style="color: #065f46; margin-top: 0;">Bank Transfer Details</h4>
                <p><strong>Account Holder:</strong> ${returnRequest.refundDetails.bankDetails.accountHolderName}</p>
                <p><strong>Account Number:</strong> ${returnRequest.refundDetails.bankDetails.accountNumber}</p>
                <p><strong>IFSC Code:</strong> ${returnRequest.refundDetails.bankDetails.ifscCode}</p>
                ${returnRequest.refundDetails.bankDetails.bankName ? `<p><strong>Bank Name:</strong> ${returnRequest.refundDetails.bankDetails.bankName}</p>` : ''}
                <p><strong>Note:</strong> Refund will reflect in your account within 3-5 business days</p>
              </div>
            ` : `
              <p><strong>Note:</strong> Refund will reflect in your original payment method within 5-7 business days</p>
            `}
          </div>

          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Thank you for shopping with us!</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Refund processed email sent to user ${user.email}`);
  } catch (error) {
    console.error('Error sending refund processed email:', error);
  }
};

// Update the confirmReturnReceived function
export const confirmReturnReceived = async (req, res) => {
  try {
    const { returnId } = req.body;

    const returnRequest = await ReturnRequest.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found"
      });
    }

    // Initialize returnTimeline if it doesn't exist
    if (!returnRequest.returnTimeline) {
      returnRequest.returnTimeline = [];
    }

    // Find the original order (MOVE THIS UP)
    const order = await orderModel.findOne({ orderid: returnRequest.orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Original order not found"
      });
    }

    // Update return status
    returnRequest.status = 'completed';
    returnRequest.returnStatus = 'received_at_warehouse';
    returnRequest.completedAt = new Date();
    
    // Update Shipmozo pickup status
    if (returnRequest.shipmozoReturn?.pickupDetails) {
      returnRequest.shipmozoReturn.pickupDetails.pickupStatus = 'picked';
    }
    
    // Update pickup details
    if (returnRequest.pickupDetails) {
      returnRequest.pickupDetails.pickupStatus = 'delivered';
    }
    
    // Add to timeline
    returnRequest.returnTimeline.push({
      status: 'received_at_warehouse',
      description: 'Return received at warehouse and verified',
      date: new Date()
    });
    
    // For COD refunds, keep status as pending until manual processing
    if (returnRequest.returnType === 'refund') {
      
      if (order.paymentMethod === 'COD') {
        // For COD, refund details should already be present from return request
        returnRequest.returnStatus = 'ready_for_refund';
        returnRequest.returnTimeline.push({
          status: 'ready_for_refund',
          description: 'Return verified. Refund pending manual processing',
          date: new Date()
        });
      } else {
        // For online payments, initialize refund details
        returnRequest.refundDetails = {
          method: 'Original Payment Method',
          status: 'pending',
          razorpayPaymentId: order.paymentId,
          amount: returnRequest.totalReturnAmount
        };
        returnRequest.returnStatus = 'ready_for_refund';
        returnRequest.returnTimeline.push({
          status: 'ready_for_refund',
          description: 'Return verified. Ready for refund processing',
          date: new Date()
        });
      }
    } else if (returnRequest.returnType === 'exchange') {
      returnRequest.returnStatus = 'completed';
    }
    
    await returnRequest.save();

    // Update order status
    await orderModel.findOneAndUpdate(
      { orderid: returnRequest.orderId },
      { 
        status: 'Return Completed',
        $push: {
          orderHistory: {
            status: 'Return Completed',
            date: new Date(),
            description: returnRequest.returnType === 'refund' 
              ? `Return completed. ${order.paymentMethod === 'COD' ? 'Refund pending processing' : 'Ready for refund processing'}`
              : 'Exchange completed'
          }
        }
      }
    );

    res.json({
      success: true,
      message: returnRequest.returnType === 'refund' 
        ? `Return received. ${order.paymentMethod === 'COD' ? 'Refund pending manual processing' : 'Ready for refund processing'}`
        : 'Return received and exchange processed',
      returnRequest: {
        id: returnRequest._id,
        orderId: returnRequest.orderId,
        status: returnRequest.status,
        returnStatus: returnRequest.returnStatus,
        returnType: returnRequest.returnType,
        totalReturnAmount: returnRequest.totalReturnAmount,
        refundDetails: returnRequest.refundDetails,
        shipmozoReturn: returnRequest.shipmozoReturn,
        returnTimeline: returnRequest.returnTimeline
      }
    });

  } catch (error) {
    console.error("Error confirming return:", error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm return",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const sendReturnRequestEmailToAdmin = async (returnRequest, order) => {
  try {
    const user = await userModel.findById(returnRequest.userId);
    
    // Create product table HTML
    let productTable = `
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Image</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantity</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Price</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Total</th>
          </tr>
        </thead>
        <tbody>
    `;

    returnRequest.returnItems.forEach(item => {
      productTable += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">
            <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover;" />
          </td>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">₹${item.price}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">₹${item.totalAmount}</td>
        </tr>
      `;
    });

    productTable += `
        </tbody>
        <tfoot>
          <tr style="background-color: #f9fafb;">
            <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">Total Return Amount:</td>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">₹${returnRequest.totalReturnAmount}</td>
          </tr>
        </tfoot>
      </table>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `📦 New Return Request - Order #${returnRequest.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #00a63d; padding-bottom: 10px;">New Return Request Received</h2>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="color: #444; margin-top: 0;">Return Summary</h3>
            <p><strong>Order ID:</strong> ${returnRequest.orderId}</p>
            <p><strong>Customer:</strong> ${user?.name || 'N/A'} (${user?.email || 'N/A'})</p>
            <p><strong>Customer Phone:</strong> ${user?.number || 'N/A'}</p>
            <p><strong>Return Type:</strong> ${returnRequest.returnType}</p>
            <p><strong>Reason:</strong> ${returnRequest.reason}</p>
            <p><strong>Additional Notes:</strong> ${returnRequest.additionalNotes || 'None'}</p>
            <p><strong>Requested At:</strong> ${returnRequest.requestedAt.toLocaleString()}</p>
          </div>

          <h3 style="color: #444;">Products to Return:</h3>
          ${productTable}

          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h4 style="color: #856404; margin-top: 0;">Order Details:</h4>
            <p><strong>Original Order Amount:</strong> ₹${order.amount}</p>
            <p><strong>Shipping Address:</strong> ${order.address.address1}, ${order.address.city}, ${order.address.state} - ${order.address.postalCode}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.ADMIN_URL || 'http://localhost:3000/admin'}/returns" 
               style="background-color: #00a63d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Review Return Request
            </a>
          </div>

          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            Please review this return request within 24 hours.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Detailed return request email sent to admin for Order #${returnRequest.orderId}`);
  } catch (error) {
    console.error('Error sending return request email:', error);
  }
};

const sendReturnConfirmationEmailToUser = async (returnRequest, order) => {
  try {
    const user = await userModel.findById(returnRequest.userId);
    
    if (!user || !user.email) return;

    // Create product table HTML
    let productTable = `
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantity</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Price</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Total</th>
          </tr>
        </thead>
        <tbody>
    `;

    returnRequest.returnItems.forEach(item => {
      productTable += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">₹${item.price}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">₹${item.totalAmount}</td>
        </tr>
      `;
    });

    productTable += `
        </tbody>
        <tfoot>
          <tr style="background-color: #f9fafb;">
            <td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">Total Return Amount:</td>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">₹${returnRequest.totalReturnAmount}</td>
          </tr>
        </tfoot>
      </table>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `✅ Return Request Received - Order #${returnRequest.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #00a63d; padding-bottom: 10px;">Your Return Request Has Been Received</h2>
          
          <p>Dear ${user.name || 'Valued Customer'},</p>
          <p>We have received your return request for <strong>Order #${returnRequest.orderId}</strong>.</p>

          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="color: #0369a1; margin-top: 0;">Return Request Details</h3>
            <p><strong>Return Request ID:</strong> ${returnRequest._id.toString().slice(-8).toUpperCase()}</p>
            <p><strong>Order ID:</strong> ${returnRequest.orderId}</p>
            <p><strong>Return Type:</strong> ${returnRequest.returnType}</p>
            <p><strong>Reason:</strong> ${returnRequest.reason}</p>
            <p><strong>Request Date:</strong> ${returnRequest.requestedAt.toLocaleDateString('en-IN')}</p>
            <p><strong>Status:</strong> <span style="background-color: #fef3c7; color: #92400e; padding: 3px 8px; border-radius: 3px; font-size: 12px;">Pending Review</span></p>
          </div>

          <h3 style="color: #444;">Products Selected for Return:</h3>
          ${productTable}

          <div style="background-color: #fef3c7; border: 1px solid #fde68a; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h4 style="color: #92400e; margin-top: 0;">Next Steps:</h4>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li>Our team will review your request within <strong>24-48 hours</strong></li>
              <li>You will receive an update via email once your request is processed</li>
              ${returnRequest.returnType === 'refund' ? 
                `<li>If approved, your refund of <strong>₹${returnRequest.totalReturnAmount}</strong> will be processed within 5-7 business days</li>` :
                `<li>If approved, our team will contact you for exchange options</li>`
              }
              <li>Keep the items in original condition with all tags</li>
            </ol>
          </div>

          <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h4 style="color: #065f46; margin-top: 0;">Important Notes:</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Do not use the items while return request is pending</li>
              <li>Keep the original packaging and invoice ready</li>
              <li>A pickup executive will contact you if return is approved</li>
              <li>For any queries, reply to this email or contact our customer support</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">You can track your return status in your account dashboard.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/user/returns" 
               style="background-color: #00a63d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
              View Return Status
            </a>
          </div>

          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            Thank you for choosing us. We're committed to resolving your concern promptly.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Detailed return confirmation email sent to user ${user.email}`);
  } catch (error) {
    console.error('Error sending return confirmation email:', error);
  }
};

// Update other email functions to include product details
const sendReturnApprovalEmail = async (returnRequest) => {
  try {
    const user = await userModel.findById(returnRequest.userId);
    const order = await orderModel.findOne({ orderid: returnRequest.orderId });
    
    if (!user || !user.email) return;

    // Create product table HTML
    let productTable = `
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantity</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Amount</th>
          </tr>
        </thead>
        <tbody>
    `;

    returnRequest.returnItems.forEach(item => {
      productTable += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">₹${item.totalAmount}</td>
        </tr>
      `;
    });

    productTable += `
        </tbody>
        <tfoot>
          <tr style="background-color: #f9fafb;">
            <td colspan="2" style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">Total:</td>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">₹${returnRequest.totalReturnAmount}</td>
          </tr>
        </tfoot>
      </table>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `✅ Return Request Approved - Order #${returnRequest.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #10b981; padding-bottom: 10px;">Your Return Request Has Been Approved!</h2>
          
          <p>Dear ${user.name || 'Valued Customer'},</p>
          <p>We are pleased to inform you that your return request for <strong>Order #${returnRequest.orderId}</strong> has been approved.</p>

          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="color: #047857; margin-top: 0;">Approval Details</h3>
            <p><strong>Return Request ID:</strong> ${returnRequest._id.toString().slice(-8).toUpperCase()}</p>
            <p><strong>Approval Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            <p><strong>Return Type:</strong> ${returnRequest.returnType}</p>
          </div>

          <h3 style="color: #444;">Approved Products for Return:</h3>
          ${productTable}

          ${returnRequest.returnType === 'refund' ? 
            `<div style="background-color: #dbeafe; border: 1px solid #93c5fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h4 style="color: #1e40af; margin-top: 0;">Refund Information</h4>
              <p><strong>Refund Amount:</strong> ₹${returnRequest.totalReturnAmount}</p>
              <p><strong>Refund Method:</strong> Original payment method</p>
              <p><strong>Processing Time:</strong> 5-7 business days after we receive the items</p>
            </div>` :
            `<div style="background-color: #f5f3ff; border: 1px solid #c4b5fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h4 style="color: #5b21b6; margin-top: 0;">Exchange Information</h4>
              <p>Our team will contact you within 24 hours to discuss exchange options for the approved items.</p>
            </div>`
          }

          <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h4 style="color: #92400e; margin-top: 0;">Next Steps - Return Process:</h4>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li><strong>Packaging:</strong> Please ensure all items are in original condition with tags</li>
              <li><strong>Pack securely:</strong> Use original packaging if available</li>
              <li><strong>Documents:</strong> Keep the invoice and all accessories ready</li>
              <li><strong>Pickup:</strong> A pickup executive will contact you within 24 hours</li>
              <li><strong>Tracking:</strong> You will receive a tracking number once items are picked up</li>
            </ol>
          </div>

          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Track your return status in your account dashboard.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/user/returns" 
               style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
              Track Return Status
            </a>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Return approval email sent to user ${user.email}`);
  } catch (error) {
    console.error('Error sending return approval email:', error);
  }
};

const sendReturnRejectionEmail = async (returnRequest, rejectionReason) => {
  try {
    const user = await userModel.findById(returnRequest.userId);
    const order = await orderModel.findOne({ orderid: returnRequest.orderId });
    
    if (!user || !user.email) return;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Return Request Update - Order #${returnRequest.orderId}`,
      html: `
        <h2>Return Request Status Update</h2>
        <p>Dear ${user.name || 'Customer'},</p>
        <p>Your return request for Order #${returnRequest.orderId} has been reviewed.</p>
        <p><strong>Status:</strong> Rejected</p>
        <p><strong>Reason for Rejection:</strong> ${rejectionReason}</p>
        <p><strong>Order Details:</strong></p>
        <ul>
          <li><strong>Order ID:</strong> ${returnRequest.orderId}</li>
          <li><strong>Order Amount:</strong> ₹${order.amount}</li>
          <li><strong>Return Request Date:</strong> ${returnRequest.requestedAt.toLocaleDateString()}</li>
        </ul>
        <p>If you have any questions or concerns about this decision, please contact our customer support.</p>
        <br/>
        <p>Thank you,<br/>The Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Return rejection email sent to user ${user.email}`);
  } catch (error) {
    console.error('Error sending return rejection email:', error);
  }
};

// Get return status counts for dashboard
export const getReturnStats = async (req, res) => {
  try {
    const stats = {
      total: await ReturnRequest.countDocuments(),
      pending: await ReturnRequest.countDocuments({ status: 'pending' }),
      approved: await ReturnRequest.countDocuments({ status: 'approved' }),
      rejected: await ReturnRequest.countDocuments({ status: 'rejected' }),
      completed: await ReturnRequest.countDocuments({ status: 'completed' })
    };

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error("Error in getReturnStats:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};







// Push return to Shipmozo
// Push return to Shipmozo - FIXED VERSION
export const pushReturnToShipmozo = async (req, res) => {
  try {
    const { returnId } = req.body;

    // Validate returnId
    if (!returnId) {
      return res.status(400).json({
        success: false,
        message: "Return ID is required"
      });
    }

    // Find the return request
    const returnRequest = await ReturnRequest.findById(returnId)
      .populate('userId', 'name email number');
    
    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found"
      });
    }

    // Check if return is approved
    if (returnRequest.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: "Only approved returns can be pushed to Shipmozo"
      });
    }

    // Check if already pushed
    if (returnRequest.shipmozoReturn?.status === 'pushed') {
      return res.status(400).json({
        success: false,
        message: "Return already pushed to Shipmozo",
        data: returnRequest.shipmozoReturn
      });
    }

    // Find the original order
    const order = await orderModel.findOne({ orderid: returnRequest.orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Original order not found"
      });
    }

    // Prepare product details for return with proper SKU
    const product_detail = returnRequest.returnItems.map(item => ({
      name: item.name,
      sku_number: generateShortSKU(item.itemId), // Fixed: Generate short SKU
      quantity: item.quantity,
      discount: "",
      hsn: "",
      unit_price: item.price,
      product_category: "Other"
    }));

    // Calculate total weight
    const totalWeight = returnRequest.returnItems.length * 0.5;

    // Map return reason to Shipmozo reason ID
    const getReturnReasonId = (reason) => {
      const reasonMap = {
        'Color difference': 1,
        'Wrong size': 2,
        'Product damaged': 3,
        'Wrong item received': 4,
        'Not as described': 5,
        'Missing parts': 6,
        'Quality issues': 7,
        'Changed mind': 8,
        'Found better price': 9,
        'Too late delivery': 10,
        'Other': 11
      };
      
      return reasonMap[reason] || 11;
    };

    // Generate unique return order ID
    const returnOrderId = `RET${Date.now().toString().slice(-8)}`;

    // Prepare Shipmozo payload
    const payload = {
      order_id: returnOrderId,
      order_date: new Date(returnRequest.requestedAt).toISOString().split("T")[0],
      order_type: "ESSENTIALS",
      
      pickup_name: order.address.fullName,
      pickup_phone: Number(order.address.phone),
      pickup_email: order.address.email,
      pickup_address_line_one: order.address.address1,
      pickup_address_line_two: order.address.address2 || "",
      pickup_pin_code: Number(order.address.postalCode),
      pickup_city: order.address.city,
      pickup_state: order.address.state,
      
      product_detail,
      
      payment_type: order.payment ? "PREPAID" : "COD",
      weight: totalWeight,
      length: 10,
      width: 10,
      height: 10,
      
      warehouse_id: process.env.SHIPMOZO_WAREHOUSE_ID || "",
      return_reason_id: getReturnReasonId(returnRequest.reason),
      customer_request: returnRequest.returnType.toUpperCase(),
      reason_comment: returnRequest.additionalNotes || returnRequest.reason
    };

    console.log("🚀 Pushing return to Shipmozo:", payload.order_id);
    console.log("📦 Product details:", product_detail);

    // Call Shipmozo API
    const response = await axios.post(
      "https://shipping-api.com/app/api/v1/push-return-order",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "public-key": process.env.SHIPMOZO_PUBLIC_KEY.trim(),
          "private-key": process.env.SHIPMOZO_PRIVATE_KEY.trim()
        },
        timeout: 30000
      }
    );

    console.log("✅ Shipmozo Return Response:", response.data);

    // Update return request with Shipmozo data
    if (response.data.result === "1") {
      const shipmozoData = {
        pushedAt: new Date(),
        returnOrderId: response.data.data.order_id || payload.order_id,
        referenceId: response.data.data.reference_id || response.data.data.order_id,
        awbNumber: response.data.data.awb_number || `SM${Date.now().toString().slice(-8)}`,
        status: 'pushed',
        apiResponse: response.data.data,
        pickupDetails: {
          scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          trackingUrl: response.data.data.tracking_url || "",
          pickupStatus: 'scheduled'
        }
      };

      // Update return request
      returnRequest.shipmozoReturn = shipmozoData;
      returnRequest.status = 'picked_up';
      returnRequest.returnStatus = 'pickup_scheduled';
      returnRequest.pickupDetails = {
        scheduledDate: shipmozoData.pickupDetails.scheduledDate,
        pickupAddress: order.address,
        trackingNumber: shipmozoData.awbNumber,
        carrier: 'Shipmozo',
        pickupStatus: 'scheduled'
      };
      
      // Add to timeline
      returnRequest.returnTimeline = returnRequest.returnTimeline || [];
      returnRequest.returnTimeline.push({
        status: 'pickup_scheduled',
        description: 'Return pickup scheduled with Shipmozo',
        date: new Date()
      });
      
      await returnRequest.save();

      // Update order status
      await orderModel.findOneAndUpdate(
        { orderid: returnRequest.orderId },
        { 
          status: 'Return Scheduled',
          $push: {
            orderHistory: {
              status: 'Return Scheduled',
              date: new Date(),
              description: 'Return pickup scheduled with shipping partner'
            }
          }
        }
      );

      return res.json({
        success: true,
        message: "Return successfully pushed to Shipmozo",
        data: {
          returnId: returnRequest._id,
          orderId: returnRequest.orderId,
          shipmozo: shipmozoData,
          pickupDetails: returnRequest.pickupDetails
        }
      });
    } else {
      throw new Error(response.data.message || "Shipmozo return push failed");
    }

  } catch (error) {
    console.error("❌ Shipmozo return push error:", {
      message: error.message,
      response: error.response?.data,
      returnId: req.body.returnId // FIXED: Use req.body.returnId instead of returnId
    });

    // Update return request with error
    if (req.body.returnId) { // FIXED: Use req.body.returnId
      await ReturnRequest.findByIdAndUpdate(req.body.returnId, {
        $set: {
          'shipmozoReturn.status': 'failed',
          'shipmozoReturn.apiResponse': error.response?.data || { error: error.message },
          'shipmozoReturn.errorDetails': {
            message: error.message,
            timestamp: new Date()
          }
        }
      });
    }

    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        "Failed to push return to Shipmozo";

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      code: "SHIPMOZO_RETURN_PUSH_ERROR",
      details: error.response?.data?.data || error.response?.data
    });
  }
};

// Helper function to generate short SKU
const generateShortSKU = (itemId) => {
  if (!itemId) return `SKU${Date.now().toString().slice(-6)}`;
  
  // If itemId is ObjectId, use last 8 characters
  if (typeof itemId === 'string') {
    if (itemId.includes('ObjectId')) {
      return `SKU${itemId.slice(-8)}`;
    }
    // For regular strings, take first 20 characters
    return itemId.slice(0, 20);
  }
  
  // Default fallback
  return `SKU${Date.now().toString().slice(-6)}`;
};

// Confirm return received at warehouse
// Updated confirmReturnReceived function
// export const confirmReturnReceived = async (req, res) => {
//   try {
//     const { returnId } = req.body;

//     const returnRequest = await ReturnRequest.findById(returnId);
//     if (!returnRequest) {
//       return res.status(404).json({
//         success: false,
//         message: "Return request not found"
//       });
//     }

//     // Initialize returnTimeline if it doesn't exist
//     if (!returnRequest.returnTimeline) {
//       returnRequest.returnTimeline = [];
//     }

//     // Update return status
//     returnRequest.status = 'completed';
//     returnRequest.returnStatus = 'received_at_warehouse';
//     returnRequest.completedAt = new Date();
    
//     // Update Shipmozo pickup status
//     if (returnRequest.shipmozoReturn?.pickupDetails) {
//       returnRequest.shipmozoReturn.pickupDetails.pickupStatus = 'picked';
//     }
    
//     // Update pickup details
//     if (returnRequest.pickupDetails) {
//       returnRequest.pickupDetails.pickupStatus = 'delivered';
//     }
    
//     // Add to timeline
//     returnRequest.returnTimeline.push({
//       status: 'received_at_warehouse',
//       description: 'Return received at warehouse and verified',
//       date: new Date()
//     });
    
//     // Process refund if applicable
//     if (returnRequest.returnType === 'refund') {
//       returnRequest.refundDetails = {
//         amount: returnRequest.totalReturnAmount,
//         method: 'Original Payment Method',
//         status: 'processed',
//         processedAt: new Date()
//       };
      
//       returnRequest.returnTimeline.push({
//         status: 'refund_processed',
//         description: `Refund of ₹${returnRequest.totalReturnAmount} processed`,
//         date: new Date()
//       });
      
//       returnRequest.returnStatus = 'refund_processed';
//     } else if (returnRequest.returnType === 'exchange') {
//       returnRequest.returnStatus = 'completed';
//     }
    
//     await returnRequest.save();

//     // Update order status
//     await orderModel.findOneAndUpdate(
//       { orderid: returnRequest.orderId },
//       { 
//         status: 'Return Completed',
//         $push: {
//           orderHistory: {
//             status: 'Return Completed',
//             date: new Date(),
//             description: returnRequest.returnType === 'refund' 
//               ? `Refund of ₹${returnRequest.totalReturnAmount} processed` 
//               : 'Exchange completed'
//           }
//         }
//       }
//     );

//     res.json({
//       success: true,
//       message: returnRequest.returnType === 'refund' 
//         ? 'Return received and refund processed' 
//         : 'Return received and exchange processed',
//       returnRequest: {
//         id: returnRequest._id,
//         orderId: returnRequest.orderId,
//         status: returnRequest.status,
//         returnStatus: returnRequest.returnStatus,
//         returnType: returnRequest.returnType,
//         totalReturnAmount: returnRequest.totalReturnAmount,
//         refundDetails: returnRequest.refundDetails,
//         shipmozoReturn: returnRequest.shipmozoReturn,
//         returnTimeline: returnRequest.returnTimeline
//       }
//     });

//   } catch (error) {
//     console.error("Error confirming return:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to confirm return",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// Get return tracking status
export const getReturnTracking = async (req, res) => {
  try {
    const { returnId } = req.params;

    const returnRequest = await ReturnRequest.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found"
      });
    }

    let trackingData = null;
    
    // If we have Shipmozo AWB, try to get tracking
    if (returnRequest.shipmozoReturn?.awbNumber) {
      try {
        const response = await axios.get(
          "https://shipping-api.com/app/api/v1/track-order",
          {
            params: {
              awb_number: returnRequest.shipmozoReturn.awbNumber
            },
            headers: {
              "Content-Type": "application/json",
              "public-key": process.env.SHIPMOZO_PUBLIC_KEY,
              "private-key": process.env.SHIPMOZO_PRIVATE_KEY
            }
          }
        );
        trackingData = response.data;
      } catch (trackingError) {
        console.error("Tracking API error:", trackingError.message);
      }
    }

    res.json({
      success: true,
      returnRequest: {
        id: returnRequest._id,
        orderId: returnRequest.orderId,
        status: returnRequest.status,
        returnStatus: returnRequest.returnStatus,
        shipmozoReturn: returnRequest.shipmozoReturn,
        pickupDetails: returnRequest.pickupDetails,
        returnTimeline: returnRequest.returnTimeline,
        tracking: trackingData
      }
    });

  } catch (error) {
    console.error("Error getting return tracking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get return tracking"
    });
  }
};
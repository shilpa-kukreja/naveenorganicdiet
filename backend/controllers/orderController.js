// import Razorpay from "razorpay";
// import crypto from "crypto";
// import orderModel from "../models/orderModel.js";
// import nodemailer from 'nodemailer';
// import { emailQueue, orderQueue } from '../config/queue.js';
// import userModel from "../models/authModel.js";
// import referrralModel from "../models/referralModel.js";
// import dotenv from "dotenv";
// dotenv.config();




// const razorpayInstance = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });


// console.log("🚀 Razorpay Instance Configured:", {
//   key_id: process.env.RAZORPAY_KEY_ID ? "SET" : "NOT SET",
//   key_secret: process.env.RAZORPAY_KEY_SECRET ? "SET" : "NOT SET",
// });

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });


// // orderController.js
// // Import the queue

// // Function to add an email job to the queue
// const sendCODOrderConfirmationEmail = async (order) => {
//   try {
//     // Instead of sending the email, add a job to the queue
//     await emailQueue.add('sendCODConfirmation', {
//       to: order.address.email,
//       order: order.toObject ? order.toObject() : order, // Ensure it's a plain object
//       template: 'cod_confirmation',
//     });

//     console.log(`📨 COD confirmation email job queued for: ${order.address.email}`);
//   } catch (error) {
//     console.error('Error queuing COD email:', error);
//   }
// };

// // Similarly, update the other two email functions:
// const sendPaymentConfirmationOnlineEmail = async (order) => {
//   await emailQueue.add('sendOnlinePaymentConfirmation', {
//     to: order.address.email,
//     order: order.toObject ? order.toObject() : order,
//     template: 'online_payment_confirmation',
//   });
// };



// const sendStatusUpdateEmail = async (order) => {
//   await emailQueue.add('sendStatusUpdate', {
//     to: order.address.email,
//     order: order.toObject ? order.toObject() : order,
//     template: 'status_update',
//   });
// };



// const placeOrderCOD = async (req, res) => {
//   try {
//     const userid = req.user.id;
//     const userPhone = req.user.number;
//     const { userId, items, amount, address, couponCode, useWalletCoins = false } = req.body;

//     if (!items || items.length === 0) {
//       return res.status(400).json({  // Fixed: .jon to .json
//         success: false,
//         message: "No items provided in the order"
//       });
//     }

//     // ✅ FIRST: Find user with complete data
//     const user = await userModel.findOne({ number: userPhone });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     let walletDiscount = 0;
//     let coinsUsed = 0;

//     // ✅ Check if user has sufficient coins when checkbox is checked
//     if (useWalletCoins) {
//       if (!user || user.walletCoins <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Insufficient wallet coins or user not found"
//         });
//       }

//       const availableCoins = user.walletCoins;
//       const tenPercentOfOrder = Math.floor(amount * 0.1);
//       const tenPercentOfCoins = Math.floor(availableCoins * 0.1);
//       walletDiscount = Math.min(tenPercentOfOrder, tenPercentOfCoins);

//       // Final validation
//       if (walletDiscount > availableCoins) {
//         return res.status(400).json({
//           success: false,
//           message: `Insufficient coins. You need ${walletDiscount} coins but have only ${availableCoins}`
//         });
//       }

//       coinsUsed = walletDiscount;
//       console.log(`✅ Wallet discount applied: ₹${walletDiscount} (using ${coinsUsed} coins)`);
//     }

//     // Get referral configuration
//     let config = await referrralModel.findOne();
//     if (!config) {
//       config = new referrralModel({
//         userDiscountPercent: 5,
//         referrerCommissionPercent: 5,
//         maxDirectDiscountPercent: 20,
//         maxTotalDiscountPercent: 30
//       });
//       await config.save();
//     }

//     let referralDiscount = 0;
//     let commission = 0;
//     let referredBy = null;
//     let shouldMarkReferralUsed = false;

//     // ✅ Handle Direct Referral (only if not already used)
//     if (user.referredBy && !user.usedReferral) {
//       referredBy = user.referredBy;

//       // Calculate discount for the referred user
//       // Apply on amount after wallet discount
//       const amountAfterWallet = Math.max(0, amount - walletDiscount);
//       referralDiscount = (amountAfterWallet * config.userDiscountPercent) / 100;

//       // Calculate commission for the referrer
//       commission = (amountAfterWallet * config.referrerCommissionPercent) / 100;

//       shouldMarkReferralUsed = true;

//       console.log(`👥 Direct referral applied: 
//         Discount: ₹${referralDiscount}
//         Commission: ₹${commission}
//         Referrer: ${referredBy}
//       `);
//     }

//     // Apply maximum discount limits
//     const maxAllowedDiscount = (amount * config.maxTotalDiscountPercent) / 100;
//     const totalCalculatedDiscount = referralDiscount;

//     let finalDiscount = Math.min(totalCalculatedDiscount, maxAllowedDiscount);

//     // Calculate final amount: Amount -> Wallet Discount -> Referral Discount
//     const amountAfterWallet = Math.max(0, amount - walletDiscount);
//     const finalAmount = Math.max(0, amountAfterWallet - finalDiscount);

//     const uniqueOrderId = `COD-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;

//     // Send immediate response
//     res.json({
//       success: true,
//       message: "Order processing started",
//       orderid: uniqueOrderId,
//       walletDiscount: walletDiscount,
//       coinsUsed: coinsUsed,
//       referralInfo: {
//         applied: shouldMarkReferralUsed,
//         discount: referralDiscount,
//         commission: commission
//       }
//     });

//     // Process order in background
//     await orderQueue.add('processCODOrder', {
//       orderId: uniqueOrderId,
//       userId: user._id, // Use user._id instead of userId from request
//       items,
//       amount,
//       address,
//       paymentMethod: "COD",
//       payment: false,
//       couponCode,
//       discount: finalDiscount,
//       walletDiscount: walletDiscount,
//       coinsUsed: coinsUsed,
//       referralDiscount: referralDiscount,
//       totalDiscount: finalDiscount + walletDiscount,
//       commissionEarned: commission,
//       referredBy: referredBy,
//       referralConfigUsed: {
//         userDiscountPercent: config.userDiscountPercent,
//         referrerCommissionPercent: config.referrerCommissionPercent,
//         maxDirectDiscountPercent: config.maxDirectDiscountPercent,
//         maxTotalDiscountPercent: config.maxTotalDiscountPercent
//       },
//       shouldMarkReferralUsed: shouldMarkReferralUsed,
//       userPhone: userPhone
//     });

//     console.log(`📦 Order ${uniqueOrderId} queued for processing`);

//   } catch (error) {
//     console.error("Error in placeOrderCOD:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server Error"
//     });
//   }
// };



// const placeOrderRazorpay = async (req, res) => {
//   const userPhone = req.user.number;

//   try {
//     const { userId, items, amount, address, couponCode, useWalletCoins = false } = req.body;

//     // ✅ FIRST: Find user with complete data
//     const user = await userModel.findOne({ number: userPhone }).populate("referredBy");

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     let walletDiscount = 0;
//     let coinsUsed = 0;

//     // ✅ Check if user has sufficient coins when checkbox is checked
//     if (useWalletCoins) {
//       if (!user || user.walletCoins <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Insufficient wallet coins or user not found"
//         });
//       }

//       const availableCoins = user.walletCoins;
//       const tenPercentOfOrder = Math.floor(amount * 0.1);
//       const tenPercentOfCoins = Math.floor(availableCoins * 0.1);
//       walletDiscount = Math.min(tenPercentOfOrder, tenPercentOfCoins);

//       // Final validation
//       if (walletDiscount > availableCoins) {
//         return res.status(400).json({
//           success: false,
//           message: `Insufficient coins. You need ${walletDiscount} coins but have only ${availableCoins}`
//         });
//       }

//       coinsUsed = walletDiscount;
//       console.log(`✅ Wallet discount applied: ₹${walletDiscount} (using ${coinsUsed} coins)`);
//     }

//     // Get referral configuration
//     let config = await referrralModel.findOne();
//     if (!config) {
//       config = new referrralModel({
//         userDiscountPercent: 10,
//         referrerCommissionPercent: 10,
//         maxDirectDiscountPercent: 20,
//         maxTotalDiscountPercent: 30
//       });
//       await config.save();
//     }

//     const amountAfterWallet = Math.max(0, amount - walletDiscount);
//     let referralDiscount = 0;
//     let commission = 0;
//     let referredBy = null;
//     let shouldMarkReferralUsed = false;

//     // Handle referral on amount after wallet discount
//     if (user && user.referredBy && !user.usedReferral) {
//       referredBy = user.referredBy._id;
//       referralDiscount = (amountAfterWallet * config.userDiscountPercent) / 100;
//       commission = (amountAfterWallet * config.referrerCommissionPercent) / 100;
//       shouldMarkReferralUsed = true;
//     }

//     // Apply maximum discount limits
//     const maxAllowedDiscount = (amount * config.maxTotalDiscountPercent) / 100;
//     const totalCalculatedDiscount = referralDiscount;
//     let finalDiscount = Math.min(totalCalculatedDiscount, maxAllowedDiscount);

//     // Calculate final amount
//     const finalAmount = Math.max(0, amountAfterWallet - finalDiscount);

//     // ✅ Generate a temporary unique orderid
//     const tempOrderId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

//     // Create order in database with temporary ID
//     const newOrder = new orderModel({
//       orderid: tempOrderId,
//       userId: user._id, // Use user._id
//       items,
//       amount,
//       address,
//       paymentMethod: "Razorpay",
//       payment: false,
//       couponCode,
//       discount: finalDiscount,
//       walletDiscount: walletDiscount, // Add wallet discount field
//       coinsUsed: coinsUsed, // Add coins used field
//       referralDiscount: referralDiscount,
//       totalDiscount: finalDiscount + walletDiscount, // Include wallet discount
//       commissionEarned: commission,
//       referredBy: referredBy,
//       referralConfigUsed: config,
//       markedReferralUsed: shouldMarkReferralUsed,
//       shouldProcessReferrals: shouldMarkReferralUsed
//     });

//     await newOrder.save();

//     // Create Razorpay order
//     const options = {
//       amount: Math.round(finalAmount * 100),
//       currency: "INR",
//       receipt: newOrder._id.toString(),
//     };

//     razorpayInstance.orders.create(options, async (error, razorpayOrder) => {
//       if (error) {
//         console.error("Razorpay error:", error);
//         await orderModel.findByIdAndDelete(newOrder._id);
//         return res.status(500).json({
//           success: false,
//           message: "Razorpay order creation failed"
//         });
//       }

//       // Update order with actual Razorpay ID
//       await orderModel.findByIdAndUpdate(newOrder._id, {
//         orderid: razorpayOrder.id,
//         razorpayOrderId: razorpayOrder.id
//       });

//       // Send immediate response
//       res.json({
//         success: true,
//         order: razorpayOrder,
//         orderId: newOrder._id,
//         razorpayOrderId: razorpayOrder.id,
//         walletInfo: {
//           applied: useWalletCoins,
//           discount: walletDiscount,
//           coinsUsed: coinsUsed
//         },
//         referralInfo: {
//           hasDirectReferral: !!(user && user.referredBy),
//           directReferralApplied: referralDiscount > 0,
//           referralDiscount: referralDiscount,
//           commission: commission,
//           finalAmount: finalAmount,
//           originalAmount: amount,
//           markedReferralUsed: shouldMarkReferralUsed,
//           referralStatus: user?.usedReferral ? "ALREADY_USED" : "ELIGIBLE"
//         }
//         referralProcessed = true;
//               updateData.referralCoinsAdded = {
//                 user: coinsForUser,
//                 referrer: coinsForReferrer
//               };
//       });

//       // Queue background tasks
//       await orderQueue.add('postRazorpayOrderTasks', {
//         orderId: razorpayOrder.id,
//         orderData: newOrder.toObject(),
//         useWalletCoins: useWalletCoins,
//         walletDiscount: walletDiscount,
//         coinsUsed: coinsUsed
//       }, {
//         delay: 500
//       });
//     });

//   } catch (error) {
//     console.error("Error in placeOrderRazorpay:", error);

//     if (error.code === 11000) {
//       return res.status(409).json({
//         success: false,
//         message: "Order creation failed due to duplicate key. Please try again."
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Server Error"
//     });
//   }
// };





// const verifyRazorpay = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature
//     } = req.body;

//     console.log("🔍 Verification started:", {
//       razorpay_order_id,
//       razorpay_payment_id
//     });

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing Razorpay fields"
//       });
//     }

//     // Generate signature
//     const generated_signature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//     console.log("🔐 Signature check:", {
//       generated: generated_signature,
//       received: razorpay_signature,
//       match: generated_signature === razorpay_signature
//     });

//     if (generated_signature !== razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid payment signature"
//       });
//     }

//     // Find order by Razorpay order ID
//     const order = await orderModel.findOne({ orderid: razorpay_order_id });

//     console.log("🔎 Database order search:", {
//       searchedBy: razorpay_order_id,
//       found: !!order,
//       orderId: order?._id,
//       dbOrderid: order?.orderid,
//       walletDiscount: order?.walletDiscount,
//       coinsUsed: order?.coinsUsed
//     });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found"
//       });
//     }

//     // Check payment status
//     const paymentInfo = await razorpayInstance.payments.fetch(razorpay_payment_id);
//     console.log("💰 Payment info:", {
//       status: paymentInfo.status,
//       amount: paymentInfo.amount,
//       currency: paymentInfo.currency,
//       method: paymentInfo.method
//     });

//     const successfulStatuses = ["captured", "authorized", "processed", "completed"];

//     if (!successfulStatuses.includes(paymentInfo.status)) {
//       console.warn(`⚠️ Payment status is ${paymentInfo.status}`);

//       if (paymentInfo.status === "failed") {
//         await orderModel.findByIdAndUpdate(order._id, {
//           paymentStatus: "failed",
//           paymentError: "Payment failed at Razorpay",
//           updatedAt: Date.now()
//         });

//         return res.status(400).json({
//           success: false,
//           message: "Payment failed at Razorpay"
//         });
//       }

//       return res.status(400).json({
//         success: false,
//         message: `Payment is ${paymentInfo.status}. Please wait or try again.`
//       });
//     }

//     // ✅ Process the order only if payment hasn't been processed before
//     if (!order.payment) {
//       console.log("💳 First-time payment processing");

//       // ✅ STEP 1: Deduct wallet coins if used
//       if (order.coinsUsed && order.coinsUsed > 0) {
//         console.log(`💳 Deducting ${order.coinsUsed} coins from user:`, order.userId);

//         await userModel.findByIdAndUpdate(order.userId, {
//           $inc: { walletCoins: -order.coinsUsed }
//         });

//         console.log(`✅ ${order.coinsUsed} coins deducted from user's wallet`);
//       }

//       // ✅ STEP 2: Mark referral as used if applicable
//       if (order.markedReferralUsed) {
//         console.log("👤 Marking referral as used for user:", order.userId);

//         await userModel.updateOne(
//           { _id: order.userId, usedReferral: false },
//           { $set: { usedReferral: true } }
//         );
//       }

//       // ✅ STEP 3: Add coins for referral (if any)
//       if (order.referredBy) {
//         console.log("💰 Processing referral coins for:", order.referredBy);

//         // Find the referred user (buyer)
//         const referredUser = await userModel.findById(order.userId);

//         if (referredUser) {
//           // Get current referral count
//           const currentReferralCount = referredUser.referralOrderCount || 0;
//           const newReferralCount = currentReferralCount + 1;

//           // ✅ IMPORTANT: Use FINAL PAID AMOUNT for coin calculation
//           // Razorpay payment amount is in paise, convert to rupees
//           const paidAmountInRupees = paymentInfo.amount / 100;

//           // Calculate coins based on referral count
//           let coinsForUser = 0;
//           let coinsForReferrer = 0;

//           if (newReferralCount === 1) {
//             // First referral order - 100% of PAID amount as coins
//             coinsForUser = paidAmountInRupees;
//             coinsForReferrer = paidAmountInRupees;
//             console.log(`🎉 First referral order! 100% coins: ₹${coinsForUser} each`);
//           } else {
//             // Subsequent orders - 1% of PAID amount as coins
//             coinsForUser = Math.floor(paidAmountInRupees * 0.01);
//             coinsForReferrer = Math.floor(paidAmountInRupees * 0.01);
//             console.log(`📊 Subsequent order (${newReferralCount}): 1% coins: ₹${coinsForUser} each`);
//           }

//           // Update user's wallet and referral count
//           await userModel.findByIdAndUpdate(order.userId, {
//             $inc: {
//               walletCoins: coinsForUser,
//               referralOrderCount: 1
//             }
//           });

//           // Update referrer's wallet and commission
//           await userModel.findByIdAndUpdate(order.referredBy, {
//             $inc: {
//               walletCoins: coinsForReferrer,
//               totalCommissionEarned: Math.floor(order.commissionEarned || 0),
//               totalReferral: 1
//             }
//           });

//           console.log(`✅ Referral coins added: User=${coinsForUser}, Referrer=${coinsForReferrer}`);
//         }
//       }
//     } else {
//       console.log("⚠️ Payment already processed, skipping updates");
//     }

//     // ✅ Update order with payment info
//     const updatedOrder = await orderModel.findByIdAndUpdate(
//       order._id,
//       {
//         payment: true,
//         paymentId: razorpay_payment_id,
//         razorpayOrderId: razorpay_order_id,
//         paymentStatus: paymentInfo.status,
//         razorpayPaymentInfo: paymentInfo,
//         updatedAt: Date.now()
//       },
//       { new: true }
//     );

//     console.log("✅ Order updated successfully");

//     // Send confirmation email
//     await sendPaymentConfirmationOnlineEmail(updatedOrder);

//     return res.json({
//       success: true,
//       message: `Payment ${paymentInfo.status} successfully`,
//       order: updatedOrder,
//       walletInfo: {
//         coinsUsed: order.coinsUsed || 0,
//         walletDiscount: order.walletDiscount || 0
//       },
//       directReferralApplied: order.referralDiscount > 0,
//       referralDiscount: order.referralDiscount || 0,
//       commissionEarned: order.commissionEarned || 0,
//       markedReferralUsed: order.markedReferralUsed || false
//     });

//   } catch (error) {
//     console.error("❌ Razorpay verify error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message
//     });
//   }
// };

// // Helper function to process order verification
// async function processOrderVerification(order, razorpayOrderId, razorpayPaymentId, res) {
//   try {
//     console.log("🔄 Processing order:", order._id);

//     // ✅ Safety: prevent double execution
//     if (!order.payment) {
//       console.log("💳 First-time payment processing");

//       if (order.markedReferralUsed) {
//         console.log("👤 Marking referral as used for user:", order.userId);
//         await userModel.updateOne(
//           { _id: order.userId, usedReferral: false },
//           { $set: { usedReferral: true } }
//         );
//       }

//       if (order.referredBy && order.commissionEarned > 0) {
//         console.log("💰 Adding commission to referrer:", order.referredBy);
//         await userModel.findByIdAndUpdate(order.referredBy, {
//           $inc: {
//             totalCommissionEarned: Math.floor(order.commissionEarned),
//             totalReferral: 1
//           }
//         });
//       }
//     } else {
//       console.log("⚠️ Payment already processed, skipping referral updates");
//     }

//     // Update order with payment info
//     const updatedOrder = await orderModel.findByIdAndUpdate(
//       order._id,
//       {
//         payment: true,
//         paymentId: razorpayPaymentId,
//         razorpayOrderId: razorpayOrderId,
//         orderid: razorpayOrderId, // Ensure orderid is updated if it was temporary
//         updatedAt: Date.now()
//       },
//       { new: true }
//     );

//     console.log("✅ Order updated successfully");

//     // Send confirmation email
//     await sendPaymentConfirmationOnlineEmail(updatedOrder);

//     return res.json({
//       success: true,
//       message: "Payment verified successfully",
//       order: updatedOrder,
//       directReferralApplied: order.referralDiscount > 0,
//       referralDiscount: order.referralDiscount || 0,
//       commissionEarned: order.commissionEarned || 0,
//       markedReferralUsed: order.markedReferralUsed || false
//     });

//   } catch (processError) {
//     console.error("❌ Error in processOrderVerification:", processError);
//     throw processError;
//   }
// }


// // Helper function to calculate wallet discount
// const calculateWalletDiscount = async (userId, orderAmount) => {
//   const user = await userModel.findById(userId);
//   if (!user) return { discount: 0, coinsUsed: 0 };

//   const availableCoins = user.walletCoins || 0;

//   // Calculate 10% of order amount
//   const tenPercentOfOrder = Math.floor(orderAmount * 0.1);

//   // Calculate 10% of available coins
//   const tenPercentOfCoins = Math.floor(availableCoins * 0.1);

//   // Use the minimum of the two
//   const discount = Math.min(tenPercentOfOrder, tenPercentOfCoins);
//   const coinsUsed = discount; // 1 coin = 1 rupee

//   return { discount, coinsUsed };
// };


// const allOrders = async (req, res) => {
//   try {
//     const orders = await orderModel.find({});
//     res.json({ success: true, orders });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ---------------- Get Single Order (by orderid) ----------------
// const userSingleOrder = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const order = await orderModel.findOne({ orderid: id }).lean();

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     res.json({ success: true, order });
//   } catch (error) {
//     console.error("❌ Internal Error:", error);
//     res.status(500).json({ success: false, message: "Server Error. Please try again." });
//   }
// };










// // ---------------- User Orders ----------------
// const userOrders = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const orders = await orderModel.find({ userId });
//     res.json({ success: true, orders });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const updateStatus = async (req, res) => {
//   try {
//     const { orderid, status } = req.body;
//     const updated = await orderModel.findOneAndUpdate(
//       { orderid },
//       { status },
//       { new: true }
//     );

//     if (!updated) return res.status(404).json({ success: false, message: "Order not found" });

//     // Send status update email
//     await sendStatusUpdateEmail(updated);

//     res.json({ success: true, message: "Order updated", order: updated });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// // const placeordercodpaymentstatus = async (req, res) => {
// //   try {
// //     const { orderid, status } = req.body;
// //     const order = await orderModel.findOne({ orderid });

// //     if (!order) {
// //       return res.status(404).json({ success: false, message: "Order not found" });
// //     }

// //     // ✅ Check if status is delivered
// //     if (status === "delivered") {
// //       // ✅ If it's a COD order, mark payment as true
// //       const updateData = {
// //         status,
// //         updatedAt: Date.now()
// //       };

// //       // Auto-mark COD payment as completed when delivered
// //       if (order.paymentMethod === "COD" && !order.payment) {
// //         updateData.payment = true;
// //         updateData.paymentStatus = "completed";
// //         updateData.paymentDate = new Date();

// //         console.log(`✅ COD order ${orderid} marked as paid upon delivery`);
// //       }

// //       const updatedOrder = await orderModel.findOneAndUpdate(
// //         { orderid },
// //         updateData,
// //         { new: true }
// //       );

// //       if (!updatedOrder) {
// //         return res.status(404).json({ success: false, message: "Order not found" });
// //       }

// //       res.json({
// //         success: true,
// //         message: "Order delivered and payment marked as completed",
// //         order: updatedOrder,
// //         paymentUpdated: (order.paymentMethod === "COD" && !order.payment) // Flag if payment was updated
// //       });
// //     } else {
// //       // For non-delivered statuses, just update status
// //       const updatedOrder = await orderModel.findOneAndUpdate(
// //         { orderid },
// //         { status, updatedAt: Date.now() },
// //         { new: true }
// //       );

// //       if (!updatedOrder) {
// //         return res.status(404).json({ success: false, message: "Order not found" });
// //       }

// //       res.json({ success: true, message: "Order status updated", order: updatedOrder });
// //     }

// //   } catch (error) {
// //     console.error("Error updating order status:", error);
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };



// const placeordercodpaymentstatus = async (req, res) => {
//   try {
//     const { orderid, status } = req.body;
//     const order = await orderModel.findOne({ orderid });

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     // ✅ Check if status is delivered
//     if (status === "delivered") {
//       // ✅ If it's a COD order, mark payment as true
//       const updateData = {
//         status,
//         updatedAt: Date.now()
//       };

//       // Auto-mark COD payment as completed when delivered
//       if (order.paymentMethod === "COD" && !order.payment) {
//         updateData.payment = true;
//         updateData.paymentStatus = "completed";
//         updateData.paymentDate = new Date();

//         console.log(`✅ COD order ${orderid} marked as paid upon delivery`);

//         // ✅ NOW: PROCESS REFERRAL REWARDS FOR COD ORDERS
//         // This is the missing part - same logic as in verifyRazorpay
//         if (!order.referralProcessed && order.payment === false) {
//           console.log("💰 Processing referral rewards for COD order");

//           // ✅ STEP 1: Mark referral as used if applicable
//           if (order.markedReferralUsed) {
//             console.log("👤 Marking referral as used for user:", order.userId);

//             await userModel.updateOne(
//               { _id: order.userId, usedReferral: false },
//               { $set: { usedReferral: true } }
//             );
//           }

//           // ✅ STEP 2: Process referral rewards
//           if (order.referredBy) {
//             console.log("💰 Processing referral coins for COD order:", order.referredBy);

//             // Find the referred user (buyer)
//             const referredUser = await userModel.findById(order.userId);

//             if (referredUser) {
//               // Get current referral count
//               const currentReferralCount = referredUser.referralOrderCount || 0;
//               const newReferralCount = currentReferralCount + 1;

//               // Calculate coins based on FINAL PAID AMOUNT
//               const paidAmount = order.amount - (order.discount || 0) - (order.walletDiscount || 0);

//               // Calculate coins based on referral count
//               let coinsForUser = 0;
//               let coinsForReferrer = 0;

//               if (newReferralCount === 1) {
//                 // First referral order - 100% of PAID amount as coins
//                 coinsForUser = Math.floor(paidAmount);
//                 coinsForReferrer = Math.floor(paidAmount);
//                 console.log(`🎉 First referral COD order! 100% coins: ₹${coinsForUser} each`);
//               } else {
//                 // Subsequent orders - 1% of PAID amount as coins
//                 coinsForUser = Math.floor(paidAmount * 0.01);
//                 coinsForReferrer = Math.floor(paidAmount * 0.01);
//                 console.log(`📊 Subsequent COD order (${newReferralCount}): 1% coins: ₹${coinsForUser} each`);
//               }

//               // Update user's wallet and referral count
//               await userModel.findByIdAndUpdate(order.userId, {
//                 $inc: {
//                   walletCoins: coinsForUser,
//                   referralOrderCount: 1
//                 }
//               });

//               // Update referrer's wallet and commission
//               await userModel.findByIdAndUpdate(order.referredBy, {
//                 $inc: {
//                   walletCoins: coinsForReferrer,
//                   totalCommissionEarned: Math.floor(order.commissionEarned || 0),
//                   totalReferral: 1
//                 }
//               });

//               console.log(`✅ Referral coins added for COD: User=${coinsForUser}, Referrer=${coinsForReferrer}`);

//               // Mark referral as processed in order
//               updateData.referralProcessed = true;
//               updateData.referralCoinsAdded = {
//                 user: coinsForUser,
//                 referrer: coinsForReferrer
//               };
//             }
//           }
//         }
//       }

//       const updatedOrder = await orderModel.findOneAndUpdate(
//         { orderid },
//         updateData,
//         { new: true }
//       );

//       if (!updatedOrder) {
//         return res.status(404).json({ success: false, message: "Order not found" });
//       }

//       res.json({
//         success: true,
//         message: "Order delivered and payment marked as completed",
//         order: updatedOrder,
//         paymentUpdated: (order.paymentMethod === "COD" && !order.payment),
//         referralProcessed: updateData.referralProcessed || false
//       });
//     } else {
//       // For non-delivered statuses, just update status
//       const updatedOrder = await orderModel.findOneAndUpdate(
//         { orderid },
//         { status, updatedAt: Date.now() },
//         { new: true }
//       );

//       if (!updatedOrder) {
//         return res.status(404).json({ success: false, message: "Order not found" });
//       }

//       res.json({ success: true, message: "Order status updated", order: updatedOrder });
//     }

//   } catch (error) {
//     console.error("Error updating order status:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };





// export {
//   placeOrderCOD,
//   placeordercodpaymentstatus,
//   placeOrderRazorpay,
//   verifyRazorpay,
//   allOrders,
//   userOrders,
//   updateStatus,

//   userSingleOrder,
// };




// import Razorpay from "razorpay";
// import crypto from "crypto";
// import orderModel from "../models/orderModel.js";
// import nodemailer from 'nodemailer';
// import { emailQueue, orderQueue } from '../config/queue.js';
// import userModel from "../models/authModel.js";
// import referrralModel from "../models/referralModel.js";
// import dotenv from "dotenv";
// dotenv.config();

// const razorpayInstance = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// console.log("🚀 Razorpay Instance Configured:", {
//   key_id: process.env.RAZORPAY_KEY_ID ? "SET" : "NOT SET",
//   key_secret: process.env.RAZORPAY_KEY_SECRET ? "SET" : "NOT SET",
// });

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // Email queue functions
// const sendCODOrderConfirmationEmail = async (order) => {
//   try {
//     await emailQueue.add('sendCODConfirmation', {
//       to: order.address.email,
//       order: order.toObject ? order.toObject() : order,
//       template: 'cod_confirmation',
//     });
//     console.log(`📨 COD confirmation email job queued for: ${order.address.email}`);
//   } catch (error) {
//     console.error('Error queuing COD email:', error);
//   }
// };

// const sendPaymentConfirmationOnlineEmail = async (order) => {
//   await emailQueue.add('sendOnlinePaymentConfirmation', {
//     to: order.address.email,
//     order: order.toObject ? order.toObject() : order,
//     template: 'online_payment_confirmation',
//   });
// };

// const sendStatusUpdateEmail = async (order) => {
//   await emailQueue.add('sendStatusUpdate', {
//     to: order.address.email,
//     order: order.toObject ? order.toObject() : order,
//     template: 'status_update',
//   });
// };

// const placeOrderCOD = async (req, res) => {
//   try {
//     const userid = req.user.id;
//     const userPhone = req.user.number;
//     const { userId, items, amount, address, couponCode, useWalletCoins = false } = req.body;

//     if (!items || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No items provided in the order"
//       });
//     }

//     const user = await userModel.findOne({ number: userPhone });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     let walletDiscount = 0;
//     let coinsUsed = 0;

//     if (useWalletCoins) {
//       if (!user || user.walletCoins <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Insufficient wallet coins or user not found"
//         });
//       }

//       const availableCoins = user.walletCoins;
//       const tenPercentOfOrder = Math.floor(amount * 0.1);
//       const tenPercentOfCoins = Math.floor(availableCoins * 0.1);
//       walletDiscount = Math.min(tenPercentOfOrder, tenPercentOfCoins);

//       if (walletDiscount > availableCoins) {
//         return res.status(400).json({
//           success: false,
//           message: `Insufficient coins. You need ${walletDiscount} coins but have only ${availableCoins}`
//         });
//       }

//       coinsUsed = walletDiscount;
//       console.log(`✅ Wallet discount applied: ₹${walletDiscount} (using ${coinsUsed} coins)`);
//     }

//     let config = await referrralModel.findOne();
//     if (!config) {
//       config = new referrralModel({
//         userDiscountPercent: 5,
//         referrerCommissionPercent: 5,
//         maxDirectDiscountPercent: 20,
//         maxTotalDiscountPercent: 30
//       });
//       await config.save();
//     }

//     let referralDiscount = 0;
//     let commission = 0;
//     let referredBy = null;
//     let shouldMarkReferralUsed = false;

//     if (user.referredBy && !user.usedReferral) {
//       referredBy = user.referredBy;
//       const amountAfterWallet = Math.max(0, amount - walletDiscount);
//       referralDiscount = (amountAfterWallet * config.userDiscountPercent) / 100;
//       commission = (amountAfterWallet * config.referrerCommissionPercent) / 100;
//       shouldMarkReferralUsed = true;

//       console.log(`👥 Direct referral applied: 
//         Discount: ₹${referralDiscount}
//         Commission: ₹${commission}
//         Referrer: ${referredBy}
//       `);
//     }

//     const maxAllowedDiscount = (amount * config.maxTotalDiscountPercent) / 100;
//     const totalCalculatedDiscount = referralDiscount;
//     let finalDiscount = Math.min(totalCalculatedDiscount, maxAllowedDiscount);

//     const amountAfterWallet = Math.max(0, amount - walletDiscount);
//     const finalAmount = Math.max(0, amountAfterWallet - finalDiscount);

//     const uniqueOrderId = `COD-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;

//     res.json({
//       success: true,
//       message: "Order processing started",
//       orderid: uniqueOrderId,
//       walletDiscount: walletDiscount,
//       coinsUsed: coinsUsed,
//       referralInfo: {
//         applied: shouldMarkReferralUsed,
//         discount: referralDiscount,
//         commission: commission
//       }
//     });



//     await orderQueue.add('processCODOrder', {
//       orderId: uniqueOrderId,
//       userId: user._id,
//       items,
//       amount,
//       address,
//       paymentMethod: "COD",
//       payment: false,
//       couponCode,
//       discount: finalDiscount,
//       walletDiscount: walletDiscount,
//       coinsUsed: coinsUsed,
//       referralDiscount: referralDiscount,
//       totalDiscount: finalDiscount + walletDiscount,
//       commissionEarned: commission,
//       referredBy: referredBy,
//       referralConfigUsed: {
//         userDiscountPercent: config.userDiscountPercent,
//         referrerCommissionPercent: config.referrerCommissionPercent,
//         maxDirectDiscountPercent: config.maxDirectDiscountPercent,
//         maxTotalDiscountPercent: config.maxTotalDiscountPercent
//       },
//       shouldMarkReferralUsed: shouldMarkReferralUsed,
//       userPhone: userPhone
//     });

//     console.log(`📦 Order ${uniqueOrderId} queued for processing`);
//     await orderQueue.add('sendOrderConfirmationSMS', {
//       orderId: uniqueOrderId,
//       phone: userPhone,
//       orderData: {
//         orderid: uniqueOrderId,
//         amount: amount,
//         address: address
//       }
//     }, {
//       delay: 1000 // Delay 1 second to ensure order is saved
//     });

//     console.log(`📱 Order confirmation SMS queued for ${userPhone}`);

//   } catch (error) {
//     console.error("Error in placeOrderCOD:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server Error"
//     });
//   }
// };

// const placeOrderRazorpay = async (req, res) => {
//   const userPhone = req.user.number;

//   try {
//     const { userId, items, amount, address, couponCode, useWalletCoins = false } = req.body;

//     const user = await userModel.findOne({ number: userPhone }).populate("referredBy");

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     let walletDiscount = 0;
//     let coinsUsed = 0;

//     if (useWalletCoins) {
//       if (!user || user.walletCoins <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Insufficient wallet coins or user not found"
//         });
//       }

//       const availableCoins = user.walletCoins;
//       const tenPercentOfOrder = Math.floor(amount * 0.1);
//       const tenPercentOfCoins = Math.floor(availableCoins * 0.1);
//       walletDiscount = Math.min(tenPercentOfOrder, tenPercentOfCoins);

//       if (walletDiscount > availableCoins) {
//         return res.status(400).json({
//           success: false,
//           message: `Insufficient coins. You need ${walletDiscount} coins but have only ${availableCoins}`
//         });
//       }

//       coinsUsed = walletDiscount;
//       console.log(`✅ Wallet discount applied: ₹${walletDiscount} (using ${coinsUsed} coins)`);
//     }

//     let config = await referrralModel.findOne();
//     if (!config) {
//       config = new referrralModel({
//         userDiscountPercent: 10,
//         referrerCommissionPercent: 10,
//         maxDirectDiscountPercent: 20,
//         maxTotalDiscountPercent: 30
//       });
//       await config.save();
//     }

//     const amountAfterWallet = Math.max(0, amount - walletDiscount);
//     let referralDiscount = 0;
//     let commission = 0;
//     let referredBy = null;
//     let shouldMarkReferralUsed = false;

//     if (user && user.referredBy && !user.usedReferral) {
//       referredBy = user.referredBy._id;
//       referralDiscount = (amountAfterWallet * config.userDiscountPercent) / 100;
//       commission = (amountAfterWallet * config.referrerCommissionPercent) / 100;
//       shouldMarkReferralUsed = true;
//     }

//     const maxAllowedDiscount = (amount * config.maxTotalDiscountPercent) / 100;
//     const totalCalculatedDiscount = referralDiscount;
//     let finalDiscount = Math.min(totalCalculatedDiscount, maxAllowedDiscount);

//     const finalAmount = Math.max(0, amountAfterWallet - finalDiscount);

//     const tempOrderId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

//     const newOrder = new orderModel({
//       orderid: tempOrderId,
//       userId: user._id,
//       items,
//       amount,
//       address,
//       paymentMethod: "Razorpay",
//       payment: false,
//       couponCode,
//       discount: finalDiscount,
//       walletDiscount: walletDiscount,
//       coinsUsed: coinsUsed,
//       referralDiscount: referralDiscount,
//       totalDiscount: finalDiscount + walletDiscount,
//       commissionEarned: commission,
//       referredBy: referredBy,
//       referralConfigUsed: config,
//       markedReferralUsed: shouldMarkReferralUsed,
//       shouldProcessReferrals: shouldMarkReferralUsed
//     });

//     await newOrder.save();

//     const options = {
//       amount: Math.round(finalAmount * 100),
//       currency: "INR",
//       receipt: newOrder._id.toString(),
//     };

//     razorpayInstance.orders.create(options, async (error, razorpayOrder) => {
//       if (error) {
//         console.error("Razorpay error:", error);
//         await orderModel.findByIdAndDelete(newOrder._id);
//         return res.status(500).json({
//           success: false,
//           message: "Razorpay order creation failed"
//         });
//       }

//       await orderModel.findByIdAndUpdate(newOrder._id, {
//         orderid: razorpayOrder.id,
//         razorpayOrderId: razorpayOrder.id
//       });

//       res.json({
//         success: true,
//         order: razorpayOrder,
//         orderId: newOrder._id,
//         razorpayOrderId: razorpayOrder.id,
//         walletInfo: {
//           applied: useWalletCoins,
//           discount: walletDiscount,
//           coinsUsed: coinsUsed
//         },
//         referralInfo: {
//           hasDirectReferral: !!(user && user.referredBy),
//           directReferralApplied: referralDiscount > 0,
//           referralDiscount: referralDiscount,
//           commission: commission,
//           finalAmount: finalAmount,
//           originalAmount: amount,
//           markedReferralUsed: shouldMarkReferralUsed,
//           referralStatus: user?.usedReferral ? "ALREADY_USED" : "ELIGIBLE",
//           referralProcessed: false, // Will be processed after payment
//           referralCoinsAdded: {
//             user: 0,
//             referrer: 0
//           }
//         }
//       });

//       await orderQueue.add('postRazorpayOrderTasks', {
//         orderId: razorpayOrder.id,
//         orderData: newOrder.toObject(),
//         useWalletCoins: useWalletCoins,
//         walletDiscount: walletDiscount,
//         coinsUsed: coinsUsed
//       }, {
//         delay: 500
//       });
//     });

//   } catch (error) {
//     console.error("Error in placeOrderRazorpay:", error);

//     if (error.code === 11000) {
//       return res.status(409).json({
//         success: false,
//         message: "Order creation failed due to duplicate key. Please try again."
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Server Error"
//     });
//   }
// };

// const verifyRazorpay = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature
//     } = req.body;

//     console.log("🔍 Verification started:", {
//       razorpay_order_id,
//       razorpay_payment_id
//     });

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing Razorpay fields"
//       });
//     }

//     const generated_signature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//     console.log("🔐 Signature check:", {
//       generated: generated_signature,
//       received: razorpay_signature,
//       match: generated_signature === razorpay_signature
//     });

//     if (generated_signature !== razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid payment signature"
//       });
//     }

//     const order = await orderModel.findOne({ orderid: razorpay_order_id });

//     console.log("🔎 Database order search:", {
//       searchedBy: razorpay_order_id,
//       found: !!order,
//       orderId: order?._id,
//       dbOrderid: order?.orderid,
//       walletDiscount: order?.walletDiscount,
//       coinsUsed: order?.coinsUsed
//     });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found"
//       });
//     }

//     const paymentInfo = await razorpayInstance.payments.fetch(razorpay_payment_id);
//     console.log("💰 Payment info:", {
//       status: paymentInfo.status,
//       amount: paymentInfo.amount,
//       currency: paymentInfo.currency,
//       method: paymentInfo.method
//     });

//     const successfulStatuses = ["captured", "authorized", "processed", "completed"];

//     if (!successfulStatuses.includes(paymentInfo.status)) {
//       console.warn(`⚠️ Payment status is ${paymentInfo.status}`);

//       if (paymentInfo.status === "failed") {
//         await orderModel.findByIdAndUpdate(order._id, {
//           paymentStatus: "failed",
//           paymentError: "Payment failed at Razorpay",
//           updatedAt: Date.now()
//         });

//         return res.status(400).json({
//           success: false,
//           message: "Payment failed at Razorpay"
//         });
//       }

//       return res.status(400).json({
//         success: false,
//         message: `Payment is ${paymentInfo.status}. Please wait or try again.`
//       });
//     }

//     if (!order.payment) {
//       console.log("💳 First-time payment processing");

//       if (order.coinsUsed && order.coinsUsed > 0) {
//         console.log(`💳 Deducting ${order.coinsUsed} coins from user:`, order.userId);

//         await userModel.findByIdAndUpdate(order.userId, {
//           $inc: { walletCoins: -order.coinsUsed }
//         });

//         console.log(`✅ ${order.coinsUsed} coins deducted from user's wallet`);
//       }

//       if (order.markedReferralUsed) {
//         console.log("👤 Marking referral as used for user:", order.userId);

//         await userModel.updateOne(
//           { _id: order.userId, usedReferral: false },
//           { $set: { usedReferral: true } }
//         );
//       }

//       if (order.referredBy) {
//         console.log("💰 Processing referral coins for:", order.referredBy);

//         const referredUser = await userModel.findById(order.userId);

//         if (referredUser) {
//           const currentReferralCount = referredUser.referralOrderCount || 0;
//           const newReferralCount = currentReferralCount + 1;

//           const paidAmountInRupees = paymentInfo.amount / 100;

//           let coinsForUser = 0;
//           let coinsForReferrer = 0;

//           if (newReferralCount === 1) {
//             coinsForUser = paidAmountInRupees;
//             coinsForReferrer = paidAmountInRupees;
//             console.log(`🎉 First referral order! 100% coins: ₹${coinsForUser} each`);
//           } else {
//             coinsForUser = Math.floor(paidAmountInRupees * 0.01);
//             coinsForReferrer = Math.floor(paidAmountInRupees * 0.01);
//             console.log(`📊 Subsequent order (${newReferralCount}): 1% coins: ₹${coinsForUser} each`);
//           }

//           await userModel.findByIdAndUpdate(order.userId, {
//             $inc: {
//               walletCoins: coinsForUser,
//               referralOrderCount: 1
//             }
//           });

//           await userModel.findByIdAndUpdate(order.referredBy, {
//             $inc: {
//               walletCoins: coinsForReferrer,
//               totalCommissionEarned: Math.floor(order.commissionEarned || 0),
//               totalReferral: 1
//             }
//           });

//           console.log(`✅ Referral coins added: User=${coinsForUser}, Referrer=${coinsForReferrer}`);
//         }
//       }
//     } else {
//       console.log("⚠️ Payment already processed, skipping updates");
//     }

//     const updatedOrder = await orderModel.findByIdAndUpdate(
//       order._id,
//       {
//         payment: true,
//         paymentId: razorpay_payment_id,
//         razorpayOrderId: razorpay_order_id,
//         paymentStatus: paymentInfo.status,
//         razorpayPaymentInfo: paymentInfo,
//         updatedAt: Date.now()
//       },
//       { new: true }
//     );

//     console.log("✅ Order updated successfully");

//     await sendPaymentConfirmationOnlineEmail(updatedOrder);

//     return res.json({
//       success: true,
//       message: `Payment ${paymentInfo.status} successfully`,
//       order: updatedOrder,
//       walletInfo: {
//         coinsUsed: order.coinsUsed || 0,
//         walletDiscount: order.walletDiscount || 0
//       },
//       directReferralApplied: order.referralDiscount > 0,
//       referralDiscount: order.referralDiscount || 0,
//       commissionEarned: order.commissionEarned || 0,
//       markedReferralUsed: order.markedReferralUsed || false
//     });

//   } catch (error) {
//     console.error("❌ Razorpay verify error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message
//     });
//   }
// };

// const verifyRazorpay = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature
//     } = req.body;

//     console.log("🔍 Verification started:", {
//       razorpay_order_id,
//       razorpay_payment_id
//     });

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing Razorpay fields"
//       });
//     }

//     const generated_signature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//     console.log("🔐 Signature check:", {
//       generated: generated_signature,
//       received: razorpay_signature,
//       match: generated_signature === razorpay_signature
//     });

//     if (generated_signature !== razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid payment signature"
//       });
//     }

//     const order = await orderModel.findOne({ orderid: razorpay_order_id });

//     console.log("🔎 Database order search:", {
//       searchedBy: razorpay_order_id,
//       found: !!order,
//       orderId: order?._id,
//       dbOrderid: order?.orderid,
//       walletDiscount: order?.walletDiscount,
//       coinsUsed: order?.coinsUsed
//     });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found"
//       });
//     }

//     const paymentInfo = await razorpayInstance.payments.fetch(razorpay_payment_id);
//     console.log("💰 Payment info:", {
//       status: paymentInfo.status,
//       amount: paymentInfo.amount,
//       currency: paymentInfo.currency,
//       method: paymentInfo.method
//     });

//     const successfulStatuses = ["captured", "authorized", "processed", "completed"];

//     if (!successfulStatuses.includes(paymentInfo.status)) {
//       console.warn(`⚠️ Payment status is ${paymentInfo.status}`);

//       if (paymentInfo.status === "failed") {
//         await orderModel.findByIdAndUpdate(order._id, {
//           paymentStatus: "failed",
//           paymentError: "Payment failed at Razorpay",
//           updatedAt: Date.now()
//         });

//         return res.status(400).json({
//           success: false,
//           message: "Payment failed at Razorpay"
//         });
//       }

//       return res.status(400).json({
//         success: false,
//         message: `Payment is ${paymentInfo.status}. Please wait or try again.`
//       });
//     }

//     let coinsForUser = 0;
//     let coinsForReferrer = 0;
//     let updateData = {
//       payment: true,
//       paymentId: razorpay_payment_id,
//       razorpayOrderId: razorpay_order_id,
//       paymentStatus: paymentInfo.status,
//       razorpayPaymentInfo: paymentInfo,
//       updatedAt: Date.now()
//     };

//     if (!order.payment) {
//       console.log("💳 First-time payment processing");

//       if (order.coinsUsed && order.coinsUsed > 0) {
//         console.log(`💳 Deducting ${order.coinsUsed} coins from user:`, order.userId);

//         await userModel.findByIdAndUpdate(order.userId, {
//           $inc: { walletCoins: -order.coinsUsed }
//         });

//         console.log(`✅ ${order.coinsUsed} coins deducted from user's wallet`);
//       }

//       if (order.markedReferralUsed) {
//         console.log("👤 Marking referral as used for user:", order.userId);

//         await userModel.updateOne(
//           { _id: order.userId, usedReferral: false },
//           { $set: { usedReferral: true } }
//         );
//       }

//       if (order.referredBy) {
//         console.log("💰 Processing referral coins for:", order.referredBy);

//         const referredUser = await userModel.findById(order.userId);

//         if (referredUser) {
//           const currentReferralCount = referredUser.referralOrderCount || 0;
//           const newReferralCount = currentReferralCount + 1;

//           const paidAmountInRupees = paymentInfo.amount / 100;

//           if (newReferralCount === 1) {
//             coinsForUser = paidAmountInRupees;
//             coinsForReferrer = paidAmountInRupees;
//             console.log(`🎉 First referral order! 100% coins: ₹${coinsForUser} each`);
//           } else {
//             coinsForUser = Math.floor(paidAmountInRupees * 0.01);
//             coinsForReferrer = Math.floor(paidAmountInRupees * 0.01);
//             console.log(`📊 Subsequent order (${newReferralCount}): 1% coins: ₹${coinsForUser} each`);
//           }

//           await userModel.findByIdAndUpdate(order.userId, {
//             $inc: {
//               walletCoins: coinsForUser,
//               referralOrderCount: 1
//             }
//           });

//           await userModel.findByIdAndUpdate(order.referredBy, {
//             $inc: {
//               walletCoins: coinsForReferrer,
//               totalCommissionEarned: Math.floor(order.commissionEarned || 0),
//               totalReferral: 1
//             }
//           });

//           console.log(`✅ Referral coins added: User=${coinsForUser}, Referrer=${coinsForReferrer}`);

//           // Add referral processing fields for online orders
//           updateData.referralProcessed = true;
//           updateData.referralCoinsAdded = {
//             user: coinsForUser,
//             referrer: coinsForReferrer
//           };
//         }
//       }
//     } else {
//       console.log("⚠️ Payment already processed, skipping updates");
//       // Still include existing referral data if already processed
//       updateData.referralProcessed = order.referralProcessed || false;
//       updateData.referralCoinsAdded = order.referralCoinsAdded || {
//         user: 0,
//         referrer: 0
//       };
//     }

//     const updatedOrder = await orderModel.findByIdAndUpdate(
//       order._id,
//       updateData,
//       { new: true }
//     );

//     console.log("✅ Order updated successfully");

//     await sendPaymentConfirmationOnlineEmail(updatedOrder);

//     return res.json({
//       success: true,
//       message: `Payment ${paymentInfo.status} successfully`,
//       order: updatedOrder,
//       walletInfo: {
//         coinsUsed: order.coinsUsed || 0,
//         walletDiscount: order.walletDiscount || 0
//       },
//       directReferralApplied: order.referralDiscount > 0,
//       referralDiscount: order.referralDiscount || 0,
//       commissionEarned: order.commissionEarned || 0,
//       markedReferralUsed: order.markedReferralUsed || false,
//       // Add referral processed info in response for online orders
//       referralProcessed: updateData.referralProcessed || false,
//       referralCoinsAdded: updateData.referralCoinsAdded || {
//         user: 0,
//         referrer: 0
//       }
//     });

//   } catch (error) {
//     console.error("❌ Razorpay verify error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message
//     });
//   }
// };

// const allOrders = async (req, res) => {
//   try {
//     const orders = await orderModel.find({});
//     res.json({ success: true, orders });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const userSingleOrder = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const order = await orderModel.findOne({ orderid: id }).lean();

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     res.json({ success: true, order });
//   } catch (error) {
//     console.error("❌ Internal Error:", error);
//     res.status(500).json({ success: false, message: "Server Error. Please try again." });
//   }
// };

// const userOrders = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const orders = await orderModel.find({ userId });
//     res.json({ success: true, orders });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const updateStatus = async (req, res) => {
//   try {
//     const { orderid, status } = req.body;
//     const updated = await orderModel.findOneAndUpdate(
//       { orderid },
//       { status },
//       { new: true }
//     );

//     if (!updated) return res.status(404).json({ success: false, message: "Order not found" });

//     await sendStatusUpdateEmail(updated);

//     res.json({ success: true, message: "Order updated", order: updated });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const updateOrderStatusCOD = async (req, res) => {
//   try {
//     const { orderid, status } = req.body;
//     const order = await orderModel.findOne({ orderid });

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     if (status === "delivered") {
//       const updateData = {
//         status,
//         updatedAt: Date.now()
//       };

//       if (order.paymentMethod === "COD" && !order.payment) {
//         updateData.payment = true;
//         updateData.paymentStatus = "completed";
//         updateData.paymentDate = new Date();

//         console.log(`✅ COD order ${orderid} marked as paid upon delivery`);

//         if (!order.referralProcessed && order.payment === false) {
//           console.log("💰 Processing referral rewards for COD order");

//           if (order.markedReferralUsed) {
//             console.log("👤 Marking referral as used for user:", order.userId);

//             await userModel.updateOne(
//               { _id: order.userId, usedReferral: false },
//               { $set: { usedReferral: true } }
//             );
//           }

//           if (order.referredBy) {
//             console.log("💰 Processing referral coins for COD order:", order.referredBy);

//             const referredUser = await userModel.findById(order.userId);

//             if (referredUser) {
//               const currentReferralCount = referredUser.referralOrderCount || 0;
//               const newReferralCount = currentReferralCount + 1;

//               const paidAmount = order.amount - (order.discount || 0) - (order.walletDiscount || 0);

//               let coinsForUser = 0;
//               let coinsForReferrer = 0;

//               if (newReferralCount === 1) {
//                 coinsForUser = Math.floor(paidAmount);
//                 coinsForReferrer = Math.floor(paidAmount);
//                 console.log(`🎉 First referral COD order! 100% coins: ₹${coinsForUser} each`);
//               } else {
//                 coinsForUser = Math.floor(paidAmount * 0.01);
//                 coinsForReferrer = Math.floor(paidAmount * 0.01);
//                 console.log(`📊 Subsequent COD order (${newReferralCount}): 1% coins: ₹${coinsForUser} each`);
//               }

//               await userModel.findByIdAndUpdate(order.userId, {
//                 $inc: {
//                   walletCoins: coinsForUser,
//                   referralOrderCount: 1
//                 }
//               });

//               await userModel.findByIdAndUpdate(order.referredBy, {
//                 $inc: {
//                   walletCoins: coinsForReferrer,
//                   totalCommissionEarned: Math.floor(order.commissionEarned || 0),
//                   totalReferral: 1
//                 }
//               });

//               console.log(`✅ Referral coins added for COD: User=${coinsForUser}, Referrer=${coinsForReferrer}`);

//               updateData.referralProcessed = true;
//               updateData.referralCoinsAdded = {
//                 user: coinsForUser,
//                 referrer: coinsForReferrer
//               };
//             }
//           }
//         }
//       }

//       const updatedOrder = await orderModel.findOneAndUpdate(
//         { orderid },
//         updateData,
//         { new: true }
//       );

//       if (!updatedOrder) {
//         return res.status(404).json({ success: false, message: "Order not found" });
//       }

//       res.json({
//         success: true,
//         message: "Order delivered and payment marked as completed",
//         order: updatedOrder,
//         paymentUpdated: (order.paymentMethod === "COD" && !order.payment),
//         referralProcessed: updateData.referralProcessed || false
//       });
//     } else {
//       const updatedOrder = await orderModel.findOneAndUpdate(
//         { orderid },
//         { status, updatedAt: Date.now() },
//         { new: true }
//       );

//       if (!updatedOrder) {
//         return res.status(404).json({ success: false, message: "Order not found" });
//       }

//       res.json({ success: true, message: "Order status updated", order: updatedOrder });
//     }

//   } catch (error) {
//     console.error("Error updating order status:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



// In your orderController.js - Update both verifyRazorpay and updateOrderStatusCOD

// const verifyRazorpay = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature
//     } = req.body;

//     console.log("🔍 Verification started:", {
//       razorpay_order_id,
//       razorpay_payment_id
//     });

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing Razorpay fields"
//       });
//     }

//     const generated_signature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//     console.log("🔐 Signature check:", {
//       generated: generated_signature,
//       received: razorpay_signature,
//       match: generated_signature === razorpay_signature
//     });

//     if (generated_signature !== razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid payment signature"
//       });
//     }

//     const order = await orderModel.findOne({ orderid: razorpay_order_id });

//     console.log("🔎 Database order search:", {
//       searchedBy: razorpay_order_id,
//       found: !!order,
//       orderId: order?._id,
//       dbOrderid: order?.orderid,
//       walletDiscount: order?.walletDiscount,
//       coinsUsed: order?.coinsUsed
//     });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found"
//       });
//     }

//     const paymentInfo = await razorpayInstance.payments.fetch(razorpay_payment_id);
//     console.log("💰 Payment info:", {
//       status: paymentInfo.status,
//       amount: paymentInfo.amount,
//       currency: paymentInfo.currency,
//       method: paymentInfo.method
//     });

//     const successfulStatuses = ["captured", "authorized", "processed", "completed"];

//     if (!successfulStatuses.includes(paymentInfo.status)) {
//       console.warn(`⚠️ Payment status is ${paymentInfo.status}`);

//       if (paymentInfo.status === "failed") {
//         await orderModel.findByIdAndUpdate(order._id, {
//           paymentStatus: "failed",
//           paymentError: "Payment failed at Razorpay",
//           updatedAt: Date.now()
//         });

//         return res.status(400).json({
//           success: false,
//           message: "Payment failed at Razorpay"
//         });
//       }

//       return res.status(400).json({
//         success: false,
//         message: `Payment is ${paymentInfo.status}. Please wait or try again.`
//       });
//     }

//     let coinsForUser = 0;
//     let coinsForReferrer = 0;
//     let updateData = {
//       payment: true,
//       paymentId: razorpay_payment_id,
//       razorpayOrderId: razorpay_order_id,
//       paymentStatus: paymentInfo.status,
//       razorpayPaymentInfo: paymentInfo,
//       updatedAt: Date.now()
//     };

//     if (!order.payment) {
//       console.log("💳 First-time payment processing");

//       if (order.coinsUsed && order.coinsUsed > 0) {
//         console.log(`💳 Deducting ${order.coinsUsed} coins from user:`, order.userId);

//         await userModel.findByIdAndUpdate(order.userId, {
//           $inc: { walletCoins: -order.coinsUsed }
//         });

//         console.log(`✅ ${order.coinsUsed} coins deducted from user's wallet`);
//       }

//       if (order.markedReferralUsed) {
//         console.log("👤 Marking referral as used for user:", order.userId);

//         await userModel.updateOne(
//           { _id: order.userId, usedReferral: false },
//           { $set: { usedReferral: true } }
//         );
//       }

//       if (order.referredBy) {
//         console.log("💰 Processing referral coins for:", order.referredBy);

//         const referredUser = await userModel.findById(order.userId);

//         if (referredUser) {
//           const currentReferralCount = referredUser.referralOrderCount || 0;
//           const newReferralCount = currentReferralCount + 1;

//           const paidAmountInRupees = paymentInfo.amount / 100;

//           // ✅ GET REFERRAL CONFIG FOR COIN PERCENTAGES
//           const referralConfig = await referrralModel.findOne();
//           const firstOrderPercent = referralConfig?.firstOrderCoinPercent || 100;
//           const subsequentPercent = referralConfig?.subsequentOrderCoinPercent || 1;

//           if (newReferralCount === 1) {
//             // Use dynamic percentage from config
//             coinsForUser = Math.floor(paidAmountInRupees * (firstOrderPercent / 100));
//             coinsForReferrer = Math.floor(paidAmountInRupees * (firstOrderPercent / 100));
//             console.log(`🎉 First referral order! ${firstOrderPercent}% coins: ₹${coinsForUser} each`);
//           } else {
//             // Use dynamic percentage from config
//             coinsForUser = Math.floor(paidAmountInRupees * (subsequentPercent / 100));
//             coinsForReferrer = Math.floor(paidAmountInRupees * (subsequentPercent / 100));
//             console.log(`📊 Subsequent order (${newReferralCount}): ${subsequentPercent}% coins: ₹${coinsForUser} each`);
//           }

//           await userModel.findByIdAndUpdate(order.userId, {
//             $inc: {
//               walletCoins: coinsForUser,
//               referralOrderCount: 1
//             }
//           });

//           await userModel.findByIdAndUpdate(order.referredBy, {
//             $inc: {
//               walletCoins: coinsForReferrer,
//               totalCommissionEarned: Math.floor(order.commissionEarned || 0),
//               totalReferral: 1
//             }
//           });

//           console.log(`✅ Referral coins added: User=${coinsForUser}, Referrer=${coinsForReferrer}`);

//           // Add referral processing fields for online orders
//           updateData.referralProcessed = true;
//           updateData.referralCoinsAdded = {
//             user: coinsForUser,
//             referrer: coinsForReferrer
//           };
//         }
//       }
//     } else {
//       console.log("⚠️ Payment already processed, skipping updates");
//       // Still include existing referral data if already processed
//       updateData.referralProcessed = order.referralProcessed || false;
//       updateData.referralCoinsAdded = order.referralCoinsAdded || {
//         user: 0,
//         referrer: 0
//       };
//     }

//     const updatedOrder = await orderModel.findByIdAndUpdate(
//       order._id,
//       updateData,
//       { new: true }
//     );

//     console.log("✅ Order updated successfully");


//     await sendPaymentConfirmationOnlineEmail(updatedOrder);
//       // Send SMS for successful payment
//       if (successfulStatuses.includes(paymentInfo.status)) {
//         await orderQueue.add('sendPaymentConfirmationSMS', {
//           orderId: order._id,
//           phone: order.address?.phone || userPhone,
//           amount: paymentInfo.amount / 100,
//           method: paymentInfo.method || 'Online Payment'
//         });
//       }



//     return res.json({
//       success: true,
//       message: `Payment ${paymentInfo.status} successfully`,
//       order: updatedOrder,
//       walletInfo: {
//         coinsUsed: order.coinsUsed || 0,
//         walletDiscount: order.walletDiscount || 0
//       },
//       directReferralApplied: order.referralDiscount > 0,
//       referralDiscount: order.referralDiscount || 0,
//       commissionEarned: order.commissionEarned || 0,
//       markedReferralUsed: order.markedReferralUsed || false,
//       // Add referral processed info in response for online orders
//       referralProcessed: updateData.referralProcessed || false,
//       referralCoinsAdded: updateData.referralCoinsAdded || {
//         user: 0,
//         referrer: 0
//       }
//     });

//   } catch (error) {
//     console.error("❌ Razorpay verify error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message
//     });
//   }
// };

// const updateOrderStatusCOD = async (req, res) => {
//   try {
//     const { orderid, status } = req.body;
//     const order = await orderModel.findOne({ orderid });

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     if (status === "delivered") {
//       const updateData = {
//         status,
//         updatedAt: Date.now()
//       };

//       if (order.paymentMethod === "COD" && !order.payment) {
//         updateData.payment = true;
//         updateData.paymentStatus = "completed";
//         updateData.paymentDate = new Date();

//         console.log(`✅ COD order ${orderid} marked as paid upon delivery`);

//         if (!order.referralProcessed && order.payment === false) {
//           console.log("💰 Processing referral rewards for COD order");

//           if (order.markedReferralUsed) {
//             console.log("👤 Marking referral as used for user:", order.userId);

//             await userModel.updateOne(
//               { _id: order.userId, usedReferral: false },
//               { $set: { usedReferral: true } }
//             );
//           }

//           if (order.referredBy) {
//             console.log("💰 Processing referral coins for COD order:", order.referredBy);

//             const referredUser = await userModel.findById(order.userId);

//             if (referredUser) {
//               const currentReferralCount = referredUser.referralOrderCount || 0;
//               const newReferralCount = currentReferralCount + 1;

//               const paidAmount = order.amount - (order.discount || 0) - (order.walletDiscount || 0);

//               // ✅ GET REFERRAL CONFIG FOR COIN PERCENTAGES
//               const referralConfig = await referrralModel.findOne();
//               const firstOrderPercent = referralConfig?.firstOrderCoinPercent || 100;
//               const subsequentPercent = referralConfig?.subsequentOrderCoinPercent || 1;

//               let coinsForUser = 0;
//               let coinsForReferrer = 0;

//               if (newReferralCount === 1) {
//                 // Use dynamic percentage from config
//                 coinsForUser = Math.floor(paidAmount * (firstOrderPercent / 100));
//                 coinsForReferrer = Math.floor(paidAmount * (firstOrderPercent / 100));
//                 console.log(`🎉 First referral COD order! ${firstOrderPercent}% coins: ₹${coinsForUser} each`);
//               } else {
//                 // Use dynamic percentage from config
//                 coinsForUser = Math.floor(paidAmount * (subsequentPercent / 100));
//                 coinsForReferrer = Math.floor(paidAmount * (subsequentPercent / 100));
//                 console.log(`📊 Subsequent COD order (${newReferralCount}): ${subsequentPercent}% coins: ₹${coinsForUser} each`);
//               }

//               await userModel.findByIdAndUpdate(order.userId, {
//                 $inc: {
//                   walletCoins: coinsForUser,
//                   referralOrderCount: 1
//                 }
//               });

//               await userModel.findByIdAndUpdate(order.referredBy, {
//                 $inc: {
//                   walletCoins: coinsForReferrer,
//                   totalCommissionEarned: Math.floor(order.commissionEarned || 0),
//                   totalReferral: 1
//                 }
//               });

//               console.log(`✅ Referral coins added for COD: User=${coinsForUser}, Referrer=${coinsForReferrer}`);

//               updateData.referralProcessed = true;
//               updateData.referralCoinsAdded = {
//                 user: coinsForUser,
//                 referrer: coinsForReferrer
//               };
//             }
//           }
//         }
//       }

//       const updatedOrder = await orderModel.findOneAndUpdate(
//         { orderid },
//         updateData,
//         { new: true }
//       );

//       if (!updatedOrder) {
//         return res.status(404).json({ success: false, message: "Order not found" });
//       }

//        // Send SMS for delivered status
//       await orderQueue.add('sendStatusUpdateSMS', {
//         orderId: orderid,
//         phone: order.address?.phone || '',
//         status: status
//       });

//       res.json({
//         success: true,
//         message: "Order delivered and payment marked as completed",
//         order: updatedOrder,
//         paymentUpdated: (order.paymentMethod === "COD" && !order.payment),
//         referralProcessed: updateData.referralProcessed || false
//       });
//     } else {
//       const updatedOrder = await orderModel.findOneAndUpdate(
//         { orderid },
//         { status, updatedAt: Date.now() },
//         { new: true }
//       );
//       // Send SMS for other status updates
//       await orderQueue.add('sendStatusUpdateSMS', {
//         orderId: orderid,
//         phone: order.address?.phone || '',
//         status: status
//       });

//       if (!updatedOrder) {
//         return res.status(404).json({ success: false, message: "Order not found" });
//       }

//       res.json({ success: true, message: "Order status updated", order: updatedOrder });
//     }

//   } catch (error) {
//     console.error("Error updating order status:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export {
//   placeOrderCOD,
//   updateOrderStatusCOD,
//   placeOrderRazorpay,
//   verifyRazorpay,
//   allOrders,
//   userOrders,
//   updateStatus,
//   userSingleOrder,
// };





// import Razorpay from "razorpay";
// import crypto from "crypto";
// import orderModel from "../models/orderModel.js";
// import nodemailer from 'nodemailer';
// import { emailQueue, orderQueue } from '../config/queue.js';
// import userModel from "../models/authModel.js";
// import referrralModel from "../models/referralModel.js";
// import dotenv from "dotenv";
// dotenv.config();

// const razorpayInstance = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // Add SMS import at the top
// import SMSService from '../utils/smsService.js';

// console.log("🚀 Razorpay Instance Configured:", {
//   key_id: process.env.RAZORPAY_KEY_ID ? "SET" : "NOT SET",
//   key_secret: process.env.RAZORPAY_KEY_SECRET ? "SET" : "NOT SET",
// });

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // Email queue functions (keep as is)
// const sendCODOrderConfirmationEmail = async (order) => {
//   try {
//     await emailQueue.add('sendCODConfirmation', {
//       to: order.address.email,
//       order: order.toObject ? order.toObject() : order,
//       template: 'cod_confirmation',
//     });
//     console.log(`📨 COD confirmation email job queued for: ${order.address.email}`);
//   } catch (error) {
//     console.error('Error queuing COD email:', error);
//   }
// };

// const sendPaymentConfirmationOnlineEmail = async (order) => {
//   await emailQueue.add('sendOnlinePaymentConfirmation', {
//     to: order.address.email,
//     order: order.toObject ? order.toObject() : order,
//     template: 'online_payment_confirmation',
//   });
// };

// const sendStatusUpdateEmail = async (order) => {
//   await emailQueue.add('sendStatusUpdate', {
//     to: order.address.email,
//     order: order.toObject ? order.toObject() : order,
//     template: 'status_update',
//   });
// };

// const placeOrderCOD = async (req, res) => {
//   try {
//     const userid = req.user.id;
//     const userPhone = req.user.number;
//     const { userId, items, amount, address, couponCode, useWalletCoins = false } = req.body;

//     if (!items || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No items provided in the order"
//       });
//     }

//     const user = await userModel.findOne({ number: userPhone });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     let walletDiscount = 0;
//     let coinsUsed = 0;

//     if (useWalletCoins) {
//       if (!user || user.walletCoins <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Insufficient wallet coins or user not found"
//         });
//       }

//       const availableCoins = user.walletCoins;
//       const tenPercentOfOrder = Math.floor(amount * 0.1);
//       const tenPercentOfCoins = Math.floor(availableCoins * 0.1);
//       walletDiscount = Math.min(tenPercentOfOrder, tenPercentOfCoins);

//       if (walletDiscount > availableCoins) {
//         return res.status(400).json({
//           success: false,
//           message: `Insufficient coins. You need ${walletDiscount} coins but have only ${availableCoins}`
//         });
//       }

//       coinsUsed = walletDiscount;
//       console.log(`✅ Wallet discount applied: ₹${walletDiscount} (using ${coinsUsed} coins)`);
//     }

//     let config = await referrralModel.findOne();
//     if (!config) {
//       config = new referrralModel({
//         userDiscountPercent: 5,
//         referrerCommissionPercent: 5,
//         maxDirectDiscountPercent: 20,
//         maxTotalDiscountPercent: 30
//       });
//       await config.save();
//     }

//     let referralDiscount = 0;
//     let commission = 0;
//     let referredBy = null;
//     let shouldMarkReferralUsed = false;

//     if (user.referredBy && !user.usedReferral) {
//       referredBy = user.referredBy;
//       const amountAfterWallet = Math.max(0, amount - walletDiscount);
//       referralDiscount = (amountAfterWallet * config.userDiscountPercent) / 100;
//       commission = (amountAfterWallet * config.referrerCommissionPercent) / 100;
//       shouldMarkReferralUsed = true;

//       console.log(`👥 Direct referral applied: 
//         Discount: ₹${referralDiscount}
//         Commission: ₹${commission}
//         Referrer: ${referredBy}
//       `);
//     }

//     const maxAllowedDiscount = (amount * config.maxTotalDiscountPercent) / 100;
//     const totalCalculatedDiscount = referralDiscount;
//     let finalDiscount = Math.min(totalCalculatedDiscount, maxAllowedDiscount);

//     const amountAfterWallet = Math.max(0, amount - walletDiscount);
//     const finalAmount = Math.max(0, amountAfterWallet - finalDiscount);

//     const uniqueOrderId = `COD-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;

//     // Queue order processing
//     await orderQueue.add('processCODOrder', {
//       orderId: uniqueOrderId,
//       userId: user._id,
//       items,
//       amount,
//       address,
//       paymentMethod: "COD",
//       payment: false,
//       couponCode,
//       discount: finalDiscount,
//       walletDiscount: walletDiscount,
//       coinsUsed: coinsUsed,
//       referralDiscount: referralDiscount,
//       totalDiscount: finalDiscount + walletDiscount,
//       commissionEarned: commission,
//       referredBy: referredBy,
//       referralConfigUsed: {
//         userDiscountPercent: config.userDiscountPercent,
//         referrerCommissionPercent: config.referrerCommissionPercent,
//         maxDirectDiscountPercent: config.maxDirectDiscountPercent,
//         maxTotalDiscountPercent: config.maxTotalDiscountPercent
//       },
//       shouldMarkReferralUsed: shouldMarkReferralUsed,
//       userPhone: userPhone
//     });

//     // Queue SMS notification
//     await orderQueue.add('sendOrderConfirmationSMS', {
//       orderId: uniqueOrderId,
//       phone: userPhone,
//       orderData: {
//         orderid: uniqueOrderId,
//         amount: amount,
//         address: address
//       }
//     }, {
//       delay: 2000 // Delay 2 seconds to ensure order is processed first
//     });

//     console.log(`📦 Order ${uniqueOrderId} queued for processing`);
//     console.log(`📱 Order confirmation SMS queued for ${userPhone}`);

//     res.json({
//       success: true,
//       message: "Order processing started",
//       orderid: uniqueOrderId,
//       walletDiscount: walletDiscount,
//       coinsUsed: coinsUsed,
//       referralInfo: {
//         applied: shouldMarkReferralUsed,
//         discount: referralDiscount,
//         commission: commission
//       }
//     });

//   } catch (error) {
//     console.error("Error in placeOrderCOD:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server Error"
//     });
//   }
// };

// const placeOrderRazorpay = async (req, res) => {
//   const userPhone = req.user.number;

//   try {
//     const { userId, items, amount, address, couponCode, useWalletCoins = false } = req.body;

//     const user = await userModel.findOne({ number: userPhone }).populate("referredBy");

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     let walletDiscount = 0;
//     let coinsUsed = 0;

//     if (useWalletCoins) {
//       if (!user || user.walletCoins <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Insufficient wallet coins or user not found"
//         });
//       }

//       const availableCoins = user.walletCoins;
//       const tenPercentOfOrder = Math.floor(amount * 0.1);
//       const tenPercentOfCoins = Math.floor(availableCoins * 0.1);
//       walletDiscount = Math.min(tenPercentOfOrder, tenPercentOfCoins);

//       if (walletDiscount > availableCoins) {
//         return res.status(400).json({
//           success: false,
//           message: `Insufficient coins. You need ${walletDiscount} coins but have only ${availableCoins}`
//         });
//       }

//       coinsUsed = walletDiscount;
//       console.log(`✅ Wallet discount applied: ₹${walletDiscount} (using ${coinsUsed} coins)`);
//     }

//     let config = await referrralModel.findOne();
//     if (!config) {
//       config = new referrralModel({
//         userDiscountPercent: 10,
//         referrerCommissionPercent: 10,
//         maxDirectDiscountPercent: 20,
//         maxTotalDiscountPercent: 30
//       });
//       await config.save();
//     }

//     const amountAfterWallet = Math.max(0, amount - walletDiscount);
//     let referralDiscount = 0;
//     let commission = 0;
//     let referredBy = null;
//     let shouldMarkReferralUsed = false;

//     if (user && user.referredBy && !user.usedReferral) {
//       referredBy = user.referredBy._id;
//       referralDiscount = (amountAfterWallet * config.userDiscountPercent) / 100;
//       commission = (amountAfterWallet * config.referrerCommissionPercent) / 100;
//       shouldMarkReferralUsed = true;
//     }

//     const maxAllowedDiscount = (amount * config.maxTotalDiscountPercent) / 100;
//     const totalCalculatedDiscount = referralDiscount;
//     let finalDiscount = Math.min(totalCalculatedDiscount, maxAllowedDiscount);

//     const finalAmount = Math.max(0, amountAfterWallet - finalDiscount);

//     const tempOrderId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

//     const newOrder = new orderModel({
//       orderid: tempOrderId,
//       userId: user._id,
//       items,
//       amount,
//       address,
//       paymentMethod: "Razorpay",
//       payment: false,
//       couponCode,
//       discount: finalDiscount,
//       walletDiscount: walletDiscount,
//       coinsUsed: coinsUsed,
//       referralDiscount: referralDiscount,
//       totalDiscount: finalDiscount + walletDiscount,
//       commissionEarned: commission,
//       referredBy: referredBy,
//       referralConfigUsed: config,
//       markedReferralUsed: shouldMarkReferralUsed,
//       shouldProcessReferrals: shouldMarkReferralUsed
//     });

//     await newOrder.save();

//     const options = {
//       amount: Math.round(finalAmount * 100),
//       currency: "INR",
//       receipt: newOrder._id.toString(),
//     };

//     razorpayInstance.orders.create(options, async (error, razorpayOrder) => {
//       if (error) {
//         console.error("Razorpay error:", error);
//         await orderModel.findByIdAndDelete(newOrder._id);
//         return res.status(500).json({
//           success: false,
//           message: "Razorpay order creation failed"
//         });
//       }

//       await orderModel.findByIdAndUpdate(newOrder._id, {
//         orderid: razorpayOrder.id,
//         razorpayOrderId: razorpayOrder.id
//       });

//       res.json({
//         success: true,
//         order: razorpayOrder,
//         orderId: newOrder._id,
//         razorpayOrderId: razorpayOrder.id,
//         walletInfo: {
//           applied: useWalletCoins,
//           discount: walletDiscount,
//           coinsUsed: coinsUsed
//         },
//         referralInfo: {
//           hasDirectReferral: !!(user && user.referredBy),
//           directReferralApplied: referralDiscount > 0,
//           referralDiscount: referralDiscount,
//           commission: commission,
//           finalAmount: finalAmount,
//           originalAmount: amount,
//           markedReferralUsed: shouldMarkReferralUsed,
//           referralStatus: user?.usedReferral ? "ALREADY_USED" : "ELIGIBLE",
//           referralProcessed: false,
//           referralCoinsAdded: {
//             user: 0,
//             referrer: 0
//           }
//         }
//       });

//       await orderQueue.add('postRazorpayOrderTasks', {
//         orderId: razorpayOrder.id,
//         orderData: newOrder.toObject(),
//         useWalletCoins: useWalletCoins,
//         walletDiscount: walletDiscount,
//         coinsUsed: coinsUsed
//       }, {
//         delay: 500
//       });
//     });

//   } catch (error) {
//     console.error("Error in placeOrderRazorpay:", error);

//     if (error.code === 11000) {
//       return res.status(409).json({
//         success: false,
//         message: "Order creation failed due to duplicate key. Please try again."
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Server Error"
//     });
//   }
// };

// const verifyRazorpay = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature
//     } = req.body;

//     console.log("🔍 Verification started:", {
//       razorpay_order_id,
//       razorpay_payment_id
//     });

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing Razorpay fields"
//       });
//     }

//     const generated_signature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//     console.log("🔐 Signature check:", {
//       generated: generated_signature,
//       received: razorpay_signature,
//       match: generated_signature === razorpay_signature
//     });

//     if (generated_signature !== razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid payment signature"
//       });
//     }

//     const order = await orderModel.findOne({ orderid: razorpay_order_id });

//     console.log("🔎 Database order search:", {
//       searchedBy: razorpay_order_id,
//       found: !!order,
//       orderId: order?._id,
//       dbOrderid: order?.orderid,
//       walletDiscount: order?.walletDiscount,
//       coinsUsed: order?.coinsUsed
//     });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found"
//       });
//     }

//     const paymentInfo = await razorpayInstance.payments.fetch(razorpay_payment_id);
//     console.log("💰 Payment info:", {
//       status: paymentInfo.status,
//       amount: paymentInfo.amount,
//       currency: paymentInfo.currency,
//       method: paymentInfo.method
//     });

//     const successfulStatuses = ["captured", "authorized", "processed", "completed"];

//     if (!successfulStatuses.includes(paymentInfo.status)) {
//       console.warn(`⚠️ Payment status is ${paymentInfo.status}`);

//       if (paymentInfo.status === "failed") {
//         await orderModel.findByIdAndUpdate(order._id, {
//           paymentStatus: "failed",
//           paymentError: "Payment failed at Razorpay",
//           updatedAt: Date.now()
//         });

//         return res.status(400).json({
//           success: false,
//           message: "Payment failed at Razorpay"
//         });
//       }

//       return res.status(400).json({
//         success: false,
//         message: `Payment is ${paymentInfo.status}. Please wait or try again.`
//       });
//     }

//     let coinsForUser = 0;
//     let coinsForReferrer = 0;
//     let updateData = {
//       payment: true,
//       paymentId: razorpay_payment_id,
//       razorpayOrderId: razorpay_order_id,
//       paymentStatus: paymentInfo.status,
//       razorpayPaymentInfo: paymentInfo,
//       updatedAt: Date.now()
//     };

//     if (!order.payment) {
//       console.log("💳 First-time payment processing");

//       if (order.coinsUsed && order.coinsUsed > 0) {
//         console.log(`💳 Deducting ${order.coinsUsed} coins from user:`, order.userId);

//         await userModel.findByIdAndUpdate(order.userId, {
//           $inc: { walletCoins: -order.coinsUsed }
//         });

//         console.log(`✅ ${order.coinsUsed} coins deducted from user's wallet`);
//       }

//       if (order.markedReferralUsed) {
//         console.log("👤 Marking referral as used for user:", order.userId);

//         await userModel.updateOne(
//           { _id: order.userId, usedReferral: false },
//           { $set: { usedReferral: true } }
//         );
//       }

//       if (order.referredBy) {
//         console.log("💰 Processing referral coins for:", order.referredBy);

//         const referredUser = await userModel.findById(order.userId);

//         if (referredUser) {
//           const currentReferralCount = referredUser.referralOrderCount || 0;
//           const newReferralCount = currentReferralCount + 1;

//           const paidAmountInRupees = paymentInfo.amount / 100;

//           const referralConfig = await referrralModel.findOne();
//           const firstOrderPercent = referralConfig?.firstOrderCoinPercent || 100;
//           const subsequentPercent = referralConfig?.subsequentOrderCoinPercent || 1;

//           if (newReferralCount === 1) {
//             coinsForUser = Math.floor(paidAmountInRupees * (firstOrderPercent / 100));
//             coinsForReferrer = Math.floor(paidAmountInRupees * (firstOrderPercent / 100));
//             console.log(`🎉 First referral order! ${firstOrderPercent}% coins: ₹${coinsForUser} each`);
//           } else {
//             coinsForUser = Math.floor(paidAmountInRupees * (subsequentPercent / 100));
//             coinsForReferrer = Math.floor(paidAmountInRupees * (subsequentPercent / 100));
//             console.log(`📊 Subsequent order (${newReferralCount}): ${subsequentPercent}% coins: ₹${coinsForUser} each`);
//           }

//           await userModel.findByIdAndUpdate(order.userId, {
//             $inc: {
//               walletCoins: coinsForUser,
//               referralOrderCount: 1
//             }
//           });

//           await userModel.findByIdAndUpdate(order.referredBy, {
//             $inc: {
//               walletCoins: coinsForReferrer,
//               totalCommissionEarned: Math.floor(order.commissionEarned || 0),
//               totalReferral: 1
//             }
//           });

//           console.log(`✅ Referral coins added: User=${coinsForUser}, Referrer=${coinsForReferrer}`);

//           updateData.referralProcessed = true;
//           updateData.referralCoinsAdded = {
//             user: coinsForUser,
//             referrer: coinsForReferrer
//           };
//         }
//       }
//     } else {
//       console.log("⚠️ Payment already processed, skipping updates");
//       updateData.referralProcessed = order.referralProcessed || false;
//       updateData.referralCoinsAdded = order.referralCoinsAdded || {
//         user: 0,
//         referrer: 0
//       };
//     }

//     const updatedOrder = await orderModel.findByIdAndUpdate(
//       order._id,
//       updateData,
//       { new: true }
//     );

//     console.log("✅ Order updated successfully");

//     // Send payment confirmation email
//     await sendPaymentConfirmationOnlineEmail(updatedOrder);

//     // Send payment confirmation SMS
//     if (successfulStatuses.includes(paymentInfo.status)) {
//       const phoneNumber = order.address?.phone || req.user?.number;
//       if (phoneNumber) {
//         await orderQueue.add('sendPaymentConfirmationSMS', {
//           orderId: order._id.toString(),
//           phone: phoneNumber,
//           amount: paymentInfo.amount / 100,
//           method: paymentInfo.method || 'Online Payment'
//         });
//         console.log(`📱 Payment confirmation SMS queued for ${phoneNumber}`);
//       }
//     }

//     return res.json({
//       success: true,
//       message: `Payment ${paymentInfo.status} successfully`,
//       order: updatedOrder,
//       walletInfo: {
//         coinsUsed: order.coinsUsed || 0,
//         walletDiscount: order.walletDiscount || 0
//       },
//       directReferralApplied: order.referralDiscount > 0,
//       referralDiscount: order.referralDiscount || 0,
//       commissionEarned: order.commissionEarned || 0,
//       markedReferralUsed: order.markedReferralUsed || false,
//       referralProcessed: updateData.referralProcessed || false,
//       referralCoinsAdded: updateData.referralCoinsAdded || {
//         user: 0,
//         referrer: 0
//       }
//     });

//   } catch (error) {
//     console.error("❌ Razorpay verify error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message
//     });
//   }
// };

// const updateOrderStatusCOD = async (req, res) => {
//   try {
//     const { orderid, status } = req.body;
//     const order = await orderModel.findOne({ orderid });

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     const updateData = {
//       status,
//       updatedAt: Date.now()
//     };

//     if (status === "delivered") {
//       if (order.paymentMethod === "COD" && !order.payment) {
//         updateData.payment = true;
//         updateData.paymentStatus = "completed";
//         updateData.paymentDate = new Date();

//         console.log(`✅ COD order ${orderid} marked as paid upon delivery`);

//         if (!order.referralProcessed && order.payment === false) {
//           console.log("💰 Processing referral rewards for COD order");

//           if (order.markedReferralUsed) {
//             console.log("👤 Marking referral as used for user:", order.userId);

//             await userModel.updateOne(
//               { _id: order.userId, usedReferral: false },
//               { $set: { usedReferral: true } }
//             );
//           }

//           if (order.referredBy) {
//             console.log("💰 Processing referral coins for COD order:", order.referredBy);

//             const referredUser = await userModel.findById(order.userId);

//             if (referredUser) {
//               const currentReferralCount = referredUser.referralOrderCount || 0;
//               const newReferralCount = currentReferralCount + 1;

//               const paidAmount = order.amount - (order.discount || 0) - (order.walletDiscount || 0);

//               const referralConfig = await referrralModel.findOne();
//               const firstOrderPercent = referralConfig?.firstOrderCoinPercent || 100;
//               const subsequentPercent = referralConfig?.subsequentOrderCoinPercent || 1;

//               let coinsForUser = 0;
//               let coinsForReferrer = 0;

//               if (newReferralCount === 1) {
//                 coinsForUser = Math.floor(paidAmount * (firstOrderPercent / 100));
//                 coinsForReferrer = Math.floor(paidAmount * (firstOrderPercent / 100));
//                 console.log(`🎉 First referral COD order! ${firstOrderPercent}% coins: ₹${coinsForUser} each`);
//               } else {
//                 coinsForUser = Math.floor(paidAmount * (subsequentPercent / 100));
//                 coinsForReferrer = Math.floor(paidAmount * (subsequentPercent / 100));
//                 console.log(`📊 Subsequent COD order (${newReferralCount}): ${subsequentPercent}% coins: ₹${coinsForUser} each`);
//               }

//               await userModel.findByIdAndUpdate(order.userId, {
//                 $inc: {
//                   walletCoins: coinsForUser,
//                   referralOrderCount: 1
//                 }
//               });

//               await userModel.findByIdAndUpdate(order.referredBy, {
//                 $inc: {
//                   walletCoins: coinsForReferrer,
//                   totalCommissionEarned: Math.floor(order.commissionEarned || 0),
//                   totalReferral: 1
//                 }
//               });

//               console.log(`✅ Referral coins added for COD: User=${coinsForUser}, Referrer=${coinsForReferrer}`);

//               updateData.referralProcessed = true;
//               updateData.referralCoinsAdded = {
//                 user: coinsForUser,
//                 referrer: coinsForReferrer
//               };
//             }
//           }
//         }
//       }
//     }

//     const updatedOrder = await orderModel.findOneAndUpdate(
//       { orderid },
//       updateData,
//       { new: true }
//     );

//     if (!updatedOrder) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     // Send status update email
//     await sendStatusUpdateEmail(updatedOrder);

//     // Send status update SMS
//     const phoneNumber = order.address?.phone || '';
//     if (phoneNumber) {
//       await orderQueue.add('sendStatusUpdateSMS', {
//         orderId: orderid,
//         phone: phoneNumber,
//         status: status
//       });
//       console.log(`📱 Status update SMS queued for ${phoneNumber}`);
//     }

//     res.json({
//       success: true,
//       message: `Order status updated to ${status}`,
//       order: updatedOrder,
//       paymentUpdated: (order.paymentMethod === "COD" && !order.payment && status === "delivered"),
//       referralProcessed: updateData.referralProcessed || false
//     });

//   } catch (error) {
//     console.error("Error updating order status:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Keep other functions as they are (allOrders, userSingleOrder, userOrders, updateStatus)
// const allOrders = async (req, res) => {
//   try {
//     const orders = await orderModel.find({});
//     res.json({ success: true, orders });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const userSingleOrder = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const order = await orderModel.findOne({ orderid: id }).lean();

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     res.json({ success: true, order });
//   } catch (error) {
//     console.error("❌ Internal Error:", error);
//     res.status(500).json({ success: false, message: "Server Error. Please try again." });
//   }
// };

// const userOrders = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const orders = await orderModel.find({ userId });
//     res.json({ success: true, orders });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const updateStatus = async (req, res) => {
//   try {
//     const { orderid, status } = req.body;
//     const updated = await orderModel.findOneAndUpdate(
//       { orderid },
//       { status },
//       { new: true }
//     );

//     if (!updated) return res.status(404).json({ success: false, message: "Order not found" });

//     await sendStatusUpdateEmail(updated);

//     res.json({ success: true, message: "Order updated", order: updated });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export {
//   placeOrderCOD,
//   updateOrderStatusCOD,
//   placeOrderRazorpay,
//   verifyRazorpay,
//   allOrders,
//   userOrders,
//   updateStatus,
//   userSingleOrder,
// };




import Razorpay from "razorpay";
import crypto from "crypto";
import orderModel from "../models/orderModel.js";
import nodemailer from 'nodemailer';
import { emailQueue, orderQueue } from '../config/queue.js';
import userModel from "../models/authModel.js";
import referrralModel from "../models/referralModel.js";
import dotenv from "dotenv";
import SMSService from '../utils/smsService.js'; // Add this import

dotenv.config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log("🚀 Razorpay Instance Configured:", {
  key_id: process.env.RAZORPAY_KEY_ID ? "SET" : "NOT SET",
  key_secret: process.env.RAZORPAY_KEY_SECRET ? "SET" : "NOT SET",
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email queue functions
const sendCODOrderConfirmationEmail = async (order) => {
  try {
    await emailQueue.add('sendCODConfirmation', {
      to: order.address.email,
      order: order.toObject ? order.toObject() : order,
      template: 'cod_confirmation',
    });
    console.log(`📨 COD confirmation email job queued for: ${order.address.email}`);
  } catch (error) {
    console.error('Error queuing COD email:', error);
  }
};

const sendPaymentConfirmationOnlineEmail = async (order) => {
  await emailQueue.add('sendOnlinePaymentConfirmation', {
    to: order.address.email,
    order: order.toObject ? order.toObject() : order,
    template: 'online_payment_confirmation',
  });
};

const sendStatusUpdateEmail = async (order) => {
  await emailQueue.add('sendStatusUpdate', {
    to: order.address.email,
    order: order.toObject ? order.toObject() : order,
    template: 'status_update',
  });
};

const placeOrderCOD = async (req, res) => {
  try {
    const userid = req.user.id;
    const userPhone = req.user.number;
    const { userId, items, amount, address, couponCode, useWalletCoins = false } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items provided in the order"
      });
    }

    const user = await userModel.findOne({ number: userPhone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    let walletDiscount = 0;
    let coinsUsed = 0;

    if (useWalletCoins) {
      if (!user || user.walletCoins <= 0) {
        return res.status(400).json({
          success: false,
          message: "Insufficient wallet coins or user not found"
        });
      }

      const availableCoins = user.walletCoins;
      const tenPercentOfOrder = Math.floor(amount * 0.1);
      const tenPercentOfCoins = Math.floor(availableCoins * 0.1);
      walletDiscount = Math.min(tenPercentOfOrder, tenPercentOfCoins);

      if (walletDiscount > availableCoins) {
        return res.status(400).json({
          success: false,
          message: `Insufficient coins. You need ${walletDiscount} coins but have only ${availableCoins}`
        });
      }

      coinsUsed = walletDiscount;
      console.log(`✅ Wallet discount applied: ₹${walletDiscount} (using ${coinsUsed} coins)`);
    }

    let config = await referrralModel.findOne();
    if (!config) {
      config = new referrralModel({
        userDiscountPercent: 5,
        referrerCommissionPercent: 5,
        maxDirectDiscountPercent: 20,
        maxTotalDiscountPercent: 30
      });
      await config.save();
    }

    let referralDiscount = 0;
    let commission = 0;
    let referredBy = null;
    let shouldMarkReferralUsed = false;

    if (user.referredBy && !user.usedReferral) {
      referredBy = user.referredBy;
      const amountAfterWallet = Math.max(0, amount - walletDiscount);
      referralDiscount = (amountAfterWallet * config.userDiscountPercent) / 100;
      commission = (amountAfterWallet * config.referrerCommissionPercent) / 100;
      shouldMarkReferralUsed = true;

      console.log(`👥 Direct referral applied: 
        Discount: ₹${referralDiscount}
        Commission: ₹${commission}
        Referrer: ${referredBy}
      `);
    }

    const maxAllowedDiscount = (amount * config.maxTotalDiscountPercent) / 100;
    const totalCalculatedDiscount = referralDiscount;
    let finalDiscount = Math.min(totalCalculatedDiscount, maxAllowedDiscount);

    const amountAfterWallet = Math.max(0, amount - walletDiscount);
    const finalAmount = Math.max(0, amountAfterWallet - finalDiscount);

    // const uniqueOrderId = `COD-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;


    // await orderQueue.add('processCODOrder', {
    //   orderId: uniqueOrderId,
    //   userId: user._id,
    //   items,
    //   amount,
    //   address,
    //   paymentMethod: "COD",
    //   payment: false,
    //   couponCode,
    //   discount: finalDiscount,
    //   walletDiscount: walletDiscount,
    //   coinsUsed: coinsUsed,
    //   referralDiscount: referralDiscount,
    //   totalDiscount: finalDiscount + walletDiscount,
    //   commissionEarned: commission,
    //   referredBy: referredBy,
    //   referralConfigUsed: {
    //     userDiscountPercent: config.userDiscountPercent,
    //     referrerCommissionPercent: config.referrerCommissionPercent,
    //     maxDirectDiscountPercent: config.maxDirectDiscountPercent,
    //     maxTotalDiscountPercent: config.maxTotalDiscountPercent
    //   },
    //   shouldMarkReferralUsed: shouldMarkReferralUsed,
    //   userPhone: userPhone
    // });

    const uniqueOrderId = `order_${Date.now()}`;

    const order = await orderModel.create({
      userId: user._id,
      orderid: uniqueOrderId,
      items,
      amount: finalAmount,
      address,
      status: "Order Placed",
      paymentMethod: "COD",
      payment: false,
      walletDiscount,
      coinsUsed,
      referralDiscount,
      discount: finalDiscount,
      commissionEarned: commission,
      referredBy,
      referralConfigUsed: {
        userDiscountPercent: config.userDiscountPercent,
        referrerCommissionPercent: config.referrerCommissionPercent,
        maxDirectDiscountPercent: config.maxDirectDiscountPercent,
        maxTotalDiscountPercent: config.maxTotalDiscountPercent
      },
      shouldMarkReferralUsed: shouldMarkReferralUsed,
      userPhone: userPhone
    });


    // Queue SMS notification
    await orderQueue.add('sendOrderConfirmationSMS', {
      orderId: uniqueOrderId,
      phone: userPhone
    }, {
      delay: 2000 // Delay 2 seconds to ensure order is processed first
    });

    console.log(`📦 Order ${uniqueOrderId} queued for processing`);
    console.log(`📱 Order confirmation SMS queued for ${userPhone}`);

    res.json({
      success: true,
      message: "Order processing started",
      orderid: uniqueOrderId,
      walletDiscount: walletDiscount,
      coinsUsed: coinsUsed,
      referralInfo: {
        applied: shouldMarkReferralUsed,
        discount: referralDiscount,
        commission: commission
      }
    });

  } catch (error) {
    console.error("Error in placeOrderCOD:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

const placeOrderRazorpay = async (req, res) => {
  const userPhone = req.user.number;

  try {
    const { userId, items, amount, address, couponCode, useWalletCoins = false } = req.body;

    const user = await userModel.findOne({ number: userPhone }).populate("referredBy");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    let walletDiscount = 0;
    let coinsUsed = 0;

    if (useWalletCoins) {
      if (!user || user.walletCoins <= 0) {
        return res.status(400).json({
          success: false,
          message: "Insufficient wallet coins or user not found"
        });
      }

      const availableCoins = user.walletCoins;
      const tenPercentOfOrder = Math.floor(amount * 0.1);
      const tenPercentOfCoins = Math.floor(availableCoins * 0.1);
      walletDiscount = Math.min(tenPercentOfOrder, tenPercentOfCoins);

      if (walletDiscount > availableCoins) {
        return res.status(400).json({
          success: false,
          message: `Insufficient coins. You need ${walletDiscount} coins but have only ${availableCoins}`
        });
      }

      coinsUsed = walletDiscount;
      console.log(`✅ Wallet discount applied: ₹${walletDiscount} (using ${coinsUsed} coins)`);
    }

    let config = await referrralModel.findOne();
    if (!config) {
      config = new referrralModel({
        userDiscountPercent: 10,
        referrerCommissionPercent: 10,
        maxDirectDiscountPercent: 20,
        maxTotalDiscountPercent: 30
      });
      await config.save();
    }

    const amountAfterWallet = Math.max(0, amount - walletDiscount);
    let referralDiscount = 0;
    let commission = 0;
    let referredBy = null;
    let shouldMarkReferralUsed = false;

    if (user && user.referredBy && !user.usedReferral) {
      referredBy = user.referredBy._id;
      referralDiscount = (amountAfterWallet * config.userDiscountPercent) / 100;
      commission = (amountAfterWallet * config.referrerCommissionPercent) / 100;
      shouldMarkReferralUsed = true;
    }

    const maxAllowedDiscount = (amount * config.maxTotalDiscountPercent) / 100;
    const totalCalculatedDiscount = referralDiscount;
    let finalDiscount = Math.min(totalCalculatedDiscount, maxAllowedDiscount);

    const finalAmount = Math.max(0, amountAfterWallet - finalDiscount);

    const tempOrderId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newOrder = new orderModel({
      orderid: tempOrderId,
      userId: user._id,
      items,
      amount,
      address,
      paymentMethod: "Razorpay",
      payment: false,
      couponCode,
      discount: finalDiscount,
      walletDiscount: walletDiscount,
      coinsUsed: coinsUsed,
      referralDiscount: referralDiscount,
      totalDiscount: finalDiscount + walletDiscount,
      commissionEarned: commission,
      referredBy: referredBy,
      referralConfigUsed: config,
      markedReferralUsed: shouldMarkReferralUsed,
      shouldProcessReferrals: shouldMarkReferralUsed
    });

    await newOrder.save();

    const options = {
      amount: Math.round(finalAmount * 100),
      currency: "INR",
      receipt: newOrder._id.toString(),
    };

    razorpayInstance.orders.create(options, async (error, razorpayOrder) => {
      if (error) {
        console.error("Razorpay error:", error);
        await orderModel.findByIdAndDelete(newOrder._id);
        return res.status(500).json({
          success: false,
          message: "Razorpay order creation failed"
        });
      }

      await orderModel.findByIdAndUpdate(newOrder._id, {
        orderid: razorpayOrder.id,
        razorpayOrderId: razorpayOrder.id
      });

      res.json({
        success: true,
        order: razorpayOrder,
        orderId: newOrder._id,
        razorpayOrderId: razorpayOrder.id,
        walletInfo: {
          applied: useWalletCoins,
          discount: walletDiscount,
          coinsUsed: coinsUsed
        },
        referralInfo: {
          hasDirectReferral: !!(user && user.referredBy),
          directReferralApplied: referralDiscount > 0,
          referralDiscount: referralDiscount,
          commission: commission,
          finalAmount: finalAmount,
          originalAmount: amount,
          markedReferralUsed: shouldMarkReferralUsed,
          referralStatus: user?.usedReferral ? "ALREADY_USED" : "ELIGIBLE",
          referralProcessed: false,
          referralCoinsAdded: {
            user: 0,
            referrer: 0
          }
        }
      });

      await orderQueue.add('postRazorpayOrderTasks', {
        orderId: razorpayOrder.id,
        orderData: newOrder.toObject(),
        useWalletCoins: useWalletCoins,
        walletDiscount: walletDiscount,
        coinsUsed: coinsUsed
      }, {
        delay: 500
      });
    });

  } catch (error) {
    console.error("Error in placeOrderRazorpay:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Order creation failed due to duplicate key. Please try again."
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// const verifyRazorpay = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature
//     } = req.body;

//     console.log("🔍 Verification started:", {
//       razorpay_order_id,
//       razorpay_payment_id
//     });

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing Razorpay fields"
//       });
//     }

//     const generated_signature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//     console.log("🔐 Signature check:", {
//       generated: generated_signature,
//       received: razorpay_signature,
//       match: generated_signature === razorpay_signature
//     });

//     if (generated_signature !== razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid payment signature"
//       });
//     }

//     const order = await orderModel.findOne({ orderid: razorpay_order_id });

//     console.log("🔎 Database order search:", {
//       searchedBy: razorpay_order_id,
//       found: !!order,
//       orderId: order?._id,
//       dbOrderid: order?.orderid,
//       walletDiscount: order?.walletDiscount,
//       coinsUsed: order?.coinsUsed
//     });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found"
//       });
//     }

//     const paymentInfo = await razorpayInstance.payments.fetch(razorpay_payment_id);
//     console.log("💰 Payment info:", {
//       status: paymentInfo.status,
//       amount: paymentInfo.amount,
//       currency: paymentInfo.currency,
//       method: paymentInfo.method
//     });

//     const successfulStatuses = ["captured", "authorized", "processed", "completed"];

//     if (!successfulStatuses.includes(paymentInfo.status)) {
//       console.warn(`⚠️ Payment status is ${paymentInfo.status}`);

//       if (paymentInfo.status === "failed") {
//         await orderModel.findByIdAndUpdate(order._id, {
//           paymentStatus: "failed",
//           paymentError: "Payment failed at Razorpay",
//           updatedAt: Date.now()
//         });

//         return res.status(400).json({
//           success: false,
//           message: "Payment failed at Razorpay"
//         });
//       }

//       return res.status(400).json({
//         success: false,
//         message: `Payment is ${paymentInfo.status}. Please wait or try again.`
//       });
//     }

//     let coinsForUser = 0;
//     let coinsForReferrer = 0;
//     let updateData = {
//       payment: true,
//       paymentId: razorpay_payment_id,
//       razorpayOrderId: razorpay_order_id,
//       paymentStatus: paymentInfo.status,
//       razorpayPaymentInfo: paymentInfo,
//       updatedAt: Date.now()
//     };

//     console.log("📦 Processing order :", order);
//     if (!order.payment) {
//       console.log("💳 First-time payment processing");

//       if (order.coinsUsed && order.coinsUsed > 0) {
//         console.log(`💳 Deducting ${order.coinsUsed} coins from user:`, order.userId);

//         await userModel.findByIdAndUpdate(order.userId, {
//           $inc: { walletCoins: -order.coinsUsed }
//         });

//         console.log(`✅ ${order.coinsUsed} coins deducted from user's wallet`);
//       }

//       if (order.markedReferralUsed) {
//         console.log("👤 Marking referral as used for user:", order.userId);

//         await userModel.updateOne(
//           { _id: order.userId, usedReferral: false },
//           { $set: { usedReferral: true } }
//         );
//       }



//       if (order.referredBy) {
//         console.log("💰 Processing referral coins for:", order.referredBy);

//         const referredUser = await userModel.findById(order.userId);

//         if (referredUser) {
//           const currentReferralCount = referredUser.referralOrderCount || 0;
//           const newReferralCount = currentReferralCount + 1;

//           const paidAmountInRupees = paymentInfo.amount / 100;

//           const referralConfig = await referrralModel.findOne();
//           const firstOrderPercent = referralConfig?.firstOrderCoinPercent || 100;
//           const subsequentPercent = referralConfig?.subsequentOrderCoinPercent || 1;

//           if (newReferralCount === 1) {
//             coinsForUser = Math.floor(paidAmountInRupees * (firstOrderPercent / 100));
//             coinsForReferrer = Math.floor(paidAmountInRupees * (firstOrderPercent / 100));
//             console.log(`🎉 First referral order! ${firstOrderPercent}% coins: ₹${coinsForUser} each`);
//           } else {
//             coinsForUser = Math.floor(paidAmountInRupees * (subsequentPercent / 100));
//             coinsForReferrer = Math.floor(paidAmountInRupees * (subsequentPercent / 100));
//             console.log(`📊 Subsequent order (${newReferralCount}): ${subsequentPercent}% coins: ₹${coinsForUser} each`);
//           }

//           await userModel.findByIdAndUpdate(order.userId, {
//             $inc: {
//               walletCoins: coinsForUser,
//               referralOrderCount: 1
//             }
//           });

//           await userModel.findByIdAndUpdate(order.referredBy, {
//             $inc: {
//               walletCoins: coinsForReferrer,
//               totalCommissionEarned: Math.floor(order.commissionEarned || 0),
//               totalReferral: 1
//             }
//           });

//           console.log(`✅ Referral coins added: User=${coinsForUser}, Referrer=${coinsForReferrer}`);

//           updateData.referralProcessed = true;
//           updateData.referralCoinsAdded = {
//             user: coinsForUser,
//             referrer: coinsForReferrer
//           };
//         }
//       }
//     } else {
//       console.log("⚠️ Payment already processed, skipping updates");
//       updateData.referralProcessed = order.referralProcessed || false;
//       updateData.referralCoinsAdded = order.referralCoinsAdded || {
//         user: 0,
//         referrer: 0
//       };
//     }

//     const updatedOrder = await orderModel.findByIdAndUpdate(
//       order._id,
//       updateData,
//       { new: true }
//     );

//     console.log("✅ Order updated successfully");

//     // Send payment confirmation email
//     await sendPaymentConfirmationOnlineEmail(updatedOrder);

//     // Send payment confirmation SMS
//     if (successfulStatuses.includes(paymentInfo.status)) {
//       const phoneNumber = order.address?.phone || req.user?.number;
//       if (phoneNumber) {
//         await orderQueue.add('sendPaymentConfirmationSMS', {
//           orderId: order._id.toString(),
//           phone: phoneNumber,
//           amount: paymentInfo.amount / 100,
//           method: paymentInfo.method || 'Online Payment'
//         });
//         console.log(`📱 Payment confirmation SMS queued for ${phoneNumber}`);
//       }
//     }

//     return res.json({
//       success: true,
//       message: `Payment ${paymentInfo.status} successfully`,
//       order: updatedOrder,
//       walletInfo: {
//         coinsUsed: order.coinsUsed || 0,
//         walletDiscount: order.walletDiscount || 0
//       },
//       directReferralApplied: order.referralDiscount > 0,
//       referralDiscount: order.referralDiscount || 0,
//       commissionEarned: order.commissionEarned || 0,
//       markedReferralUsed: order.markedReferralUsed || false,
//       referralProcessed: updateData.referralProcessed || false,
//       referralCoinsAdded: updateData.referralCoinsAdded || {
//         user: 0,
//         referrer: 0
//       }
//     });

//   } catch (error) {
//     console.error("❌ Razorpay verify error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message
//     });
//   }
// };


const verifyRazorpay = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    console.log("🔍 Verification started:", {
      razorpay_order_id,
      razorpay_payment_id
    });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay fields"
      });
    }

    // ✅ Generate and verify signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    console.log("🔐 Signature check:", {
      generated: generated_signature,
      received: razorpay_signature,
      match: generated_signature === razorpay_signature
    });

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    // ✅ Find order
    const order = await orderModel.findOne({ orderid: razorpay_order_id });

    console.log("🔎 Database order search:", {
      searchedBy: razorpay_order_id,
      found: !!order,
      orderId: order?._id,
      dbOrderid: order?.orderid
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // ✅ Fetch payment details from Razorpay
    const paymentInfo = await razorpayInstance.payments.fetch(razorpay_payment_id);
    console.log("💰 Payment info:", {
      status: paymentInfo.status,
      amount: paymentInfo.amount,
      currency: paymentInfo.currency,
      method: paymentInfo.method,
      id: paymentInfo.id
    });

    // ✅ Define successful statuses
    const successfulStatuses = ["captured", "authorized", "processed", "completed"];

    if (!successfulStatuses.includes(paymentInfo.status)) {
      console.warn(`⚠️ Payment status is ${paymentInfo.status}`);

      if (paymentInfo.status === "failed") {
        await orderModel.findByIdAndUpdate(order._id, {
          paymentStatus: "failed",
          paymentError: "Payment failed at Razorpay",
          updatedAt: Date.now()
        });

        return res.status(400).json({
          success: false,
          message: "Payment failed at Razorpay"
        });
      }

      return res.status(400).json({
        success: false,
        message: `Payment is ${paymentInfo.status}. Please wait or try again.`
      });
    }

    // ✅ Initialize update data with payment IDs
    let updateData = {
      payment: true,
      paymentId: razorpay_payment_id, // ✅ SAVE PAYMENT ID HERE
      razorpayOrderId: razorpay_order_id,
      paymentStatus: paymentInfo.status,
      razorpayPaymentInfo: paymentInfo,
      updatedAt: Date.now()
    };

    console.log("📦 Processing order update:", {
      orderId: order._id,
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id
    });

    // ✅ Check if this is first-time payment processing
    if (!order.payment) {
      console.log("💳 First-time payment processing");

      // ✅ Deduct wallet coins if used
      if (order.coinsUsed && order.coinsUsed > 0) {
        console.log(`💳 Deducting ${order.coinsUsed} coins from user:`, order.userId);

        await userModel.findByIdAndUpdate(order.userId, {
          $inc: { walletCoins: -order.coinsUsed }
        });

        console.log(`✅ ${order.coinsUsed} coins deducted from user's wallet`);
      }

      // ✅ Mark referral as used
      if (order.markedReferralUsed) {
        console.log("👤 Marking referral as used for user:", order.userId);

        await userModel.updateOne(
          { _id: order.userId, usedReferral: false },
          { $set: { usedReferral: true } }
        );
      }

      // ✅ Process referral coins
      let coinsForUser = 0;
      let coinsForReferrer = 0;

      if (order.referredBy) {
        console.log("💰 Processing referral coins for:", order.referredBy);

        const referredUser = await userModel.findById(order.userId);

        if (referredUser) {
          const currentReferralCount = referredUser.referralOrderCount || 0;
          const newReferralCount = currentReferralCount + 1;

          const paidAmountInRupees = paymentInfo.amount / 100;

          const referralConfig = await referrralModel.findOne();
          const firstOrderPercent = referralConfig?.firstOrderCoinPercent || 100;
          const subsequentPercent = referralConfig?.subsequentOrderCoinPercent || 1;

          if (newReferralCount === 1) {
            coinsForUser = Math.floor(paidAmountInRupees * (firstOrderPercent / 100));
            coinsForReferrer = Math.floor(paidAmountInRupees * (firstOrderPercent / 100));
            console.log(`🎉 First referral order! ${firstOrderPercent}% coins: ₹${coinsForUser} each`);
          } else {
            coinsForUser = Math.floor(paidAmountInRupees * (subsequentPercent / 100));
            coinsForReferrer = Math.floor(paidAmountInRupees * (subsequentPercent / 100));
            console.log(`📊 Subsequent order (${newReferralCount}): ${subsequentPercent}% coins: ₹${coinsForUser} each`);
          }

          // ✅ Update user's coins
          await userModel.findByIdAndUpdate(order.userId, {
            $inc: {
              walletCoins: coinsForUser,
              referralOrderCount: 1
            }
          });

          // ✅ Update referrer's coins
          await userModel.findByIdAndUpdate(order.referredBy, {
            $inc: {
              walletCoins: coinsForReferrer,
              totalCommissionEarned: Math.floor(order.commissionEarned || 0),
              totalReferral: 1
            }
          });

          console.log(`✅ Referral coins added: User=${coinsForUser}, Referrer=${coinsForReferrer}`);

          updateData.referralProcessed = true;
          updateData.referralCoinsAdded = {
            user: coinsForUser,
            referrer: coinsForReferrer
          };
        }
      }
    } else {
      console.log("⚠️ Payment already processed, skipping updates");
      updateData.referralProcessed = order.referralProcessed || false;
      updateData.referralCoinsAdded = order.referralCoinsAdded || {
        user: 0,
        referrer: 0
      };
    }

    // ✅ Save the updated order
    const updatedOrder = await orderModel.findByIdAndUpdate(
      order._id,
      updateData,
      { new: true }
    );

    console.log("✅ Order updated successfully with payment ID:", razorpay_payment_id);

    // ✅ Send confirmation email
    await sendPaymentConfirmationOnlineEmail(updatedOrder);

    // ✅ Send confirmation SMS
    if (successfulStatuses.includes(paymentInfo.status)) {
      const phoneNumber = order.address?.phone || req.user?.number;
      if (phoneNumber) {
        await orderQueue.add('sendPaymentConfirmationSMS', {
          orderId: order._id.toString(),
          phone: phoneNumber,
          amount: paymentInfo.amount / 100,
          method: paymentInfo.method || 'Online Payment',
          paymentId: razorpay_payment_id // ✅ Include payment ID
        });
        console.log(`📱 Payment confirmation SMS queued for ${phoneNumber}`);
      }
    }

    // ✅ Return success response
    return res.json({
      success: true,
      message: `Payment ${paymentInfo.status} successfully`,
      order: updatedOrder,
      paymentDetails: {
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        status: paymentInfo.status,
        method: paymentInfo.method
      },
      walletInfo: {
        coinsUsed: order.coinsUsed || 0,
        walletDiscount: order.walletDiscount || 0
      },
      directReferralApplied: order.referralDiscount > 0,
      referralDiscount: order.referralDiscount || 0,
      commissionEarned: order.commissionEarned || 0,
      markedReferralUsed: order.markedReferralUsed || false,
      referralProcessed: updateData.referralProcessed || false,
      referralCoinsAdded: updateData.referralCoinsAdded || {
        user: 0,
        referrer: 0
      }
    });

  } catch (error) {
    console.error("❌ Razorpay verify error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};


const updateOrderStatusCOD = async (req, res) => {
  try {
    const { orderid, status } = req.body;
    const order = await orderModel.findOne({ orderid });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const updateData = {
      status,
      updatedAt: Date.now()
    };

    if (status === "delivered") {
      if (order.paymentMethod === "COD" && !order.payment) {
        updateData.payment = true;
        updateData.paymentStatus = "completed";
        updateData.paymentDate = new Date();

        console.log(`✅ COD order ${orderid} marked as paid upon delivery`);

        if (!order.referralProcessed && order.payment === false) {
          console.log("💰 Processing referral rewards for COD order");

          if (order.markedReferralUsed) {
            console.log("👤 Marking referral as used for user:", order.userId);

            await userModel.updateOne(
              { _id: order.userId, usedReferral: false },
              { $set: { usedReferral: true } }
            );
          }

          if (order.referredBy) {
            console.log("💰 Processing referral coins for COD order:", order.referredBy);

            const referredUser = await userModel.findById(order.userId);

            if (referredUser) {
              const currentReferralCount = referredUser.referralOrderCount || 0;
              const newReferralCount = currentReferralCount + 1;

              const paidAmount = order.amount - (order.discount || 0) - (order.walletDiscount || 0);

              const referralConfig = await referrralModel.findOne();
              const firstOrderPercent = referralConfig?.firstOrderCoinPercent || 100;
              const subsequentPercent = referralConfig?.subsequentOrderCoinPercent || 1;

              let coinsForUser = 0;
              let coinsForReferrer = 0;

              if (newReferralCount === 1) {
                coinsForUser = Math.floor(paidAmount * (firstOrderPercent / 100));
                coinsForReferrer = Math.floor(paidAmount * (firstOrderPercent / 100));
                console.log(`🎉 First referral COD order! ${firstOrderPercent}% coins: ₹${coinsForUser} each`);
              } else {
                coinsForUser = Math.floor(paidAmount * (subsequentPercent / 100));
                coinsForReferrer = Math.floor(paidAmount * (subsequentPercent / 100));
                console.log(`📊 Subsequent COD order (${newReferralCount}): ${subsequentPercent}% coins: ₹${coinsForUser} each`);
              }

              await userModel.findByIdAndUpdate(order.userId, {
                $inc: {
                  walletCoins: coinsForUser,
                  referralOrderCount: 1
                }
              });

              await userModel.findByIdAndUpdate(order.referredBy, {
                $inc: {
                  walletCoins: coinsForReferrer,
                  totalCommissionEarned: Math.floor(order.commissionEarned || 0),
                  totalReferral: 1
                }
              });

              console.log(`✅ Referral coins added for COD: User=${coinsForUser}, Referrer=${coinsForReferrer}`);

              updateData.referralProcessed = true;
              updateData.referralCoinsAdded = {
                user: coinsForUser,
                referrer: coinsForReferrer
              };
            }
          }
        }
      }
    }

    const updatedOrder = await orderModel.findOneAndUpdate(
      { orderid },
      updateData,
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Send status update email
    await sendStatusUpdateEmail(updatedOrder);

    // Send status update SMS
    const phoneNumber = order.address?.phone || '';
    if (phoneNumber) {
      await orderQueue.add('sendStatusUpdateSMS', {
        orderId: orderid,
        phone: phoneNumber,
        status: status
      });
      console.log(`📱 Status update SMS queued for ${phoneNumber}`);

      // Send special SMS for cancelled or completed status
      if (status === "cancelled") {
        await orderQueue.add('sendOrderCancelledSMS', {
          orderId: orderid,
          phone: phoneNumber,
          amount: order.amount
        });
      } else if (status === "completed") {
        await orderQueue.add('sendOrderCompletedSMS', {
          orderId: orderid,
          phone: phoneNumber,
          amount: order.amount
        });
      }
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
      paymentUpdated: (order.paymentMethod === "COD" && !order.payment && status === "delivered"),
      referralProcessed: updateData.referralProcessed || false
    });

  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update the updateStatus function to handle SMS
const updateStatus = async (req, res) => {
  try {
    const { orderid, status } = req.body;
    const order = await orderModel.findOne({ orderid });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const updated = await orderModel.findOneAndUpdate(
      { orderid },
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Order not found" });

    // Send status update email
    await sendStatusUpdateEmail(updated);

    // Send status update SMS
    const phoneNumber = order.address?.phone || '';
    if (phoneNumber) {
      await orderQueue.add('sendStatusUpdateSMS', {
        orderId: orderid,
        phone: phoneNumber,
        status: status
      });

      // Send special SMS for cancelled or completed status
      if (status === "cancelled") {
        await orderQueue.add('sendOrderCancelledSMS', {
          orderId: orderid,
          phone: phoneNumber,
          amount: order.amount
        });
      } else if (status === "completed") {
        await orderQueue.add('sendOrderCompletedSMS', {
          orderId: orderid,
          phone: phoneNumber,
          amount: order.amount
        });
      }
    }

    res.json({ success: true, message: "Order updated", order: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Keep other functions as they are
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// const userSingleOrder = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const order = await orderModel.findOne({ orderid: id }).lean();

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     res.json({ success: true, order });
//   } catch (error) {
//     console.error("❌ Internal Error:", error);
//     res.status(500).json({ success: false, message: "Server Error. Please try again." });
//   }
// };
 const userSingleOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const order = await orderModel.findOne({ 
      orderid: id,
      userId: userId 
    }).lean();

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found or unauthorized" 
      });
    }

    res.json({ 
      success: true, 
      order: order 
    });
  } catch (error) {
    console.error("❌ Internal Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error. Please try again." 
    });
  }
};

const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  placeOrderCOD,
  updateOrderStatusCOD,
  placeOrderRazorpay,
  verifyRazorpay,
  allOrders,
  userOrders,
  updateStatus,
  userSingleOrder,
};
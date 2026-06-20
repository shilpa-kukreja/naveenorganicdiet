// // import { Worker } from 'bullmq';
// // import IORedis from 'ioredis';
// // import orderModel from '../models/orderModel.js';

// // // Create Redis connection for worker
// // const connection = new IORedis({
// //   host: process.env.REDIS_HOST || '127.0.0.1',  // Use localhost for local dev
// //   port: parseInt(process.env.REDIS_PORT) || 6379,
// //   maxRetriesPerRequest: null,
// //   enableReadyCheck: false,
// // });

// // // Create worker instance
// // const worker = new Worker('orderQueue', async (job) => {
// //   const { name, data } = job;

// //   console.log(`📦 Processing order job: ${name} - ${job.id}`);

// //   switch (name) {
// //   case 'processCODOrder':
// //   const { 
// //     orderId, userId, items, amount, address, couponCode, 
// //     discount, referralDiscount, commissionEarned, referredBy,
// //     referralConfigUsed, shouldMarkReferralUsed, userPhone 
// //   } = data;

// //   try {
// //     // Save order to database
// //     const orderData = {
// //       orderid: orderId,
// //       userId,
// //       items,
// //       amount,
// //       address,
// //       paymentMethod: "COD",
// //       payment: false,
// //       couponCode,
// //       discount,
// //       referralDiscount,
// //       totalDiscount: discount,
// //       commissionEarned,
// //       referredBy,
// //       referralConfigUsed,
// //       status: 'processing',
// //       createdAt: new Date(),
// //       updatedAt: new Date(),
// //     };

// //     const newOrder = new orderModel(orderData);
// //     await newOrder.save();

// //     console.log(`✅ Order ${orderId} saved to database`);

// //     // ✅ Process referral if applicable
// //     if (shouldMarkReferralUsed && referredBy) {
// //       // 1. Mark user's referral as used
// //       const user = await userModel.findOne({ number: userPhone });
// //       if (user && !user.usedReferral) {
// //         user.usedReferral = true;
// //         await user.save();
// //         console.log(`✅ Referral marked as used for ${userPhone}`);
// //       }

// //       // 2. Update referrer's commission
// //       if (commissionEarned > 0) {
// //         await userModel.findByIdAndUpdate(
// //           referredBy,
// //           {
// //             $inc: {
// //               totalCommissionEarned: Math.floor(commissionEarned),
// //               totalReferral: 1
// //             }
// //           }
// //         );
// //         console.log(`✅ Commission ₹${commissionEarned} added to referrer ${referredBy}`);
// //       }
// //     }

// //     // Queue email notification
// //     await emailQueue.add('sendCODConfirmation', {
// //       to: address.email,
// //       order: newOrder.toObject(),
// //       template: 'cod_confirmation',
// //     });

// //     return { orderId, success: true, order: newOrder.toObject() };
// //   } catch (error) {
// //     console.error(`❌ Failed to save order ${orderId}:`, error);
// //     throw error;
// //   }
// //   break;

// //     case 'postRazorpayOrderTasks':
// //       console.log(`✅ Razorpay order ${data.orderId} post-processing`);
// //       // Add any post-processing logic here
// //       return { orderId: data.orderId, processed: true };

// //     case 'updateOrderStatus':
// //       const { orderid, status } = data;
// //       const updated = await orderModel.findOneAndUpdate(
// //         { orderid },
// //         { status, updatedAt: new Date() },
// //         { new: true }
// //       );
// //       console.log(`✅ Order ${orderid} status updated to ${status}`);
// //       return { orderid, status, updated };

// //     default:
// //       console.log(`⚠️ Unknown job type: ${name}`);
// //       return { error: 'Unknown job type' };
// //   }
// // }, {
// //   connection,  // Use the IORedis connection
// //   concurrency: 10,
// // });

// // // Event listeners
// // worker.on('completed', (job) => {
// //   console.log(`✅ Order job ${job.id} completed`);
// // });

// // worker.on('failed', (job, error) => {
// //   console.error(`❌ Order job ${job.id} failed:`, error.message);
// // });

// // console.log('📦 Order worker started and listening for jobs...');

// // // Handle graceful shutdown
// // process.on('SIGTERM', async () => {
// //   console.log('SIGTERM received, closing order worker...');
// //   await worker.close();
// //   await connection.quit();
// //   process.exit(0);
// // });

// // export { worker };




// import { Worker } from 'bullmq';
// import IORedis from 'ioredis';
// import mongoose from 'mongoose';
// import orderModel from '../models/orderModel.js';
// import userModel from '../models/userModel.js';
// import { Queue } from 'bullmq'; // Add this for email queue

// // Initialize email queue (make sure this matches your email worker setup)
// const emailQueue = new Queue('emailQueue', {
//   connection: new IORedis({
//     host: process.env.REDIS_HOST || '127.0.0.1',
//     port: parseInt(process.env.REDIS_PORT) || 6379,
//     maxRetriesPerRequest: null,
//     enableReadyCheck: false,
//   }),
// });

// // MongoDB Connection with retry logic
// let isConnected = false;

// const connectDB = async () => {
//   if (isConnected) {
//     return;
//   }

//   try {
//     console.log('🔗 Connecting to MongoDB Atlas...');

//     const mongoUri = process.env.MONGO_URI || 'mongodb+srv://recreatersservices:recreaters123@cluster0.d4tasry.mongodb.net/organicdiet';

//     await mongoose.connect(mongoUri, {
//       serverSelectionTimeoutMS: 30000, // 30 seconds
//       socketTimeoutMS: 45000, // 45 seconds
//       maxPoolSize: 10, // Limit connections
//       minPoolSize: 5,
//       retryWrites: true,
//       w: 'majority',
//     });

//     mongoose.connection.on('error', (err) => {
//       console.error('❌ Mongoose connection error:', err);
//       isConnected = false;
//     });

//     mongoose.connection.on('disconnected', () => {
//       console.warn('⚠️ Mongoose disconnected');
//       isConnected = false;
//     });

//     mongoose.connection.on('reconnected', () => {
//       console.log('✅ Mongoose reconnected');
//       isConnected = true;
//     });

//     isConnected = true;
//     console.log('✅ MongoDB Atlas connected successfully');

//   } catch (error) {
//     console.error('❌ MongoDB connection failed:', error.message);

//     // Check for specific Atlas errors
//     if (error.name === 'MongoServerSelectionError') {
//       console.error('💡 Troubleshooting tips:');
//       console.error('1. Check if your IP is whitelisted in MongoDB Atlas');
//       console.error('2. Verify network connectivity to Atlas');
//       console.error('3. Check if the database user has correct permissions');
//     }

//     throw error;
//   }
// };

// // Create Redis connection for worker
// const redisConnection = new IORedis({
//   host: process.env.REDIS_HOST || '127.0.0.1',
//   port: parseInt(process.env.REDIS_PORT) || 6379,
//   maxRetriesPerRequest: null,
//   enableReadyCheck: false,
//   retryStrategy: (times) => {
//     const delay = Math.min(times * 50, 2000);
//     return delay;
//   }
// });

// // Create order queue instance for getting counts
// const orderQueue = new Queue('orderQueue', {
//   connection: redisConnection,
// });

// // Create worker instance with improved error handling
// const worker = new Worker('orderQueue', async (job) => {
//   const { name, data } = job;

//   console.log(`📦 Processing order job: ${name} - ${job.id}`);

//   // Ensure DB connection with retry
//   let retryCount = 0;
//   const maxRetries = 3;

//   while (retryCount < maxRetries) {
//     try {
//       await connectDB();
//       break; // Connection successful, exit retry loop
//     } catch (error) {
//       retryCount++;
//       console.warn(`⚠️ DB connection attempt ${retryCount} failed: ${error.message}`);

//       if (retryCount === maxRetries) {
//         console.error('❌ Max DB connection retries reached');
//         throw new Error(`Failed to connect to DB after ${maxRetries} attempts: ${error.message}`);
//       }

//       // Wait before retrying
//       await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
//     }
//   }

//   switch (name) {
//     case 'processCODOrder':
//       const {
//         orderId, userId, items, amount, address, couponCode,
//         discount, referralDiscount, walletDiscount, coinsUsed, // Add these
//         commissionEarned, referredBy,
//         referralConfigUsed, shouldMarkReferralUsed, userPhone
//       } = data;

//       try {
//         // Create order with session for transaction-like behavior
//         const session = await mongoose.startSession();

//         try {
//           session.startTransaction();

//           // ✅ NEW: Deduct wallet coins if used
//           if (coinsUsed > 0) {
//             const coinDeduction = await userModel.updateOne(
//               { _id: userId },
//               { $inc: { walletCoins: -coinsUsed } },
//               { session }
//             );

//             if (coinDeduction.modifiedCount > 0) {
//               console.log(`✅ Deducted ${coinsUsed} coins from user ${userId}`);
//             }
//           }

//           // Save order with wallet discount info
//           const orderData = {
//             orderid: orderId,
//             userId,
//             items,
//             amount,
//             address,
//             paymentMethod: "COD",
//             payment: false,
//             couponCode,
//             discount,
//             walletDiscount: walletDiscount || 0, // Add wallet discount
//             coinsUsed: coinsUsed || 0, // Add coins used
//             referralDiscount,
//             totalDiscount: discount + (walletDiscount || 0), // Total discount
//             commissionEarned,
//             referredBy,
//             referralConfigUsed,
//             status: 'processing',
//             createdAt: new Date(),
//             updatedAt: new Date(),
//           };

//           const newOrder = new orderModel(orderData);
//           await newOrder.save({ session });

//           console.log(`✅ Order ${orderId} saved to database`);

//           // ✅ Process referral if applicable
//           if (shouldMarkReferralUsed && referredBy && userPhone) {
//             // 1. Mark user's referral as used - Update only the specific field
//             const updateResult = await userModel.updateOne(
//               { number: userPhone },
//               { $set: { usedReferral: true } },
//               { session }
//             );

//             if (updateResult.modifiedCount > 0) {
//               console.log(`✅ Referral marked as used for ${userPhone}`);
//             }

//             // 2. Update referrer's commission
//             if (commissionEarned > 0) {
//               const commissionUpdate = await userModel.updateOne(
//                 { _id: referredBy },
//                 {
//                   $inc: {
//                     totalCommissionEarned: Math.floor(commissionEarned),
//                     totalReferral: 1
//                   }
//                 },
//                 { session }
//               );

//               if (commissionUpdate.modifiedCount > 0) {
//                 console.log(`✅ Commission ₹${commissionEarned} added to referrer ${referredBy}`);
//               }
//             }
//           }

//           // Commit transaction
//           await session.commitTransaction();
//           console.log(`✅ Transaction committed for order ${orderId}`);

//           // Queue email notification (outside transaction)
//           try {
//             await emailQueue.add('sendCODConfirmation', {
//               to: address.email,
//               order: newOrder.toObject(),
//               template: 'cod_confirmation',
//             }, {
//               attempts: 3,
//               backoff: {
//                 type: 'exponential',
//                 delay: 2000,
//               }
//             });
//             console.log(`✅ Email queued for order ${orderId}`);
//           } catch (emailError) {
//             console.warn(`⚠️ Failed to queue email for ${orderId}:`, emailError.message);
//             // Don't throw - email failure shouldn't fail the order
//           }

//           return { orderId, success: true, order: newOrder.toObject() };

//         } catch (transactionError) {
//           await session.abortTransaction();
//           console.error(`❌ Transaction aborted for order ${orderId}:`, transactionError);
//           throw transactionError;
//         } finally {
//           await session.endSession();
//         }

//       } catch (error) {
//         console.error(`❌ Failed to process order ${orderId}:`, error.message);

//         // Determine if we should retry
//         const shouldRetry = error.name.includes('Mongo') ||
//           error.name.includes('Network') ||
//           error.message.includes('timeout');

//         if (shouldRetry) {
//           console.log(`🔄 Will retry order ${orderId} due to ${error.name}`);
//           throw error; // This will trigger BullMQ retry
//         }

//         return {
//           orderId,
//           success: false,
//           error: error.message,
//           shouldRetry: false
//         };
//       }

//     case 'updateOrderStatus':
//       const { orderid, status } = data;
//       try {
//         const updated = await orderModel.findOneAndUpdate(
//           { orderid },
//           { status, updatedAt: new Date() },
//           { new: true }
//         );

//         if (!updated) {
//           console.warn(`⚠️ Order ${orderid} not found for status update`);
//           return { orderid, status, updated: null, error: 'Order not found' };
//         }

//         console.log(`✅ Order ${orderid} status updated to ${status}`);
//         return { orderid, status, updated: updated.toObject() };
//       } catch (error) {
//         console.error(`❌ Failed to update order ${orderid}:`, error.message);
//         throw error;
//       }
//       case 'sendOrderConfirmationSMS':
//     const { orderId, phone, orderData } = data;
//     try {
//       const result = await SMSService.sendOrderConfirmationSMS(phone, orderData);
      
//       // Update order to mark SMS sent
//       await orderModel.findOneAndUpdate(
//         { orderid: orderId },
//         { 'smsSent.confirmation': true }
//       );
      
//       return { orderId, phone, success: result.success };
//     } catch (error) {
//       console.error(`❌ Failed to send order confirmation SMS for ${orderId}:`, error.message);
//       return { orderId, success: false, error: error.message };
//     }

//   case 'sendPaymentConfirmationSMS':
//     const { orderId: paymentOrderId, phone: paymentPhone, amount, method } = data;
//     try {
//       const result = await SMSService.sendPaymentConfirmationSMS(paymentPhone, paymentOrderId, amount, method);
//       return { orderId: paymentOrderId, success: result.success };
//     } catch (error) {
//       console.error(`❌ Failed to send payment SMS for ${paymentOrderId}:`, error.message);
//       return { orderId: paymentOrderId, success: false, error: error.message };
//     }

//   case 'sendStatusUpdateSMS':
//     const { orderId: statusOrderId, phone: statusPhone, status: orderStatus } = data;
//     try {
//       const result = await SMSService.sendStatusUpdateSMS(statusPhone, statusOrderId, orderStatus);
      
//       // Update order to mark status SMS sent
//       await orderModel.findOneAndUpdate(
//         { orderid: statusOrderId },
//         { 'smsSent.statusUpdate': true }
//       );
      
//       return { orderId: statusOrderId, status: orderStatus, success: result.success };
//     } catch (error) {
//       console.error(`❌ Failed to send status SMS for ${statusOrderId}:`, error.message);
//       return { orderId: statusOrderId, success: false, error: error.message };
//     }

//     case 'sendWelcomeSMS':
//   const { phone, username } = data;
//   try {
//     const result = await SMSService.sendWelcomeSMS(phone, username);
//     return { phone, success: result.success };
//   } catch (error) {
//     console.error(`❌ Failed to send welcome SMS to ${phone}:`, error.message);
//     return { phone, success: false, error: error.message };
//   }

//     default:
//       console.log(`⚠️ Unknown job type: ${name}`);
//       return { error: 'Unknown job type', jobId: job.id };
//   }
// }, {
//   connection: redisConnection,
//   concurrency: 3, // Reduced for Atlas free tier limits
//   attempts: 3,
//   backoff: {
//     type: 'exponential',
//     delay: 5000,
//   },
//   removeOnComplete: {
//     age: 24 * 3600, // Keep completed jobs for 24 hours
//     count: 1000,
//   },
//   removeOnFail: {
//     age: 72 * 3600, // Keep failed jobs for 72 hours
//     count: 1000,
//   },
// });

// // Event listeners with better logging
// worker.on('completed', (job) => {
//   console.log(`✅ Order job ${job.id} completed successfully`);
// });

// worker.on('failed', (job, error) => {
//   console.error(`❌ Order job ${job.id} failed:`, error.message);

//   // Log additional info for debugging
//   if (job) {
//     console.error(`Job name: ${job.name}`);
//     console.error(`Job attempts: ${job.attemptsMade}`);
//     if (job.data && job.data.orderId) {
//       console.error(`Order ID in failed job: ${job.data.orderId}`);
//     }
//   }
// });

// worker.on('error', (error) => {
//   console.error('🔥 Worker error:', error);
// });

// worker.on('stalled', (jobId) => {
//   console.warn(`⚠️ Job ${jobId} stalled`);
// });

// worker.on('active', (job) => {
//   console.log(`🔄 Job ${job.id} is now active`);
// });

// // Test connections on startup
// async function initializeWorker() {
//   console.log('🚀 Initializing Order Worker...');

//   try {
//     // Test Redis connection
//     await redisConnection.ping();
//     console.log('✅ Redis connection established');

//     // Test MongoDB connection
//     await connectDB();

//     // Get queue info using the orderQueue instance
//     const counts = await orderQueue.getJobCounts();
//     console.log('📊 Queue status:', {
//       waiting: counts.waiting,
//       active: counts.active,
//       completed: counts.completed,
//       failed: counts.failed,
//       delayed: counts.delayed,
//     });

//     // If there are failed jobs, log them
//     if (counts.failed > 0) {
//       console.log(`⚠️ Found ${counts.failed} failed jobs in queue`);

//       // Optional: Get and log failed jobs for debugging
//       const failedJobs = await orderQueue.getJobs(['failed'], 0, 5);
//       failedJobs.forEach((job, index) => {
//         console.log(`Failed job ${index + 1}: ${job.name} - ${job.id}`);
//         if (job.failedReason) {
//           console.log(`  Reason: ${job.failedReason}`);
//         }
//       });
//     }

//     console.log('📦 Order worker started and listening for jobs...');
//     console.log('⏳ Worker ready to process jobs...');

//   } catch (error) {
//     console.error('❌ Worker initialization failed:', error.message);

//     // More specific error messages
//     if (error.message.includes('getJobCounts')) {
//       console.error('💡 Queue initialization issue - check Redis connection');
//     } else if (error.message.includes('connect')) {
//       console.error('💡 Connection issue - check network and credentials');
//     }

//     // Don't exit immediately, let the worker try to recover
//     console.log('🔄 Worker will continue with limited functionality...');
//   }
// }

// // Initialize on startup
// initializeWorker();

// // Handle graceful shutdown
// const shutdown = async () => {
//   console.log('🛑 Shutting down order worker gracefully...');

//   try {
//     await worker.close();
//     console.log('✅ Worker closed');

//     await redisConnection.quit();
//     console.log('✅ Redis connection closed');

//     if (mongoose.connection.readyState === 1) {
//       await mongoose.connection.close();
//       console.log('✅ MongoDB connection closed');
//     }

//     await orderQueue.close();
//     console.log('✅ Order queue closed');

//     await emailQueue.close();
//     console.log('✅ Email queue closed');

//     console.log('👋 Worker shutdown complete');
//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Error during shutdown:', error);
//     process.exit(1);
//   }
// };

// process.on('SIGTERM', shutdown);
// process.on('SIGINT', shutdown);

// // Global error handlers
// process.on('uncaughtException', (error) => {
//   console.error('💥 Uncaught Exception:', error);
//   console.error('Stack:', error.stack);
//   // Don't exit - let the worker try to recover
// });

// process.on('unhandledRejection', (error) => {
//   console.error('💥 Unhandled Rejection:', error);
//   if (error instanceof Error) {
//     console.error('Stack:', error.stack);
//   }
// });

// // Export if needed for other modules
// export { worker, orderQueue };


// import { Worker } from 'bullmq';
// import IORedis from 'ioredis';
// import mongoose from 'mongoose';
// import orderModel from '../models/orderModel.js';
// import userModel from '../models/authModel.js'; // FIXED: Changed from '../models/userModel.js'
// import { Queue } from 'bullmq';

// // Add SMS Service import
// import SMSService from '../utils/smsService.js'; // ADD THIS LINE

// // Initialize email queue
// const emailQueue = new Queue('emailQueue', {
//   connection: new IORedis({
//     host: process.env.REDIS_HOST || '127.0.0.1',
//     port: parseInt(process.env.REDIS_PORT) || 6379,
//     maxRetriesPerRequest: null,
//     enableReadyCheck: false,
//   }),
// });

// // MongoDB Connection with retry logic
// let isConnected = false;

// const connectDB = async () => {
//   if (isConnected) {
//     return;
//   }

//   try {
//     console.log('🔗 Connecting to MongoDB Atlas...');

//     const mongoUri = process.env.MONGO_URI || 'mongodb+srv://recreatersservices:recreaters123@cluster0.d4tasry.mongodb.net/organicdiet';

//     await mongoose.connect(mongoUri, {
//       serverSelectionTimeoutMS: 30000,
//       socketTimeoutMS: 45000,
//       maxPoolSize: 10,
//       minPoolSize: 5,
//       retryWrites: true,
//       w: 'majority',
//     });

//     mongoose.connection.on('error', (err) => {
//       console.error('❌ Mongoose connection error:', err);
//       isConnected = false;
//     });

//     mongoose.connection.on('disconnected', () => {
//       console.warn('⚠️ Mongoose disconnected');
//       isConnected = false;
//     });

//     mongoose.connection.on('reconnected', () => {
//       console.log('✅ Mongoose reconnected');
//       isConnected = true;
//     });

//     isConnected = true;
//     console.log('✅ MongoDB Atlas connected successfully');

//   } catch (error) {
//     console.error('❌ MongoDB connection failed:', error.message);
//     throw error;
//   }
// };

// // Create Redis connection for worker
// const redisConnection = new IORedis({
//   host: process.env.REDIS_HOST || '127.0.0.1',
//   port: parseInt(process.env.REDIS_PORT) || 6379,
//   maxRetriesPerRequest: null,
//   enableReadyCheck: false,
//   retryStrategy: (times) => {
//     const delay = Math.min(times * 50, 2000);
//     return delay;
//   }
// });

// // Create order queue instance for getting counts
// const orderQueue = new Queue('orderQueue', {
//   connection: redisConnection,
// });

// // Create worker instance with improved error handling
// const worker = new Worker('orderQueue', async (job) => {
//   const { name, data } = job;

//   console.log(`📦 Processing order job: ${name} - ${job.id}`);

//   // Ensure DB connection with retry
//   let retryCount = 0;
//   const maxRetries = 3;

//   while (retryCount < maxRetries) {
//     try {
//       await connectDB();
//       break;
//     } catch (error) {
//       retryCount++;
//       console.warn(`⚠️ DB connection attempt ${retryCount} failed: ${error.message}`);

//       if (retryCount === maxRetries) {
//         console.error('❌ Max DB connection retries reached');
//         throw new Error(`Failed to connect to DB after ${maxRetries} attempts: ${error.message}`);
//       }

//       await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
//     }
//   }

//   switch (name) {
//     case 'processCODOrder':
//       const {
//         orderId, userId, items, amount, address, couponCode,
//         discount, referralDiscount, walletDiscount, coinsUsed,
//         commissionEarned, referredBy,
//         referralConfigUsed, shouldMarkReferralUsed, userPhone
//       } = data;

//       try {
//         const session = await mongoose.startSession();

//         try {
//           session.startTransaction();

//           // ✅ Deduct wallet coins if used
//           if (coinsUsed > 0) {
//             const coinDeduction = await userModel.updateOne(
//               { _id: userId },
//               { $inc: { walletCoins: -coinsUsed } },
//               { session }
//             );

//             if (coinDeduction.modifiedCount > 0) {
//               console.log(`✅ Deducted ${coinsUsed} coins from user ${userId}`);
//             }
//           }

//           // Save order with wallet discount info
//           const orderData = {
//             orderid: orderId,
//             userId,
//             items,
//             amount,
//             address,
//             paymentMethod: "COD",
//             payment: false,
//             couponCode,
//             discount,
//             walletDiscount: walletDiscount || 0,
//             coinsUsed: coinsUsed || 0,
//             referralDiscount,
//             totalDiscount: discount + (walletDiscount || 0),
//             commissionEarned,
//             referredBy,
//             referralConfigUsed,
//             status: 'processing',
//             createdAt: new Date(),
//             updatedAt: new Date(),
//           };

//           const newOrder = new orderModel(orderData);
//           await newOrder.save({ session });

//           console.log(`✅ Order ${orderId} saved to database`);

//           // ✅ Process referral if applicable
//           if (shouldMarkReferralUsed && referredBy && userPhone) {
//             // 1. Mark user's referral as used
//             const updateResult = await userModel.updateOne(
//               { number: userPhone },
//               { $set: { usedReferral: true } },
//               { session }
//             );

//             if (updateResult.modifiedCount > 0) {
//               console.log(`✅ Referral marked as used for ${userPhone}`);
//             }

//             // 2. Update referrer's commission
//             if (commissionEarned > 0) {
//               const commissionUpdate = await userModel.updateOne(
//                 { _id: referredBy },
//                 {
//                   $inc: {
//                     totalCommissionEarned: Math.floor(commissionEarned),
//                     totalReferral: 1
//                   }
//                 },
//                 { session }
//               );

//               if (commissionUpdate.modifiedCount > 0) {
//                 console.log(`✅ Commission ₹${commissionEarned} added to referrer ${referredBy}`);
//               }
//             }
//           }

//           // Commit transaction
//           await session.commitTransaction();
//           console.log(`✅ Transaction committed for order ${orderId}`);

//           // Queue email notification
//           try {
//             await emailQueue.add('sendCODConfirmation', {
//               to: address.email,
//               order: newOrder.toObject(),
//               template: 'cod_confirmation',
//             }, {
//               attempts: 3,
//               backoff: {
//                 type: 'exponential',
//                 delay: 2000,
//               }
//             });
//             console.log(`✅ Email queued for order ${orderId}`);
//           } catch (emailError) {
//             console.warn(`⚠️ Failed to queue email for ${orderId}:`, emailError.message);
//           }

//           return { orderId, success: true, order: newOrder.toObject() };

//         } catch (transactionError) {
//           await session.abortTransaction();
//           console.error(`❌ Transaction aborted for order ${orderId}:`, transactionError);
//           throw transactionError;
//         } finally {
//           await session.endSession();
//         }

//       } catch (error) {
//         console.error(`❌ Failed to process order ${orderId}:`, error.message);

//         const shouldRetry = error.name.includes('Mongo') ||
//           error.name.includes('Network') ||
//           error.message.includes('timeout');

//         if (shouldRetry) {
//           console.log(`🔄 Will retry order ${orderId} due to ${error.name}`);
//           throw error;
//         }

//         return {
//           orderId,
//           success: false,
//           error: error.message,
//           shouldRetry: false
//         };
//       }

//     case 'updateOrderStatus':
//       const { orderid, status } = data;
//       try {
//         const updated = await orderModel.findOneAndUpdate(
//           { orderid },
//           { status, updatedAt: new Date() },
//           { new: true }
//         );

//         if (!updated) {
//           console.warn(`⚠️ Order ${orderid} not found for status update`);
//           return { orderid, status, updated: null, error: 'Order not found' };
//         }

//         console.log(`✅ Order ${orderid} status updated to ${status}`);
//         return { orderid, status, updated: updated.toObject() };
//       } catch (error) {
//         console.error(`❌ Failed to update order ${orderid}:`, error.message);
//         throw error;
//       }

//     case 'sendOrderConfirmationSMS':
//       const { orderId: smsOrderId, phone: smsPhone, orderData: smsOrderData } = data;
//       try {
//         const result = await SMSService.sendOrderConfirmationSMS(smsPhone, smsOrderData);
        
//         // Update order to mark SMS sent
//         await orderModel.findOneAndUpdate(
//           { orderid: smsOrderId },
//           { 'smsSent.confirmation': true }
//         );
        
//         return { orderId: smsOrderId, phone: smsPhone, success: result.success };
//       } catch (error) {
//         console.error(`❌ Failed to send order confirmation SMS for ${smsOrderId}:`, error.message);
//         return { orderId: smsOrderId, success: false, error: error.message };
//       }

//     case 'sendPaymentConfirmationSMS':
//       const { orderId: paymentOrderId, phone: paymentPhone, amount: paymentAmount, method } = data;
//       try {
//         const result = await SMSService.sendPaymentConfirmationSMS(paymentPhone, paymentOrderId, paymentAmount, method);
//         return { orderId: paymentOrderId, success: result.success };
//       } catch (error) {
//         console.error(`❌ Failed to send payment SMS for ${paymentOrderId}:`, error.message);
//         return { orderId: paymentOrderId, success: false, error: error.message };
//       }

//     case 'sendStatusUpdateSMS':
//       const { orderId: statusOrderId, phone: statusPhone, status: orderStatus } = data;
//       try {
//         const result = await SMSService.sendStatusUpdateSMS(statusPhone, statusOrderId, orderStatus);
        
//         // Update order to mark status SMS sent
//         await orderModel.findOneAndUpdate(
//           { orderid: statusOrderId },
//           { 'smsSent.statusUpdate': true }
//         );
        
//         return { orderId: statusOrderId, status: orderStatus, success: result.success };
//       } catch (error) {
//         console.error(`❌ Failed to send status SMS for ${statusOrderId}:`, error.message);
//         return { orderId: statusOrderId, success: false, error: error.message };
//       }

//     case 'sendWelcomeSMS':
//       const { phone: welcomePhone, username } = data;
//       try {
//         const result = await SMSService.sendWelcomeSMS(welcomePhone, username);
//         return { phone: welcomePhone, success: result.success };
//       } catch (error) {
//         console.error(`❌ Failed to send welcome SMS to ${welcomePhone}:`, error.message);
//         return { phone: welcomePhone, success: false, error: error.message };
//       }

//     default:
//       console.log(`⚠️ Unknown job type: ${name}`);
//       return { error: 'Unknown job type', jobId: job.id };
//   }
// }, {
//   connection: redisConnection,
//   concurrency: 3,
//   attempts: 3,
//   backoff: {
//     type: 'exponential',
//     delay: 5000,
//   },
//   removeOnComplete: {
//     age: 24 * 3600,
//     count: 1000,
//   },
//   removeOnFail: {
//     age: 72 * 3600,
//     count: 1000,
//   },
// });

// // Event listeners
// worker.on('completed', (job) => {
//   console.log(`✅ Order job ${job.id} completed successfully`);
// });

// worker.on('failed', (job, error) => {
//   console.error(`❌ Order job ${job.id} failed:`, error.message);
// });

// worker.on('error', (error) => {
//   console.error('🔥 Worker error:', error);
// });

// worker.on('stalled', (jobId) => {
//   console.warn(`⚠️ Job ${jobId} stalled`);
// });

// worker.on('active', (job) => {
//   console.log(`🔄 Job ${job.id} is now active`);
// });

// // Initialize on startup
// async function initializeWorker() {
//   console.log('🚀 Initializing Order Worker...');

//   try {
//     await redisConnection.ping();
//     console.log('✅ Redis connection established');

//     await connectDB();

//     const counts = await orderQueue.getJobCounts();
//     console.log('📊 Queue status:', {
//       waiting: counts.waiting,
//       active: counts.active,
//       completed: counts.completed,
//       failed: counts.failed,
//       delayed: counts.delayed,
//     });

//     if (counts.failed > 0) {
//       console.log(`⚠️ Found ${counts.failed} failed jobs in queue`);
//     }

//     console.log('📦 Order worker started and listening for jobs...');

//   } catch (error) {
//     console.error('❌ Worker initialization failed:', error.message);
//     console.log('🔄 Worker will continue with limited functionality...');
//   }
// }

// // Initialize
// initializeWorker();

// // Handle graceful shutdown
// const shutdown = async () => {
//   console.log('🛑 Shutting down order worker gracefully...');

//   try {
//     await worker.close();
//     console.log('✅ Worker closed');

//     await redisConnection.quit();
//     console.log('✅ Redis connection closed');

//     if (mongoose.connection.readyState === 1) {
//       await mongoose.connection.close();
//       console.log('✅ MongoDB connection closed');
//     }

//     await orderQueue.close();
//     console.log('✅ Order queue closed');

//     await emailQueue.close();
//     console.log('✅ Email queue closed');

//     console.log('👋 Worker shutdown complete');
//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Error during shutdown:', error);
//     process.exit(1);
//   }
// };

// process.on('SIGTERM', shutdown);
// process.on('SIGINT', shutdown);

// process.on('uncaughtException', (error) => {
//   console.error('💥 Uncaught Exception:', error);
//   console.error('Stack:', error.stack);
// });

// process.on('unhandledRejection', (error) => {
//   console.error('💥 Unhandled Rejection:', error);
//   if (error instanceof Error) {
//     console.error('Stack:', error.stack);
//   }
// });

// export { worker, orderQueue };



import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import mongoose from 'mongoose';
import orderModel from '../models/orderModel.js';
import userModel from '../models/authModel.js';
import { Queue } from 'bullmq';
import SMSService from '../utils/smsService.js';

// Initialize email queue
const emailQueue = new Queue('emailQueue', {
  connection: new IORedis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  }),
});

// MongoDB Connection with retry logic
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    console.log('🔗 Connecting to MongoDB Atlas...');

    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://recreatersservices:recreaters123@cluster0.d4tasry.mongodb.net/organicdiet';

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      w: 'majority',
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Mongoose disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ Mongoose reconnected');
      isConnected = true;
    });

    isConnected = true;
    console.log('✅ MongoDB Atlas connected successfully');

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
};

// Create Redis connection for worker
const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

// Create order queue instance for getting counts
const orderQueue = new Queue('orderQueue', {
  connection: redisConnection,
});

// Create worker instance with improved error handling
const worker = new Worker('orderQueue', async (job) => {
  const { name, data } = job;

  console.log(`📦 Processing order job: ${name} - ${job.id}`);

  // Ensure DB connection with retry
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      await connectDB();
      break;
    } catch (error) {
      retryCount++;
      console.warn(`⚠️ DB connection attempt ${retryCount} failed: ${error.message}`);

      if (retryCount === maxRetries) {
        console.error('❌ Max DB connection retries reached');
        throw new Error(`Failed to connect to DB after ${maxRetries} attempts: ${error.message}`);
      }

      await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
    }
  }

  switch (name) {
    case 'processCODOrder':
      const {
        orderId, userId, items, amount, address, couponCode,
        discount, referralDiscount, walletDiscount, coinsUsed,
        commissionEarned, referredBy,
        referralConfigUsed, shouldMarkReferralUsed, userPhone
      } = data;

      try {
        const session = await mongoose.startSession();

        try {
          session.startTransaction();

          // ✅ Deduct wallet coins if used
          if (coinsUsed > 0) {
            const coinDeduction = await userModel.updateOne(
              { _id: userId },
              { $inc: { walletCoins: -coinsUsed } },
              { session }
            );

            if (coinDeduction.modifiedCount > 0) {
              console.log(`✅ Deducted ${coinsUsed} coins from user ${userId}`);
            }
          }

          // Save order with wallet discount info
          const orderData = {
            orderid: orderId,
            userId,
            items,
            amount,
            address,
            paymentMethod: "COD",
            payment: false,
            couponCode,
            discount,
            walletDiscount: walletDiscount || 0,
            coinsUsed: coinsUsed || 0,
            referralDiscount,
            totalDiscount: discount + (walletDiscount || 0),
            commissionEarned,
            referredBy,
            referralConfigUsed,
            status: 'processing',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const newOrder = new orderModel(orderData);
          await newOrder.save({ session });

          console.log(`✅ Order ${orderId} saved to database`);

          // ✅ Process referral if applicable
          if (shouldMarkReferralUsed && referredBy && userPhone) {
            // 1. Mark user's referral as used
            const updateResult = await userModel.updateOne(
              { number: userPhone },
              { $set: { usedReferral: true } },
              { session }
            );

            if (updateResult.modifiedCount > 0) {
              console.log(`✅ Referral marked as used for ${userPhone}`);
            }

            // 2. Update referrer's commission
            if (commissionEarned > 0) {
              const commissionUpdate = await userModel.updateOne(
                { _id: referredBy },
                {
                  $inc: {
                    totalCommissionEarned: Math.floor(commissionEarned),
                    totalReferral: 1
                  }
                },
                { session }
              );

              if (commissionUpdate.modifiedCount > 0) {
                console.log(`✅ Commission ₹${commissionEarned} added to referrer ${referredBy}`);
              }
            }
          }

          // Commit transaction
          await session.commitTransaction();
          console.log(`✅ Transaction committed for order ${orderId}`);

          // Queue email notification
          try {
            await emailQueue.add('sendCODConfirmation', {
              to: address.email,
              order: newOrder.toObject(),
              template: 'cod_confirmation',
            }, {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 2000,
              }
            });
            console.log(`✅ Email queued for order ${orderId}`);
          } catch (emailError) {
            console.warn(`⚠️ Failed to queue email for ${orderId}:`, emailError.message);
          }

          return { orderId, success: true, order: newOrder.toObject() };

        } catch (transactionError) {
          await session.abortTransaction();
          console.error(`❌ Transaction aborted for order ${orderId}:`, transactionError);
          throw transactionError;
        } finally {
          await session.endSession();
        }

      } catch (error) {
        console.error(`❌ Failed to process order ${orderId}:`, error.message);

        const shouldRetry = error.name.includes('Mongo') ||
          error.name.includes('Network') ||
          error.message.includes('timeout');

        if (shouldRetry) {
          console.log(`🔄 Will retry order ${orderId} due to ${error.name}`);
          throw error;
        }

        return {
          orderId,
          success: false,
          error: error.message,
          shouldRetry: false
        };
      }

    case 'updateOrderStatus':
      const { orderid, status } = data;
      try {
        const updated = await orderModel.findOneAndUpdate(
          { orderid },
          { status, updatedAt: new Date() },
          { new: true }
        );

        if (!updated) {
          console.warn(`⚠️ Order ${orderid} not found for status update`);
          return { orderid, status, updated: null, error: 'Order not found' };
        }

        console.log(`✅ Order ${orderid} status updated to ${status}`);
        return { orderid, status, updated: updated.toObject() };
      } catch (error) {
        console.error(`❌ Failed to update order ${orderid}:`, error.message);
        throw error;
      }

    case 'sendOrderConfirmationSMS':
      const { orderId: smsOrderId, phone: smsPhone } = data;
      try {
        const result = await SMSService.sendOrderConfirmationSMS(smsPhone, smsOrderId);
        
        // Update order to mark SMS sent
        await orderModel.findOneAndUpdate(
          { orderid: smsOrderId },
          { 'smsSent.confirmation': true }
        );
        
        return { orderId: smsOrderId, phone: smsPhone, success: result.success };
      } catch (error) {
        console.error(`❌ Failed to send order confirmation SMS for ${smsOrderId}:`, error.message);
        return { orderId: smsOrderId, success: false, error: error.message };
      }

    case 'sendPaymentConfirmationSMS':
      const { orderId: paymentOrderId, phone: paymentPhone, amount: paymentAmount, method } = data;
      try {
        const result = await SMSService.sendPaymentConfirmationSMS(paymentPhone, paymentOrderId, paymentAmount, method);
        return { orderId: paymentOrderId, success: result.success };
      } catch (error) {
        console.error(`❌ Failed to send payment SMS for ${paymentOrderId}:`, error.message);
        return { orderId: paymentOrderId, success: false, error: error.message };
      }

    case 'sendStatusUpdateSMS':
      const { orderId: statusOrderId, phone: statusPhone, status: orderStatus } = data;
      try {
        const result = await SMSService.sendStatusUpdateSMS(statusPhone, statusOrderId, orderStatus);
        
        // Update order to mark status SMS sent
        await orderModel.findOneAndUpdate(
          { orderid: statusOrderId },
          { 'smsSent.statusUpdate': true }
        );
        
        return { orderId: statusOrderId, status: orderStatus, success: result.success };
      } catch (error) {
        console.error(`❌ Failed to send status SMS for ${statusOrderId}:`, error.message);
        return { orderId: statusOrderId, success: false, error: error.message };
      }

    case 'sendOrderCancelledSMS':
      const { orderId: cancelledOrderId, phone: cancelledPhone, amount: cancelledAmount } = data;
      try {
        const result = await SMSService.sendOrderCancelledSMS(cancelledPhone, cancelledOrderId, cancelledAmount);
        return { orderId: cancelledOrderId, success: result.success };
      } catch (error) {
        console.error(`❌ Failed to send cancellation SMS for ${cancelledOrderId}:`, error.message);
        return { orderId: cancelledOrderId, success: false, error: error.message };
      }

    case 'sendOrderCompletedSMS':
      const { orderId: completedOrderId, phone: completedPhone, amount: completedAmount } = data;
      try {
        const result = await SMSService.sendOrderCompletedSMS(completedPhone, completedOrderId, completedAmount);
        return { orderId: completedOrderId, success: result.success };
      } catch (error) {
        console.error(`❌ Failed to send completion SMS for ${completedOrderId}:`, error.message);
        return { orderId: completedOrderId, success: false, error: error.message };
      }

    case 'sendWelcomeSMS':
      const { phone: welcomePhone } = data;
      try {
        const result = await SMSService.sendWelcomeSMS(welcomePhone);
        return { phone: welcomePhone, success: result.success };
      } catch (error) {
        console.error(`❌ Failed to send welcome SMS to ${welcomePhone}:`, error.message);
        return { phone: welcomePhone, success: false, error: error.message };
      }

    default:
      console.log(`⚠️ Unknown job type: ${name}`);
      return { error: 'Unknown job type', jobId: job.id };
  }
}, {
  connection: redisConnection,
  concurrency: 3,
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000,
  },
  removeOnComplete: {
    age: 24 * 3600,
    count: 1000,
  },
  removeOnFail: {
    age: 72 * 3600,
    count: 1000,
  },
});

// Event listeners
worker.on('completed', (job) => {
  console.log(`✅ Order job ${job.id} completed successfully`);
});

worker.on('failed', (job, error) => {
  console.error(`❌ Order job ${job.id} failed:`, error.message);
});

worker.on('error', (error) => {
  console.error('🔥 Worker error:', error);
});

worker.on('stalled', (jobId) => {
  console.warn(`⚠️ Job ${jobId} stalled`);
});

worker.on('active', (job) => {
  console.log(`🔄 Job ${job.id} is now active`);
});

// Initialize on startup
async function initializeWorker() {
  console.log('🚀 Initializing Order Worker...');

  try {
    await redisConnection.ping();
    console.log('✅ Redis connection established');

    await connectDB();

    const counts = await orderQueue.getJobCounts();
    console.log('📊 Queue status:', {
      waiting: counts.waiting,
      active: counts.active,
      completed: counts.completed,
      failed: counts.failed,
      delayed: counts.delayed,
    });

    if (counts.failed > 0) {
      console.log(`⚠️ Found ${counts.failed} failed jobs in queue`);
    }

    console.log('📦 Order worker started and listening for jobs...');

  } catch (error) {
    console.error('❌ Worker initialization failed:', error.message);
    console.log('🔄 Worker will continue with limited functionality...');
  }
}

// Initialize
initializeWorker();

// Handle graceful shutdown
const shutdown = async () => {
  console.log('🛑 Shutting down order worker gracefully...');

  try {
    await worker.close();
    console.log('✅ Worker closed');

    await redisConnection.quit();
    console.log('✅ Redis connection closed');

    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
    }

    await orderQueue.close();
    console.log('✅ Order queue closed');

    await emailQueue.close();
    console.log('✅ Email queue closed');

    console.log('👋 Worker shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled Rejection:', error);
  if (error instanceof Error) {
    console.error('Stack:', error.stack);
  }
});

export { worker, orderQueue };
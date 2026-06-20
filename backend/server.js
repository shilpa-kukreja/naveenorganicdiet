// import express from 'express';
// import adminUserRouter from './routes/adminUserRoutes.js';
// import cors from 'cors';
// import path from "path";
// import "dotenv/config";
// import connectDB from './config/db.js';
// import contactRouter from './routes/contactRoutes.js';
// import subscriberRouter from './routes/subscriberRoutes.js';
// import blogRouter from './routes/blogRoutes.js';
// import categoryRouter from './routes/categoryRoutes.js';
// import productRouter from './routes/productRoutes.js';
// import couponRouter from './routes/couponRoutes.js';
// import reviewRouter from './routes/reviewsRoutes.js';
// import authRoutes from './routes/authRoutes.js';
// import orderRoutes from './routes/orderRoutes.js';
// import { createBullBoard } from '@bull-board/api';
// import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
// import { ExpressAdapter } from '@bull-board/express';
// import basicAuth from 'express-basic-auth';
// import { emailQueue, orderQueue, checkQueueHealth } from './config/queue.js';



// const app = express();
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// app.use(cors());
// // Middleware
// app.use(express.json());

// // Bull Board setup for queue monitoring
// const serverAdapter = new ExpressAdapter();
// serverAdapter.setBasePath('/admin/queues');

// const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
//   queues: [
//     new BullMQAdapter(emailQueue),
//     new BullMQAdapter(orderQueue),
//   ],
//   serverAdapter: serverAdapter,
// });

// // Basic auth for queue dashboard
// const queueAuth = basicAuth({
//   users: { 
//     [process.env.QUEUE_ADMIN_USER || 'admin']: process.env.QUEUE_ADMIN_PASS || 'admin123' 
//   },
//   challenge: true,
//   realm: 'Queue Dashboard',
// });

// app.use('/admin/queues', queueAuth, serverAdapter.getRouter());

// // Health check endpoint
// app.get('/health', async (req, res) => {
//   try {
//     const [mongoStatus, queueStatus] = await Promise.all([
//       mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
//       checkQueueHealth(),
//     ]);
    
//     res.json({
//       status: 'ok',
//       timestamp: new Date().toISOString(),
//       services: {
//         mongodb: mongoStatus,
//         redis: queueStatus ? 'connected' : 'disconnected',
//         queues: queueStatus,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ status: 'error', error: error.message });
//   }
// });


// const PORT = process.env.PORT || 5000;


// connectDB();

// // Routes
// app.get('/', (req, res) => {
//   res.send('Hello from Node.js with ES Modules!');
// });

// app.use('/api/admin', adminUserRouter);
// app.use('/api/contact', contactRouter);
// app.use('/api/subscriber', subscriberRouter);
// app.use('/api/blog', blogRouter);
// app.use('/api/category', categoryRouter);
// app.use('/api/product', productRouter);
// app.use('/api/coupon', couponRouter);
// app.use('/api/reviews', reviewRouter);
// app.use("/api/users", authRoutes);
// app.use("/api/order", orderRoutes);


// // Graceful shutdown
// process.on('SIGTERM', async () => {
//   console.log('SIGTERM received, shutting down gracefully...');
  
//   await mongoose.connection.close();
//   console.log('MongoDB connection closed');
  
//   process.exit(0);
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`✅ Server running at http://localhost:${PORT}`);
//   console.log('Bull-Board Dashboard: http://localhost:5000/admin/queues');
// });


import express from 'express';
import mongoose from 'mongoose'; // ADD THIS IMPORT
import adminUserRouter from './routes/adminUserRoutes.js';
import cors from 'cors';
import path from "path";
import { fileURLToPath } from 'url'; // ADD THIS
import "dotenv/config";
import connectDB from './config/db.js';
import contactRouter from './routes/contactRoutes.js';
import subscriberRouter from './routes/subscriberRoutes.js';
import blogRouter from './routes/blogRoutes.js';
import categoryRouter from './routes/categoryRoutes.js';
import productRouter from './routes/productRoutes.js';
import couponRouter from './routes/couponRoutes.js';
import reviewRouter from './routes/reviewsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import basicAuth from 'express-basic-auth';
import { emailQueue, orderQueue, checkQueueHealth } from './config/queue.js';
import testimonialRouter from './routes/testimonialRoutes.js';
import mainbannerRouter from './routes/mainbannerRoutes.js';
import additionalbannerRouter from './routes/additionalbannerRoutes.js';
import promontionalbannerRoutes from './routes/promotionalbannerRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import aboutRouter from './routes/aboutRoutes.js';
import aboutCoreValueRouter from './routes/aboutCoreValuesRoutes.js';
import bannerRouter from './routes/bannerRoutes.js';
import dashboardRouter from './routes/adminRoutes.js';
import emailComaigenRouter from './routes/emailCampaignRoutes.js';
import trackingRoutes from './routes/tracking.js';
import shipmozoRouter from './routes/shipmozoRoutes.js';
import "./crown/abandonedCartcrown.js"
import abandonedCartRouter from './routes/abandonedCartRoute.js';
import restoreRouter from './routes/restoreRoutes.js';
import adminRouter from './routes/adminCartRoutes.js';
import returnRouter from './routes/returnRoutes.js';
import dns from 'dns';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

dns.setServers(["1.1.1.1","8.8.8.8"]);

// Serve static files correctly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors());

// Middleware
app.use(express.json());

// Bull Board setup for queue monitoring
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [
    new BullMQAdapter(emailQueue),
    new BullMQAdapter(orderQueue),
  ],
  serverAdapter: serverAdapter,
});

// Basic auth for queue dashboard
const queueAuth = basicAuth({
  users: { 
    [process.env.QUEUE_ADMIN_USER || 'admin']: process.env.QUEUE_ADMIN_PASS || 'admin123' 
  },
  challenge: true,
  realm: 'Queue Dashboard',
});

app.use('/admin/queues', queueAuth, serverAdapter.getRouter());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const [mongoStatus, queueStatus] = await Promise.allSettled([
      // Check MongoDB connection
      new Promise((resolve) => {
        const state = mongoose.connection.readyState;
        resolve(state === 1 ? 'connected' : 'disconnected');
      }),
      // Check queue health
      checkQueueHealth().catch(() => 'error'),
    ]);
    
    const mongoResult = mongoStatus.status === 'fulfilled' ? mongoStatus.value : 'error';
    const queueResult = queueStatus.status === 'fulfilled' ? queueStatus.value : 'error';
    
    // Determine overall status
    const overallStatus = 
      mongoResult === 'connected' && 
      (queueResult === true || queueResult === 'connected') 
        ? 'healthy' 
        : 'degraded';
    
    res.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoResult,
        redis: typeof queueResult === 'object' ? 'connected' : queueResult,
        queues: queueResult,
      },
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Routes
app.get('/', (req, res) => {
  res.send('Hello from Node.js with ES Modules!');
});

app.use('/api/admin', adminUserRouter);
app.use('/api/contact', contactRouter);
app.use('/api/subscriber', subscriberRouter);
app.use('/api/blog', blogRouter);
app.use('/api/category', categoryRouter);
app.use('/api/product', productRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/reviews', reviewRouter);
app.use("/api/users", authRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/testimonials", testimonialRouter);
app.use("/api/mainbanner", mainbannerRouter); 
app.use("/api/additionalbanner", additionalbannerRouter);
app.use("/api/promotionalbanner", promontionalbannerRoutes);
app.use("/api/videos", videoRoutes); // ADD THIS LINE
app.use("/api/about",  aboutRouter)
app.use('/api/about-core-values', aboutCoreValueRouter); 
app.use('/api/about-banner', bannerRouter);
app.use('/api/admin', dashboardRouter);
app.use('/api/email-campaign', emailComaigenRouter);
app.use('/api/tracking', trackingRoutes);
app.use("/api/shipmozo", shipmozoRouter);
app.use("/api/abandonedcart", abandonedCartRouter);
app.use('/api/restorecart', restoreRouter);
app.use("/api/abandoned-carts", adminRouter);
app.use("/api/returns", returnRouter)



// Error handling middleware (ADD THIS)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler (ADD THIS)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});


// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  
  // Close queue connections if needed
  if (emailQueue) await emailQueue.close();
  if (orderQueue) await orderQueue.close();
  
  console.log('Queues closed');
  
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📊 Bull-Board Dashboard: http://localhost:${PORT}/admin/queues`);
  console.log(`🩺 Health Check: http://localhost:${PORT}/health`);
});
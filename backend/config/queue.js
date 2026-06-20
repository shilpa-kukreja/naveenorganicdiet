// import { Queue } from 'bullmq';  // Changed from 'bull' to 'bullmq'
// import { createClient } from 'redis';
// import "dotenv/config";


// // Create Redis connection
// const redisConnection = {
//   host: process.env.REDIS_HOST || "127.0.0.1",
//   port: parseInt(process.env.REDIS_PORT) || 6379,
// };

// // Create separate queues for different tasks
// const emailQueue = new Queue('emailQueue', {
//   connection: redisConnection,
//   defaultJobOptions: {
//     attempts: 3,
//     backoff: { type: 'exponential', delay: 2000 },
//     removeOnComplete: { age: 3600 }, // Keep completed jobs for 1 hour
//     removeOnFail: { age: 24 * 3600 }, // Keep failed jobs for 24 hours
//   },
// });

// const orderQueue = new Queue('orderQueue', {
//   connection: redisConnection,
//   defaultJobOptions: {
//     attempts: 2,
//     backoff: { type: 'fixed', delay: 5000 },
//     removeOnComplete: { age: 3600 },
//   },
// });

// // Helper to check queue health
// async function checkQueueHealth() {
//   try {
//     const [emailCounts, orderCounts] = await Promise.all([
//       emailQueue.getJobCounts(),
//       orderQueue.getJobCounts(),
//     ]);
    
//     return {
//       emailQueue: {
//         ...emailCounts,
//         isHealthy: true,
//       },
//       orderQueue: {
//         ...orderCounts,
//         isHealthy: true,
//       },
//     };
//   } catch (error) {
//     console.error('Queue health check failed:', error);
//     return null;
//   }
// }

// export { emailQueue, orderQueue, checkQueueHealth };


import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import "dotenv/config";

// Create Redis connection - FIXED for local development
// const redisConnection = new IORedis({
//   host: process.env.REDIS_HOST || "127.0.0.1",  // Changed from 'redis' to '127.0.0.1'
//   port: parseInt(process.env.REDIS_PORT) || 6379,
//   maxRetriesPerRequest: null,
//   enableReadyCheck: false,
//   retryStrategy: (times) => {
//     if (times > 3) {
//       console.error('Failed to connect to Redis after 3 attempts');
//       return null;
//     }
//     return Math.min(times * 100, 3000);
//   }
// });

const redisConnection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => {
    if (times > 3) {
      console.error("Failed to connect to Redis after 3 attempts");
      return null;
    }
    return Math.min(times * 100, 3000);
  },
});

// Test Redis connection
redisConnection.on('connect', () => {
  console.log('✅ Redis connection established');
});

redisConnection.on('error', (error) => {
  console.error('❌ Redis connection error:', error.message);
});

// Create separate queues for different tasks
const emailQueue = new Queue('emailQueue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 24 * 3600 },
  },
});

const orderQueue = new Queue('orderQueue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 5000 },
    removeOnComplete: { age: 3600 },
  },
});

// Helper to check queue health
async function checkQueueHealth() {
  try {
    const [emailCounts, orderCounts, redisStatus] = await Promise.all([
      emailQueue.getJobCounts(),
      orderQueue.getJobCounts(),
      redisConnection.ping().then(() => 'connected').catch(() => 'disconnected')
    ]);
    
    return {
      redis: redisStatus,
      emailQueue: {
        ...emailCounts,
        isHealthy: redisStatus === 'connected',
      },
      orderQueue: {
        ...orderCounts,
        isHealthy: redisStatus === 'connected',
      },
    };
  } catch (error) {
    console.error('Queue health check failed:', error);
    return null;
  }
}

export { emailQueue, orderQueue, checkQueueHealth, redisConnection };
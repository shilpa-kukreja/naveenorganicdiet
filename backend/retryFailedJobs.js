// Create a retry script: retryFailedJobs.js
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT) || 6379,
});

const orderQueue = new Queue('orderQueue', { connection: redisConnection });

async function retryFailedJobs() {
  try {
    const failedJobs = await orderQueue.getJobs(['failed']);
    console.log(`Found ${failedJobs.length} failed jobs`);
    
    for (const job of failedJobs) {
      console.log(`Retrying job ${job.id}: ${job.name}`);
      await job.retry();
      console.log(`✅ Job ${job.id} queued for retry`);
    }
    
    console.log('All failed jobs retried');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

retryFailedJobs();
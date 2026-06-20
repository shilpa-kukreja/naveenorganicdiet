// routes/queueMetrics.js
import express from 'express';
import { emailQueue, orderQueue } from '../config/queue.js';

const router = express.Router();

router.get('/metrics', async (req, res) => {
  try {
    const [emailMetrics, orderMetrics] = await Promise.all([
      emailQueue.getJobCounts(),
      orderQueue.getJobCounts(),
    ]);

    const emailJobs = await emailQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
    const orderJobs = await orderQueue.getJobs(['waiting', 'active', 'completed', 'failed']);

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      queues: {
        emailQueue: {
          counts: emailMetrics,
          stats: {
            avgProcessingTime: await calculateAverageTime(emailJobs),
            failureRate: await calculateFailureRate(emailJobs),
          }
        },
        orderQueue: {
          counts: orderMetrics,
          stats: {
            avgProcessingTime: await calculateAverageTime(orderJobs),
            failureRate: await calculateFailureRate(orderJobs),
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function calculateAverageTime(jobs) {
  const completedJobs = jobs.filter(j => j.finishedOn);
  if (completedJobs.length === 0) return 0;
  
  const totalTime = completedJobs.reduce((sum, job) => {
    return sum + (job.finishedOn - job.processedOn);
  }, 0);
  
  return totalTime / completedJobs.length;
}

async function calculateFailureRate(jobs) {
  if (jobs.length === 0) return 0;
  const failedJobs = jobs.filter(j => j.failedReason);
  return (failedJobs.length / jobs.length) * 100;
}

export default router;
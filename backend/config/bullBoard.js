// config/bullBoard.js - Updated with authentication
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import emailQueue from './queue.js';
import basicAuth from 'express-basic-auth';

const serverAdapter = new ExpressAdapter();

// Add basic auth middleware
serverAdapter.setBasePath('/admin/queues');
serverAdapter.use(
  basicAuth({
    users: {
      [process.env.QUEUE_ADMIN_USER || 'admin']: process.env.QUEUE_ADMIN_PASS || 'password123',
    },
    challenge: true,
    realm: 'Bull-Board',
  })
);

createBullBoard({
  queues: [new BullAdapter(emailQueue)],
  serverAdapter: serverAdapter,
});

export default serverAdapter;
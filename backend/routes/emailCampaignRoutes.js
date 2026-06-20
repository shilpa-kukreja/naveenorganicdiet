import express from 'express';
import {
  getEmailTemplates,
  sendBulkEmails,
  getEmailStats,
  sendTestEmail,
  getSavedCampaigns,
  saveCampaign,
  updateCampaign,
  deleteCampaign,
  duplicateCampaign,
  getCampaignById
} from '../controllers/emailCampaignController.js';

const emailComaigenRouter = express.Router();

// Test email configuration

emailComaigenRouter.get('/templates', getEmailTemplates);
emailComaigenRouter.post('/send-test', sendTestEmail);
emailComaigenRouter.post('/send-bulk', sendBulkEmails);
emailComaigenRouter.get('/stats', getEmailStats);

// New routes for saved campaigns
emailComaigenRouter.post('/campaigns', saveCampaign);
emailComaigenRouter.get('/campaigns', getSavedCampaigns);
emailComaigenRouter.get('/campaigns/:id', getCampaignById);
emailComaigenRouter.put('/campaigns/:id', updateCampaign);
emailComaigenRouter.delete('/campaigns/:id', deleteCampaign);
emailComaigenRouter.post('/campaigns/:id/duplicate', duplicateCampaign);

export default emailComaigenRouter;
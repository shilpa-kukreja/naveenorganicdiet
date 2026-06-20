import mongoose from 'mongoose';

const emailCampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  template: {
    type: String,
    enum: ['custom', 'welcome', 'promotion', 'newsletter', 'announcement', 'abandonedCart', 'referral', 'birthday'],
    default: 'custom'
  },
  segment: {
    type: String,
    enum: ['all', 'verified', 'unverified', 'recent', 'withAddress', 'noAddress', 'custom'],
    default: 'all'
  },
  selectedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  recipientCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'scheduled', 'failed'],
    default: 'draft'
  },
  sentAt: {
    type: Date
  },
  sentCount: {
    type: Number,
    default: 0
  },
  failedCount: {
    type: Number,
    default: 0
  },
  sentToAll: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastSentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String
  }],
  scheduledFor: {
    type: Date
  },
  notes: {
    type: String
  },
  // Statistics
  openRate: {
    type: Number,
    default: 0
  },
  clickRate: {
    type: Number,
    default: 0
  },
  bounceRate: {
    type: Number,
    default: 0
  },
  unsubscribes: {
    type: Number,
    default: 0
  },
  complaints: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
emailCampaignSchema.index({ createdBy: 1, status: 1 });
emailCampaignSchema.index({ sentAt: -1 });
emailCampaignSchema.index({ scheduledFor: 1 });
emailCampaignSchema.index({ tags: 1 });

const EmailCampaign = mongoose.model('EmailCampaign', emailCampaignSchema);

export default EmailCampaign;
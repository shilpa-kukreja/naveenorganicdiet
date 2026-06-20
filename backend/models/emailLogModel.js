import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailCampaign'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: {
    type: String,
    required: true
  },
  subject: {
    type: String
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed', 'spam'],
    default: 'sent'
  },
  messageId: {
    type: String
  },
  trackingId: {
    type: String,
    unique: true
  },
  // Open tracking
  openedAt: {
    type: Date
  },
  openedCount: {
    type: Number,
    default: 0
  },
  openedIP: {
    type: String
  },
  openedUserAgent: {
    type: String
  },
  openedLocation: {
    type: String
  },
  openedDevice: {
    type: String
  },
  
  // Click tracking
  clicks: [{
    url: String,
    clickedAt: Date,
    ip: String,
    userAgent: String,
    location: String,
    device: String,
    clickCount: Number
  }],
  
  totalClicks: {
    type: Number,
    default: 0
  },
  
  // Bounce/complaint tracking
  bounceType: {
    type: String,
    enum: ['hard', 'soft', 'complaint', null]
  },
  bounceMessage: {
    type: String
  },
  
  // Unsubscribe tracking
  unsubscribedAt: {
    type: Date
  },
  unsubscribeReason: {
    type: String
  },
  
  error: {
    type: String
  },
  deliveredAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
emailLogSchema.index({ trackingId: 1 });
emailLogSchema.index({ campaign: 1, status: 1 });
emailLogSchema.index({ user: 1, createdAt: -1 });
emailLogSchema.index({ openedAt: 1 });
emailLogSchema.index({ 'clicks.clickedAt': 1 });

const EmailLog = mongoose.model('EmailLog', emailLogSchema);

export default EmailLog;
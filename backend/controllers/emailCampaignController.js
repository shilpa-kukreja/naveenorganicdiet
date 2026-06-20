import nodemailer from 'nodemailer';
import EmailCampaign from '../models/emailCampaignModel.js';
import EmailLog from '../models/emailLogModel.js';
import userModel from '../models/authModel.js';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Generate unique tracking ID
const generateTrackingId = () => {
  return crypto.randomBytes(16).toString('hex');
};
// Helper function to replace merge variables in email HTML
const replaceVariables = (html, user) => {
  if (!html || !user) return html;

  // Get user's primary name (prefer address fullName if available)
  const primaryName = user.address?.[0]?.fullName || user.username || user.email?.split('@')[0] || 'Customer';
  const primaryEmail = user.address?.[0]?.email || user.email;
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Replace merge tags in HTML
  return html
    .replace(/{{user\.name}}/gi, primaryName)
    .replace(/{{user\.username}}/gi, user.username || primaryName)
    .replace(/{{user\.email}}/gi, primaryEmail)
    .replace(/{{user\.fullName}}/gi, primaryName)
    .replace(/{{user\.firstname}}/gi, primaryName.split(' ')[0])
    .replace(/{{user\.phone}}/gi, user.number || user.address?.[0]?.phone || 'N/A')
    .replace(/{{current\.date}}/gi, currentDate)
    .replace(/{{store\.name}}/gi, process.env.STORE_NAME || 'Organic Diet')
    .replace(/{{user\.couponCode}}/gi, user.couponCode || '')
    .replace(/{{user\.referralCode}}/gi, user.referralCode || '')
    .replace(/{{user\.walletCoins}}/gi, user.walletCoins || 0)
    .replace(/{{merge_tag}}.*?{{\/merge_tag}}/g, ''); // Remove merge tag wrappers
};

// Get email templates
const getEmailTemplates = async (req, res) => {
  try {
    const templates = [
      {
        id: "welcome",
        name: "Welcome Email",
        subject: "🎉 Welcome to Organic Diet - Start Your Healthy Journey!",
        description: "Drag & drop welcome email for new users"
      },
      {
        id: "promotion",
        name: "Promotion Email",
        subject: "🌟 Exclusive Offer Just For You - Limited Time Only!",
        description: "Promotional offers and discounts"
      },
      {
        id: "newsletter",
        name: "Weekly Newsletter",
        subject: "📰 Organic Diet Weekly Digest - Health Tips & Offers",
        description: "Weekly health tips and updates"
      },
      {
        id: "announcement",
        name: "Announcement Email",
        subject: "📢 Important Update from Organic Diet",
        description: "Important announcements"
      },
      {
        id: "abandonedCart",
        name: "Cart Reminder",
        subject: "🛒 Complete Your Healthy Purchase - Items Awaiting!",
        description: "Remind users about items in cart"
      }
    ];

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get templates',
      error: error.message
    });
  }
};

// Send test email
const sendTestEmail = async (req, res) => {
  try {
    const { templateId, customSubject, customContent } = req.body;

    // Get admin email as test recipient
    const adminEmail = process.env.EMAIL_USER;
    if (!adminEmail) {
      return res.status(400).json({
        success: false,
        message: 'Admin email not configured'
      });
    }

    // Create test user data
    const testUser = {
      username: 'Test User',
      email: adminEmail,
      address: [{
        fullName: 'Shubham Shukla',
        email: adminEmail,
        phone: '9335162135'
      }],
      number: '9335162135',
      couponCode: 'TESTCODE123',
      referralCode: 'TESTREF456',
      walletCoins: 100
    };

    let emailContent;
    let emailSubject;

    // If custom HTML content from react-email-editor
    if (customContent) {
      emailSubject = customSubject || 'Test Email from Organic Diet';
      emailContent = replaceVariables(customContent, testUser);
    }
    // Use predefined templates
    else if (templateId === 'welcome') {
      emailSubject = customSubject || "🎉 Welcome to Organic Diet - Start Your Healthy Journey!";
      emailContent = getWelcomeTemplate(testUser);
    } else if (templateId === 'promotion') {
      emailSubject = customSubject || "🌟 Exclusive Offer Just For You - Limited Time Only!";
      emailContent = getPromotionTemplate(testUser);
    } else if (templateId === 'newsletter') {
      emailSubject = customSubject || "📰 Organic Diet Weekly Digest - Health Tips & Offers";
      emailContent = getNewsletterTemplate(testUser);
    } else {
      emailSubject = 'Test Email from Organic Diet';
      emailContent = getDefaultTemplate(testUser);
    }

    const mailOptions = {
      from: `"Organic Diet" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: emailSubject,
      html: emailContent,
      replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High'
      }
    };

    const info = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Test email sent successfully',
      previewUrl: nodemailer.getTestMessageUrl(info),
      sentTo: adminEmail,
      htmlContent: emailContent // Return processed HTML for preview
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
};

// Send bulk emails (campaign) - FIXED VERSION
const sendBulkEmails = async (req, res) => {
  try {
    const {
      templateId,
      customSubject,
      customContent,
      userFilter,
      selectedUserIds = [],
      segment = 'all',
      campaignId
    } = req.body;

    let users;
    let campaign;
    
    // If campaignId is provided, get campaign details
    if (campaignId) {
      campaign = await EmailCampaign.findById(campaignId);
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }
    }

    // Apply filters
    if (userFilter === 'selected' && selectedUserIds.length > 0) {
      users = await userModel.find({ _id: { $in: selectedUserIds } });
    } else if (segment === 'verified') {
      users = await userModel.find({ verifiedAt: { $ne: null } });
    } else if (segment === 'unverified') {
      users = await userModel.find({ verifiedAt: null });
    } else if (segment === 'recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      users = await userModel.find({ createdAt: { $gte: thirtyDaysAgo } });
    } else if (segment === 'withAddress') {
      users = await userModel.find({ 'address.0': { $exists: true } });
    } else if (segment === 'noAddress') {
      users = await userModel.find({ address: { $size: 0 } });
    } else {
      // All users
      users = await userModel.find({});
    }

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found with the selected criteria'
      });
    }

    let emailSubject;
    let baseHtml;

    // Get email content
    if (campaign) {
      // Use campaign content
      emailSubject = campaign.subject;
      baseHtml = campaign.content;
    } else if (templateId === 'welcome') {
      emailSubject = customSubject || "🎉 Welcome to Organic Diet - Start Your Healthy Journey!";
      baseHtml = null;
    } else if (templateId === 'promotion') {
      emailSubject = customSubject || "🌟 Exclusive Offer Just For You - Limited Time Only!";
      baseHtml = null;
    } else if (templateId === 'newsletter') {
      emailSubject = customSubject || "📰 Organic Diet Weekly Digest - Health Tips & Offers";
      baseHtml = null;
    } else if (customContent) {
      // Use custom HTML from react-email-editor
      emailSubject = customSubject || 'Message from Organic Diet';
      baseHtml = customContent;
    } else {
      return res.status(400).json({
        success: false,
        message: 'No email content provided'
      });
    }

    // Send emails in batches
    const batchSize = 10;
    const results = {
      total: users.length,
      sent: 0,
      failed: 0,
      errors: []
    };

      for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);

      const batchPromises = batch.map(async (user) => {
        try {
          const recipientEmail = user.address?.[0]?.email || user.email;
          if (!recipientEmail) {
            // Log error
            return { success: false, userId: user._id, error: 'No email address' };
          }

          // Generate tracking ID
          const trackingId = generateTrackingId();
          
          // Get personalized HTML with tracking
          let personalizedHtml;
          if (templateId === 'welcome') {
            personalizedHtml = getWelcomeTemplate(user);
          } else if (templateId === 'promotion') {
            personalizedHtml = getPromotionTemplate(user);
          } else if (templateId === 'newsletter') {
            personalizedHtml = getNewsletterTemplate(user);
          } else {
            personalizedHtml = replaceVariables(baseHtml, user);
          }

          // Add tracking to email content
          const trackedHtml = addEmailTracking(personalizedHtml, trackingId, campaignId);

          const mailOptions = {
            from: `"Organic Diet" <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject: emailSubject,
            html: trackedHtml,
            replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER,
            headers: {
              'X-Priority': '1',
              'X-MSMail-Priority': 'High',
              'List-Unsubscribe': `<${process.env.BASE_URL || 'http://localhost:3000'}/api/email/unsubscribe/${trackingId}>`
            }
          };

          const info = await transporter.sendMail(mailOptions);

          // Log email with tracking
          const emailLog = new EmailLog({
            campaign: campaignId || null,
            user: user._id,
            email: recipientEmail,
            subject: emailSubject,
            status: 'sent',
            messageId: info.messageId,
            trackingId: trackingId,
            deliveredAt: new Date()
          });
          await emailLog.save();

          return { success: true, email: recipientEmail, trackingId };
          
        } catch (error) {
          // Log failed email
          const emailLog = new EmailLog({
            campaign: campaignId || null,
            user: user._id,
            email: user.address?.[0]?.email || user.email,
            status: 'failed',
            error: error.message
          });
          await emailLog.save();

          return { success: false, userId: user._id, error: error.message };
        }
      });


      // Wait for batch to complete
      await Promise.all(batchPromises);

      // Small delay between batches
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Update campaign status if campaignId exists
    if (campaignId) {
      await updateCampaignSentStatus(campaignId, results, segment === 'all');
    }

    res.json({
      success: true,
      message: `Campaign completed: ${results.sent} sent, ${results.failed} failed`,
      results,
      summary: {
        totalUsers: users.length,
        successful: results.sent,
        failed: results.failed,
        firstErrors: results.errors.slice(0, 5)
      }
    });

  } catch (error) {
    console.error('Error sending bulk emails:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send campaign',
      error: error.message
    });
  }
};



// Function to add tracking to email HTML
// Update the addEmailTracking function in campaign controller:

const addEmailTracking = (html, trackingId, campaignId) => {
  if (!html) return html;
  
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  
  // Create tracking pixel URL
  const trackingPixelUrl = `${baseUrl}/api/tracking/open/${trackingId}`;
  
  // Add tracking pixel
  const trackingPixel = `
    <img 
      src="${trackingPixelUrl}" 
      width="1" 
      height="1" 
      style="display:none; width:1px; height:1px; opacity:0; border:0;"
      alt=""
      border="0"
    />
  `;
  
  // Replace all links with tracked links
  let trackedHtml = html.replace(
    /<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["']/gi,
    (match, url) => {
      // Don't track certain types of links
      if (url.startsWith('mailto:') || 
          url.startsWith('tel:') || 
          url.startsWith('javascript:') ||
          url.includes('unsubscribe') ||
          url.includes('preference') ||
          url.includes('view=webversion')) {
        return match;
      }
      
      const encodedUrl = encodeURIComponent(url);
      const trackedUrl = `${baseUrl}/api/tracking/click/${trackingId}?url=${encodedUrl}`;
      
      return match.replace(`href="${url}"`, `href="${trackedUrl}"`);
    }
  );
  
  // Add unsubscribe link if not present
  const unsubscribeUrl = `${baseUrl}/api/tracking/unsubscribe/${trackingId}`;
  const unsubscribeLink = `
    <div style="font-size:12px; color:#666; text-align:center; padding:20px;">
      <p>
        You're receiving this email because you signed up at Organic Diet.
        <br>
        <a href="${unsubscribeUrl}" style="color:#666; text-decoration:underline;">
          Unsubscribe
        </a>
        from future emails.
      </p>
    </div>
  `;
  
  // Add tracking pixel and unsubscribe link before closing body tag
  if (trackedHtml.includes('</body>')) {
    trackedHtml = trackedHtml.replace('</body>', `${trackingPixel}${unsubscribeLink}</body>`);
  } else if (trackedHtml.includes('</html>')) {
    trackedHtml = trackedHtml.replace('</html>', `${trackingPixel}${unsubscribeLink}</html>`);
  } else {
    trackedHtml += `${trackingPixel}${unsubscribeLink}`;
  }
  
  return trackedHtml;
};

// Get campaign analytics
const getCampaignAnalytics = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const campaign = await EmailCampaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Get all logs for this campaign
    const logs = await EmailLog.find({ campaign: campaignId })
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    // Calculate detailed statistics
    const totalSent = logs.length;
    const openedLogs = logs.filter(log => log.status === 'opened' || log.status === 'clicked');
    const clickedLogs = logs.filter(log => log.status === 'clicked');
    const bouncedLogs = logs.filter(log => log.status === 'bounced');
    const unsubscribedLogs = logs.filter(log => log.unsubscribedAt);
    
    const openRate = totalSent > 0 ? (openedLogs.length / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (clickedLogs.length / totalSent) * 100 : 0;
    const bounceRate = totalSent > 0 ? (bouncedLogs.length / totalSent) * 100 : 0;
    
    // Get click details
    const clickDetails = clickedLogs.flatMap(log => 
      (log.clicks || []).map(click => ({
        user: log.user,
        email: log.email,
        url: click.url,
        clickedAt: click.clickedAt,
        device: click.device,
        location: click.location,
        clickCount: click.clickCount
      }))
    );
    
    // Group clicks by URL
    const clicksByUrl = clickDetails.reduce((acc, click) => {
      if (!acc[click.url]) {
        acc[click.url] = {
          url: click.url,
          totalClicks: 0,
          uniqueClicks: 0,
          lastClicked: click.clickedAt
        };
      }
      acc[click.url].totalClicks += click.clickCount;
      acc[click.url].uniqueClicks += 1;
      if (click.clickedAt > acc[click.url].lastClicked) {
        acc[click.url].lastClicked = click.clickedAt;
      }
      return acc;
    }, {});
    
    // Get opens by time
    const opensByHour = {};
    openedLogs.forEach(log => {
      if (log.openedAt) {
        const hour = new Date(log.openedAt).getHours();
        opensByHour[hour] = (opensByHour[hour] || 0) + 1;
      }
    });
    
    // Get device breakdown
    const deviceBreakdown = openedLogs.reduce((acc, log) => {
      const device = log.openedDevice || 'Unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});
    
    // Get location breakdown
    const locationBreakdown = openedLogs.reduce((acc, log) => {
      const location = log.openedLocation || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      analytics: {
        overview: {
          totalSent,
          opened: openedLogs.length,
          clicked: clickedLogs.length,
          bounced: bouncedLogs.length,
          unsubscribed: unsubscribedLogs.length,
          openRate: parseFloat(openRate.toFixed(2)),
          clickRate: parseFloat(clickRate.toFixed(2)),
          bounceRate: parseFloat(bounceRate.toFixed(2)),
          ctr: parseFloat((clickRate / openRate * 100).toFixed(2))
        },
        clicks: {
          totalClicks: clickedLogs.reduce((sum, log) => sum + (log.totalClicks || 0), 0),
          uniqueClicks: clickedLogs.length,
          byUrl: Object.values(clicksByUrl),
          details: clickDetails.slice(0, 50) // First 50 click details
        },
        timeline: {
          opensByHour: Object.entries(opensByHour).map(([hour, count]) => ({ hour, count })),
          sentAt: campaign.sentAt,
          firstOpen: openedLogs[0]?.openedAt,
          lastOpen: openedLogs[openedLogs.length - 1]?.openedAt
        },
        devices: Object.entries(deviceBreakdown).map(([device, count]) => ({ device, count })),
        locations: Object.entries(locationBreakdown).map(([location, count]) => ({ location, count })),
        logs: logs.slice(0, 100) // First 100 logs
      }
    });

  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get campaign analytics',
      error: error.message
    });
  }
};

// Get real-time stats
const getRealTimeStats = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { hours = 24 } = req.query;
    
    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - parseInt(hours));
    
    const recentLogs = await EmailLog.find({
      campaign: campaignId,
      createdAt: { $gte: hoursAgo }
    });
    
    const stats = {
      sentLast24h: recentLogs.length,
      openedLast24h: recentLogs.filter(log => log.status === 'opened' || log.status === 'clicked').length,
      clickedLast24h: recentLogs.filter(log => log.status === 'clicked').length,
      recentOpens: recentLogs
        .filter(log => log.openedAt)
        .map(log => ({
          time: log.openedAt,
          email: log.email,
          device: log.openedDevice,
          location: log.openedLocation
        }))
        .sort((a, b) => b.time - a.time)
        .slice(0, 20)
    };
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('Error getting real-time stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get real-time stats',
      error: error.message
    });
  }
};


// Template functions (fallback if no custom HTML)
const getWelcomeTemplate = (user) => {
  const name = user.address?.[0]?.fullName || user.username || 'Valued Customer';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Organic Diet</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Organic Diet! 🌿</h1>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p>Dear <strong>${name}</strong>,</p>
          <p>We're absolutely thrilled to welcome you to the Organic Diet family! Your journey towards a healthier lifestyle starts here.</p>
          
          <div style="background: #f0fff4; border: 2px solid #48bb78; border-radius: 10px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #2d3748; margin-top: 0;">Your Welcome Gift:</h3>
            <div style="background: #2d3748; color: white; padding: 15px; border-radius: 8px; display: inline-block; font-size: 20px; font-weight: bold;">
              WELCOME${user.walletCoins || 20}
            </div>
            <p style="margin-top: 10px; font-size: 14px;">Valid for 30 days | Minimum order: ₹499</p>
          </div>
          
          <p>Start shopping healthy today!</p>
          <p>Best regards,<br><strong>The Organic Diet Team</strong></p>
        </div>
      </body>
    </html>
  `;
};

const getPromotionTemplate = (user) => {
  const firstName = (user.address?.[0]?.fullName || user.username || 'Customer').split(' ')[0];

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Special Offer - Organic Diet</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 32px;">FLASH SALE! ⚡</h1>
          <div style="background: #c53030; color: white; padding: 8px 20px; border-radius: 20px; display: inline-block; margin-top: 15px; font-weight: bold;">
            EXCLUSIVE FOR ${firstName.toUpperCase()}
          </div>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p>Hi <strong>${firstName}</strong>,</p>
          <p>As a valued Organic Diet member, we've reserved an exclusive offer just for you!</p>
          
          <div style="background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%); border: 3px dashed #c53030; border-radius: 12px; padding: 30px; text-align: center; margin: 25px 0;">
            <div style="font-size: 48px; font-weight: bold; color: #c53030;">50% OFF</div>
            <p style="font-size: 18px; color: #2d3748;">On ALL Organic Products</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://yourstore.com/flash-sale" style="background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; display: inline-block;">
              SHOP THE SALE →
            </a>
          </div>
          
          <p style="font-size: 14px; color: #718096; text-align: center;">
            This offer is exclusive to your account: ${user.email}
          </p>
        </div>
      </body>
    </html>
  `;
};

const getNewsletterTemplate = (user) => {
  const name = user.address?.[0]?.fullName || user.username || 'Health Enthusiast';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Organic Diet Weekly</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🌱 Organic Diet Weekly</h1>
          <div style="color: #bee3f8; font-size: 14px; margin-top: 10px;">
            ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p>Hello <strong>${name}</strong>,</p>
          <p>Here's your weekly dose of health, wellness, and exclusive offers from Organic Diet!</p>
          
          <div style="background: #faf089; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-weight: bold;">💰 Your Organic Coins: <span style="color: #2d3748;">${user.walletCoins || 0}</span></p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Redeem them on your next order!</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://yourstore.com/weekly-special" style="background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
              View Weekly Deals
            </a>
          </div>
          
          <p style="text-align: center; font-size: 14px; color: #718096;">
            Stay healthy, stay happy!<br>
            <strong>The Organic Diet Nutrition Team</strong>
          </p>
        </div>
      </body>
    </html>
  `;
};

const getDefaultTemplate = (user) => {
  const name = user.address?.[0]?.fullName || user.username || 'Customer';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Message from Organic Diet</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Organic Diet</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p>Dear ${name},</p>
          <p>Thank you for being a valued member of Organic Diet community.</p>
          <p>This is a personalized message sent to your registered email: ${user.address?.[0]?.email || user.email}</p>
          <p>Best regards,<br>The Organic Diet Team</p>
        </div>
      </body>
    </html>
  `;
};

// Get email statistics
const getEmailStats = async (req, res) => {
  try {
    const totalUsers = await userModel.countDocuments();
    const verifiedUsers = await userModel.countDocuments({ verifiedAt: { $ne: null } });
    const usersWithAddress = await userModel.countDocuments({ 'address.0': { $exists: true } });

    res.json({
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        usersWithAddress,
        usersWithoutAddress: totalUsers - usersWithAddress,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get email stats',
      error: error.message
    });
  }
};

// Save campaign
const saveCampaign = async (req, res) => {
  try {
    const {
      name,
      subject,
      content,
      template,
      segment,
      selectedUsers,
      recipientCount,
      tags,
      notes,
      scheduledFor
    } = req.body;

    // Validate required fields
    if (!name || !subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Name, subject, and content are required'
      });
    }

    // For demo purposes, use a mock user ID
    // In production, use req.user._id
    const mockUserId = '65d4f8a9e4b0c4a9c1234567';

    // Create campaign
    const campaign = new EmailCampaign({
      name,
      subject,
      content,
      template: template || 'custom',
      segment: segment || 'all',
      selectedUsers: selectedUsers || [],
      recipientCount: recipientCount || 0,
      status: scheduledFor ? 'scheduled' : 'draft',
      scheduledFor: scheduledFor || null,
      tags: tags || [],
      notes: notes || '',
      createdBy: mockUserId, // Use mock user ID for demo
      sentAt: null,
      sentCount: 0,
      failedCount: 0,
      sentToAll: false
    });

    await campaign.save();

    res.status(201).json({
      success: true,
      message: 'Campaign saved successfully',
      campaign
    });

  } catch (error) {
    console.error('Error saving campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save campaign',
      error: error.message
    });
  }
};

// Get all saved campaigns
const getSavedCampaigns = async (req, res) => {
  try {
    const {
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // For demo, use mock user ID
    const mockUserId = '65d4f8a9e4b0c4a9c1234567';

    // Build query
    const query = { createdBy: mockUserId };
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Search by name or subject
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const campaigns = await EmailCampaign.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await EmailCampaign.countDocuments(query);
    
    // Get stats
    const stats = {
      total: await EmailCampaign.countDocuments({ createdBy: mockUserId }),
      draft: await EmailCampaign.countDocuments({ createdBy: mockUserId, status: 'draft' }),
      sent: await EmailCampaign.countDocuments({ createdBy: mockUserId, status: 'sent' }),
      scheduled: await EmailCampaign.countDocuments({ createdBy: mockUserId, status: 'scheduled' }),
      failed: await EmailCampaign.countDocuments({ createdBy: mockUserId, status: 'failed' })
    };

    res.json({
      success: true,
      campaigns,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      stats
    });

  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaigns',
      error: error.message
    });
  }
};

// Get single campaign by ID
const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;

    // For demo, use mock user ID
    const mockUserId = '65d4f8a9e4b0c4a9c1234567';

    const campaign = await EmailCampaign.findOne({
      _id: id,
      createdBy: mockUserId
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      campaign
    });

  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign',
      error: error.message
    });
  }
};

// Update campaign
const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.createdBy;
    delete updateData.createdAt;

    // For demo, use mock user ID
    const mockUserId = '65d4f8a9e4b0c4a9c1234567';

    const campaign = await EmailCampaign.findOneAndUpdate(
      { _id: id, createdBy: mockUserId },
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      message: 'Campaign updated successfully',
      campaign
    });

  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update campaign',
      error: error.message
    });
  }
};

// Delete campaign
const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    // For demo, use mock user ID
    const mockUserId = '65d4f8a9e4b0c4a9c1234567';

    const campaign = await EmailCampaign.findOneAndDelete({
      _id: id,
      createdBy: mockUserId
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete campaign',
      error: error.message
    });
  }
};

// Duplicate campaign
const duplicateCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    // For demo, use mock user ID
    const mockUserId = '65d4f8a9e4b0c4a9c1234567';

    const originalCampaign = await EmailCampaign.findOne({
      _id: id,
      createdBy: mockUserId
    });

    if (!originalCampaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Create duplicate
    const duplicate = new EmailCampaign({
      ...originalCampaign.toObject(),
      _id: undefined,
      name: `${originalCampaign.name} (Copy)`,
      status: 'draft',
      sentAt: null,
      sentCount: 0,
      failedCount: 0,
      sentToAll: false,
      openRate: 0,
      clickRate: 0,
      bounceRate: 0,
      unsubscribes: 0,
      complaints: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await duplicate.save();

    res.status(201).json({
      success: true,
      message: 'Campaign duplicated successfully',
      campaign: duplicate
    });

  } catch (error) {
    console.error('Error duplicating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate campaign',
      error: error.message
    });
  }
};

// Send campaign (update sent status)
const updateCampaignSentStatus = async (campaignId, results, sentToAll = false) => {
  try {
    const updateData = {
      status: results.failed > 0 ? 'failed' : 'sent',
      sentAt: new Date(),
      sentCount: results.sent,
      failedCount: results.failed,
      sentToAll: sentToAll,
      updatedAt: new Date()
    };

    await EmailCampaign.findByIdAndUpdate(campaignId, updateData);
    
    console.log(`📧 Campaign ${campaignId} sent status updated`);
  } catch (error) {
    console.error('Error updating campaign status:', error);
  }
};

export {
  getEmailTemplates,
  sendTestEmail,
  sendBulkEmails,
  getEmailStats,
  saveCampaign,
  getSavedCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  duplicateCampaign,
  getCampaignAnalytics,
  getRealTimeStats,
  updateCampaignSentStatus
};
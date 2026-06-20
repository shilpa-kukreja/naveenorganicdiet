import express from 'express';
import EmailLog from '../models/emailLogModel.js';
import EmailCampaign from '../models/emailCampaignModel.js';
import mongoose from 'mongoose';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';

const trackingRoutes = express.Router();

// Open tracking endpoint
trackingRoutes.get('/open/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;
    
    // Find email log
    const emailLog = await EmailLog.findOne({ trackingId });
    
    if (!emailLog) {
      console.log('Email log not found for trackingId:', trackingId);
      return res.status(404).send('Not found');
    }

    // Get user info
    const ip = req.headers['x-forwarded-for'] || 
               req.ip || 
               req.connection.remoteAddress || 
               '127.0.0.1';
    
    const cleanIp = ip.includes('::ffff:') ? ip.split(':').pop() : ip;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    // Parse user agent
    const parser = new UAParser(userAgent);
    const deviceInfo = parser.getResult();
    
    // Get location
    let location = 'Unknown';
    try {
      const geo = geoip.lookup(cleanIp);
      if (geo) {
        location = `${geo.city || ''}, ${geo.country || ''}`.trim();
        if (location.endsWith(',')) location = location.slice(0, -1);
      }
    } catch (geoError) {
      console.log('GeoIP error:', geoError.message);
    }

    const deviceString = deviceInfo.browser.name && deviceInfo.os.name 
      ? `${deviceInfo.browser.name} on ${deviceInfo.os.name}`
      : userAgent.substring(0, 50);

    // Update open tracking
    const updateData = {
      status: 'opened',
      $inc: { openedCount: 1 },
      lastOpenedAt: new Date(),
      openedIP: cleanIp,
      openedUserAgent: userAgent,
      openedDevice: deviceString,
      openedLocation: location
    };

    // Set first openedAt if not set
    if (!emailLog.openedAt) {
      updateData.openedAt = new Date();
    }

    await EmailLog.findByIdAndUpdate(emailLog._id, updateData);

    // Update campaign stats
    if (emailLog.campaign) {
      await updateCampaignStats(emailLog.campaign);
    }

    // Return transparent 1x1 pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    });
    
    res.end(pixel);
    
  } catch (error) {
    console.error('Open tracking error:', error);
    
    // Still return pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length
    });
    
    res.end(pixel);
  }
});

// Click tracking endpoint
trackingRoutes.get('/click/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).send('URL required');
    }

    const decodedUrl = decodeURIComponent(url);
    
    const emailLog = await EmailLog.findOne({ trackingId });
    
    if (!emailLog) {
      return res.redirect(decodedUrl);
    }

    // Get user info
    const ip = req.headers['x-forwarded-for'] || 
               req.ip || 
               req.connection.remoteAddress || 
               '127.0.0.1';
    
    const cleanIp = ip.includes('::ffff:') ? ip.split(':').pop() : ip;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    // Parse user agent
    const parser = new UAParser(userAgent);
    const deviceInfo = parser.getResult();
    
    // Get location
    let location = 'Unknown';
    try {
      const geo = geoip.lookup(cleanIp);
      if (geo) {
        location = `${geo.city || ''}, ${geo.country || ''}`.trim();
        if (location.endsWith(',')) location = location.slice(0, -1);
      }
    } catch (geoError) {
      console.log('GeoIP error:', geoError.message);
    }

    const deviceString = deviceInfo.browser.name && deviceInfo.os.name 
      ? `${deviceInfo.browser.name} on ${deviceInfo.os.name}`
      : userAgent.substring(0, 50);

    // Prepare click data
    const clickData = {
      url: decodedUrl,
      clickedAt: new Date(),
      ip: cleanIp,
      userAgent: userAgent,
      device: deviceString,
      location: location,
      clickCount: 1
    };

    // Check if URL already clicked
    const existingClickIndex = emailLog.clicks?.findIndex(click => click.url === decodedUrl);

    if (existingClickIndex >= 0) {
      // Update existing click
      await EmailLog.updateOne(
        { _id: emailLog._id },
        {
          $inc: { 
            [`clicks.${existingClickIndex}.clickCount`]: 1,
            totalClicks: 1
          },
          $set: {
            status: 'clicked',
            [`clicks.${existingClickIndex}.lastClickedAt`]: new Date(),
            [`clicks.${existingClickIndex}.ip`]: cleanIp,
            [`clicks.${existingClickIndex}.userAgent`]: userAgent,
            [`clicks.${existingClickIndex}.device`]: deviceString,
            [`clicks.${existingClickIndex}.location`]: location
          }
        }
      );
    } else {
      // Add new click
      await EmailLog.findByIdAndUpdate(emailLog._id, {
        $push: { clicks: clickData },
        $inc: { totalClicks: 1 },
        $set: { 
          status: 'clicked',
          openedCount: emailLog.openedCount || 1,
          openedAt: emailLog.openedAt || new Date()
        }
      });
    }

    // Update campaign stats
    if (emailLog.campaign) {
      await updateCampaignStats(emailLog.campaign);
    }

    // Redirect to original URL
    res.redirect(decodedUrl);
    
  } catch (error) {
    console.error('Click tracking error:', error);
    
    // Still redirect
    if (req.query.url) {
      try {
        res.redirect(decodeURIComponent(req.query.url));
      } catch (redirectError) {
        res.redirect('/');
      }
    } else {
      res.redirect('/');
    }
  }
});

// Helper function to update campaign stats
const updateCampaignStats = async (campaignId) => {
  try {
    const stats = await EmailLog.aggregate([
      { $match: { campaign: new mongoose.Types.ObjectId(campaignId) } },
      {
        $group: {
          _id: null,
          totalSent: { $sum: 1 },
          openedCount: { 
            $sum: { 
              $cond: [
                { $in: ['$status', ['opened', 'clicked']] },
                1,
                0
              ]
            }
          },
          clickedCount: { 
            $sum: { 
              $cond: [
                { $eq: ['$status', 'clicked'] },
                1,
                0
              ]
            }
          },
          bouncedCount: { 
            $sum: { 
              $cond: [
                { $eq: ['$status', 'bounced'] },
                1,
                0
              ]
            }
          },
          totalOpens: { $sum: { $ifNull: ['$openedCount', 0] } },
          totalClicks: { $sum: { $ifNull: ['$totalClicks', 0] } },
          unsubscribes: {
            $sum: {
              $cond: [
                { $ne: ['$unsubscribedAt', null] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    if (stats.length === 0) return;

    const campaignStats = stats[0];
    const totalSent = campaignStats.totalSent;
    
    const openRate = totalSent > 0 ? (campaignStats.openedCount / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (campaignStats.clickedCount / totalSent) * 100 : 0;
    const bounceRate = totalSent > 0 ? (campaignStats.bouncedCount / totalSent) * 100 : 0;

    await EmailCampaign.findByIdAndUpdate(campaignId, {
      openRate: parseFloat(openRate.toFixed(2)),
      clickRate: parseFloat(clickRate.toFixed(2)),
      bounceRate: parseFloat(bounceRate.toFixed(2)),
      unsubscribes: campaignStats.unsubscribes || 0,
      updatedAt: new Date(),
      $set: {
        'stats.totalOpens': campaignStats.totalOpens || 0,
        'stats.totalClicks': campaignStats.totalClicks || 0,
        'stats.uniqueOpens': campaignStats.openedCount || 0,
        'stats.uniqueClicks': campaignStats.clickedCount || 0
      }
    }, { new: true });
    
  } catch (error) {
    console.error('Error updating campaign stats:', error);
  }
};

// In tracking.js - UPDATE the analytics endpoint

trackingRoutes.get('/analytics/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { hours = 24 } = req.query;
    
    console.log('📊 Analytics request received for:', campaignId);
    console.log('📊 Raw campaignId from params:', campaignId);
    
    // Check if campaignId is provided
    if (!campaignId || campaignId.trim() === '') {
      console.log('❌ Campaign ID is empty or null');
      return res.status(400).json({
        success: false,
        message: 'Campaign ID is required',
        debug: {
          receivedId: campaignId,
          type: typeof campaignId,
          trimmed: campaignId ? campaignId.trim() : 'null'
        }
      });
    }

    // Clean the campaignId
    const cleanedCampaignId = campaignId.trim();
    console.log('📊 Cleaned campaignId:', cleanedCampaignId);

    // Try multiple ways to find the campaign
    let campaign;
    
    // First, try as ObjectId (most common)
    if (mongoose.Types.ObjectId.isValid(cleanedCampaignId)) {
      console.log('✅ Campaign ID appears to be a valid MongoDB ObjectId');
      campaign = await EmailCampaign.findById(cleanedCampaignId).lean();
      
      if (campaign) {
        console.log('✅ Campaign found by ObjectId:', campaign.name);
      }
    }
    
    // If not found by ObjectId, try by name (for debugging)
    if (!campaign) {
      console.log('🔍 Campaign not found by ObjectId, trying by name...');
      campaign = await EmailCampaign.findOne({ 
        name: { $regex: cleanedCampaignId, $options: 'i' } 
      }).lean();
      
      if (campaign) {
        console.log('✅ Campaign found by name:', campaign.name);
      }
    }
    
    // If still not found, list available campaigns
    if (!campaign) {
      console.log('❌ Campaign not found by any method');
      
      // Get list of available campaigns for debugging
      const availableCampaigns = await EmailCampaign.find({})
        .select('_id name sentAt')
        .sort({ sentAt: -1 })
        .limit(10)
        .lean();
      
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
        debug: {
          receivedId: cleanedCampaignId,
          isObjectIdValid: mongoose.Types.ObjectId.isValid(cleanedCampaignId),
          availableCampaigns: availableCampaigns.map(c => ({
            id: c._id,
            name: c.name,
            sentAt: c.sentAt
          }))
        }
      });
    }

    console.log('✅ Campaign confirmed:', campaign._id, campaign.name);
    
    // Calculate time range
    const timeRange = new Date();
    timeRange.setHours(timeRange.getHours() - parseInt(hours));

    console.log('📊 Fetching logs for campaign:', campaign._id);
    
    // Get logs for this campaign
    const logs = await EmailLog.find({ 
      campaign: campaign._id,
      createdAt: { $gte: timeRange }
    }).lean();

    console.log('📊 Logs found:', logs.length);

    // If no logs found, return empty analytics but success
    if (logs.length === 0) {
      console.log('📊 No logs found, returning empty analytics');
      return res.json({
        success: true,
        analytics: {
          overview: {
            totalSent: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
            unsubscribed: 0,
            openRate: 0,
            clickRate: 0,
            ctr: 0
          },
          timeline: {
            opensByHour: Array.from({ length: 24 }, (_, hour) => ({ 
              hour: hour.toString().padStart(2, '0'), 
              count: 0 
            }))
          },
          devices: [],
          locations: [],
          clicks: {
            totalClicks: 0,
            uniqueClicks: 0,
            byUrl: []
          },
          logs: []
        },
        campaignInfo: {
          name: campaign.name,
          id: campaign._id,
          sentAt: campaign.sentAt
        }
      });
    }

    // Calculate basic stats
    const totalSent = logs.length;
    const openedLogs = logs.filter(log => 
      log.status === 'opened' || log.status === 'clicked'
    );
    const clickedLogs = logs.filter(log => log.status === 'clicked');
    const bouncedLogs = logs.filter(log => log.status === 'bounced');
    const unsubscribedLogs = logs.filter(log => log.status === 'unsubscribed');
    
    // Calculate rates
    const openRate = totalSent > 0 ? (openedLogs.length / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (clickedLogs.length / totalSent) * 100 : 0;
    const bounceRate = totalSent > 0 ? (bouncedLogs.length / totalSent) * 100 : 0;
    const ctr = openRate > 0 ? (clickRate / openRate) * 100 : 0;

    // Prepare opens by hour
    const opensByHour = Array.from({ length: 24 }, (_, hour) => ({ 
      hour: hour.toString().padStart(2, '0'), 
      count: 0 
    }));

    openedLogs.forEach(log => {
      if (log.openedAt) {
        try {
          const hour = new Date(log.openedAt).getHours();
          const hourEntry = opensByHour.find(h => parseInt(h.hour) === hour);
          if (hourEntry) {
            hourEntry.count += (log.openedCount || 1);
          }
        } catch (e) {
          console.log('⚠️ Error parsing openedAt:', e.message);
        }
      }
    });

    // Prepare devices data
    const deviceMap = {};
    openedLogs.forEach(log => {
      const device = log.openedDevice || 'Unknown';
      deviceMap[device] = (deviceMap[device] || 0) + 1;
    });
    
    const devices = Object.entries(deviceMap).map(([device, count]) => ({
      device,
      count
    })).slice(0, 5);

    // Prepare locations data
    const locationMap = {};
    openedLogs.forEach(log => {
      const location = log.openedLocation || 'Unknown';
      locationMap[location] = (locationMap[location] || 0) + 1;
    });
    
    const locations = Object.entries(locationMap).map(([location, count]) => ({
      location,
      count
    })).sort((a, b) => b.count - a.count).slice(0, 8);

    // Prepare clicks by URL
    const urlMap = {};
    let totalClicksCount = 0;
    
    clickedLogs.forEach(log => {
      if (log.clicks && Array.isArray(log.clicks)) {
        log.clicks.forEach(click => {
          if (click && click.url) {
            const url = click.url.length > 50 ? 
              click.url.substring(0, 50) + '...' : 
              click.url;
            
            if (!urlMap[url]) {
              urlMap[url] = {
                url: url,
                totalClicks: 0,
                uniqueClicks: 0,
                lastClicked: click.clickedAt
              };
            }
            urlMap[url].totalClicks += (click.clickCount || 1);
            urlMap[url].uniqueClicks += 1;
            totalClicksCount += (click.clickCount || 1);
          }
        });
      }
    });

    const clicksByUrl = Object.values(urlMap).sort((a, b) => 
      b.totalClicks - a.totalClicks
    ).slice(0, 10);

    // Prepare response
    const response = {
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
          ctr: parseFloat(ctr.toFixed(2))
        },
        timeline: {
          opensByHour
        },
        devices,
        locations,
        clicks: {
          totalClicks: totalClicksCount,
          uniqueClicks: clickedLogs.length,
          byUrl: clicksByUrl
        },
        logs: logs.slice(0, 15).map(log => ({
          email: log.email || 'N/A',
          status: log.status || 'sent',
          openedAt: log.openedAt,
          openedCount: log.openedCount || 0,
          totalClicks: log.totalClicks || 0,
          openedDevice: log.openedDevice,
          createdAt: log.createdAt,
          openedLocation: log.openedLocation
        }))
      },
      campaignInfo: {
        name: campaign.name,
        id: campaign._id,
        sentAt: campaign.sentAt,
        subject: campaign.subject
      }
    };

    console.log('✅ Analytics response prepared successfully');
    console.log('📊 Summary:', {
      totalSent: response.analytics.overview.totalSent,
      opened: response.analytics.overview.opened,
      clicked: response.analytics.overview.clicked
    });

    res.json(response);

  } catch (error) {
    console.error('❌ Analytics error:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get campaign analytics',
      error: error.message,
      debug: {
        timestamp: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV
      }
    });
  }
});

// Add this debug endpoint to check campaigns
trackingRoutes.get('/debug/campaigns', async (req, res) => {
  try {
    const campaigns = await EmailCampaign.find({})
      .select('_id name subject sentAt status')
      .sort({ sentAt: -1 })
      .limit(20)
      .lean();
    
    res.json({
      success: true,
      total: campaigns.length,
      campaigns: campaigns.map(c => ({
        id: c._id,
        name: c.name,
        subject: c.subject,
        sentAt: c.sentAt,
        status: c.status
      }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Unsubscribe endpoint
trackingRoutes.get('/unsubscribe/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { reason } = req.query;
    
    const emailLog = await EmailLog.findOne({ trackingId });
    
    if (emailLog) {
      await EmailLog.findByIdAndUpdate(emailLog._id, {
        unsubscribedAt: new Date(),
        unsubscribeReason: reason || 'User requested',
        status: 'unsubscribed'
      });

      if (emailLog.campaign) {
        await EmailCampaign.findByIdAndUpdate(emailLog.campaign, {
          $inc: { unsubscribes: 1 }
        });
      }
    }

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribed Successfully</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .success { color: #28a745; font-size: 24px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="success">✓ Successfully Unsubscribed</div>
          <p>You have been unsubscribed from our marketing emails.</p>
          <p>You may still receive transactional emails related to your account.</p>
          <p><a href="/">Return to homepage</a></p>
        </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).send('Error processing unsubscribe request');
  }
});

export default trackingRoutes;
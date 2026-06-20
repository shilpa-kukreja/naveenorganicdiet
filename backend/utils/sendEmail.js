// utils/sendEmail.js
import nodemailer from "nodemailer";

export const sendAbandonedCartEmail = async (email, restoreLink, items) => {
  try {
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

    // Calculate cart total
    const cartTotal = items.reduce((sum, item) => sum + (item.priceSnapshot * item.quantity), 0);
    
    // Format items list for email
    const itemsList = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <img src="${process.env.FRONTEND_URL}${item.image || '/images/placeholder.jpg'}" 
               alt="${item.name}" 
               width="50" 
               style="border-radius: 5px;">
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.priceSnapshot}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.priceSnapshot * item.quantity}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complete Your Purchase</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                 color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; 
                 font-weight: bold; margin: 20px 0; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 Complete Your Purchase</h1>
            <p>You left items in your cart!</p>
          </div>
          <div class="content">
            <h2>Hi there! 👋</h2>
            <p>We noticed you left some items in your shopping cart at Organic Diet.</p>
            <p>Complete your purchase now before they're gone!</p>
            
            <h3>Your Cart Items:</h3>
            <table class="table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" style="text-align: right; padding: 10px; font-weight: bold;">Total:</td>
                  <td style="padding: 10px; font-weight: bold;">₹${cartTotal}</td>
                </tr>
              </tfoot>
            </table>
            
            <div style="text-align: center;">
              <a href="${restoreLink}" class="btn">Complete Your Order Now</a>
              <p style="font-size: 12px; color: #666;">
                This link will expire in 24 hours.<br>
                Limited stock available - don't miss out!
              </p>
            </div>
          </div>
          <div class="footer">
            <p>If you didn't add these items, please ignore this email.</p>
            <p>© ${new Date().getFullYear()} Organic Diet. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Organic Diet" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Complete Your Order - Items Waiting in Cart 🛒",
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
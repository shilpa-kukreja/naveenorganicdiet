// import { Worker } from 'bullmq';
// import IORedis from 'ioredis';
// import nodemailer from 'nodemailer';
// import dotenv from "dotenv";
// dotenv.config();


// // Create Redis connection for worker
// const connection = new IORedis({
//   host: process.env.REDIS_HOST || '127.0.0.1',  // Use localhost for local dev
//   port: parseInt(process.env.REDIS_PORT) || 6379,
//   maxRetriesPerRequest: null,
//   enableReadyCheck: false,
// });

// // Test Redis connection
// connection.on('connect', () => {
//   console.log('✅ Redis connection established for worker');
// });

// connection.on('error', (error) => {
//   console.error('❌ Redis connection error:', error.message);
// });

// // Email configuration
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });


// console.log("EMAIL_USER =", process.env.EMAIL_USER);
// console.log("EMAIL_PASS =", process.env.EMAIL_PASS ? "Loaded ✔" : "Not Loaded ❌");

// // Helper function to generate email HTML
// const generateEmailHtml = (template, order) => {
//   // Define colors for different statuses
//   const statusColors = {
//     'processing': '#8b5cf6',
//     'shipped': '#3b82f6',
//     'delivered': '#10b981',
//     'cancelled': '#ef4444',
//     'returned': '#f59e0b',
//     'default': '#10b981'
//   };

//   const color = statusColors[order.status?.toLowerCase()] || statusColors.default;
  
//   // Common email template sections
//   const header = (title, color) => `
//     <div class="header" style="background-color: ${color}; padding: 20px; text-align: center;">
//       <h1 style="color: white; margin: 0;">${title}</h1>
//     </div>
//   `;

//   const productItem = (item) => `
//     <div class="product" style="display: flex; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eeeeee;">
//       <img src="${item.image}" alt="${item.name}" class="product-image" style="width: 80px; height: 80px; object-fit: cover; margin-right: 15px; border-radius: 5px;">
//       <div class="product-info" style="flex: 1;">
//         <p style="margin: 0 0 5px 0;"><strong>${item.name}</strong></p>
//         <p style="margin: 0 0 5px 0;">Quantity: ${item.quantity}</p>
//         <p style="margin: 0;">Price: ₹${item.price}</p>
//       </div>
//     </div>
//   `;

//   const addressSection = (address) => `
//     <div style="margin: 20px 0;">
//       <h3 style="margin-bottom: 10px;">Shipping Address</h3>
//       <p style="margin: 5px 0;">
//         ${address.fullName} <br>
//         ${address.company ? address.company + '<br>' : ''}
//         ${address.address1}<br>
//         ${address.address2 ? address.address2 + '<br>' : ''}
//         ${address.city}, ${address.postalCode}<br>
//         ${address.country}<br>
//         Phone: ${address.phone}
//       </p>
//     </div>
//   `;

//   // Template-specific content
//   switch (template) {
//     case 'cod_confirmation':
//       return `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <style>
//             body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f7f7f7; }
//             .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
//             .content { padding: 30px; }
//             .order-details { background-color: #f9fafb; border-radius: 5px; padding: 20px; margin-bottom: 20px; }
//             .summary { background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin-top: 20px; }
//             .cod-notice { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
//             .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
//             .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             ${header('Order Confirmed', '#10b981')}
//             <div class="content">
//               <h2>Thank you for your order!</h2>
//               <p>Hi ${order.address.fullName},</p>
//               <p>Your order has been successfully placed and is now being processed.</p>
              
//               <div class="cod-notice">
//                 <h3>Cash on Delivery</h3>
//                 <p>Please have the exact amount ready when our delivery agent arrives.</p>
//                 <p><strong>Amount to be paid: ₹${order.amount}</strong></p>
//               </div>
              
//               <div class="order-details">
//                 <h3>Order Details</h3>
//                 <p><strong>Order ID:</strong> ${order.orderid}</p>
//                 <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
//                 <p><strong>Payment Method:</strong> Cash on Delivery</p>
                
//                 <h4>Items Ordered</h4>
//                 ${order.items.map(item => productItem(item)).join('')}
                
//                 <div class="summary">
//                   <p><strong>Total Amount: ₹${order.amount}</strong></p>
//                   ${order.couponCode ? `<p>Coupon Applied: ${order.couponCode}</p>` : ''}
//                   ${order.discount > 0 ? `<p>Discount: ₹${order.discount}</p>` : ''}
//                 </div>
//               </div>
              
//               ${addressSection(order.address)}
              
//               <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order.orderid}" class="button">Track Your Order</a>
//             </div>
            
//             <div class="footer">
//               <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
//             </div>
//           </div>
//         </body>
//         </html>
//       `;

//     case 'online_payment_confirmation':
//       return `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <style>
//             /* Same styles as above */
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             ${header('Payment Confirmed', '#10b981')}
//             <div class="content">
//               <h2>Payment Successful!</h2>
//               <p>Hi ${order.address.fullName},</p>
//               <p>Your payment of ₹${order.amount} has been confirmed.</p>
              
//               <div class="order-details">
//                 <h3>Order Details</h3>
//                 <p><strong>Order ID:</strong> ${order.orderid}</p>
//                 <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
//                 <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                
//                 <h4>Items Ordered</h4>
//                 ${order.items.map(item => productItem(item)).join('')}
                
//                 <div class="summary">
//                   <p><strong>Total Amount: ₹${order.amount}</strong></p>
//                   <p>Payment Status: Paid</p>
//                 </div>
//               </div>
              
//               ${addressSection(order.address)}
              
//               <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order.orderid}" class="button">View Order Status</a>
//             </div>
            
//             <div class="footer">
//               <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
//             </div>
//           </div>
//         </body>
//         </html>
//       `;

//     default:
//       return `<p>Email notification for order ${order.orderid}</p>`;
//   }
// };

// // Create worker instance
// const worker = new Worker('emailQueue', async (job) => {
//   const { to, order, template } = job.data;
  
//   console.log(`📧 Processing email job ${job.id} for ${to}`);
  
//   let subject = '';
//   let html = '';
  
//   // Set subject based on template
//   switch (template) {
//     case 'cod_confirmation':
//       subject = `Order Placed - Order #${order.orderid}`;
//       break;
//     case 'online_payment_confirmation':
//       subject = `Payment Confirmed - Order #${order.orderid}`;
//       break;
//     case 'status_update':
//       subject = `Order Status Update - #${order.orderid}`;
//       break;
//   }
  
//   html = generateEmailHtml(template, order);
  
//   const mailOptions = {
//     from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
//     to,
//     subject,
//     html,
//   };
  
//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`✅ Email sent for job ${job.id} to ${to}`);
//     return { success: true, email: to };
//   } catch (error) {
//     console.error(`❌ Failed to send email for job ${job.id}:`, error.message);
//     throw error;
//   }
// }, { 
//   connection,  // Use the IORedis connection
//   concurrency: 5,
//   limiter: {
//     max: 10,
//     duration: 1000, // Max 10 jobs per second
//   }
// });

// // Event listeners
// worker.on('completed', (job) => {
//   console.log(`✅ Email job ${job.id} completed successfully`);
// });

// worker.on('failed', (job, error) => {
//   console.error(`❌ Email job ${job.id} failed:`, error.message);
// });

// worker.on('error', (error) => {
//   console.error('Worker error:', error);
// });

// console.log('📧 Email worker started and listening for jobs...');

// // Handle graceful shutdown
// process.on('SIGTERM', async () => {
//   console.log('SIGTERM received, closing email worker...');
//   await worker.close();
//   await connection.quit();
//   process.exit(0);
// });

// export { worker };




// import { Worker } from 'bullmq';
// import IORedis from 'ioredis';
// import nodemailer from 'nodemailer';
// import dotenv from "dotenv";
// dotenv.config();

// // Create Redis connection for worker
// const connection = new IORedis({
//   host: process.env.REDIS_HOST || '127.0.0.1',
//   port: parseInt(process.env.REDIS_PORT) || 6379,
//   maxRetriesPerRequest: null,
//   enableReadyCheck: false,
// });

// // Test Redis connection
// connection.on('connect', () => {
//   console.log('✅ Redis connection established for worker');
// });

// connection.on('error', (error) => {
//   console.error('❌ Redis connection error:', error.message);
// });

// // Email configuration
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// console.log("EMAIL_USER =", process.env.EMAIL_USER);
// console.log("EMAIL_PASS =", process.env.EMAIL_PASS ? "Loaded ✔" : "Not Loaded ❌");

// // Helper function to generate email HTML
// const generateEmailHtml = (template, order) => {
//   // Define colors for different statuses
//   const statusColors = {
//     'processing': '#8b5cf6',
//     'shipped': '#3b82f6',
//     'delivered': '#10b981',
//     'cancelled': '#ef4444',
//     'returned': '#f59e0b',
//     'default': '#10b981'
//   };

//   const color = statusColors[order.status?.toLowerCase()] || statusColors.default;
  
//   // Professional color palette
//   const colors = {
//     primary: '#4F46E5',      // Indigo
//     secondary: '#10B981',    // Emerald
//     accent: '#F59E0B',       // Amber
//     background: '#F9FAFB',   // Gray 50
//     surface: '#FFFFFF',      // White
//     textPrimary: '#111827',  // Gray 900
//     textSecondary: '#6B7280', // Gray 500
//     border: '#E5E7EB'        // Gray 200
//   };

//   // Common email template sections
//   const header = (title, subtitle, iconColor) => `
//     <div style="background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); padding: 40px 0; text-align: center; border-radius: 8px 8px 0 0;">
//       <div style="background: rgba(255,255,255,0.15); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
//         <svg style="width: 40px; height: 40px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
//         </svg>
//       </div>
//       <h1 style="color: white; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">${title}</h1>
//       ${subtitle ? `<p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">${subtitle}</p>` : ''}
//     </div>
//   `;

//   const productItem = (item) => `
//     <tr>
//       <td style="padding: 16px; border-bottom: 1px solid ${colors.border};">
//         <div style="display: flex; align-items: center;">
//           <div style="width: 60px; height: 60px; border-radius: 8px; overflow: hidden; margin-right: 16px; background: #f3f4f6;">
//             <img src="${item.image || 'https://via.placeholder.com/60x60'}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">
//           </div>
//           <div>
//             <p style="margin: 0 0 4px 0; font-weight: 600; color: ${colors.textPrimary};">${item.name}</p>
//             <p style="margin: 0; font-size: 14px; color: ${colors.textSecondary};">Quantity: ${item.quantity}</p>
//           </div>
//         </div>
//       </td>
//       <td style="padding: 16px; border-bottom: 1px solid ${colors.border}; text-align: right; font-weight: 600; color: ${colors.textPrimary};">
//         ₹${item.price}
//       </td>
//     </tr>
//   `;

//   const addressSection = (address) => `
//     <div style="background: ${colors.surface}; border-radius: 8px; padding: 24px; margin: 24px 0; border: 1px solid ${colors.border};">
//       <h3 style="margin: 0 0 16px 0; color: ${colors.textPrimary}; font-size: 18px; font-weight: 600;">
//         <svg style="width: 20px; height: 20px; margin-right: 8px; vertical-align: middle;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
//           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
//         </svg>
//         Shipping Address
//       </h3>
//       <div style="color: ${colors.textSecondary}; line-height: 1.6;">
//         <p style="margin: 0 0 8px 0; font-weight: 600; color: ${colors.textPrimary};">${address.fullName}</p>
//         ${address.company ? `<p style="margin: 0 0 8px 0;">${address.company}</p>` : ''}
//         <p style="margin: 0 0 8px 0;">${address.address1}</p>
//         ${address.address2 ? `<p style="margin: 0 0 8px 0;">${address.address2}</p>` : ''}
//         <p style="margin: 0 0 8px 0;">${address.city}, ${address.postalCode}</p>
//         <p style="margin: 0 0 8px 0;">${address.country}</p>
//         <p style="margin: 0;">Phone: ${address.phone}</p>
//       </div>
//     </div>
//   `;

//   const orderSummary = (order) => `
//     <div style="background: ${colors.surface}; border-radius: 8px; padding: 24px; margin: 24px 0; border: 1px solid ${colors.border};">
//       <h3 style="margin: 0 0 20px 0; color: ${colors.textPrimary}; font-size: 18px; font-weight: 600;">Order Summary</h3>
//       <table style="width: 100%; border-collapse: collapse;">
//         <tr>
//           <td style="padding: 8px 0; color: ${colors.textSecondary};">Subtotal</td>
//           <td style="padding: 8px 0; text-align: right; font-weight: 500;">₹${order.price}</td>
//         </tr>
//         ${order.discount > 0 ? `
//         <tr>
//           <td style="padding: 8px 0; color: ${colors.textSecondary};">Discount</td>
//           <td style="padding: 8px 0; text-align: right; color: ${colors.secondary}; font-weight: 500;">-₹${order.discount}</td>
//         </tr>
//         ` : ''}
//         ${order.shipping ? `
//         <tr>
//           <td style="padding: 8px 0; color: ${colors.textSecondary};">Shipping</td>
//           <td style="padding: 8px 0; text-align: right; font-weight: 500;">₹${order.shipping}</td>
//         </tr>
//         ` : ''}
//         <tr style="border-top: 2px solid ${colors.border};">
//           <td style="padding: 16px 0 0 0; color: ${colors.textPrimary}; font-weight: 600; font-size: 18px;">Total</td>
//           <td style="padding: 16px 0 0 0; text-align: right; color: ${colors.primary}; font-weight: 700; font-size: 18px;">
//             ₹${order.price - (order.discount || 0) + (order.shipping || 0)}
//           </td>
//         </tr>
//       </table>
//     </div>
//   `;

//   // Template-specific content
//   switch (template) {
//     case 'cod_confirmation':
//       return `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <style>
//             @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
//           </style>
//         </head>
//         <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${colors.background};">
//           <div style="max-width: 600px; margin: 0 auto; background-color: ${colors.surface}; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border-radius: 8px; overflow: hidden;">
//             ${header('Order Confirmed!', `Order #${order.orderid}`, colors.secondary)}
            
//             <div style="padding: 40px;">
//               <div style="text-align: center; margin-bottom: 32px;">
//                 <h2 style="margin: 0 0 16px 0; color: ${colors.textPrimary}; font-size: 24px; font-weight: 700;">Thank You For Your Order!</h2>
//                 <p style="color: ${colors.textSecondary}; margin: 0; line-height: 1.6;">Hi ${order.address.fullName}, your order has been successfully placed and is now being processed.</p>
//               </div>
              
//               <!-- COD Notice -->
//               <div style="background: linear-gradient(135deg, ${colors.accent}15 0%, ${colors.accent}05 100%); border-left: 4px solid ${colors.accent}; padding: 20px; border-radius: 8px; margin-bottom: 32px;">
//                 <div style="display: flex; align-items: center; margin-bottom: 12px;">
//                   <svg style="width: 24px; height: 24px; margin-right: 12px; color: ${colors.accent};" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
//                   </svg>
//                   <h3 style="margin: 0; color: ${colors.textPrimary}; font-size: 18px; font-weight: 600;">Cash on Delivery</h3>
//                 </div>
//                 <p style="margin: 0 0 12px 0; color: ${colors.textSecondary};">Please have the exact amount ready when our delivery agent arrives.</p>
//                 <div style="background: white; padding: 16px; border-radius: 6px; text-align: center;">
//                   <p style="margin: 0; font-size: 14px; color: ${colors.textSecondary};">Amount to be paid</p>
//                   <p style="margin: 4px 0 0 0; font-size: 28px; font-weight: 700; color: ${colors.accent};">₹${order.amount}</p>
//                 </div>
//               </div>
              
//               <!-- Order Details -->
//               <div style="background: ${colors.surface}; border-radius: 8px; padding: 24px; margin-bottom: 32px; border: 1px solid ${colors.border};">
//                 <h3 style="margin: 0 0 20px 0; color: ${colors.textPrimary}; font-size: 18px; font-weight: 600;">Order Details</h3>
                
//                 <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
//                   <div>
//                     <p style="margin: 0 0 4px 0; font-size: 14px; color: ${colors.textSecondary};">Order ID</p>
//                     <p style="margin: 0; font-weight: 600; color: ${colors.textPrimary};">${order.orderid}</p>
//                   </div>
//                   <div>
//                     <p style="margin: 0 0 4px 0; font-size: 14px; color: ${colors.textSecondary};">Order Date</p>
//                     <p style="margin: 0; font-weight: 600; color: ${colors.textPrimary};">${new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
//                   </div>
//                   <div>
//                     <p style="margin: 0 0 4px 0; font-size: 14px; color: ${colors.textSecondary};">Payment Method</p>
//                     <p style="margin: 0; font-weight: 600; color: ${colors.textPrimary};">Cash on Delivery</p>
//                   </div>
//                   <div>
//                     <p style="margin: 0 0 4px 0; font-size: 14px; color: ${colors.textSecondary};">Status</p>
//                     <span style="background: ${colors.secondary}15; color: ${colors.secondary}; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">Processing</span>
//                   </div>
//                 </div>
                
//                 <!-- Order Items -->
//                 <h4 style="margin: 24px 0 16px 0; color: ${colors.textPrimary}; font-size: 16px; font-weight: 600;">Items Ordered</h4>
//                 <table style="width: 100%; border-collapse: collapse;">
//                   <thead>
//                     <tr>
//                       <th style="text-align: left; padding: 12px 16px; background: ${colors.background}; color: ${colors.textSecondary}; font-weight: 500; border-radius: 6px 6px 0 0;">Product</th>
//                       <th style="text-align: right; padding: 12px 16px; background: ${colors.background}; color: ${colors.textSecondary}; font-weight: 500; border-radius: 6px 6px 0 0;">Price</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     ${order.items.map(item => productItem(item)).join('')}
//                   </tbody>
//                 </table>
                
//                 ${orderSummary(order)}
//               </div>
              
//               ${addressSection(order.address)}
              
//               <!-- CTA Button -->
//               <div style="text-align: center; margin-top: 32px;">
//                 <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order.orderid}" 
//                    style="display: inline-block; background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); transition: all 0.3s ease;">
//                   Track Your Order
//                 </a>
//                 <p style="margin: 16px 0 0 0; color: ${colors.textSecondary}; font-size: 14px;">
//                   You can also track your order from your account dashboard.
//                 </p>
//               </div>
//             </div>
            
//             <!-- Footer -->
//             <div style="background: ${colors.background}; padding: 32px 40px; text-align: center; border-top: 1px solid ${colors.border};">
//               <div style="max-width: 400px; margin: 0 auto;">
//                 <p style="margin: 0 0 16px 0; color: ${colors.textSecondary}; font-size: 14px;">
//                   Need help? Contact our support team at 
//                   <a href="mailto:support@yourcompany.com" style="color: ${colors.primary}; text-decoration: none;">support@yourcompany.com</a>
//                 </p>
//                 <div style="margin: 24px 0;">
//                   <a href="#" style="margin: 0 8px; display: inline-block;">
//                     <img src="https://cdn-icons-png.flaticon.com/512/1384/1384005.png" alt="Facebook" style="width: 24px; height: 24px; opacity: 0.7;">
//                   </a>
//                   <a href="#" style="margin: 0 8px; display: inline-block;">
//                     <img src="https://cdn-icons-png.flaticon.com/512/1384/1384017.png" alt="Twitter" style="width: 24px; height: 24px; opacity: 0.7;">
//                   </a>
//                   <a href="#" style="margin: 0 8px; display: inline-block;">
//                     <img src="https://cdn-icons-png.flaticon.com/512/1384/1384015.png" alt="Instagram" style="width: 24px; height: 24px; opacity: 0.7;">
//                   </a>
//                 </div>
//                 <p style="margin: 0; color: ${colors.textSecondary}; font-size: 12px;">
//                   © ${new Date().getFullYear()} Your Company Name. All rights reserved.<br>
//                   This is an automated email, please do not reply.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </body>
//         </html>
//       `;

//     case 'online_payment_confirmation':
//       return `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <style>
//             @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
//           </style>
//         </head>
//         <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${colors.background};">
//           <div style="max-width: 600px; margin: 0 auto; background-color: ${colors.surface}; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border-radius: 8px; overflow: hidden;">
//             ${header('Payment Confirmed!', `Your payment of ₹${order.amount} was successful`, colors.secondary)}
            
//             <div style="padding: 40px;">
//               <div style="text-align: center; margin-bottom: 32px;">
//                 <div style="width: 80px; height: 80px; background: ${colors.secondary}15; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
//                   <svg style="width: 40px; height: 40px; color: ${colors.secondary};" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                   </svg>
//                 </div>
//                 <h2 style="margin: 0 0 16px 0; color: ${colors.textPrimary}; font-size: 24px; font-weight: 700;">Payment Successful!</h2>
//                 <p style="color: ${colors.textSecondary}; margin: 0; line-height: 1.6;">Hi ${order.address.fullName}, your payment has been confirmed and your order is being processed.</p>
//               </div>
              
//               <!-- Payment Confirmation -->
//               <div style="background: ${colors.surface}; border-radius: 8px; padding: 24px; margin-bottom: 32px; border: 1px solid ${colors.border};">
//                 <h3 style="margin: 0 0 20px 0; color: ${colors.textPrimary}; font-size: 18px; font-weight: 600;">Payment Details</h3>
                
//                 <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
//                   <div>
//                     <p style="margin: 0 0 4px 0; font-size: 14px; color: ${colors.textSecondary};">Transaction ID</p>
//                     <p style="margin: 0; font-weight: 600; color: ${colors.textPrimary};">${order.transactionId || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <p style="margin: 0 0 4px 0; font-size: 14px; color: ${colors.textSecondary};">Amount Paid</p>
//                     <p style="margin: 0; font-weight: 600; color: ${colors.primary}; font-size: 18px;">₹${order.amount}</p>
//                   </div>
//                   <div>
//                     <p style="margin: 0 0 4px 0; font-size: 14px; color: ${colors.textSecondary};">Payment Method</p>
//                     <p style="margin: 0; font-weight: 600; color: ${colors.textPrimary};">${order.paymentMethod || 'Online Payment'}</p>
//                   </div>
//                   <div>
//                     <p style="margin: 0 0 4px 0; font-size: 14px; color: ${colors.textSecondary};">Payment Status</p>
//                     <span style="background: ${colors.secondary}15; color: ${colors.secondary}; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">Paid</span>
//                   </div>
//                 </div>
                
//                 <!-- Order Items -->
//                 <h4 style="margin: 24px 0 16px 0; color: ${colors.textPrimary}; font-size: 16px; font-weight: 600;">Order Summary</h4>
//                 <table style="width: 100%; border-collapse: collapse;">
//                   <thead>
//                     <tr>
//                       <th style="text-align: left; padding: 12px 16px; background: ${colors.background}; color: ${colors.textSecondary}; font-weight: 500; border-radius: 6px 6px 0 0;">Product</th>
//                       <th style="text-align: right; padding: 12px 16px; background: ${colors.background}; color: ${colors.textSecondary}; font-weight: 500; border-radius: 6px 6px 0 0;">Price</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     ${order.items.map(item => productItem(item)).join('')}
//                   </tbody>
//                 </table>
                
//                 ${orderSummary(order)}
//               </div>
              
//               ${addressSection(order.address)}
              
//               <!-- Next Steps -->
//               <div style="background: ${colors.primary}05; border-radius: 8px; padding: 24px; margin: 32px 0;">
//                 <h3 style="margin: 0 0 16px 0; color: ${colors.primary}; font-size: 18px; font-weight: 600;">What's Next?</h3>
//                 <div style="display: grid; gap: 16px;">
//                   <div style="display: flex; align-items: flex-start;">
//                     <div style="background: ${colors.primary}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">1</div>
//                     <div>
//                       <p style="margin: 0 0 4px 0; font-weight: 600; color: ${colors.textPrimary};">Order Processing</p>
//                       <p style="margin: 0; color: ${colors.textSecondary}; font-size: 14px;">We'll prepare your items for shipping within 24 hours.</p>
//                     </div>
//                   </div>
//                   <div style="display: flex; align-items: flex-start;">
//                     <div style="background: ${colors.primary}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">2</div>
//                     <div>
//                       <p style="margin: 0 0 4px 0; font-weight: 600; color: ${colors.textPrimary};">Shipping</p>
//                       <p style="margin: 0; color: ${colors.textSecondary}; font-size: 14px;">You'll receive tracking information once your order ships.</p>
//                     </div>
//                   </div>
//                   <div style="display: flex; align-items: flex-start;">
//                     <div style="background: ${colors.primary}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">3</div>
//                     <div>
//                       <p style="margin: 0 0 4px 0; font-weight: 600; color: ${colors.textPrimary};">Delivery</p>
//                       <p style="margin: 0; color: ${colors.textSecondary}; font-size: 14px;">Estimated delivery in 3-7 business days.</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               <!-- CTA Button -->
//               <div style="text-align: center; margin-top: 32px;">
//                 <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order.orderid}" 
//                    style="display: inline-block; background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
//                   View Order Status
//                 </a>
//                 <p style="margin: 16px 0 0 0; color: ${colors.textSecondary}; font-size: 14px;">
//                   We'll notify you when your order ships.
//                 </p>
//               </div>
//             </div>
            
//             <!-- Footer -->
//             <div style="background: ${colors.background}; padding: 32px 40px; text-align: center; border-top: 1px solid ${colors.border};">
//               <div style="max-width: 400px; margin: 0 auto;">
//                 <p style="margin: 0 0 16px 0; color: ${colors.textSecondary}; font-size: 14px;">
//                   Questions about your order? <a href="mailto:support@yourcompany.com" style="color: ${colors.primary}; text-decoration: none;">Contact Support</a>
//                 </p>
//                 <p style="margin: 0; color: ${colors.textSecondary}; font-size: 12px;">
//                   © ${new Date().getFullYear()} Your Company Name. All rights reserved.<br>
//                   This is an automated email, please do not reply.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </body>
//         </html>
//       `;

//     default:
//       // Fallback template
//       return `
//         <!DOCTYPE html>
//         <html>
//         <body>
//           <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
//             ${header('Order Notification', `Order #${order.orderid}`, colors.primary)}
//             <div style="padding: 40px;">
//               <p>Email notification for order ${order.orderid}</p>
//             </div>
//           </div>
//         </body>
//         </html>
//       `;
//   }
// };

// // Create worker instance
// const worker = new Worker('emailQueue', async (job) => {
//   const { to, order, template } = job.data;
  
//   console.log(`📧 Processing email job ${job.id} for ${to}`);
  
//   let subject = '';
  
//   // Set subject based on template
//   switch (template) {
//     case 'cod_confirmation':
//       subject = `Order Confirmed - #${order.orderid} - Your Company Name`;
//       break;
//     case 'online_payment_confirmation':
//       subject = `Payment Successful - Order #${order.orderid} - Your Company Name`;
//       break;
//     case 'status_update':
//       subject = `Update on Your Order #${order.orderid} - Your Company Name`;
//       break;
//   }
  
//   const html = generateEmailHtml(template, order);
  
//   const mailOptions = {
//     from: `"Your Company Name" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     html,
//   };
  
//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`✅ Email sent for job ${job.id} to ${to}`);
//     return { success: true, email: to };
//   } catch (error) {
//     console.error(`❌ Failed to send email for job ${job.id}:`, error.message);
//     throw error;
//   }
// }, { 
//   connection,
//   concurrency: 5,
//   limiter: {
//     max: 10,
//     duration: 1000,
//   }
// });

// // Event listeners
// worker.on('completed', (job) => {
//   console.log(`✅ Email job ${job.id} completed successfully`);
// });

// worker.on('failed', (job, error) => {
//   console.error(`❌ Email job ${job.id} failed:`, error.message);
// });

// worker.on('error', (error) => {
//   console.error('Worker error:', error);
// });

// console.log('📧 Email worker started and listening for jobs...');

// // Handle graceful shutdown
// process.on('SIGTERM', async () => {
//   console.log('SIGTERM received, closing email worker...');
//   await worker.close();
//   await connection.quit();
//   process.exit(0);
// });

// export { worker };




import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

// Create Redis connection for worker
const connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Test Redis connection
connection.on('connect', () => {
  console.log('✅ Redis connection established for worker');
});

connection.on('error', (error) => {
  console.error('❌ Redis connection error:', error.message);
});

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log("EMAIL_PASS =", process.env.EMAIL_PASS ? "Loaded ✔" : "Not Loaded ❌");

// Helper function to generate email HTML
const generateEmailHtml = (template, order) => {
  // Define colors for different statuses
  const statusColors = {
    'processing': '#8b5cf6',
    'shipped': '#3b82f6',
    'delivered': '#10b981',
    'cancelled': '#ef4444',
    'returned': '#f59e0b',
    'default': '#10b981'
  };

  const color = statusColors[order.status?.toLowerCase()] || statusColors.default;
  
  // Professional color palette
  const colors = {
    primary: '#4F46E5',      // Indigo
    secondary: '#10B981',    // Emerald
    accent: '#F59E0B',       // Amber
    background: '#F9FAFB',   // Gray 50
    surface: '#FFFFFF',      // White
    textPrimary: '#111827',  // Gray 900
    textSecondary: '#6B7280', // Gray 500
    border: '#E5E7EB'        // Gray 200
  };

  // Common email template sections
  const header = (title, subtitle, iconColor) => `
    <div style="background: linear-gradient(135deg, ${iconColor || colors.primary} 0%, ${iconColor ? colors.secondary : colors.secondary} 100%); padding: 40px 0; text-align: center; border-radius: 8px 8px 0 0;">
      <div style="background: rgba(255,255,255,0.15); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
        <svg style="width: 40px; height: 40px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h1 style="color: white; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">${title}</h1>
      ${subtitle ? `<p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">${subtitle}</p>` : ''}
    </div>
  `;

  const productItem = (item) => `
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid ${colors.border};">
        <div style="display: flex; align-items: center;">
          <div style="width: 60px; height: 60px; border-radius: 8px; overflow: hidden; margin-right: 16px; background: #f3f4f6;">
            <img src="${item.image || 'https://via.placeholder.com/60x60'}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div>
            <p style="margin: 0 0 4px 0; font-weight: 600; color: ${colors.textPrimary};">${item.name}</p>
            <p style="margin: 0; font-size: 14px; color: ${colors.textSecondary};">Quantity: ${item.quantity}</p>
          </div>
        </div>
      </td>
      <td style="padding: 16px; border-bottom: 1px solid ${colors.border}; text-align: right; font-weight: 600; color: ${colors.textPrimary};">
        ₹${item.price}
      </td>
    </tr>
  `;

  const addressSection = (address) => `
    <div style="background: ${colors.surface}; border-radius: 8px; padding: 24px; margin: 24px 0; border: 1px solid ${colors.border};">
      <h3 style="margin: 0 0 16px 0; color: ${colors.textPrimary}; font-size: 18px; font-weight: 600;">
        <svg style="width: 20px; height: 20px; margin-right: 8px; vertical-align: middle;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        Shipping Address
      </h3>
      <div style="color: ${colors.textSecondary}; line-height: 1.6;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: ${colors.textPrimary};">${address.fullName}</p>
        ${address.company ? `<p style="margin: 0 0 8px 0;">${address.company}</p>` : ''}
        <p style="margin: 0 0 8px 0;">${address.address1}</p>
        ${address.address2 ? `<p style="margin: 0 0 8px 0;">${address.address2}</p>` : ''}
        <p style="margin: 0 0 8px 0;">${address.city}, ${address.postalCode}</p>
        <p style="margin: 0 0 8px 0;">${address.country}</p>
        <p style="margin: 0;">Phone: ${address.phone}</p>
      </div>
    </div>
  `;

  const orderSummary = (order) => `
    <div style="background: ${colors.surface}; border-radius: 8px; padding: 24px; margin: 24px 0; border: 1px solid ${colors.border};">
      <h3 style="margin: 0 0 20px 0; color: ${colors.textPrimary}; font-size: 18px; font-weight: 600;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: ${colors.textSecondary};">Subtotal</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 500;">₹${order.price}</td>
        </tr>
        ${order.discount > 0 ? `
        <tr>
          <td style="padding: 8px 0; color: ${colors.textSecondary};">Discount</td>
          <td style="padding: 8px 0; text-align: right; color: ${colors.secondary}; font-weight: 500;">-₹${order.discount}</td>
        </tr>
        ` : ''}
        ${order.shipping ? `
        <tr>
          <td style="padding: 8px 0; color: ${colors.textSecondary};">Shipping</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 500;">₹${order.shipping}</td>
        </tr>
        ` : ''}
        <tr style="border-top: 2px solid ${colors.border};">
          <td style="padding: 16px 0 0 0; color: ${colors.textPrimary}; font-weight: 600; font-size: 18px;">Total</td>
          <td style="padding: 16px 0 0 0; text-align: right; color: ${colors.primary}; font-weight: 700; font-size: 18px;">
            ₹${order.price - (order.discount || 0) + (order.shipping || 0)}
          </td>
        </tr>
      </table>
    </div>
  `;

  // Status-specific configurations
  const statusConfig = {
    'processing': {
      title: 'Order Processing',
      subtitle: 'We\'re preparing your order',
      iconColor: '#8b5cf6',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      message: 'We\'ve received your order and are preparing it for shipment.',
      instructions: 'You\'ll receive another notification when your order ships. Typically, orders are processed within 24-48 hours.',
      buttonText: 'View Order Details',
      buttonUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order.orderid}`
    },
    'shipped': {
      title: 'Order Shipped!',
      subtitle: 'Your order is on the way',
      iconColor: '#3b82f6',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      message: 'Your order has been shipped and is on its way to you!',
      instructions: 'You can track your package using the tracking information below. Expected delivery date is within 3-5 business days.',
      buttonText: 'Track Package',
      buttonUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/tracking/${order.orderid}`,
      trackingInfo: `<p><strong>Tracking Number:</strong> TRK-${order.orderid.slice(-8).toUpperCase()}</p>
                     <p><strong>Carrier:</strong> Standard Shipping</p>`
    },
    'delivered': {
      title: 'Order Delivered!',
      subtitle: 'Your order has arrived',
      iconColor: '#10b981',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      message: 'Your order has been successfully delivered!',
      instructions: 'We hope you\'re enjoying your products. Thank you for shopping with us!',
      buttonText: 'Rate Your Purchase',
      buttonUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/review/${order.orderid}`
    },
    'cancelled': {
      title: 'Order Cancelled',
      subtitle: 'Your order has been cancelled',
      iconColor: '#ef4444',
      icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      message: 'Your order has been cancelled as requested.',
      instructions: 'If this was a mistake or if you have any questions, please contact our customer support team immediately.',
      buttonText: 'Contact Support',
      buttonUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/contact`
    },
    'returned': {
      title: 'Return Processed',
      subtitle: 'Your return request has been processed',
      iconColor: '#f59e0b',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      message: 'Your return request has been processed successfully.',
      instructions: 'Please allow 5-7 business days for the refund to be processed to your original payment method. You will receive an email confirmation once the refund is initiated.',
      buttonText: 'Track Return',
      buttonUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/returns/${order.orderid}`,
      returnInfo: `<p><strong>Return ID:</strong> RTN-${order.orderid.slice(-8).toUpperCase()}</p>
                   <p><strong>Refund Method:</strong> Original payment method</p>
                   <p><strong>Processing Time:</strong> 5-7 business days</p>`
    }
  };

  // Get status config
  const status = order.status?.toLowerCase() || 'processing';
  const config = statusConfig[status] || statusConfig['processing'];

  // Template-specific content
  switch (template) {
    case 'cod_confirmation':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${colors.background};">
          <div style="max-width: 600px; margin: 0 auto; background-color: ${colors.surface}; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border-radius: 8px; overflow: hidden;">
            ${header('Order Confirmed!', `Order #${order.orderid}`, colors.secondary)}
            
            <div style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <h2 style="margin: 0 0 16px 0; color: ${colors.textPrimary}; font-size: 24px; font-weight: 700;">Thank You For Your Order!</h2>
                <p style="color: ${colors.textSecondary}; margin: 0; line-height: 1.6;">Hi ${order.address.fullName}, your order has been successfully placed and is now being processed.</p>
              </div>
              
              <!-- COD Notice -->
              <div style="background: linear-gradient(135deg, ${colors.accent}15 0%, ${colors.accent}05 100%); border-left: 4px solid ${colors.accent}; padding: 20px; border-radius: 8px; margin-bottom: 32px;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <svg style="width: 24px; height: 24px; margin-right: 12px; color: ${colors.accent};" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <h3 style="margin: 0; color: ${colors.textPrimary}; font-size: 18px; font-weight: 600;">Cash on Delivery</h3>
                </div>
                <p style="margin: 0 0 12px 0; color: ${colors.textSecondary};">Please have the exact amount ready when our delivery agent arrives.</p>
                <div style="background: white; padding: 16px; border-radius: 6px; text-align: center;">
                  <p style="margin: 0; font-size: 14px; color: ${colors.textSecondary};">Amount to be paid</p>
                  <p style="margin: 4px 0 0 0; font-size: 28px; font-weight: 700; color: ${colors.accent};">₹${order.amount}</p>
                </div>
              </div>
              
              <!-- Order Details -->
              <div style="background: ${colors.surface}; border-radius: 8px; padding: 24px; margin-bottom: 32px; border: 1px solid ${colors.border};">
                <h3 style="margin: 0 0 20px 0; color: ${colors.textPrimary}; font-size: 18px; font-weight: 600;">Order Details</h3>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                  <div>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: ${colors.textSecondary};">Order ID</p>
                    <p style="margin: 0; font-weight: 600; color: ${colors.textPrimary};">${order.orderid}</p>
                  </div>
                  <div>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: ${colors.textSecondary};">Order Date</p>
                    <p style="margin: 0; font-weight: 600; color: ${colors.textPrimary};">${new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: ${colors.textSecondary};">Payment Method</p>
                    <p style="margin: 0; font-weight: 600; color: ${colors.textPrimary};">Cash on Delivery</p>
                  </div>
                  <div>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: ${colors.textSecondary};">Status</p>
                    <span style="background: ${colors.secondary}15; color: ${colors.secondary}; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">Processing</span>
                  </div>
                </div>
                
                <!-- Order Items -->
                <h4 style="margin: 24px 0 16px 0; color: ${colors.textPrimary}; font-size: 16px; font-weight: 600;">Items Ordered</h4>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr>
                      <th style="text-align: left; padding: 12px 16px; background: ${colors.background}; color: ${colors.textSecondary}; font-weight: 500; border-radius: 6px 6px 0 0;">Product</th>
                      <th style="text-align: right; padding: 12px 16px; background: ${colors.background}; color: ${colors.textSecondary}; font-weight: 500; border-radius: 6px 6px 0 0;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${order.items.map(item => productItem(item)).join('')}
                  </tbody>
                </table>
                
                ${orderSummary(order)}
              </div>
              
              ${addressSection(order.address)}
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 32px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order.orderid}" 
                   style="display: inline-block; background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); transition: all 0.3s ease;">
                  Track Your Order
                </a>
                <p style="margin: 16px 0 0 0; color: ${colors.textSecondary}; font-size: 14px;">
                  You can also track your order from your account dashboard.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: ${colors.background}; padding: 32px 40px; text-align: center; border-top: 1px solid ${colors.border};">
              <div style="max-width: 400px; margin: 0 auto;">
                <p style="margin: 0 0 16px 0; color: ${colors.textSecondary}; font-size: 14px;">
                  Need help? Contact our support team at 
                  <a href="mailto:support@yourcompany.com" style="color: ${colors.primary}; text-decoration: none;">support@yourcompany.com</a>
                </p>
                <div style="margin: 24px 0;">
                  <a href="#" style="margin: 0 8px; display: inline-block;">
                    <img src="https://cdn-icons-png.flaticon.com/512/1384/1384005.png" alt="Facebook" style="width: 24px; height: 24px; opacity: 0.7;">
                  </a>
                  <a href="#" style="margin: 0 8px; display: inline-block;">
                    <img src="https://cdn-icons-png.flaticon.com/512/1384/1384017.png" alt="Twitter" style="width: 24px; height: 24px; opacity: 0.7;">
                  </a>
                  <a href="#" style="margin: 0 8px; display: inline-block;">
                    <img src="https://cdn-icons-png.flaticon.com/512/1384/1384015.png" alt="Instagram" style="width: 24px; height: 24px; opacity: 0.7;">
                  </a>
                </div>
                <p style="margin: 0; color: ${colors.textSecondary}; font-size: 12px;">
                  © ${new Date().getFullYear()} ORGANIC DIET. All rights reserved.<br>
                  This is an automated email, please do not reply.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'online_payment_confirmation':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${colors.background};">
          <div style="max-width: 600px; margin: 0 auto; background-color: ${colors.surface}; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border-radius: 8px; overflow: hidden;">
            ${header('Payment Confirmed!', `Your payment of ₹${order.amount} was successful`, colors.secondary)}
            
            <div style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="width: 80px; height: 80px; background: ${colors.secondary}15; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                  <svg style="width: 40px; height: 40px; color: ${colors.secondary};" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h2 style="margin: 0 0 16px 0; color: ${colors.textPrimary}; font-size: 24px; font-weight: 700;">Payment Successful!</h2>
                <p style="color: ${colors.textSecondary}; margin: 0; line-height: 1.6;">Hi ${order.address.fullName}, your payment has been confirmed and your order is being processed.</p>
              </div>
              
              <!-- Payment Confirmation -->
              <div style="background: ${colors.surface}; border-radius: 8px; padding: 24px; margin-bottom: 32px; border: 1px solid ${colors.border};">
                <h3 style="margin: 0 0 20px 0; color: ${colors.textPrimary}; font-size: 18px; font-weight: 600;">Payment Details</h3>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                  <div>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: ${colors.textSecondary};">Transaction ID</p>
                    <p style="margin: 0; font-weight: 600; color: ${colors.textPrimary};">${order.transactionId || 'N/A'}</p>
                  </div>
                  <div>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: ${colors.textSecondary};">Amount Paid</p>
                    <p style="margin: 0; font-weight: 600; color: ${colors.primary}; font-size: 18px;">₹${order.amount}</p>
                  </div>
                  <div>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: ${colors.textSecondary};">Payment Method</p>
                    <p style="margin: 0; font-weight: 600; color: ${colors.textPrimary};">${order.paymentMethod || 'Online Payment'}</p>
                  </div>
                  <div>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: ${colors.textSecondary};">Payment Status</p>
                    <span style="background: ${colors.secondary}15; color: ${colors.secondary}; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">Paid</span>
                  </div>
                </div>
                
                <!-- Order Items -->
                <h4 style="margin: 24px 0 16px 0; color: ${colors.textPrimary}; font-size: 16px; font-weight: 600;">Order Summary</h4>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr>
                      <th style="text-align: left; padding: 12px 16px; background: ${colors.background}; color: ${colors.textSecondary}; font-weight: 500; border-radius: 6px 6px 0 0;">Product</th>
                      <th style="text-align: right; padding: 12px 16px; background: ${colors.background}; color: ${colors.textSecondary}; font-weight: 500; border-radius: 6px 6px 0 0;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${order.items.map(item => productItem(item)).join('')}
                  </tbody>
                </table>
                
                ${orderSummary(order)}
              </div>
              
              ${addressSection(order.address)}
              
              <!-- Next Steps -->
              <div style="background: ${colors.primary}05; border-radius: 8px; padding: 24px; margin: 32px 0;">
                <h3 style="margin: 0 0 16px 0; color: ${colors.primary}; font-size: 18px; font-weight: 600;">What's Next?</h3>
                <div style="display: grid; gap: 16px;">
                  <div style="display: flex; align-items: flex-start;">
                    <div style="background: ${colors.primary}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">1</div>
                    <div>
                      <p style="margin: 0 0 4px 0; font-weight: 600; color: ${colors.textPrimary};">Order Processing</p>
                      <p style="margin: 0; color: ${colors.textSecondary}; font-size: 14px;">We'll prepare your items for shipping within 24 hours.</p>
                    </div>
                  </div>
                  <div style="display: flex; align-items: flex-start;">
                    <div style="background: ${colors.primary}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">2</div>
                    <div>
                      <p style="margin: 0 0 4px 0; font-weight: 600; color: ${colors.textPrimary};">Shipping</p>
                      <p style="margin: 0; color: ${colors.textSecondary}; font-size: 14px;">You'll receive tracking information once your order ships.</p>
                    </div>
                  </div>
                  <div style="display: flex; align-items: flex-start;">
                    <div style="background: ${colors.primary}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">3</div>
                    <div>
                      <p style="margin: 0 0 4px 0; font-weight: 600; color: ${colors.textPrimary};">Delivery</p>
                      <p style="margin: 0; color: ${colors.textSecondary}; font-size: 14px;">Estimated delivery in 3-7 business days.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 32px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order.orderid}" 
                   style="display: inline-block; background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
                  View Order Status
                </a>
                <p style="margin: 16px 0 0 0; color: ${colors.textSecondary}; font-size: 14px;">
                  We'll notify you when your order ships.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: ${colors.background}; padding: 32px 40px; text-align: center; border-top: 1px solid ${colors.border};">
              <div style="max-width: 400px; margin: 0 auto;">
                <p style="margin: 0 0 16px 0; color: ${colors.textSecondary}; font-size: 14px;">
                  Questions about your order? <a href="mailto:support@yourcompany.com" style="color: ${colors.primary}; text-decoration: none;">Contact Support</a>
                </p>
                <p style="margin: 0; color: ${colors.textSecondary}; font-size: 12px;">
                  © ${new Date().getFullYear()} ORGANIC DIET. All rights reserved.<br>
                  This is an automated email, please do not reply.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'status_update':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${colors.background};">
          <div style="max-width: 600px; margin: 0 auto; background-color: ${colors.surface}; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border-radius: 8px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, ${config.iconColor} 0%, ${colors.secondary} 100%); padding: 40px 0; text-align: center; border-radius: 8px 8px 0 0;">
              <div style="background: rgba(255,255,255,0.15); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <svg style="width: 40px; height: 40px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${config.icon}"></path>
                </svg>
              </div>
              <h1 style="color: white; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">${config.title}</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">${config.subtitle} - Order #${order.orderid}</p>
            </div>
            
            <div style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <h2 style="margin: 0 0 16px 0; color: ${colors.textPrimary}; font-size: 24px; font-weight: 700;">Order Status Updated</h2>
                <p style="color: ${colors.textSecondary}; margin: 0; line-height: 1.6;">Hi ${order.address.fullName}, your order status has been updated.</p>
              </div>
              
              <!-- Status Update -->
              <div style="background: ${config.iconColor}15; border-left: 4px solid ${config.iconColor}; padding: 20px; border-radius: 8px; margin-bottom: 32px;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <svg style="width: 24px; height: 24px; margin-right: 12px; color: ${config.iconColor};" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${config.icon}"></path>
                  </svg>
                  <h3 style="margin: 0; color: ${colors.textPrimary}; font-size: 18px; font-weight: 600;">Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</h3>
                </div>
                <p style="margin: 0 0 12px 0; color: ${colors.textSecondary};">${config.message}</p>
                ${config.instructions ? `<p style="margin: 0; color: ${colors.textSecondary};">${config.instructions}</p>` : ''}
                
                ${config.trackingInfo ? `
                <div style="background: white; padding: 16px; border-radius: 6px; margin-top: 16px;">
                  <h4 style="margin: 0 0 12px 0; color: ${colors.textPrimary}; font-size: 16px; font-weight: 600;">Tracking Information</h4>
                  ${config.trackingInfo}
                </div>
                ` : ''}
                
                ${config.returnInfo ? `
                <div style="background: white; padding: 16px; border-radius: 6px; margin-top: 16px;">
                  <h4 style="margin: 0 0 12px 0; color: ${colors.textPrimary}; font-size: 16px; font-weight: 600;">Return Details</h4>
                  ${config.returnInfo}
                </div>
                ` : ''}
              </div>
              
              <!-- Order Details -->
              <div style="background: ${colors.surface}; border-radius: 8px; padding: 24px; margin-bottom: 32px; border: 1px solid ${colors.border};">
                <h3 style="margin: 0 0 20px 0; color: ${colors.textPrimary}; font-size: 18px; font-weight: 600;">Order Details</h3>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                  <div>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: ${colors.textSecondary};">Order ID</p>
                    <p style="margin: 0; font-weight: 600; color: ${colors.textPrimary};">${order.orderid}</p>
                  </div>
                  <div>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: ${colors.textSecondary};">Order Date</p>
                    <p style="margin: 0; font-weight: 600; color: ${colors.textPrimary};">${new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: ${colors.textSecondary};">Payment Method</p>
                    <p style="margin: 0; font-weight: 600; color: ${colors.textPrimary};">${order.paymentMethod}</p>
                  </div>
                  <div>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: ${colors.textSecondary};">Current Status</p>
                    <span style="background: ${config.iconColor}15; color: ${config.iconColor}; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">
                      ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <!-- Order Items -->
                <h4 style="margin: 24px 0 16px 0; color: ${colors.textPrimary}; font-size: 16px; font-weight: 600;">Items Ordered</h4>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr>
                      <th style="text-align: left; padding: 12px 16px; background: ${colors.background}; color: ${colors.textSecondary}; font-weight: 500; border-radius: 6px 6px 0 0;">Product</th>
                      <th style="text-align: right; padding: 12px 16px; background: ${colors.background}; color: ${colors.textSecondary}; font-weight: 500; border-radius: 6px 6px 0 0;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${order.items.map(item => productItem(item)).join('')}
                  </tbody>
                </table>
                
                ${orderSummary(order)}
              </div>
              
              ${addressSection(order.address)}
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 32px;">
                <a href="${config.buttonUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, ${config.iconColor} 0%, ${colors.secondary} 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
                  ${config.buttonText}
                </a>
                <p style="margin: 16px 0 0 0; color: ${colors.textSecondary}; font-size: 14px;">
                  Need assistance? Contact our support team at <a href="mailto:support@yourcompany.com" style="color: ${colors.primary}; text-decoration: none;">support@yourcompany.com</a>
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: ${colors.background}; padding: 32px 40px; text-align: center; border-top: 1px solid ${colors.border};">
              <div style="max-width: 400px; margin: 0 auto;">
                <p style="margin: 0 0 16px 0; color: ${colors.textSecondary}; font-size: 14px;">
                  Have questions about your order status? We're here to help.
                </p>
                <p style="margin: 0; color: ${colors.textSecondary}; font-size: 12px;">
                  © ${new Date().getFullYear()} ORGANIC DIET. All rights reserved.<br>
                  This is an automated email, please do not reply.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

    default:
      // Fallback template
      return `
        <!DOCTYPE html>
        <html>
        <body>
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            ${header('Order Notification', `Order #${order.orderid}`, colors.primary)}
            <div style="padding: 40px;">
              <p>Email notification for order ${order.orderid}</p>
            </div>
          </div>
        </body>
        </html>
      `;
  }
};

// Create worker instance
const worker = new Worker('emailQueue', async (job) => {
  const { to, order, template } = job.data;
  
  console.log(`📧 Processing email job ${job.id} for ${to}`);
  console.log(`📋 Template: ${template}, Status: ${order.status}`);
  
  let subject = '';
  
  // Set subject based on template
  switch (template) {
    case 'cod_confirmation':
      subject = `Order Confirmed - #${order.orderid} - ORGANIC DIET`;
      break;
    case 'online_payment_confirmation':
      subject = `Payment Successful - Order #${order.orderid} - ORGANIC DIET`;
      break;
    case 'status_update':
      const statusText = order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Updated';
      subject = `Order ${statusText} - #${order.orderid} - ORGANIC DIET`;
      break;
    default:
      subject = `Order Update - #${order.orderid} - ORGANIC DIET`;
  }
  
  const html = generateEmailHtml(template, order);
  
  const mailOptions = {
    from: `"Organic Diet  " <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent for job ${job.id} to ${to}`);
    return { success: true, email: to, template };
  } catch (error) {
    console.error(`❌ Failed to send email for job ${job.id}:`, error.message);
    throw error;
  }
}, { 
  connection,
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 1000,
  }
});

// Event listeners
worker.on('completed', (job) => {
  console.log(`✅ Email job ${job.id} completed successfully`);
});

worker.on('failed', (job, error) => {
  console.error(`❌ Email job ${job.id} failed:`, error.message);
});

worker.on('error', (error) => {
  console.error('Worker error:', error);
});

console.log('📧 Email worker started and listening for jobs...');

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing email worker...');
  await worker.close();
  await connection.quit();
  process.exit(0);
});

export { worker };
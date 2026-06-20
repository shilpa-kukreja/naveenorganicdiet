// import axios from "axios";
// import { sendAbandonedCartEmail } from "./sendEmail.js";

// export const sendAbandonedCartSMS = async (phoneNumber, restoreLink) => {
//   try {
//     const text = `Hi there! 👋

// You left items in your Organic Diet cart 🛒

// Complete your order now:
// ${restoreLink}

// Limited stock available - don't miss out!

// Best regards,
// Organic Diet Team`;

//     const url = `http://www.smsalert.co.in/api/push.json?apikey=${process.env.SMSALERT_API_KEY}&route=transactional&sender=${process.env.SMSALERT_SENDER}&mobileno=${phoneNumber}&text=${encodeURIComponent(
//       text
//     )}`;

//     const response = await axios.get(url);
    
//     console.log(`SMS sent to ${phoneNumber}:`, response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Error sending SMS:", error);
//     throw error;
//   }
// };

// Modified to accept prepareRestoreLink as parameter
// export const sendCartReminder = async (cart, prepareRestoreLink) => {
//   try {
//     if (!prepareRestoreLink) {
//       throw new Error("prepareRestoreLink function is required");
//     }
    
//     const restoreLink = await prepareRestoreLink(cart);
    
//     // Send SMS
//     if (cart.phoneNumber) {
//       await sendAbandonedCartSMS(cart.phoneNumber, restoreLink);
//     }
    
//     // Send Email
//     if (cart.email) {
//       console.log(`📧 Sending email to: ${cart.email}`);
//       console.log(`📧 Email content preview:`);
//       console.log(`Restore Link: ${restoreLink}`);
//       console.log(`Items: ${cart.items.length} items`);
      
//       await sendAbandonedCartEmail(cart.email, restoreLink, cart.items);
//     } else {
//       console.log("⚠️ No email found for cart:", cart._id);
//     }
    
//     console.log(`Reminders sent for cart ${cart._id}`);
//     return true;
//   } catch (error) {
//     console.error("Error sending reminders:", error);
//     return false;
//   }
// };

import axios from "axios";
import { sendAbandonedCartEmail } from "./sendEmail.js";

export const sendAbandonedCartSMS = async (phoneNumber, restoreLink) => {
  // Disable SMS for now
  console.log(`📱 SMS DISABLED for ${phoneNumber}`);
  console.log(`📱 Would have sent link: ${restoreLink}`);
  return { status: 'skipped', message: 'SMS disabled for testing' };
};

// Modified to only send emails
export const sendCartReminder = async (cart, prepareRestoreLink) => {
  try {
    if (!prepareRestoreLink) {
      throw new Error("prepareRestoreLink function is required");
    }
    
    const restoreLink = await prepareRestoreLink(cart);
    console.log(`🔗 Generated restore link: ${restoreLink}`);
    
    let emailSent = false;
    
    // Send Email only
    if (cart.email) {
      try {
        console.log(`📧 Attempting to send email to: ${cart.email}`);
        console.log(`📧 Restore Link: ${restoreLink}`);
        console.log(`📧 Items: ${cart.items.length} items`);
        
        // Calculate cart total for logging
        const cartTotal = cart.items.reduce((sum, item) => 
          sum + (item.priceSnapshot * item.quantity), 0
        );
        console.log(`📧 Cart Total: ₹${cartTotal}`);
        
        // Log item details
        cart.items.forEach((item, index) => {
          console.log(`📧 Item ${index + 1}: ${item.name} x ${item.quantity} = ₹${item.priceSnapshot * item.quantity}`);
        });
        
        await sendAbandonedCartEmail(cart.email, restoreLink, cart.items);
        emailSent = true;
        console.log(`✅ Email sent successfully to ${cart.email}`);
      } catch (emailError) {
        console.error(`❌ Email failed for cart ${cart._id}:`, emailError.message);
        console.error(`❌ Email error stack:`, emailError.stack);
        emailSent = false;
      }
    } else {
      console.log(`⚠️ No email found for cart ${cart._id}`);
      
      // Try to get email from user data
      try {
        const User = require("../models/userModel.js");
        const user = await User.findById(cart.userId);
        
        if (user) {
          console.log(`👤 User found: ${user.email || user.username}`);
          if (user.email) {
            cart.email = user.email;
            console.log(`📧 Using user email: ${cart.email}`);
            
            // Retry sending email with user's email
            await sendAbandonedCartEmail(cart.email, restoreLink, cart.items);
            emailSent = true;
            console.log(`✅ Email sent using user email to ${cart.email}`);
          } else if (user.address && user.address[0] && user.address[0].email) {
            cart.email = user.address[0].email;
            console.log(`📧 Using address email: ${cart.email}`);
            
            await sendAbandonedCartEmail(cart.email, restoreLink, cart.items);
            emailSent = true;
            console.log(`✅ Email sent using address email to ${cart.email}`);
          }
        }
      } catch (userError) {
        console.error(`❌ Failed to get user data:`, userError.message);
      }
    }
    
    // SMS disabled message
    if (cart.phoneNumber) {
      console.log(`📱 SMS disabled - Would have sent to: ${cart.phoneNumber}`);
    }
    
    return emailSent;
    
  } catch (error) {
    console.error("Error in sendCartReminder:", error);
    console.error("Error stack:", error.stack);
    return false;
  }
};
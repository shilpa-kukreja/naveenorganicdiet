// import axios from 'axios';
// import qs from 'qs';

// class SMSService {
//   constructor() {
//     this.apiKey = process.env.SMSALERT_API_KEY;
//     this.sender = process.env.SMSALERT_SENDER;
//     this.baseURL = 'http://www.smsalert.co.in/api/push.json';
//   }

//   // Send order confirmation SMS
//   async sendOrderConfirmationSMS(phone, orderDetails) {
//     try {
//       const message = `Your order #${orderDetails.orderid} has been placed successfully with ₹${orderDetails.amount}. Thank you for shopping with Organic Diet!`;

//       const smsResponse = await axios.get(
//         `${this.baseURL}?apikey=${this.apiKey}&route=transactional&sender=${this.sender}&mobileno=${phone}&text=${encodeURIComponent(message)}`,
//         {
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded"
//           }
//         }
//       );

//       console.log(`✅ Order confirmation SMS sent to ${phone}:`, smsResponse.data);
//       return { success: true, data: smsResponse.data };
//     } catch (error) {
//       console.error(`❌ SMS sending failed for ${phone}:`, error.response?.data || error.message);
//       return { success: false, error: error.message };
//     }
//   }

//   // Send status update SMS
//   async sendStatusUpdateSMS(phone, orderId, status) {
//     try {
//       const statusMessages = {
//         'processing': 'is being processed',
//         'shipped': 'has been shipped',
//         'out_for_delivery': 'is out for delivery',
//         'delivered': 'has been delivered successfully',
//         'cancelled': 'has been cancelled'
//       };

//       const message = `Your order #${orderId} ${statusMessages[status] || `status updated to ${status}`}. Thank you for shopping with Organic Diet!`;

//       const smsResponse = await axios.get(
//         `${this.baseURL}?apikey=${this.apiKey}&route=transactional&sender=${this.sender}&mobileno=${phone}&text=${encodeURIComponent(message)}`,
//         {
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded"
//           }
//         }
//       );

//       console.log(`✅ Status update SMS sent to ${phone}:`, smsResponse.data);
//       return { success: true, data: smsResponse.data };
//     } catch (error) {
//       console.error(`❌ Status SMS failed for ${phone}:`, error.response?.data || error.message);
//       return { success: false, error: error.message };
//     }
//   }

//   // Send payment confirmation SMS
//   async sendPaymentConfirmationSMS(phone, orderId, amount, method) {
//     try {
//       const message = `Payment of ₹${amount} for order #${orderId} has been confirmed via ${method}. Thank you for shopping with Organic Diet!`;

//       const smsResponse = await axios.get(
//         `${this.baseURL}?apikey=${this.apiKey}&route=transactional&sender=${this.sender}&mobileno=${phone}&text=${encodeURIComponent(message)}`,
//         {
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded"
//           }
//         }
//       );

//       console.log(`✅ Payment confirmation SMS sent to ${phone}`);
//       return { success: true, data: smsResponse.data };
//     } catch (error) {
//       console.error(`❌ Payment SMS failed:`, error.message);
//       return { success: false, error: error.message };
//     }
//   }

//   // Send welcome SMS after login/registration
//   async sendWelcomeSMS(phone, username) {
//     try {
//       const message = `Welcome ${username} to Organic Diet! Your account has been successfully created. Happy shopping!`;

//       const smsResponse = await axios.get(
//         `${this.baseURL}?apikey=${this.apiKey}&route=transactional&sender=${this.sender}&mobileno=${phone}&text=${encodeURIComponent(message)}`,
//         {
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded"
//           }
//         }
//       );

//       console.log(`✅ Welcome SMS sent to ${phone}`);
//       return { success: true, data: smsResponse.data };
//     } catch (error) {
//       console.error(`❌ Welcome SMS failed:`, error.message);
//       return { success: false, error: error.message };
//     }
//   }
// }

// export default new SMSService();



import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

class SMSService {
  constructor() {
    this.apiKey = process.env.SMSALERT_API_KEY;
    this.sender = process.env.SMSALERT_SENDER;
    this.baseURL = 'http://www.smsalert.co.in/api/push.json';
  }

  // Send order confirmation SMS
  async sendOrderConfirmationSMS(phone, orderId) {
    try {
      const message = `Hello Dear User, thank you for placing your order #${orderId} with Organic Diet.`;

      const url = `${this.baseURL}?apikey=${process.env.SMSALERT_API_KEY}&route=transactional&sender=${process.env.SMSALERT_SENDER}&mobileno=${phone}&text=${encodeURIComponent(message)}`;

      console.log(`📱 Sending order confirmation to ${phone} for order #${orderId}`);
      
      const smsResponse = await axios.get(url);
      
      console.log(`✅ Order confirmation SMS sent to ${phone}:`, smsResponse.data);
      return { success: true, data: smsResponse.data };
    } catch (error) {
      console.error("❌ Order confirmation SMS failed:", error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  // Send status update SMS
  async sendStatusUpdateSMS(phone, orderId, status) {
    try {
      const message = `Organic Diet: status of order #${orderId} has been changed to ${status}`;

      const url = `${this.baseURL}?apikey=${process.env.SMSALERT_API_KEY}&route=transactional&sender=${process.env.SMSALERT_SENDER}&mobileno=${phone}&text=${encodeURIComponent(message)}`;

      console.log(`📱 Sending status update to ${phone} for order #${orderId}: ${status}`);
      
      const smsResponse = await axios.get(url);
      
      console.log(`✅ Status update SMS sent to ${phone}:`, smsResponse.data);
      return { success: true, data: smsResponse.data };
    } catch (error) {
      console.error("❌ Status update SMS failed:", error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  // Send payment confirmation SMS
  async sendPaymentConfirmationSMS(phone, orderId, amount, method) {
    try {
      const message = `Payment of ₹${amount} for order #${orderId} has been confirmed via ${method}. Thank you for shopping with Organic Diet!`;

      const url = `${this.baseURL}?apikey=${process.env.SMSALERT_API_KEY}&route=transactional&sender=${process.env.SMSALERT_SENDER}&mobileno=${phone}&text=${encodeURIComponent(message)}`;

      console.log(`📱 Sending payment confirmation to ${phone} for order #${orderId}`);
      
      const smsResponse = await axios.get(url);
      
      console.log(`✅ Payment confirmation SMS sent to ${phone}`);
      return { success: true, data: smsResponse.data };
    } catch (error) {
      console.error("❌ Payment SMS failed:", error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  // Send order cancelled SMS
  async sendOrderCancelledSMS(phone, orderId, amount) {
    try {
      const message = `Organic Diet: Your order #${orderId} Rs. ${amount}. is Cancelled. Powered by Organic Diet`;

      const url = `${this.baseURL}?apikey=${process.env.SMSALERT_API_KEY}&route=transactional&sender=${process.env.SMSALERT_SENDER}&mobileno=${phone}&text=${encodeURIComponent(message)}`;

      console.log(`📱 Sending cancellation SMS to ${phone} for order #${orderId}`);
      
      const smsResponse = await axios.get(url);
      
      console.log(`✅ Order cancellation SMS sent to ${phone}`);
      return { success: true, data: smsResponse.data };
    } catch (error) {
      console.error("❌ Cancel SMS failed:", error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  // Send order completed SMS
  async sendOrderCompletedSMS(phone, orderId, amount) {
    try {
      const message = `Organic Diet: Your order #${orderId} Rs. ${amount}. is completed.`;

      const url = `${this.baseURL}?apikey=${process.env.SMSALERT_API_KEY}&route=transactional&sender=${process.env.SMSALERT_SENDER}&mobileno=${phone}&text=${encodeURIComponent(message)}`;

      console.log(`📱 Sending completion SMS to ${phone} for order #${orderId}`);
      
      const smsResponse = await axios.get(url);
      
      console.log(`✅ Order completion SMS sent to ${phone}`);
      return { success: true, data: smsResponse.data };
    } catch (error) {
      console.error("❌ Completed SMS failed:", error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  // Send welcome SMS after login/registration
  async sendWelcomeSMS(phone) {
    try {
      const message = "Hello Dear User, Thank you for registering with Organic Diet.";

      const url = `${this.baseURL}?apikey=${process.env.SMSALERT_API_KEY}&route=transactional&sender=${process.env.SMSALERT_SENDER}&mobileno=${phone}&text=${encodeURIComponent(message)}`;

      console.log(`📱 Sending welcome SMS to ${phone}`);

      const smsResponse = await axios.get(url);
      
      console.log(`✅ Welcome SMS sent to ${phone}`);
      return { success: true, data: smsResponse.data };
    } catch (error) {
      console.error("❌ Welcome SMS failed:", error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }
}

export default new SMSService();
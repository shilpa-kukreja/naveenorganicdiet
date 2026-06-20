// utils/razorpay.js
import Razorpay from 'razorpay';

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper function to convert callback-based methods to promises
const promisifyRazorpay = (method, ...args) => {
  return new Promise((resolve, reject) => {
    method(...args, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Promise-based methods
const razorpay = {
  // Payments
  fetchPayment: (paymentId) => {
    return promisifyRazorpay(razorpayInstance.payments.fetch.bind(razorpayInstance.payments), paymentId);
  },
  
  capturePayment: (paymentId, amount, currency, notes = {}) => {
    return promisifyRazorpay(
      razorpayInstance.payments.capture.bind(razorpayInstance.payments),
      paymentId,
      amount,
      currency,
      notes
    );
  },
  
  refundPayment: (paymentId, params) => {
    return promisifyRazorpay(
      razorpayInstance.payments.refund.bind(razorpayInstance.payments),
      paymentId,
      params
    );
  },
  
  // Orders
  fetchOrder: (orderId) => {
    return promisifyRazorpay(razorpayInstance.orders.fetch.bind(razorpayInstance.orders), orderId);
  },
  
  // Refunds
  fetchRefund: (paymentId, refundId) => {
    return promisifyRazorpay(
      razorpayInstance.payments.fetchRefund.bind(razorpayInstance.payments),
      paymentId,
      refundId
    );
  }
};

export default razorpay;
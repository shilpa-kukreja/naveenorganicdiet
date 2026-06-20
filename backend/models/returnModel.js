// // models/returnModel.js
// import mongoose from 'mongoose';

// const returnSchema = new mongoose.Schema({
//   orderId: {
//     type: String,
//     required: true,
//     ref: 'Order'
//   },
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: 'User'
//   },
//   orderDetails: {
//     items: [{
//       name: String,
//       quantity: Number,
//       price: Number,
//       image: String
//     }],
//     amount: Number,
//     address: Object
//   },
//   reason: {
//     type: String,
//     required: true
//   },
//   additionalNotes: {
//     type: String,
//     default: ''
//   },
//   returnType: {
//     type: String,
//     enum: ['refund', 'exchange'],
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'approved', 'rejected', 'completed'],
//     default: 'pending'
//   },
//   requestedAt: {
//     type: Date,
//     default: Date.now
//   },
//   approvedAt: Date,
//   rejectedAt: Date,
//   completedAt: Date,
//   approvedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   rejectedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   rejectionReason: String,
//   pickupDetails: {
//     scheduledDate: Date,
//     pickupAddress: Object,
//     trackingNumber: String,
//     carrier: String
//   },
//   refundDetails: {
//     amount: Number,
//     method: String,
//     transactionId: String,
//     refundedAt: Date,
//     status: {
//       type: String,
//       enum: ['pending', 'processed', 'completed'],
//       default: 'pending'
//     }
//   },
//   exchangeDetails: {
//     newItemId: String,
//     newItemName: String,
//     status: String,
//     shippedAt: Date
//   }
// }, {
//   timestamps: true
// });

// const ReturnRequest =mongoose.models.ReturnRequest || mongoose.model('ReturnRequest', returnSchema);
// export default ReturnRequest;


// models/returnModel.js
// import mongoose from 'mongoose';

// const returnItemSchema = new mongoose.Schema({
//   itemId: {
//     type: String,
//     required: true
//   },
//   name: {
//     type: String,
//     required: true
//   },
//   quantity: {
//     type: Number,
//     required: true,
//     min: 1
//   },
//   price: {
//     type: Number,
//     required: true
//   },
//   image: {
//     type: String,
//     required: true
//   },
//   totalAmount: {
//     type: Number,
//     required: true
//   },
//   originalQuantity: {
//     type: Number,
//     required: true
//   }
// });

// const returnSchema = new mongoose.Schema({
//   orderId: {
//     type: String,
//     required: true,
//     ref: 'Order'
//   },
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: 'User'
//   },
//   orderDetails: {
//     items: [{
//       name: String,
//       quantity: Number,
//       price: Number,
//       image: String
//     }],
//     amount: Number,
//     address: Object,
//     originalOrderAmount: Number
//   },
//   returnItems: [returnItemSchema],
//   totalReturnAmount: {
//     type: Number,
//     required: true
//   },
//   reason: {
//     type: String,
//     required: true
//   },
//   additionalNotes: {
//     type: String,
//     default: ''
//   },
//   returnType: {
//     type: String,
//     enum: ['refund', 'exchange'],
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'approved', 'rejected', 'completed', 'picked_up', 'in_transit', 'received'],
//     default: 'pending'
//   },
//   requestedAt: {
//     type: Date,
//     default: Date.now
//   },
//   approvedAt: Date,
//   rejectedAt: Date,
//   completedAt: Date,
//   approvedBy: {
//     type: mongoose.Schema.Types.Mixed,
//      default: null
//   },
//   rejectedBy: {
//     type: mongoose.Schema.Types.Mixed,
//      default: null
//   },
//   rejectionReason: String,
//   pickupDetails: {
//     scheduledDate: Date,
//     pickupAddress: Object,
//     trackingNumber: String,
//     carrier: String,
//     pickupStatus: {
//       type: String,
//       enum: ['scheduled', 'in_transit', 'delivered', 'cancelled'],
//       default: 'scheduled'
//     }
//   },
//    returnStatus: {
//     type: String,
//     enum: ['pending', 'approved', 'pickup_scheduled', 'in_transit', 'received_at_warehouse', 'refund_processed', 'completed', 'cancelled'],
//     default: 'pending'
//   },
  
//   returnTimeline: [{
//     status: String,
//     description: String,
//     date: {
//       type: Date,
//       default: Date.now
//     }
//   }],
//   refundDetails: {
//     amount: Number,
//     method: String,
//     transactionId: String,
//     refundedAt: Date,
//     status: {
//       type: String,
//       enum: ['pending', 'processed', 'completed', 'failed'],
//       default: 'pending'
//     }
//   },

//    shipmozoReturn: {
//     pushedAt: {
//       type: Date
//     },
//     returnOrderId: {
//       type: String
//     },
//     awbNumber: {
//       type: String
//     },
//     referenceId: {
//       type: String
//     },
//     status: {
//       type: String,
//       enum: ['pending', 'pushed', 'failed'],
//       default: 'pending'
//     },
//     apiResponse: {
//       type: Object
//     },
//     pickupDetails: {
//       scheduledDate: Date,
//       trackingUrl: String,
//       pickupStatus: {
//         type: String,
//         enum: ['pending', 'scheduled', 'picked', 'failed'],
//         default: 'pending'
//       }
//     }
//   },
  
//   exchangeDetails: {
//     newItems: [{
//       itemId: String,
//       name: String,
//       quantity: Number,
//       price: Number,
//       status: String
//     }],
//     status: String,
//     shippedAt: Date,
//     trackingNumber: String
//   }
// }, {
//   timestamps: true
// });

// const ReturnRequest = mongoose.model('ReturnRequest', returnSchema);
// export default ReturnRequest;




import mongoose from 'mongoose';

const returnItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  originalQuantity: {
    type: Number,
    required: true
  }
});

const bankDetailsSchema = new mongoose.Schema({
  accountHolderName: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    required: true
  },
  ifscCode: {
    type: String,
    required: true
  },
  bankName: {
    type: String,
    default: ''
  },
  upiId: {
    type: String,
    default: ''
  }
});

const returnSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    ref: 'Order'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  orderDetails: {
    items: [{
      name: String,
      quantity: Number,
      price: Number,
      image: String
    }],
    amount: Number,
    address: Object,
    originalOrderAmount: Number,
    paymentMethod: String, // Added payment method
    razorpayPaymentId: String // Added for online payments
  },
  returnItems: [returnItemSchema],
  totalReturnAmount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  additionalNotes: {
    type: String,
    default: ''
  },
  returnType: {
    type: String,
    enum: ['refund', 'exchange'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'picked_up', 'in_transit', 'received'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date,
  rejectedAt: Date,
  completedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.Mixed,
     default: null
  },
  rejectedBy: {
    type: mongoose.Schema.Types.Mixed,
     default: null
  },
  rejectionReason: String,
  pickupDetails: {
    scheduledDate: Date,
    pickupAddress: Object,
    trackingNumber: String,
    carrier: String,
    pickupStatus: {
      type: String,
      enum: ['scheduled', 'in_transit', 'delivered', 'cancelled'],
      default: 'scheduled'
    }
  },
   returnStatus: {
    type: String,
    enum: ['pending', 'approved', 'pickup_scheduled', 'in_transit', 'received_at_warehouse', 'ready_for_refund', 'refund_processed', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  returnTimeline: [{
    status: String,
    description: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  refundDetails: {
    amount: Number,
    method: String,
    transactionId: String,
    processedAt: Date,
    razorpayPaymentId: String,
    razorpayRefundId: String,
    status: {
      type: String,
      enum: ['pending', 'processed', 'completed', 'failed'],
      default: 'pending'
    },
    bankDetails: bankDetailsSchema // Added bank details for COD refunds
  },

   shipmozoReturn: {
    pushedAt: {
      type: Date
    },
    returnOrderId: {
      type: String
    },
    awbNumber: {
      type: String
    },
    referenceId: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending', 'pushed', 'failed'],
      default: 'pending'
    },
    apiResponse: {
      type: Object
    },
    pickupDetails: {
      scheduledDate: Date,
      trackingUrl: String,
      pickupStatus: {
        type: String,
        enum: ['pending', 'scheduled', 'picked', 'failed'],
        default: 'pending'
      }
    }
  },
  
  exchangeDetails: {
    newItems: [{
      itemId: String,
      name: String,
      quantity: Number,
      price: Number,
      status: String
    }],
    status: String,
    shippedAt: Date,
    trackingNumber: String
  }
}, {
  timestamps: true
});

const ReturnRequest = mongoose.model('ReturnRequest', returnSchema);
export default ReturnRequest;
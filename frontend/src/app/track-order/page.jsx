// 'use client';
// import React, { useState } from 'react';
// import {
//   FiSearch,
//   FiClock,
//   FiCheckCircle,
//   FiTruck,
//   FiPackage,
//   FiHome,
//   FiCalendar,
//   FiDollarSign,
//   FiMapPin,
//   FiBox,
//   FiMail,
//   FiShoppingBag,
//   FiCreditCard,
//   FiChevronRight
// } from 'react-icons/fi';
// import Header from '../componats/Header';
// import Footer from '../componats/Footer';

// const OrderTracking = () => {
//   const [orderId, setOrderId] = useState('');
//   const [email, setEmail] = useState('');
//   const [order, setOrder] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');

//   const sampleOrder = {
//     id: 'ORD-2023-8765',
//     date: 'October 15, 2023',
//     status: 'shipped',
//     items: [
//       { 
//         id: 1, 
//         name: 'Organic Cotton T-Shirt', 
//         price: 24.99, 
//         quantity: 2, 
//         image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center',
//         color: 'White',
//         size: 'M'
//       },
//       { 
//         id: 2, 
//         name: 'Premium Yoga Pants', 
//         price: 34.99, 
//         quantity: 1, 
//         image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w-400&h=400&fit=crop&crop=center',
//         color: 'Black',
//         size: 'L'
//       }
//     ],
//     subtotal: 84.97,
//     shipping: 5.99,
//     tax: 8.50,
//     total: 99.46,
//     shippingAddress: {
//       name: 'John Smith',
//       street: '123 Main Street',
//       apt: 'Apt 4B',
//       city: 'New York',
//       state: 'NY',
//       zip: '10001',
//       country: 'USA'
//     },
//     trackingNumber: 'UPS-1Z999AA1012345678',
//     estimatedDelivery: 'October 20, 2023',
//     carrier: 'UPS',
//     history: [
//       { 
//         status: 'ordered', 
//         title: 'Order Confirmed',
//         date: 'Oct 15, 2023', 
//         time: '10:30 AM', 
//         completed: true,
//         description: 'Your order has been confirmed'
//       },
//       { 
//         status: 'processed', 
//         title: 'Processing',
//         date: 'Oct 16, 2023', 
//         time: '9:15 AM', 
//         completed: true,
//         description: 'Preparing your items'
//       },
//       { 
//         status: 'shipped', 
//         title: 'Shipped',
//         date: 'Oct 17, 2023', 
//         time: '3:45 PM', 
//         completed: true,
//         description: 'Package has left our facility'
//       },
//       { 
//         status: 'out-for-delivery', 
//         title: 'Out for Delivery',
//         date: 'Oct 20, 2023', 
//         time: '8:00 AM', 
//         completed: false,
//         description: 'Package is on its way'
//       },
//       { 
//         status: 'delivered', 
//         title: 'Delivered',
//         date: '', 
//         time: '', 
//         completed: false,
//         description: 'Expected delivery today'
//       }
//     ]
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     setTimeout(() => {
//       if (orderId && email) {
//         setOrder(sampleOrder);
//       } else {
//         setError('Please enter both order ID and email');
//       }
//       setIsLoading(false);
//     }, 1000);
//   };

//   const getStatusIcon = (status, completed) => {
//     const baseClass = "text-2xl";
//     const colorClass = completed ? "text-green-600" : "text-gray-400";
    
//     switch (status) {
//       case 'ordered': return <FiShoppingBag className={`${baseClass} ${colorClass}`} />;
//       case 'processed': return <FiPackage className={`${baseClass} ${colorClass}`} />;
//       case 'shipped': return <FiTruck className={`${baseClass} ${colorClass}`} />;
//       case 'out-for-delivery': return <FiTruck className={`${baseClass} ${colorClass}`} />;
//       case 'delivered': return <FiHome className={`${baseClass} ${colorClass}`} />;
//       default: return <FiCheckCircle className={`${baseClass} ${colorClass}`} />;
//     }
//   };

//   const statusColors = {
//     ordered: 'bg-blue-500',
//     processed: 'bg-purple-500',
//     shipped: 'bg-yellow-500',
//     'out-for-delivery': 'bg-orange-500',
//     delivered: 'bg-green-500'
//   };

//   const getCurrentStatusIndex = () => {
//     return sampleOrder.history.findIndex(step => !step.completed) - 1;
//   };

//   const formatAddress = (address) => {
//     return `${address.street} ${address.apt}, ${address.city}, ${address.state} ${address.zip}, ${address.country}`;
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
//       <Header />
      
//       <main className="flex-grow">
//         {/* Hero Section */}
//         <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
//           <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
//             <div className="text-center">
//               <h1 className="text-4xl font-bold mb-4">Track Your Order</h1>
//               <p className="text-lg opacity-90 max-w-2xl mx-auto">
//                 Enter your order details below to get real-time updates on your shipment
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Search Form */} 
//         <div className="max-w-4xl mx-auto -mt-8 px-4 sm:px-6 lg:px-8  mb-10">
//           <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
//             <form onSubmit={handleSubmit}>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <div className="flex items-center">
//                       <FiBox className="mr-2" />
//                       Order ID
//                     </div>
//                   </label>
//                   <input
//                     type="text"
//                     value={orderId}
//                     onChange={(e) => setOrderId(e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
//                     placeholder="Enter order number (e.g., ORD-2023-8765)"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <div className="flex items-center">
//                       <FiMail className="mr-2" />
//                       Email Address
//                     </div>
//                   </label>
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
//                     placeholder="Enter the email used for ordering"
//                     required
//                   />
//                 </div>
//               </div>

//               {error && (
//                 <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//                   <p className="text-red-700 flex items-center">
//                     <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                     </svg>
//                     {error}
//                   </p>
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className={`w-full py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-0.5 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
//               >
//                 {isLoading ? (
//                   <div className="flex items-center justify-center">
//                     <svg className="animate-spin h-6 w-6 mr-3 text-white" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//                     </svg>
//                     Tracking Your Order...
//                   </div>
//                 ) : (
//                   <div className="flex items-center justify-center">
//                     <FiSearch className="w-6 h-6 mr-3" />
//                     Track Order
//                   </div>
//                 )}
//               </button>
//             </form>
//           </div>
//         </div>

//         {/* Order Details */}
//         {order && (
//           <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
//             {/* Order Header */}
//             <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
//               <div className="p-8 border-b border-gray-100">
//                 <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
//                   <div>
//                     <h2 className="text-2xl font-bold text-gray-900">Order #{order.id}</h2>
//                     <div className="flex items-center mt-2 text-gray-600">
//                       <FiCalendar className="mr-2" />
//                       <span>Placed on {order.date}</span>
//                     </div>
//                   </div>
//                   <div className="mt-4 lg:mt-0">
//                     <div className="flex items-center space-x-4">
//                       <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
//                         {order.status.replace(/-/g, ' ').toUpperCase()}
//                       </span>
//                       <span className="text-gray-600">
//                         Estimated Delivery: <span className="font-semibold">{order.estimatedDelivery}</span>
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Horizontal Timeline */}
//               <div className="p-8 border-b border-gray-100">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-8">Order Journey</h3>
                
//                 <div className="relative">
//                   {/* Progress Line */}
//                   <div className="absolute left-0 right-0 top-8 h-1.5 bg-gray-200">
//                     <div 
//                       className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
//                       style={{ width: `${(getCurrentStatusIndex() + 1) * 25}%` }}
//                     />
//                   </div>
                  
//                   {/* Steps */}
//                   <div className="relative flex justify-between">
//                     {order.history.map((step, index) => (
//                       <div key={index} className="relative flex flex-col items-center w-1/5">
//                         {/* Step Circle */}
//                         <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 z-10 transition-all duration-300 ${
//                           step.completed 
//                             ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg' 
//                             : 'bg-white border-2 border-gray-300 text-gray-400'
//                         }`}>
//                           {getStatusIcon(step.status, step.completed)}
//                         </div>
                        
//                         {/* Step Content */}
//                         <div className="text-center px-2">
//                           <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
//                           {step.date && (
//                             <p className="text-sm text-gray-600 mb-1">
//                               {step.date} • {step.time}
//                             </p>
//                           )}
//                           <p className="text-xs text-gray-500">{step.description}</p>
//                         </div>
                        
//                         {/* Connector Line */}
//                         {index < order.history.length - 1 && (
//                           <div className="absolute top-8 left-3/4 w-1/2 h-0.5 bg-transparent" />
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* Order Items */}
//               <div className="p-8 border-b border-gray-100">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Items</h3>
//                 <div className="space-y-4">
//                   {order.items.map((item) => (
//                     <div key={item.id} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
//                       <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
//                         <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
//                       </div>
//                       <div className="ml-6 flex-grow">
//                         <h4 className="font-semibold text-gray-900">{item.name}</h4>
//                         <div className="flex items-center mt-2 text-sm text-gray-600">
//                           <span className="mr-4">Color: {item.color}</span>
//                           <span className="mr-4">Size: {item.size}</span>
//                           <span>Qty: {item.quantity}</span>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <div className="text-lg font-semibold text-gray-900">
//                           ₹{(item.price * item.quantity).toFixed(2)}
//                         </div>
//                         <div className="text-sm text-gray-500">
//                           ₹{item.price.toFixed(2)} each
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Shipping and Summary Grid */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
//                 {/* Shipping Information */}
//                 <div className="p-8">
//                   <div className="flex items-center mb-6">
//                     <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mr-4">
//                       <FiMapPin className="w-6 h-6" />
//                     </div>
//                     <div>
//                       <h4 className="text-lg font-semibold text-gray-900">Shipping Information</h4>
//                       <p className="text-sm text-gray-600">Deliver to this address</p>
//                     </div>
//                   </div>
                  
//                   <div className="bg-gray-50 rounded-xl p-6">
//                     <div className="mb-4">
//                       <p className="font-semibold text-gray-900">{order.shippingAddress.name}</p>
//                       <p className="text-gray-600 mt-1">{formatAddress(order.shippingAddress)}</p>
//                     </div>
//                     <div className="pt-4 border-t border-gray-200">
//                       <p className="text-sm text-gray-600 mb-2">Shipping Method</p>
//                       <div className="flex items-center justify-between">
//                         <span className="font-semibold">Standard Shipping</span>
//                         <span className="text-green-600 font-semibold">₹{order.shipping.toFixed(2)}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Order Summary */}
//                 <div className="p-8">
//                   <div className="flex items-center mb-6">
//                     <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mr-4">
//                       <FiCreditCard className="w-6 h-6" />
//                     </div>
//                     <div>
//                       <h4 className="text-lg font-semibold text-gray-900">Order Summary</h4>
//                       <p className="text-sm text-gray-600">Payment details and total</p>
//                     </div>
//                   </div>
                  
//                   <div className="bg-gray-50 rounded-xl p-6">
//                     <div className="space-y-3 mb-4">
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Subtotal</span>
//                         <span className="font-semibold">₹{order.subtotal.toFixed(2)}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Shipping</span>
//                         <span className="font-semibold">₹{order.shipping.toFixed(2)}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Tax</span>
//                         <span className="font-semibold">₹{order.tax.toFixed(2)}</span>
//                       </div>
//                     </div>
//                     <div className="pt-4 border-t border-gray-200">
//                       <div className="flex justify-between items-center">
//                         <span className="text-lg font-bold text-gray-900">Total</span>
//                         <span className="text-2xl font-bold text-green-700">₹{order.total.toFixed(2)}</span>
//                       </div>
//                       <p className="text-sm text-gray-500 mt-2">Including all taxes and fees</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Tracking Information */}
//               <div className="p-8 bg-gradient-to-r from-green-50 to-emerald-50">
//                 <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
//                   <div className="mb-6 lg:mb-0">
//                     <h4 className="text-lg font-semibold text-gray-900 mb-2">Tracking Information</h4>
//                     <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
//                       <div className="flex items-center">
//                         <span className="text-gray-600 mr-2">Carrier:</span>
//                         <span className="font-semibold">{order.carrier}</span>
//                       </div>
//                       <div className="flex items-center">
//                         <span className="text-gray-600 mr-2">Tracking #:</span>
//                         <code className="bg-white px-3 py-1 rounded-lg font-mono text-gray-800 border border-gray-200">
//                           {order.trackingNumber}
//                         </code>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <a
//                     href={`https://www.ups.com/track?tracknum=${order.trackingNumber}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-0.5"
//                   >
//                     Track Package
//                     <FiChevronRight className="ml-2 w-5 h-5" />
//                   </a>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </main>
      
//       <Footer />
//     </div>
//   );
// };

// export default OrderTracking;


'use client';
import React, { useState, useEffect, useCallback } from "react";
import {
  FiPackage,
  FiCheckCircle,
  FiTruck,
  FiHome,
  FiClock,
  FiAlertCircle,
  FiMapPin,
  FiRefreshCw,
  FiDownload,
  FiShare2,
  FiMessageSquare
} from "react-icons/fi";
import { 
  FaBoxOpen, 
  FaShippingFast, 
  FaRegCheckCircle,
  FaExclamationTriangle 
} from "react-icons/fa";

import Header from "../componats/Header";

import TrackingTimeline from "../componats/TrackingTimeline";
import SupportCard from "../componats/SupportCard";
import { formatDate, getStatusColor, getStatusIcon, calculateProgress } from "../componats/trackingUtils";
import Footer from "../componats/Footer";
import { Loader } from "../componats/Loader";

// Status configuration
const STATUS_CONFIG = {
  ORDERED: { 
    label: "Order Placed", 
    icon: FaBoxOpen,
    description: "Your order has been received" 
  },
  PROCESSED: { 
    label: "Processing", 
    icon: FiPackage,
    description: "Preparing your order for shipment" 
  },
  PICKED_UP: { 
    label: "Picked Up", 
    icon: FaShippingFast,
    description: "Courier has picked up your package" 
  },
  IN_TRANSIT: { 
    label: "In Transit", 
    icon: FiTruck,
    description: "Your package is on the way" 
  },
  OUT_FOR_DELIVERY: { 
    label: "Out for Delivery", 
    icon: FiTruck,
    description: "Delivery agent is on the way" 
  },
  DELIVERED: { 
    label: "Delivered", 
    icon: FiHome,
    description: "Package has been delivered" 
  },
  CANCELLED: { 
    label: "Cancelled", 
    icon: FiAlertCircle,
    description: "Order has been cancelled" 
  },
  RETURNED: { 
    label: "Returned", 
    icon: FiRefreshCw,
    description: "Package has been returned" 
  }
};

export default function OrderTracking() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedOrderId = localStorage.getItem("lastTrackedOrder");
    const savedEmail = localStorage.getItem("trackingEmail");
    if (savedOrderId) setOrderId(savedOrderId);
    if (savedEmail) setEmail(savedEmail);
  }, []);

  // Auto-refresh logic
  useEffect(() => {
    let interval;
    if (autoRefresh && order?.id) {
      interval = setInterval(() => {
        handleTrackOrder(order.id, true);
      }, 30000); // Refresh every 30 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh, order?.id]);

 const mapShipmozoToUI = useCallback((orderId, shipmozo) => {
  // Status flow for progress tracking
  const statusFlow = [
    "PENDING", "PROCESSING", "PICKED_UP", 
    "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"
  ];
  
  const currentStatus = shipmozo.status || "PENDING";
  const currentIndex = statusFlow.indexOf(currentStatus.toUpperCase());
  const progress = currentStatus === "DELIVERED" ? 100 : 
                   currentStatus === "UNDELIVERED" ? 100 :
                   Math.max(0, (currentIndex / (statusFlow.length - 1)) * 100);
  
  // Format history
  const history = (shipmozo.scan_detail || []).map(scan => {
    const scanStatus = scan.status || "";
    const statusKey = scanStatus.toUpperCase().replace(/ /g, '_');
    
    return {
      status: scanStatus.toLowerCase().replace(/ /g, '-'),
      title: STATUS_CONFIG[statusKey]?.label || scanStatus,
      completed: statusFlow.indexOf(statusKey) <= currentIndex,
      active: scanStatus === shipmozo.current_status,
      date: formatDate(scan.date || scan.timestamp),
      location: scan.location || "",
      description: scan.remark || scan.description || "",
      icon: STATUS_CONFIG[statusKey]?.icon || FiPackage
    };
  });

  // Add current status to history if not present
  if (shipmozo.current_status && !history.some(h => h.title === shipmozo.current_status)) {
    history.unshift({
      status: shipmozo.current_status.toLowerCase().replace(/ /g, '-'),
      title: shipmozo.current_status,
      completed: true,
      active: true,
      date: new Date().toISOString(),
      location: "",
      description: "Latest status update",
      icon: STATUS_CONFIG[shipmozo.current_status.toUpperCase().replace(/ /g, '_')]?.icon || FiPackage
    });
  }

  return {
    id: orderId,
    status: currentStatus.toLowerCase(),
    statusLabel: shipmozo.current_status || shipmozo.statusLabel || currentStatus,
    history,
    trackingNumber: shipmozo.awb_number || "N/A",
    carrier: shipmozo.courier || "Shipping Partner",
    estimatedDelivery: shipmozo.expected_delivery_date ? 
                      formatDate(shipmozo.expected_delivery_date) : null,
    lastUpdated: shipmozo.lastUpdated || new Date().toISOString(),
    progress,
    isDelivered: currentStatus === "DELIVERED".toLowerCase(),
    isInTransit: ["IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(currentStatus.toUpperCase()),
    scanDetails: shipmozo.scan_detail || []
  };
}, []);

  const handleTrackOrder = async (id = orderId, silent = false) => {
    if (!id.trim() || !email.trim()) {
      setError("Please enter both Order ID and Email");
      return;
    }

    if (!silent) {
      setIsLoading(true);
      setError("");
    }

    try {
      // Save to localStorage
      localStorage.setItem("lastTrackedOrder", id);
      localStorage.setItem("trackingEmail", email);

      const token = localStorage.getItem("token");
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/shipmozo/track/${id}?forceRefresh=${!silent}`;
      
      const res = await fetch(url, {
        headers: token ? { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } : {
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch tracking information");
      }

      const mappedOrder = mapShipmozoToUI(id, data.tracking);
      setOrder(mappedOrder);
      setLastUpdated(new Date().toISOString());
      
      // Auto-enable refresh for in-transit orders
      if (mappedOrder.isInTransit && !mappedOrder.isDelivered) {
        setAutoRefresh(true);
      } else {
        setAutoRefresh(false);
      }

    } catch (err) {
      if (!silent) {
        setError(err.message);
        setOrder(null);
      }
      console.error("Tracking error:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleTrackOrder();
  };

  const handleShareTracking = () => {
    if (navigator.share && order) {
      navigator.share({
        title: `Track Order ${order.id}`,
        text: `Track your order ${order.id} with ${order.carrier}. Tracking number: ${order.trackingNumber}`,
        url: window.location.href
      });
    }
  };

  const handleDownloadDetails = () => {
    if (!order) return;
    
    const content = `
Order Tracking Details
=====================
Order ID: ${order.id}
Tracking Number: ${order.trackingNumber}
Carrier: ${order.carrier}
Status: ${order.statusLabel}
Estimated Delivery: ${order.estimatedDelivery || 'Not available'}
Last Updated: ${formatDate(lastUpdated)}

Tracking History:
${order.history.map(h => `- ${h.title}: ${h.date}${h.location ? ` at ${h.location}` : ''}`).join('\n')}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracking-${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Track Your Order
          </h1>
          <p className="text-gray-600">
            Enter your order ID and email to get real-time tracking updates
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order ID
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                  placeholder="e.g., ORD123456789"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader size="sm" />
                    Tracking...
                  </>
                ) : (
                  <>
                    <FiRefreshCw />
                    Track Order
                  </>
                )}
              </button>
              
              {order && (
                <button
                  type="button"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-6 py-3 rounded-lg font-medium transition ${
                    autoRefresh 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {autoRefresh ? 'Auto-refresh ON' : 'Enable Auto-refresh'}
                </button>
              )}
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <FiAlertCircle className="text-red-500 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">{error}</p>
                <p className="text-red-600 text-sm mt-1">
                  Please check your details and try again
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tracking Results */}
        {order && (
          <div className="space-y-8">
            {/* Status Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order #{order.id}
                  </h2>
                  <p className="text-gray-600">
                    Current Status: <span className={`font-semibold ${getStatusColor(order.status)}`}>
                      {order.statusLabel}
                    </span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleShareTracking}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Share tracking"
                  >
                    <FiShare2 size={20} />
                  </button>
                  <button
                    onClick={handleDownloadDetails}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                    title="Download details"
                  >
                    <FiDownload size={20} />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Order Placed</span>
                  <span>{order.progress}% Complete</span>
                  <span>Delivered</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${order.progress}%` }}
                  />
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiPackage className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-semibold">{order.trackingNumber}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FiTruck className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Carrier</p>
                      <p className="font-semibold">{order.carrier}</p>
                    </div>
                  </div>
                </div>
                
                {order.estimatedDelivery && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FiClock className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Estimated Delivery</p>
                        <p className="font-semibold">{order.estimatedDelivery}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Last Updated */}
              {lastUpdated && (
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <FiClock />
                  Last updated: {formatDate(lastUpdated)}
                </div>
              )}
            </div>

            {/* Tracking Timeline */}
            <TrackingTimeline 
              history={order.history} 
              currentStatus={order.status}
            />

            {/* Order Summary (optional) */}
            {order.orderInfo && <OrderSummaryCard orderInfo={order.orderInfo} />}

            {/* Shipment Details */}
            <ShipmentDetailsCard 
              trackingNumber={order.trackingNumber}
              carrier={order.carrier}
              scanDetails={order.scanDetails}
            />

            {/* Support Section */}
            <SupportCard 
              orderId={order.id}
              status={order.status}
            />
          </div>
        )}

        {/* Empty State */}
        {!order && !isLoading && !error && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <FiPackage className="text-gray-400" size={48} />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Track Your Order
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Enter your Order ID and Email above to view real-time tracking information, 
              delivery estimates, and shipment history.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
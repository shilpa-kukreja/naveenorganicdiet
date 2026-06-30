// "use client";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import toast, { Toaster } from "react-hot-toast";
// import { jwtDecode } from "jwt-decode";
// import {
//   ChevronDown,
//   ChevronUp,
//   Package,
//   Truck,
//   CheckCircle,
//   XCircle,
//   RefreshCw,
//   Calendar,
//   MapPin,
//   CreditCard,
//   User,
//   Mail,
//   Phone,
//   Building,
//   FileText
// } from "lucide-react";
// import Header from "../componats/Header";
// import Footer from "../componats/Footer";

// import { Undo2 } from 'lucide-react';
// import ReturnOrderModal from "../componats/ReturnOrderModal";

// const UserOrders = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const ordersPerPage = 5;
//   const [expandedOrder, setExpandedOrder] = useState(null);
//   const [userId, setUserId] = useState(null);
//   const [updatingOrder, setUpdatingOrder] = useState(null);
//   const [returnModalOpen, setReturnModalOpen] = useState(false);
//   const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const storedToken = localStorage.getItem("token");
//       if (storedToken) {
//         const decoded = jwtDecode(storedToken);
//         setUserId(decoded._id || decoded.id);
//       }
//     }
//   }, []);

//   useEffect(() => {
//     if (userId) fetchOrders();
//   }, [userId]);

//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       const { data } = await axios.post("http://localhost:5000/api/order/user", { userId });
//       setOrders(data.orders);
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to fetch orders");
//     }
//     setLoading(false);
//   };

//   const changeStatus = async (orderid, status) => {
//     setUpdatingOrder(orderid);
//     try {
//       const { data } = await axios.put("http://localhost:5000/api/order/status", { orderid, status });
//       toast.success(data.message);
//       fetchOrders();
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to update order");
//     }
//     setUpdatingOrder(null);
//   };

//   // Add this function
//   const handleReturnRequest = (orderId) => {
//     setSelectedOrderForReturn(orderId);
//     setReturnModalOpen(true);
//   };

//   // Add this function after fetchOrders function
//   const handleReturnSubmitted = () => {
//     fetchOrders(); // Refresh orders after return request
//     toast.success('Return request submitted successfully!');
//   };

//   const indexOfLastOrder = currentPage * ordersPerPage;
//   const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
//   const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
//   const totalPages = Math.ceil(orders.length / ordersPerPage);

//   const toggleExpand = (orderId) => {
//     setExpandedOrder(expandedOrder === orderId ? null : orderId);
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case "Order Placed":
//         return <Package className="w-4 h-4" />;
//       case "Shipped":
//         return <Truck className="w-4 h-4" />;
//       case "Delivered":
//         return <CheckCircle className="w-4 h-4" />;
//       case "Cancelled":
//         return <XCircle className="w-4 h-4" />;
//       case "Returned":
//         return <RefreshCw className="w-4 h-4" />;
//       default:
//         return <Package className="w-4 h-4" />;
//     }
//   };

//   const formatDate = (dateString) => {
//     const options = { year: 'numeric', month: 'short', day: 'numeric' };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   // Skeleton Loader Component
//   const SkeletonLoader = () => (
//     <div className="min-h-screen flex flex-col">
//       <Header />
//       <div className="flex-1 border-t border-gray-300 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//         <Toaster position="top-right" />

//         <div className="max-w-8xl mx-auto">
//           <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
//             {/* Header Skeleton */}
//             <div className="flex items-center justify-between mb-6">
//               <div className="space-y-3">
//                 <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
//                 <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
//               </div>
//               <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
//             </div>

//             {/* Orders List Skeleton */}
//             <div className="space-y-5">
//               {[1, 2, 3].map((order) => (
//                 <div key={order} className="border border-[#00a63d] rounded-xl overflow-hidden animate-pulse">
//                   {/* Order Header Skeleton */}
//                   <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
//                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//                       <div className="flex items-center mb-3 sm:mb-0">
//                         <div className="bg-gray-200 p-2 rounded-lg mr-4 w-9 h-9"></div>
//                         <div className="space-y-2">
//                           <div className="h-5 w-32 bg-gray-300 rounded"></div>
//                           <div className="h-4 w-40 bg-gray-200 rounded"></div>
//                         </div>
//                       </div>
//                       <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
//                     </div>
//                   </div>

//                   {/* Order Content Skeleton */}
//                   <div className="p-6">
//                     {/* Order Items Skeleton */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                       {[1, 2].map((item) => (
//                         <div key={item} className="flex items-start space-x-4">
//                           <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
//                           <div className="flex-1 min-w-0 space-y-2">
//                             <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
//                             <div className="h-3 w-20 bg-gray-200 rounded"></div>
//                             <div className="h-5 w-16 bg-gray-300 rounded"></div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>

//                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 pt-6">
//                       <div className="mb-4 sm:mb-0">
//                         <div className="h-6 w-32 bg-gray-300 rounded"></div>
//                       </div>

//                       <div className="flex flex-wrap gap-3">
//                         <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
//                         <div className="h-10 w-36 bg-gray-200 rounded-lg"></div>
//                       </div>
//                     </div>

//                     {/* Expanded Details Skeleton */}
//                     <div className="mt-6 pt-6 border-t border-gray-200">
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         {/* Shipping Address Skeleton */}
//                         <div className="bg-gray-50 p-4 rounded-lg space-y-3">
//                           <div className="h-5 w-36 bg-gray-300 rounded"></div>
//                           <div className="space-y-2">
//                             {[1, 2, 3, 4, 5].map((item) => (
//                               <div key={item} className="flex items-center">
//                                 <div className="w-4 h-4 mr-2 bg-gray-200 rounded"></div>
//                                 <div className="h-3 w-48 bg-gray-200 rounded"></div>
//                               </div>
//                             ))}
//                           </div>
//                         </div>

//                         {/* Payment Information Skeleton */}
//                         <div className="bg-gray-50 p-4 rounded-lg space-y-3">
//                           <div className="h-5 w-36 bg-gray-300 rounded"></div>
//                           <div className="space-y-2">
//                             {[1, 2, 3, 4, 5, 6].map((item) => (
//                               <div key={item} className="flex justify-between">
//                                 <div className="h-3 w-24 bg-gray-200 rounded"></div>
//                                 <div className="h-3 w-20 bg-gray-200 rounded"></div>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Pagination Skeleton */}
//             <div className="flex justify-center mt-8">
//               <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-2">
//                 <div className="p-2 bg-gray-200 rounded-md w-10 h-10"></div>
//                 <div className="flex space-x-2">
//                   {[1, 2, 3].map((page) => (
//                     <div key={page} className="w-10 h-10 bg-gray-200 rounded-md"></div>
//                   ))}
//                 </div>
//                 <div className="p-2 bg-gray-200 rounded-md w-10 h-10"></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );

//   // Show skeleton loader while loading
//   if (loading) {
//     return <SkeletonLoader />;
//   }

//   return (
//     <div>
//       <Header />
//       <div className="min-h-screen border-t border-gray-300 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//         <Toaster position="top-right" />

//         <div className="max-w-8xl mx-auto">
//           <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
//             <div className="flex items-center justify-between mb-6">
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
//                 <p className="text-gray-600 mt-2">View and manage your orders</p>
//               </div>
//               <div className="bg-blue-100 text-[#00a63d] px-4 py-2 rounded-lg flex items-center">
//                 <FileText className="w-5 h-5 mr-2" />
//                 <span>{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
//               </div>
//             </div>

//             {orders.length === 0 ? (
//               <div className="text-center py-12">
//                 <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
//                 <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
//                 <button
//                   onClick={() => window.location.href = '/'}
//                   className="px-6 py-2 bg-[#00a63d] text-white rounded-lg hover:bg-[#00a63d] transition"
//                 >
//                   Start Shopping
//                 </button>
//               </div>
//             ) : (
//               <>
//                 <div className="space-y-5">
//                   {currentOrders.map((order) => (
//                     <div key={order._id} className="border border-[#00a63d] rounded-xl overflow-hidden transition-all hover:shadow-md">
//                       {/* Order Header */}
//                       <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
//                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//                           <div className="flex items-center mb-3 sm:mb-0">
//                             <div className="bg-blue-100 p-2 rounded-lg mr-4">
//                               <Package className="w-5 h-5 text-[#00a63d]" />
//                             </div>
//                             <div>
//                               <h3 className="font-semibold text-gray-900">Order #{order.orderid}</h3>
//                               <div className="flex items-center text-sm text-gray-500 mt-1">
//                                 <Calendar className="w-4 h-4 mr-1" />
//                                 <span>Placed on {formatDate(order.createdAt)}</span>
//                               </div>
//                             </div>
//                           </div>
//                           <div className="flex items-center">
//                             <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${order.status === "Order Placed"
//                               ? "bg-blue-100 text-[#00a63d]"
//                               : order.status === "Cancelled"
//                                 ? "bg-red-100 text-red-700"
//                                 : order.status === "Returned"
//                                   ? "bg-yellow-100 text-yellow-800"
//                                   : order.status === "Delivered"
//                                     ? "bg-green-100 text-green-700"
//                                     : "bg-purple-100 text-purple-700"
//                               }`}>
//                               {getStatusIcon(order.status)}
//                               <span className="ml-1.5">{order.status}</span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Order Content */}
//                       <div className="p-6">
//                         {/* Order Items */}
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                           {order.items.map((item) => (
//                             <div key={item._id} className="flex items-start space-x-4">
//                               <img
//                                 src={item.image}
//                                 alt={item.name}
//                                 className="w-16 h-16 object-cover rounded-lg border border-gray-200"
//                               />
//                               <div className="flex-1 min-w-0">
//                                 <p className="font-medium text-gray-900 truncate">{item.name}</p>
//                                 <p className="text-gray-500 text-sm">Quantity: {item.quantity}</p>
//                                 <p className="font-semibold text-gray-900 mt-1">₹{item.price}</p>
//                               </div>
//                             </div>
//                           ))}
//                         </div>

//                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 pt-6">
//                           <div className="mb-4 sm:mb-0">
//                             <p className="font-bold text-lg text-gray-900">Total: ₹{order.amount}</p>
//                           </div>

//                           <div className="flex flex-wrap gap-3">
//                             <button
//                               onClick={() => toggleExpand(order._id)}
//                               className="flex items-center text-[#00a63d] hover:text-[#00a63d] transition"
//                             >
//                               {expandedOrder === order._id ? (
//                                 <>
//                                   <ChevronUp className="w-4 h-4 mr-1" />
//                                   Hide Details
//                                 </>
//                               ) : (
//                                 <>
//                                   <ChevronDown className="w-4 h-4 mr-1" />
//                                   View Details
//                                 </>
//                               )}
//                             </button>

//                             {(order.status === "Order Placed" || order.status === "Shipped") && (
//                               <button
//                                 onClick={() => changeStatus(order.orderid, "Cancelled")}
//                                 disabled={updatingOrder === order.orderid}
//                                 className="flex items-center bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
//                               >
//                                 {updatingOrder === order.orderid ? (
//                                   <>
//                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-2"></div>
//                                     Processing...
//                                   </>
//                                 ) : (
//                                   <>
//                                     <XCircle className="w-4 h-4 mr-1" />
//                                     Cancel Order
//                                   </>
//                                 )}
//                               </button>
//                             )}
//                             {/* {order.status === "Delivered" && (
//                               <button
//                                 onClick={() => changeStatus(order.orderid, "Returned")}
//                                 disabled={updatingOrder === order.orderid}
//                                 className="flex items-center bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg hover:bg-yellow-100 transition disabled:opacity-50"
//                               >
//                                 {updatingOrder === order.orderid ? (
//                                   <>
//                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-800 mr-2"></div>
//                                     Processing...
//                                   </>
//                                 ) : (
//                                   <>
//                                     <RefreshCw className="w-4 h-4 mr-1" />
//                                     Return Item
//                                   </>
//                                 )}
//                               </button>
//                             )} */}
//                             {order.status === "Delivered" && (
//                               <button
//                                 onClick={() => handleReturnRequest(order.orderid)}
//                                 className="flex items-center bg-purple-50 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-100 transition"
//                               >
//                                 <Undo2 className="w-4 h-4 mr-1" />
//                                 Request Return
//                               </button>
//                             )}
//                           </div>
//                         </div>

//                         {/* Expanded Order Details */}
//                         {expandedOrder === order._id && (
//                           <div className="mt-6 pt-6 border-t border-gray-200">
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                               {/* Shipping Address */}
//                               <div className="bg-gray-50 p-4 rounded-lg">
//                                 <h4 className="font-medium text-gray-900 mb-3 flex items-center">
//                                   <MapPin className="w-5 h-5 mr-2 text-blue-600" />
//                                   Shipping Address
//                                 </h4>
//                                 <div className="space-y-2 text-gray-700">
//                                   <div className="flex items-start">
//                                     <User className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
//                                     <span>{order.address.fullName} </span>
//                                   </div>
//                                   {order.address.company && (
//                                     <div className="flex items-start">
//                                       <Building className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
//                                       <span>{order.address.company}</span>
//                                     </div>
//                                   )}
//                                   <div className="flex items-start">
//                                     <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
//                                     <span>{order.address.address1}, {order.address.address2}</span>
//                                   </div>
//                                   <div className="flex items-start">
//                                     <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
//                                     <span>{order.address.city}, {order.address.country} - {order.address.postalCode}</span>
//                                   </div>
//                                   <div className="flex items-start">
//                                     <Phone className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
//                                     <span>{order.address.phone}</span>
//                                   </div>
//                                   <div className="flex items-start">
//                                     <Mail className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
//                                     <span>{order.address.email}</span>
//                                   </div>
//                                 </div>
//                               </div>

//                               {/* Payment Information */}
//                               <div className="bg-gray-50 p-4 rounded-lg">
//                                 <h4 className="font-medium text-gray-900 mb-3 flex items-center">
//                                   <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
//                                   Payment Information
//                                 </h4>
//                                 <div className="space-y-2">
//                                   <div className="flex justify-between">
//                                     <span className="text-gray-600">Payment Method:</span>
//                                     <span className="font-medium">{order.paymentMethod}</span>
//                                   </div>
//                                   <div className="flex justify-between">
//                                     <span className="text-gray-600">Payment Status:</span>
//                                     <span className={`font-medium ${order.payment ? 'text-green-600' : 'text-yellow-600'}`}>
//                                       {order.payment ? 'Paid' : 'Pending'}
//                                     </span>
//                                   </div>
//                                   <div className="flex justify-between">
//                                     <span className="text-gray-600">Subtotal:</span>
//                                     <span className="font-medium">₹{order.amount + order.discount}</span>
//                                   </div>
//                                   <div className="flex justify-between">
//                                     <span className="text-gray-600">Coupon Code:</span>
//                                     <span className="font-medium">{order.couponCode ? order.couponCode : 'N/A'}</span>
//                                   </div>
//                                   <div className="flex justify-between">
//                                     <span className="text-gray-600">Discount:</span>
//                                     <span className="font-medium">-₹{order.discount}</span>
//                                   </div>

//                                   <div className="flex justify-between">
//                                     <span className="text-gray-600">Order Total:</span>
//                                     <span className="font-medium">₹{order.amount}</span>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Pagination */}
//                 {totalPages > 1 && (
//                   <div className="flex justify-center mt-8">
//                     <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-2">
//                       <button
//                         onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                         disabled={currentPage === 1}
//                         className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50"
//                       >
//                         <ChevronUp className="w-5 h-5 transform rotate-270" />
//                       </button>

//                       {Array.from({ length: totalPages }, (_, i) => (
//                         <button
//                           key={i}
//                           onClick={() => setCurrentPage(i + 1)}
//                           className={`w-10 h-10 rounded-md ${currentPage === i + 1
//                             ? "bg-[#00a63d] text-white"
//                             : "text-gray-700 hover:bg-gray-100"
//                             }`}
//                         >
//                           {i + 1}
//                         </button>
//                       ))}

//                       <button
//                         onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                         disabled={currentPage === totalPages}
//                         className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50"
//                       >
//                         <ChevronUp className="w-5 h-5 transform rotate-90" />
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//       <Footer />
//       <ReturnOrderModal
//         isOpen={returnModalOpen}
//         onClose={() => {
//           setReturnModalOpen(false);
//           setSelectedOrderForReturn(null);
//         }}
//         orderId={selectedOrderForReturn}
//         onReturnRequested={handleReturnSubmitted}
//       />
//     </div>
//   );
// };

// export default UserOrders;


"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import {
  ChevronDown,
  ChevronUp,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  MapPin,
  CreditCard,
  User,
  Mail,
  Phone,
  Building,
  FileText
} from "lucide-react";
import Header from "../componats/Header";
import Footer from "../componats/Footer";
import { Undo2 } from 'lucide-react';
import ReturnOrderModal from "../componats/ReturnOrderModal";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [userId, setUserId] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        const decoded = jwtDecode(storedToken);
        setUserId(decoded._id || decoded.id);
      }
    }
  }, []);

  useEffect(() => {
    if (userId) fetchOrders();
  }, [userId]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/order/user`, { userId });
      console.log("Orders fetched:", data.orders); // Debug log
      setOrders(data.orders);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    }
    setLoading(false);
  };

  const changeStatus = async (orderid, status) => {
    setUpdatingOrder(orderid);
    try {
      const { data } = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/order/status`, { orderid, status });
      toast.success(data.message);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order");
    }
    setUpdatingOrder(null);
  };

  const handleReturnRequest = (orderId) => {
    console.log("Return requested for order:", orderId); // Debug log
    setSelectedOrderForReturn(orderId);
    setReturnModalOpen(true);
  };

  const handleReturnSubmitted = () => {
    fetchOrders(); // Refresh orders after return request
    toast.success('Return request submitted successfully!');
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Order Placed":
        return <Package className="w-4 h-4" />;
      case "Shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "Cancelled":
        return <XCircle className="w-4 h-4" />;
      case "Returned":
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if order is eligible for return
  const isEligibleForReturn = (order) => {
    const deliveredDate = new Date(order.updatedAt || order.createdAt);
    const currentDate = new Date();
    const daysSinceDelivery = Math.floor((currentDate - deliveredDate) / (1000 * 60 * 60 * 24));
    
    return order.status === "delivered" && daysSinceDelivery <= 7;
  };

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 border-t border-gray-300 bg-gray-50 py-8 px-4  max-w-8xl   lg:px-16 sm:px-6 ">
        <Toaster position="top-right" />

        <div className="max-w-8xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-3">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>

            {/* Orders List Skeleton */}
            <div className="space-y-5">
              {[1, 2, 3].map((order) => (
                <div key={order} className="border border-[#00a63d] rounded-xl overflow-hidden animate-pulse">
                  {/* Order Header Skeleton */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center mb-3 sm:mb-0">
                        <div className="bg-gray-200 p-2 rounded-lg mr-4 w-9 h-9"></div>
                        <div className="space-y-2">
                          <div className="h-5 w-32 bg-gray-300 rounded"></div>
                          <div className="h-4 w-40 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>

                  {/* Order Content Skeleton */}
                  <div className="p-6">
                    {/* Order Items Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {[1, 2].map((item) => (
                        <div key={item} className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                            <div className="h-3 w-20 bg-gray-200 rounded"></div>
                            <div className="h-5 w-16 bg-gray-300 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 pt-6">
                      <div className="mb-4 sm:mb-0">
                        <div className="h-6 w-32 bg-gray-300 rounded"></div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
                        <div className="h-10 w-36 bg-gray-200 rounded-lg"></div>
                      </div>
                    </div>

                    {/* Expanded Details Skeleton */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Shipping Address Skeleton */}
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <div className="h-5 w-36 bg-gray-300 rounded"></div>
                          <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map((item) => (
                              <div key={item} className="flex items-center">
                                <div className="w-4 h-4 mr-2 bg-gray-200 rounded"></div>
                                <div className="h-3 w-48 bg-gray-200 rounded"></div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Payment Information Skeleton */}
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <div className="h-5 w-36 bg-gray-300 rounded"></div>
                          <div className="space-y-2">
                            {[1, 2, 3, 4, 5, 6].map((item) => (
                              <div key={item} className="flex justify-between">
                                <div className="h-3 w-24 bg-gray-200 rounded"></div>
                                <div className="h-3 w-20 bg-gray-200 rounded"></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-2">
                <div className="p-2 bg-gray-200 rounded-md w-10 h-10"></div>
                <div className="flex space-x-2">
                  {[1, 2, 3].map((page) => (
                    <div key={page} className="w-10 h-10 bg-gray-200 rounded-md"></div>
                  ))}
                </div>
                <div className="p-2 bg-gray-200 rounded-md w-10 h-10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

  // Show skeleton loader while loading
  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div>
      <Header />
      <div className="min-h-screen border-t border-gray-300 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <Toaster position="top-right" />

        <div className="max-w-8xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
                <p className="text-gray-600 mt-2">View and manage your orders</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 text-[#00a63d] px-4 py-2 rounded-lg flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  <span>{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-2 bg-[#00a63d] text-white rounded-lg hover:bg-[#00a63d] transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-5">
                  {currentOrders.map((order) => {
                    console.log("Rendering order:", order.orderid, "Status:", order.status); // Debug log
                    const canReturn = isEligibleForReturn(order);
                    
                    return (
                      <div key={order._id} className="border border-[#00a63d] rounded-xl overflow-hidden transition-all hover:shadow-md">
                        {/* Order Header */}
                        <div className="bg-gray-50 px-6 py-4  max-w-8xl   sm:px-6 lg:px-16 border-b border-gray-200">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center mb-3 sm:mb-0">
                              <div className="bg-blue-100 p-2 rounded-lg mr-4">
                                <Package className="w-5 h-5 text-[#00a63d]" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">Order #{order.orderid}</h3>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  <span>Placed on {formatDate(order.createdAt)}</span>
                                  {order.status === "delivered" && (
                                    <span className="ml-4">
                                      • Delivered on {formatDate(order.updatedAt || order.createdAt)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                order.status === "Order Placed"
                                  ? "bg-blue-100 text-blue-700"
                                  : order.status === "Shipped"
                                  ? "bg-purple-100 text-purple-700"
                                  : order.status === "delivered"
                                  ? "bg-green-100 text-green-700"
                                  : order.status === "Cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : order.status === "Returned"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1.5">{order.status}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Content */}
                        <div className="p-6">
                          {/* Order Items */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {order.items.map((item) => (
                              <div key={item._id} className="flex items-start space-x-4">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{item.name}</p>
                                  <p className="text-gray-500 text-sm">Quantity: {item.quantity}</p>
                                  <p className="font-semibold text-gray-900 mt-1">₹{item.price}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 pt-6">
                            <div className="mb-4 sm:mb-0">
                              <p className="font-bold text-lg text-gray-900">Total: ₹{order.amount}</p>
                              {order.status === "delivered" && !canReturn && (
                                <p className="text-sm text-red-600 mt-1">
                                  Return window expired (7 days from delivery)
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-3">
                              <button
                                onClick={() => toggleExpand(order._id)}
                                className="flex items-center text-[#00a63d] hover:text-[#00a63d] transition"
                              >
                                {expandedOrder === order._id ? (
                                  <>
                                    <ChevronUp className="w-4 h-4 mr-1" />
                                    Hide Details
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-4 h-4 mr-1" />
                                    View Details
                                  </>
                                )}
                              </button>

                              {(order.status === "Order Placed" || order.status === "Shipped") && (
                                <button
                                  onClick={() => changeStatus(order.orderid, "Cancelled")}
                                  disabled={updatingOrder === order.orderid}
                                  className="flex items-center bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                                >
                                  {updatingOrder === order.orderid ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-2"></div>
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Cancel Order
                                    </>
                                  )}
                                </button>
                              )}
                              
                              {/* Return Button - Show only for delivered orders within return window */}
                              {order.status === "delivered" && canReturn && (
                                <button
                                  onClick={() => handleReturnRequest(order.orderid)}
                                  className="flex items-center bg-purple-50 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-100 transition"
                                >
                                  <Undo2 className="w-4 h-4 mr-1" />
                                  Request Return
                                </button>
                              )}
                              
                              {/* Already Returned Status */}
                              {order.status === "Returned" && (
                                <button
                                  disabled
                                  className="flex items-center bg-gray-100 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed"
                                >
                                  <RefreshCw className="w-4 h-4 mr-1" />
                                  Returned
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Expanded Order Details */}
                          {expandedOrder === order._id && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Shipping Address */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                                    Shipping Address
                                  </h4>
                                  <div className="space-y-2 text-gray-700">
                                    <div className="flex items-start">
                                      <User className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                                      <span>{order.address.fullName} </span>
                                    </div>
                                    {order.address.company && (
                                      <div className="flex items-start">
                                        <Building className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                                        <span>{order.address.company}</span>
                                      </div>
                                    )}
                                    <div className="flex items-start">
                                      <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                                      <span>{order.address.address1}, {order.address.address2}</span>
                                    </div>
                                    <div className="flex items-start">
                                      <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                                      <span>{order.address.city}, {order.address.country} - {order.address.postalCode}</span>
                                    </div>
                                    <div className="flex items-start">
                                      <Phone className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                                      <span>{order.address.phone}</span>
                                    </div>
                                    <div className="flex items-start">
                                      <Mail className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                                      <span>{order.address.email}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Payment Information */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                    <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                                    Payment Information
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Payment Method:</span>
                                      <span className="font-medium">{order.paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Payment Status:</span>
                                      <span className={`font-medium ${order.payment ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {order.payment ? 'Paid' : 'Pending'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Subtotal:</span>
                                      <span className="font-medium">₹{order.amount + (order.discount || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Coupon Code:</span>
                                      <span className="font-medium">{order.couponCode ? order.couponCode : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Discount:</span>
                                      <span className="font-medium">-₹{order.discount || 0}</span>
                                    </div>

                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Order Total:</span>
                                      <span className="font-medium">₹{order.amount}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <ChevronUp className="w-5 h-5 transform rotate-270" />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-10 h-10 rounded-md ${
                            currentPage === i + 1
                              ? "bg-[#00a63d] text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <ChevronUp className="w-5 h-5 transform rotate-90" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <ReturnOrderModal
        isOpen={returnModalOpen}
        onClose={() => {
          setReturnModalOpen(false);
          setSelectedOrderForReturn(null);
        }}
        orderId={selectedOrderForReturn}
        onReturnRequested={handleReturnSubmitted}
      />
    </div>
  );
};

export default UserOrders;
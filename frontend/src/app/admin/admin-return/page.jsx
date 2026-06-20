// // pages/admin/AdminReturns.jsx
// "use client";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import toast, { Toaster } from "react-hot-toast";
// import {
//   Package,
//   Clock,
//   CheckCircle,
//   XCircle,
//   Truck,
//   RefreshCw,
//   AlertCircle,
//   FileText,
//   Calendar,
//   IndianRupee,
//   MapPin,
//   User,
//   Mail,
//   Phone,
//   Eye,
//   EyeOff,
//   Check,
//   X,
//   Search,
//   Filter,
//   Download,
//   MoreVertical,
//   ChevronDown,
//   ChevronUp,
//   Info,
//   ShoppingBag,
//   FileCheck,
//   ArrowLeftRight
// } from "lucide-react";

// const AdminReturns = () => {
//   const [returns, setReturns] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [expandedReturn, setExpandedReturn] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [selectedReturnId, setSelectedReturnId] = useState(null);
//   const [rejectionReason, setRejectionReason] = useState("");
//   const [showRejectModal, setShowRejectModal] = useState(false);
//   const [stats, setStats] = useState({
//     total: 0,
//     pending: 0,
//     approved: 0,
//     rejected: 0,
//     completed: 0
//   });

//   useEffect(() => {
//     fetchAllReturns();
//   }, []);

//   const fetchAllReturns = async () => {
//     setLoading(true);
//     try {
//       const { data } = await axios.get("http://localhost:5000/api/returns/all-returns");
//       if (data.success) {
//         setReturns(data.returnRequests || []);
//         calculateStats(data.returnRequests || []);
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to fetch return requests");
//     }
//     setLoading(false);
//   };

//   const calculateStats = (returnsData) => {
//     const statsData = {
//       total: returnsData.length,
//       pending: returnsData.filter(r => r.status === "pending").length,
//       approved: returnsData.filter(r => r.status === "approved").length,
//       rejected: returnsData.filter(r => r.status === "rejected").length,
//       completed: returnsData.filter(r => r.status === "completed").length
//     };
//     setStats(statsData);
//   };

//   const handleApproveReturn = async (returnId) => {
//     try {
//       const confirm = window.confirm("Are you sure you want to approve this return?");
//       if (!confirm) return;

//       const { data } = await axios.post(
//         "http://localhost:5000/api/returns/approve-return",
//         { returnId }
//       );

//       if (data.success) {
//         toast.success("Return approved successfully!");
//         fetchAllReturns();
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to approve return");
//     }
//   };

//   const handleRejectReturn = async () => {
//     if (!rejectionReason.trim()) {
//       toast.error("Please provide a rejection reason");
//       return;
//     }

//     try {
//       const { data } = await axios.post(
//         "http://localhost:5000/api/returns/reject-return",
//         { 
//           returnId: selectedReturnId,
//           rejectionReason 
//         }
//       );

//       if (data.success) {
//         toast.success("Return rejected successfully!");
//         setShowRejectModal(false);
//         setRejectionReason("");
//         setSelectedReturnId(null);
//         fetchAllReturns();
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to reject return");
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case "pending":
//         return <Clock className="w-4 h-4 text-yellow-500" />;
//       case "approved":
//         return <CheckCircle className="w-4 h-4 text-green-500" />;
//       case "rejected":
//         return <XCircle className="w-4 h-4 text-red-500" />;
//       case "completed":
//         return <Truck className="w-4 h-4 text-blue-500" />;
//       default:
//         return <AlertCircle className="w-4 h-4 text-gray-500" />;
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "pending":
//         return "bg-yellow-50 border border-yellow-200 text-yellow-700";
//       case "approved":
//         return "bg-green-50 border border-green-200 text-green-700";
//       case "rejected":
//         return "bg-red-50 border border-red-200 text-red-700";
//       case "completed":
//         return "bg-blue-50 border border-blue-200 text-blue-700";
//       default:
//         return "bg-gray-50 border border-gray-200 text-gray-700";
//     }
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getTimeAgo = (dateString) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffMs = now - date;
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMins / 60);
//     const diffDays = Math.floor(diffHours / 24);

//     if (diffDays > 0) return `${diffDays}d ago`;
//     if (diffHours > 0) return `${diffHours}h ago`;
//     if (diffMins > 0) return `${diffMins}m ago`;
//     return "Just now";
//   };

//   const toggleExpand = (returnId) => {
//     setExpandedReturn(expandedReturn === returnId ? null : returnId);
//   };

//   const filteredReturns = returns.filter(returnItem => {
//     const searchLower = searchTerm.toLowerCase();
//     const matchesSearch = 
//       returnItem.orderId?.toLowerCase().includes(searchLower) ||
//       returnItem._id?.toString().toLowerCase().includes(searchLower) ||
//       returnItem.userId?.name?.toLowerCase().includes(searchLower) ||
//       returnItem.userId?.email?.toLowerCase().includes(searchLower) ||
//       returnItem.userId?.number?.toLowerCase().includes(searchLower);

//     const matchesStatus = statusFilter === "all" || returnItem.status === statusFilter;

//     return matchesSearch && matchesStatus;
//   });

//   const SkeletonLoader = () => (
//     <div className="min-h-screen bg-gray-50">
//       <div className="py-8 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-7xl mx-auto">
//           <div className="animate-pulse">
//             <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
//               {[...Array(5)].map((_, i) => (
//                 <div key={i} className="bg-white p-4 rounded-xl border border-gray-200">
//                   <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
//                   <div className="h-8 bg-gray-200 rounded w-1/2"></div>
//                 </div>
//               ))}
//             </div>
//             <div className="bg-white rounded-xl border border-gray-200 p-6">
//               <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
//               <div className="space-y-3">
//                 {[...Array(5)].map((_, i) => (
//                   <div key={i} className="h-16 bg-gray-200 rounded"></div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   if (loading) {
//     return <SkeletonLoader />;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Toaster position="top-right" />

//       <div className="py-8 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className="mb-8">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//               <div>
//                 <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Return Requests</h1>
//                 <p className="text-gray-600 mt-2">Manage customer return requests and refunds</p>
//               </div>
//               <div className="flex items-center gap-3">
//                 <button
//                   onClick={fetchAllReturns}
//                   className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   <RefreshCw className="w-4 h-4" />
//                   Refresh
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
//             <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total Returns</p>
//                   <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
//                 </div>
//                 <div className="p-2 bg-gray-50 rounded-lg">
//                   <ShoppingBag className="w-5 h-5 text-gray-600" />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white border border-yellow-100 rounded-xl p-5 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Pending</p>
//                   <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
//                 </div>
//                 <div className="p-2 bg-yellow-50 rounded-lg">
//                   <Clock className="w-5 h-5 text-yellow-500" />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white border border-green-100 rounded-xl p-5 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Approved</p>
//                   <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
//                 </div>
//                 <div className="p-2 bg-green-50 rounded-lg">
//                   <CheckCircle className="w-5 h-5 text-green-500" />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white border border-red-100 rounded-xl p-5 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Rejected</p>
//                   <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
//                 </div>
//                 <div className="p-2 bg-red-50 rounded-lg">
//                   <XCircle className="w-5 h-5 text-red-500" />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Completed</p>
//                   <p className="text-2xl font-bold text-blue-600 mt-1">{stats.completed}</p>
//                 </div>
//                 <div className="p-2 bg-blue-50 rounded-lg">
//                   <Truck className="w-5 h-5 text-blue-500" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Search and Filters */}
//           <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
//             <div className="flex flex-col lg:flex-row lg:items-center gap-4">
//               <div className="flex-1">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type="text"
//                     placeholder="Search by Order ID, Return ID, Customer Name, Email or Phone..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
//                   />
//                 </div>
//               </div>
//               <div className="flex items-center gap-4">
//                 <div className="flex items-center gap-2">
//                   <Filter className="w-5 h-5 text-gray-400" />
//                   <select
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                     className="border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[140px]"
//                   >
//                     <option value="all">All Status</option>
//                     <option value="pending">Pending</option>
//                     <option value="approved">Approved</option>
//                     <option value="rejected">Rejected</option>
//                     <option value="completed">Completed</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Returns List */}
//           <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
//             {filteredReturns.length === 0 ? (
//               <div className="text-center py-12">
//                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <AlertCircle className="w-8 h-8 text-gray-400" />
//                 </div>
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">No return requests found</h3>
//                 <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for</p>
//               </div>
//             ) : (
//               <div className="divide-y divide-gray-200">
//                 {filteredReturns.map((returnItem) => (
//                   <div key={returnItem._id} className="hover:bg-gray-50 transition-colors">
//                     {/* Main Row */}
//                     <div className="p-6">
//                       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//                         <div className="flex-1">
//                           <div className="flex items-center gap-3 mb-3">
//                             <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(returnItem.status)}`}>
//                               {getStatusIcon(returnItem.status)}
//                               <span className="capitalize">{returnItem.status}</span>
//                             </span>
//                             <span className="text-xs text-gray-500">
//                               Requested {getTimeAgo(returnItem.requestedAt)}
//                             </span>
//                           </div>

//                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                             <div>
//                               <p className="text-sm font-medium text-gray-600 mb-1">Return ID</p>
//                               <p className="font-medium text-gray-900">
//                                 RET-{returnItem._id.toString().slice(-8).toUpperCase()}
//                               </p>
//                               <p className="text-sm text-gray-500 mt-1">
//                                 Order: {returnItem.orderId}
//                               </p>
//                             </div>

//                             <div>
//                               <p className="text-sm font-medium text-gray-600 mb-1">Customer</p>
//                               <p className="font-medium text-gray-900">
//                                 {returnItem.userId?.name || 'N/A'}
//                               </p>
//                               <p className="text-sm text-gray-500 mt-1">
//                                 {returnItem.userId?.email || 'N/A'}
//                               </p>
//                             </div>

//                             <div>
//                               <p className="text-sm font-medium text-gray-600 mb-1">Return Details</p>
//                               <div className="flex items-center gap-2">
//                                 <Package className="w-4 h-4 text-gray-400" />
//                                 <span className="font-medium">
//                                   {returnItem.returnItems?.length || 0} item(s)
//                                 </span>
//                               </div>
//                               <div className="flex items-center gap-2 mt-1">
//                                 <ArrowLeftRight className="w-4 h-4 text-gray-400" />
//                                 <span className="text-sm capitalize">{returnItem.returnType}</span>
//                               </div>
//                             </div>

//                             <div>
//                               <p className="text-sm font-medium text-gray-600 mb-1">Amount</p>
//                               <div className="flex items-center">
//                                 <IndianRupee className="w-4 h-4 mr-1" />
//                                 <span className="text-xl font-bold text-gray-900">
//                                   {returnItem.totalReturnAmount || 0}
//                                 </span>
//                               </div>
//                               <p className="text-sm text-gray-500 mt-1">
//                                 {returnItem.returnType === 'refund' ? 'Refund' : 'Exchange'} requested
//                               </p>
//                             </div>
//                           </div>

//                           <div className="mt-4">
//                             <p className="text-sm font-medium text-gray-600 mb-1">Reason</p>
//                             <p className="text-gray-900">{returnItem.reason}</p>
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-2">
//                           <button
//                             onClick={() => toggleExpand(returnItem._id)}
//                             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
//                           >
//                             {expandedReturn === returnItem._id ? 'Show Less' : 'View Details'}
//                             {expandedReturn === returnItem._id ? (
//                               <ChevronUp className="w-4 h-4" />
//                             ) : (
//                               <ChevronDown className="w-4 h-4" />
//                             )}
//                           </button>

//                           {returnItem.status === "pending" && (
//                             <div className="flex gap-2">
//                               <button
//                                 onClick={() => handleApproveReturn(returnItem._id)}
//                                 className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
//                               >
//                                 <Check className="w-4 h-4" />
//                                 Approve
//                               </button>
//                               <button
//                                 onClick={() => {
//                                   setSelectedReturnId(returnItem._id);
//                                   setShowRejectModal(true);
//                                 }}
//                                 className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
//                               >
//                                 <X className="w-4 h-4" />
//                                 Reject
//                               </button>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Expanded Details */}
//                     {expandedReturn === returnItem._id && (
//                       <div className="px-6 pb-6 border-t border-gray-200 pt-6">
//                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                           {/* Left Column */}
//                           <div className="space-y-6">
//                             {/* Return Items */}
//                             <div>
//                               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                                 <Package className="w-5 h-5" />
//                                 Items Selected for Return
//                               </h3>
//                               <div className="space-y-3">
//                                 {returnItem.returnItems?.map((item, index) => (
//                                   <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
//                                     <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
//                                       <img 
//                                         src={item.image} 
//                                         alt={item.name}
//                                         className="w-full h-full object-cover"
//                                         onError={(e) => {
//                                           e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
//                                         }}
//                                       />
//                                     </div>
//                                     <div className="flex-1 min-w-0">
//                                       <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
//                                       <div className="grid grid-cols-2 gap-4 text-sm">
//                                         <div>
//                                           <span className="text-gray-600">Quantity:</span>
//                                           <span className="ml-2 font-medium">{item.quantity} of {item.originalQuantity}</span>
//                                         </div>
//                                         <div>
//                                           <span className="text-gray-600">Price:</span>
//                                           <span className="ml-2 font-medium">
//                                             <IndianRupee className="inline w-3 h-3" />
//                                             {item.price}
//                                           </span>
//                                         </div>
//                                         <div>
//                                           <span className="text-gray-600">Total:</span>
//                                           <span className="ml-2 font-medium text-green-600">
//                                             <IndianRupee className="inline w-3 h-3" />
//                                             {item.totalAmount || item.price * item.quantity}
//                                           </span>
//                                         </div>
//                                         <div>
//                                           <span className="text-gray-600">Item ID:</span>
//                                           <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
//                                             {item.itemId?.slice(-6)}
//                                           </span>
//                                         </div>
//                                       </div>
//                                     </div>
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>

//                             {/* Return Summary */}
//                             <div>
//                               <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Summary</h3>
//                               <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
//                                 <div className="space-y-3">
//                                   <div className="flex justify-between">
//                                     <span className="text-gray-600">Return Type:</span>
//                                     <span className="font-medium capitalize">{returnItem.returnType}</span>
//                                   </div>
//                                   <div className="flex justify-between">
//                                     <span className="text-gray-600">Reason:</span>
//                                     <span className="font-medium">{returnItem.reason}</span>
//                                   </div>
//                                   {returnItem.additionalNotes && (
//                                     <div className="flex justify-between">
//                                       <span className="text-gray-600">Additional Notes:</span>
//                                       <span className="font-medium text-right max-w-xs">{returnItem.additionalNotes}</span>
//                                     </div>
//                                   )}
//                                   <div className="flex justify-between">
//                                     <span className="text-gray-600">Requested Date:</span>
//                                     <span className="font-medium">{formatDate(returnItem.requestedAt)}</span>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>

//                           {/* Right Column */}
//                           <div className="space-y-6">
//                             {/* Customer Details */}
//                             <div>
//                               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                                 <User className="w-5 h-5" />
//                                 Customer Details
//                               </h3>
//                               <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
//                                 <div className="space-y-3">
//                                   <div className="flex items-center gap-3">
//                                     <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
//                                       <User className="w-5 h-5 text-blue-600" />
//                                     </div>
//                                     <div>
//                                       <p className="font-medium text-gray-900">{returnItem.userId?.name || 'N/A'}</p>
//                                       <p className="text-sm text-gray-600">Customer ID: {returnItem.userId?._id?.slice(-8).toUpperCase()}</p>
//                                     </div>
//                                   </div>
//                                   <div className="space-y-2">
//                                     <div className="flex items-center gap-2">
//                                       <Mail className="w-4 h-4 text-gray-400" />
//                                       <span className="text-sm">{returnItem.userId?.email || 'N/A'}</span>
//                                     </div>
//                                     <div className="flex items-center gap-2">
//                                       <Phone className="w-4 h-4 text-gray-400" />
//                                       <span className="text-sm">{returnItem.userId?.number || 'N/A'}</span>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>

//                             {/* Order Details */}
//                             <div>
//                               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                                 <FileCheck className="w-5 h-5" />
//                                 Order Details
//                               </h3>
//                               <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
//                                 <div className="space-y-3">
//                                   <div className="flex justify-between">
//                                     <span className="text-gray-600">Original Order Amount:</span>
//                                     <span className="font-medium">
//                                       <IndianRupee className="inline w-3 h-3" />
//                                       {returnItem.orderDetails?.originalOrderAmount || returnItem.orderDetails?.amount || 0}
//                                     </span>
//                                   </div>
//                                   <div className="flex justify-between">
//                                     <span className="text-gray-600">Return Amount:</span>
//                                     <span className="font-medium text-green-600">
//                                       <IndianRupee className="inline w-3 h-3" />
//                                       {returnItem.totalReturnAmount || 0}
//                                     </span>
//                                   </div>
//                                   <div className="flex justify-between">
//                                     <span className="text-gray-600">Total Items in Order:</span>
//                                     <span className="font-medium">{returnItem.orderDetails?.items?.length || 0} items</span>
//                                   </div>
//                                   <div className="flex justify-between">
//                                     <span className="text-gray-600">Items Returning:</span>
//                                     <span className="font-medium">{returnItem.returnItems?.length || 0} items</span>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>

//                             {/* Shipping Address */}
//                             <div>
//                               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                                 <MapPin className="w-5 h-5" />
//                                 Shipping Address
//                               </h3>
//                               <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
//                                 {returnItem.orderDetails?.address ? (
//                                   <div className="space-y-2">
//                                     <p className="font-medium">{returnItem.orderDetails.address.fullName}</p>
//                                     <p className="text-gray-900">{returnItem.orderDetails.address.address1}</p>
//                                     {returnItem.orderDetails.address.address2 && (
//                                       <p className="text-gray-900">{returnItem.orderDetails.address.address2}</p>
//                                     )}
//                                     <p className="text-gray-900">
//                                       {returnItem.orderDetails.address.city}, {returnItem.orderDetails.address.state} - {returnItem.orderDetails.address.postalCode}
//                                     </p>
//                                     <div className="pt-2 border-t border-gray-200">
//                                       <div className="flex items-center gap-2 text-sm">
//                                         <Phone className="w-4 h-4 text-gray-400" />
//                                         <span>{returnItem.orderDetails.address.phone}</span>
//                                       </div>
//                                       <div className="flex items-center gap-2 text-sm mt-1">
//                                         <Mail className="w-4 h-4 text-gray-400" />
//                                         <span>{returnItem.orderDetails.address.email}</span>
//                                       </div>
//                                     </div>
//                                   </div>
//                                 ) : (
//                                   <p className="text-gray-500">No address information available</p>
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Reject Modal */}
//       {showRejectModal && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
//             <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowRejectModal(false)}></div>
//             <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
//             <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="p-2 bg-red-50 rounded-lg">
//                   <XCircle className="w-6 h-6 text-red-600" />
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900">Reject Return Request</h3>
//                   <p className="text-sm text-gray-600 mt-1">This action cannot be undone</p>
//                 </div>
//               </div>

//               <div className="mb-6">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Reason for Rejection *
//                 </label>
//                 <textarea
//                   value={rejectionReason}
//                   onChange={(e) => setRejectionReason(e.target.value)}
//                   rows="4"
//                   placeholder="Please provide a detailed reason for rejecting this return request..."
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
//                   required
//                 />
//                 <p className="text-xs text-gray-500 mt-2">This reason will be shared with the customer</p>
//               </div>

//               <div className="flex justify-end gap-3">
//                 <button
//                   onClick={() => {
//                     setShowRejectModal(false);
//                     setRejectionReason("");
//                     setSelectedReturnId(null);
//                   }}
//                   className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleRejectReturn}
//                   className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
//                 >
//                   Confirm Rejection
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminReturns;



// AdminReturns.jsx - Complete updated version
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
  AlertCircle,
  IndianRupee,
  User,
  Mail,
  Phone,
  Check,
  X,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Loader,
  Home,
  MapPin,
  Calendar,
  AlertTriangle,
  RotateCcw,
  CheckSquare,
  Eye
} from "lucide-react";

const AdminReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedReturn, setExpandedReturn] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReturnId, setSelectedReturnId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processingAction, setProcessingAction] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackingData, setTrackingData] = useState(null);

  useEffect(() => {
    fetchAllReturns();
  }, []);

  const fetchAllReturns = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/returns/all-returns");
      if (data.success) {
        setReturns(data.returnRequests || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch return requests");
    }
    setLoading(false);
  };

  const handleApproveReturn = async (returnId) => {
    try {
      const confirm = window.confirm("Are you sure you want to approve this return?");
      if (!confirm) return;

      setProcessingAction({ type: 'approve', id: returnId });

      const { data } = await axios.post(
        "http://localhost:5000/api/returns/approve-return",
        { returnId }
      );

      if (data.success) {
        toast.success("Return approved successfully!");
        fetchAllReturns();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve return");
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRejectReturn = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      setProcessingAction({ type: 'reject', id: selectedReturnId });

      const { data } = await axios.post(
        "http://localhost:5000/api/returns/reject",
        {
          returnId: selectedReturnId,
          rejectionReason
        }
      );

      if (data.success) {
        toast.success("Return rejected successfully!");
        setShowRejectModal(false);
        setRejectionReason("");
        setSelectedReturnId(null);
        fetchAllReturns();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject return");
    } finally {
      setProcessingAction(null);
    }
  };

  const handlePushToShipmozo = async (returnId) => {
    try {
      const confirm = window.confirm("Schedule pickup with Shipmozo? This will generate AWB and schedule return pickup.");
      if (!confirm) return;

      setProcessingAction({ type: 'shipmozo', id: returnId });

      const { data } = await axios.post(
        "http://localhost:5000/api/returns/push-to-shipmozo",
        { returnId }
      );

      if (data.success) {
        toast.success("Return scheduled for pickup!");

        // Show success notification with details
        setTimeout(() => {
          toast.custom((t) => (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md">
              <div className="flex items-start">
                <Truck className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Return Pickup Scheduled!</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-green-700">AWB: {data.data.shipmozo.awbNumber}</p>
                    <p className="text-sm text-green-600">Pickup scheduled for tomorrow</p>
                  </div>
                </div>
              </div>
            </div>
          ));
        }, 100);

        fetchAllReturns();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to schedule pickup");
    } finally {
      setProcessingAction(null);
    }
  };

  const handleConfirmReturn = async (returnId) => {
    try {
      const confirm = window.confirm("Have you received and verified the returned items at warehouse?");
      if (!confirm) return;

      setProcessingAction({ type: 'confirm', id: returnId });

      const { data } = await axios.post(
        "http://localhost:5000/api/returns/confirm-received",
        { returnId }
      );

      if (data.success) {
        toast.success(data.message);
        fetchAllReturns();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to confirm return");
    } finally {
      setProcessingAction(null);
    }
  };



  // Add this function to handle refund processing
  const handleProcessRefund = async (returnId) => {
    try {
      const confirm = window.confirm("Are you sure you want to process the refund? This action cannot be undone.");
      if (!confirm) return;

      setProcessingAction({ type: 'refund', id: returnId });

      const { data } = await axios.post(
        "http://localhost:5000/api/returns/process-refund",
        { returnId }
      );

      if (data.success) {
        toast.success(data.message);

        // Show success notification with transaction ID
        toast.custom((t) => (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Refund Processed Successfully!</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-green-700">Transaction ID: {data.refundDetails?.transactionId}</p>
                  <p className="text-sm text-green-600">Amount: ₹{data.refundDetails?.amount}</p>
                </div>
              </div>
            </div>
          </div>
        ));

        fetchAllReturns();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process refund");
    } finally {
      setProcessingAction(null);
    }
  };

  const handleTrackReturn = async (returnId) => {
    try {
      setProcessingAction({ type: 'track', id: returnId });

      const { data } = await axios.get(
        `http://localhost:5000/api/returns/tracking/${returnId}`
      );

      if (data.success) {
        setTrackingData(data.returnRequest);
        setShowTrackModal(true);
      }
    } catch (error) {
      toast.error("Failed to fetch tracking info");
    } finally {
      setProcessingAction(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "approved": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected": return <XCircle className="w-4 h-4 text-red-500" />;
      case "picked_up": return <Truck className="w-4 h-4 text-blue-500" />;
      case "completed": return <CheckSquare className="w-4 h-4 text-purple-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "approved": return "bg-green-100 text-green-800 border border-green-200";
      case "rejected": return "bg-red-100 text-red-800 border border-red-200";
      case "picked_up": return "bg-blue-100 text-blue-800 border border-blue-200";
      case "completed": return "bg-purple-100 text-purple-800 border border-purple-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReturnActions = (returnItem) => {
    const isProcessing = processingAction?.id === returnItem._id &&
      processingAction?.type !== 'approve' &&
      processingAction?.type !== 'reject';

    switch (returnItem.status) {
      case 'pending':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleApproveReturn(returnItem._id)}
              disabled={processingAction?.id === returnItem._id}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {processingAction?.id === returnItem._id && processingAction?.type === 'approve' ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Approve
            </button>
            <button
              onClick={() => {
                setSelectedReturnId(returnItem._id);
                setShowRejectModal(true);
              }}
              disabled={processingAction?.id === returnItem._id}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Reject
            </button>
          </div>
        );

      case 'approved':
        if (!returnItem.shipmozoReturn || returnItem.shipmozoReturn.status === 'pending') {
          return (
            <button
              onClick={() => handlePushToShipmozo(returnItem._id)}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  Schedule Pickup
                </>
              )}
            </button>
          );
        } else if (returnItem.shipmozoReturn.status === 'pushed') {
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTrackReturn(returnItem._id)}
                disabled={isProcessing}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {isProcessing ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                Track
              </button>
              <button
                onClick={() => handleConfirmReturn(returnItem._id)}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4" />
                    Confirm Return
                  </>
                )}
              </button>
            </div>
          );
        }
        break;

      // case 'completed':
      //   return (
      //     <div className="flex items-center gap-2">
      //       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
      //         <CheckSquare className="w-4 h-4 mr-1" />
      //         Completed
      //       </span>
      //       {returnItem.returnType === 'refund' && returnItem.refundDetails?.status === 'processed' && (
      //         <span className="text-xs text-green-600">
      //           Refunded: ₹{returnItem.totalReturnAmount}
      //         </span>
      //       )}
      //     </div>
      //   );
      case 'completed':
        // Check if refund needs to be processed
        if (returnItem.returnType === 'refund' &&
          returnItem.returnStatus === 'ready_for_refund' &&
          returnItem.refundDetails?.status !== 'processed') {

          const order = returnItem.orderDetails;
          const isOnlinePayment = order?.paymentMethod && order.paymentMethod !== 'COD';

          return (
            <div className="flex flex-col sm:flex-row gap-2">
              {isOnlinePayment ? (
                <button
                  onClick={() => handleProcessRefund(returnItem._id)}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Process Refund
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleProcessRefund(returnItem._id)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Mark as Refunded
                      </>
                    )}
                  </button>
                  <span className="text-xs text-gray-500">(Bank Transfer)</span>
                </div>
              )}
            </div>
          );
        } else if (returnItem.refundDetails?.status === 'processed') {
          return (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-1" />
                Refunded
              </span>
              <span className="text-xs text-green-600">
                ₹{returnItem.totalReturnAmount}
              </span>
            </div>
          );
        }
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <CheckSquare className="w-4 h-4 mr-1" />
            Completed
          </span>
        );


      case 'picked_up':
        return (
          <button
            onClick={() => handleConfirmReturn(returnItem._id)}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4" />
                Confirm Return
              </>
            )}
          </button>
        );

      default:
        return null;
    }
  };

  const getShipmozoStatus = (returnItem) => {
    if (!returnItem.shipmozoReturn) return null;

    switch (returnItem.shipmozoReturn.status) {
      case 'pushed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Truck className="w-3 h-3 mr-1" />
            Pickup Scheduled
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Shipmozo Failed
          </span>
        );
      default:
        return null;
    }
  };

  const filteredReturns = returns.filter(returnItem => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      returnItem.orderId?.toLowerCase().includes(searchLower) ||
      returnItem._id?.toString().toLowerCase().includes(searchLower) ||
      returnItem.userId?.name?.toLowerCase().includes(searchLower) ||
      returnItem.userId?.email?.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === "all" || returnItem.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading returns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Return Management</h1>
                <p className="text-gray-600 mt-2">Manage returns and schedule pickups</p>
              </div>
              <button
                onClick={fetchAllReturns}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition mt-4 md:mt-0"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {['Total', 'Pending', 'Approved', 'Picked Up', 'Completed'].map((stat, idx) => {
                const count = returns.filter(r =>
                  stat === 'Total' ? true :
                    stat === 'Picked Up' ? r.status === 'picked_up' :
                      r.status === stat.toLowerCase()
                ).length;

                const colors = [
                  'bg-blue-50 border-blue-100 text-blue-700',
                  'bg-yellow-50 border-yellow-100 text-yellow-700',
                  'bg-green-50 border-green-100 text-green-700',
                  'bg-blue-50 border-blue-100 text-blue-700',
                  'bg-purple-50 border-purple-100 text-purple-700'
                ];

                return (
                  <div key={idx} className={`border rounded-lg p-4 ${colors[idx]}`}>
                    <p className="text-sm font-medium mb-1">{stat}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                );
              })}
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by Order ID, Return ID, Customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[150px]"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="picked_up">Picked Up</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Returns List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            {filteredReturns.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No returns found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredReturns.map((returnItem) => (
                  <div key={returnItem._id} className="hover:bg-gray-50 transition-colors">
                    {/* Main Row */}
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(returnItem.status)}`}>
                              {getStatusIcon(returnItem.status)}
                              <span className="capitalize">{returnItem.status.replace('_', ' ')}</span>
                            </span>
                            {getShipmozoStatus(returnItem)}
                            <span className="text-xs text-gray-500">
                              {formatDate(returnItem.requestedAt)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">Return ID</p>
                              <p className="font-medium text-gray-900">
                                RET-{returnItem._id.toString().slice(-8).toUpperCase()}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Order: {returnItem.orderId}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">Customer</p>
                              <p className="font-medium text-gray-900">
                                {returnItem.userId?.name || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {returnItem.userId?.email || 'N/A'}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">Return Details</p>
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">
                                  {returnItem.returnItems?.length || 0} item(s)
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <IndianRupee className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">₹{returnItem.totalReturnAmount || 0}</span>
                                <span className="text-sm capitalize">({returnItem.returnType})</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-sm">
                              <span className="font-medium">Reason:</span> {returnItem.reason}
                            </p>
                            {returnItem.additionalNotes && (
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Notes:</span> {returnItem.additionalNotes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setExpandedReturn(expandedReturn === returnItem._id ? null : returnItem._id)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            {expandedReturn === returnItem._id ? 'Hide Details' : 'View Details'}
                            {expandedReturn === returnItem._id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>

                          {getReturnActions(returnItem)}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedReturn === returnItem._id && (
                      <div className="px-6 pb-6 border-t border-gray-200 pt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Left Column */}
                          <div className="space-y-6">
                            {/* Return Items */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Items for Return</h3>
                              <div className="space-y-3">
                                {returnItem.returnItems?.map((item, index) => (
                                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                                        }}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <span className="text-gray-600">Quantity:</span>
                                          <span className="ml-2 font-medium">{item.quantity}</span>
                                        </div>
                                        <div>
                                          <span className="text-gray-600">Price:</span>
                                          <span className="ml-2 font-medium">₹{item.price}</span>
                                        </div>
                                        <div>
                                          <span className="text-gray-600">Total:</span>
                                          <span className="ml-2 font-medium text-green-600">₹{item.totalAmount}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Shipmozo Details */}
                            {returnItem.shipmozoReturn && (
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                  <Truck className="w-5 h-5 text-blue-500" />
                                  Shipmozo Details
                                </h3>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium text-blue-700">Status</p>
                                      <p className="text-sm capitalize">{returnItem.shipmozoReturn.status}</p>
                                    </div>
                                    {returnItem.shipmozoReturn.awbNumber && (
                                      <div>
                                        <p className="text-sm font-medium text-blue-700">AWB Number</p>
                                        <p className="text-sm font-mono">{returnItem.shipmozoReturn.awbNumber}</p>
                                      </div>
                                    )}
                                    {returnItem.shipmozoReturn.pushedAt && (
                                      <div>
                                        <p className="text-sm font-medium text-blue-700">Scheduled On</p>
                                        <p className="text-sm">{formatDate(returnItem.shipmozoReturn.pushedAt)}</p>
                                      </div>
                                    )}
                                    {returnItem.shipmozoReturn.pickupDetails?.scheduledDate && (
                                      <div>
                                        <p className="text-sm font-medium text-blue-700">Pickup Date</p>
                                        <p className="text-sm">{formatDate(returnItem.shipmozoReturn.pickupDetails.scheduledDate)}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {returnItem.refundDetails && (
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Refund Details</h3>
                                <div className={`p-4 rounded-lg ${returnItem.refundDetails.status === 'processed'
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-yellow-50 border border-yellow-200'
                                  }`}>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium">Status</p>
                                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${returnItem.refundDetails.status === 'processed'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {returnItem.refundDetails.status === 'processed' ? 'Processed' : 'Pending'}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Amount</p>
                                      <p className="font-medium">₹{returnItem.totalReturnAmount}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Method</p>
                                      <p className="text-sm">{returnItem.refundDetails.method}</p>
                                    </div>
                                    {returnItem.refundDetails.processedAt && (
                                      <div>
                                        <p className="text-sm font-medium">Processed On</p>
                                        <p className="text-sm">{formatDate(returnItem.refundDetails.processedAt)}</p>
                                      </div>
                                    )}
                                    {returnItem.refundDetails.transactionId && (
                                      <div className="md:col-span-2">
                                        <p className="text-sm font-medium">Transaction ID</p>
                                        <p className="text-sm font-mono">{returnItem.refundDetails.transactionId}</p>
                                      </div>
                                    )}
                                    {returnItem.refundDetails.bankDetails && (
                                      <div className="md:col-span-2">
                                        <h4 className="text-sm font-medium mb-2">Bank Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3 rounded border">
                                          <div>
                                            <p className="text-xs text-gray-600">Account Holder</p>
                                            <p className="text-sm">{returnItem.refundDetails.bankDetails.accountHolderName}</p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-600">Account Number</p>
                                            <p className="text-sm font-mono">{returnItem.refundDetails.bankDetails.accountNumber}</p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-600">IFSC Code</p>
                                            <p className="text-sm font-mono">{returnItem.refundDetails.bankDetails.ifscCode}</p>
                                          </div>
                                          {returnItem.refundDetails.bankDetails.bankName && (
                                            <div>
                                              <p className="text-xs text-gray-600">Bank Name</p>
                                              <p className="text-sm">{returnItem.refundDetails.bankDetails.bankName}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right Column */}
                          <div className="space-y-6">
                            {/* Customer Details */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
                              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                      <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{returnItem.userId?.name || 'N/A'}</p>
                                      <p className="text-sm text-gray-600">{returnItem.userId?.email || 'N/A'}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm">{returnItem.userId?.number || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Pickup Address */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pickup Address</h3>
                              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                                {returnItem.orderDetails?.address ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Home className="w-4 h-4 text-gray-400" />
                                      <span className="font-medium">{returnItem.orderDetails.address.fullName}</span>
                                    </div>
                                    <p className="text-gray-900">{returnItem.orderDetails.address.address1}</p>
                                    {returnItem.orderDetails.address.address2 && (
                                      <p className="text-gray-900">{returnItem.orderDetails.address.address2}</p>
                                    )}
                                    <p className="text-gray-900">
                                      {returnItem.orderDetails.address.city}, {returnItem.orderDetails.address.state} - {returnItem.orderDetails.address.postalCode}
                                    </p>
                                    <div className="pt-2 border-t border-gray-200">
                                      <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>{returnItem.orderDetails.address.phone}</span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-gray-500">No address information</p>
                                )}
                              </div>
                            </div>

                            {/* Timeline */}
                            {returnItem.returnTimeline && returnItem.returnTimeline.length > 0 && (
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Timeline</h3>
                                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                                  <div className="space-y-3">
                                    {returnItem.returnTimeline.map((event, idx) => (
                                      <div key={idx} className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                                        <div className="flex-1">
                                          <p className="text-sm font-medium text-gray-900">{event.description}</p>
                                          <p className="text-xs text-gray-500">{formatDate(event.date)}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reject Return Request</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows="4"
                placeholder="Please provide a detailed reason for rejecting this return request..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setSelectedReturnId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectReturn}
                disabled={processingAction?.id === selectedReturnId}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {processingAction?.id === selectedReturnId ? (
                  <span className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Confirm Rejection"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {showTrackModal && trackingData && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Return Tracking Details</h2>
              <button
                onClick={() => {
                  setShowTrackModal(false);
                  setTrackingData(null);
                }}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Return #{trackingData.id?.slice(-8).toUpperCase()}</h3>
                    <p className="text-sm text-gray-600">Order: {trackingData.orderId}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingData.status)}`}>
                    {getStatusIcon(trackingData.status)}
                    <span className="ml-1 capitalize">{trackingData.status?.replace('_', ' ')}</span>
                  </span>
                </div>
              </div>

              {trackingData.shipmozoReturn && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Shipmozo Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-blue-700">AWB Number</p>
                      <p className="text-lg font-mono">{trackingData.shipmozoReturn.awbNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">Return Order ID</p>
                      <p className="text-sm font-mono">{trackingData.shipmozoReturn.returnOrderId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">Pickup Status</p>
                      <p className="text-sm capitalize">{trackingData.shipmozoReturn.pickupDetails?.pickupStatus || 'pending'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">Scheduled Date</p>
                      <p className="text-sm">{formatDate(trackingData.shipmozoReturn.pickupDetails?.scheduledDate)}</p>
                    </div>
                  </div>
                </div>
              )}

              {trackingData.tracking && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Tracking History</h4>
                  <div className="space-y-3">
                    {trackingData.tracking.scan_detail?.map((scan, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{scan.status}</p>
                          <p className="text-sm text-gray-600">{scan.remarks || scan.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{scan.location} • {scan.date ? formatDate(scan.date) : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReturns;
// pages/UserReturns.jsx
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
  AlertCircle,
  FileText,
  Calendar,
  IndianRupee,
  MapPin,
  User,
  Mail,
  Phone,
  Eye,
  EyeOff,
  CheckSquare,
  XSquare,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";
import Header from "../componats/Header";
import Footer from "../componats/Footer";

const UserReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedReturn, setExpandedReturn] = useState(null);
  const [userId, setUserId] = useState(null);

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
    if (userId) fetchReturns();
  }, [userId]);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("${process.env.NEXT_PUBLIC_API_URL}/api/returns/my-returns", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setReturns(data.returnRequests || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch return requests");
    }
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "completed":
        return <Truck className="w-4 h-4 text-blue-500" />;
      case "picked_up":
        return <Truck className="w-4 h-4 text-purple-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "picked_up":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const toggleExpand = (returnId) => {
    setExpandedReturn(expandedReturn === returnId ? null : returnId);
  };

  // Skeleton Loader
  const SkeletonLoader = () => (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 border-t border-gray-300 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="border rounded-xl p-4 animate-pulse">
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-6 w-48 bg-gray-200 rounded"></div>
                    <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-64 bg-gray-200 rounded"></div>
                    <div className="h-4 w-56 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 border-t border-gray-300 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <Toaster position="top-right" />
        
        <div className="max-w-8xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Return Requests</h1>
                <p className="text-gray-600 mt-2">Track and manage your return requests</p>
              </div>
              <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg flex items-center">
                <RefreshCw className="w-5 h-5 mr-2" />
                <span>{returns.length} return{returns.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {returns.length === 0 ? (
              <div className="text-center py-12">
                <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No return requests yet</h3>
                <p className="text-gray-500 mb-4">You haven't requested any returns yet.</p>
                <Link 
                  href="/user/orders"
                  className="inline-flex items-center px-6 py-2 bg-[#00a63d] text-white rounded-lg hover:bg-[#00a63d] transition"
                >
                  <Package className="w-5 h-5 mr-2" />
                  View My Orders
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {returns.map((returnItem) => {
                  const hasReturnItems = returnItem.returnItems && returnItem.returnItems.length > 0;
                  const displayItems = hasReturnItems ? returnItem.returnItems : returnItem.orderDetails?.items;
                  
                  return (
                    <div key={returnItem._id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                      {/* Return Header */}
                      <div className="bg-gray-50 px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="mb-3 sm:mb-0">
                            <div className="flex items-center">
                              <div className="bg-purple-100 p-2 rounded-lg mr-4">
                                <RefreshCw className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  Return #{returnItem._id.toString().slice(-8).toUpperCase()}
                                </h3>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  <span>Requested on {formatDate(returnItem.requestedAt)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 ml-12">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                  <FileText className="w-4 h-4 mr-2 text-gray-400" />
                                  <span className="text-sm text-gray-600">
                                    Order #{returnItem.orderId}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <ShoppingBag className="w-4 h-4 mr-2 text-gray-400" />
                                  <span className="text-sm text-gray-600">
                                    {hasReturnItems ? returnItem.returnItems.length : returnItem.orderDetails?.items?.length || 0} item(s)
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:items-end space-y-2">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(returnItem.status)}`}>
                              {getStatusIcon(returnItem.status)}
                              <span className="ml-1.5 capitalize">{returnItem.status}</span>
                            </div>
                            <div className="text-sm font-medium text-gray-700">
                              {returnItem.returnType === 'refund' ? 'Refund' : 'Exchange'}
                              {returnItem.totalReturnAmount && (
                                <span className="ml-2 font-bold">
                                  ₹{returnItem.totalReturnAmount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Return Content */}
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          {/* Reason & Details */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                                Return Reason
                              </h4>
                              <p className="text-gray-700 bg-orange-50 p-3 rounded-lg">{returnItem.reason}</p>
                            </div>
                            {returnItem.additionalNotes && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{returnItem.additionalNotes}</p>
                              </div>
                            )}
                            {returnItem.rejectionReason && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2 text-red-600 flex items-center">
                                  <XSquare className="w-5 h-5 mr-2" />
                                  Rejection Reason
                                </h4>
                                <p className="text-red-700 bg-red-50 p-3 rounded-lg">{returnItem.rejectionReason}</p>
                              </div>
                            )}
                          </div>

                          {/* Return Items */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                              {hasReturnItems ? (
                                <>
                                  <CheckSquare className="w-5 h-5 mr-2 text-green-600" />
                                  Selected Items for Return
                                </>
                              ) : (
                                <>
                                  <Package className="w-5 h-5 mr-2 text-blue-600" />
                                  All Order Items
                                </>
                              )}
                            </h4>
                            <div className="space-y-3">
                              {displayItems?.map((item, index) => (
                                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                    {item.image ? (
                                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                        <Package className="w-6 h-6 text-gray-500" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{item.name}</p>
                                    <div className="flex items-center justify-between mt-1">
                                      <div className="text-sm text-gray-500">
                                        <p>
                                          Return Qty: {item.quantity} 
                                          {item.originalQuantity && (
                                            <span className="text-gray-400"> of {item.originalQuantity}</span>
                                          )}
                                        </p>
                                        <p>Price: ₹{item.price} each</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold text-gray-900">
                                          <IndianRupee className="inline w-3 h-3" />
                                          {item.totalAmount || (item.price * item.quantity)}
                                        </p>
                                        {hasReturnItems && (
                                          <p className="text-xs text-green-600 mt-1">
                                            Selected for return
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Return Summary */}
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Total Items:</p>
                                  <p className="text-lg font-bold text-gray-900">
                                    {displayItems?.length || 0}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-700">Total Return Amount:</p>
                                  <p className="text-lg font-bold text-green-600">
                                    <IndianRupee className="inline w-4 h-4" />
                                    {returnItem.totalReturnAmount || returnItem.orderDetails?.amount || 0}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Timeline & Actions */}
                        <div className="border-t border-gray-200 pt-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="mb-4 sm:mb-0">
                              <p className="font-bold text-lg text-gray-900">
                                Total Return Amount: 
                                <IndianRupee className="inline w-5 h-5 ml-1" />
                                {returnItem.totalReturnAmount || returnItem.orderDetails?.amount || 0}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {returnItem.returnType === 'refund' ? 
                                  'Refund will be processed to original payment method' :
                                  'Exchange items will be shipped after return pickup'
                                }
                              </p>
                              {returnItem.refundDetails?.amount && (
                                <p className="text-sm font-medium text-green-600 mt-1">
                                  Refund Amount: ₹{returnItem.refundDetails.amount}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-3">
                              <button
                                onClick={() => toggleExpand(returnItem._id)}
                                className="flex items-center text-[#00a63d] hover:text-[#00a63d] transition"
                              >
                                {expandedReturn === returnItem._id ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-1" />
                                    Hide Details
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-1" />
                                    View Details
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {expandedReturn === returnItem._id && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Timeline */}
                                <div className="space-y-4">
                                  <h4 className="font-medium text-gray-900 mb-3">Return Timeline</h4>
                                  <div className="space-y-3">
                                    <div className="flex items-start">
                                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-1">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">Request Submitted</p>
                                        <p className="text-sm text-gray-500">{formatDate(returnItem.requestedAt)}</p>
                                      </div>
                                    </div>
                                    
                                    {returnItem.approvedAt && (
                                      <div className="flex items-start">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1">
                                          <CheckCircle className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                          <p className="font-medium text-gray-900">Approved</p>
                                          <p className="text-sm text-gray-500">{formatDate(returnItem.approvedAt)}</p>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {returnItem.rejectedAt && (
                                      <div className="flex items-start">
                                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3 mt-1">
                                          <XCircle className="w-4 h-4 text-red-600" />
                                        </div>
                                        <div>
                                          <p className="font-medium text-gray-900">Rejected</p>
                                          <p className="text-sm text-gray-500">{formatDate(returnItem.rejectedAt)}</p>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {returnItem.completedAt && (
                                      <div className="flex items-start">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-1">
                                          <Truck className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                          <p className="font-medium text-gray-900">Completed</p>
                                          <p className="text-sm text-gray-500">{formatDate(returnItem.completedAt)}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Shipping Address */}
                                {returnItem.orderDetails?.address && (
                                  <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900 mb-3">Pickup Address</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                      <div className="space-y-2 text-gray-700">
                                        <div className="flex items-start">
                                          <User className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
                                          <span>{returnItem.orderDetails.address.fullName}</span>
                                        </div>
                                        <div className="flex items-start">
                                          <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
                                          <span>
                                            {returnItem.orderDetails.address.address1}, 
                                            {returnItem.orderDetails.address.address2 && ` ${returnItem.orderDetails.address.address2},`}
                                            <br />
                                            {returnItem.orderDetails.address.city}, {returnItem.orderDetails.address.state} - {returnItem.orderDetails.address.postalCode}
                                          </span>
                                        </div>
                                        <div className="flex items-start">
                                          <Phone className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
                                          <span>{returnItem.orderDetails.address.phone}</span>
                                        </div>
                                        <div className="flex items-start">
                                          <Mail className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
                                          <span>{returnItem.orderDetails.address.email}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Refund/Exchange Details */}
                              {(returnItem.refundDetails || returnItem.exchangeDetails) && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                  <h4 className="font-medium text-gray-900 mb-3">
                                    {returnItem.returnType === 'refund' ? 'Refund Details' : 'Exchange Details'}
                                  </h4>
                                  {returnItem.returnType === 'refund' && returnItem.refundDetails && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm text-gray-600">Refund Amount</p>
                                          <p className="font-semibold text-lg">
                                            <IndianRupee className="inline w-4 h-4" />
                                            {returnItem.refundDetails.amount || returnItem.totalReturnAmount}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600">Refund Method</p>
                                          <p className="font-medium">{returnItem.refundDetails.method || 'Original Payment Method'}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600">Status</p>
                                          <p className={`font-medium capitalize ${
                                            returnItem.refundDetails.status === 'completed' ? 'text-green-600' :
                                            returnItem.refundDetails.status === 'pending' ? 'text-yellow-600' :
                                            'text-blue-600'
                                          }`}>
                                            {returnItem.refundDetails.status || 'pending'}
                                          </p>
                                        </div>
                                        {returnItem.refundDetails.transactionId && (
                                          <div>
                                            <p className="text-sm text-gray-600">Transaction ID</p>
                                            <p className="font-medium text-sm">{returnItem.refundDetails.transactionId}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {returnItem.returnType === 'exchange' && returnItem.exchangeDetails && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm text-gray-600">Exchange Items</p>
                                          <p className="font-medium">{returnItem.exchangeDetails.newItemName || 'To be confirmed'}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600">Status</p>
                                          <p className="font-medium">{returnItem.exchangeDetails.status || 'pending'}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserReturns;
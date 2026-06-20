"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";
import {
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
  FileText,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  Search,
  Filter,
  FileSpreadsheet,
  Printer,
  MoreVertical,
  X,
  Loader,
  ExternalLink,
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  ArrowUpDown
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [invoicePdfUrl, setInvoicePdfUrl] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'descending' });
  const exportMenuRef = useRef(null);
  const ordersPerPage = 8;

  // Stats for dashboard
  const stats = {
    total: orders.length,
    pending: orders.filter(order => order.status === "Order Placed").length,
    delivered: orders.filter(order => order.status === "Delivered").length,
    revenue: orders.reduce((sum, order) => sum + order.amount, 0)
  };

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/order/all");
      setOrders(data.orders);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // Close export menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setIsExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const changeStatus = async (orderid, status) => {
  setUpdatingOrder(orderid);
  try {
    const { data } = await axios.put("http://localhost:5000/api/order/status", { orderid, status });
    toast.success(data.message);
    
    // ✅ If status is "Delivered", also update COD payment status
    if (status === "Delivered") {
      try {
        const codResponse = await axios.post("http://localhost:5000/api/order/cod-payment-status", { 
          orderid, 
          status: "delivered" // Send lowercase for backend consistency
        });
        if (codResponse.data.paymentUpdated) {
          toast.success("COD payment marked as completed");
        }
      } catch (codError) {
        console.warn("COD payment update warning:", codError.response?.data?.message);
        // Don't show error toast for this, as status update was successful
      }
    }
    
    fetchAllOrders();
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update order");
  }
  setUpdatingOrder(null);
};



  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const viewInvoice = (order) => {
    const doc = generateInvoiceDocument(order);
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setInvoicePdfUrl(pdfUrl);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Order Placed":
        return <Package className="w-4 h-4" />;
      case "Shipped":
        return <Truck className="w-4 h-4" />;
      case "Delivered":
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

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Sorting functionality
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting to orders
  const getSortedOrders = () => {
    if (!sortConfig.key) return orders;
    
    return [...orders].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  // Filter orders based on search term, status, and date
  const filteredOrders = getSortedOrders().filter(order => {
  const search = searchTerm.toLowerCase();

  const matchesSearch =
    (order.orderid || "").toLowerCase().includes(search) ||
    (order.address?.firstName || "").toLowerCase().includes(search) ||
    (order.address?.lastName || "").toLowerCase().includes(search) ||
    (order.address?.email || "").toLowerCase().includes(search);

  const matchesStatus = statusFilter === "all" || order.status === statusFilter;

  const matchesDate = !dateFilter || formatDateForInput(order.createdAt) === dateFilter;

  return matchesSearch && matchesStatus && matchesDate;
});


  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Export to Excel function
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredOrders.map(order => ({
        "Order ID": order.orderid,
        "Date": formatDate(order.createdAt),
        "Customer": `${order.address.fullName} `,
        "Email": order.address.email,
        "Phone": order.address.phone,
        "Items": order.items.length,
        "Amount": order.amount,
        "Status": order.status,
        "Payment Method": order.paymentMethod,
        "City": order.address.city,
        "Country": order.address.country
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, `Orders_${new Date().toISOString().split('T')[0]}.xlsx`);
    setIsExportMenuOpen(false);
    toast.success("Orders exported to Excel successfully");
  };

  const generateInvoiceDocument = (order) => {
    const doc = new jsPDF();
    
    // Add company logo and header
    doc.setFontSize(22);
    doc.setTextColor(40, 103, 240);
    doc.text("Organic Diet", 105, 25, { align: "center" });
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("123 Business Street, City, State 10001", 105, 32, { align: "center" });
    doc.text("contact@yourcompany.com | +1 (123) 456-7890", 105, 38, { align: "center" });
    
    // Invoice title
    doc.setDrawColor(40, 103, 240);
    doc.setLineWidth(0.5);
    doc.line(15, 45, 195, 45);
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("INVOICE", 105, 55, { align: "center" });
    
    // Order details
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Order ID: ${order.orderid}`, 20, 65);
    doc.text(`Date: ${formatDate(order.createdAt)}`, 20, 70);
    doc.text(`Payment Method: ${order.paymentMethod}`, 20, 75);
    
    // Customer details
    doc.text("Bill To:", 20, 85);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`${order.address.fullName} `, 20, 92);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(order.address.email, 20, 97);
    doc.text(order.address.phone, 20, 102);
    doc.text(`${order.address.address1}, ${order.address.city}`, 20, 107);
    doc.text(`${order.address.country}, ${order.address.postalCode}`, 20, 112);
    
    // Table header
    doc.setFillColor(40, 103, 240);
    doc.setTextColor(255, 255, 255);
    doc.rect(15, 120, 180, 10, 'F');
    doc.text("Item", 20, 126);
    doc.text("Price", 100, 126);
    doc.text("Qty", 140, 126);
    doc.text("Total", 170, 126);
    
    // Table rows
    let y = 135;
    order.items.forEach(item => {
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(item.name, 20, y);
      doc.text(`₹${item.price}`, 100, y);
      doc.text(item.quantity.toString(), 140, y);
      doc.text(`₹${item.quantity * item.price}`, 170, y);
      y += 8;
    });
    
    // Total
    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(120, y, 190, y);
    y += 8;
    doc.text("Subtotal:", 130, y);
    doc.text(`₹${order.amount}`, 170, y);
    y += 8;
    doc.text("Shipping:", 130, y);
    doc.text("Free", 170, y);
    y += 8;
    doc.text("Tax:", 130, y);
    doc.text("₹0", 170, y);
    y += 8;
    doc.setFontSize(12);
    doc.setDrawColor(40, 103, 240);
    doc.line(120, y, 190, y);
    y += 8;
    doc.text("Total:", 130, y);
    doc.setTextColor(40, 103, 240);
    doc.text(`₹${order.amount}`, 170, y);
    
    // Footer
    y += 20;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Thank you for your business!", 105, y, { align: "center" });
    y += 6;
    doc.text("If you have any questions, please contact us at support@yourcompany.com", 105, y, { align: "center" });
    
    return doc;
  };

  const downloadInvoice = (order) => {
    const doc = generateInvoiceDocument(order);
    doc.save(`Invoice_${order.orderid}.pdf`);
    toast.success("Invoice downloaded successfully");
  };

  // Function to export a single order to Excel
  const exportOrderToExcel = (order) => {
    const worksheet = XLSX.utils.json_to_sheet([
      {
        "Order ID": order.orderid,
        "Date": formatDate(order.createdAt),
        "Customer": `${order.address.fullName} `,
        "Email": order.address.email,
        "Phone": order.address.phone,
        "Items": order.items.length,
        "Amount": order.amount,
        "Status": order.status,
        "Payment Method": order.paymentMethod,
        "City": order.address.city,
        "Country": order.address.country
      }
    ]);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Order Details");
    XLSX.writeFile(workbook, `Order_${order.orderid}.xlsx`);
    toast.success("Order exported to Excel successfully");
  };

  // Close invoice viewer
  const closeInvoiceViewer = () => {
    if (invoicePdfUrl) {
      URL.revokeObjectURL(invoicePdfUrl);
    }
    setInvoicePdfUrl(null);
  };

  if (loading) {
    return (
      
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading orders...</p>
        </div>
     
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
        <Toaster position="top-right" />
        
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                <p className="text-gray-600 mt-2">Manage and track all customer orders</p>
              </div>
              <div className="flex items-center mt-4 md:mt-0 space-x-3">
                <button 
                  onClick={fetchAllOrders}
                  className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition flex items-center"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Refresh
                </button>
                
                <div className="relative" ref={exportMenuRef}>
                  <button 
                    onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
                  >
                    <FileSpreadsheet className="w-5 h-5 mr-2" />
                    Export
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </button>
                  
                  {isExportMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                      <button
                        onClick={exportToExcel}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Export to Excel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center">
                  <div className="bg-blue-500 p-3 rounded-lg mr-4">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Total Orders</p>
                    <h3 className="text-xl font-bold text-gray-900">{stats.total}</h3>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-100">
                <div className="flex items-center">
                  <div className="bg-amber-500 p-3 rounded-lg mr-4">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-amber-600">Pending Orders</p>
                    <h3 className="text-xl font-bold text-gray-900">{stats.pending}</h3>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-100">
                <div className="flex items-center">
                  <div className="bg-green-500 p-3 rounded-lg mr-4">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Delivered Orders</p>
                    <h3 className="text-xl font-bold text-gray-900">{stats.delivered}</h3>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-100">
                <div className="flex items-center">
                  <div className="bg-purple-500 p-3 rounded-lg mr-4">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600">Total Revenue</p>
                    <h3 className="text-xl font-bold text-gray-900">₹{stats.revenue}</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search orders by ID, name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="Order Placed">Order Placed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all" || dateFilter
                  ? "Try adjusting your search or filter criteria" 
                  : "No orders have been placed yet"}
              </p>
            </div>
          ) : (
            <>
              {/* Orders Table View */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('orderid')}
                        >
                          <div className="flex items-center">
                            Order ID
                            <ArrowUpDown className="w-4 h-4 ml-1" />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">#{order.orderid}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{order.address.fullName} </div>
                            <div className="text-sm text-gray-500">{order.address.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">₹{order.amount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === "Order Placed"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "Cancelled"
                                ? "bg-red-100 text-red-800"
                                : order.status === "Returned"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : "bg-purple-100 text-purple-800"
                              }`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{order.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => viewOrderDetails(order)}
                                className="text-blue-600 hover:text-blue-900 transition p-1.5 rounded-md hover:bg-blue-50"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => downloadInvoice(order)}
                                className="text-gray-600 hover:text-gray-900 transition p-1.5 rounded-md hover:bg-gray-100"
                                title="Download invoice"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <div className="relative">
                                <select
                                  value={order.status}
                                  onChange={(e) => changeStatus(order.orderid, e.target.value)}
                                  disabled={updatingOrder === order.orderid}
                                  className="border border-gray-300 rounded-lg px-2 py-1 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs appearance-none pr-6"
                                >
                                  <option value="Order Placed">Order Placed</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                  <option value="Returned">Returned</option>
                                </select>
                                <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstOrder + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastOrder, filteredOrders.length)}
                    </span>{" "}
                    of <span className="font-medium">{filteredOrders.length}</span> results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-md text-sm font-medium ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                          } transition`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Order Details Modal */}
          {selectedOrder && (
            <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Order Details - #{selectedOrder.orderid}</h2>
                  <button
                    onClick={closeOrderDetails}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        Customer Information
                      </h3>
                      <div className="space-y-2">
                        <p className="text-gray-700">{selectedOrder.address.fullName} </p>
                        <p className="text-gray-600 flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          {selectedOrder.address.email}
                        </p>
                        <p className="text-gray-600 flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          {selectedOrder.address.phone}
                        </p>
                        {selectedOrder.address.company && (
                          <p className="text-gray-600 flex items-center">
                            <Building className="w-4 h-4 mr-2" />
                            {selectedOrder.address.company}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                        Shipping Address
                      </h3>
                      <div className="space-y-2">
                        <p className="text-gray-700">{selectedOrder.address.address1}</p>
                        {selectedOrder.address.address2 && <p className="text-gray-700">{selectedOrder.address.address2}</p>}
                        <p className="text-gray-700">{selectedOrder.address.city}, {selectedOrder.address.postalCode}</p>
                        <p className="text-gray-700">{selectedOrder.address.country}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-8">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      Order Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600">Order ID:</p>
                        <p className="font-medium">#{selectedOrder.orderid}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Order Date:</p>
                        <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status:</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedOrder.status === "Order Placed"
                            ? "bg-blue-100 text-blue-800"
                            : selectedOrder.status === "Cancelled"
                            ? "bg-red-100 text-red-800"
                            : selectedOrder.status === "Returned"
                            ? "bg-yellow-100 text-yellow-800"
                            : selectedOrder.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : "bg-purple-100 text-purple-800"
                          }`}>
                          {getStatusIcon(selectedOrder.status)}
                          <span className="ml-1">{selectedOrder.status}</span>
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-600">Payment Method:</p>
                        <p className="font-medium flex items-center">
                          <CreditCard className="w-4 h-4 mr-1" />
                          {selectedOrder.paymentMethod}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600">Coin Used:</p>
                        <p className="font-medium flex items-center">
                          {/* <CreditCard className="w-4 h-4 mr-1" /> */}
                          {selectedOrder.coinsUsed}
                        </p>
                      </div>
                   

                  {selectedOrder.couponCode &&  <div>
                        <p className="text-gray-600"> Coupo Code:</p> <p className="font-medium">{selectedOrder.couponCode}</p>
                    </div>}
                    </div>
                     
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Order Items</h3>
                  <div className="overflow-x-auto mb-8">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-3 font-semibold text-gray-900 text-sm">Product</th>
                          <th className="text-right py-3 font-semibold text-gray-900 text-sm">Price</th>
                          <th className="text-right py-3 font-semibold text-gray-900 text-sm">Quantity</th>
                          <th className="text-right py-3 font-semibold text-gray-900 text-sm">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item) => (
                          <tr key={item._id} className="border-b border-gray-100">
                            <td className="py-4">
                              <div className="flex items-center">
                                <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded mr-4" />
                                <span className="text-gray-700 font-medium">{item.name}</span>
                              </div>
                            </td>
                            <td className="text-right py-4 text-gray-700">₹{item.price}</td>
                            <td className="text-right py-4 text-gray-700">{item.quantity}</td>
                            <td className="text-right py-4 text-gray-700 font-medium">₹{item.quantity * item.price}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={3} className="text-right py-4 font-medium text-gray-700">Subtotal:</td>
                          <td className="text-right py-4 text-gray-700">₹{selectedOrder.amount + selectedOrder.discount}</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="text-right py-2 font-medium text-gray-700">Discount:</td>
                          <td className="text-right py-2 text-gray-700">-₹{selectedOrder.discount}</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="text-right py-2 font-medium text-gray-700">Wallet Discount:</td>
                          <td className="text-right py-2 text-gray-700">-₹{selectedOrder.walletDiscount}</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="text-right py-2 font-medium text-gray-700">Shipping:</td>
                          <td className="text-right py-2 text-gray-700">Free</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="text-right py-2 font-medium text-gray-700">Tax:</td>
                          <td className="text-right py-2 text-gray-700">₹0</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="text-right py-4 font-medium text-gray-900 text-lg">Total:</td>
                          <td className="text-right py-4 text-blue-600 font-bold text-lg">₹{selectedOrder.amount}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
                  <button 
                    onClick={() => viewInvoice(selectedOrder)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center text-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Invoice
                  </button>
                  
                  <button 
                    onClick={() => downloadInvoice(selectedOrder)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center text-sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download Invoice
                  </button>
                  
                  <button 
                    onClick={() => exportOrderToExcel(selectedOrder)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center text-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                    Export to Excel
                  </button>
                  
                  <button
                    onClick={closeOrderDetails}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Viewer Modal */}
          {invoicePdfUrl && (
            <div className="fixed inset-0  bg-opacity-75 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-5/6 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="text-lg font-semibold">Invoice Preview</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadInvoice(selectedOrder)}
                      className="flex items-center text-gray-700 hover:text-gray-900 p-2"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={closeInvoiceViewer}
                      className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <iframe
                    src={invoicePdfUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    title="Invoice Preview"
                  ></iframe>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default AdminOrders;
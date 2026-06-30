"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSyncAlt, 
  FaSearch,
  FaFilter,
  FaUser,
  FaPhone,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaIdCard,
  FaUniversity,
  FaChevronLeft,
  FaChevronRight,
  FaStepBackward,
  FaStepForward
} from "react-icons/fa";
import { toast } from "react-toastify";

export default function PayoutDashboard () {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch all payouts with user details
  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/admin/all`, 
      );
      console.log("Raw payout data:", res.data.payouts);
      // Process payouts to ensure we have user data
      const processedPayouts = res.data.payouts.map(payout => ({
        ...payout,
        user: payout.user || {}, // Ensure user object exists
        amount: payout.amount || 0 // Ensure amount exists
      }));
      
      setPayouts(processedPayouts);
      console.log("Fetched payouts:", processedPayouts);
    } catch (error) {
      console.error("Error fetching payouts:", error);
      toast.error("Failed to fetch payouts");
    } finally {
      setLoading(false);
    }
  };

  // Update payout status
  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/admin/update/${id}`,
        { status },
      );
      toast.success(`Payout ${status.toLowerCase()} successfully`);
      fetchPayouts();
    } catch (error) {
      console.error("Error updating payout:", error);
      toast.error("Failed to update payout");
    }
  };

  // Filter payouts based on search and filters
  const filteredPayouts = payouts.filter(payout => {
    const userNumber = payout.user?.number || "";
    const upiId = payout.upiId || "";
    const accountNumber = payout.accountNumber || "";
    const bankName = payout.bankName || "";
    
    const matchesSearch = 
      userNumber.includes(searchTerm) ||
      upiId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accountNumber.includes(searchTerm) ||
      bankName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || payout.status === statusFilter;
    const matchesMethod = methodFilter === "All" || payout.method === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Get status counts for summary
  const statusCounts = {
    Pending: payouts.filter(p => p.status === "Pending").length,
    Approved: payouts.filter(p => p.status === "Approved").length,
    Rejected: payouts.filter(p => p.status === "Rejected").length,
    Total: payouts.length
  };

  // Format account number for display (mask middle digits)
  const formatAccountNumber = (accountNumber) => {
    if (!accountNumber) return "Not provided";
    if (accountNumber.length <= 4) return accountNumber;
    return `${accountNumber.slice()}`;
  };

  // Get payment method details
  const getPaymentDetails = (payout) => {
    if (payout.method === "UPI") {
      return {
        primary: payout.upiId || "Not provided",
        secondary: "UPI Transfer",
        icon: "💸"
      };
    } else {
      return {
        primary: `${payout.bankName || "Bank not specified"}`,
        secondary: `A/C: ${formatAccountNumber(payout.accountNumber)}${payout.ifsc ? ` • IFSC: ${payout.ifsc}` : ''}`,
        icon: "🏦"
      };
    }
  };

  // Pagination calculations
  const totalItems = filteredPayouts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayouts = filteredPayouts.slice(startIndex, endIndex);

  // Page navigation functions
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Generate page numbers for pagination display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  // Reset to first page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, methodFilter]);

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  useEffect(() => {
    fetchPayouts();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FaMoneyBillWave className="text-white text-2xl" />
            </div>
            Payout Management Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage and process user payout requests</p>
        </div>
        <button
          onClick={fetchPayouts}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
        >
          <FaSyncAlt className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Requests</p>
              <p className="text-2xl font-bold text-gray-800">{statusCounts.Total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaMoneyBillWave className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-gray-800">{statusCounts.Pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaSyncAlt className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Approved</p>
              <p className="text-2xl font-bold text-gray-800">{statusCounts.Approved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Rejected</p>
              <p className="text-2xl font-bold text-gray-800">{statusCounts.Rejected}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <FaTimesCircle className="text-red-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Items Per Page Selector */}
          <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg shadow-sm border">
            <span className="text-sm text-gray-700">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-700">entries</span>
          </div>

          {/* Results Count */}
          <div className="flex items-center bg-white px-4 py-3 rounded-lg shadow-sm border">
            <span className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
              {searchTerm && ` (filtered from ${payouts.length} total)`}
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by phone, UPI, account, bank..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          
          {/* Method Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="All">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payouts Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading payout requests...</p>
        </div>
      ) : currentPayouts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FaMoneyBillWave className="text-gray-400 text-5xl mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No payout requests found</p>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        User Details
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Payment Method & Details
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2 justify-center">
                        <FaCalendarAlt className="text-gray-400" />
                        Date & Time
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentPayouts.map((payout) => {
                    const paymentDetails = getPaymentDetails(payout);
                    return (
                      <tr key={payout._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FaUser className="text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {payout.user?.name || "User"}
                              </p>
                              <p className="text-gray-500 text-sm flex items-center gap-1">
                                <FaPhone className="text-xs" />
                                {payout.user?.number || "No number"}
                              </p>
                              <p className="text-gray-400 text-xs flex items-center gap-1 mt-1">
                                <FaIdCard className="text-xs" />
                                ID: {payout.user?._id?.slice(-8) || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-start gap-3">
                            <span className="text-xl">{paymentDetails.icon}</span>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">{payout.method}</span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {payout.method === "UPI" ? "Instant" : "Bank Transfer"}
                                </span>
                              </div>
                              <p className="text-gray-900 font-semibold">{paymentDetails.primary}</p>
                              <p className="text-gray-500 text-sm">{paymentDetails.secondary}</p>
                              {payout.method !== "UPI" && payout.ifsc && (
                                <p className="text-gray-500 text-sm">
                                  <FaUniversity className="inline mr-1" />
                                  IFSC: {payout.ifsc}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 font-semibold">
                            ₹{payout.amount?.toFixed(2) || "0.00"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              payout.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : payout.status === "Rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {payout.status === "Pending" && <FaSyncAlt className="mr-1 animate-spin" />}
                            {payout.status === "Approved" && <FaCheckCircle className="mr-1" />}
                            {payout.status === "Rejected" && <FaTimesCircle className="mr-1" />}
                            {payout.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {payout.status === "Pending" ? (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => updateStatus(payout._id, "Approved")}
                                className="flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm"
                              >
                                <FaCheckCircle />
                                Approve
                              </button>
                              <button
                                onClick={() => updateStatus(payout._id, "Rejected")}
                                className="flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm text-sm"
                              >
                                <FaTimesCircle />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm italic">Completed</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center text-sm text-gray-500">
                          <div>
                            <p className="font-medium">{new Date(payout.createdAt).toLocaleDateString()}</p>
                            <p className="text-gray-400">
                              {new Date(payout.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
              </div>
              
              <div className="flex items-center gap-2">
                {/* First Page */}
                <button
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  title="First Page"
                >
                  <FaStepBackward className="text-gray-600 text-sm" />
                </button>

                {/* Previous Page */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  title="Previous Page"
                >
                  <FaChevronLeft className="text-gray-600 text-sm" />
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map(page => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`min-w-10 h-10 rounded-lg border transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next Page */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  title="Next Page"
                >
                  <FaChevronRight className="text-gray-600 text-sm" />
                </button>

                {/* Last Page */}
                <button
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  title="Last Page"
                >
                  <FaStepForward className="text-gray-600 text-sm" />
                </button>
              </div>

              {/* Page Info */}
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};


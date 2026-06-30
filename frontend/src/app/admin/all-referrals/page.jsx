"use client";
// components/AdminAllReferrals.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminAllReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination states for both tabs
  const [referralsPage, setReferralsPage] = useState(1);
  const [statsPage, setStatsPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const [referralsRes, statsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/all-referrals`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/referral-stats`)
      ]);

      if (referralsRes.data.success) {
        setReferrals(referralsRes.data.data);
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
      alert('Error fetching referral data');
    } finally {
      setLoading(false);
    }
  };

  console.log(referrals);
  console.log(stats);

  useEffect(() => {
    fetchReferralData();
  }, []);

const formatDate = (timestamp) => {
  if (!timestamp) return "—";

  // If timestamp is an object (MongoDB Date object)
  if (typeof timestamp === "object" && timestamp.$date) {
    timestamp = timestamp.$date;
  }

  const date = new Date(timestamp);

  if (isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};


console.log("Formatted Dates:", referrals.map(r => formatDate(r.orderDate || r.date)));


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'order placed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter referrals based on search term
  const filteredReferrals = referrals.filter((referral) => {
    const search = searchTerm.toLowerCase();
    const user = referral.referredUser || {};
    const referrer = referral.referrer || {};
    return (
      referral.orderId?.toLowerCase().includes(search) ||
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.number?.toLowerCase().includes(search) ||
      referrer.name?.toLowerCase().includes(search) ||
      referrer.email?.toLowerCase().includes(search) ||
      referrer.number?.toLowerCase().includes(search)
    );
  });

  const filteredStats = stats.filter((ref) => {
    const name = ref.referrerName || ref.referrerEmail || ref.referrerNumber || "";
    return name.toString().toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Pagination calculations for referrals
  const referralsTotalItems = filteredReferrals.length;
  const referralsTotalPages = Math.ceil(referralsTotalItems / itemsPerPage);
  const referralsStartIndex = (referralsPage - 1) * itemsPerPage;
  const referralsEndIndex = referralsStartIndex + itemsPerPage;
  const paginatedReferrals = filteredReferrals.slice(referralsStartIndex, referralsEndIndex);
  console.log('Paginated Referrals:', paginatedReferrals);

  // Pagination calculations for stats
  const statsTotalItems = filteredStats.length;
  const statsTotalPages = Math.ceil(statsTotalItems / itemsPerPage);
  const statsStartIndex = (statsPage - 1) * itemsPerPage;
  const statsEndIndex = statsStartIndex + itemsPerPage;
  const paginatedStats = filteredStats.slice(statsStartIndex, statsEndIndex);

  // Pagination handlers
  const goToReferralsPage = (page) => {
    setReferralsPage(Math.max(1, Math.min(page, referralsTotalPages)));
  };

  const goToStatsPage = (page) => {
    setStatsPage(Math.max(1, Math.min(page, statsTotalPages)));
  };

  // Generate page numbers for pagination
  const getPageNumbers = (currentPage, totalPages) => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  // Reset pagination when search term changes or tab changes
  useEffect(() => {
    setReferralsPage(1);
    setStatsPage(1);
  }, [searchTerm, activeTab]);

  // Reset pagination when items per page changes
  useEffect(() => {
    setReferralsPage(1);
    setStatsPage(1);
  }, [itemsPerPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading referral data...</p>
        </div>
      </div>
    );
  }

  // Pagination Component
  const Pagination = ({ currentPage, totalPages, onPageChange, itemsCount, totalItems, startIndex, endIndex }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white border-t border-gray-200 px-6 py-4">
        <div className="text-sm text-gray-700">
          Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
        </div>
        
        <div className="flex items-center gap-2">
          {/* First Page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            title="First Page"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          {/* Previous Page */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            title="Previous Page"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Page Numbers */}
          {getPageNumbers(currentPage, totalPages).map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-10 h-10 rounded-lg border transition-colors text-sm ${
                currentPage === page
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next Page */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            title="Next Page"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Last Page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            title="Last Page"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Page Info */}
        <div className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Referral Management</h1>
              <p className="text-gray-600 mt-1">Manage and track all referral activities</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
              {/* Items Per Page Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-700">entries</span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search referrals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center">
                <div className="  bg-opacity-20 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium opacity-90">Total Referrals</p>
                  <p className="text-2xl font-bold">{referrals.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-white">
              <div className="flex items-center">
                <div className="  bg-opacity-20 rounded-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium opacity-90">Total Coins Earned</p>
                  <p className="text-2xl font-bold">
                    {(referrals.reduce((sum, ref) => sum + ref.commissionEarned, 0))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg p-4 text-white">
              <div className="flex items-center">
                <div className="  bg-opacity-20 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium opacity-90">Active Referrers</p>
                  <p className="text-2xl font-bold">{stats.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'details'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Referral Details
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'stats'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Referrer Statistics
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">All Referral Orders</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Showing {paginatedReferrals.length} of {filteredReferrals.length} referrals
                    {searchTerm && ` (filtered from ${referrals.length} total)`}
                  </p>
                </div>
                {referralsTotalPages > 1 && (
                  <div className="mt-2 sm:mt-0 text-sm text-gray-600">
                    Page {referralsPage} of {referralsTotalPages}
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referred User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referrer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedReferrals.map((referral, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-mono text-gray-900">{referral.orderId}</div>
                          <div className="text-sm text-gray-500"><div className="text-sm text-gray-500">{formatDate(referral.orderDate || referral.date)}</div></div>
                          
                          <div className="flex space-x-2 mt-1">
                            <span className="text-xs text-green-600 font-medium">
                              Refrer Coins: {(referral.commissionEarned)}
                            </span>
                            <span className="text-xs text-red-600 font-medium">
                              User Coins: {(referral.referralDiscount)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {referral.referredUser?.name || referral.referredUser?.number || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {referral.referredUser?.email || "—"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {referral.referredUser?.phone || referral.referredUser?.number || "—"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {referral.referrer?.name || referral.referrer?.number || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {referral.referrer?.email || "—"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {referral.referrer?.phone || referral.referrer?.number || "—"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {(referral.orderAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(referral.status)}`}>
                          {referral.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {paginatedReferrals.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No referrals found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search term' : 'No referral data available'}
                </p>
              </div>
            )}

            {/* Referrals Pagination */}
            <Pagination
              currentPage={referralsPage}
              totalPages={referralsTotalPages}
              onPageChange={goToReferralsPage}
              itemsCount={paginatedReferrals.length}
              totalItems={filteredReferrals.length}
              startIndex={referralsStartIndex}
              endIndex={referralsEndIndex}
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Referrer Performance</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Showing {paginatedStats.length} of {filteredStats.length} referrers
                    {searchTerm && ` (filtered from ${stats.length} total)`}
                  </p>
                </div>
                {statsTotalPages > 1 && (
                  <div className="mt-2 sm:mt-0 text-sm text-gray-600">
                    Page {statsPage} of {statsTotalPages}
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referrer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Coins
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Refrer Coins
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedStats.map((stat, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{stat.referrerNumber}</div>
                          <div className="text-sm text-gray-500">{stat.referrerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-800">{stat.totalOrders}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{stat.totalOrders} orders</div>
                            <div className="text-sm text-gray-500">Total referrals</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {(stat.totalCommission)}
                        </div>
                        <div className="text-sm text-gray-500">Commission given</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-red-600">
                          {(stat.totalDiscount)}
                        </div>
                        <div className="text-sm text-gray-500">Discount given</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {paginatedStats.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No statistics found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search term' : 'No referral statistics available'}
                </p>
              </div>
            )}

            {/* Stats Pagination */}
            <Pagination
              currentPage={statsPage}
              totalPages={statsTotalPages}
              onPageChange={goToStatsPage}
              itemsCount={paginatedStats.length}
              totalItems={filteredStats.length}
              startIndex={statsStartIndex}
              endIndex={statsEndIndex}
            />
          </div>
        )}
      </div>
    </div>
  );
};


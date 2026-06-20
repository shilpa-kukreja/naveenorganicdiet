"use client";
import React, { useState, useEffect, useContext } from 'react';
import {
  IoCopyOutline,
  IoWalletOutline,
  IoPeopleOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoGiftOutline,
  IoShareSocialOutline,
  IoChevronForward,
  IoStatsChart,
  IoCalendar,
  IoCashOutline,
  IoArrowDownCircle,
  IoArrowUpCircle,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoSparkles,
  IoRocket,
  IoTrendingUp,
  IoDocumentText,
  IoBagOutline,
  IoCartOutline
} from 'react-icons/io5';
import { FaRupeeSign, FaShareAlt, FaTag, FaPercentage, FaCoins, FaCrown } from 'react-icons/fa';
import { MdOutlineDashboard, MdOutlineAccountBalanceWallet, MdOutlineVerified } from 'react-icons/md';
import { TbReceipt2, TbBrandCashapp, TbUserStar } from 'react-icons/tb';
import { RiUserSharedFill } from 'react-icons/ri';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../componats/Header';
import Footer from '../componats/Footer';
import { AppContext } from '../context/AppContext';

export default function ReferralDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState('UPI');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [walletCoins, setWalletCoins] = useState(0);
  const [stats, setStats] = useState({
    monthlyEarnings: 0,
    pendingPayouts: 0,
    conversionRate: '0%',
    totalReferredUsers: 0,
    totalOrdersFromReferrals: 0,
    totalRevenueFromReferrals: 0
  });
  const { token, setToken } = useContext(AppContext);

  const MIN_WITHDRAWAL_AMOUNT = 100;

  const availableBalance = (dashboard?.totalCommissionEarned || 0) - totalEarnings;

  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [dashboardRes, referralsRes, payoutsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users/referral/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/users/referrals', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/users/history', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      console.log("Dashboard Data:", dashboardRes.data);
      console.log("Referrals Data:", referralsRes.data);

      setDashboard(dashboardRes.data);
      setReferrals(referralsRes.data.referrals || []);
      setPayoutHistory(Array.isArray(payoutsRes.data) ? payoutsRes.data : payoutsRes.data.payouts || []);

      // Calculate comprehensive stats
      const monthlyEarn = calculateMonthlyEarnings(payoutsRes.data.payouts || []);
      const pending = (payoutsRes.data.payouts || []).filter(p => p.status === 'Pending').length;
      
      // Calculate referral stats
      const referredUsers = referralsRes.data.referrals || [];
      const totalReferredUsers = referredUsers.length;
      const totalOrdersFromReferrals = referredUsers.reduce((sum, ref) => sum + (ref.totalOrders || 0), 0);
      const totalRevenueFromReferrals = referredUsers.reduce((sum, ref) => sum + (ref.totalSpent || 0), 0);
      
      // Calculate conversion rate properly
      const successfulReferrals = referredUsers.filter(ref => ref.totalOrders > 0).length;
      const conversionRate = totalReferredUsers > 0 
        ? `${Math.round((successfulReferrals / totalReferredUsers) * 100)}%`
        : '0%';

      setStats({
        monthlyEarnings: monthlyEarn,
        pendingPayouts: pending,
        conversionRate,
        totalReferredUsers,
        totalOrdersFromReferrals,
        totalRevenueFromReferrals
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboard({
        referralCode: 'N/A',
        referralLink: `${window.location.origin}/login?ref=default`,
        totalCommissionEarned: 0,
        totalReferral: 0,
        successfulDirectReferrals: 0,
        couponDiscountPercent: 10,
        couponCommissionPercent: 5
      });
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyEarnings = (payouts) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return payouts
      .filter(p => {
        const date = new Date(p.createdAt);
        return date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear &&
          p.status === 'Approved';
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  useEffect(() => {
    if (token) fetchDashboardData();
  }, [token]);

  useEffect(() => {
    const fetchWalletCoins = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/wallet', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setWalletCoins(res.data.walletCoins);
        }
      } catch (error) {
        console.error('Error fetching wallet coins:', error);
      }
    };

    if (token) fetchWalletCoins();
  }, [token]);

  useEffect(() => {
    const fetchTotalEarnings = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/total-earnings", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTotalEarnings(res.data.totalEarnings || 0);
      } catch (error) {
        console.error("Error fetching total earnings:", error);
      }
    };

    if (token) fetchTotalEarnings();
  }, [token]);

  const copyToClipboard = (text, message = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const shareLink = async (link, title, text) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: link,
        });
        toast.success('Shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(link, 'Link copied to clipboard!');
        }
      }
    } else {
      copyToClipboard(link, 'Link copied to clipboard!');
    }
  };

  const handlePayoutRequest = async (e) => {
    e.preventDefault();

    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(payoutAmount);

    if (amount < MIN_WITHDRAWAL_AMOUNT) {
      toast.error(`Minimum withdrawal amount is ₹${MIN_WITHDRAWAL_AMOUNT}`);
      return;
    }

    if (amount > availableBalance) {
      toast.error('Requested amount exceeds available balance');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/users/request',
        {
          method: payoutMethod,
          amount: amount,
          ...payoutDetails
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Payout request submitted successfully!');
        setShowPayoutForm(false);
        setPayoutAmount('');
        setPayoutDetails({ upiId: '', bankName: '', accountNumber: '', ifsc: '' });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Payout request failed:', error);
      toast.error(error.response?.data?.message || 'Failed to submit payout request');
    }
  };

  const getStatusBadge = (status) => {
    const base = "px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5";
    switch (status) {
      case 'Approved':
        return (
          <span className={`${base} bg-emerald-50 text-emerald-700 border border-emerald-200`}>
            <IoCheckmarkCircleOutline className="text-sm" />
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className={`${base} bg-red-50 text-red-700 border border-red-200`}>
            <IoCloseCircle className="text-sm" />
            Rejected
          </span>
        );
      default:
        return (
          <span className={`${base} bg-amber-50 text-amber-700 border border-amber-200`}>
            <IoTimeOutline className="text-sm" />
            Pending
          </span>
        );
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <MdOutlineDashboard className="text-lg" /> },
    { id: 'referrals', label: 'Referrals', icon: <RiUserSharedFill className="text-lg" /> },
  ];

  const [payoutDetails, setPayoutDetails] = useState({
    upiId: '',
    bankName: '',
    accountNumber: '',
    ifsc: ''
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      <div className="relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 blur-3xl -z-10"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl -z-10"></div>
        
        <ToastContainer position="top-right" theme="colored" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <TbBrandCashapp className="text-2xl text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-emerald-800 bg-clip-text text-transparent">
                Referral Dashboard
              </h1>
              <span className="ml-auto px-3 sm:block hidden py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 text-sm font-semibold rounded-full border border-emerald-200">
                <FaCrown className="inline mr-1" /> Premium
              </span>
            </div>
            <p className="text-gray-600 text-lg">Track your earnings, share your code, and grow together</p>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Stats & Referral Card */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Wallet Coins Card */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-amber-700 font-medium mb-1 flex items-center gap-2">
                        <FaCoins className="text-amber-600" /> Wallet Coins
                      </p>
                      <p className="text-3xl font-bold text-gray-900">{walletCoins}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-md">
                      <IoWalletOutline className="text-2xl text-white" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-amber-200">
                    <p className="text-xs text-amber-700 font-medium">≈ {formatCurrency(walletCoins)} value</p>
                  </div>
                </div>

                {/* Total Referred Users */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-blue-700 font-medium mb-1 flex items-center gap-2">
                        <IoPeopleOutline className="text-blue-600" /> Referred Users
                      </p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalReferredUsers}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md">
                      <RiUserSharedFill className="text-2xl text-white" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-blue-200">
                    <p className="text-xs text-blue-700 font-medium">Total signups from your referrals</p>
                  </div>
                </div>

                {/* Total Orders from Referrals */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-purple-700 font-medium mb-1 flex items-center gap-2">
                        <IoCartOutline className="text-purple-600" /> Referral Orders
                      </p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalOrdersFromReferrals}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl shadow-md">
                      <IoBagOutline className="text-2xl text-white" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-purple-200">
                    <p className="text-xs text-purple-700 font-medium">Orders placed by referred users</p>
                  </div>
                </div>

                {/* Revenue from Referrals */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-emerald-700 font-medium mb-1 flex items-center gap-2">
                        <IoCashOutline className="text-emerald-600" /> Referral Revenue
                      </p>
                      <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenueFromReferrals)}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-md">
                      <IoTrendingUp className="text-2xl text-white" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-emerald-200">
                    <p className="text-xs text-emerald-700 font-medium">Total sales from referred users</p>
                  </div>
                </div>

                {/* Conversion Rate */}
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 shadow-lg border border-rose-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-rose-700 font-medium mb-1 flex items-center gap-2">
                        <FaPercentage className="text-rose-600" /> Conversion Rate
                      </p>
                      <p className="text-3xl font-bold text-gray-900">{stats.conversionRate}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl shadow-md">
                      <IoStatsChart className="text-2xl text-white" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-rose-200">
                    <p className="text-xs text-rose-700 font-medium">Referrals who made purchases</p>
                  </div>
                </div>

                {/* Total Earnings */}
                {/* <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-2xl p-6 shadow-lg border border-cyan-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-cyan-700 font-medium mb-1 flex items-center gap-2">
                        <IoCashOutline className="text-cyan-600" /> Total Earnings
                      </p>
                      <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalEarnings)}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-cyan-500 to-sky-600 rounded-xl shadow-md">
                      <IoSparkles className="text-2xl text-white" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-cyan-200">
                    <div className="flex items-center gap-2 text-xs text-cyan-700">
                      <IoSparkles className="text-cyan-500" />
                      <span>Lifetime commission earnings</span>
                    </div>
                  </div>
                </div> */}
              </div>

              {/* Referral Card */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Referral Code</h2>
                    <p className="text-gray-600">Share with friends and earn rewards</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl">
                    <IoShareSocialOutline className="text-2xl text-emerald-600" />
                  </div>
                </div>

                {/* Referral Code Display */}
                <div className="relative group mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl blur opacity-30 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative bg-white rounded-2xl p-6 border-2 border-emerald-100">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 font-medium mb-2">Unique Code</p>
                        <div className="flex items-center gap-4">
                          <code className="text-3xl font-bold text-gray-900 font-mono tracking-wider bg-gray-50 px-4 py-3 rounded-lg">
                            {dashboard?.referralCode || 'N/A'}
                          </code>
                          <button
                            onClick={() => copyToClipboard(dashboard?.referralCode, 'Referral code copied!')}
                            className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                          >
                            <IoCopyOutline className="text-xl" />
                          </button>
                        </div>
                      </div>
                      <div className="h-12 w-px bg-gray-200 hidden sm:block"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 font-medium mb-2">Quick Share</p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => shareLink(
                              dashboard?.referralLink,
                              'Join me on HealthStory',
                              'Get amazing discounts on health products! Use my referral link.'
                            )}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <FaShareAlt />
                            Share
                          </button>
                          <button
                            onClick={() => copyToClipboard(dashboard?.referralLink, 'Referral link copied!')}
                            className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 hover:shadow-md transition-all duration-300"
                            title="Copy link"
                          >
                            <IoCopyOutline className="text-lg" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Referral Benefits */}
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                        <IoGiftOutline className="text-xl text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Friend's Benefit</h4>
                        <p className="text-2xl font-bold text-blue-600">{dashboard?.couponDiscountPercent || 10}% OFF</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Your friends get instant discount on their first purchase</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                        <IoCashOutline className="text-xl text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Your Earnings</h4>
                        <p className="text-2xl font-bold text-emerald-600">{dashboard?.couponCommissionPercent || 5}% Commission</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Earn commission on every successful referral</p>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Right Column - Tabs & Recent Activity */}
            <div className="space-y-8">
              {/* Tabs Navigation */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 w-full px-6 py-4 text-left transition-all duration-300 ${activeTab === tab.id
                          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-r-4 border-emerald-500'
                          : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <div className={`p-2 rounded-lg ${activeTab === tab.id
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                          : 'bg-gray-100 text-gray-500'
                        }`}>
                        {tab.icon}
                      </div>
                      <span className="font-semibold">{tab.label}</span>
                      {activeTab === tab.id && (
                        <IoChevronForward className="ml-auto text-emerald-500" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900">Performance Overview</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Direct Referrals</span>
                          <span className="font-semibold text-gray-900">{dashboard?.successfulDirectReferrals || 0}</span>
                        </div>
                        {/* <div className="flex items-center justify-between">
                          <span className="text-gray-600">Total Commission</span>
                          <span className="font-semibold text-emerald-600">{formatCurrency(dashboard?.totalCommissionEarned || 0)}</span>
                        </div> */}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Total Referral</span>
                          <span className="font-semibold text-gray-900">{dashboard?.totalReferral || 0}</span>
                        </div>
                        {/* <div className="flex items-center justify-between">
                          <span className="text-gray-600">Available Balance</span>
                          <span className="font-semibold text-blue-600">{formatCurrency(availableBalance)}</span>
                        </div> */}
                      </div>
                      <div className="pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MdOutlineVerified className="text-emerald-500" />
                          <span>Your account is verified and active</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'referrals' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Recent Referrals</h3>
                        <span className="text-sm text-emerald-600 font-semibold">
                          {referrals.length} total
                        </span>
                      </div>
                      {referrals.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                            <RiUserSharedFill className="text-2xl text-gray-400" />
                          </div>
                          <p className="text-gray-600 mb-4">No referrals yet</p>
                          <button
                            onClick={() => shareLink(dashboard?.referralLink, 'Join HealthStory', 'Use my referral link!')}
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-300"
                          >
                            Share to Earn
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {referrals.map((ref, idx) => (
                            <div key={idx} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                                    <span className="font-bold text-emerald-600">{ref.img || ref.email?.[0] || 'U'}</span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{ref.name || ref.email || 'User'}</p>
                                    <p className="text-xs text-gray-500">{ref.email || ref.phone || 'No contact info'}</p>
                                  </div>
                                </div>
                                <span className="text-sm font-semibold text-emerald-600">
                                  +{formatCurrency(ref.totalCommission || 0)}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <IoCartOutline className="text-gray-400" />
                                  <span>{ref.totalOrders || 0} orders</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <IoCashOutline className="text-gray-400" />
                                  <span>{formatCurrency(ref.totalSpent || 0)} spent</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <IoBagOutline className="text-gray-400" />
                                  <span>Last order: {formatDate(ref.latestOrder)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    ref.referralType === 'direct' 
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {ref.referralType || 'direct'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {referrals.length > 3 && (
                            <button
                              onClick={() => setActiveTab('referrals')}
                              className="w-full text-center text-sm text-emerald-600 font-semibold py-3 hover:text-emerald-700 border border-emerald-100 rounded-xl hover:bg-emerald-50 transition-colors"
                            >
                              View all {referrals.length} referrals →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-gray-900 to-emerald-900 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                    <IoSparkles className="text-xl" />
                  </div>
                  <h3 className="text-lg font-bold">Performance Insights</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Avg. Order Value</span>
                    <span className="font-semibold">
                      {stats.totalOrdersFromReferrals > 0 
                        ? formatCurrency(stats.totalRevenueFromReferrals / stats.totalOrdersFromReferrals)
                        : '₹0'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Active Referrals</span>
                    <span className="font-semibold">{dashboard?.successfulDirectReferrals || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Success Rate</span>
                    <span className="font-semibold text-emerald-300">{stats.conversionRate}</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-emerald-800">
                  <p className="text-sm text-emerald-200">
                    <IoRocket className="inline mr-2" />
                    Keep sharing to increase your earnings
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => shareLink(dashboard?.referralLink, 'Join HealthStory', 'Use my referral link!')}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl py-4 px-6 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3"
              >
                <IoShareSocialOutline className="text-xl" />
                Start Earning Now
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
"use client";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  BarChart3,
  PieChart,
  LineChart,
  Users,
  ShoppingBag,
  Package,
  DollarSign,
  Calendar,
  TrendingUp,
  Download,
  Filter,
  User,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  BarChart,
  FileSpreadsheet,
  Eye,
  MoreVertical,
  Hash,
  CreditCard,
  ShoppingCart,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Target
} from "lucide-react";
import * as XLSX from "xlsx";

const AdminOrderAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState("summary");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [dateRange, setDateRange] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    users: false,
    products: false,
    monthly: true,
    yearly: true
  });

  // Format number helper
  const formatNumber = (value) => {
    if (value === null || value === undefined) return '0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  // Calculate growth percentage
  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 100;
    return ((current - previous) / previous * 100);
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/order/analytics/all`);
      setAnalytics(data);
    } catch (error) {
      toast.error("Failed to fetch analytics data");
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Filter data based on search term and date range
  const filteredUsers = useMemo(() => {
    if (!analytics) return [];
    let users = analytics.userAnalytics.filter(user =>
      user.user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user.number?.includes(searchTerm)
    );

    // Apply date range filter
    if (dateRange === "month") {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      users = users.map(user => {
        const monthData = user.monthlyOrders?.find(m => {
          const [year, month] = m.month.split(' ');
          return parseInt(year) === currentYear && month === currentDate.toLocaleString('default', { month: 'short' });
        });
        return {
          ...user,
          filteredOrders: monthData?.orders || 0,
          filteredAmount: monthData?.amount || 0
        };
      }).filter(user => user.filteredOrders > 0);
    }

    return users;
  }, [analytics, searchTerm, dateRange]);

  const filteredProducts = useMemo(() => {
    if (!analytics) return [];
    let products = analytics.productAnalytics.filter(product =>
      product.productName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply date range filter
    if (dateRange === "month") {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      products = products.map(product => {
        const monthData = product.monthlySales?.find(m => {
          const [month, year] = m.month.split(' ');
          return parseInt(year) === currentYear && month === currentDate.toLocaleString('default', { month: 'short' });
        });
        return {
          ...product,
          filteredQuantity: monthData?.quantity || 0,
          filteredAmount: monthData?.amount || 0
        };
      }).filter(product => product.filteredQuantity > 0);
    }

    return products;
  }, [analytics, searchTerm, dateRange]);

  // Export functions
  const exportMatrixToExcel = (type) => {
    if (!analytics || !analytics.matrices) {
      toast.error("No data available to export");
      return;
    }

    const wb = XLSX.utils.book_new();

    if (type === 'user') {
      // User-Product Matrix sheet
      const userMatrixData = [["User", "Phone", "Email", "Product", "Quantity", "Total Amount", "Order Count", "Avg/Order"]];
      
      analytics.matrices.userProductMatrix?.forEach(userData => {
        userData.products?.forEach(product => {
          userMatrixData.push([
            userData.user?.username || 'N/A',
            userData.user?.number || 'N/A',
            userData.user?.email || 'N/A',
            product.productName || 'N/A',
            product.quantity || 0,
            `₹${product.amount || 0}`,
            product.orderCount || 0,
            `₹${formatNumber(product.avgAmount || 0)}`
          ]);
        });
      });
      
      const userMatrixWs = XLSX.utils.aoa_to_sheet(userMatrixData);
      XLSX.utils.book_append_sheet(wb, userMatrixWs, "User-Product Matrix");
    } else {
      // Product-User Matrix sheet
      const productMatrixData = [["Product", "User", "Phone", "Email", "Quantity", "Total Amount", "Order Count", "Avg/Order"]];
      
      analytics.matrices.productUserMatrix?.forEach(productData => {
        productData.users?.forEach(user => {
          productMatrixData.push([
            productData.productName || 'N/A',
            user.username || 'N/A',
            user.number || 'N/A',
            user.email || 'N/A',
            user.quantity || 0,
            `₹${user.amount || 0}`,
            user.orderCount || 0,
            `₹${formatNumber(user.avgAmount || 0)}`
          ]);
        });
      });
      
      const productMatrixWs = XLSX.utils.aoa_to_sheet(productMatrixData);
      XLSX.utils.book_append_sheet(wb, productMatrixWs, "Product-User Matrix");
    }
    
    XLSX.writeFile(wb, `${type}-matrix-analytics.xlsx`);
    toast.success(`Exported ${type} matrix to Excel`);
  };

  const exportDetailedAnalytics = () => {
    if (!analytics) {
      toast.error("No data available to export");
      return;
    }

    const wb = XLSX.utils.book_new();

    // User Analytics with Monthly/Yearly breakdown
    const userData = [["User", "Phone", "Email", "Total Orders", "Total Amount", "Avg Order", "This Month Orders", "This Month Amount", "This Year Orders", "This Year Amount", "Top Product"]];
    
    analytics.userAnalytics?.forEach(user => {
      const thisMonth = user.monthlyOrders?.[0] || { orders: 0, amount: 0 };
      const thisYear = user.yearlyOrders?.[0] || { orders: 0, amount: 0 };
      const topProduct = user.products?.sort((a, b) => b.totalAmount - a.totalAmount)[0];
      
      userData.push([
        user.user?.username || 'N/A',
        user.user?.number || 'N/A',
        user.user?.email || 'N/A',
        user.totalOrders || 0,
        `₹${user.totalAmount || 0}`,
        `₹${formatNumber(user.avgOrderValue || 0)}`,
        thisMonth.orders || 0,
        `₹${thisMonth.amount || 0}`,
        thisYear.orders || 0,
        `₹${thisYear.amount || 0}`,
        topProduct?.productName || 'N/A'
      ]);
    });
    
    const userWs = XLSX.utils.aoa_to_sheet(userData);
    XLSX.utils.book_append_sheet(wb, userWs, "User Analytics");

    // Product Analytics with User details
    const productData = [["Product", "Total Quantity", "Total Revenue", "Total Orders", "Avg Price", "Unique Users", "Top User", "Top User Phone", "Top User Quantity", "Top User Amount"]];
    
    analytics.productAnalytics?.forEach(product => {
      const topUser = product.users?.sort((a, b) => b.totalAmount - a.totalAmount)[0];
      
      productData.push([
        product.productName || 'N/A',
        product.totalQuantity || 0,
        `₹${product.totalAmount || 0}`,
        product.totalOrders || 0,
        `₹${formatNumber(product.avgPrice || 0)}`,
        product.users?.length || 0,
        topUser?.username || 'N/A',
        topUser?.number || 'N/A',
        topUser?.totalQuantity || 0,
        `₹${topUser?.totalAmount || 0}`
      ]);
    });
    
    const productWs = XLSX.utils.aoa_to_sheet(productData);
    XLSX.utils.book_append_sheet(wb, productWs, "Product Analytics");

    // Summary sheet
    const summaryData = [
      ["Metric", "Value"],
      ["Total Orders", analytics.summary?.totalOrders || 0],
      ["Total Revenue", `₹${analytics.summary?.totalRevenue || 0}`],
      ["Total Users", analytics.summary?.totalUsers || 0],
      ["Total Products", analytics.summary?.totalProducts || 0],
      ["Average Order Value", `₹${formatNumber(analytics.summary?.avgOrderValue || 0)}`],
      ["Time Period Start", analytics.summary?.timePeriod?.startDate || 'N/A'],
      ["Time Period End", analytics.summary?.timePeriod?.endDate || 'N/A']
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    XLSX.writeFile(wb, "detailed-analytics.xlsx");
    toast.success("Exported detailed analytics to Excel");
  };

  const exportToExcel = () => {
    if (!analytics) {
      toast.error("No data available to export");
      return;
    }

    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ["Metric", "Value"],
      ["Total Orders", analytics.summary?.totalOrders || 0],
      ["Total Revenue", `₹${analytics.summary?.totalRevenue || 0}`],
      ["Total Users", analytics.summary?.totalUsers || 0],
      ["Total Products", analytics.summary?.totalProducts || 0],
      ["Average Order Value", `₹${formatNumber(analytics.summary?.avgOrderValue || 0)}`]
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    // Users sheet
    const usersData = [["User", "Email", "Phone", "Total Orders", "Total Amount", "Avg Order Value"]];
    analytics.userAnalytics?.forEach(user => {
      usersData.push([
        user.user?.username || 'N/A',
        user.user?.email || 'N/A',
        user.user?.number || 'N/A',
        user.totalOrders || 0,
        `₹${user.totalAmount || 0}`,
        `₹${formatNumber(user.totalAmount / user.totalOrders)}`
      ]);
    });
    const usersWs = XLSX.utils.aoa_to_sheet(usersData);
    XLSX.utils.book_append_sheet(wb, usersWs, "Users");

    // Products sheet
    const productsData = [["Product", "Total Quantity", "Total Amount", "Total Orders", "Avg Price"]];
    analytics.productAnalytics?.forEach(product => {
      productsData.push([
        product.productName || 'N/A',
        product.totalQuantity || 0,
        `₹${product.totalAmount || 0}`,
        product.totalOrders || 0,
        `₹${formatNumber(product.totalAmount / product.totalQuantity)}`
      ]);
    });
    const productsWs = XLSX.utils.aoa_to_sheet(productsData);
    XLSX.utils.book_append_sheet(wb, productsWs, "Products");

    XLSX.writeFile(wb, "order-analytics.xlsx");
    toast.success("Exported to Excel");
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get top performers
  const topUsers = useMemo(() => {
    if (!analytics) return [];
    return [...analytics.userAnalytics]
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
  }, [analytics]);

  const topProducts = useMemo(() => {
    if (!analytics) return [];
    return [...analytics.productAnalytics]
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
  }, [analytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Comprehensive insights into orders, users, and products</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users, products, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                />
              </div>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="quarter">Last Quarter</option>
              </select>

              <button
                onClick={fetchAnalytics}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>

              <button
                onClick={exportToExcel}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedView("summary")}
              className={`px-4 py-2 rounded-lg transition ${selectedView === "summary"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Summary
              </div>
            </button>
            <button
              onClick={() => setSelectedView("users")}
              className={`px-4 py-2 rounded-lg transition ${selectedView === "users"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Users ({filteredUsers.length})
              </div>
            </button>
            <button
              onClick={() => setSelectedView("products")}
              className={`px-4 py-2 rounded-lg transition ${selectedView === "products"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Products ({filteredProducts.length})
              </div>
            </button>
            <button
              onClick={() => setSelectedView("timeline")}
              className={`px-4 py-2 rounded-lg transition ${selectedView === "timeline"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Timeline
              </div>
            </button>
            <button
              onClick={() => setSelectedView("matrix")}
              className={`px-4 py-2 rounded-lg transition ${selectedView === "matrix"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center">
                <BarChart className="w-4 h-4 mr-2" />
                Matrix
              </div>
            </button>
          </div>

          {/* Summary Stats with Growth Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Orders</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{analytics.summary?.totalOrders?.toLocaleString() || 0}</h3>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">
                      {calculateGrowth(analytics.yearlyAnalytics?.[0]?.totalOrders || 0, analytics.yearlyAnalytics?.[1]?.totalOrders || 0).toFixed(1)}%
                    </span>
                    <span className="text-sm text-gray-500 ml-2">vs last year</span>
                  </div>
                </div>
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <ShoppingBag className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{analytics.summary?.totalRevenue?.toLocaleString() || 0}</h3>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">
                      {calculateGrowth(analytics.yearlyAnalytics?.[0]?.totalAmount || 0, analytics.yearlyAnalytics?.[1]?.totalAmount || 0).toFixed(1)}%
                    </span>
                    <span className="text-sm text-gray-500 ml-2">vs last year</span>
                  </div>
                </div>
                <div className="bg-green-500/10 p-2 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Total Users</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{analytics.summary?.totalUsers?.toLocaleString() || 0}</h3>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">
                      {calculateGrowth(analytics.yearlyAnalytics?.[0]?.totalUsers || 0, analytics.yearlyAnalytics?.[1]?.totalUsers || 0).toFixed(1)}%
                    </span>
                    <span className="text-sm text-gray-500 ml-2">vs last year</span>
                  </div>
                </div>
                <div className="bg-purple-500/10 p-2 rounded-lg">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 font-medium">Avg Order Value</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    ₹{formatNumber(analytics.summary?.avgOrderValue || 0)}
                  </h3>
                  <div className="flex items-center mt-2">
                    <Target className="w-4 h-4 text-amber-500 mr-1" />
                    <span className="text-sm text-amber-600 font-medium">
                      {analytics.yearlyAnalytics?.[0]?.avgOrderValue ? 
                        `₹${formatNumber(analytics.yearlyAnalytics[0].avgOrderValue)} this year` : 
                        'No data'
                      }
                    </span>
                  </div>
                </div>
                <div className="bg-amber-500/10 p-2 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Top Performers Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Users */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                Top 5 Users by Revenue
              </h3>
              <div className="space-y-4">
                {topUsers.map((user, index) => (
                  <div key={user.user?.id || index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.user?.username || 'Unknown User'}</p>
                        <p className="text-sm text-gray-500">{user.user?.number || 'No phone'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₹{user.totalAmount?.toLocaleString() || 0}</p>
                      <p className="text-sm text-gray-500">{user.totalOrders || 0} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                <Package className="w-5 h-5 mr-2 text-green-500" />
                Top 5 Products by Revenue
              </h3>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.productId || index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full font-bold mr-3">
                        {index + 1}
                      </div>
                      <div className="max-w-xs">
                        <p className="font-medium text-gray-900 truncate">{product.productName || 'Unknown Product'}</p>
                        <p className="text-sm text-gray-500">{product.users?.length || 0} customers</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₹{product.totalAmount?.toLocaleString() || 0}</p>
                      <p className="text-sm text-gray-500">{product.totalQuantity || 0} units</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content based on Selected View */}
        {selectedView === "users" && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
            <div
              className="flex items-center justify-between cursor-pointer mb-4"
              onClick={() => toggleSection("users")}
            >
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                User Analytics ({filteredUsers.length})
              </h2>
              {expandedSections.users ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.users && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Phone</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Total Orders</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Total Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Avg Order</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">This Year</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">This Month</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Products</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user, index) => (
                      <tr key={user.user?.id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full mr-3">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.user?.username || 'Unknown'}</p>
                              <p className="text-sm text-gray-500">{user.user?.email || 'No email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-700 font-mono">{user.user?.number || 'N/A'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-center">
                            <p className="font-bold text-lg text-gray-900">{user.totalOrders || 0}</p>
                            <p className="text-xs text-gray-500">orders</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-green-600">₹{user.totalAmount?.toLocaleString() || 0}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-700">
                            ₹{user.totalOrders > 0 ? formatNumber(user.totalAmount / user.totalOrders) : '0.00'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          {user.yearlyOrders?.[0] ? (
                            <div>
                              <p className="text-sm font-medium">{user.yearlyOrders[0].year}: {user.yearlyOrders[0].orders} orders</p>
                              <p className="text-xs text-gray-500">₹{user.yearlyOrders[0].amount?.toLocaleString() || 0}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400">No data</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {user.monthlyOrders?.[0] ? (
                            <div>
                              <p className="text-sm font-medium">{user.monthlyOrders[0].month}: {user.monthlyOrders[0].orders} orders</p>
                              <p className="text-xs text-gray-500">₹{user.monthlyOrders[0].amount?.toLocaleString() || 0}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400">No data</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-center">
                            <p className="font-bold">{user.products?.length || 0}</p>
                            <p className="text-xs text-gray-500">unique products</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => user.user?.id && setSelectedUserId(user.user.id)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50 transition"
                            title="View details"
                            disabled={!user.user?.id}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {selectedView === "products" && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
            <div
              className="flex items-center justify-between cursor-pointer mb-4"
              onClick={() => toggleSection("products")}
            >
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-green-500" />
                Product Analytics ({filteredProducts.length})
              </h2>
              {expandedSections.products ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.products && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Product</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Total Sold</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Revenue</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Orders</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Avg Price</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Customers</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">This Year</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">This Month</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProducts.map((product, index) => (
                      <tr key={product.productId || index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{product.productName || 'Unknown Product'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-center">
                            <p className="font-bold text-lg text-gray-900">{product.totalQuantity || 0}</p>
                            <p className="text-xs text-gray-500">units</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-green-600">₹{product.totalAmount?.toLocaleString() || 0}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-700">{product.totalOrders || 0}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-700">
                            ₹{product.totalQuantity > 0 ? formatNumber(product.totalAmount / product.totalQuantity) : '0.00'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-center">
                            <p className="font-bold">{product.users?.length || 0}</p>
                            <p className="text-xs text-gray-500">customers</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {product.yearlySales?.[0] ? (
                            <div>
                              <p className="text-sm font-medium">{product.yearlySales[0].quantity} units</p>
                              <p className="text-xs text-gray-500">₹{product.yearlySales[0].amount?.toLocaleString() || 0}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400">No data</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {product.monthlySales?.[0] ? (
                            <div>
                              <p className="text-sm font-medium">{product.monthlySales[0].quantity} units</p>
                              <p className="text-xs text-gray-500">₹{product.monthlySales[0].amount?.toLocaleString() || 0}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400">No data</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {selectedView === "timeline" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly Analytics */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div
                className="flex items-center justify-between cursor-pointer mb-4"
                onClick={() => toggleSection("monthly")}
              >
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                  Monthly Analytics
                </h2>
                {expandedSections.monthly ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>

              {expandedSections.monthly && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Month</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Orders</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Revenue</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Users</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Products</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Avg Order</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.monthlyAnalytics?.slice(0, 12).map((month, index) => (
                        <tr key={month.month || index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{month.month || 'Unknown Month'}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium">{month.totalOrders || 0}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-bold text-green-600">₹{month.totalAmount?.toLocaleString() || 0}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-gray-700">{month.totalUsers || 0}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-gray-700">{month.totalProducts || 0}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-gray-700">
                              ₹{month.totalOrders > 0 ? formatNumber(month.totalAmount / month.totalOrders) : '0.00'}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Yearly Analytics */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div
                className="flex items-center justify-between cursor-pointer mb-4"
                onClick={() => toggleSection("yearly")}
              >
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <BarChart className="w-5 h-5 mr-2 text-amber-500" />
                  Yearly Analytics
                </h2>
                {expandedSections.yearly ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>

              {expandedSections.yearly && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Year</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Orders</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Revenue</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Users</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Products</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Growth</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.yearlyAnalytics?.map((year, index) => {
                        const prevYear = analytics.yearlyAnalytics?.[index + 1];
                        const growth = prevYear ?
                          calculateGrowth(year.totalAmount || 0, prevYear.totalAmount || 0) : 0;

                        return (
                          <tr key={year.year || index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{year.year || 'Unknown Year'}</td>
                            <td className="px-4 py-3">
                              <p className="font-medium">{year.totalOrders || 0}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-bold text-green-600">₹{year.totalAmount?.toLocaleString() || 0}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-gray-700">{year.totalUsers || 0}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-gray-700">{year.totalProducts || 0}</p>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                {growth >= 0 ? (
                                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                                ) : (
                                  <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                                )}
                                <p className={`font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {growth >= 0 ? '+' : ''}{formatNumber(growth)}%
                                </p>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedView === "matrix" && (
          <>
            {/* User-Product Matrix Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center mb-4">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                User-Product Matrix Analysis
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User-Wise Product Analysis */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    User-Wise Product Analysis
                  </h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {analytics.matrices?.userProductMatrix?.slice(0, 10).map((userData, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{userData.user?.username || 'Unknown User'}</p>
                            <p className="text-sm text-gray-500">{userData.user?.number || 'No phone'}</p>
                          </div>
                          <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded">
                            {userData.products?.length || 0} products
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {userData.products?.slice(0, 3).map((prod, prodIndex) => (
                            <div key={prodIndex} className="flex justify-between">
                              <span className="truncate">{prod.productName || 'Unknown'}</span>
                              <span className="font-medium">{prod.quantity || 0} units</span>
                            </div>
                          ))}
                          {userData.products?.length > 3 && (
                            <p className="text-xs text-gray-500 mt-1">+{userData.products.length - 3} more products</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Product-Wise User Analysis */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Product-Wise User Analysis
                  </h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {analytics.matrices?.productUserMatrix?.slice(0, 10).map((productData, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium text-gray-900 truncate">{productData.productName || 'Unknown Product'}</p>
                          <span className="text-sm bg-green-100 text-green-600 px-2 py-1 rounded">
                            {productData.users?.length || 0} users
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {productData.users?.slice(0, 3).map((user, userIndex) => (
                            <div key={userIndex} className="flex justify-between items-center">
                              <div>
                                <span className="font-medium">{user.username || 'Unknown'}</span>
                                <span className="text-xs text-gray-500 ml-2">{user.number || 'No phone'}</span>
                              </div>
                              <span className="font-medium">{user.quantity || 0} units</span>
                            </div>
                          ))}
                          {productData.users?.length > 3 && (
                            <p className="text-xs text-gray-500 mt-1">+{productData.users.length - 3} more users</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Export Options */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Advanced Export Options</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => exportMatrixToExcel('user')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export User Matrix
                </button>
                <button
                  onClick={() => exportMatrixToExcel('product')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Product Matrix
                </button>
                <button
                  onClick={() => exportDetailedAnalytics()}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export Detailed Analytics
                </button>
              </div>
            </div>
          </>
        )}
        
        {/* User Detail Modal */}
        {selectedUserId && (
          <UserDetailModal
            userId={selectedUserId}
            onClose={() => setSelectedUserId(null)}
          />
        )}
      </div>
    </div>
  );
};

// User Detail Modal Component
const UserDetailModal = ({ userId, onClose }) => {
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/order/analytics/user/${userId}`);
        setUserAnalytics(data.analytics);
      } catch (error) {
        toast.error("Failed to fetch user details");
        console.error(error);
      }
      setLoading(false);
    };

    fetchUserAnalytics();
  }, [userId]);

  if (loading) {
    return (
      <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!userAnalytics) return null;

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">User Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* User Info */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg mb-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full mr-4">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{userAnalytics.user?.username || 'Unknown User'}</h3>
                <p className="text-gray-600">{userAnalytics.user?.email || 'No email'} • {userAnalytics.user?.number || 'No phone'}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{userAnalytics.totalOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Total Amount */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-100">
              <p className="text-sm text-green-600 mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">₹{userAnalytics.totalAmount?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-500 mt-1">
                Avg: ₹{userAnalytics.totalOrders > 0 ? (userAnalytics.totalAmount / userAnalytics.totalOrders).toFixed(2) : '0.00'} per order
              </p>
            </div>

            {/* Payment Methods */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-100">
              <p className="text-sm text-purple-600 mb-2">Payment Methods</p>
              <div className="space-y-1">
                {userAnalytics.paymentMethods?.map(method => (
                  <div key={method.method} className="flex justify-between">
                    <span className="text-gray-700">{method.method}</span>
                    <span className="font-medium">{method.count} orders</span>
                  </div>
                )) || <p className="text-gray-500">No payment data</p>}
              </div>
            </div>
          </div>

          {/* Products Breakdown */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Products Ordered</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Product</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Quantity</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Total Amount</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Orders</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Avg per Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {userAnalytics.productBreakdown?.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-900">{product.productName || 'Unknown'}</td>
                      <td className="px-4 py-2">{product.totalQuantity || 0}</td>
                      <td className="px-4 py-2 text-green-600 font-medium">₹{product.totalAmount?.toLocaleString() || 0}</td>
                      <td className="px-4 py-2">{product.orders || 0}</td>
                      <td className="px-4 py-2">
                        ₹{product.orders > 0 ? (product.totalAmount / product.orders).toFixed(2) : '0.00'}
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="5" className="px-4 py-2 text-center text-gray-500">No product data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Timeline Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Breakdown */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Monthly Breakdown</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userAnalytics.monthlyBreakdown?.map((month, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{month.month || 'Unknown Month'}</span>
                      <span className="text-green-600 font-medium">₹{month.amount?.toLocaleString() || 0}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {month.orders || 0} orders • Avg: ₹{month.orders > 0 ? (month.amount / month.orders).toFixed(2) : '0.00'}
                    </div>
                  </div>
                )) || <p className="text-gray-500">No monthly data</p>}
              </div>
            </div>

            {/* Yearly Breakdown */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Yearly Breakdown</h4>
              <div className="space-y-3">
                {userAnalytics.yearlyBreakdown?.map((year, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-lg">{year.year || 'Unknown Year'}</span>
                      <span className="text-green-600 font-bold">₹{year.amount?.toLocaleString() || 0}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {year.orders || 0} orders • Avg: ₹{year.orders > 0 ? (year.amount / year.orders).toFixed(2) : '0.00'} per order
                    </div>
                  </div>
                )) || <p className="text-gray-500">No yearly data</p>}
              </div>
            </div>
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderAnalytics;
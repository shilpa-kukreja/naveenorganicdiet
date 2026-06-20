'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiUser, FiShoppingBag, FiEdit, FiSave, FiX, FiLogOut, FiCamera, FiCheck, FiFileText, FiChevronRight, FiDollarSign, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiRefreshCw, FiCalendar, FiMapPin, FiCreditCard, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Link from "next/link";
import Footer from "../componats/Footer";
import Header from "../componats/Header";

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("profile");
    const [isLoading, setIsLoading] = useState(true);
    const [isOrdersLoading, setIsOrdersLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [updatingOrder, setUpdatingOrder] = useState(null);
    const ordersPerPage = 3;
    
    const [editForm, setEditForm] = useState({
        username: "",
        email: "",
        number: ""
    });
    const [notification, setNotification] = useState({ show: false, message: "", type: "" });
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        const fetchUser = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/users/getuser", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                if (data.success) {
                    setUser(data.user);
                    setEditForm({
                        username: data.user.username || "",
                        email: data.user.email || "",
                        number: data.user.number || ""
                    });
                    
                    // Fetch user's orders
                    fetchUserOrders(data.user._id || data.user.id);
                } else {
                    router.push("/login");
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                router.push("/login");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    const fetchUserOrders = async (userId) => {
        setIsOrdersLoading(true);
        try {
            const { data } = await axios.post("http://localhost:5000/api/order/user", { userId });
            setOrders(data.orders || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
            showNotification("Failed to fetch orders", "error");
        } finally {
            setIsOrdersLoading(false);
        }
    };

    const showNotification = (message, type = "success") => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await fetch("http://localhost:5000/api/users/updateuser", {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await res.json();
            if (data.success) {
                setUser(data.user);
                showNotification("Profile picture updated successfully!");
            } else {
                showNotification(data.message || "Failed to upload image", "error");
            }
        } catch (error) {
            console.error("Image upload failed:", error);
            showNotification("Image upload failed", "error");
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        const token = localStorage.getItem("token");
        
        try {
            const res = await fetch("http://localhost:5000/api/users/updateuser", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editForm),
            });

            const data = await res.json();
            if (data.success) {
                setUser(data.user);
                setIsEditing(false);
                showNotification("Profile updated successfully!");
            } else {
                showNotification(data.message || "Failed to update profile", "error");
            }
        } catch (error) {
            console.error("Profile update failed:", error);
            showNotification("Profile update failed", "error");
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditForm({
            username: user?.username || "",
            email: user?.email || "",
            number: user?.number || ""
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const changeOrderStatus = async (orderid, status) => {
        setUpdatingOrder(orderid);
        try {
            const { data } = await axios.put("http://localhost:5000/api/order/status", { orderid, status });
            showNotification(data.message || "Order status updated successfully");
            // Refresh orders
            if (user) {
                fetchUserOrders(user._id || user.id);
            }
        } catch (error) {
            showNotification(error.response?.data?.message || "Failed to update order", "error");
        }
        setUpdatingOrder(null);
    };

    const toggleOrderExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Order Placed":
                return <FiPackage className="w-4 h-4" />;
            case "Shipped":
                return <FiTruck className="w-4 h-4" />;
            case "Delivered":
                return <FiCheckCircle className="w-4 h-4" />;
            case "Cancelled":
                return <FiXCircle className="w-4 h-4" />;
            case "Returned":
                return <FiRefreshCw className="w-4 h-4" />;
            default:
                return <FiPackage className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Order Placed":
                return "bg-blue-100 text-blue-700";
            case "Shipped":
                return "bg-purple-100 text-purple-700";
            case "Delivered":
                return "bg-green-100 text-green-700";
            case "Cancelled":
                return "bg-red-100 text-red-700";
            case "Returned":
                return "bg-yellow-100 text-yellow-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const viewOrderDetails = (order) => {
        setSelectedOrder(order);
    };

    const closeOrderDetails = () => {
        setSelectedOrder(null);
    };

    // Calculate pagination
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(orders.length / ordersPerPage);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00a63d] mb-4"></div>
                    <p className="text-gray-500">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header />
            <div className="min-h-screen bg-gray-50">
                {/* Notification */}
                {notification.show && (
                    <div className={`fixed top-4 right-4 px-6 py-3 rounded-md shadow-md z-50 transition-all duration-300 transform ${notification.type === "error" ? "bg-red-500" : "bg-green-500"} text-white flex items-center`}>
                        <FiCheck className="mr-2" />
                        {notification.message}
                    </div>
                )}
                
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Welcome Banner */}
                    <div className="bg-gradient-to-r from-[#00a63d] to-[#2ecc71] rounded-xl p-6 mb-8 text-white shadow-lg">
                        <div className="flex items-center">
                            <div className="mr-4">
                                {user?.img ? (
                                    <img
                                        src={`http://localhost:5000${user.img}`}
                                        alt="Profile"
                                        className="w-16 h-16 rounded-full object-cover border-4 border-white/30 shadow-md"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-medium shadow-md backdrop-blur-sm">
                                        {user?.username?.charAt(0)?.toUpperCase() || "U"}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h2 className="sm:text-2xl text-xl font-bold">Welcome back, {user?.username}!</h2>
                                <p className="text-white/90 text-sm">Manage your account information and track your orders</p>
                            </div>
                            <div className="hidden md:flex items-center space-x-4">
                                <div className="text-center px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <div className="text-xl font-bold">{orders.length}</div>
                                    <div className="text-xs opacity-90">Total Orders</div>
                                </div>
                                {/* <div className="text-center px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <div className="text-xl font-bold">
                                        ₹{orders.reduce((sum, order) => sum + order.amount, 0).toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-xs opacity-90">Total Spent</div>
                                </div> */}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-8">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab("profile")}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === "profile"
                                    ? "border-[#00a63d] text-[#00a63d]"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    } transition-colors duration-200`}
                            >
                                <FiUser className="h-5 w-5 mr-2" />
                                My Profile
                            </button>
                            <button
                                onClick={() => setActiveTab("orders")}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === "orders"
                                    ? "border-[#00a63d] text-[#00a63d]"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    } transition-colors duration-200`}
                            >
                                <FiShoppingBag className="h-5 w-5 mr-2" />
                                My Orders
                                {orders.length > 0 && (
                                    <span className="ml-2 bg-[#00a63d] text-white text-xs rounded-full px-2 py-0.5">
                                        {orders.length}
                                    </span>
                                )}
                            </button>
                            <Link href="/orders">
                                <button
                                    className="py-4 px-1 border-b-2 font-medium text-sm flex items-center border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors duration-200"
                                >
                                    View All Orders
                                    <FiChevronRight className="h-4 w-4 ml-1" />
                                </button>
                            </Link>
                        </nav>
                    </div>

                    {/* Profile Section */}
                    {activeTab === "profile" && (
                        <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                            <div className="px-6 py-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
                                    {!isEditing && (
                                        <button 
                                            onClick={handleEdit}
                                            className="flex items-center text-[#00a63d] hover:text-[#00a63d] font-medium transition-colors"
                                        >
                                            <FiEdit className="h-5 w-5 mr-1" />
                                            Edit Profile
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Profile Image Section */}
                                    <div className="md:w-1/3">
                                        <div className="flex flex-col items-center">
                                            {user?.img ? (
                                                <img
                                                    src={`http://localhost:5000${user.img}`}
                                                    alt="Profile"
                                                    className="w-40 h-40 rounded-full object-cover border-4 border-gray-100 shadow-md mb-4"
                                                />
                                            ) : (
                                                <div className="w-40 h-40 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 mb-4 border-4 border-white shadow-md">
                                                    <FiUser className="h-20 w-20" />
                                                </div>
                                            )}

                                            <label className="cursor-pointer bg-white text-[#00a63d] border border-[#00a63d] rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-50 transition-colors flex items-center">
                                                <FiCamera className="h-4 w-4 mr-2" />
                                                Change Photo
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageUpload}
                                                />
                                            </label>
                                            <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
                                        </div>
                                    </div>

                                    {/* User Details */}
                                    <div className="md:w-2/3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="username"
                                                        value={editForm.username}
                                                        onChange={handleInputChange}
                                                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a63d] focus:border-transparent transition-colors"
                                                        placeholder="Enter your full name"
                                                    />
                                                ) : (
                                                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                                                        {user?.username || "Not provided"}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                                {isEditing ? (
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={editForm.email}
                                                        onChange={handleInputChange}
                                                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a63d] focus:border-transparent transition-colors"
                                                        placeholder="Enter your email"
                                                    />
                                                ) : (
                                                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                                                        {user?.email || "Not provided"}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                                                {isEditing ? (
                                                    <input
                                                        type="tel"
                                                        name="number"
                                                        value={editForm.number}
                                                        onChange={handleInputChange}
                                                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a63d] focus:border-transparent transition-colors"
                                                        placeholder="Enter your phone number"
                                                    />
                                                ) : (
                                                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                                                        {user?.number || "Not provided"}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {isEditing && (
                                            <div className="mt-6 flex space-x-3">
                                                <button 
                                                    onClick={handleSave}
                                                    className="bg-[#00a63d] text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-[#009933] transition-colors flex items-center"
                                                >
                                                    <FiSave className="h-4 w-4 mr-1" />
                                                    Save Changes
                                                </button>
                                                <button 
                                                    onClick={handleCancel}
                                                    className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors flex items-center"
                                                >
                                                    <FiX className="h-4 w-4 mr-1" />
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Orders Section */}
                    {activeTab === "orders" && (
                        <div className="space-y-6">
                            {/* Orders Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-blue-100 rounded-lg mr-4">
                                            <FiShoppingBag className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Total Orders</p>
                                            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-green-100 rounded-lg mr-4">
                                            <FiDollarSign className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Total Spent</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                ₹{orders.reduce((sum, order) => sum + order.amount, 0).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {/* <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-purple-100 rounded-lg mr-4">
                                            <FiCheckCircle className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Latest Order</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {orders.length > 0 ? `#${orders[0]?.orderid}` : 'No orders yet'}
                                            </p>
                                        </div>
                                    </div>
                                </div> */}
                            </div>

                            {/* Orders List */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                                            <p className="text-gray-600 text-sm mt-1">Your latest {Math.min(orders.length, ordersPerPage)} of {orders.length} orders</p>
                                        </div>
                                        <Link href="/orders">
                                            <button className="flex items-center text-[#00a63d] hover:text-[#009933] font-medium text-sm">
                                                View All Orders
                                                <FiChevronRight className="h-4 w-4 ml-1" />
                                            </button>
                                        </Link>
                                    </div>

                                    {isOrdersLoading ? (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00a63d] mb-4"></div>
                                            <p className="text-gray-500">Loading orders...</p>
                                        </div>
                                    ) : orders.length === 0 ? (
                                        <div className="text-center py-12">
                                            <FiShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                                            <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                                            <button 
                                                onClick={() => router.push("/")}
                                                className="px-6 py-3 bg-[#00a63d] text-white rounded-lg hover:bg-[#009933] transition font-medium"
                                            >
                                                Start Shopping
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {currentOrders.map((order) => (
                                                <div key={order._id} className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#00a63d] transition-colors duration-200">
                                                    {/* Order Header */}
                                                    <div className="bg-gray-50 px-5 py-4">
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                            <div className="flex items-center mb-3 sm:mb-0">
                                                                <div className="bg-white p-2 rounded-lg border border-gray-300 mr-4">
                                                                    <FiPackage className="h-5 w-5 text-gray-600" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-semibold text-gray-900">Order #{order.orderid}</h3>
                                                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                                                        <FiCalendar className="h-4 w-4 mr-1" />
                                                                        <span>Placed on {formatDate(order.createdAt)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                                                    {getStatusIcon(order.status)}
                                                                    <span className="ml-1.5">{order.status}</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => toggleOrderExpand(order._id)}
                                                                    className="text-gray-500 hover:text-gray-700"
                                                                >
                                                                    {expandedOrder === order._id ? (
                                                                        <FiChevronUp className="h-5 w-5" />
                                                                    ) : (
                                                                        <FiChevronDown className="h-5 w-5" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Order Summary */}
                                                    <div className="px-5 py-4">
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                            <div className="mb-4 sm:mb-0">
                                                                <div className="flex items-center mb-2">
                                                                    <FiMapPin className="h-4 w-4 text-gray-400 mr-2" />
                                                                    <span className="text-sm text-gray-600">Delivering to: {order.address?.city || 'N/A'}</span>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <FiCreditCard className="h-4 w-4 text-gray-400 mr-2" />
                                                                    <span className="text-sm text-gray-600">Payment: {order.paymentMethod || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-lg font-bold text-gray-900">₹{order.amount.toLocaleString('en-IN')}</div>
                                                                <div className="text-sm text-gray-500">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</div>
                                                            </div>
                                                        </div>

                                                        {/* Order Actions */}
                                                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                                                            <button
                                                                onClick={() => viewOrderDetails(order)}
                                                                className="flex items-center text-[#00a63d] hover:text-[#009933] text-sm font-medium"
                                                            >
                                                                <FiFileText className="h-4 w-4 mr-1" />
                                                                View Details
                                                            </button>
                                                            
                                                            {(order.status === "Order Placed" || order.status === "Shipped") && (
                                                                <button
                                                                    onClick={() => changeOrderStatus(order.orderid, "Cancelled")}
                                                                    disabled={updatingOrder === order.orderid}
                                                                    className="flex items-center bg-red-50 text-red-700 px-3 py-1.5 rounded text-sm hover:bg-red-100 transition disabled:opacity-50 ml-4"
                                                                >
                                                                    {updatingOrder === order.orderid ? (
                                                                        <>
                                                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-700 mr-2"></div>
                                                                            Processing...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <FiXCircle className="h-3 w-3 mr-1" />
                                                                            Cancel Order
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}
                                                            
                                                            {order.status === "Delivered" && (
                                                                <button
                                                                    onClick={() => changeOrderStatus(order.orderid, "Returned")}
                                                                    disabled={updatingOrder === order.orderid}
                                                                    className="flex items-center bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded text-sm hover:bg-yellow-100 transition disabled:opacity-50 ml-4"
                                                                >
                                                                    {updatingOrder === order.orderid ? (
                                                                        <>
                                                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-700 mr-2"></div>
                                                                            Processing...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <FiRefreshCw className="h-3 w-3 mr-1" />
                                                                            Return Item
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Expanded Order Details */}
                                                        {expandedOrder === order._id && (
                                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                                <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                                                                <div className="space-y-3">
                                                                    {order.items?.map((item, index) => (
                                                                        <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                                                                            <img 
                                                                                src={item.image} 
                                                                                alt={item.name} 
                                                                                className="w-12 h-12 object-cover rounded border border-gray-300" 
                                                                            />
                                                                            <div className="ml-4 flex-1">
                                                                                <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                                                                                <div className="flex justify-between items-center mt-1">
                                                                                    <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                                                                                    <p className="font-semibold text-gray-900">₹{item.price}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Pagination */}
                                            {totalPages > 1 && (
                                                <div className="flex justify-center pt-6">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                            disabled={currentPage === 1}
                                                            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                                        >
                                                            <FiChevronRight className="h-5 w-5 transform rotate-180" />
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
                                                            <FiChevronRight className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button 
                                        onClick={() => router.push("/")}
                                        className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-[#00a63d] hover:bg-blue-50 transition-colors"
                                    >
                                        <FiShoppingBag className="h-5 w-5 text-gray-600 mr-3" />
                                        <span className="font-medium text-gray-900">Continue Shopping</span>
                                    </button>
                                    <button 
                                        onClick={() => router.push("/orders")}
                                        className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-[#00a63d] hover:bg-green-50 transition-colors"
                                    >
                                        <FiFileText className="h-5 w-5 text-gray-600 mr-3" />
                                        <span className="font-medium text-gray-900">View All Orders</span>
                                    </button>
                                    <button 
                                        onClick={() => router.push("/contact")}
                                        className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-[#00a63d] hover:bg-purple-50 transition-colors"
                                    >
                                        <FiUser className="h-5 w-5 text-gray-600 mr-3" />
                                        <span className="font-medium text-gray-900">Contact Support</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                {/* Order Details Modal */}
                {selectedOrder && (
                    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-800">Order Details: #{selectedOrder.orderid}</h3>
                                <button onClick={closeOrderDetails} className="text-gray-500 hover:text-gray-700">
                                    <FiX className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {/* Order Status */}
                                <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                                    {getStatusIcon(selectedOrder.status)}
                                    <span className="ml-1.5">{selectedOrder.status}</span>
                                </div>
                                
                                {/* Order Items */}
                                <div className="border rounded-md overflow-hidden">
                                    <div className="grid grid-cols-3 bg-gray-100 px-4 py-3 font-medium text-gray-700">
                                        <div>Product</div>
                                        <div className="text-center">Quantity</div>
                                        <div className="text-right">Price</div>
                                    </div>
                                    {selectedOrder.items?.map((item, index) => (
                                        <div key={index} className="grid grid-cols-3 px-4 py-3 border-t">
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-center">{item.quantity}</div>
                                            <div className="text-right">₹{item.price}</div>
                                        </div>
                                    ))}
                                    <div className="border-t px-4 py-3 bg-white font-medium">
                                        <div className="flex justify-between">
                                            <span>Total:</span>
                                            <span>₹{selectedOrder.amount}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Shipping Info */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Shipping Information</h4>
                                    <div className="text-sm text-gray-700">
                                        <p>{selectedOrder.address?.fullName}</p>
                                        <p>{selectedOrder.address?.address1}, {selectedOrder.address?.address2}</p>
                                        <p>{selectedOrder.address?.city}, {selectedOrder.address?.country} - {selectedOrder.address?.postalCode}</p>
                                        <p className="mt-2">Phone: {selectedOrder.address?.phone}</p>
                                        <p>Email: {selectedOrder.address?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Download,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  UserPlus,
  Eye,
  X,
  Loader,
  AlertCircle
} from "lucide-react";

const AdminAllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const exportMenuRef = useRef(null);
  const usersPerPage = 10;

  // Fetch all users
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/getalluser`);
      setUsers(data.users);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch users");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllUsers();
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

  // Delete user function
  const deleteUser = async (userId) => {
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/deleteuser`, { id: userId });
      toast.success(data.message);
      fetchAllUsers(); // Refresh the list
      setDeleteConfirm(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format date for input
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Filter users based on search term, status, and date
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.number.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "verified" && user.verifiedAt) ||
      (statusFilter === "unverified" && !user.verifiedAt);
    
    const matchesDate = !dateFilter || formatDateForInput(user.createdAt) === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Export to Excel function
  const exportToExcel = () => {
    setIsExporting(true);
    const worksheet = XLSX.utils.json_to_sheet(currentUsers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users.xlsx");
    setIsExporting(false);

    toast.success("Users exported successfully");

    setIsExportMenuOpen(false);
  };

  // Stats for dashboard
  const stats = {
    total: users.length,
    verified: users.filter(user => user.verifiedAt).length,
    unverified: users.filter(user => !user.verifiedAt).length,
    today: users.filter(user => {
      const today = new Date().toDateString();
      return new Date(user.createdAt).toDateString() === today;
    }).length
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading users...</p>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <Toaster position="top-right" />
        
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-2">Manage and monitor all registered users</p>
              </div>
              <div className="flex items-center mt-4 md:mt-0 space-x-3">
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg flex items-center border border-blue-100">
                  <User className="w-5 h-5 mr-2" />
                  <span className="font-medium">{users.length} user{users.length !== 1 ? 's' : ''}</span>
                </div>
                
                <button 
                  onClick={fetchAllUsers}
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
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Total Users</p>
                    <h3 className="text-xl font-bold text-gray-900">{stats.total}</h3>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-100">
                <div className="flex items-center">
                  <div className="bg-green-500 p-3 rounded-lg mr-4">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Verified Users</p>
                    <h3 className="text-xl font-bold text-gray-900">{stats.verified}</h3>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-100">
                <div className="flex items-center">
                  <div className="bg-amber-500 p-3 rounded-lg mr-4">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-amber-600">Unverified Users</p>
                    <h3 className="text-xl font-bold text-gray-900">{stats.unverified}</h3>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-100">
                <div className="flex items-center">
                  <div className="bg-purple-500 p-3 rounded-lg mr-4">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600">Registered Today</p>
                    <h3 className="text-xl font-bold text-gray-900">{stats.today}</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div> */}
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

          {filteredUsers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all" || dateFilter
                  ? "Try adjusting your search or filter criteria" 
                  : "No users have registered yet"}
              </p>
            </div>
          ) : (
            <>
              {/* Users Table */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {user.img ? (
                                  <img className="h-10 w-10 rounded-full object-cover" src={`${process.env.NEXT_PUBLIC_API_URL}${user.img}`} alt={user.username} />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="h-6 w-6 text-blue-600" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                <div className="text-sm text-gray-500">ID: {user._id.substring(0, 8)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center">
                              <Mail className="w-4 h-4 mr-2 text-blue-500" />
                              {user.email}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Phone className="w-4 h-4 mr-2 text-green-500" />
                              {user.number}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.verifiedAt ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <XCircle className="w-4 h-4 mr-1" />
                                Unverified
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="text-blue-600 hover:text-blue-900 transition p-1.5 rounded-md hover:bg-blue-50"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(user)}
                                className="text-red-600 hover:text-red-900 transition p-1.5 rounded-md hover:bg-red-50"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
                    Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastUser, filteredUsers.length)}
                    </span>{" "}
                    of <span className="font-medium">{filteredUsers.length}</span> results
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

          {/* User Details Modal */}
          {selectedUser && (
            <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-col items-center mb-6">
                    {selectedUser.img ? (
                      <img className="h-24 w-24 rounded-full object-cover mb-4" src={`${process.env.NEXT_PUBLIC_API_URL}${selectedUser.img}`} alt={selectedUser.username} />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                        <User className="h-12 w-12 text-blue-600" />
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-gray-900">{selectedUser.username}</h3>
                    <p className="text-gray-500 text-sm">User ID: {selectedUser._id}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h4>
                      <div className="space-y-2">
                        <p className="text-gray-900 flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-blue-500" />
                          {selectedUser.email}
                        </p>
                        <p className="text-gray-900 flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-green-500" />
                          {selectedUser.number}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Account Status</h4>
                      <div className="space-y-2">
                        <p className="text-gray-900 flex items-center">
                          <Shield className="w-4 h-4 mr-2 text-purple-500" />
                          {selectedUser.verifiedAt ? "Verified Account" : "Unverified Account"}
                        </p>
                        {selectedUser.verifiedAt && (
                          <p className="text-gray-900 flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-amber-500" />
                            Verified on: {formatDate(selectedUser.verifiedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Registration Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Registered On</p>
                        <p className="text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Updated</p>
                        <p className="text-gray-900">{formatDate(selectedUser.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-red-100 p-3 rounded-full mr-4">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete the user <span className="font-medium">{deleteConfirm.username}</span>? This action cannot be undone.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteUser(deleteConfirm._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default AdminAllUsers;
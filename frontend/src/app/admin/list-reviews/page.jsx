"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Star,
  Eye,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Download,
  AlertCircle,
  Check,
  X,
  MessageSquare,
  User,
  Package,
  Calendar,
  BarChart3,
  TrendingUp,
  ThumbsUp
} from 'lucide-react';
// import { format } from 'date-fns';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/reviews';

const ReviewAdmin = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: 'all',
    rating: '',
    search: '',
    page: 1,
    limit: 10
  });
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [expandedReview, setExpandedReview] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deletingReview, setDeletingReview] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Fetch reviews with filters
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      // Add all filters including page and limit
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== 'all') {
          queryParams.append(key, value);
        }
      });

      console.log('Fetching from:', `${API_URL}/admin?${queryParams}`);

      const response = await axios.get(`${API_URL}/admin?${queryParams}`);
      console.log('Response data:', response.data);

      if (response.data.success && response.data.data) {
        const { reviews, stats, pagination } = response.data.data;

        setReviews(reviews || []);
        setStats({
          pending: stats?.pending || 0,
          approved: stats?.approved || 0,
          rejected: stats?.rejected || 0,
          total: stats?.total || 0
        });
        setPagination({
          current: pagination?.current || 1,
          pages: pagination?.pages || 1,
          total: pagination?.total || 0
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showNotification('Failed to load reviews', 'error');
      setReviews([]);
      setStats({
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1
    }));
  };

  const handleStatusUpdate = async (reviewId, newStatus) => {
    try {
      setUpdatingStatus(reviewId);
      await axios.put(`${API_URL}/${reviewId}/status`, { status: newStatus });

      showNotification(`Review ${newStatus} successfully`, 'success');
      fetchReviews();
    } catch (error) {
      console.error('Error updating review status:', error);
      showNotification('Failed to update review status', 'error');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingReview(reviewId);
      await axios.delete(`${API_URL}/${reviewId}`);

      showNotification('Review deleted successfully', 'success');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      showNotification('Failed to delete review', 'error');
    } finally {
      setDeletingReview(null);
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedReviews.length === 0) {
      showNotification('Please select reviews first', 'error');
      return;
    }

    try {
      const promises = selectedReviews.map(reviewId =>
        axios.put(`${API_URL}/${reviewId}/status`, { status: newStatus })
      );

      await Promise.all(promises);
      showNotification(`${selectedReviews.length} review(s) ${newStatus} successfully`, 'success');
      setSelectedReviews([]);
      fetchReviews();
    } catch (error) {
      console.error('Error bulk updating reviews:', error);
      showNotification('Failed to update reviews', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedReviews.length === 0) {
      showNotification('Please select reviews first', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedReviews.length} review(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      const promises = selectedReviews.map(reviewId =>
        axios.delete(`${API_URL}/${reviewId}`)
      );

      await Promise.all(promises);
      showNotification(`${selectedReviews.length} review(s) deleted successfully`, 'success');
      setSelectedReviews([]);
      fetchReviews();
    } catch (error) {
      console.error('Error bulk deleting reviews:', error);
      showNotification('Failed to delete reviews', 'error');
    }
  };

  const toggleSelectReview = (reviewId) => {
    setSelectedReviews(prev =>
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.map(review => review._id));
    }
  };

  const toggleExpandReview = (reviewId) => {
    setExpandedReview(expandedReview === reviewId ? null : reviewId);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
              }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}.0</span>
      </div>
    );
  };

const formatDate = (dateValue) => {
  if (!dateValue) return '—';

  // ✅ MongoDB $date case handle
  if (typeof dateValue === 'object' && dateValue.$date) {
    dateValue = dateValue.$date;
  }

  const date = new Date(dateValue);

  if (isNaN(date.getTime())) return '—';

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${notification.type === 'success'
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {notification.message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Reviews Management</h1>
            <p className="text-gray-600 mt-2">Manage and moderate customer reviews</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              onClick={() => fetchReviews()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg mr-4">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Bulk Actions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search reviews by title or comment..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <select
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">All Ratings</option>
                    <option value="5">★★★★★ (5)</option>
                    <option value="4">★★★★☆ (4)</option>
                    <option value="3">★★★☆☆ (3)</option>
                    <option value="2">★★☆☆☆ (2)</option>
                    <option value="1">★☆☆☆☆ (1)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedReviews.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedReviews.length} review(s) selected</p>
                      <p className="text-sm text-gray-600">Apply actions to all selected reviews</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleBulkStatusUpdate('approved')}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve Selected
                    </button>
                    <button
                      onClick={() => handleBulkStatusUpdate('rejected')}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject Selected
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Selected
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedReviews.length === reviews.length && reviews.length > 0}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product & Review
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                        <p className="text-gray-500">
                          {filters.search || filters.status !== 'all' || filters.rating
                            ? 'Try changing your filters'
                            : 'No reviews have been submitted yet'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <React.Fragment key={review._id}>
                      <tr className={`hover:bg-gray-50 transition-colors ${expandedReview === review._id ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedReviews.includes(review._id)}
                            onChange={() => toggleSelectReview(review._id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-12 w-12 mr-4">
                              <img
                                className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                                src={`http://localhost:5000${review.product?.thumbImg }`}
                                alt={review.product?.name || 'Product'}
                                // onError={(e) => {
                                //   e.target.src = '/placeholder-product.jpg';
                                // }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center mb-1">
                                <Package className="w-4 h-4 text-gray-400 mr-2" />
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {review.product?.name || 'Product ID: ' + review.product || 'Unknown Product'}
                                </p>
                              </div>
                              <p className="text-sm font-semibold text-gray-800 mb-1">{review.title}</p>
                              <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                              <div className="mt-2 flex items-center text-xs text-gray-500">
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                <span>{review.helpful || 0} people found this helpful</span>
                                {review.verifiedPurchase && (
                                  <span className="ml-3 px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                                    Verified Purchase
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {renderStars(review.rating)}
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(review.status)}`}>
                            {getStatusIcon(review.status)}
                            <span className="ml-1.5 capitalize">{review.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(review.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleExpandReview(review._id)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title={expandedReview === review._id ? 'Hide Details' : 'View Details'}
                            >
                              {expandedReview === review._id ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </button>
                            {review.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(review._id, 'approved')}
                                  disabled={updatingStatus === review._id}
                                  className="text-green-600 hover:text-green-900 transition-colors disabled:opacity-50"
                                  title="Approve Review"
                                >
                                  {updatingStatus === review._id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                  ) : (
                                    <Check className="w-5 h-5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(review._id, 'rejected')}
                                  disabled={updatingStatus === review._id}
                                  className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                                  title="Reject Review"
                                >
                                  {updatingStatus === review._id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                  ) : (
                                    <X className="w-5 h-5" />
                                  )}
                                </button>
                              </>
                            )}
                            {review.status === 'approved' && (
                              <button
                                onClick={() => handleStatusUpdate(review._id, 'rejected')}
                                disabled={updatingStatus === review._id}
                                className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                                title="Reject Review"
                              >
                                {updatingStatus === review._id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                ) : (
                                  <X className="w-5 h-5" />
                                )}
                              </button>
                            )}
                            {review.status === 'rejected' && (
                              <button
                                onClick={() => handleStatusUpdate(review._id, 'approved')}
                                disabled={updatingStatus === review._id}
                                className="text-green-600 hover:text-green-900 transition-colors disabled:opacity-50"
                                title="Approve Review"
                              >
                                {updatingStatus === review._id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                ) : (
                                  <Check className="w-5 h-5" />
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              disabled={deletingReview === review._id}
                              className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                              title="Delete Review"
                            >
                              {deletingReview === review._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <Trash2 className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {expandedReview === review._id && (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 bg-blue-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Review Details */}
                              <div>
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                  <MessageSquare className="w-5 h-5 mr-2" />
                                  Review Details
                                </h4>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-xs font-medium text-gray-500 uppercase">Title</label>
                                      <p className="font-medium text-gray-900">{review.title}</p>
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-500 uppercase">Comment</label>
                                      <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
                                    </div>
                                    {review.images && review.images.length > 0 && (
                                      <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase">Images</label>
                                        <div className="flex space-x-2 mt-2">
                                          {review.images.map((image, index) => (
                                            <img
                                              key={index}
                                              src={image}
                                              alt={`Review ${index + 1}`}
                                              className="w-20 h-20 object-cover rounded border border-gray-300"
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Product Details */}
                              <div>
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                  <Package className="w-5 h-5 mr-2" />
                                  Product Details
                                </h4>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <div className="flex items-center mb-4">
                                    <img
                                      src={`http://localhost:5000${review.product?.thumbImg || '/placeholder-product.jpg'}`}
                                      alt={review.product?.name}
                                      className="w-16 h-16 object-cover rounded border border-gray-300 mr-4"
                                    />
                                    <div>
                                      <p className="font-medium text-gray-900">{review.product?.name || 'Unknown Product'}</p>
                                      <p className="text-sm text-gray-600">Product ID: {review.product?._id || 'N/A'}</p>
                                    </div>
                                  </div>

                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Created:</span>
                                      <span className="font-medium">{formatDate(review.createdAt)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Last Updated:</span>
                                      <span className="font-medium">{formatDate(review.updatedAt)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Helpful Count:</span>
                                      <span className="font-medium">{review.helpful || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Verified Purchase:</span>
                                      <span className={`font-medium ${review.verifiedPurchase ? 'text-green-600' : 'text-gray-600'}`}>
                                        {review.verifiedPurchase ? 'Yes' : 'No'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(filters.page - 1) * filters.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(filters.page * filters.limit, pagination.total)}
                  </span> of{' '}
                  <span className="font-medium">{pagination.total}</span> reviews
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                    disabled={filters.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (filters.page <= 3) {
                      pageNum = i + 1;
                    } else if (filters.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = filters.page - 2 + i;
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleFilterChange('page', pageNum)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filters.page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                    disabled={filters.page === pagination.pages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Approval Rate</span>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-500">
                {stats.approved} of {stats.total} reviews approved
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Pending Review</span>
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
              <div className="text-sm text-gray-500">
                {stats.pending > 0 ? 'Needs attention' : 'All reviews processed'}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Average Rating</span>
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {reviews.length > 0
                  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'
                }
              </div>
              <div className="text-sm text-gray-500">
                Average rating across all reviews
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewAdmin;
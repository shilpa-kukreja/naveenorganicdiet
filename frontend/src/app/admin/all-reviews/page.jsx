// components/AdminReviews.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    status: 'all',
    rating: '',
    search: ''
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [page, rowsPerPage, filters]);

const fetchReviews = async () => {
  try {
    setLoading(true);
    const params = new URLSearchParams({
      page: (page + 1).toString(),
      limit: rowsPerPage.toString(),
      ...filters
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/admin?${params}`);
    const result = await response.json();

    if (result.success) {
      console.log('First review date string:', result.data.reviews[0]?.createdAt);
      console.log('Date object test:', new Date(result.data.reviews[0]?.createdAt));
      console.log('Is valid date?', !isNaN(new Date(result.data.reviews[0]?.createdAt).getTime()));
      
      setReviews(result.data.reviews);
      setTotalCount(result.data.pagination.total);
      setStats(result.data.stats);
    }
  } catch (error) {
    toast.error('Failed to fetch reviews');
  } finally {
    setLoading(false);
  }
};



 // Keep only this one function:
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




  const handleStatusUpdate = async (reviewId, status) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/reviews/${reviewId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Review ${status} successfully`);
        fetchReviews();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update review status');
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/reviews/reviews/${selectedReview._id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Review deleted successfully');
        fetchReviews();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete review');
    }
    setDeleteDialog(false);
  };

  const handleMenuOpen = (event, review) => {
    setAnchorEl(event.currentTarget);
    setSelectedReview(review);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReview(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      approved: { color: 'bg-green-100 text-green-800', icon: '✅' },
      rejected: { color: 'bg-red-100 text-red-800', icon: '❌' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // const formatDate = (dateString) => {
  //   return new Date(dateString).toLocaleDateString('en-US', {
  //     year: 'numeric',
  //     month: 'short',
  //     day: 'numeric',
  //     hour: '2-digit',
  //     minute: '2-digit'
  //   });
  // };



  const StarRating = ({ value, size = 'small' }) => {
    const starSize = size === 'small' ? 'w-4 h-4' : 'w-5 h-5';

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${starSize} ${star <= value ? 'text-yellow-400' : 'text-gray-300'
              }`}
          >
            ★
          </span>
        ))}
        <span className="text-sm text-gray-500 ml-1">({value})</span>
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Review Management
      </h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-600 text-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-2">Total Reviews</h3>
          <p className="text-3xl font-bold">{stats.total || 0}</p>
        </div>
        <div className="bg-yellow-500 text-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-2">Pending</h3>
          <p className="text-3xl font-bold">{stats.pending || 0}</p>
        </div>
        <div className="bg-green-600 text-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-2">Approved</h3>
          <p className="text-3xl font-bold">{stats.approved || 0}</p>
        </div>
        <div className="bg-red-600 text-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-2">Rejected</h3>
          <p className="text-3xl font-bold">{stats.rejected || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-8 gap-4 items-center">
          <div className="md:col-span-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search reviews..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
            >
              <option value="">All Ratings</option>
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product & Review
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
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
                  Helpful
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <img
                        src={review.product?.thumbImg}
                        alt={review.product?.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.product?.name || 'P')}&background=random`;
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {review.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {review.comment.length > 100
                            ? `${review.comment.substring(0, 100)}...`
                            : review.comment
                          }
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-2 ${review.verifiedPurchase
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {review.verifiedPurchase ? "Verified Purchase" : "Guest"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      {review.user?.name || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {review.user?.email || 'No email'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <StarRating value={review.rating} size="small" />
                  </td>
                  <td className="px-6 py-4">
                    {getStatusChip(review.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatDate(review.createdAt)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {review.updatedAt !== review.createdAt ? `Updated: ${formatDate(review.updatedAt)}` : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {review.helpful || 0}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={(e) => handleMenuOpen(e, review)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    >
                      ⋮
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{page * rowsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min((page + 1) * rowsPerPage, totalCount)}
                </span>{' '}
                of <span className="font-medium">{totalCount}</span> results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="relative inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(totalCount / rowsPerPage) - 1}
                className="relative inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Menu */}
      {anchorEl && (
        <div className="fixed inset-0 z-50" onClick={handleMenuClose}>
          <div
            className="absolute bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
            style={{
              top: anchorEl.getBoundingClientRect().bottom,
              left: anchorEl.getBoundingClientRect().left,
              transform: 'translateX(-100%)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* <button
              onClick={() => {
                setViewDialog(true);
                handleMenuClose();
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <span className="mr-2">👁️</span>
              View Details
            </button> */}
            <button
              onClick={() => handleStatusUpdate(selectedReview._id, 'approved')}
              disabled={selectedReview?.status === 'approved'}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="mr-2">✅</span>
              Approve
            </button>
            <button
              onClick={() => handleStatusUpdate(selectedReview._id, 'rejected')}
              disabled={selectedReview?.status === 'rejected'}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="mr-2">❌</span>
              Reject
            </button>
            <button
              onClick={() => {
                setDeleteDialog(true);
                handleMenuClose();
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <span className="mr-2">🗑️</span>
              Delete
            </button>
          </div>
        </div>
      )}

      {/* View Review Dialog */}
      {viewDialog && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Review Details</h3>
            </div>
            <div className="p-6 space-y-6">
              {selectedReview && (
                <>
                  <div className="flex items-center space-x-4">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${selectedReview.product?.thumbImg}`}
                      alt={selectedReview.product?.name}
                      className="w-16 h-16 rounded-lg object-cover"
                      // onError={(e) => {
                      //   e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedReview.product?.name || 'P')}&background=random`;
                      // }}
                    />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {selectedReview.product?.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Product ID: {selectedReview.product?._id}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">User Information</h5>
                    <p className="text-sm text-gray-600">
                      Name: {selectedReview.user?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Email: {selectedReview.user?.email || 'No email'}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Rating & Status</h5>
                    <div className="flex items-center space-x-4 mb-2">
                      <StarRating value={selectedReview.rating} size="large" />
                    </div>
                    {getStatusChip(selectedReview.status)}
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Review Title</h5>
                    <p className="text-gray-900">{selectedReview.title}</p>
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Review Comment</h5>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedReview.comment}</p>
                  </div>

                  {selectedReview.images && selectedReview.images.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 mb-2">Review Images</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedReview.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Review ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Additional Information</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <p>Helpful Count: {selectedReview.helpful || 0}</p>
                      <p>Verified Purchase: {selectedReview.verifiedPurchase ? 'Yes' : 'No'}</p>
                      <p>Created: {formatDate(selectedReview.createdAt)}</p>
                      <p>Last Updated: {formatDate(selectedReview.updatedAt)}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setViewDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialog && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Delete Review</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this review? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setDeleteDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
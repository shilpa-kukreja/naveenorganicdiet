"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Search,
  Filter,
  Star,
  Edit,
  Trash2,
  User,
  MessageSquare,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical
} from "lucide-react";

const TestimonialsList = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [viewMode, setViewMode] = useState("Table"); // 'grid' or 'table'
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [selectedItems, setSelectedItems] = useState([]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/testimonials/all`);
      if (res.data.success) {
        setTestimonials(res.data.testimonials);
        setFilteredTestimonials(res.data.testimonials);
      }
    } catch (error) {
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let result = testimonials;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply rating filter
    if (ratingFilter > 0) {
      result = result.filter((t) => parseInt(t.rating) === ratingFilter);
    }

    setFilteredTestimonials(result);
    setCurrentPage(1);
  }, [searchTerm, ratingFilter, testimonials]);

  const deleteTestimonial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;

    try {
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/testimonials/delete/${id}`);

      console.log("response: ", res.data);

      if (res.data.success) {
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Testimonial deleted successfully
          </div>
        );
        fetchTestimonials();
        setSelectedItems(selectedItems.filter(itemId => itemId !== id));
      }
    } catch (e) {
      toast.error(
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          Failed to delete testimonial
        </div>
      );
    }
  };

  const bulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.warning("No testimonials selected");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} selected testimonial(s)?`)) return;

    try {
      const deletePromises = selectedItems.map(id =>
        axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/testimonials/delete/${id}`)
      );
      
      await Promise.all(deletePromises);
      
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          `${selectedItems.length} testimonial(s) deleted successfully`
        </div>
      );
      
      fetchTestimonials();
      setSelectedItems([]);
    } catch (e) {
      toast.error("Failed to delete testimonials");
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === currentItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItems.map(item => item._id));
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTestimonials.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? "text-yellow-500 fill-yellow-500"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const truncateText = (text, length = 100) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + "...";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading testimonials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Testimonials Management</h1>
              <p className="text-gray-600 mt-1">Manage and organize client testimonials</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchTestimonials}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              {selectedItems.length > 0 && (
                <button
                  onClick={bulkDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected ({selectedItems.length})
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Total Testimonials</p>
              <p className="text-2xl font-bold text-gray-900">{testimonials.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Average Rating</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">
                  {testimonials.length > 0
                    ? (testimonials.reduce((acc, t) => acc + parseInt(t.rating), 0) / testimonials.length).toFixed(1)
                    : "0.0"}
                </p>
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Showing</p>
              <p className="text-2xl font-bold text-gray-900">{filteredTestimonials.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Selected</p>
              <p className="text-2xl font-bold text-gray-900">{selectedItems.length}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search testimonials by name, position, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Rating Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(Number(e.target.value))}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>All Ratings</option>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} Star{rating > 1 && "s"}
                  </option>
                ))}
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === "table"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredTestimonials.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No testimonials found</h3>
            <p className="text-gray-500">
              {searchTerm || ratingFilter > 0
                ? "Try adjusting your search or filter criteria"
                : "No testimonials available. Add some testimonials to get started."}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          // Grid View
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentItems.map((testimonial) => (
                <div
                  key={testimonial._id}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all hover:shadow-xl ${
                    selectedItems.includes(testimonial._id)
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-transparent"
                  }`}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => toggleSelectItem(testimonial._id)}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-colors ${
                            selectedItems.includes(testimonial._id)
                              ? "bg-blue-600 border-blue-600"
                              : "border-gray-300 hover:border-blue-400"
                          }`}
                        >
                          {selectedItems.includes(testimonial._id) && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                          {testimonial.avatar || testimonial.name.charAt(0)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {renderStars(parseInt(testimonial.rating))}
                          <span className="ml-2 font-semibold text-gray-700">
                            {testimonial.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mb-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {testimonial.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">{testimonial.position}</p>
                      <div className="text-gray-700">
                        {expandedId === testimonial._id
                          ? testimonial.content
                          : truncateText(testimonial.content, 120)}
                      </div>
                      {testimonial.content.length > 120 && (
                        <button
                          onClick={() =>
                            setExpandedId(
                              expandedId === testimonial._id ? null : testimonial._id
                            )
                          }
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                        >
                          {expandedId === testimonial._id ? "Show Less" : "Read More"}
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        {new Date(testimonial.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            // Edit functionality - you can implement this
                            toast.info("Edit feature coming soon!");
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTestimonial(testimonial._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // Table View
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="py-4 px-6 text-left">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={
                            currentItems.length > 0 &&
                            selectedItems.length === currentItems.length
                          }
                          onChange={toggleSelectAll}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>Select All</span>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Client
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Position
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Rating
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Content
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map((testimonial) => (
                    <tr
                      key={testimonial._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedItems.includes(testimonial._id) ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(testimonial._id)}
                          onChange={() => toggleSelectItem(testimonial._id)}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {testimonial.avatar || testimonial.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{testimonial.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-gray-700">{testimonial.position}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          {renderStars(parseInt(testimonial.rating))}
                          <span className="ml-2 font-semibold">{testimonial.rating}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-md">
                        <p className="text-gray-700 line-clamp-2">
                          {truncateText(testimonial.content, 80)}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              // Edit functionality
                              toast.info("Edit feature coming soon!");
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTestimonial(testimonial._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
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
        )}

        {/* Pagination */}
        {filteredTestimonials.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredTestimonials.length)} of{" "}
              {filteredTestimonials.length} testimonials
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                )
                .map((page, index, array) => {
                  // Add ellipsis for skipped pages
                  const prevPage = array[index - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;
                  
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && (
                        <span className="px-3 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialsList;
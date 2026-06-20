"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown,
  GripVertical,
  Plus,
  Filter,
  Download,
  Upload,
  Save,
  X
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/about-banner';

// Page type options
const pageTypes = [
  { value: 'about', label: 'About Us', color: 'bg-blue-100 text-blue-800' },
  { value: 'contact', label: 'Contact Us', color: 'bg-green-100 text-green-800' },
  { value: 'home', label: 'Home Page', color: 'bg-purple-100 text-purple-800' },
  { value: 'other', label: 'Other Pages', color: 'bg-gray-100 text-gray-800' }
];

function BannerAdmin() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [filterPageType, setFilterPageType] = useState('all');
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const [formData, setFormData] = useState({
    title: '',
    pageType: 'about',
    description: '',
    buttonText: '',
    buttonLink: '',
    status: true,
    order: 0
  });

  // Fetch all banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const url = filterPageType !== 'all' 
        ? `${API_URL}?pageType=${filterPageType}`
        : `${API_URL}`;
      
      const response = await axios.get(url);
      setBanners(response.data.banners || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      showNotification('Error fetching banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [filterPageType]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        showNotification('Please select a valid image (JPEG, PNG, WEBP, GIF, SVG)', 'error');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        showNotification('Image size should be less than 10MB', 'error');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Add/Update banner
  const handleSaveBanner = async () => {
    if (!imageFile && !selectedBanner) {
      showNotification('Please select an image', 'error');
      return;
    }

    if (!formData.title.trim()) {
      showNotification('Title is required', 'error');
      return;
    }

    if (!formData.pageType) {
      showNotification('Page type is required', 'error');
      return;
    }

    try {
      setUploading(true);
      const formDataObj = new FormData();
      
      if (imageFile) {
        formDataObj.append('image', imageFile);
      }
      
      formDataObj.append('title', formData.title);
      formDataObj.append('pageType', formData.pageType);
      formDataObj.append('description', formData.description);
      formDataObj.append('buttonText', formData.buttonText);
      formDataObj.append('buttonLink', formData.buttonLink);
      formDataObj.append('status', formData.status);
      formDataObj.append('order', formData.order);

      if (selectedBanner) {
        await axios.put(`${API_URL}/${selectedBanner._id}`, formDataObj, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        showNotification('Banner updated successfully', 'success');
      } else {
        await axios.post(`${API_URL}`, formDataObj, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        showNotification('Banner added successfully', 'success');
      }
      
      closeModal();
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      showNotification(error.response?.data?.message || 'Error saving banner', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Delete banner
  const handleDeleteBanner = async () => {
    try {
      await axios.delete(`${API_URL}/${selectedBanner._id}`);
      showNotification('Banner deleted successfully', 'success');
      setOpenDeleteModal(false);
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      showNotification('Error deleting banner', 'error');
    }
  };

  // Update banner status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(`${API_URL}/${id}/status`, { status: !currentStatus });
      showNotification(`Banner ${currentStatus ? 'deactivated' : 'activated'}`, 'success');
      fetchBanners();
    } catch (error) {
      console.error('Error updating banner status:', error);
      showNotification('Error updating status', 'error');
    }
  };

  // Update banner order
  const handleUpdateOrder = async (id, newOrder) => {
    try {
      await axios.put(`${API_URL}/${id}/order`, { order: newOrder });
      showNotification('Order updated successfully', 'success');
      fetchBanners();
    } catch (error) {
      console.error('Error updating order:', error);
      showNotification('Error updating order', 'error');
    }
  };

  // Open edit modal
  const openEditModal = (banner) => {
    setSelectedBanner(banner);
    setFormData({
      title: banner.title,
      pageType: banner.pageType,
      description: banner.description || '',
      buttonText: banner.buttonText || '',
      buttonLink: banner.buttonLink || '',
      status: banner.status,
      order: banner.order
    });
    setImagePreview(`http://localhost:5000${banner.image}`);
    setOpenModal(true);
  };

  // Open add modal
  const openAddModal = () => {
    setSelectedBanner(null);
    setImageFile(null);
    setImagePreview('');
    setFormData({
      title: '',
      pageType: 'about',
      description: '',
      buttonText: '',
      buttonLink: '',
      status: true,
      order: banners.length
    });
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setSelectedBanner(null);
    setImageFile(null);
    setImagePreview('');
    setFormData({
      title: '',
      pageType: 'about',
      description: '',
      buttonText: '',
      buttonLink: '',
      status: true,
      order: 0
    });
    setUploading(false);
  };

  const showNotification = (message, type) => {
    setNotification({
      show: true,
      message,
      type
    });
    
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Filter banners by page type
  const filteredBanners = filterPageType === 'all' 
    ? banners 
    : banners.filter(banner => banner.pageType === filterPageType);

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
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {notification.message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
            <p className="text-gray-600 mt-2">Manage banners for About Us, Contact Us, and other pages</p>
          </div>
          <button
            onClick={openAddModal}
            className="mt-4 md:mt-0 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Banner
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filter Banners
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterPageType('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${filterPageType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  All Banners
                </button>
                {pageTypes.map((page) => (
                  <button
                    key={page.value}
                    onClick={() => setFilterPageType(page.value)}
                    className={`px-4 py-2 rounded-lg transition-colors ${filterPageType === page.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {page.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredBanners.length} of {banners.length} banners
            </div>
          </div>
        </div>

        {/* Banners Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredBanners.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Page Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBanners.map((banner) => (
                    <tr key={banner._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-20 w-32">
                          <img
                            className="h-20 w-32 rounded-lg object-cover border border-gray-200"
                            src={`http://localhost:5000${banner.image}`}
                            alt={banner.title}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{banner.title}</div>
                        {banner.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{banner.description}</div>
                        )}
                        {banner.buttonText && (
                          <div className="text-xs text-blue-600 mt-1">
                            Button: {banner.buttonText} → {banner.buttonLink}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          pageTypes.find(p => p.value === banner.pageType)?.color || 'bg-gray-100 text-gray-800'
                        }`}>
                          {pageTypes.find(p => p.value === banner.pageType)?.label || banner.pageType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(banner._id, banner.status)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            banner.status
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          } transition-colors`}
                        >
                          {banner.status ? (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateOrder(banner._id, banner.order - 1)}
                            className="p-1 text-gray-600 hover:text-blue-600"
                            disabled={banner.order <= 0}
                          >
                            <ArrowUp className="w-5 h-5" />
                          </button>
                          <span className="px-3 py-1 bg-gray-100 rounded-lg text-gray-800 font-medium">
                            {banner.order}
                          </span>
                          <button
                            onClick={() => handleUpdateOrder(banner._id, banner.order + 1)}
                            className="p-1 text-gray-600 hover:text-blue-600"
                          >
                            <ArrowDown className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => openEditModal(banner)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBanner(banner);
                              setOpenDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 text-gray-400 mb-4">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No banners found</h3>
              <p className="text-gray-500 mb-4">
                {filterPageType === 'all' 
                  ? 'Get started by adding your first banner' 
                  : `No banners found for ${pageTypes.find(p => p.value === filterPageType)?.label || filterPageType}`
                }
              </p>
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Add First Banner
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        {banners.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Banners</p>
                  <p className="text-2xl font-semibold text-gray-900">{banners.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Banners</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {banners.filter(b => b.status).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Page Types</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {new Set(banners.map(b => b.pageType)).size}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {banners.length > 0 ? new Date(banners[0].updatedAt).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {openModal && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedBanner ? 'Edit Banner' : 'Add New Banner'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Image {!selectedBanner && <span className="text-red-500">*</span>}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      id="image-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-64 mx-auto rounded-lg"
                          />
                          <div className="mt-4">
                            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                              {selectedBanner ? 'Change Image' : 'Change Selected Image'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8">
                          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-600 mb-2">Click to upload banner image</p>
                          <p className="text-sm text-gray-500">JPEG, PNG, WEBP, GIF, SVG up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Title Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., About Us Banner"
                    required
                  />
                </div>

                {/* Page Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {pageTypes.map((page) => (
                      <button
                        key={page.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, pageType: page.value }))}
                        className={`p-3 rounded-lg border ${formData.pageType === page.value ? 'ring-2 ring-blue-500 ring-offset-2' : 'border-gray-300'} ${page.color.split(' ')[0]}`}
                      >
                        <div className="text-sm font-medium">{page.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Brief description of the banner"
                    rows="3"
                  />
                </div>

                {/* Button Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Text (Optional)
                    </label>
                    <input
                      type="text"
                      name="buttonText"
                      value={formData.buttonText}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Learn More"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Link (Optional)
                    </label>
                    <input
                      type="url"
                      name="buttonLink"
                      value={formData.buttonLink}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., https://example.com/page"
                    />
                  </div>
                </div>

                {/* Order and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order (Lower numbers appear first)
                    </label>
                    <input
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="status"
                        checked={formData.status}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Active (visible on website)
                      </span>
                    </label>
                  </div>
                </div>

                {selectedBanner && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-blue-800">
                        Note: Leaving the image field empty will keep the existing image.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBanner}
                disabled={uploading}
                className={`px-4 py-2 font-medium rounded-lg transition-colors flex items-center ${
                  uploading
                    ? 'bg-blue-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {uploading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                <Save className="w-4 h-4 mr-2" />
                {selectedBanner ? (uploading ? 'Updating...' : 'Update Banner') : (uploading ? 'Adding...' : 'Add Banner')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {openDeleteModal && selectedBanner && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.748 0L4.308 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                Delete Banner
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this banner? This action cannot be undone.
              </p>
              
              {selectedBanner && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={`http://localhost:5000${selectedBanner.image}`}
                      alt={selectedBanner.title}
                      className="w-24 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{selectedBanner.title}</p>
                      <p className="text-sm text-gray-500">
                        {pageTypes.find(p => p.value === selectedBanner.pageType)?.label || selectedBanner.pageType}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created on {new Date(selectedBanner.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setOpenDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteBanner}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                >
                  Delete Banner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BannerAdmin;
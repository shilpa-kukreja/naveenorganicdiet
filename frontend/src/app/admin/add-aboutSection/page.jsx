"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CircleCheck, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import dynamic from 'next/dynamic';


const CKEditor = dynamic(() => import('@ckeditor/ckeditor5-react').then(mod => mod.CKEditor), {
    ssr: false,
    loading: () => <p>Loading editor...</p>
});

// Import the editor build directly (not as dynamic)
let ClassicEditor;
if (typeof window !== 'undefined') {
    ClassicEditor = require('@ckeditor/ckeditor5-build-classic');
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL}/api/about`;

const AboutSectionAdmin = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [points, setPoints] = useState([{ text: '', order: 0 }]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isActive: false,
    order: 0
  });
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Fetch all sections
  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}`);
      setSections(response.data.sections || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
      showNotification('Error fetching about sections', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        showNotification('Please select a valid image (JPEG, PNG, WEBP, GIF)', 'error');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size should be less than 5MB', 'error');
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

  // Handle CKEditor content change
  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setFormData(prev => ({
      ...prev,
      content: data
    }));
  };

  // Handle points management
  const handlePointChange = (index, value) => {
    const newPoints = [...points];
    newPoints[index].text = value;
    setPoints(newPoints);
  };

  const addPoint = () => {
    setPoints([...points, { text: '', order: points.length }]);
  };

  const removePoint = (index) => {
    if (points.length > 1) {
      const newPoints = points.filter((_, i) => i !== index);
      setPoints(newPoints);
    }
  };

  const movePointUp = (index) => {
    if (index > 0) {
      const newPoints = [...points];
      [newPoints[index], newPoints[index - 1]] = [newPoints[index - 1], newPoints[index]];
      setPoints(newPoints);
    }
  };

  const movePointDown = (index) => {
    if (index < points.length - 1) {
      const newPoints = [...points];
      [newPoints[index], newPoints[index + 1]] = [newPoints[index + 1], newPoints[index]];
      setPoints(newPoints);
    }
  };

  // Add new section
  const handleAddSection = async () => {
    if (!imageFile) {
      showNotification('Please select an image', 'error');
      return;
    }

    if (!formData.title.trim()) {
      showNotification('Title is required', 'error');
      return;
    }

    if (!formData.content.trim()) {
      showNotification('Content is required', 'error');
      return;
    }

    // Filter out empty points
    const filteredPoints = points.filter(point => point.text.trim() !== '');

    try {
      setUploading(true);
      const formDataObj = new FormData();
      formDataObj.append('image', imageFile);
      formDataObj.append('title', formData.title);
      formDataObj.append('content', formData.content);
      formDataObj.append('isActive', formData.isActive);
      formDataObj.append('order', formData.order);
      formDataObj.append('points', JSON.stringify(filteredPoints));

      await axios.post(`${API_URL}`, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showNotification('About section added successfully', 'success');
      closeModal();
      fetchSections();
    } catch (error) {
      console.error('Error adding section:', error);
      showNotification(error.response?.data?.message || 'Error adding about section', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Update section
  const handleUpdateSection = async (id) => {
    if (!formData.title.trim()) {
      showNotification('Title is required', 'error');
      return;
    }

    if (!formData.content.trim()) {
      showNotification('Content is required', 'error');
      return;
    }

    // Filter out empty points
    const filteredPoints = points.filter(point => point.text.trim() !== '');

    try {
      setUploading(true);
      const formDataObj = new FormData();
      
      if (imageFile) {
        formDataObj.append('image', imageFile);
      }
      
      formDataObj.append('title', formData.title);
      formDataObj.append('content', formData.content);
      formDataObj.append('isActive', formData.isActive);
      formDataObj.append('order', formData.order);
      formDataObj.append('points', JSON.stringify(filteredPoints));

      await axios.put(`${API_URL}/${id}`, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showNotification('About section updated successfully', 'success');
      closeModal();
      fetchSections();
    } catch (error) {
      console.error('Error updating section:', error);
      showNotification(error.response?.data?.message || 'Error updating about section', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Delete section
  const handleDeleteSection = async () => {
    try {
      await axios.delete(`${API_URL}/${selectedSection._id}`);
      showNotification('About section deleted successfully', 'success');
      setOpenDeleteModal(false);
      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      showNotification('Error deleting about section', 'error');
    }
  };

  // Toggle active status
  const handleToggleActive = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}/toggle-active`);
      showNotification('Status updated successfully', 'success');
      fetchSections();
    } catch (error) {
      console.error('Error toggling active status:', error);
      showNotification('Error updating status', 'error');
    }
  };

  // Update order
  const handleUpdateOrder = async (id, newOrder) => {
    try {
      await axios.put(`${API_URL}/${id}/order`, { order: newOrder });
      showNotification('Order updated successfully', 'success');
      fetchSections();
    } catch (error) {
      console.error('Error updating order:', error);
      showNotification('Error updating order', 'error');
    }
  };

  // Open edit modal
  const openEditModal = (section) => {
    setSelectedSection(section);
    setFormData({
      title: section.title,
      content: section.content,
      isActive: section.isActive,
      order: section.order
    });
    setImagePreview(`${process.env.NEXT_PUBLIC_API_URL}${section.image}`);
    setPoints(section.points && section.points.length > 0 ? section.points : [{ text: '', order: 0 }]);
    setOpenModal(true);
  };

  // Open add modal
  const openAddModal = () => {
    setSelectedSection(null);
    setImageFile(null);
    setImagePreview('');
    setFormData({ title: '', content: '', isActive: false, order: 0 });
    setPoints([{ text: '', order: 0 }]);
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setSelectedSection(null);
    setImageFile(null);
    setImagePreview('');
    setFormData({ title: '', content: '', isActive: false, order: 0 });
    setPoints([{ text: '', order: 0 }]);
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
            <h1 className="text-3xl font-bold text-gray-900">About Section Management</h1>
            <p className="text-gray-600 mt-2">Manage your website's about section content</p>
          </div>
          <button
            onClick={openAddModal}
            className="mt-4 md:mt-0 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Section
          </button>
        </div>

        {/* Sections Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {sections.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
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
                  {sections.map((section) => (
                    <tr key={section._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-16 w-24 flex-shrink-0">
                            <img
                              className="h-16 w-24 rounded-lg object-cover border border-gray-200"
                              src={`${process.env.NEXT_PUBLIC_API_URL}${section.image}`}
                              alt={section.title}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{section.title}</div>
                        <div 
                          className="text-sm text-gray-500 truncate max-w-xs"
                          dangerouslySetInnerHTML={{ __html: section.content.substring(0, 100) + '...' }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(section._id)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            section.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          } transition-colors`}
                        >
                          {section.isActive ? (
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
                            onClick={() => handleUpdateOrder(section._id, section.order - 1)}
                            className="p-1 text-gray-600 hover:text-blue-600"
                            disabled={section.order <= 0}
                          >
                            <ArrowUp className="w-5 h-5" />
                          </button>
                          <span className="px-3 py-1 bg-gray-100 rounded-lg text-gray-800 font-medium">
                            {section.order}
                          </span>
                          <button
                            onClick={() => handleUpdateOrder(section._id, section.order + 1)}
                            className="p-1 text-gray-600 hover:text-blue-600"
                          >
                            <ArrowDown className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => openEditModal(section)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSection(section);
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No about sections yet</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first about section</p>
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Add First Section
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        {sections.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Sections</p>
                  <p className="text-2xl font-semibold text-gray-900">{sections.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Sections</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {sections.filter(s => s.isActive).length}
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
                    {sections.length > 0 ? new Date(sections[0].updatedAt).toLocaleDateString() : 'Never'}
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedSection ? 'Edit About Section' : 'Add New About Section'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image {!selectedSection && <span className="text-red-500">*</span>}
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
                              {selectedSection ? 'Change Image' : 'Change Selected Image'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8">
                          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-600 mb-2">Click to upload image</p>
                          <p className="text-sm text-gray-500">JPEG, PNG, WEBP, GIF up to 5MB</p>
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
                    placeholder="Enter section title"
                    required
                  />
                </div>

                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content <span className="text-red-500">*</span>
                  </label>
                 {typeof window !== 'undefined' && ClassicEditor && (
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.content}
                      onChange={handleEditorChange}
                      config={{
                        toolbar: [
                          'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 
                          'numberedList', 'blockQuote', '|', 'undo', 'redo'
                        ],
                        heading: {
                          options: [
                            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
                          ]
                        }
                      }}
                    />
                  )}
                </div>

                {/* Points Management */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Points (Optional)
                  </label>
                  <div className="space-y-3">
                    {points.map((point, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <CircleCheck className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                            <input
                              type="text"
                              value={point.text}
                              onChange={(e) => handlePointChange(index, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter key point"
                            />
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => movePointUp(index)}
                            disabled={index === 0}
                            className="p-1 text-gray-600 hover:text-blue-600 disabled:text-gray-300"
                            title="Move up"
                          >
                            <ArrowUp className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => movePointDown(index)}
                            disabled={index === points.length - 1}
                            className="p-1 text-gray-600 hover:text-blue-600 disabled:text-gray-300"
                            title="Move down"
                          >
                            <ArrowDown className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removePoint(index)}
                            disabled={points.length <= 1}
                            className="p-1 text-red-600 hover:text-red-800 disabled:text-gray-300"
                            title="Remove"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addPoint}
                      className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Another Point
                    </button>
                  </div>
                </div>

                {/* Active Status and Order */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Set as active section (only one can be active at a time)
                      </span>
                    </label>
                  </div>
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
                </div>

                {selectedSection && (
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
                onClick={selectedSection ? 
                  () => handleUpdateSection(selectedSection._id) : 
                  handleAddSection
                }
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
                {selectedSection ? (uploading ? 'Updating...' : 'Update Section') : (uploading ? 'Adding...' : 'Add Section')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {openDeleteModal && selectedSection && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.748 0L4.308 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                Delete About Section
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this about section? This action cannot be undone.
              </p>
              
              {selectedSection && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${selectedSection.image}`}
                      alt={selectedSection.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{selectedSection.title}</p>
                      <p className="text-sm text-gray-500">
                        Created on {new Date(selectedSection.createdAt).toLocaleDateString()}
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
                  onClick={handleDeleteSection}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                >
                  Delete Section
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutSectionAdmin;
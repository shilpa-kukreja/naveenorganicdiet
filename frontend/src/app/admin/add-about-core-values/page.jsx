'use client';

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
  Save,
  X,
  Plus
} from 'lucide-react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent 
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/about-core-values';

// Color options with preview
const colorOptions = [
  { name: 'Amber', bg: 'bg-amber-50', border: 'border-amber-500', iconBg: 'bg-amber-100', text: 'Amber' },
  { name: 'Green', bg: 'bg-green-50', border: 'border-green-500', iconBg: 'bg-green-100', text: 'Green' },
  { name: 'Blue', bg: 'bg-blue-50', border: 'border-blue-500', iconBg: 'bg-blue-100', text: 'Blue' },
  { name: 'Purple', bg: 'bg-purple-50', border: 'border-purple-500', iconBg: 'bg-purple-100', text: 'Purple' },
  { name: 'Red', bg: 'bg-red-50', border: 'border-red-500', iconBg: 'bg-red-100', text: 'Red' },
  { name: 'Pink', bg: 'bg-pink-50', border: 'border-pink-500', iconBg: 'bg-pink-100', text: 'Pink' },
  { name: 'Indigo', bg: 'bg-indigo-50', border: 'border-indigo-500', iconBg: 'bg-indigo-100', text: 'Indigo' },
  { name: 'Teal', bg: 'bg-teal-50', border: 'border-teal-500', iconBg: 'bg-teal-100', text: 'Teal' },
  { name: 'Orange', bg: 'bg-orange-50', border: 'border-orange-500', iconBg: 'bg-orange-100', text: 'Orange' },
  { name: 'Cyan', bg: 'bg-cyan-50', border: 'border-cyan-500', iconBg: 'bg-cyan-100', text: 'Cyan' },
];

// Common icons
const commonIcons = [
  "🎯", "👁️", "❤️", "⚙️", "⭐", "🌟", "✨", "💡", "🚀", "🌈",
  "🌱", "🌍", "💚", "🤝", "🎖️", "🏆", "📈", "🔒", "🎨", "⚡"
];

// Category options
const categories = [
  { value: 'mission', label: 'Mission' },
  { value: 'vision', label: 'Vision' },
  { value: 'values', label: 'Values' },
  { value: 'work', label: 'How We Work' },
  { value: 'other', label: 'Other' }
];

// Sortable Item Component
function SortableItem({ value, onEdit, onDelete, onToggleActive }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: value._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`${value.bgColor} p-4 rounded-lg border-l-4 ${value.borderColor} mb-3 shadow-sm hover:shadow-md transition-shadow duration-200`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="cursor-move p-1 text-gray-400 hover:text-gray-600"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-5 h-5" />
          </div>
          <div className={`w-12 h-12 ${value.iconBg} rounded-lg flex items-center justify-center`}>
            <span className="text-2xl">{value.icon}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{value.title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                {categories.find(c => c.value === value.category)?.label || 'Other'}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${value.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {value.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                Order: {value.order}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleActive(value._id, value.isActive)}
            className={`p-2 rounded-full ${value.isActive ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            title={value.isActive ? 'Deactivate' : 'Activate'}
          >
            {value.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onEdit(value)}
            className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(value)}
            className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-600 line-clamp-2">{value.description}</p>
    </div>
  );
}

function AboutCoreValueAdmin() {
  const [coreValues, setCoreValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '🎯',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-500',
    iconBg: 'bg-amber-100',
    category: 'mission',
    order: 0,
    isActive: true
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch all core values
  const fetchCoreValues = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}`);
      setCoreValues(response.data.coreValues || []);
    } catch (error) {
      console.error('Error fetching core values:', error);
      showNotification('Error fetching core values', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoreValues();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle color selection
  const handleColorSelect = (color) => {
    setFormData(prev => ({
      ...prev,
      bgColor: color.bg,
      borderColor: color.border,
      iconBg: color.iconBg
    }));
  };

  // Handle icon selection
  const handleIconSelect = (icon) => {
    setFormData(prev => ({
      ...prev,
      icon
    }));
  };

  // Add new core value
  const handleAddValue = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      showNotification('Title and description are required', 'error');
      return;
    }

    try {
      setUploading(true);
      
      if (selectedValue) {
        await axios.put(`${API_URL}/${selectedValue._id}`, formData);
        showNotification('Core value updated successfully', 'success');
      } else {
        await axios.post(`${API_URL}`, formData);
        showNotification('Core value added successfully', 'success');
      }
      
      closeModal();
      fetchCoreValues();
    } catch (error) {
      console.error('Error saving core value:', error);
      showNotification(error.response?.data?.message || 'Error saving core value', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Update order via drag and drop
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = coreValues.findIndex(item => item._id === active.id);
      const newIndex = coreValues.findIndex(item => item._id === over.id);
      
      const newItems = arrayMove(coreValues, oldIndex, newIndex);
      setCoreValues(newItems);

      // Update order in backend
      try {
        const values = newItems.map((item, index) => ({
          id: item._id,
          order: index
        }));
        
        await axios.put(`${API_URL}/bulk/orders`, { values });
        showNotification('Order updated successfully', 'success');
      } catch (error) {
        console.error('Error updating order:', error);
        showNotification('Error updating order', 'error');
        // Revert if error
        fetchCoreValues();
      }
    }
  };

  // Delete core value
  const handleDeleteValue = async () => {
    try {
      await axios.delete(`${API_URL}/${selectedValue._id}`);
      showNotification('Core value deleted successfully', 'success');
      setOpenDeleteModal(false);
      fetchCoreValues();
    } catch (error) {
      console.error('Error deleting core value:', error);
      showNotification('Error deleting core value', 'error');
    }
  };

  // Toggle active status
  const handleToggleActive = async (id, currentStatus) => {
    try {
      await axios.put(`${API_URL}/${id}/toggle-active`);
      showNotification(`Core value ${currentStatus ? 'deactivated' : 'activated'}`, 'success');
      fetchCoreValues();
    } catch (error) {
      console.error('Error toggling active status:', error);
      showNotification('Error updating status', 'error');
    }
  };

  // Open edit modal
  const openEditModal = (value) => {
    setSelectedValue(value);
    setFormData({
      title: value.title,
      description: value.description,
      icon: value.icon,
      bgColor: value.bgColor,
      borderColor: value.borderColor,
      iconBg: value.iconBg,
      category: value.category,
      order: value.order,
      isActive: value.isActive
    });
    setOpenModal(true);
  };

  // Open add modal
  const openAddModal = () => {
    setSelectedValue(null);
    setFormData({
      title: '',
      description: '',
      icon: '🎯',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-500',
      iconBg: 'bg-amber-100',
      category: 'mission',
      order: coreValues.length,
      isActive: true
    });
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setSelectedValue(null);
    setFormData({
      title: '',
      description: '',
      icon: '🎯',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-500',
      iconBg: 'bg-amber-100',
      category: 'mission',
      order: 0,
      isActive: true
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
            <h1 className="text-3xl font-bold text-gray-900">Core Values Management</h1>
            <p className="text-gray-600 mt-2">Manage your company's core values, mission, vision, and values</p>
          </div>
          <button
            onClick={openAddModal}
            className="mt-4 md:mt-0 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Core Value
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Values</p>
                <p className="text-2xl font-semibold text-gray-900">{coreValues.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {coreValues.filter(v => v.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {new Set(coreValues.map(v => v.category)).size}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Latest Update</p>
                <p className="text-lg font-semibold text-gray-900">
                  {coreValues.length > 0 ? new Date(coreValues[0].updatedAt).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {coreValues.length > 0 ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Core Values ({coreValues.length})</h2>
                  <p className="text-sm text-gray-600">Drag and drop to reorder values</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Showing {coreValues.length} items</span>
                </div>
              </div>

              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={coreValues.map(v => v._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {coreValues.map((value) => (
                      <SortableItem
                        key={value._id}
                        value={value}
                        onEdit={openEditModal}
                        onDelete={(val) => {
                          setSelectedValue(val);
                          setOpenDeleteModal(true);
                        }}
                        onToggleActive={handleToggleActive}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Tip:</span> Drag the grip icon (⋮⋮) to reorder items
                  </div>
                  <div>
                    {coreValues.filter(v => v.isActive).length} active items
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 text-gray-400 mb-4">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No core values yet</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first core value</p>
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Add First Value
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {openModal && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedValue ? 'Edit Core Value' : 'Add New Core Value'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <div className={`${formData.bgColor} p-6 rounded-xl border-l-4 ${formData.borderColor}`}>
                    <div className="mb-4">
                      <div className={`w-full h-32 ${formData.iconBg} rounded-lg mb-3 flex items-center justify-center`}>
                        <span className="text-4xl">{formData.icon}</span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 text-center">
                        {formData.title || 'Your Title Here'}
                      </h2>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {formData.description || 'Your description will appear here...'}
                    </p>
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
                    placeholder="e.g., Our Mission"
                    required
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter detailed description..."
                    rows="4"
                    required
                  />
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-3">
                    {commonIcons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => handleIconSelect(icon)}
                        className={`p-2 text-2xl rounded-lg border ${formData.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                        title={icon}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Or enter custom emoji"
                  />
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Theme
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => handleColorSelect(color)}
                        className={`p-3 rounded-lg border ${formData.bgColor === color.bg ? 'ring-2 ring-blue-500 ring-offset-2' : 'border-gray-300'} ${color.bg}`}
                        title={color.name}
                      >
                        <div className={`h-8 rounded ${color.iconBg} flex items-center justify-center mb-2`}>
                          <span className="text-lg">🎯</span>
                        </div>
                        <div className="text-xs font-medium text-center">{color.text}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category and Order */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
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

                {/* Active Status */}
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
                      Active (visible on website)
                    </span>
                  </label>
                </div>
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
                onClick={handleAddValue}
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
                {selectedValue ? (uploading ? 'Updating...' : 'Update Value') : (uploading ? 'Adding...' : 'Add Value')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {openDeleteModal && selectedValue && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.748 0L4.308 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                Delete Core Value
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this core value? This action cannot be undone.
              </p>
              
              {selectedValue && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className={`${selectedValue.bgColor} p-4 rounded-lg border-l-4 ${selectedValue.borderColor}`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${selectedValue.iconBg} rounded-lg flex items-center justify-center`}>
                        <span className="text-2xl">{selectedValue.icon}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedValue.title}</p>
                        <p className="text-sm text-gray-500">
                          Category: {categories.find(c => c.value === selectedValue.category)?.label || 'Other'}
                        </p>
                      </div>
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
                  onClick={handleDeleteValue}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                >
                  Delete Value
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AboutCoreValueAdmin;
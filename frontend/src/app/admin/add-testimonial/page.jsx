"use client";
import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  User, 
  Briefcase, 
  Star, 
  MessageSquare, 
  Image as ImageIcon,
  Send,
  CheckCircle
} from "lucide-react";



const AddTestimonial = () => {
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    rating: "",
    content: "",
    avatar: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    
    if (!formData.position.trim()) {
      newErrors.position = "Position is required";
    }
    
    if (!formData.rating) {
      newErrors.rating = "Please select a rating";
    } else if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = "Rating must be between 1 and 5";
    }
    
    if (!formData.content.trim()) {
      newErrors.content = "Testimonial content is required";
    } else if (formData.content.length < 20) {
      newErrors.content = "Content must be at least 20 characters";
    }
    
    if (formData.avatar && formData.avatar.length > 3) {
      newErrors.avatar = "Avatar initials should be 1-3 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating: rating.toString() }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/testimonials/create`, 
        formData
      );

      if (res.data.success) {
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Testimonial added successfully!
          </div>
        );
        
        setFormData({
          name: "",
          position: "",
          rating: "",
          content: "",
          avatar: "",
        });
        
        setErrors({});
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add testimonial. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add New Testimonial
          </h1>
          <p className="text-gray-600">
            Share valuable feedback from your clients and customers
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-semibold text-gray-800">
                <User className="w-4 h-4" />
                Client Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  errors.name ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="Enter client full name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span>•</span> {errors.name}
                </p>
              )}
            </div>

            {/* Position Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-semibold text-gray-800">
                <Briefcase className="w-4 h-4" />
                Position / Role *
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  errors.position ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="e.g., CEO, TechCorp Inc."
              />
              {errors.position && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span>•</span> {errors.position}
                </p>
              )}
            </div>

            {/* Rating Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-semibold text-gray-800">
                <Star className="w-4 h-4" />
                Rating *
              </label>
              
              {/* Star Rating Selector */}
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    className={`p-3 rounded-xl transition-all transform hover:scale-110 ${
                      parseInt(formData.rating) === star
                        ? "bg-yellow-100 border-2 border-yellow-400"
                        : "bg-gray-100 border-2 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Star className={`w-6 h-6 ${
                        parseInt(formData.rating) >= star 
                          ? "text-yellow-500 fill-yellow-500" 
                          : "text-gray-300"
                      }`} />
                      <span className="font-semibold">{star}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              {errors.rating && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span>•</span> {errors.rating}
                </p>
              )}
            </div>

            {/* Avatar Initials Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-semibold text-gray-800">
                <ImageIcon className="w-4 h-4" />
                Avatar Initials (Optional)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  maxLength={3}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    errors.avatar ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="e.g., JD"
                />
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {formData.avatar || "JD"}
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Enter 1-3 characters for the avatar initials. If empty, we'll use the name initials.
              </p>
              {errors.avatar && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span>•</span> {errors.avatar}
                </p>
              )}
            </div>

            {/* Content Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-semibold text-gray-800">
                <MessageSquare className="w-4 h-4" />
                Testimonial Content *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="5"
                className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none ${
                  errors.content ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="What did the client say about your service or product?"
              />
              <div className="flex justify-between items-center">
                <div>
                  {errors.content && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <span>•</span> {errors.content}
                    </p>
                  )}
                </div>
                <p className={`text-sm ${
                  formData.content.length < 20 
                    ? "text-red-500" 
                    : "text-gray-500"
                }`}>
                  {formData.content.length}/200 characters
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              } text-white shadow-lg hover:shadow-xl`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Testimonial
                </>
              )}
            </button>

            {/* Form Guidelines */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> All fields marked with * are required. 
                Testimonials will be reviewed before being published.
              </p>
            </div>
          </form>
        </div>

        {/* Preview Section (Optional) */}
        {formData.name && formData.content && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-md">
            <h3 className="font-semibold text-gray-800 mb-4">Preview:</h3>
            <div className="bg-white rounded-xl p-6 shadow-inner">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {formData.avatar || formData.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900">{formData.name}</h4>
                      <p className="text-gray-600 text-sm">{formData.position}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            parseInt(formData.rating) >= star
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-gray-700 italic">"{formData.content}"</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddTestimonial;
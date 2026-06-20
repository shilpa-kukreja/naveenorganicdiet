"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import "react-toastify/dist/ReactToastify.css";

export default function AddCategoryPage() {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const categoryId = params.get("id");

  // Memoized function to generate slug from name
  const generateSlug = useCallback((name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  }, []);

  // Load category data when editing
  useEffect(() => {
    if (!categoryId) return;

    const loadCategory = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/category/${categoryId}`);
        console.log("API Response:", res);

        setFormData({
          name: res.data.name || "",  
          slug: res.data.slug || "",
          image: res.data.image || null,
        });

        if (res.data.image) {
          setPreview(`http://localhost:5000${res.data.image}`);
        }
      } catch (err) {
        toast.error("Failed to load category data");
        console.error("Error loading category:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [categoryId]);
  console.log(formData);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      const slug = generateSlug(value);
      setFormData(prev => ({ ...prev, name: value, slug }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle file upload with validation
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setFormData(prev => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name.trim());
    data.append("slug", formData.slug.trim());
    if (formData.image instanceof File) {
      data.append("image", formData.image);
    }

    try {
      setIsSubmitting(true);

      if (categoryId) {
        await axios.put(`http://localhost:5000/api/category/${categoryId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Category updated successfully! 🎉");
      } else {
        await axios.post("http://localhost:5000/api/category", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Category added successfully! 🎉");
      }

      router.push("/admin/list-categories");
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.response?.data?.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear preview when component unmounts
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {categoryId ? "Edit Category" : "Create New Category"}
          </h1>
          <p className="text-gray-600 mt-2">
            {categoryId 
              ? "Update your category information below" 
              : "Add a new category to organize your content"
            }
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Slug Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-50"
                  placeholder="category-slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be used in URLs. Auto-generated from the name.
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image
                </label>
                
                {/* File Input */}
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors duration-200 bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG (Max. 5MB)</p>
                    </div>
                    <input 
                      type="file" 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      className="hidden" 
                      disabled={isSubmitting}
                    />
                  </label>
                </div>

                {/* Image Preview */}
                {preview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={preview}
                        alt="Preview"
                        
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{categoryId ? "Updating..." : "Creating..."}</span>
                    </>
                  ) : (
                    <span>{categoryId ? "Update Category" : "Create Category"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
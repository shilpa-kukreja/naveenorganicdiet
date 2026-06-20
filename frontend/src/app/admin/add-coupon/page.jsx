"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function AddCoupon() {
  const [formData, setFormData] = useState({
    couponCode: "",
    discount: "",
    discounttype: "percentage",
    expiryDate: "",
    minPurchaseAmount: "",
    maxDiscountAmount: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // ✅ If editing coupon info is passed via query params
  useEffect(() => {
    const couponData = searchParams.get("coupon");
    if (couponData) {
      try {
        const parsedCoupon = JSON.parse(couponData);
        setEditingCoupon(parsedCoupon);
        setFormData({
          couponCode: parsedCoupon.couponCode || "",
          discount: parsedCoupon.discount || "",
          discounttype: parsedCoupon.discounttype || "percentage",
          expiryDate: parsedCoupon.expiryDate?.slice(0, 10) || "",
          minPurchaseAmount: parsedCoupon.minPurchaseAmount || "",
          maxDiscountAmount: parsedCoupon.maxDiscountAmount || "",
          isActive: parsedCoupon.isActive !== undefined ? parsedCoupon.isActive : true,
        });
      } catch (error) {
        console.error("Error parsing coupon data:", error);
        toast.error("Invalid coupon data");
      }
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors = {};
    
    // Coupon code validation
    if (!formData.couponCode.trim()) {
      newErrors.couponCode = "Coupon code is required";
    } else if (formData.couponCode.length < 4) {
      newErrors.couponCode = "Coupon code must be at least 4 characters";
    }
    
    // Discount validation
    if (!formData.discount || Number(formData.discount) <= 0) {
      newErrors.discount = "Discount must be greater than 0";
    } else if (formData.discounttype === "percentage" && Number(formData.discount) > 100) {
      newErrors.discount = "Percentage discount cannot exceed 100%";
    }
    
    // Expiry date validation
    if (!formData.expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    } else if (new Date(formData.expiryDate) < new Date()) {
      newErrors.expiryDate = "Expiry date must be in the future";
    }
    
    // Minimum purchase validation
    if (formData.minPurchaseAmount && Number(formData.minPurchaseAmount) < 0) {
      newErrors.minPurchaseAmount = "Minimum purchase cannot be negative";
    }
    
    // Max discount validation
    if (formData.maxDiscountAmount && Number(formData.maxDiscountAmount) < 0) {
      newErrors.maxDiscountAmount = "Maximum discount cannot be negative";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }
    
    setIsLoading(true);

    const payload = {
      ...formData,
      discount: Number(formData.discount),
      minPurchaseAmount: Number(formData.minPurchaseAmount) || 0,
      maxDiscountAmount: Number(formData.maxDiscountAmount) || 0,
    };

    try {
      let response;
      if (editingCoupon) {
        response = await axios.put(
          `http://localhost:5000/api/coupons/${editingCoupon._id}`,
          payload
        );
      } else {
        response = await axios.post(
          "http://localhost:5000/api/coupon/add",
          payload
        );
      }

      toast.success(response.data.message || "Coupon saved successfully");
      router.push("/admin/list-coupon");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save coupon");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="w-full  mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <div className="flex items-center">
              <div className="bg-white/10 p-3 rounded-lg mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
                </h1>
                <p className="text-blue-100 mt-1">
                  {editingCoupon ? "Update your coupon details" : "Create a new discount coupon for your customers"}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coupon Code */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="couponCode"
                    value={formData.couponCode}
                    onChange={handleChange}
                    className={`pl-10 w-full border ${errors.couponCode ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                    placeholder="SUMMER25"
                    required
                  />
                </div>
                {errors.couponCode && <p className="mt-1 text-sm text-red-600">{errors.couponCode}</p>}
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Value <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {formData.discounttype === "percentage" && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">%</span>
                    </div>
                  )}
                  {formData.discounttype === "simple" && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">₹</span>
                    </div>
                  )}
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    className={`w-full border ${errors.discount ? 'border-red-500' : 'border-gray-300'} ${formData.discounttype === "simple" ? 'pl-8' : ''} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                    placeholder={formData.discounttype === "percentage" ? "25" : "50"}
                    min="0"
                    step={formData.discounttype === "percentage" ? "0.1" : "1"}
                    required
                  />
                </div>
                {errors.discount && <p className="mt-1 text-sm text-red-600">{errors.discount}</p>}
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="discounttype"
                    value={formData.discounttype}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="simple">Fixed Amount (₹)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className={`pl-10 w-full border ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
              </div>

              {/* Minimum Purchase Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Purchase Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    name="minPurchaseAmount"
                    value={formData.minPurchaseAmount}
                    onChange={handleChange}
                    className={`pl-8 w-full border ${errors.minPurchaseAmount ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                    placeholder="500"
                    min="0"
                  />
                </div>
                {errors.minPurchaseAmount ? (
                  <p className="mt-1 text-sm text-red-600">{errors.minPurchaseAmount}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Leave empty for no minimum</p>
                )}
              </div>

              {/* Maximum Discount Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Discount Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    name="maxDiscountAmount"
                    value={formData.maxDiscountAmount}
                    onChange={handleChange}
                    className={`pl-8 w-full border ${errors.maxDiscountAmount ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                    placeholder="1000"
                    min="0"
                  />
                </div>
                {errors.maxDiscountAmount ? (
                  <p className="mt-1 text-sm text-red-600">{errors.maxDiscountAmount}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">For percentage discounts only</p>
                )}
              </div>

              {/* Active Status */}
              <div className="col-span-2">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Active Coupon</label>
                    <p className="text-xs text-gray-500">Enable or disable this coupon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 border border-transparent rounded-lg font-semibold text-white shadow-md hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {editingCoupon ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {editingCoupon ? "Update Coupon" : "Create Coupon"}
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.push("/admin/coupons")}
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
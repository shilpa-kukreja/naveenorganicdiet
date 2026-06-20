// app/restore-cart/[token]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";

export default function RestoreCartPage() {
  const { token } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("=== FRONTEND DEBUG ===");
    console.log("Token from URL:", token);
    console.log("Backend URL:", process.env.NEXT_PUBLIC_BACKEND_URL);
    
    const restoreCart = async () => {
      try {
        setLoading(true);
        
        // Test URL construction
        const checkUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restorecart/check/${token}`;
        const restoreUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restorecart/${token}`;
        
        console.log("Check URL:", checkUrl);
        console.log("Restore URL:", restoreUrl);
        
        // 1. Check if token is valid
        console.log("Step 1: Checking token...");
        const checkResponse = await axios.get(checkUrl);
        console.log("Check response:", checkResponse.data);

        if (!checkResponse.data.valid) {
          const errorMsg = checkResponse.data.isExpired 
            ? "This link has expired. Please add items to cart again." 
            : "Invalid or expired link. Please add items to cart again.";
          
          setError(errorMsg);
          setLoading(false);
          return;
        }

        console.log("✅ Token is valid");
        
        // 2. Restore the cart
        console.log("Step 2: Restoring cart...");
        const restoreResponse = await axios.get(restoreUrl);
        console.log("Restore response:", restoreResponse.data);

        if (restoreResponse.data.success) {
          // Save to localStorage
          const restoredItems = restoreResponse.data.items;
          console.log("Items to save:", restoredItems);
          
          localStorage.setItem('cart', JSON.stringify(restoredItems));
          
          // Update context/state if using
          if (typeof window !== 'undefined' && window.updateCart) {
            window.updateCart(restoredItems);
          }
          
          toast.success("Your cart has been restored!");
          
          // Redirect to cart page
          setTimeout(() => {
            router.push('/cart');
          }, 1500);
        } else {
          setError(restoreResponse.data.message || "Failed to restore cart");
        }
      } catch (error) {
        console.error("❌ Failed to restore cart:", error);
        
        // Detailed error logging
        if (error.response) {
          console.error("Response status:", error.response.status);
          console.error("Response data:", error.response.data);
          console.error("Response headers:", error.response.headers);
          
          if (error.response.status === 410) {
            setError("This link has expired. Please add items to cart again.");
          } else if (error.response.status === 404) {
            setError("Invalid or expired link. Please add items to cart again.");
          } else {
            setError(error.response.data?.message || `Server error: ${error.response.status}`);
          }
        } else if (error.request) {
          console.error("No response received:", error.request);
          setError("Cannot connect to server. Please check your internet connection.");
        } else {
          console.error("Request setup error:", error.message);
          setError("Failed to restore cart. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      restoreCart();
    } else {
      setError("No token provided in URL");
      setLoading(false);
    }
  }, [token, router]);

  // Rest of your component remains same...
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Restoring your cart...</p>
          <p className="text-sm text-gray-500">Token: {token?.substring(0, 20)}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-red-700 mb-2">Unable to Restore Cart</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-6">Token: {token?.substring(0, 20)}...</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return null;
}
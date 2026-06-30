"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RoundedPromotionalBanner() {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveBanner();
  }, []);

  const fetchActiveBanner = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/additionalbanner/getall`);
      const activeBanners = response.data.additionalbanners?.filter(b => b.status) || [];
      if (activeBanners.length > 0) {
        // Get the first active banner
        setBanner(activeBanners[0]);
      }
    } catch (error) {
      console.error('Error fetching banner:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto">
          <div className="animate-pulse rounded-2xl bg-gray-300 h-64 w-full"></div>
        </div>
      </div>
    );
  }

  if (!banner) {
    return null; // Don't render anything if no active banner
  }

  return (
    <div className="py-12 bg-gray-50 mx-auto max-w-8xl  px-4 sm:px-6 lg:px-16">
      <div className="container mx-auto">
        <img 
          src={`${process.env.NEXT_PUBLIC_API_URL}${banner.image}`} 
          className="rounded-md border-gray-400 shadow-md w-full h-auto"  
          alt="Promotional Banner" 
        />
      </div>
    </div>
  );
}

export default RoundedPromotionalBanner;
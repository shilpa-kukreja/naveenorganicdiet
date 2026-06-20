// import React from 'react'

// function Breadcrumb({img}) {
//   return (
//     <div>
//       <img src={img} className='w-full' alt="" />
//     </div>
//   )
// }

// export default Breadcrumb



"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Breadcrumb({ pageType = 'about' }) {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBanner(pageType);
  }, [pageType]);

  const fetchBanner = async (type) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/about-banner/page/${type}`);
      if (response.data.success) {
        setBanner(response.data.banner);
      } else {
        // Use fallback if no banner found
        setBanner(null);
      }
    } catch (error) {
      console.error('Error fetching banner:', error);
      setError('Failed to load banner');
      setBanner(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative">
        <div className="w-full h-64 md:h-96 bg-gray-200 animate-pulse"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-2 text-white">Loading banner...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !banner) {
    return (
      <div className="w-full h-64 md:h-96 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Banner Not Available</h2>
          <p className="opacity-90">{error}</p>
        </div>
      </div>
    );
  }

  if (!banner) {
    // Fallback to default banner
    const defaultBanners = {
      about: 'Banner/bg2.jpg',
      contact: 'Banner/bg2.jpg',
      home: 'Banner/bg1.jpg',
      other: 'Banner/bg3.jpg'
    };

    return (
      <div className="relative">
        <img 
          src={defaultBanners[pageType] || defaultBanners.about} 
          className='w-full h-[400px] object-cover' 
          alt={`${pageType} banner`} 
        />
        <div className="absolute inset-0  bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-3xl md:text-5xl font-bold capitalize mb-4">
              {pageType === 'about' ? 'About Us' : 
               pageType === 'contact' ? 'Contact Us' : 
               pageType === 'home' ? 'Home' : 
               pageType.replace('-', ' ')}
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              {pageType === 'about' ? 'Learn more about our company' :
               pageType === 'contact' ? 'Get in touch with us' :
               pageType === 'home' ? 'Welcome to our website' :
               'Explore more'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <img 
        src={`http://localhost:5000${banner.image}`} 
        className='w-full h-full object-cover' 
        alt={banner.title} 
      />
      <div className="absolute inset-0  bg-opacity-40 flex items-center justify-center">
        <div className="text-center text-white max-w-4xl px-4">
          {/* <h1 className="text-3xl md:text-5xl font-bold mb-4">{banner.title}</h1> */}
          {banner.description && (
            <p className="text-lg md:text-xl opacity-90 mb-6">{banner.description}</p>
          )}
          {banner.buttonText && banner.buttonLink && (
            <a 
              href={banner.buttonLink}
              className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300"
            >
              {banner.buttonText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default Breadcrumb;

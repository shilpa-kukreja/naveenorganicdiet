"use client";

import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import Link from 'next/link';
import 'swiper/css';
import 'swiper/css/navigation';

// CategoryCard component - Premium Circular Design
function CategoryCard({ category }) {
  return (
    <Link href={`/category/${category.slug}`}>
      <div className="group cursor-pointer">
        <div className="flex flex-col items-center text-center">
          {/* Circular Image Container */}
          <div className="relative w-full aspect-square rounded-full overflow-hidden bg-[#D4AF37] p-[2px] shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-100">
            <div className="w-full h-full rounded-full overflow-hidden bg-white">
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${category.image}`}
                alt={category.name}
                className="w-full h-full object-cover  duration-700 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          </div>
          
          {/* Category Name */}
          <h3 className="mt-4 text-base font-semibold text-gray-800 group-hover:text-[#D4AF37] transition-colors duration-300">
            {category.name}
          </h3>
        </div>
      </div>
    </Link>
  );
}

function CategorySlider({ categories = [] }) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Premium Loading Skeleton
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="w-full aspect-square rounded-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
            <div className="mt-4 h-5 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="w-full aspect-square rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-medium text-gray-500">No Category</h3>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="category-slider-wrapper relative px-8 lg:px-12">
      {/* Desktop Swiper with Navigation */}
      <div className="hidden lg:block">
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation={{
            nextEl: '.category-next',
            prevEl: '.category-prev',
          }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          spaceBetween={32}
          slidesPerView={6}
          loop={categories.length >= 6}
          speed={800}
          breakpoints={{
            320: { slidesPerView: 2, spaceBetween: 20 },
            640: { slidesPerView: 3, spaceBetween: 24 },
            768: { slidesPerView: 4, spaceBetween: 28 },
            1024: { slidesPerView: 5, spaceBetween: 30 },
            1280: { slidesPerView: 5, spaceBetween: 32 },
          }}
          className="category-swiper"
        >
          {categories.map((category) => (
            <SwiperSlide key={category._id}>
              <CategoryCard category={category} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Mobile/Tablet Grid */}
      <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {categories.slice(0, 8).map((category) => (
          <CategoryCard key={category._id} category={category} />
        ))}
      </div>

      {/* Custom Navigation Buttons */}
      <button 
        className="category-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg hover:shadow-xl text-[#00a63d] hover:text-white hover:bg-[#00a63d] transition-all duration-300 flex items-center justify-center cursor-pointer disabled:opacity-0 lg:flex hidden"
        aria-label="Previous category"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button 
        className="category-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg hover:shadow-xl text-[#00a63d] hover:text-white hover:bg-[#00a63d] transition-all duration-300 flex items-center justify-center cursor-pointer disabled:opacity-0 lg:flex hidden"
        aria-label="Next category"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Premium Styles */}
      <style jsx global>{`
        .category-swiper {
          padding: 16px 4px 32px 4px;
        }
        
        .category-swiper .swiper-slide {
          height: auto;
          transition: all 0.3s ease;
        }
        
        .category-swiper .swiper-slide:hover {
          transform: translateY(-4px);
        }
        
        .swiper-button-disabled {
          opacity: 0;
          cursor: default;
          pointer-events: none;
        }
        
        /* Custom Scrollbar for the section */
        .category-slider-wrapper ::-webkit-scrollbar {
          height: 4px;
        }
        
        .category-slider-wrapper ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .category-slider-wrapper ::-webkit-scrollbar-thumb {
          background: #00a63d;
          border-radius: 10px;
        }
        
        /* Premium Gradient Animation */
        @keyframes subtlePulse {
          0%, 100% {
            box-shadow: 0 4px 6px -1px rgba(0, 166, 61, 0.1), 0 2px 4px -1px rgba(0, 166, 61, 0.06);
          }
          50% {
            box-shadow: 0 10px 15px -3px rgba(0, 166, 61, 0.2), 0 4px 6px -2px rgba(0, 166, 61, 0.1);
          }
        }
        
        .group:hover .rounded-full {
          animation: subtlePulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default CategorySlider;
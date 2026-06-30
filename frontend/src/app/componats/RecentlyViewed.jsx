'use client';

import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { FiHeart, FiShoppingCart, FiStar, FiCheck } from 'react-icons/fi';
import { AppContext } from '../context/AppContext';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Import required modules
import { Navigation, Pagination } from 'swiper/modules';

const RecentlyViewed = ({ product }) => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [imageLoadStates, setImageLoadStates] = useState({});
  const [addedToCartStates, setAddedToCartStates] = useState({});
  const {
    toggleWishlist,
    isInWishlist,
    addToCart,
  } = useContext(AppContext)

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    setRecentlyViewed(items);

    // Initialize image load states
    const initialLoadStates = {};
    // Initialize cart states
    const initialCartStates = {};
    items.forEach(item => {
      initialLoadStates[item._id] = false;
      initialCartStates[item._id] = false;
    });
    setImageLoadStates(initialLoadStates);
    setAddedToCartStates(initialCartStates);
  }, []);

  const handleImageLoad = (productId) => {
    setImageLoadStates(prev => ({
      ...prev,
      [productId]: true
    }));
  };

  const handleImageError = (productId) => {
    setImageLoadStates(prev => ({
      ...prev,
      [productId]: 'error'
    }));
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(
      product,
      product.discountPrice || product.price,
      1
    );
    
    // Set cart state to true for this product
    setAddedToCartStates(prev => ({
      ...prev,
      [product._id]: true
    }));
    
    // Reset cart state after 1 second
    setTimeout(() => {
      setAddedToCartStates(prev => ({
        ...prev,
        [product._id]: false
      }));
    }, 1000);
  };

  const handleToggleWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  if (recentlyViewed.length === 0) return null;

  return (
    <div className="w-full mx-auto bg-gray-200 max-w-8xl  px-4 sm:px-6 lg:px-16  xl:px-16 py-8 sm:py-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 sm:mb-10">
        <div>
          <h2 className="text-3xl sm:text-3xl font-bold text-gray-900 mb-2">Recently Viewed</h2>
          <p className="text-gray-600 text-sm sm:text-base">Browse products you've recently shown interest in</p>
        </div>
        <Link
          href="/all-products"
          className="mt-4 md:mt-0 inline-flex items-center text-[#D4AF37] font-medium transition-colors text-sm sm:text-base"
        >
          View All Products
          <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      {/* Swiper Container */}
      <div className="relative w-full">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={2}
          navigation={{
            nextEl: '.swiper-button-next-recent',
            prevEl: '.swiper-button-prev-recent',
          }}
          pagination={{
            clickable: true,
            el: '.swiper-pagination-recent',
          }}
          breakpoints={{
            // When window width is >= 480px
            480: {
              slidesPerView: 2,
              spaceBetween: 16,
            },
            // When window width is >= 768px
            768: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            // When window width is >= 1024px
            1024: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
            // When window width is >= 1400px
            1400: {
              slidesPerView: 4,
              spaceBetween: 24,
            },
            // When window width is >= 1536px (extra large)
            1536: {
              slidesPerView: 5,
              spaceBetween: 28,
            },
          }}
          className="recently-viewed-swiper"
        >
          {recentlyViewed.map((product) => {
            const variant = product.variant?.[0] || {};
            const discountPrice = variant.discountPrice || product.discountPrice;
            const price = variant.price || product.price;
            const hasDiscount = discountPrice && discountPrice < price;
            const isWishlisted = isInWishlist(product._id);
            const imageState = imageLoadStates[product._id];
            const displayPrice = discountPrice || price;
            const addedToCart = addedToCartStates[product._id] || false;
            const stock = variant.stock || product.stock || 0;

            return (
              <SwiperSlide key={product._id}>
                 <Link href={`/product/${product.slug}`}>
                <div className="group relative bg-white rounded-md sm:rounded-lg shadow-sm transition-all duration-300 border border-[#D4AF37] overflow-hidden hover:border-[#00a63d] h-full">
                  {/* Product Image */}
                  
                  <div className="relative overflow-hidden">
                   
                    <div className={`w-full bg-gray-100 ${!imageState ? 'animate-pulse' : ''}`}>
                      {imageState !== 'error' ? (
                       
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}${product.thumbImg}`}
                            className={`w-full object-cover aspect-square cursor-pointer transition-all duration-500 ${imageState === true ? 'opacity-100' : 'opacity-0'
                              } group-hover:scale-110`}
                            alt={product.name}
                            onLoad={() => handleImageLoad(product._id)}
                            onError={() => handleImageError(product._id)}
                            loading="lazy"
                          />
                       
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <FiShoppingCart size={32} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                   

                    {/* Low Stock Badge */}
                    {stock < 10 && stock > 0 && (
                      <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Low Stock
                      </div>
                    )}

                    {/* Out of Stock Overlay */}
                    {stock === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium">
                          Out of Stock
                        </span>
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => handleToggleWishlist(e, product)}
                      className={`absolute top-2 right-2 p-1.5 sm:p-2 rounded-full transition-colors z-10 ${isWishlisted
                          ? 'bg-red-500 text-white shadow-lg'
                          : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
                        }`}
                      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <FiHeart size={12} className={isWishlisted ? 'fill-current' : ''} />
                    </button>

                    <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300" />
                  </div>

                  {/* Product Info */}
                   
                  <div className="p-3 sm:p-4">
                    {/* Product Name */}
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] text-sm sm:text-base group-hover:text-[#D4AF37] transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Pack Info */}
                    {product.pack && (
                      <p className="text-xs sm:text-sm text-gray-500 mb-2">Pack: {product.pack}</p>
                    )}

                    {/* Price Section */}
                   
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                      <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-0">
                        <span className="text-base sm:text-xl font-bold text-[#D4AF37]">
                          ₹{displayPrice?.toLocaleString()}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs sm:text-sm text-gray-500 line-through">
                            ₹{price?.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* SKU - Hide on mobile if too small */}
                      {product.sku && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded hidden sm:inline-block">
                          {product.sku}
                        </span>
                      )}
                    </div>

                    {/* Rating - Hide on mobile to save space */}
                    {product.rating && (
                      <div className="hidden sm:flex items-center gap-1 mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm text-gray-500 ml-1">({product.rating})</span>
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    <div className="flex space-x-1 sm:space-x-2">
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={stock === 0 || addedToCart}
                        className={`flex-1 py-2 sm:py-3 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-1 text-xs sm:text-sm ${
                          stock === 0
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : addedToCart
                            ? 'bg-[#D4AF37] text-white'
                            : 'bg-[#D4AF37] text-white hover:bg-[#D4AF37]'
                        }`}
                      >
                        {stock === 0 ? (
                          <span className="truncate">Out of Stock</span>
                        ) : addedToCart ? (
                          <>
                            <FiCheck size={14} className="animate-pulse" />
                            <span className="hidden sm:inline">Added</span>
                          </>
                        ) : (
                          <span className="truncate">Add to Cart</span>
                        )}
                      </button>
                      <button
                        onClick={(e) => handleToggleWishlist(e, product)}
                        className={`px-2 sm:px-4 py-2  hidden sm:py-3 border rounded-lg transition-colors sm:flex items-center justify-center ${isWishlisted
                            ? 'border-red-500 text-red-600 bg-red-50'
                            : 'border-gray-300 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                          }`}
                      >
                        <FiHeart size={14} className={isWishlisted ? 'fill-current' : ''} />
                      </button>
                    </div>
                  </div>
                 
                </div>
                 </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <div className="swiper-button-prev-recent hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg items-center justify-center cursor-pointer hover:bg-green-600 hover:text-white transition-all duration-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <div className="swiper-button-next-recent hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg items-center justify-center cursor-pointer hover:bg-green-600 hover:text-white transition-all duration-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Custom Pagination Dots */}
        <div className="swiper-pagination-recent flex justify-center mt-6 lg:hidden"></div>
      </div>

      {/* Custom Swiper Styles */}
      <style jsx>{`
        .recently-viewed-swiper {
          padding: 10px 5px 40px 5px;
        }
        
        /* Navigation buttons */
        .swiper-button-prev-recent,
        .swiper-button-next-recent {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .swiper-button-prev-recent:hover,
        .swiper-button-next-recent:hover {
          box-shadow: 0 6px 16px rgba(212, 175, 55, 0.3);
        }
        
        /* Pagination dots */
        .swiper-pagination-recent :global(.swiper-pagination-bullet) {
          width: 8px;
          height: 8px;
          background-color: #d1d5db;
          opacity: 1;
          margin: 0 4px !important;
        }
        
        .swiper-pagination-recent :global(.swiper-pagination-bullet-active) {
          background-color: #00a63d;
          width: 24px;
          border-radius: 4px;
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
          .recently-viewed-swiper {
            padding: 10px 5px 30px 5px;
          }
        }
        
        @media (max-width: 480px) {
          .recently-viewed-swiper {
            padding: 5px 5px 25px 5px;
          }
        }
      `}</style>
    </div>
  );
};

export default RecentlyViewed;
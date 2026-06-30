'use client';

import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { AppContext } from '../context/AppContext';
import { FiHeart, FiShoppingCart, FiClock, FiArrowRight, FiCheck } from 'react-icons/fi';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Import required modules
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

const NewArrivals = () => {
  const { products, addToCart, toggleWishlist, isInWishlist } = useContext(AppContext);
  const [newArrivals, setNewArrivals] = useState([]);
  const [imageLoadStates, setImageLoadStates] = useState({});
  const [addedToCartStates, setAddedToCartStates] = useState({});

  // Filter new arrivals
  useEffect(() => {
    if (!products || products.length === 0) return;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filtered = products
      .filter(product => {
        const productDate = new Date(product.createdAt || product.updatedAt || 0);
        return productDate >= thirtyDaysAgo;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt || 0);
        const dateB = new Date(b.createdAt || b.updatedAt || 0);
        return dateB - dateA;
      })
      .slice(0, 12);

    setNewArrivals(filtered);

    const initialLoadStates = {};
    const initialCartStates = {};
    filtered.forEach(item => {
      initialLoadStates[item._id] = false;
      initialCartStates[item._id] = false;
    });
    setImageLoadStates(initialLoadStates);
    setAddedToCartStates(initialCartStates);
  }, [products]);

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

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.discountPrice || product.price, 1);
    
    setAddedToCartStates(prev => ({
      ...prev,
      [product._id]: true
    }));
    
    setTimeout(() => {
      setAddedToCartStates(prev => ({
        ...prev,
        [product._id]: false
      }));
    }, 1000);
  };

  const handleToggleWishlist = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  if (newArrivals.length === 0) return null;

  return (
    <div className="w-full bg-gray-200 mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 py-8 sm:py-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 sm:mb-10">
        <div className="mb-6 md:mb-0">
          <div className="flex items-center gap-2 mb-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">New Arrivals</h2>
              <p className="text-gray-600 text-sm sm:text-base">Fresh products just added to our collection</p>
            </div>
          </div>
        </div>
        
        <Link 
          href="/all-products" 
          className="sm:inline-flex hidden items-center  gap-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-green-700 hover:to-emerald-800 transition-all duration-300 font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
        >
          <span>View All New Products</span>
          <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </Link>
      </div>

      {/* Swiper Container */}
      <div className="relative w-full">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={2}
          navigation={{
            nextEl: '.swiper-button-next-new',
            prevEl: '.swiper-button-prev-new',
          }}
          pagination={{
            clickable: true,
            el: '.swiper-pagination-new',
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
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
          className="new-arrivals-swiper"
        >
          {newArrivals.map((product) => {
            const hasDiscount = product.discountPrice && product.discountPrice < product.price;
            const isWishlisted = isInWishlist(product._id);
            const imageState = imageLoadStates[product._id];
            const displayPrice = product.discountPrice || product.price;
            const addedToCart = addedToCartStates[product._id] || false;

            // Calculate how many days ago the product was added
            const productDate = new Date(product.createdAt || product.updatedAt || Date.now());
            const currentDate = new Date();
            const diffTime = Math.abs(currentDate - productDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return (
              <SwiperSlide key={product._id}>
                <div className="group relative bg-white rounded-lg shadow-sm transition-all duration-300 border border-[#00a63d] overflow-hidden hover:border-[#00a63d] transform hover:-translate-y-1 h-full">
                  {/* Product Image */}
                  <div className="relative overflow-hidden w-full">
                    <Link href={`/product/${product.slug}`} className="block w-full">
                      <div className={`w-full h-48 sm:h-56 md:h-64 bg-gray-100 ${!imageState ? 'animate-pulse' : ''}`}>
                        {imageState !== 'error' ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}${product.thumbImg}`}
                            className={`w-full h-full object-cover cursor-pointer transition-all duration-500 ${
                              imageState === true ? 'opacity-100' : 'opacity-0'
                            } group-hover:scale-110`}
                            alt={product.name}
                            onLoad={() => handleImageLoad(product._id)}
                            onError={() => handleImageError(product._id)}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <FiShoppingCart size={32} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Low Stock Badge */}
                    {product.stock < 10 && product.stock > 0 && (
                      <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Only {product.stock} left
                      </div>
                    )}

                    {/* Out of Stock */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium">
                          Out of Stock
                        </span>
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <button 
                      onClick={(e) => handleToggleWishlist(product, e)}
                      className={`absolute top-3 right-3 p-2 rounded-full transition-colors z-10 ${
                        isWishlisted 
                          ? 'bg-red-500 text-white shadow-lg' 
                          : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
                      }`}
                      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <FiHeart size={16} className={isWishlisted ? 'fill-current' : ''} />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 sm:p-5">
                    {/* Product Name */}
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] text-sm sm:text-base md:text-lg group-hover:text-green-700 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Time Since Added */}
                    {/* <div className="flex items-center gap-1 text-xs text-gray-500 mb-2 sm:mb-3">
                      <FiClock size={12} />
                      <span>Added {diffDays === 0 ? 'today' : diffDays === 1 ? 'yesterday' : `${diffDays} days ago`}</span>
                    </div> */}

                    {/* Pack Info */}
                    {product.pack && (
                      <p className="text-sm text-gray-500 mb-3">Pack: {product.pack}</p>
                    )}

                    {/* Price Section */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-xl font-bold text-green-600">
                          ₹{displayPrice?.toLocaleString()}
                        </span>
                        {hasDiscount && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{product.price?.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* SKU */}
                      {product.sku && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded hidden sm:inline-block">
                          {product.sku}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <div className="flex space-x-2">
                      <button 
                        onClick={(e) => handleAddToCart(product, e)} 
                        disabled={product.stock === 0 || addedToCart}
                        className={`flex-1 py-3 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base ${
                          product.stock === 0
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : addedToCart
                            ? 'bg-green-700 text-white'
                            : 'bg-[#00a63d] text-white hover:bg-green-600'
                        }`}
                      >
                        {product.stock === 0 ? (
                          'Out of Stock'
                        ) : addedToCart ? (
                          <>
                            <FiCheck size={20} className="animate-pulse" />
                            <span>Added</span>
                          </>
                        ) : (
                          'Add to Cart'
                        )}
                      </button>
                      <button 
                        onClick={(e) => handleToggleWishlist(product, e)}
                        className={`px-4 py-3 border sm:block hidden rounded-lg transition-colors flex items-center justify-center ${
                          isWishlisted 
                            ? 'border-red-500 text-red-600 bg-red-50' 
                            : 'border-gray-300 hover:border-green-500 hover:text-green-600'
                        }`}
                      >
                        <FiHeart size={20} className={isWishlisted ? 'fill-current' : ''} />
                      </button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <div className="swiper-button-prev-new hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg items-center justify-center cursor-pointer hover:bg-green-600 hover:text-white transition-all duration-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <div className="swiper-button-next-new hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg items-center justify-center cursor-pointer hover:bg-green-600 hover:text-white transition-all duration-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Custom Pagination Dots */}
        <div className="swiper-pagination-new flex justify-center mt-6 lg:hidden"></div>
      </div>

      {/* Custom Swiper Styles */}
      <style jsx>{`
        .new-arrivals-swiper {
          padding: 10px 5px 40px 5px;
        }
        
        /* Navigation buttons */
        .swiper-button-prev-new,
        .swiper-button-next-new {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .swiper-button-prev-new:hover,
        .swiper-button-next-new:hover {
          box-shadow: 0 6px 16px rgba(0, 166, 61, 0.3);
        }
        
        /* Pagination dots */
        .swiper-pagination-new :global(.swiper-pagination-bullet) {
          width: 8px;
          height: 8px;
          background-color: #d1d5db;
          opacity: 1;
          margin: 0 4px !important;
        }
        
        .swiper-pagination-new :global(.swiper-pagination-bullet-active) {
          background-color: #00a63d;
          width: 24px;
          border-radius: 4px;
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
          .new-arrivals-swiper {
            padding: 10px 5px 30px 5px;
          }
        }
        
        @media (max-width: 480px) {
          .new-arrivals-swiper {
            padding: 5px 5px 25px 5px;
          }
        }
      `}</style>
    </div>
  );
};

export default NewArrivals;
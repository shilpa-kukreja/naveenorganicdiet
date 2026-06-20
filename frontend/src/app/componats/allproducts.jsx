'use client';

import React, { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { AppContext } from '../context/AppContext';
import { FiHeart, FiShoppingCart, FiStar, FiArrowRight, FiCheck } from 'react-icons/fi';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Import required modules
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

const AllProductsHome = () => {
  const { products, addToCart, toggleWishlist, isInWishlist } = useContext(AppContext);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [imageLoadStates, setImageLoadStates] = useState({});
  const [addedToCartStates, setAddedToCartStates] = useState({});

  // Initialize products
  useEffect(() => {
    if (products && products.length > 0) {
      // Take only first 8-12 products for the slider
      const display = products.slice(0, 12);
      setDisplayProducts(display);
      
      // Initialize image load states
      const initialLoadStates = {};
      const initialCartStates = {};
      display.forEach(item => {
        initialLoadStates[item._id] = false;
        initialCartStates[item._id] = false;
      });
      setImageLoadStates(initialLoadStates);
      setAddedToCartStates(initialCartStates);
    }
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

  const handleToggleWishlist = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  if (!products || products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
          <div className="w-24 h-24 mx-auto mb-4 bg-[#D4AF37] rounded-full flex items-center justify-center">
            <FiShoppingCart size={32} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Available</h3>
          <p className="text-gray-600 mb-6">Check back soon for our amazing collection!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto bg-gray-200  max-w-8xl  px-4 sm:px-6 lg:px-16   xl:px-16 py-8 sm:py-12">
      {/* Header Section */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#D4AF37] text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4">
          <span className="text-xs sm:text-sm font-semibold">FEATURED PRODUCTS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
          Explore Our Collection
        </h2>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl sm:max-w-3xl mx-auto mb-6 sm:mb-8">
          Discover our premium selection of handpicked products
        </p>
      </div>

      {/* Products Swiper */}
      <div className="relative w-full">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={2}
          navigation={{
            nextEl: '.swiper-button-next-featured',
            prevEl: '.swiper-button-prev-featured',
          }}
          pagination={{
            clickable: true,
            el: '.swiper-pagination-featured',
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
          className="featured-products-swiper"
        >
          {displayProducts.map((product) => (
            <SwiperSlide key={product._id}>
              <div className="px-1.5 sm:px-2">
                <ProductCard
                  product={product}
                  onImageLoad={handleImageLoad}
                  onImageError={handleImageError}
                  imageState={imageLoadStates[product._id]}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  isWishlisted={isInWishlist(product._id)}
                  addedToCart={addedToCartStates[product._id] || false}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <div className="swiper-button-prev-featured hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg items-center justify-center cursor-pointer hover:bg-green-600 hover:text-white transition-all duration-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <div className="swiper-button-next-featured hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg items-center justify-center cursor-pointer hover:bg-green-600 hover:text-white transition-all duration-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Custom Pagination Dots */}
        <div className="swiper-pagination-featured flex justify-center mt-6 lg:hidden"></div>
      </div>

      {/* View All Products Link at Bottom */}
      <div className="text-center mt-8 sm:mt-12">
        <Link 
          href="/all-products" 
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#D4AF37] text-white px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-lg hover:from-[#D4AF37] hover:to-[#D4AF37] transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
        >
          <span>Browse Complete Collection</span>
          <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </Link>
      </div>

      {/* Custom Swiper Styles */}
      <style jsx>{`
        .featured-products-swiper {
          padding: 10px 5px 40px 5px;
        }
        
        /* Navigation buttons */
        .swiper-button-prev-featured,
        .swiper-button-next-featured {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .swiper-button-prev-featured:hover,
        .swiper-button-next-featured:hover {
          box-shadow: 0 6px 16px rgba(212, 175, 55, 0.3);
        }
        
        /* Pagination dots */
        .swiper-pagination-featured :global(.swiper-pagination-bullet) {
          width: 8px;
          height: 8px;
          background-color: #d1d5db;
          opacity: 1;
          margin: 0 4px !important;
        }
        
        .swiper-pagination-featured :global(.swiper-pagination-bullet-active) {
          background-color: #D4AF37;
          width: 24px;
          border-radius: 4px;
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
          .featured-products-swiper {
            padding: 10px 5px 30px 5px;
          }
        }
        
        @media (max-width: 480px) {
          .featured-products-swiper {
            padding: 5px 5px 25px 5px;
          }
        }
      `}</style>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ 
  product, 
  onImageLoad, 
  onImageError, 
  imageState, 
  onAddToCart, 
  onToggleWishlist, 
  isWishlisted,
  addedToCart
}) => {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const displayPrice = product.discountPrice || product.price;

  return (
    <div className="bg-white rounded-md shadow-md transition-all duration-300 border border-[#D4AF37] overflow-hidden group hover:border-[#D4AF37] transform hover:-translate-y-1 h-full">
      <Link href={`/product/${product.slug}`} className="block">
        {/* Product Image */}
        <div className="relative overflow-hidden">
          <div className={`w-full aspect-square bg-gray-100 ${!imageState ? 'animate-pulse' : ''}`}>
            {imageState !== 'error' ? (
              <img
                src={`http://localhost:5000${product.thumbImg}`}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  imageState === true ? 'opacity-100' : 'opacity-0'
                } group-hover:scale-110`}
                alt={product.name}
                onLoad={() => onImageLoad(product._id)}
                onError={() => onImageError(product._id)}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <FiShoppingCart size={32} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* Stock Status */}
          {product.stock < 10 && product.stock > 0 && (
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-orange-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium">
              Only {product.stock} left
            </div>
          )}

          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium">
                Out of Stock
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          <button 
            onClick={(e) => onToggleWishlist(product, e)}
            className={`absolute top-2 sm:top-3 left-2 sm:left-3 p-1.5 sm:p-2.5 rounded-full transition-colors z-10 ${
              isWishlisted 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
            }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <FiHeart size={14} className={isWishlisted ? 'fill-current' : ''} />
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-3 sm:p-4 md:p-5">
        {/* Product Name */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-2 min-h-[2.5rem] text-sm sm:text-base group-hover:text-[#D4AF37] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Pack Info */}
        {product.pack && (
          <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">Pack: {product.pack}</p>
        )}

        {/* Price Section */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-base sm:text-lg md:text-xl font-bold text-[#D4AF37]">
              ₹{displayPrice?.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs sm:text-sm text-gray-500 line-through">
                ₹{product.price?.toLocaleString()}
              </span>
            )}
          </div>

          {/* Rating - Hide on mobile */}
          {product.rating && (
            <div className="hidden sm:flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FiStar 
                    key={i} 
                    className={`w-3 h-3 md:w-4 md:h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">({product.rating})</span>
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <button 
          onClick={(e) => onAddToCart(product, e)} 
          disabled={product.stock === 0 || addedToCart}
          className={`w-full py-2 sm:py-3 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
            product.stock === 0
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : addedToCart
              ? 'bg-[#D4AF37] text-white'
              : 'bg-[#D4AF37] text-white hover:bg-[#D4AF37]'
          }`}
        >
          {product.stock === 0 ? (
            'Out of Stock'
          ) : addedToCart ? (
            <>
              <FiCheck size={16} className="animate-pulse" />
              <span className="hidden sm:inline">Added</span>
            </>
          ) : (
            'Add to Cart'
          )}
        </button>
      </div>
    </div>
  );
};

export default AllProductsHome;
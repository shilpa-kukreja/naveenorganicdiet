'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const AboutOurProductSec = () => {
  const products = [
    {
      id: 1,
      title: "Traditional Method",
      description: "Working with marginal farmers across the India.",
      features: ["100% Natural", "Recyclable Packaging", "Cruelty-Free"],
      image: "/images/traditional-method.jpg"
    },
    {
      id: 2,
      title: "Organic Farming",
      description: "Sustainably grown with traditional farming techniques.",
      features: ["Chemical-Free", "Eco-Friendly", "Fresh Produce"],
      image: "/images/organic-farming.jpg"
    },
    {
      id: 3,
      title: "Handcrafted Goods",
      description: "Artisanal products made with care and precision.",
      features: ["Handmade", "Quality Crafted", "Unique Designs"],
      image: "/images/handcrafted.jpg"
    },
    {
      id: 4,
      title: "Natural Ingredients",
      description: "Pure ingredients sourced from nature's bounty.",
      features: ["Pure Extracts", "No Additives", "Tested Quality"],
      image: "/images/natural-ingredients.jpg"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Products
          </h1>
          <div className="w-24 h-1 bg-amber-500 mx-auto mb-8"></div>
        </div>

        {/* Swiper Slider */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={{
              nextEl: '.product-next',
              prevEl: '.product-prev',
            }}
            pagination={{
              clickable: true,
              el: '.product-pagination',
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="!pb-16"
          >
            {products.map((product) => (
              <SwiperSlide key={product.id}>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-amber-100">
                  {/* Product Image */}
                  <div className="h-48 bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl">🌿</span>
                      </div>
                      <h3 className="text-lg font-semibold">Product Image</h3>
                    </div>
                  </div>

                  {/* Product Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {product.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      {product.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                          <span className="text-gray-700 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* 100% Natural Badge */}
                    <div className="inline-flex items-center px-4 py-2 bg-amber-100 border border-amber-200 rounded-full">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                      <span className="text-amber-800 font-semibold text-sm">100% NATURAL</span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation */}
          <div className="flex justify-center items-center mt-8 space-x-4">
            <button className="product-prev w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all duration-300 border border-amber-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="product-pagination flex justify-center space-x-2 !relative !w-auto"></div>
            
            <button className="product-next w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all duration-300 border border-amber-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-amber-100">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-amber-600 text-xl">🌱</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Traditional Method</h4>
            <p className="text-gray-600 text-sm">Time-honored techniques passed through generations</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-amber-100">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-amber-600 text-xl">♻️</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Recyclable Packaging</h4>
            <p className="text-gray-600 text-sm">Eco-friendly packaging that cares for our planet</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-amber-100">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-amber-600 text-xl">💚</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Cruelty-Free</h4>
            <p className="text-gray-600 text-sm">Ethically produced without harm to animals</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: #cbd5e0;
          opacity: 0.7;
        }
        
        .swiper-pagination-bullet-active {
          background: #f59e0b;
          opacity: 1;
        }
      `}</style>
    </section>
  );
}

export default AboutOurProductSec;
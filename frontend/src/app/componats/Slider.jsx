// "use client";
// import React, { useState, useEffect } from 'react';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
// import 'swiper/css';
// import 'swiper/css/pagination';
// import 'swiper/css/navigation';
// import 'swiper/css/effect-fade';

// // Image data with different mobile and desktop images
// const sliderData = [
//   {
//     id: 1,
//     mobileImage: "banner/bg1.jpg",
//     desktopImage: "banner/bg1.jpg"
//   },
//   {
//     id: 2,
//     mobileImage: "banner/bg2.jpg",
//     desktopImage: "banner/bg2.jpg"
//   }
// ];

// function Slider() {
//   const [isMounted, setIsMounted] = useState(false);

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   // Prevent SSR for Swiper component
//   if (!isMounted) {
//     return (
//       <div className="relative max-w-full h-[400px] md:h-[600px] bg-gray-200 animate-pulse">
//         {/* Loading skeleton */}
//         <div className="w-full h-full flex items-center justify-center">
//           <div className="text-gray-500">Loading slider...</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="relative w-full">
//       <Swiper
//         spaceBetween={0}
//         slidesPerView={1}
//         loop={true}
//         autoplay={{
//           delay: 4000,
//           disableOnInteraction: false,
//           pauseOnMouseEnter: true,
//         }}
//         pagination={{
//           clickable: true,
//           dynamicBullets: true,
//         }}
//         navigation={true}
  
//         fadeEffect={{
//           crossFade: true
//         }}
//         speed={800}
//         modules={[Autoplay, Pagination, Navigation, EffectFade]}
//         className="h-[400px] md:h-[600px] lg:h-[600px]"
//       >
//         {sliderData.map((slide) => (
//           <SwiperSlide key={slide.id} className="relative">
//             {/* Mobile Image */}
//             <div className="block md:hidden w-full h-full">
//               <img 
//                 src={slide.mobileImage}
//                 alt={`Slide ${slide.id}`}
//                 className="w-full h-full object-cover"
//                 loading="lazy"
//                 decoding="async"
//               />
//             </div>

//             {/* Desktop Image */}
//             <div className="hidden md:block w-full h-full">
//               <img 
//                 src={slide.desktopImage}
//                 alt={`Slide ${slide.id}`}
//                 className="w-full h-full object-cover"
//                 loading="lazy"
//                 decoding="async"
//               />
//             </div>
//           </SwiperSlide>
//         ))}
//       </Swiper>

//       {/* Custom Styles for Swiper */}
//       <style jsx global>{`
//         .swiper-pagination-bullet {
//           width: 10px;
//           height: 10px;
//           background: white;
//           opacity: 0.6;
//           transition: all 0.3s ease;
//           margin: 0 6px !important;
//         }
        
//         .swiper-pagination-bullet-active {
//           opacity: 1;
//           background: white;
//           transform: scale(1.3);
//           box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
//         }
        
//         .swiper-pagination {
//           bottom: 25px !important;
//         }
        
//         .swiper-button-next,
//         .swiper-button-prev {
//           color: white;
//           background: rgba(0, 0, 0, 0.3);
//           width: 44px;
//           height: 44px;
//           border-radius: 50%;
//           backdrop-filter: blur(8px);
//           transition: all 0.3s ease;
//           opacity: 0;
//         }
        
//         .swiper:hover .swiper-button-next,
//         .swiper:hover .swiper-button-prev {
//           opacity: 1;
//         }
        
//         .swiper-button-next:after,
//         .swiper-button-prev:after {
//           font-size: 18px;
//           font-weight: bold;
//         }
        
//         .swiper-button-next:hover,
//         .swiper-button-prev:hover {
//           background: rgba(0, 0, 0, 0.5);
//           transform: scale(1.1);
//         }
        
//         .swiper-button-next {
//           right: 20px;
//         }
        

//         .swiper-navigation-icon {
//           width: 20px !important;
//           height: 20px !important;  
        
//         }

//         .swiper-button-prev {
//           left: 20px;
//         }
        
//         @media (max-width: 768px) {
//           .swiper-button-next,
//           .swiper-button-prev {
//             display: none;
//           }
          
//           .swiper-pagination {
//             bottom: 15px !important;
//           }
          
//           .swiper-pagination-bullet {
//             width: 8px;
//             height: 8px;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// export default Slider;


"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL}/api/mainbanner`;

function Slider() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const swiperRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/mainbanner/all`);
      // Filter only active banners
      const activeBanners = response.data.banners
        .filter(banner => banner.status)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBanners(activeBanners);
      setError(null);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setError('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  // Handle manual navigation
  const handlePrev = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slideNext();
    }
  };

  // Prevent SSR for Swiper component
  if (!isMounted) {
    return (
      <div className="relative w-full h-[400px] md:h-[600px] bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500">Loading slider...</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="relative w-full h-[400px] md:h-[600px] bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-gray-600">Loading banners...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-[400px] md:h-[600px] bg-gradient-to-r from-red-50 to-red-100">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <svg className="w-12 h-12 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.748 0L4.308 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Banners</h3>
          <p className="text-red-600 text-center mb-4">{error}</p>
          <button
            onClick={fetchBanners}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="relative w-full h-[400px] md:h-[600px] bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <svg className="w-16 h-16 text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-medium text-blue-900 mb-2">No Banners Available</h3>
          <p className="text-blue-700 text-center max-w-md">
            No active banners found. Please add banners from the admin panel to display here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full group">
      <Swiper
        ref={swiperRef}
        spaceBetween={0}
        slidesPerView={1}
        loop={banners.length > 1}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
          renderBullet: function (index, className) {
            return `<span class="${className} !w-2.5 !h-2.5 bg-white/70 hover:bg-white transition-all duration-300"></span>`;
          },
        }}
        navigation={false}
        effect="fade"
        fadeEffect={{
          crossFade: true
        }}
        speed={1000}
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        className="h-[400px] md:h-[600px]"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner._id} className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
            <img 
              src={`${API_URL.replace('/api/mainbanner', '')}${banner.image}`}
              alt={`Banner ${banner._id}`}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik00MDAgMzAwTDYwMCAzMDAiIHN0cm9rZT0iI0NDQyIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik01MDAgMjAwTDUwMCA0MDAiIHN0cm9rZT0iI0NDQyIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjx0ZXh0IHg9IjUwMCIgeT0iNTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM4ODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJhbm5lciBJbWFnZTwvdGV4dD4KPC9zdmc+';
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Slide Counter */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 right-4 z-20 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
          <span className="swiper-pagination-current font-bold">1</span>
          <span className="mx-1">/</span>
          <span className="swiper-pagination-total">{banners.length}</span>
        </div>
      )}

      {/* Custom CSS for Swiper */}
      <style jsx global>{`
        .swiper {
          width: 100%;
          height: 100%;
        }

        .swiper-slide {
          position: relative;
        }

        .swiper-pagination {
          bottom: 20px !important;
        }

        .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: rgba(255, 255, 255, 0.7);
          opacity: 0.7;
          transition: all 0.3s ease;
          margin: 0 5px !important;
        }

        .swiper-pagination-bullet:hover {
          opacity: 1;
          transform: scale(1.2);
        }

        .swiper-pagination-bullet-active {
          opacity: 1;
          background: #fff;
          width: 30px;
          border-radius: 10px;
        }

        @media (max-width: 768px) {
          .swiper-pagination {
            bottom: 10px !important;
          }
          
          .swiper-pagination-bullet {
            width: 8px;
            height: 8px;
          }
          
          .swiper-pagination-bullet-active {
            width: 20px;
          }
        }
      `}</style>
    </div>
  );
}

export default Slider;
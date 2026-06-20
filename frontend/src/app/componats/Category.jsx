// "use client";
// import React, { useState, useEffect } from 'react';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Navigation } from 'swiper/modules';
// import { ChevronRight, ChevronLeft } from 'lucide-react';
// import 'swiper/css';
// import 'swiper/css/navigation';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import Link from 'next/link';

// function Category() {
//   const [isMounted, setIsMounted] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       setIsLoading(true);
//       const res = await axios.get("http://localhost:5000/api/category/get");

//       // CORRECTED: Use res.data directly since backend returns array
//       // console.log("API Response:", res.data); // This should show your categories array
//       setCategories(res.data || []);
//       console.log("categoriess", categories);

//     } catch (error) {
//       toast.error("Failed to fetch categories");
//       console.error("Fetch error:", error);
//       setCategories([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

  

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   // Prevent SSR for Swiper component
//   if (!isMounted) {
//     return (
//       <section className="py-12 bg-gray-50">
//         <div className="container mx-auto px-4">
//           {/* Section Header */}
//           <div className="flex justify-between items-center mb-8">
//             <div>
//               <h2 className="text-3xl font-bold text-gray-900 mb-2">Products Category</h2>
//               <p className="text-gray-600">Browse products by category</p>
//             </div>

//             <div className="flex items-center space-x-4">
//               <button className="hidden lg:flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold group">
//                 <span>See More</span>
//                 <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
//               </button>

//               {/* Navigation Buttons */}
//               <div className="hidden lg:flex space-x-2">
//                 <button className="category-prev w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
//                   <ChevronLeft size={20} />
//                 </button>
//                 <button className="category-next w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
//                   <ChevronRight size={20} />
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Loading Skeleton */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
//             {[...Array(6)].map((_, index) => (
//               <div key={index} className="bg-white rounded-md shadow-sm border border-gray-400 h-full animate-pulse">
//                 <div className="h-48 bg-gray-300"></div>
//                 <div className="p-3">
//                   <div className="h-6 bg-gray-300 rounded mb-2"></div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Mobile See More Button */}
//           <div className="mt-8 text-center lg:hidden">
//             <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto">
//               <span>See More Categories</span>
//               <ChevronRight size={20} />
//             </button>
//           </div>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section className="py-12 bg-gray-50">
//       <div className="container mx-auto px-4">
//         {/* Section Header */}
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h2 className="text-3xl font-bold text-gray-900 mb-2">Products Category</h2>
//             <p className="text-gray-600">Browse products by category</p>
//           </div>

//           <div className="flex items-center space-x-4">
//             <button className="hidden lg:flex items-center space-x-2 text-[#00a63d] hover:text-[#00a63d] font-semibold group">
//               <span>See More</span>
//               <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
//             </button>

//             {/* Navigation Buttons */}
//             <div className="hidden lg:flex space-x-2">
//               <button className="category-prev w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
//                 <ChevronLeft size={20} />
//               </button>
//               <button className="category-next w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
//                 <ChevronRight size={20} />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Category Slider */}
//         <Swiper
//           modules={[Navigation]}
//           navigation={{
//             nextEl: '.category-next',
//             prevEl: '.category-prev',
//           }}
//           spaceBetween={24}
//           slidesPerView={1}
//           loop={true}
//           breakpoints={{
//             640: {
//               slidesPerView: 2,
//             },
//             768: {
//               slidesPerView: 3,
//             },
//             1024: {
//               slidesPerView: 6,
//             },
//           }}
//           className="category-swiper"
//         >
//           {categories.map((category) => (
//             <SwiperSlide key={category._id}>
//               <Link href={`/category/${category.slug}`}>
//                 <div className="bg-white rounded-md shadow-sm  transition-all duration-300 group cursor-pointer overflow-hidden border border-[#00a63d] h-full">

//                   <div className="relative h-48 overflow-hidden">
//                     <img
//                       src={`http://localhost:5000${category.image}`}
//                       alt={category.name}
//                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                       loading="lazy"
//                     />

//                     <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
//                   </div>

//                   <div className="px-3 py-2">
//                     <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 text-center transition-colors duration-200">
//                       {category.name}
//                     </h3>
//                   </div>
//                 </div>
//               </Link>
//             </SwiperSlide>

//           ))}
//         </Swiper>

//         {/* Mobile See More Button */}
//         <div className="mt-8 text-center lg:hidden">
//           <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto">
//             <span>See More Categories</span>
//             <ChevronRight size={20} />
//           </button>
//         </div>
//       </div>

//       {/* Custom Swiper Styles */}
//       <style jsx global>{`
//         .category-swiper {
//           padding: 8px 4px 24px 4px;
//         }
        
//         .swiper-slide {
//           height: auto;
//         }
//       `}</style>
//     </section>
//   );
// }

// export default Category;


import React from 'react';
import CategorySlider from './CategorySlider';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

async function fetchCategories() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/category/get`,
      { 
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    
    const categories = await response.json();
    return Array.isArray(categories) ? categories : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

async function Category() {
  const categories = await fetchCategories();
  
  // If no categories, return minimal UI or null
  if (categories.length === 0) {
    return (
      <section className="py-12 bg-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Products Category</h2>
              <p className="text-gray-600">Browse products by category</p>
            </div>
          </div>
          <p className="text-center text-gray-500 py-8">No categories available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-200 max-w-8xl mx-auto px-4 sm:px-6 lg:px-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Products Category</h2>
            <p className="text-gray-600">Browse products by category</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* <Link 
              href="/categories" 
              className="hidden lg:flex items-center space-x-2 text-[#00a63d] hover:text-[#00a63d] font-semibold group"
            >
              <span>See More</span>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link> */}

            {/* Navigation Buttons - These will work with CategorySlider component */}
            <div className="hidden lg:flex space-x-2">
              <button className="category-prev w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button className="category-next w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Grid/Slider */}
        <CategorySlider categories={categories} />

        {/* Mobile See More Button */}
        <div className="mt-8 text-center lg:hidden">
          <Link 
            href="/categories"
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
          >
            <span>See More Categories</span>
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Category;
// 'use client';

// import React, { useContext, useState, useEffect } from 'react';
// import Link from 'next/link';
// import { AppContext } from '../context/AppContext';

// const CategoryShowcase = () => {
//   const {
//     toggleWishlist,
//     isInWishlist,
//     addToCart,
//     categories,
//     products
//   } = useContext(AppContext);

//   const [selectedVariants, setSelectedVariants] = useState({});
//   const [activeCategoryId, setActiveCategoryId] = useState(null);

//   // ✅ set default category only after categories load
//   useEffect(() => {
//     if (categories.length > 0 && !activeCategoryId) {
//       setActiveCategoryId(categories[0]._id);
//     }
//   }, [categories, activeCategoryId]);

//   const getProductsByCategory = (categoryId) => {
//     if (!categoryId) return []; // ✅ guard against null/undefined

//     return products
//       .filter(product =>
//         Array.isArray(product.category) &&
//         product.category.some(catId => catId?.toString() === categoryId.toString())
//       )
//       .sort((a, b) => {
//         const priority = (product) => {
//           if (product.section?.includes('bestseller')) return 0;
//           if (product.section?.includes('newarrival')) return 1;
//           return 2;
//         };
//         return priority(a) - priority(b);
//       })
//       .slice(0, 8);
//   };

//   const getDiscountPercentage = (price, discountPrice) => {
//     return Math.round(((price - discountPrice) / price) * 100);
//   };

//   const handleVariantClick = (productId, variantIndex) => {
//     setSelectedVariants(prev => ({ ...prev, [productId]: variantIndex }));
//   };

//   const handleAddToCart = (product) => {
//     const selectedVariantIndex = selectedVariants[product._id] ?? 0;
//     const variant = product.variant?.[selectedVariantIndex];
//     if (variant) {
//       addToCart(product, variant, 1);
//     }
//   };

//   const activeCategory = categories.find(c => c._id === activeCategoryId);
//   const activeProducts = getProductsByCategory(activeCategoryId);

//   // 🚨 Show loading until categories/products are ready
//   if (categories.length === 0 || !activeCategoryId) {
//     return <p className="text-center py-10">Loading categories...</p>;
//   }

//   return (
//     <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
//       {/* Section Heading */}
//       <div className="text-center mb-10">
//         <h2 className="text-4xl font-bold text-gray-900 mb-2">SHOP BY STYLE</h2>
//         <p className="text-gray-600 text-lg">Browse trending collections by category</p>
//       </div>

//       {/* Category Tabs */}
//       <div className="flex justify-center flex-wrap gap-4 mb-10">
//         {categories.map((category) => (
//           <button
//             key={category._id}
//             onClick={() => setActiveCategoryId(category._id)}
//             className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${activeCategoryId === category._id
//               ? 'bg-gray-900 text-white border-gray-900'
//               : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
//               }`}
//           >
//             {category.name}
//           </button>
//         ))}
//       </div>

//       {/* Product Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
//         {activeProducts.map((product) => {
//           const selectedIndex = selectedVariants[product._id] ?? 0;
//           const variant = product.variant[selectedIndex];

//           return (
//             <Link
//               key={product._id}
//               href={`/frontend/ProductDetail/${product.slug}`}
//               className="group block border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
//             >
//               <div className="relative aspect-square overflow-hidden bg-gray-50">
//                 <img
//                   src={`http://localhost:5000${product.thumbImg}`}
//                   alt={product.name}
//                   className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
//                 />
//                 <img
//                   src={`http://localhost:5000${product.galleryImg?.[1] || product.thumbImg}`}
//                   alt={product.name}
//                   className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//                 />
//               </div>

//               <div className="p-4">
//                 <h4 className="text-md font-semibold text-gray-900 line-clamp-2 mb-1">
//                   {product.name}
//                 </h4>


//                 {/* <div className="flex space-x-1 my-2">
//                   {product.variant.slice(0, 3).map((v, idx) => (
//                     <button
//                       type="button"
//                       key={idx}
//                       onClick={(e) => {
//                         e.preventDefault();
//                         handleVariantClick(product._id, idx);
//                       }}
//                       className={`w-4 h-4 rounded-full border ${
//                         selectedIndex === idx ? 'border-gray-900' : 'border-gray-300'
//                       }`}
//                       style={{ backgroundColor: v.colorcode }}
//                       title={v.color}
//                     />
//                   ))}
//                   {product.variant.length > 3 && (
//                     <div className="w-4 h-4 bg-gray-200 text-[10px] flex items-center justify-center rounded-full">
//                       +{product.variant.length - 3}
//                     </div>
//                   )}
//                 </div> */}

//                 <div className="flex items-center gap-2 mb-2">
//                   <span className="text-xl font-bold text-gray-900">₹{variant.discountPrice}</span>
//                   {variant.price > variant.discountPrice && (
//                     <>
//                       <span className="text-lg text-gray-500 line-through">₹{variant.price}</span>
//                       <span className="text-xs font-medium text-red-600">
//                         {getDiscountPercentage(variant.price, variant.discountPrice)}% OFF
//                       </span>
//                     </>
//                   )}
//                 </div>

//                 <div className="my-3">
//                   <button
//                     onClick={() => handleAddToCart(product)}
//                     className="w-full py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
//                   >
//                     Add to Cart
//                   </button>
//                 </div>
//               </div>
//             </Link>
//           );
//         })}
//       </div>

//       {activeProducts.length > 0 && (
//         <div className="mt-8 text-center">
//           <Link
//             href="/frontend/view-all"
//             className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition"
//           >
//             View all {activeCategory?.name}
//             <svg
//               className="w-4 h-4 ml-1"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//             </svg>
//           </Link>
//         </div>
//       )}
//     </section>
//   );
// };

// export default CategoryShowcase;



'use client';

import React, { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { AppContext } from '../context/AppContext';
import { FiCheck } from 'react-icons/fi';

const CategoryShowcase = () => {
  const {
    addToCart,
    categories,
    products,
    toggleWishlist,
    isInWishlist
  } = useContext(AppContext);

  const [selectedVariants, setSelectedVariants] = useState({});
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [addedToCartStates, setAddedToCartStates] = useState({}); // New state for cart animation

  // ✅ Set default category
  useEffect(() => {
    if (categories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categories[0]._id);
    }
  }, [categories, activeCategoryId]);

  // Initialize cart states when products change
  useEffect(() => {
    const initialCartStates = {};
    if (activeCategoryId) {
      const activeProducts = getProductsByCategory(activeCategoryId);
      activeProducts.forEach(product => {
        initialCartStates[product._id] = false;
      });
      setAddedToCartStates(initialCartStates);
    }
  }, [activeCategoryId, products]);

  const getProductsByCategory = (categoryId) => {
    if (!categoryId) return [];

    return products
      .filter(
        (product) =>
          Array.isArray(product.category) &&
          product.category.some(
            (catId) => catId?.toString() === categoryId.toString()
          )
      )
      .sort((a, b) => {
        const priority = (product) => {
          if (product.section?.includes('bestseller')) return 0;
          if (product.section?.includes('newarrival')) return 1;
          return 2;
        };
        return priority(a) - priority(b);
      })
      .slice(0, 8);
  };

  const getDiscountPercentage = (price, discountPrice) =>
    Math.round(((price - discountPrice) / price) * 100);

  const handleVariantClick = (productId, variantIndex) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variantIndex }));
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
    
    // Reset cart state after 3 seconds
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

  const activeCategory = categories.find((c) => c._id === activeCategoryId);
  const activeProducts = getProductsByCategory(activeCategoryId);

  if (categories.length === 0 || !activeCategoryId) {
    return <p className="text-center py-10">Loading categories...</p>;
  }

  return (
    <section className=" mx-auto px-2 max-w-8xl   sm:px-6 lg:px-16 sm:py-12 py-6 ">
      {/* Section Heading */}
      <div className="text-center sm:mb-10 mb-5">
        <h2 className="sm:text-5xl text-2xl font-bold text-center sm:mb-6 mb-4 uppercase text-black">SHOP BY STYLE</h2>
        <p className="text-gray-600 sm:text-lg text-sm">
         Discover the latest Syuta bags, styled for every occasion.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center flex-wrap gap-4 sm:mb-10 mb-6">
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => setActiveCategoryId(category._id)}
            className={`px-5 py-2 text-sm font-medium rounded-full border transition-all ${activeCategoryId === category._id
              ? 'bg-[#D4AF37] text-white border-[#D4AF37] shadow-md'
              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
              }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {activeProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 sm:gap-8 gap-2">
          {activeProducts.map((product) => {
            const selectedIndex = selectedVariants[product._id] ?? 0;
            const variant = product.variant?.[selectedIndex];

            // check both product stock and variant stock
            const outOfStock = product.stock <= 0;
            const displayPrice = product.discountPrice || product.price;
            const hasDiscount = product.discountPrice && product.discountPrice < product.price;
            const addedToCart = addedToCartStates[product._id] || false;
            const isWishlisted = isInWishlist(product._id);

            return (
              <div
                key={product._id}
                className="group border border-[#D4AF37] rounded-md overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <Link href={`/product/${product.slug}`}>
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <img
                      src={`http://localhost:5000${product.thumbImg}`}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                    />
                    <img
                      src={`http://localhost:5000${product.galleryImg?.[1] || product.thumbImg
                        }`}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />

                    {/* Low Stock Badge */}
                    {product.stock < 10 && product.stock > 0 && (
                      <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
                        Low Stock
                      </div>
                    )}

                    {/* Out of Stock Badge */}
                    {outOfStock && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
                          Out of Stock
                        </span>
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => handleToggleWishlist(product, e)}
                      className={`absolute top-2 left-2 p-2 rounded-full transition-colors z-10 ${isWishlisted
                          ? 'bg-red-500 text-white shadow-lg'
                          : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
                        }`}
                      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <svg
                        className="w-4 h-4"
                        fill={isWishlisted ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </Link>

                <div className="p-4">
                  <Link href={`/frontend/ProductDetail/${product.slug}`}>
                    <h4 className="sm:text-md text-sm font-semibold capitalize text-gray-900 line-clamp-2 mb-3 hover:text-gray-700 transition">
                      {product.name}
                    </h4>
                  </Link>

                  {product.pack && (
                    <p className="text-sm text-gray-500 mb-3">Pack: {product.pack}</p>
                  )}

                  {/* Price Section */}
                  <div className="flex items-center justify-between mt-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-[#D4AF37]">
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
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.sku}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={outOfStock || addedToCart}
                    className={`w-full py-2 text-sm rounded-md transition-all duration-300 font-medium flex items-center justify-center gap-2 ${outOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : addedToCart
                      ? 'bg-[#D4AF37] text-white'
                      : 'bg-[#D4AF37] text-white hover:bg-[#D4AF37]'
                      }`}
                  >
                    {outOfStock ? (
                      'Out of Stock'
                    ) : addedToCart ? (
                      <>
                        <FiCheck size={18} className="animate-pulse" />
                        <span>Added</span>
                      </>
                    ) : (
                      'Add to Cart'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500">No products found.</p>
      )}

      {activeProducts.length > 0 && (
        <div className="sm:mt-8 mt-4 text-center ">
          <Link
            href="/all-products"
            className="inline-flex items-center  text-sm font-medium text-[#D4AF37] hover:text-[#D4AF37] transition"
          >
            View all 
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      )}
    </section>
  );
};

export default CategoryShowcase;
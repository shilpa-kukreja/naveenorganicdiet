// "use client";

// import Footer from "@/app/componats/Footer";
// import Header from "@/app/componats/Header";
// import { AppContext } from "@/app/context/AppContext";
// import Link from "next/link";
// import { useParams } from "next/navigation";
// import { useContext, useEffect, useState, useMemo, useCallback } from "react";
// import { FiGrid, FiList, FiFilter, FiShoppingBag, FiSearch, FiArrowUp ,FiHeart} from "react-icons/fi";

// export default function CategoryProductsPage() {
//   const params = useParams();
//   const { slug } = params;
//   const { categories, products } = useContext(AppContext);
//   const [loading, setLoading] = useState(true);
//   const [viewMode, setViewMode] = useState('grid');
//   const [sortBy, setSortBy] = useState('default');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showScrollTop, setShowScrollTop] = useState(false);
//   const [visibleProducts, setVisibleProducts] = useState(12); // Initial load count

//   // Find current category by slug
//   const category = useMemo(() => {
//     return categories.find(cat => cat.slug === slug || cat._id === slug);
//   }, [categories, slug]);

//   // Filter products by category
//   const categoryProducts = useMemo(() => {
//     if (!category || !products.length) return [];

//     return products.filter(product => {
//       if (Array.isArray(product.category)) {
//         return product.category.some(cat => {
//           const categoryId = cat.$oid || cat._id || cat;
//           return categoryId === category._id;
//         });
//       }

//       const singleCategoryId =
//         typeof product.category === 'string' ? product.category :
//           product.category?.$oid || product.category?._id;

//       return singleCategoryId === category._id;
//     });
//   }, [products, category]);

//   // Filter by search query
//   const filteredProducts = useMemo(() => {
//     if (!searchQuery) return categoryProducts;

//     const query = searchQuery.toLowerCase();
//     return categoryProducts.filter(product =>
//       product.name.toLowerCase().includes(query) ||
//       product.description?.toLowerCase().includes(query) ||
//       product.sku?.toLowerCase().includes(query)
//     );
//   }, [categoryProducts, searchQuery]);

//   // Sort products
//   const sortedProducts = useMemo(() => {
//     const productsToSort = [...filteredProducts];

//     switch (sortBy) {
//       case 'price-low':
//         return productsToSort.sort((a, b) =>
//           (a.discountPrice || a.price) - (b.discountPrice || b.price)
//         );
//       case 'price-high':
//         return productsToSort.sort((a, b) =>
//           (b.discountPrice || b.price) - (a.discountPrice || a.price)
//         );
//       case 'name':
//         return productsToSort.sort((a, b) =>
//           a.name.localeCompare(b.name)
//         );
//       case 'newest':
//         return productsToSort.sort((a, b) =>
//           new Date(b.createdAt) - new Date(a.createdAt)
//         );
//       default:
//         return productsToSort;
//     }
//   }, [filteredProducts, sortBy]);

//   // Products to display (for infinite scroll)
//   const displayProducts = useMemo(() => {
//     return sortedProducts.slice(0, visibleProducts);
//   }, [sortedProducts, visibleProducts]);

//   // Infinite scroll handler
//   const handleScroll = useCallback(() => {
//     if (window.innerHeight + document.documentElement.scrollTop
//       !== document.documentElement.offsetHeight) return;

//     if (visibleProducts < sortedProducts.length) {
//       setVisibleProducts(prev => Math.min(prev + 12, sortedProducts.length));
//     }

//     // Show/hide scroll to top button
//     setShowScrollTop(window.pageYOffset > 400);
//   }, [visibleProducts, sortedProducts.length]);

//   // Scroll to top function
//   const scrollToTop = useCallback(() => {
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   }, []);

//   useEffect(() => {
//     const timer = setTimeout(() => setLoading(false), 800);
//     return () => clearTimeout(timer);
//   }, []);

//   useEffect(() => {
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, [handleScroll]);

//   useEffect(() => {
//     // Reset visible products when category changes
//     setVisibleProducts(12);
//     setSearchQuery('');
//   }, [category?._id]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex flex-col">
//         <Header />
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
//             <p className="text-gray-600">Loading {category?.name} products...</p>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   if (!category) {
//     return (
//       <div className="min-h-screen flex flex-col">
//         <Header />
//         <div className="flex-1 bg-gray-50 py-8">
//           <div className="container mx-auto px-4">
//             <div className="text-center py-16">
//               <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
//                 <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
//                   <FiShoppingBag size={32} className="text-red-400" />
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                   Category Not Found
//                 </h3>
//                 <p className="text-gray-600 mb-6">
//                   The category "{slug}" does not exist or has been removed.
//                 </p>
//                 <button
//                   onClick={() => window.history.back()}
//                   className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
//                 >
//                   Go Back
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Header />

//       <main className="flex-1 bg-gray-50">
//         <section className="py-8">
//           <div className="container mx-auto px-4">
//             {/* Header Section */}
//             <div className="mb-8">
//               <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
//                 <a href="/" className="hover:text-green-600 transition-colors">Home</a>
//                 <span>/</span>
//                 <a href="/categories" className="hover:text-green-600 transition-colors">Categories</a>
//                 <span>/</span>
//                 <span className="text-gray-900 font-medium">{category.name}</span>
//               </nav>

//               <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
//                 <div>
//                   <h1 className="text-4xl font-bold text-gray-900 mb-2">
//                     {category.name}
//                   </h1>
//                   <p className="text-gray-600 text-lg">
//                     Discover {sortedProducts.length} premium product{sortedProducts.length !== 1 ? 's' : ''}
//                   </p>
//                 </div>

//                 {/* Search Bar */}
//                 <div className="relative w-full lg:w-80">
//                   <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                   <input
//                     type="text"
//                     placeholder="Search products..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Controls Bar */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
//               <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//                 <div className="flex items-center space-x-6">
//                   <div className="flex items-center space-x-3">
//                     <span className="text-sm font-medium text-gray-700">View:</span>
//                     <div className="flex border border-gray-300 rounded-lg overflow-hidden">
//                       <button
//                         onClick={() => setViewMode('grid')}
//                         className={`p-3 transition-all ${viewMode === 'grid'
//                           ? 'bg-green-600 text-white shadow-md'
//                           : 'bg-white text-gray-600 hover:bg-gray-50'
//                           }`}
//                       >
//                         <FiGrid size={18} />
//                       </button>
//                       <button
//                         onClick={() => setViewMode('list')}
//                         className={`p-3 transition-all ${viewMode === 'list'
//                           ? 'bg-green-600 text-white shadow-md'
//                           : 'bg-white text-gray-600 hover:bg-gray-50'
//                           }`}
//                       >
//                         <FiList size={18} />
//                       </button>
//                     </div>
//                   </div>

//                   <div className="text-sm text-gray-600">
//                     Showing {Math.min(visibleProducts, displayProducts.length)} of {sortedProducts.length} products
//                     {searchQuery && ` for "${searchQuery}"`}
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-4">
//                   <span className="text-sm font-medium text-gray-700">Sort by:</span>
//                   <select
//                     value={sortBy}
//                     onChange={(e) => setSortBy(e.target.value)}
//                     className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
//                   >
//                     <option value="default">Featured</option>
//                     <option value="newest">Newest First</option>
//                     <option value="name">Name A-Z</option>
//                     <option value="price-low">Price: Low to High</option>
//                     <option value="price-high">Price: High to Low</option>
//                   </select>
//                 </div>
//               </div>
//             </div>

//             {/* Products Section */}
//             {displayProducts.length === 0 ? (
//               <div className="text-center py-16">
//                 <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 max-w-2xl mx-auto">
//                   <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
//                     <FiFilter size={32} className="text-gray-400" />
//                   </div>
//                   <h3 className="text-2xl font-semibold text-gray-900 mb-3">
//                     No Products Found
//                   </h3>
//                   <p className="text-gray-600 mb-4 text-lg">
//                     {searchQuery
//                       ? `No products found for "${searchQuery}" in ${category.name}`
//                       : `There are no products available in ${category.name} yet.`
//                     }
//                   </p>
//                   <div className="flex flex-col sm:flex-row gap-3 justify-center">
//                     <button
//                       onClick={() => window.history.back()}
//                       className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
//                     >
//                       Go Back
//                     </button>
//                     <button
//                       onClick={() => window.location.href = '/categories'}
//                       className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
//                     >
//                       Browse Categories
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <>
//                 <div className={
//                   viewMode === 'grid'
//                     ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
//                     : "space-y-4"
//                 }>
//                   {displayProducts.map((product) => (
//                     <ProductCard
//                       key={product._id}
//                       product={product}
//                       viewMode={viewMode}
//                     />
//                   ))}
//                 </div>

//                 {/* Load More Indicator */}
//                 {visibleProducts < sortedProducts.length && (
//                   <div className="text-center mt-12">
//                     <div className="inline-flex items-center space-x-2 text-gray-600">
//                       <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
//                       <span>Loading more products...</span>
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </section>
//       </main>

//       {/* Scroll to Top Button */}
//       {showScrollTop && (
//         <button
//           onClick={scrollToTop}
//           className="fixed bottom-8 right-8 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 z-50 hover:scale-110"
//           aria-label="Scroll to top"
//         >
//           <FiArrowUp size={20} />
//         </button>
//       )}

//       <Footer />
//     </div>
//   );
// }

// // Optimized Product Card Component with Lazy Loading
// const ProductCard = ({ product, viewMode }) => {
//   const [imageLoaded, setImageLoaded] = useState(false);
//   const [imageError, setImageError] = useState(false);
//   const {
//     categories,
//     products,
//     addToCart,
//     wishlist,
//     toggleWishlist,
//     isInWishlist
//   } = useContext(AppContext);

//   const hasDiscount = product.discountPrice && product.discountPrice < product.price;
//   const discountPercentage = hasDiscount
//     ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
//     : 0;

//   const handleImageLoad = () => {
//     setImageLoaded(true);
//   };

//   const handleAddToCart = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     addToCart(product, product.discountPrice || product.price, 1);
//   };

//   const isWishlisted = isInWishlist(product._id);

//   const handleToggleWishlist = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     toggleWishlist(product);
//   };

//   const handleImageError = () => {
//     setImageError(true);
//     setImageLoaded(true);
//   };

//   if (viewMode === 'list') {
//     return (
//       <div className="bg-white rounded-md shadow-md hover:shadow-xl transition-all duration-300 border border-[#00a63d] p-6 group hover:border-[#00a63d]">
//         <div className="flex flex-col lg:flex-row lg:items-center gap-6">
//           <div className="relative flex-shrink-0">
//             <div className={`w-full lg:w-56 h-56 bg-gray-100 rounded-xl overflow-hidden ${!imageLoaded ? 'animate-pulse' : ''}`}>
//               {!imageError ? (
//                 <Link href={`/product/${product.slug}`}>
//                 <img
//                   src={`http://localhost:5000${product.thumbImg}`}
//                   className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
//                     } group-hover:scale-105 transition-transform duration-500`}
//                   alt={product.name}
//                   onLoad={handleImageLoad}
//                   onError={handleImageError}
//                   loading="lazy"
//                 />
//                 </Link>
//               ) : (
//                 <div className="w-full h-full bg-gray-200 flex items-center justify-center">
//                   <FiShoppingBag size={32} className="text-gray-400" />
//                 </div>
//               )}
//             </div>
//             {/* {hasDiscount && (
//               <span className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
//                 {discountPercentage}% OFF
//               </span>
//             )} */}
//             {product.stock < 10 && product.stock > 0 && (
//               <span className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
//                 Low Stock
//               </span>
//             )}
//           </div>

//           <div className="flex-1">
//             <div className="flex items-start justify-between mb-2">
//               <h2 className="text-xl font-semibold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2">
//                 {product.name}
//               </h2>
//               {product.sku && (
//                 <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-2 flex-shrink-0">
//                   SKU: {product.sku}
//                 </span>
//               )}
//             </div>

//             <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
//               {product.description || "Premium quality product with excellent features and customer satisfaction guarantee."}
//             </p>

//             <div className="flex items-center flex-wrap gap-3 mb-4">
//               <span className="text-2xl font-bold text-green-600">
//                 ₹{product.discountPrice || product.price}
//               </span>
//               {hasDiscount && (
//                 <>
//                   <span className="text-lg text-gray-500 line-through">
//                     ₹{product.price}
//                   </span>
//                   <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
//                     Save ₹{product.price - product.discountPrice}
//                   </span>
//                 </>
//               )}
//             </div>

//             <div className="flex items-center space-x-3">
//               <button onClick={handleAddToCart} className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg">
//                 Add to Cart
//               </button>
//               <button
//                 onClick={handleToggleWishlist}
//                 className={`px-4 py-3 border rounded-lg transition-colors flex items-center justify-center ${isWishlisted
//                     ? 'border-red-500 text-red-600 bg-red-50'
//                     : 'border-gray-300 hover:border-green-500 hover:text-green-600'
//                   }`}
//               >
//                 <FiHeart size={20} className={isWishlisted ? 'fill-current' : ''} />
//               </button>
//             </div>

//             {product.pack && (
//               <div className="mt-3 text-sm text-gray-500">
//                 Pack: <span className="font-medium">{product.pack}</span>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Grid View
//   return (
//     <div className="bg-white rounded-xl shadow-sm  transition-all duration-300 border border-[#00a63d] overflow-hidden group hover:border-[#00a63d]">
//        <Link href={`/product/${product.slug}`}>
//       <div className="relative overflow-hidden">

//         <div className={`w-full  bg-gray-100 ${!imageLoaded ? 'animate-pulse' : ''}`}>
//           {!imageError ? (
//             <img
//               src={`http://localhost:5000${product.thumbImg}`}
//               className={`w-full h-72 object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'
//                 } group-hover:scale-110`}
//               alt={product.name}
//               onLoad={handleImageLoad}
//               onError={handleImageError}
//               loading="lazy"
//             />
//           ) : (
//             <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
//               <FiShoppingBag size={48} className="text-gray-400" />
//             </div>
//           )}
//         </div>

//         {/* {hasDiscount && (
//           <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
//             {discountPercentage}% OFF
//           </div>
//         )} */}

//         {product.stock < 10 && product.stock > 0 && (
//           <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
//             Low Stock
//           </div>
//         )}

//         <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300" />
//       </div>
//       </Link>

//       <div className="p-5">
//         <h2 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] group-hover:text-green-700 transition-colors">
//           {product.name}
//         </h2>

//         {product.pack && (
//           <p className="text-sm text-gray-500 mb-3">Pack: {product.pack}</p>
//         )}

//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center space-x-2">
//             <span className="text-xl font-bold text-green-600">
//               ₹{product.discountPrice || product.price}
//             </span>
//             {hasDiscount && (
//               <span className="text-sm text-gray-500 line-through">
//                 ₹{product.price}
//               </span>
//             )}
//           </div>

//           {product.sku && (
//             <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
//               {product.sku}
//             </span>
//           )}
//         </div>

//         <div className="flex space-x-2">
//           <button onClick={handleAddToCart} className="flex-1 bg-[#00a63d] text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg">
//             Add to Cart
//           </button>
//            <button
//                 onClick={handleToggleWishlist}
//                 className={`px-4 py-3 border rounded-lg transition-colors flex items-center justify-center ${isWishlisted
//                     ? 'border-red-500 text-red-600 bg-red-50'
//                     : 'border-gray-300 hover:border-green-500 hover:text-green-600'
//                   }`}
//               >
//                 <FiHeart size={20} className={isWishlisted ? 'fill-current' : ''} />
//               </button>
//         </div>
//       </div>
//     </div>
//   );
// };


// "use client";

// import Footer from "@/app/componats/Footer";
// import Header from "@/app/componats/Header";
// import { AppContext } from "@/app/context/AppContext";
// import Link from "next/link";
// import { useParams } from "next/navigation";
// import { useContext, useEffect, useState, useMemo, useCallback } from "react";
// import { FiGrid, FiList, FiFilter, FiShoppingBag, FiSearch, FiArrowUp ,FiHeart} from "react-icons/fi";

// export default function CategoryProductsPage() {
//   const params = useParams();
//   const { slug } = params;
//   const { categories, products } = useContext(AppContext);
//   const [loading, setLoading] = useState(true);
//   const [viewMode, setViewMode] = useState('grid');
//   const [sortBy, setSortBy] = useState('default');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showScrollTop, setShowScrollTop] = useState(false);
//   const [visibleProducts, setVisibleProducts] = useState(12); // Initial load count

//   // Skeleton Loader Component
//   const SkeletonLoader = () => (
//     <div className="min-h-screen flex flex-col">
//       <Header />

//       <main className="flex-1 bg-gray-50">
//         <section className="py-8">
//           <div className="container mx-auto px-4">
//             {/* Header Section Skeleton */}
//             <div className="mb-8">
//               {/* Breadcrumb Skeleton */}
//               <div className="flex items-center space-x-2 mb-4">
//                 <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
//                 <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
//                 <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
//                 <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
//                 <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
//               </div>

//               {/* Title and Search Skeleton */}
//               <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
//                 <div className="space-y-2">
//                   <div className="h-10 w-64 bg-gray-300 rounded animate-pulse"></div>
//                   <div className="h-6 w-96 bg-gray-200 rounded animate-pulse"></div>
//                 </div>
//                 <div className="h-12 w-full lg:w-80 bg-gray-200 rounded-lg animate-pulse"></div>
//               </div>
//             </div>

//             {/* Controls Bar Skeleton */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
//               <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//                 <div className="flex items-center space-x-6">
//                   <div className="flex items-center space-x-3">
//                     <div className="h-5 w-12 bg-gray-200 rounded animate-pulse"></div>
//                     <div className="flex border border-gray-300 rounded-lg overflow-hidden">
//                       <div className="p-3 bg-gray-100">
//                         <div className="h-5 w-5 bg-gray-300 rounded animate-pulse"></div>
//                       </div>
//                       <div className="p-3 bg-gray-100">
//                         <div className="h-5 w-5 bg-gray-300 rounded animate-pulse"></div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
//                 </div>

//                 <div className="flex items-center space-x-4">
//                   <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
//                   <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
//                 </div>
//               </div>
//             </div>

//             {/* Products Grid Skeleton */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//               {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
//                 <div key={item} className="bg-white rounded-xl shadow-sm border border-[#00a63d] overflow-hidden animate-pulse">
//                   <div className="w-full h-72 bg-gray-200"></div>
//                   <div className="p-5">
//                     <div className="h-5 w-3/4 bg-gray-200 rounded mb-3"></div>
//                     <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>

//                     <div className="flex items-center justify-between mb-4">
//                       <div className="flex items-center space-x-2">
//                         <div className="h-6 w-20 bg-gray-300 rounded"></div>
//                         <div className="h-4 w-16 bg-gray-200 rounded"></div>
//                       </div>
//                       <div className="h-5 w-16 bg-gray-200 rounded"></div>
//                     </div>

//                     <div className="flex space-x-2">
//                       <div className="flex-1 h-12 bg-gray-300 rounded-lg"></div>
//                       <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>
//       </main>

//       <Footer />
//     </div>
//   );

//   // Find current category by slug
//   const category = useMemo(() => {
//     return categories.find(cat => cat.slug === slug || cat._id === slug);
//   }, [categories, slug]);

//   // Filter products by category
//   const categoryProducts = useMemo(() => {
//     if (!category || !products.length) return [];

//     return products.filter(product => {
//       if (Array.isArray(product.category)) {
//         return product.category.some(cat => {
//           const categoryId = cat.$oid || cat._id || cat;
//           return categoryId === category._id;
//         });
//       }

//       const singleCategoryId =
//         typeof product.category === 'string' ? product.category :
//           product.category?.$oid || product.category?._id;

//       return singleCategoryId === category._id;
//     });
//   }, [products, category]);

//   // Filter by search query
//   const filteredProducts = useMemo(() => {
//     if (!searchQuery) return categoryProducts;

//     const query = searchQuery.toLowerCase();
//     return categoryProducts.filter(product =>
//       product.name.toLowerCase().includes(query) ||
//       product.description?.toLowerCase().includes(query) ||
//       product.sku?.toLowerCase().includes(query)
//     );
//   }, [categoryProducts, searchQuery]);

//   // Sort products
//   const sortedProducts = useMemo(() => {
//     const productsToSort = [...filteredProducts];

//     switch (sortBy) {
//       case 'price-low':
//         return productsToSort.sort((a, b) =>
//           (a.discountPrice || a.price) - (b.discountPrice || b.price)
//         );
//       case 'price-high':
//         return productsToSort.sort((a, b) =>
//           (b.discountPrice || b.price) - (a.discountPrice || a.price)
//         );
//       case 'name':
//         return productsToSort.sort((a, b) =>
//           a.name.localeCompare(b.name)
//         );
//       case 'newest':
//         return productsToSort.sort((a, b) =>
//           new Date(b.createdAt) - new Date(a.createdAt)
//         );
//       default:
//         return productsToSort;
//     }
//   }, [filteredProducts, sortBy]);

//   // Products to display (for infinite scroll)
//   const displayProducts = useMemo(() => {
//     return sortedProducts.slice(0, visibleProducts);
//   }, [sortedProducts, visibleProducts]);

//   // Infinite scroll handler
//   const handleScroll = useCallback(() => {
//     if (window.innerHeight + document.documentElement.scrollTop
//       !== document.documentElement.offsetHeight) return;

//     if (visibleProducts < sortedProducts.length) {
//       setVisibleProducts(prev => Math.min(prev + 12, sortedProducts.length));
//     }

//     // Show/hide scroll to top button
//     setShowScrollTop(window.pageYOffset > 400);
//   }, [visibleProducts, sortedProducts.length]);

//   // Scroll to top function
//   const scrollToTop = useCallback(() => {
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   }, []);

//   useEffect(() => {
//     const timer = setTimeout(() => setLoading(false), 800);
//     return () => clearTimeout(timer);
//   }, []);

//   useEffect(() => {
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, [handleScroll]);

//   useEffect(() => {
//     // Reset visible products when category changes
//     setVisibleProducts(12);
//     setSearchQuery('');
//   }, [category?._id]);

//   // Show skeleton loader while loading
//   if (loading) {
//     return <SkeletonLoader />;
//   }

//   if (!category) {
//     return (
//       <div className="min-h-screen flex flex-col">
//         <Header />
//         <div className="flex-1 bg-gray-50 py-8">
//           <div className="container mx-auto px-4">
//             <div className="text-center py-16">
//               <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
//                 <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
//                   <FiShoppingBag size={32} className="text-red-400" />
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                   Category Not Found
//                 </h3>
//                 <p className="text-gray-600 mb-6">
//                   The category "{slug}" does not exist or has been removed.
//                 </p>
//                 <button
//                   onClick={() => window.history.back()}
//                   className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
//                 >
//                   Go Back
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Header />

//       <main className="flex-1 bg-gray-50">
//         <section className="py-8">
//           <div className="container mx-auto px-4">
//             {/* Header Section */}
//             <div className="mb-8">
//               <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
//                 <a href="/" className="hover:text-green-600 transition-colors">Home</a>
//                 <span>/</span>
//                 <a href="/categories" className="hover:text-green-600 transition-colors">Categories</a>
//                 <span>/</span>
//                 <span className="text-gray-900 font-medium">{category.name}</span>
//               </nav>

//               <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
//                 <div>
//                   <h1 className="text-4xl font-bold text-gray-900 mb-2">
//                     {category.name}
//                   </h1>
//                   <p className="text-gray-600 text-lg">
//                     Discover {sortedProducts.length} premium product{sortedProducts.length !== 1 ? 's' : ''}
//                   </p>
//                 </div>

//                 {/* Search Bar */}
//                 <div className="relative w-full lg:w-80">
//                   <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                   <input
//                     type="text"
//                     placeholder="Search products..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Controls Bar */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
//               <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//                 <div className="flex items-center space-x-6">
//                   <div className="flex items-center space-x-3">
//                     <span className="text-sm font-medium text-gray-700">View:</span>
//                     <div className="flex border border-gray-300 rounded-lg overflow-hidden">
//                       <button
//                         onClick={() => setViewMode('grid')}
//                         className={`p-3 transition-all ${viewMode === 'grid'
//                           ? 'bg-green-600 text-white shadow-md'
//                           : 'bg-white text-gray-600 hover:bg-gray-50'
//                           }`}
//                       >
//                         <FiGrid size={18} />
//                       </button>
//                       <button
//                         onClick={() => setViewMode('list')}
//                         className={`p-3 transition-all ${viewMode === 'list'
//                           ? 'bg-green-600 text-white shadow-md'
//                           : 'bg-white text-gray-600 hover:bg-gray-50'
//                           }`}
//                       >
//                         <FiList size={18} />
//                       </button>
//                     </div>
//                   </div>

//                   <div className="text-sm text-gray-600">
//                     Showing {Math.min(visibleProducts, displayProducts.length)} of {sortedProducts.length} products
//                     {searchQuery && ` for "${searchQuery}"`}
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-4">
//                   <span className="text-sm font-medium text-gray-700">Sort by:</span>
//                   <select
//                     value={sortBy}
//                     onChange={(e) => setSortBy(e.target.value)}
//                     className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
//                   >
//                     <option value="default">Featured</option>
//                     <option value="newest">Newest First</option>
//                     <option value="name">Name A-Z</option>
//                     <option value="price-low">Price: Low to High</option>
//                     <option value="price-high">Price: High to Low</option>
//                   </select>
//                 </div>
//               </div>
//             </div>

//             {/* Products Section */}
//             {displayProducts.length === 0 ? (
//               <div className="text-center py-16">
//                 <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 max-w-2xl mx-auto">
//                   <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
//                     <FiFilter size={32} className="text-gray-400" />
//                   </div>
//                   <h3 className="text-2xl font-semibold text-gray-900 mb-3">
//                     No Products Found
//                   </h3>
//                   <p className="text-gray-600 mb-4 text-lg">
//                     {searchQuery
//                       ? `No products found for "${searchQuery}" in ${category.name}`
//                       : `There are no products available in ${category.name} yet.`
//                     }
//                   </p>
//                   <div className="flex flex-col sm:flex-row gap-3 justify-center">
//                     <button
//                       onClick={() => window.history.back()}
//                       className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
//                     >
//                       Go Back
//                     </button>
//                     <button
//                       onClick={() => window.location.href = '/categories'}
//                       className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
//                     >
//                       Browse Categories
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <>
//                 <div className={
//                   viewMode === 'grid'
//                     ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
//                     : "space-y-4"
//                 }>
//                   {displayProducts.map((product) => (
//                     <ProductCard
//                       key={product._id}
//                       product={product}
//                       viewMode={viewMode}
//                     />
//                   ))}
//                 </div>

//                 {/* Load More Indicator */}
//                 {visibleProducts < sortedProducts.length && (
//                   <div className="text-center mt-12">
//                     <div className="inline-flex items-center space-x-2 text-gray-600">
//                       <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
//                       <span>Loading more products...</span>
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </section>
//       </main>

//       {/* Scroll to Top Button */}
//       {showScrollTop && (
//         <button
//           onClick={scrollToTop}
//           className="fixed bottom-8 right-8 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 z-50 hover:scale-110"
//           aria-label="Scroll to top"
//         >
//           <FiArrowUp size={20} />
//         </button>
//       )}

//       <Footer />
//     </div>
//   );
// }

// // Optimized Product Card Component with Lazy Loading
// const ProductCard = ({ product, viewMode }) => {
//   const [imageLoaded, setImageLoaded] = useState(false);
//   const [imageError, setImageError] = useState(false);
//   const {
//     categories,
//     products,
//     addToCart,
//     wishlist,
//     toggleWishlist,
//     isInWishlist
//   } = useContext(AppContext);

//   const hasDiscount = product.discountPrice && product.discountPrice < product.price;
//   const discountPercentage = hasDiscount
//     ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
//     : 0;

//   const handleImageLoad = () => {
//     setImageLoaded(true);
//   };

//   const handleAddToCart = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     addToCart(product, product.discountPrice || product.price, 1);
//   };

//   const isWishlisted = isInWishlist(product._id);

//   const handleToggleWishlist = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     toggleWishlist(product);
//   };

//   const handleImageError = () => {
//     setImageError(true);
//     setImageLoaded(true);
//   };

//   if (viewMode === 'list') {
//     return (
//       <div className="bg-white rounded-md shadow-md hover:shadow-xl transition-all duration-300 border border-[#00a63d] p-6 group hover:border-[#00a63d]">
//         <div className="flex flex-col lg:flex-row lg:items-center gap-6">
//           <div className="relative flex-shrink-0">
//             <div className={`w-full lg:w-56 h-56 bg-gray-100 rounded-xl overflow-hidden ${!imageLoaded ? 'animate-pulse' : ''}`}>
//               {!imageError ? (
//                 <Link href={`/product/${product.slug}`}>
//                 <img
//                   src={`http://localhost:5000${product.thumbImg}`}
//                   className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
//                     } group-hover:scale-105 transition-transform duration-500`}
//                   alt={product.name}
//                   onLoad={handleImageLoad}
//                   onError={handleImageError}
//                   loading="lazy"
//                 />
//                 </Link>
//               ) : (
//                 <div className="w-full h-full bg-gray-200 flex items-center justify-center">
//                   <FiShoppingBag size={32} className="text-gray-400" />
//                 </div>
//               )}
//             </div>
//             {/* {hasDiscount && (
//               <span className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
//                 {discountPercentage}% OFF
//               </span>
//             )} */}
//             {product.stock < 10 && product.stock > 0 && (
//               <span className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
//                 Low Stock
//               </span>
//             )}
//           </div>

//           <div className="flex-1">
//             <div className="flex items-start justify-between mb-2">
//               <h2 className="text-xl font-semibold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2">
//                 {product.name}
//               </h2>
//               {product.sku && (
//                 <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-2 flex-shrink-0">
//                   SKU: {product.sku}
//                 </span>
//               )}
//             </div>

//             <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
//               {product.description || "Premium quality product with excellent features and customer satisfaction guarantee."}
//             </p>

//             <div className="flex items-center flex-wrap gap-3 mb-4">
//               <span className="text-2xl font-bold text-green-600">
//                 ₹{product.discountPrice || product.price}
//               </span>
//               {hasDiscount && (
//                 <>
//                   <span className="text-lg text-gray-500 line-through">
//                     ₹{product.price}
//                   </span>
//                   <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
//                     Save ₹{product.price - product.discountPrice}
//                   </span>
//                 </>
//               )}
//             </div>

//             <div className="flex items-center space-x-3">
//               <button onClick={handleAddToCart} className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg">
//                 Add to Cart
//               </button>
//               <button
//                 onClick={handleToggleWishlist}
//                 className={`px-4 py-3 border rounded-lg transition-colors flex items-center justify-center ${isWishlisted
//                     ? 'border-red-500 text-red-600 bg-red-50'
//                     : 'border-gray-300 hover:border-green-500 hover:text-green-600'
//                   }`}
//               >
//                 <FiHeart size={20} className={isWishlisted ? 'fill-current' : ''} />
//               </button>
//             </div>

//             {product.pack && (
//               <div className="mt-3 text-sm text-gray-500">
//                 Pack: <span className="font-medium">{product.pack}</span>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Grid View
//   return (
//     <div className="bg-white rounded-xl shadow-sm  transition-all duration-300 border border-[#00a63d] overflow-hidden group hover:border-[#00a63d]">
//        <Link href={`/product/${product.slug}`}>
//       <div className="relative overflow-hidden">

//         <div className={`w-full  bg-gray-100 ${!imageLoaded ? 'animate-pulse' : ''}`}>
//           {!imageError ? (
//             <img
//               src={`http://localhost:5000${product.thumbImg}`}
//               className={`w-full h-72 object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'
//                 } group-hover:scale-110`}
//               alt={product.name}
//               onLoad={handleImageLoad}
//               onError={handleImageError}
//               loading="lazy"
//             />
//           ) : (
//             <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
//               <FiShoppingBag size={48} className="text-gray-400" />
//             </div>
//           )}
//         </div>

//         {/* {hasDiscount && (
//           <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
//             {discountPercentage}% OFF
//           </div>
//         )} */}

//         {product.stock < 10 && product.stock > 0 && (
//           <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
//             Low Stock
//           </div>
//         )}

//         <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300" />
//       </div>
//       </Link>

//       <div className="p-5">
//         <h2 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] group-hover:text-green-700 transition-colors">
//           {product.name}
//         </h2>

//         {product.pack && (
//           <p className="text-sm text-gray-500 mb-3">Pack: {product.pack}</p>
//         )}

//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center space-x-2">
//             <span className="text-xl font-bold text-green-600">
//               ₹{product.discountPrice || product.price}
//             </span>
//             {hasDiscount && (
//               <span className="text-sm text-gray-500 line-through">
//                 ₹{product.price}
//               </span>
//             )}
//           </div>

//           {product.sku && (
//             <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
//               {product.sku}
//             </span>
//           )}
//         </div>

//         <div className="flex space-x-2">
//           <button onClick={handleAddToCart} className="flex-1 bg-[#00a63d] text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg">
//             Add to Cart
//           </button>
//            <button
//                 onClick={handleToggleWishlist}
//                 className={`px-4 py-3 border rounded-lg transition-colors flex items-center justify-center ${isWishlisted
//                     ? 'border-red-500 text-red-600 bg-red-50'
//                     : 'border-gray-300 hover:border-green-500 hover:text-green-600'
//                   }`}
//               >
//                 <FiHeart size={20} className={isWishlisted ? 'fill-current' : ''} />
//               </button>
//         </div>
//       </div>
//     </div>
//   );
// };


"use client";

import Footer from "@/app/componats/Footer";
import Header from "@/app/componats/Header";
import { AppContext } from "@/app/context/AppContext";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { FiGrid, FiList, FiFilter, FiShoppingBag, FiSearch, FiArrowUp, FiHeart, FiCheck, FiMenu, FiX, FiChevronRight } from "react-icons/fi";

export default function CategoryProductsPage() {
  const params = useParams();
  const { slug } = params;
  const { categories, products } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [visibleProducts, setVisibleProducts] = useState(12);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <section className="py-4 sm:py-6 md:py-8">
          <div className="container mx-auto px-3 sm:px-4">
            {/* Header Section Skeleton */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center space-x-1 sm:space-x-2 text-sm mb-3 sm:mb-4">
                <div className="h-3 sm:h-4 w-10 sm:w-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 sm:h-4 w-3 sm:w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 sm:h-4 w-20 sm:w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 sm:h-4 w-3 sm:w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-300 rounded animate-pulse"></div>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 sm:gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <div className="h-8 sm:h-10 w-48 sm:w-64 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-4 sm:h-6 w-56 sm:w-96 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-10 sm:h-12 w-full lg:w-72 sm:lg:w-80 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Mobile Controls Skeleton */}
            <div className="lg:hidden flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>

            {/* Desktop Controls Skeleton */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 sm:h-5 w-10 sm:w-12 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                      <div className="p-2 sm:p-3 bg-gray-100">
                        <div className="h-4 sm:h-5 w-4 sm:w-5 bg-gray-300 rounded animate-pulse"></div>
                      </div>
                      <div className="p-2 sm:p-3 bg-gray-100">
                        <div className="h-4 sm:h-5 w-4 sm:w-5 bg-gray-300 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  <div className="h-4 sm:h-5 w-32 sm:w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="h-4 sm:h-5 w-12 sm:w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 sm:h-10 w-32 sm:w-40 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Products Grid Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                  <div className="w-full h-48 sm:h-56 md:h-60 lg:h-72 bg-gray-200"></div>
                  <div className="p-3 sm:p-4 md:p-5">
                    <div className="h-4 sm:h-5 w-3/4 bg-gray-200 rounded mb-2 sm:mb-3"></div>
                    <div className="h-3 sm:h-4 w-1/2 bg-gray-200 rounded mb-3 sm:mb-4"></div>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <div className="h-5 sm:h-6 w-14 sm:w-20 bg-gray-300 rounded"></div>
                        <div className="h-3 sm:h-4 w-10 sm:w-16 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-4 sm:h-5 w-12 sm:w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex space-x-1 sm:space-x-2">
                      <div className="flex-1 h-10 sm:h-12 bg-gray-300 rounded-lg"></div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );

  // Find current category by slug
  const category = useMemo(() => {
    return categories.find(cat => cat.slug === slug || cat._id === slug);
  }, [categories, slug]);

  // Filter products by category
  const categoryProducts = useMemo(() => {
    if (!category || !products.length) return [];

    return products.filter(product => {
      if (Array.isArray(product.category)) {
        return product.category.some(cat => {
          const categoryId = cat.$oid || cat._id || cat;
          return categoryId === category._id;
        });
      }

      const singleCategoryId =
        typeof product.category === 'string' ? product.category :
          product.category?.$oid || product.category?._id;

      return singleCategoryId === category._id;
    });
  }, [products, category]);

  // Filter by search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return categoryProducts;

    const query = searchQuery.toLowerCase();
    return categoryProducts.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.sku?.toLowerCase().includes(query)
    );
  }, [categoryProducts, searchQuery]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const productsToSort = [...filteredProducts];

    switch (sortBy) {
      case 'price-low':
        return productsToSort.sort((a, b) =>
          (a.discountPrice || a.price) - (b.discountPrice || b.price)
        );
      case 'price-high':
        return productsToSort.sort((a, b) =>
          (b.discountPrice || b.price) - (a.discountPrice || a.price)
        );
      case 'name':
        return productsToSort.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      case 'newest':
        return productsToSort.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
      default:
        return productsToSort;
    }
  }, [filteredProducts, sortBy]);

  // Products to display
  const displayProducts = useMemo(() => {
    return sortedProducts.slice(0, visibleProducts);
  }, [sortedProducts, visibleProducts]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
    const pageHeight = document.documentElement.offsetHeight - 100;

    if (scrollPosition >= pageHeight && visibleProducts < sortedProducts.length) {
      setVisibleProducts(prev => Math.min(prev + (isMobile ? 8 : 12), sortedProducts.length));
    }

    setShowScrollTop(window.pageYOffset > 400);
  }, [visibleProducts, sortedProducts.length, isMobile]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Mobile sort/filter handlers
  const handleMobileSort = (value) => {
    setSortBy(value);
    setShowMobileFilters(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setVisibleProducts(isMobile ? 8 : 12);
    setSearchQuery('');
  }, [category?._id, isMobile]);

  if (loading) {
    return <SkeletonLoader />;
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 bg-gray-50 py-6 sm:py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-12 sm:py-16">
              <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 md:p-12 max-w-md mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <FiShoppingBag size={24} className="sm:size-28 md:size-32 text-red-400" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                  Category Not Found
                </h3>
                <p className="text-gray-600 text-sm sm:text-base mb-6">
                  The category "{slug}" does not exist or has been removed.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="bg-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm sm:text-base"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50  max-w-8xl  px-4 sm:px-6 lg:px-16 mx-auto">
        <section className="py-4 sm:py-6 md:py-8">
          <div className="container mx-auto px-3 sm:px-4">
            {/* Header Section */}
            <div className="mb-6 sm:mb-8">
              <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 flex-wrap">
                <a href="/" className="hover:text-green-600 transition-colors">Home</a>
                <FiChevronRight size={12} className="flex-shrink-0" />
                <a href="/categories" className="hover:text-green-600 transition-colors">Categories</a>
                <FiChevronRight size={12} className="flex-shrink-0" />
                <span className="text-gray-900 font-medium truncate max-w-[150px] sm:max-w-none">
                  {category.name}
                </span>
              </nav>

              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                    {category.name}
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base md:text-lg">
                    {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''} available
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full lg:w-72 xl:w-80">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="lg:hidden bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">View:</span>
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 sm:p-2.5 transition-all ${viewMode === 'grid'
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        <FiGrid size={16} className="sm:size-[18px]" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 sm:p-2.5 transition-all ${viewMode === 'list'
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        <FiList size={16} className="sm:size-[18px]" />
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FiFilter size={14} className="sm:size-4" />
                    <span>Sort</span>
                  </button>
                </div>
                
                <div className="text-xs sm:text-sm text-gray-600">
                  {Math.min(visibleProducts, displayProducts.length)}/{sortedProducts.length}
                </div>
              </div>
            </div>

            {/* Desktop Controls */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className="text-sm font-medium text-gray-700">View:</span>
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-3 transition-all ${viewMode === 'grid'
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        <FiGrid size={18} />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-3 transition-all ${viewMode === 'list'
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        <FiList size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    Showing {Math.min(visibleProducts, displayProducts.length)} of {sortedProducts.length} products
                    {searchQuery && ` for "${searchQuery}"`}
                  </div>
                </div>

                <div className="flex items-center space-x-3 sm:space-x-4">
                  <span className="text-sm font-medium text-gray-700">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white min-w-[140px] sm:min-w-[160px]"
                  >
                    <option value="default">Featured</option>
                    <option value="newest">Newest First</option>
                    <option value="name">Name A-Z</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile Filter Modal */}
            {showMobileFilters && (
              <div className="fixed inset-0  bg-opacity-50 z-50 lg:hidden">
                <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl animate-slideUp">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Sort Products</h3>
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <FiX size={20} />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {[
                        { value: 'default', label: 'Featured' },
                        { value: 'newest', label: 'Newest First' },
                        { value: 'name', label: 'Name A-Z' },
                        { value: 'price-low', label: 'Price: Low to High' },
                        { value: 'price-high', label: 'Price: High to Low' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleMobileSort(option.value)}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                            sortBy === option.value
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{option.label}</span>
                            {sortBy === option.value && (
                              <FiCheck className="text-green-600" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Products Section */}
            {displayProducts.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 md:p-12 max-w-2xl mx-auto">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FiFilter size={24} className="sm:size-28 md:size-32 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                    No Products Found
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                    {searchQuery
                      ? `No products found for "${searchQuery}" in ${category.name}`
                      : `There are no products available in ${category.name} yet.`
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                    <button
                      onClick={() => window.history.back()}
                      className="bg-gray-200 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={() => window.location.href = '/categories'}
                      className="bg-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm sm:text-base"
                    >
                      Browse Categories
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className={
                  viewMode === 'grid'
                    ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
                    : "space-y-3 sm:space-y-4"
                }>
                  {displayProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      viewMode={viewMode}
                      isMobile={isMobile}
                    />
                  ))}
                </div>

                {/* Load More Indicator */}
                {visibleProducts < sortedProducts.length && (
                  <div className="text-center mt-8 sm:mt-12">
                    <div className="inline-flex items-center space-x-2 text-gray-600">
                      <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-green-600"></div>
                      <span className="text-sm sm:text-base">Loading more products...</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      Scroll down to load more
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {/* Scroll to Top Button */}
      {/* {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-green-600 text-white p-2.5 sm:p-3 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 z-40 hover:scale-110"
          aria-label="Scroll to top"
        >
          <FiArrowUp size={18} className="sm:size-20" />
        </button>
      )} */}

      <Footer />
    </div>
  );
}

// Optimized Product Card Component
const ProductCard = ({ product, viewMode, isMobile }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart, toggleWishlist, isInWishlist } = useContext(AppContext);

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const isWishlisted = isInWishlist(product._id);

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.discountPrice || product.price, 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1000);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-green-300 p-3 sm:p-4 md:p-6 group">
        <div className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 md:gap-6">
          <div className="relative flex-shrink-0">
            <div className={`w-full md:w-48 lg:w-56  bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden ${!imageLoaded ? 'animate-pulse' : ''}`}>
              {!imageError ? (
                <Link href={`/product/${product.slug}`}>
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${product.thumbImg}`}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-105 transition-transform duration-500`}
                    alt={product.name}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading="lazy"
                  />
                </Link>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <FiShoppingBag size={28} className="text-gray-400" />
                </div>
              )}
            </div>
            {product.stock < 10 && product.stock > 0 && (
              <span className="absolute top-2 right-2 bg-orange-500 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                Low Stock
              </span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-1 sm:gap-2">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2">
                {product.name}
              </h2>
              {product.sku && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded self-start">
                  {product.sku}
                </span>
              )}
            </div>

            <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
              {product.description || "Premium quality product with excellent features."}
            </p>

            <div className="flex items-center flex-wrap gap-2 mb-3 sm:mb-4">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                ₹{product.discountPrice || product.price}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm sm:text-lg text-gray-500 line-through">
                    ₹{product.price}
                  </span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                    Save ₹{product.price - product.discountPrice}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleAddToCart}
                className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg  transition-all duration-300 font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base ${
                  addedToCart
                    ? 'bg-green-700 text-white'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {addedToCart ? (
                  <>
                    <FiCheck size={6} className="sm:size-6 animate-pulse" />
                    <span>Added</span>
                  </>
                ) : (
                  <span>Add to Cart</span>
                )}
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg transition-colors flex items-center justify-center ${
                  isWishlisted
                    ? 'border-red-500 text-red-600 bg-red-50'
                    : 'border-gray-300 hover:border-green-500 hover:text-green-600'
                }`}
              >
                <FiHeart size={16} className="sm:size-6" />
              </button>
            </div>

            {product.pack && (
              <div className="mt-2 text-xs sm:text-sm text-gray-500">
                Pack: <span className="font-medium">{product.pack}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-green-300 overflow-hidden group">
      <Link href={`/product/${product.slug}`}>
        <div className="relative overflow-hidden">
          <div className={`w-full h-full  bg-gray-100 ${!imageLoaded ? 'animate-pulse' : ''}`}>
            {!imageError ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${product.thumbImg}`}
                className={`w-full h-full object-cover aspect-square transition-all duration-500 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                } group-hover:scale-105`}
                alt={product.name}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <FiShoppingBag size={32} className="text-gray-400" />
              </div>
            )}
          </div>

          {product.stock === 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
              Out of Stock
            </div>
          )}

          {product.stock > 0 && product.stock < 10 && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
              Low Stock
            </div>
          )}

          <button
            onClick={handleToggleWishlist}
            className={`absolute top-2 right-2 p-1.5 sm:p-2 rounded-full transition-colors z-10 ${
              isWishlisted
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
            }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <FiHeart size={12} className="sm:size-6" />
          </button>
        </div>
      </Link>

      <div className="p-3 sm:p-4">
        <h2 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-green-700 transition-colors">
          {product.name}
        </h2>

        {product.pack && (
          <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">Pack: {product.pack}</p>
        )}

        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <span className="text-base sm:text-lg md:text-xl font-bold text-green-600">
              ₹{product.discountPrice || product.price}
            </span>
            {hasDiscount && (
              <span className="text-xs sm:text-sm text-gray-500 line-through">
                ₹{product.price}
              </span>
            )}
          </div>

          {product.sku && (
            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded hidden sm:inline">
              {product.sku}
            </span>
          )}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleAddToCart}
            className={`flex-1 py-2.5 sm:py-3 rounded-lg transition-all duration-300 font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base ${
              addedToCart
                ? 'bg-green-700 text-white'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {addedToCart ? (
              <>
                <FiCheck size={14} className="sm:size-6 animate-pulse" />
                <span>Added</span>
              </>
            ) : (
              <span>Add to Cart</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
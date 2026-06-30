// "use client";

// import Footer from "@/app/componats/Footer";
// import Header from "@/app/componats/Header";
// import { AppContext } from "@/app/context/AppContext";
// import { useParams, useRouter } from "next/navigation";
// import React, { useContext, useEffect, useState, useMemo, useCallback, useRef } from "react";
// import { 
//   FiShoppingBag, 
//   FiHeart, 
//   FiShare2, 
//   FiStar, 
//   FiChevronRight,
//   FiTruck,
//   FiShield,
//   FiRefreshCw,
//   FiCheck,
//   FiPlus,
//   FiMinus,
//   FiArrowLeft,
//   FiThumbsUp,
//   FiEdit,
//   FiCamera,
//   FiX,
//   FiChevronLeft,
//   FiChevronRight as FiChevronRightIcon
// } from "react-icons/fi";

// export default function ProductDetailPage() {
//   const params = useParams();
//   const router = useRouter();
//   const { slug } = params;
//   const { products, categories, user, isCartOpen,
//     setIsCartOpen,
//     cartItems,
//     addToCart,
//     removeFromCart,
//     updateCartItemQuantity,
//     wishlist,
//     toggleWishlist,
//     isInWishlist,
//     calculateCartTotal, } = useContext(AppContext);
//   const [loading, setLoading] = useState(true);
//   const [zoomImage, setZoomImage] = useState(false);
//   const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [quantity, setQuantity] = useState(1);
//   const [activeTab, setActiveTab] = useState('description');
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [imageLoading, setImageLoading] = useState(true);
//   const [reviews, setReviews] = useState([]);
//   const [ratingSummary, setRatingSummary] = useState(null);
//   const [showReviewModal, setShowReviewModal] = useState(false);
//   const [reviewLoading, setReviewLoading] = useState(false);
//   const [isDragging, setIsDragging] = useState(false);
//   const [startX, setStartX] = useState(0);
//   const [scrollLeft, setScrollLeft] = useState(0);

//   // Refs
//   const imageContainerRef = useRef(null);
//   const thumbnailContainerRef = useRef(null);




//   // Find current product
//   const product = useMemo(() => {
//     return products.find(p => p.slug === slug || p._id === slug);
//   }, [products, slug]);


//   // Image gallery
//   const productImages = useMemo(() => {
//     if (!product) return [];

//     const images = [product.thumbImg];
//     if (product.galleryImg && Array.isArray(product.galleryImg)) {
//       images.push(...product.galleryImg);
//     }
//     return images.filter(img => img).slice(0, 5);
//   }, [product]);


//   // Get related products (same category)
//   const relatedProducts = useMemo(() => {
//     if (!product || !products.length) return [];

//     const productCategoryIds = Array.isArray(product.category) 
//       ? product.category.map(cat => cat.$oid || cat._id || cat)
//       : [typeof product.category === 'string' ? product.category : product.category?._id];

//     return products
//       .filter(p => {
//         if (p._id === product._id) return false;

//         if (Array.isArray(p.category)) {
//           return p.category.some(cat => {
//             const categoryId = cat.$oid || cat._id || cat;
//             return productCategoryIds.includes(categoryId);
//           });
//         }

//         const singleCategoryId = typeof p.category === 'string' ? p.category : p.category?._id;
//         return productCategoryIds.includes(singleCategoryId);
//       })
//       .slice(0, 8);
//   }, [product, products]);

//   const handleAddToCart = useCallback(() => {
//     addToCart(product, product.discountPrice, quantity);
//   }, [product, quantity, addToCart]);

//   const isWishlisted = useMemo(() => isInWishlist(product?._id), [product?._id, isInWishlist]);

//   const handleToggleWishlist = useCallback(() => {
//     toggleWishlist(product);
//   }, [product, toggleWishlist]);

//   // Zoom functionality
//   const handleMouseMove = useCallback((e) => {
//     if (!zoomImage) return;

//     const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
//     const x = ((e.clientX - left) / width) * 100;
//     const y = ((e.clientY - top) / height) * 100;
//     setZoomPosition({ x, y });
//   }, [zoomImage]);

//   const toggleZoom = useCallback(() => {
//     setZoomImage(prev => !prev);
//   }, []);

//   // Image slider navigation
//   const nextImage = useCallback(() => {
//     setSelectedImage(prev => {
//       const nextIndex = (prev + 1) % productImages.length;
//       return nextIndex;
//     });
//   }, [productImages.length]);

//   const prevImage = useCallback(() => {
//     setSelectedImage(prev => {
//       const prevIndex = (prev - 1 + productImages.length) % productImages.length;
//       return prevIndex;
//     });
//   }, [productImages.length]);

//   // Keyboard navigation
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.key === 'ArrowLeft') {
//         prevImage();
//       } else if (e.key === 'ArrowRight') {
//         nextImage();
//       } else if (e.key === 'Escape' && zoomImage) {
//         setZoomImage(false);
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [prevImage, nextImage, zoomImage]);

//   // Touch/swipe functionality for mobile
//   const handleTouchStart = useCallback((e) => {
//     setIsDragging(true);
//     setStartX(e.touches[0].pageX - imageContainerRef.current.offsetLeft);
//     setScrollLeft(imageContainerRef.current.scrollLeft);
//   }, []);

//   const handleTouchMove = useCallback((e) => {
//     if (!isDragging) return;
//     e.preventDefault();
//     const x = e.touches[0].pageX - imageContainerRef.current.offsetLeft;
//     const walk = (x - startX) * 2;
//     imageContainerRef.current.scrollLeft = scrollLeft - walk;
//   }, [isDragging, startX, scrollLeft]);

//   const handleTouchEnd = useCallback((e) => {
//     setIsDragging(false);
//     const container = imageContainerRef.current;
//     const scrollAmount = container.scrollLeft;
//     const containerWidth = container.offsetWidth;

//     // Determine if we should change image based on scroll amount
//     if (Math.abs(scrollAmount) > containerWidth * 0.2) {
//       if (scrollAmount > 0) {
//         nextImage();
//       } else {
//         prevImage();
//       }
//     }
//   }, [nextImage, prevImage]);

//   // Fetch reviews
//   const fetchReviews = useCallback(async () => {
//     if (!product) return;

//     try {
//       const response = await fetch(`http://localhost:5000/api/reviews/product/${product._id}`);
//       const data = await response.json();

//       if (data.success) {
//         setReviews(data.data.reviews);
//         setRatingSummary(data.data.ratingSummary);
//       }
//     } catch (error) {
//       console.error('Error fetching reviews:', error);
//     }
//   }, [product]);


//   useEffect(() => {
//   if (product) {
//     const recent = JSON.parse(localStorage.getItem('recentlyViewed')) || [];

//     const updated = [
//       product,
//       ...recent.filter((p) => p._id !== product._id), // ✅ fixed here
//     ].slice(0, 10);

//     localStorage.setItem('recentlyViewed', JSON.stringify(updated));
//   }
// }, [product]);


//   // Get product category name
//   const productCategory = useMemo(() => {
//     if (!product || !categories.length) return null;

//     if (Array.isArray(product.category)) {
//       const firstCategoryId = product.category[0]?.$oid || product.category[0]?._id || product.category[0];
//       return categories.find(cat => cat._id === firstCategoryId);
//     }

//     const categoryId = typeof product.category === 'string' ? product.category : product.category?._id;
//     return categories.find(cat => cat._id === categoryId);
//   }, [product, categories]);


//   // Discount calculation
//   const discountInfo = useMemo(() => {
//     if (!product) return null;

//     if (product.discountPrice && product.discountPrice < product.price) {
//       const discountAmount = product.price - product.discountPrice;
//       const discountPercentage = Math.round((discountAmount / product.price) * 100);
//       return { discountAmount, discountPercentage };
//     }
//     return null;
//   }, [product]);

//   // Handle quantity changes
//   const increaseQuantity = useCallback(() => {
//     setQuantity(prev => prev + 1);
//   }, []);

//   const decreaseQuantity = useCallback(() => {
//     setQuantity(prev => prev > 1 ? prev - 1 : 1);
//   }, []);

//   // Share product
//   const shareProduct = useCallback(async () => {
//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: product?.name,
//           text: product?.description,
//           url: window.location.href,
//         });
//       } catch (err) {
//         console.log('Error sharing:', err);
//       }
//     } else {
//       setShowShareModal(true);
//     }
//   }, [product]);

//   // Copy link to clipboard
//   const copyLink = useCallback(async () => {
//     try {
//       await navigator.clipboard.writeText(window.location.href);
//       setShowShareModal(false);
//     } catch (err) {
//       console.log('Failed to copy:', err);
//     }
//   }, []);

//   // Mark review as helpful
//   const markHelpful = useCallback(async (reviewId) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}/helpful`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       });

//       if (response.ok) {
//         fetchReviews(); // Refresh reviews
//       }
//     } catch (error) {
//       console.error('Error marking helpful:', error);
//     }
//   }, [fetchReviews]);

//   useEffect(() => {
//     const timer = setTimeout(() => setLoading(false), 800);
//     return () => clearTimeout(timer);
//   }, []);

//   useEffect(() => {
//     if (product) {
//       fetchReviews();
//     }
//   }, [product, fetchReviews]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex flex-col">
//         <Header />
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
//             <p className="text-gray-600">Loading product details...</p>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   if (!product) {
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
//                   Product Not Found
//                 </h3>
//                 <p className="text-gray-600 mb-6">
//                   The product you're looking for doesn't exist or has been removed.
//                 </p>
//                 <div className="flex flex-col sm:flex-row gap-3 justify-center">
//                   <button 
//                     onClick={() => router.back()}
//                     className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
//                   >
//                     Go Back
//                   </button>
//                   <button 
//                     onClick={() => router.push('/products')}
//                     className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
//                   >
//                     Browse Products
//                   </button>
//                 </div>
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
//         {/* Breadcrumb */}
//         <div className="bg-white border-b border-gray-200">
//           <div className="container mx-auto px-4 py-4">
//             <nav className="flex items-center space-x-2 text-sm text-gray-600">
//               <button 
//                 onClick={() => router.back()}
//                 className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors"
//               >
//                 <FiArrowLeft size={16} />
//                 <span>Back</span>
//               </button>
//               <span>/</span>
//               <a href="/" className="hover:text-green-600 transition-colors">Home</a>
//               <span>/</span>
//               {productCategory && (
//                 <>
//                   <a 
//                     href={`/category/${productCategory.slug}`}
//                     className="hover:text-green-600 transition-colors"
//                   >
//                     {productCategory.name}
//                   </a>
//                   <span>/</span>
//                 </>
//               )}
//               <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
//             </nav>
//           </div>
//         </div>

//         {/* Product Section */}
//         <section className="py-8">
//           <div className="container mx-auto px-4">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
//               {/* Product Images */}
//               <div className="space-y-4">
//                 {/* Main Image with Zoom and Navigation */}
//                 <div className="bg-white rounded-xl  shadow-sm border border-[#00a63d] p-6">
//                   <div 
//                     className="relative aspect-square overflow-hidden rounded-xl cursor-zoom-in"
//                     onMouseMove={handleMouseMove}
//                     onMouseLeave={() => setZoomImage(false)}
//                     onClick={toggleZoom}
//                     ref={imageContainerRef}
//                     onTouchStart={handleTouchStart}
//                     onTouchMove={handleTouchMove}
//                     onTouchEnd={handleTouchEnd}
//                   >
//                     {imageLoading && (
//                       <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl"></div>
//                     )}

//                     {/* Main Product Image */}
//                     <img
//                       src={`http://localhost:5000${productImages[selectedImage]}`}
//                       alt={product.name}
//                       className={`w-full h-full object-cover transition-opacity duration-300 ${
//                         imageLoading ? 'opacity-0' : 'opacity-100'
//                       } ${zoomImage ? 'scale-150' : 'scale-100'}`}
//                       style={{
//                         transformOrigin: zoomImage ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center'
//                       }}
//                       onLoad={() => setImageLoading(false)}
//                       onError={(e) => {
//                         e.target.src = '/api/placeholder/600/600';
//                         setImageLoading(false);
//                       }}
//                     />

//                     {/* Zoom Overlay */}
//                     {zoomImage && (
//                       <div className="absolute inset-0 bg-opacity-10 pointer-events-none"></div>
//                     )}

//                     {/* Navigation Arrows */}
//                     {productImages.length > 1 && (
//                       <>
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             prevImage();
//                           }}
//                           className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all hover:scale-110"
//                         >
//                           <FiChevronLeft size={20} className="text-gray-700" />
//                         </button>
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             nextImage();
//                           }}
//                           className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all hover:scale-110"
//                         >
//                           <FiChevronRightIcon size={20} className="text-gray-700" />
//                         </button>
//                       </>
//                     )}

//                     {/* Image Counter */}
//                     {productImages.length > 1 && (
//                       <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
//                         {selectedImage + 1} / {productImages.length}
//                       </div>
//                     )}

//                     {/* Zoom Indicator */}
//                     {!zoomImage && (
//                       <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
//                         Click to zoom
//                       </div>
//                     )}

//                     {/* Stock Status */}
//                     {product.stock < 10 && product.stock > 0 && (
//                       <div className="absolute top-4 right-4 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
//                         Only {product.stock} left
//                       </div>
//                     )}

//                     {product.stock === 0 && (
//                       <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
//                         Out of Stock
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Thumbnail Images with Horizontal Scroll */}
//                 {productImages.length > 1 && (
//                   <div 
//                     className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide"
//                     ref={thumbnailContainerRef}
//                   >
//                     {productImages.map((image, index) => (
//                       <button
//                         key={index}
//                         onClick={() => setSelectedImage(index)}
//                         className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
//                           selectedImage === index 
//                             ? 'border-green-500 ring-2 ring-green-200' 
//                             : 'border-gray-200 hover:border-gray-300'
//                         }`}
//                       >
//                         <img
//                           src={`http://localhost:5000${image}`}
//                           alt={`${product.name} ${index + 1}`}
//                           className="w-full h-full object-cover"
//                         />
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Product Info */}
//               <div className="space-y-6">
//                 {/* Category & SKU */}
//                 <div className="flex items-center space-x-4 text-sm text-gray-600">
//                   {productCategory && (
//                     <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
//                       {productCategory.name}
//                     </span>
//                   )}
//                   {product.sku && (
//                     <span>SKU: {product.sku}</span>
//                   )}
//                 </div>

//                 {/* Product Title */}
//                 <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
//                   {product.name}
//                 </h1>

//                 {/* Rating */}
//                 <div className="flex items-center space-x-2">
//                   <div className="flex items-center space-x-1">
//                     {[1, 2, 3, 4, 5].map((star) => (
//                       <FiStar
//                         key={star}
//                         size={18}
//                         className={`${
//                           star <= (ratingSummary?.averageRating || product.rating || 0)
//                             ? 'text-yellow-400 fill-current'
//                             : 'text-gray-300'
//                         }`}
//                       />
//                     ))}
//                   </div>
//                   <span className="text-sm text-gray-600">
//                     {ratingSummary?.averageRating || product.rating || 0} • {ratingSummary?.totalReviews || 0} reviews
//                   </span>
//                 </div>

//                 {/* Price */}
//                 <div className="flex items-center space-x-3">
//                   <span className="text-3xl font-bold text-green-600">
//                     ₹{product.discountPrice || product.price}
//                   </span>
//                   {discountInfo && (
//                     <>
//                       <span className="text-xl text-gray-500 line-through">
//                         ₹{product.price}
//                       </span>
//                       <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
//                         Save ₹{discountInfo.discountAmount}
//                       </span>
//                     </>
//                   )}
//                 </div>

//                 {/* Short Description */}
//                 {product.shortDescription && (
//                   <div 
//                     className="text-gray-600 leading-relaxed"
//                     dangerouslySetInnerHTML={{ __html: product.shortDescription }}
//                   />
//                 )}

//                 {/* Pack Size */}
//                 {product.pack && (
//                   <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
//                     <h4 className="font-semibold text-blue-900 mb-1">Pack Size</h4>
//                     <p className="text-blue-700">{product.pack}</p>
//                   </div>
//                 )}

//                 {/* Quantity Selector */}
//                 <div className="space-y-3">
//                   <label className="block text-sm font-medium text-gray-700">Quantity</label>
//                   <div className="flex items-center space-x-3">
//                     <div className="flex items-center border border-gray-300 rounded-lg">
//                       <button
//                         onClick={decreaseQuantity}
//                         disabled={quantity <= 1}
//                         className="p-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                       >
//                         <FiMinus size={16} />
//                       </button>
//                       <span className="px-4 py-2 text-lg font-semibold min-w-12 text-center">
//                         {quantity}
//                       </span>
//                       <button
//                         onClick={increaseQuantity}
//                         disabled={product.stock === 0 || quantity >= (product.stock || 99)}
//                         className="p-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                       >
//                         <FiPlus size={16} />
//                       </button>
//                     </div>
//                     <div className="text-sm text-gray-500">
//                       {product.stock || 99} available
//                     </div>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex flex-col sm:flex-row gap-3">
//                   <button
//                     onClick={handleAddToCart}
//                     disabled={product.stock === 0}
//                     className="flex-1 bg-green-600 text-white py-4 px-6 rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
//                   >
//                     <FiShoppingBag size={20} />
//                     <span>Add to Cart</span>
//                   </button>

//                   <div className="flex space-x-2">
//                     <button
//                       onClick={handleToggleWishlist}
//                       className={`p-4 border rounded-xl transition-all ${
//                         isWishlisted
//                           ? 'border-red-500 bg-red-50 text-red-600'
//                           : 'border-gray-300 text-gray-600 hover:border-gray-400'
//                       }`}
//                     >
//                       <FiHeart 
//                         size={20} 
//                         className={isWishlisted ? 'fill-current' : ''}
//                       />
//                     </button>

//                     <button
//                       onClick={shareProduct}
//                       className="p-4 border border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 transition-colors"
//                     >
//                       <FiShare2 size={20} />
//                     </button>
//                   </div>
//                 </div>

//                 {/* Features */}
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
//                   <div className="flex items-center space-x-3">
//                     <FiTruck className="text-green-600" size={20} />
//                     <div>
//                       <div className="font-semibold text-gray-900">Free Shipping</div>
//                       <div className="text-sm text-gray-600">Above ₹499</div>
//                     </div>
//                   </div>

//                   <div className="flex items-center space-x-3">
//                     <FiShield className="text-green-600" size={20} />
//                     <div>
//                       <div className="font-semibold text-gray-900">Quality Guarantee</div>
//                       <div className="text-sm text-gray-600">1 Year Warranty</div>
//                     </div>
//                   </div>

//                   <div className="flex items-center space-x-3">
//                     <FiRefreshCw className="text-green-600" size={20} />
//                     <div>
//                       <div className="font-semibold text-gray-900">Easy Returns</div>
//                       <div className="text-sm text-gray-600">30 Days Policy</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Product Details Tabs */}
//             <div className="mt-16">
//               <div className="border-b border-gray-200">
//                 <nav className="flex space-x-8">
//                   {[
//                     { id: 'description', label: 'Description' },
//                     { id: 'additional', label: 'Additional Info' },
//                     { id: 'reviews', label: `Reviews (${ratingSummary?.totalReviews || 0})` },
//                     // { id: 'shipping', label: 'Shipping & Returns' }
//                   ].map((tab) => (
//                     <button
//                       key={tab.id}
//                       onClick={() => setActiveTab(tab.id)}
//                       className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
//                         activeTab === tab.id
//                           ? 'border-green-500 text-green-600'
//                           : 'border-transparent text-gray-500 hover:text-gray-700'
//                       }`}
//                     >
//                       {tab.label}
//                     </button>
//                   ))}
//                 </nav>
//               </div>

//               <div className="py-8">
//                 {activeTab === 'description' && (
//                   <div className="prose prose-lg max-w-none">
//                     {product.description ? (
//                       <div dangerouslySetInnerHTML={{ __html: product.description }} />
//                     ) : (
//                       <p className="text-gray-600">No description available for this product.</p>
//                     )}
//                   </div>
//                 )}

//                 {activeTab === 'additional' && (
//                   <div className="prose prose-lg max-w-none">
//                     {product.additionalInformation ? (
//                       <div dangerouslySetInnerHTML={{ __html: product.additionalInformation}} />
//                     ) : (
//                       <p className="text-gray-600">No additional information available for this product.</p>
//                     )}
//                   </div>
//                 )}

//                 {activeTab === 'reviews' && (
//                   <ReviewsSection 
//                     reviews={reviews}
//                     ratingSummary={ratingSummary}
//                     product={product}
//                     user={user}
//                     onReviewSubmit={() => {
//                       fetchReviews();
//                       setShowReviewModal(false);
//                     }}
//                     onHelpfulClick={markHelpful}
//                     onWriteReview={() => setShowReviewModal(true)}
//                   />
//                 )}

//                 {activeTab === 'shipping' && (
//                   <div className="space-y-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div className="space-y-4">
//                         <h4 className="font-semibold text-gray-900">Shipping Information</h4>
//                         <ul className="space-y-2 text-gray-600">
//                           <li className="flex items-center space-x-2">
//                             <FiCheck className="text-green-500" size={16} />
//                             <span>Free shipping on orders above ₹499</span>
//                           </li>
//                           <li className="flex items-center space-x-2">
//                             <FiCheck className="text-green-500" size={16} />
//                             <span>Standard delivery: 3-5 business days</span>
//                           </li>
//                           <li className="flex items-center space-x-2">
//                             <FiCheck className="text-green-500" size={16} />
//                             <span>Express delivery available</span>
//                           </li>
//                           <li className="flex items-center space-x-2">
//                             <FiCheck className="text-green-500" size={16} />
//                             <span>Cash on delivery available</span>
//                           </li>
//                         </ul>
//                       </div>

//                       <div className="space-y-4">
//                         <h4 className="font-semibold text-gray-900">Return Policy</h4>
//                         <ul className="space-y-2 text-gray-600">
//                           <li className="flex items-center space-x-2">
//                             <FiCheck className="text-green-500" size={16} />
//                             <span>30-day return policy</span>
//                           </li>
//                           <li className="flex items-center space-x-2">
//                             <FiCheck className="text-green-500" size={16} />
//                             <span>Easy return process</span>
//                           </li>
//                           <li className="flex items-center space-x-2">
//                             <FiCheck className="text-green-500" size={16} />
//                             <span>Full refund guaranteed</span>
//                           </li>
//                           <li className="flex items-center space-x-2">
//                             <FiCheck className="text-green-500" size={16} />
//                             <span>No questions asked returns</span>
//                           </li>
//                         </ul>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Related Products */}
//             {relatedProducts.length > 0 && (
//               <section className="mt-16">
//                 <div className="flex items-center justify-between mb-8">
//                   <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
//                   <button 
//                     onClick={() => router.push('/products')}
//                     className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-1"
//                   >
//                     <span>View All</span>
//                     <FiChevronRight size={16} />
//                   </button>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                   {relatedProducts.map((relatedProduct) => (
//                     <RelatedProductCard 
//                       key={relatedProduct._id} 
//                       product={relatedProduct} 
//                     />
//                   ))}
//                 </div>
//               </section>
//             )}
//           </div>
//         </section>
//       </main>

//       {/* Share Modal */}
//       {showShareModal && (
//         <ShareModal 
//           onClose={() => setShowShareModal(false)}
//           onCopyLink={copyLink}
//         />
//       )}

//       {/* Review Modal */}
//       {showReviewModal && (
//         <ReviewModal 
//           product={product}
//           user={user}
//           onClose={() => setShowReviewModal(false)}
//           onSubmit={() => {
//             fetchReviews();
//             setShowReviewModal(false);
//           }}
//         />
//       )}

//       <Footer />
//     </div>
//   );
// }

// // Reviews Section Component (memoized to prevent re-renders)
// const ReviewsSection = React.memo(({ reviews, ratingSummary, product, user, onReviewSubmit, onHelpfulClick, onWriteReview }) => {
//   const [sortBy, setSortBy] = useState('newest');
//   const [filterRating, setFilterRating] = useState(null);

//   const filteredReviews = useMemo(() => 
//     reviews.filter(review => 
//       !filterRating || review.rating === filterRating
//     ).sort((a, b) => {
//       switch (sortBy) {
//         case 'newest':
//           return new Date(b.createdAt) - new Date(a.createdAt);
//         case 'oldest':
//           return new Date(a.createdAt) - new Date(b.createdAt);
//         case 'highest':
//           return b.rating - a.rating;
//         case 'lowest':
//           return a.rating - b.rating;
//         case 'most_helpful':
//           return b.helpful - a.helpful;
//         default:
//           return 0;
//       }
//     }), [reviews, filterRating, sortBy]
//   );

//   return (
//     <div className="space-y-8">
//       {/* Review Summary */}
//       <div className="bg-white rounded-xl shadow-sm border border-[#00a63d] p-8">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Rating Overview */}
//           <div className="text-center lg:text-left">
//             <div className="text-5xl font-bold text-gray-900 mb-2">
//               {ratingSummary?.averageRating || 0}
//             </div>
//             <div className="flex items-center justify-center lg:justify-start space-x-1 mb-2">
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <FiStar
//                   key={star}
//                   size={20}
//                   className={`${
//                     star <= (ratingSummary?.averageRating || 0)
//                       ? 'text-yellow-400 fill-current'
//                       : 'text-gray-300'
//                   }`}
//                 />
//               ))}
//             </div>
//             <p className="text-gray-600">
//               Based on {ratingSummary?.totalReviews || 0} reviews
//             </p>

//             {/* Write Review Button */}
//             <button
//               onClick={onWriteReview}
//               className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2 mx-auto lg:mx-0"
//             >
//               <FiEdit size={16} />
//               <span>Write a Review</span>
//             </button>
//           </div>

//           {/* Rating Breakdown */}
//           <div className="space-y-3">
//             {[5, 4, 3, 2, 1].map((rating) => {
//               const count = ratingSummary?.ratingCounts?.[rating] || 0;
//               const total = ratingSummary?.totalReviews || 1;
//               const percentage = (count / total) * 100;

//               return (
//                 <div key={rating} className="flex items-center space-x-3">
//                   <div className="flex items-center space-x-1 w-16">
//                     <span className="text-sm text-gray-600 w-4">{rating}</span>
//                     <FiStar size={14} className="text-yellow-400 fill-current" />
//                   </div>
//                   <div className="flex-1 bg-gray-200 rounded-full h-2">
//                     <div 
//                       className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
//                       style={{ width: `${percentage}%` }}
//                     ></div>
//                   </div>
//                   <span className="text-sm text-gray-600 w-12 text-right">
//                     {count} ({percentage.toFixed(0)}%)
//                   </span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* Reviews Filter and Sort */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div className="flex items-center space-x-4">
//           <span className="text-sm font-medium text-gray-700">Filter by:</span>
//           <div className="flex flex-wrap gap-2">
//             <button
//               onClick={() => setFilterRating(null)}
//               className={`px-3 py-1 rounded-full text-sm transition-colors ${
//                 filterRating === null
//                   ? 'bg-green-600 text-white'
//                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//               }`}
//             >
//               All
//             </button>
//             {[5, 4, 3, 2, 1].map((rating) => (
//               <button
//                 key={rating}
//                 onClick={() => setFilterRating(rating)}
//                 className={`px-3 py-1 rounded-full text-sm transition-colors flex items-center space-x-1 ${
//                   filterRating === rating
//                     ? 'bg-green-600 text-white'
//                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                 }`}
//               >
//                 <span>{rating}</span>
//                 <FiStar size={12} className="fill-current" />
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="flex items-center space-x-4">
//           <span className="text-sm font-medium text-gray-700">Sort by:</span>
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
//           >
//             <option value="newest">Newest First</option>
//             <option value="oldest">Oldest First</option>
//             <option value="highest">Highest Rating</option>
//             <option value="lowest">Lowest Rating</option>
//             <option value="most_helpful">Most Helpful</option>
//           </select>
//         </div>
//       </div>

//       {/* Reviews List */}
//       <div className="space-y-6">
//         {filteredReviews.length === 0 ? (
//           <div className="text-center py-12">
//             <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
//               <FiStar size={24} className="text-gray-400" />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
//             <p className="text-gray-600 mb-6">Be the first to review this product!</p>
//             <button
//               onClick={onWriteReview}
//               className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
//             >
//               Write First Review
//             </button>
//           </div>
//         ) : (
//           filteredReviews.map((review) => (
//             <ReviewCard 
//               key={review._id} 
//               review={review} 
//               onHelpfulClick={onHelpfulClick}
//             />
//           ))
//         )}
//       </div>
//     </div>
//   );
// });

// // Review Card Component (memoized)
// const ReviewCard = React.memo(({ review, onHelpfulClick }) => {
//   const [showFullReview, setShowFullReview] = useState(false);

//   const isLongReview = review.comment.length > 300;
//   const displayComment = showFullReview ? review.comment : review.comment.slice(0, 300) + (isLongReview ? '...' : '');

//   return (
//     <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//       <div className="flex items-start justify-between mb-4">
//         <div className="flex items-center space-x-3">
//           <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
//             <span className="text-green-600 font-semibold text-sm">
//               {review.user?.name?.charAt(0) || 'U'}
//             </span>
//           </div>
//           <div>
//             <div className="font-semibold text-gray-900">
//               {review.user?.name || 'Anonymous User'}
//             </div>
//             <div className="flex items-center space-x-2 mt-1">
//               <div className="flex items-center space-x-1">
//                 {[1, 2, 3, 4, 5].map((star) => (
//                   <FiStar
//                     key={star}
//                     size={14}
//                     className={`${
//                       star <= review.rating
//                         ? 'text-yellow-400 fill-current'
//                         : 'text-gray-300'
//                     }`}
//                   />
//                 ))}
//               </div>
//               <span className="text-sm text-gray-500">
//                 {new Date(review.createdAt).toLocaleDateString()}
//               </span>
//             </div>
//           </div>
//         </div>

//         {review.verifiedPurchase && (
//           <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
//             Verified Purchase
//           </span>
//         )}
//       </div>

//       <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>

//       <p className="text-gray-600 leading-relaxed mb-4">
//         {displayComment}
//         {isLongReview && (
//           <button
//             onClick={() => setShowFullReview(!showFullReview)}
//             className="text-green-600 hover:text-green-700 font-medium ml-1"
//           >
//             {showFullReview ? 'Show less' : 'Read more'}
//           </button>
//         )}
//       </p>

//       {/* Review Images */}
//       {review.images && review.images.length > 0 && (
//         <div className="flex space-x-2 mb-4">
//           {review.images.map((image, index) => (
//             <img
//               key={index}
//               src={image}
//               alt={`Review image ${index + 1}`}
//               className="w-20 h-20 object-cover rounded-lg border border-gray-200"
//             />
//           ))}
//         </div>
//       )}

//       {/* Admin Response */}
//       {review.adminResponse && (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
//           <div className="flex items-center space-x-2 mb-2">
//             <span className="font-semibold text-blue-900">Admin Response</span>
//             <span className="text-sm text-blue-600">
//               {new Date(review.adminResponse.respondedAt).toLocaleDateString()}
//             </span>
//           </div>
//           <p className="text-blue-700">{review.adminResponse.comment}</p>
//         </div>
//       )}

//       {/* Helpful Actions */}
//       <div className="flex items-center justify-between pt-4 border-t border-gray-100">
//         <button
//           onClick={() => onHelpfulClick(review._id)}
//           className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
//         >
//           <FiThumbsUp size={16} />
//           <span>Helpful ({review.helpful})</span>
//         </button>
//       </div>
//     </div>
//   );
// });

// // Review Modal Component (memoized)
// const ReviewModal = React.memo(({ product, user, onClose, onSubmit }) => {
//   const [rating, setRating] = useState(0);
//   const [title, setTitle] = useState('');
//   const [comment, setComment] = useState('');
//   const [images, setImages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [hoverRating, setHoverRating] = useState(0);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (rating === 0) {
//       alert('Please select a rating');
//       return;
//     }

//     if (!title.trim() || !comment.trim()) {
//       alert('Please fill in all fields');
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch('http://localhost:5000/api/reviews/create', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           productId: product._id,
//           rating,
//           title: title.trim(),
//           comment: comment.trim(),
//           images
//         })
//       });

//       const data = await response.json();

//       if (data.success) {
//         onSubmit();
//         // Reset form
//         setRating(0);
//         setTitle('');
//         setComment('');
//         setImages([]);
//       } else {
//         alert(data.message || 'Failed to submit review');
//       }
//     } catch (error) {
//       console.error('Submit review error:', error);
//       alert('Failed to submit review');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleImageUpload = (e) => {
//     const files = Array.from(e.target.files);
//     // Here you would typically upload images to your server
//     // For now, we'll just use object URLs
//     const newImages = files.map(file => URL.createObjectURL(file));
//     setImages(prev => [...prev, ...newImages]);
//   };

//   const removeImage = (index) => {
//     setImages(prev => prev.filter((_, i) => i !== index));
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0  bg-opacity-50" onClick={onClose}></div>
//       <div className="bg-white rounded-2xl max-w-2xl border-2 border-gray-400 w-full max-h-[90vh] overflow-y-auto overflow-hidden z-50">
//         <div className="flex items-center justify-between p-6 border-b border-gray-200">
//           <h3 className="text-xl font-semibold text-gray-900">Write a Review</h3>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <FiX size={20} />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//           {/* Product Info */}
//           <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
//             <img
//               src={`http://localhost:5000${product.thumbImg}`}
//               alt={product.name}
//               className="w-16 h-16 object-cover rounded-lg"
//             />
//             <div>
//               <h4 className="font-semibold text-gray-900">{product.name}</h4>
//               <p className="text-green-600 font-semibold">
//                 ₹{product.discountPrice || product.price}
//               </p>
//             </div>
//           </div>

//           {/* Rating */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-3">
//               Overall Rating *
//             </label>
//             <div className="flex items-center space-x-1">
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <button
//                   key={star}
//                   type="button"
//                   onClick={() => setRating(star)}
//                   onMouseEnter={() => setHoverRating(star)}
//                   onMouseLeave={() => setHoverRating(0)}
//                   className="p-1 transition-transform hover:scale-110"
//                 >
//                   <FiStar
//                     size={32}
//                     className={`${
//                       star <= (hoverRating || rating)
//                         ? 'text-yellow-400 fill-current'
//                         : 'text-gray-300'
//                     }`}
//                   />
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Review Title */}
//           <div>
//             <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
//               Review Title *
//             </label>
//             <input
//               type="text"
//               id="title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               placeholder="Summarize your experience"
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
//               required
//             />
//           </div>

//           {/* Review Comment */}
//           <div>
//             <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
//               Your Review *
//             </label>
//             <textarea
//               id="comment"
//               value={comment}
//               onChange={(e) => setComment(e.target.value)}
//               placeholder="Share details of your experience with this product"
//               rows={6}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
//               required
//             />
//           </div>

//           {/* Image Upload */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Add Photos (Optional)
//             </label>
//             <div className="flex flex-wrap gap-4">
//               {images.map((image, index) => (
//                 <div key={index} className="relative">
//                   <img
//                     src={image}
//                     alt={`Review ${index + 1}`}
//                     className="w-20 h-20 object-cover rounded-lg border border-gray-200"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => removeImage(index)}
//                     className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
//                   >
//                     <FiX size={12} />
//                   </button>
//                 </div>
//               ))}
//               <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-green-500 transition-colors">
//                 <FiCamera size={24} className="text-gray-400" />
//                 <input
//                   type="file"
//                   multiple
//                   accept="image/*"
//                   onChange={handleImageUpload}
//                   className="hidden"
//                 />
//               </label>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <div className="flex space-x-3 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
//             >
//               {loading ? 'Submitting...' : 'Submit Review'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// });

// // Share Modal Component (memoized)
// const ShareModal = React.memo(({ onClose, onCopyLink }) => {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       <div className="absolute inset-0 bg-black/50 bg-opacity-50" onClick={onClose}></div>
//       <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 z-10">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Product</h3>
//         <div className="space-y-3">
//           <button
//             onClick={onCopyLink}
//             className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
//           >
//             Copy Link
//           </button>
//           <button
//             onClick={onClose}
//             className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// });

// // Related Product Card Component (memoized)
// const RelatedProductCard = React.memo(({ product }) => {
//   const router = useRouter();
//   const [imageLoaded, setImageLoaded] = useState(false);
//   const [imageError, setImageError] = useState(false);

//   const hasDiscount = product.discountPrice && product.discountPrice < product.price;
//   const discountPercentage = hasDiscount 
//     ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
//     : 0;

//   const handleProductClick = useCallback(() => {
//     router.push(`/product/${product.slug}`);
//   }, [router, product.slug]);

//   return (
//     <div 
//       onClick={handleProductClick}
//       className="bg-white rounded-md shadow-md  transition-all duration-300 border border-[#00a63d] overflow-hidden group hover:border-[#00a63d] cursor-pointer"
//     >
//       <div className="relative overflow-hidden">
//         <div className={`w-full aspect-square bg-gray-100 ${!imageLoaded ? 'animate-pulse' : ''}`}>
//           {!imageError ? (
//             <img
//               src={`http://localhost:5000${product.thumbImg}`}
//               className={`w-full h-full object-cover transition-all duration-500 ${
//                 imageLoaded ? 'opacity-100' : 'opacity-0'
//               } group-hover:scale-110`}
//               alt={product.name}
//               onLoad={() => setImageLoaded(true)}
//               onError={() => {
//                 setImageError(true);
//                 setImageLoaded(true);
//               }}
//               loading="lazy"
//             />
//           ) : (
//             <div className="w-full h-full bg-gray-200 flex items-center justify-center">
//               <FiShoppingBag size={32} className="text-gray-400" />
//             </div>
//           )}
//         </div>

//         {/* {hasDiscount && (
//           <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
//             {discountPercentage}% OFF
//           </div>
//         )} */}
//       </div>

//       <div className="p-4">
//         <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-700 transition-colors">
//           {product.name}
//         </h3>

//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-2">
//             <span className="text-lg font-bold text-green-600">
//               ₹{product.discountPrice || product.price}
//             </span>
//             {hasDiscount && (
//               <span className="text-sm text-gray-500 line-through">
//                 ₹{product.price}
//               </span>
//             )}
//           </div>

//           <div className="flex items-center space-x-1 text-yellow-400">
//             <FiStar size={14} className="fill-current" />
//             <span className="text-sm text-gray-600">{product.rating || 4.5}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// });

// // Add this CSS for hiding scrollbars
// const styles = `
//   .scrollbar-hide {
//     -ms-overflow-style: none;
//     scrollbar-width: none;
//   }
//   .scrollbar-hide::-webkit-scrollbar {
//     display: none;
//   }
// `;

// // Add styles to head
// if (typeof document !== 'undefined') {
//   const styleSheet = document.createElement("style")
//   styleSheet.innerText = styles
//   document.head.appendChild(styleSheet)
// }



"use client";

import Footer from "@/app/componats/Footer";
import Header from "@/app/componats/Header";
import { AppContext } from "@/app/context/AppContext";
import { useParams, useRouter } from "next/navigation";
import React, { useContext, useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  FiShoppingBag,
  FiHeart,
  FiShare2,
  FiStar,
  FiChevronRight,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiCheck,
  FiPlus,
  FiMinus,
  FiArrowLeft,
  FiThumbsUp,
  FiEdit,
  FiCamera,
  FiX,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight as FiChevronRightIcon
} from "react-icons/fi";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;
  const { products, categories, user, isCartOpen,
    setIsCartOpen,
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    wishlist,
    toggleWishlist,
    isInWishlist,
    calculateCartTotal, } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [zoomImage, setZoomImage] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showShareModal, setShowShareModal] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false); // New state for cart animation



  // Refs
  const imageContainerRef = useRef(null);
  const thumbnailContainerRef = useRef(null);

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        {/* Breadcrumb Skeleton */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-48 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 mx-auto max-w-8xl  px-4 sm:px-6 lg:px-16 gap-12">
              {/* Product Images Skeleton */}
              <div className="space-y-4">
                {/* Main Image Skeleton */}
                <div className="bg-white rounded-xl shadow-sm border border-[#00a63d] p-6">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-200 animate-pulse"></div>
                </div>

                {/* Thumbnail Images Skeleton */}
                <div className="flex space-x-3">
                  {[1, 2, 3, 4, 5].map((index) => (
                    <div key={index} className="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-200 animate-pulse"></div>
                  ))}
                </div>
              </div>

              {/* Product Info Skeleton */}
              <div className="space-y-6">
                {/* Category & SKU Skeleton */}
                <div className="flex items-center space-x-4">
                  <div className="h-6 w-32 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>

                {/* Product Title Skeleton */}
                <div className="space-y-2">
                  <div className="h-8 w-3/4 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                </div>

                {/* Rating Skeleton */}
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div key={star} className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>

                {/* Price Skeleton */}
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-32 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                </div>

                {/* Short Description Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
                </div>

                {/* Pack Size Skeleton */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>

                {/* Quantity Selector Skeleton */}
                <div className="space-y-3">
                  <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <div className="p-3 bg-gray-100 w-12"></div>
                      <div className="px-4 py-2 min-w-12 bg-gray-50"></div>
                      <div className="p-3 bg-gray-100 w-12"></div>
                    </div>
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Action Buttons Skeleton */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 h-14 bg-gray-300 rounded-xl animate-pulse"></div>
                  <div className="flex space-x-2">
                    <div className="w-14 h-14 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="w-14 h-14 bg-gray-200 rounded-xl animate-pulse"></div>
                  </div>
                </div>

                {/* Features Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="space-y-1">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Details Tabs Skeleton */}
            <div className="mt-16">
              {/* Tabs Navigation Skeleton */}
              <div className="border-b border-gray-200">
                <div className="flex space-x-8">
                  {[1, 2, 3, 4].map((tab) => (
                    <div key={tab} className="py-4">
                      <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tab Content Skeleton */}
              <div className="py-8">
                <div className="space-y-4">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Related Products Skeleton */}
            <div className="mt-16">
              <div className="flex items-center justify-between mb-8">
                <div className="h-8 w-48 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="bg-white rounded-md shadow-md border border-[#00a63d] overflow-hidden animate-pulse">
                    <div className="w-full aspect-square bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-5 w-3/4 bg-gray-200 rounded mb-3"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-6 w-20 bg-gray-200 rounded"></div>
                        <div className="h-4 w-12 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );

  // Find current product
  const product = useMemo(() => {
    return products.find(p => p.slug === slug || p._id === slug);
  }, [products, slug]);

  // Image gallery
  const productImages = useMemo(() => {
    if (!product) return [];

    const images = [product.thumbImg];
    if (product.galleryImg && Array.isArray(product.galleryImg)) {
      images.push(...product.galleryImg);
    }
    return images.filter(img => img).slice(0, 5);
  }, [product]);

  // Get related products (same category)
  const relatedProducts = useMemo(() => {
    if (!product || !products.length) return [];

    const productCategoryIds = Array.isArray(product.category)
      ? product.category.map(cat => cat.$oid || cat._id || cat)
      : [typeof product.category === 'string' ? product.category : product.category?._id];

    return products
      .filter(p => {
        if (p._id === product._id) return false;

        if (Array.isArray(p.category)) {
          return p.category.some(cat => {
            const categoryId = cat.$oid || cat._id || cat;
            return productCategoryIds.includes(categoryId);
          });
        }

        const singleCategoryId = typeof p.category === 'string' ? p.category : p.category?._id;
        return productCategoryIds.includes(singleCategoryId);
      })
      .slice(0, 8);
  }, [product, products]);

  const handleAddToCart = useCallback(() => {
    addToCart(product, product.discountPrice, quantity);
    setAddedToCart(true);

    // Reset button after 3 seconds
    setTimeout(() => {
      setAddedToCart(false);
    }, 1000);
  }, [product, quantity, addToCart]);

  const isWishlisted = useMemo(() => isInWishlist(product?._id), [product?._id, isInWishlist]);

  const handleToggleWishlist = useCallback(() => {
    toggleWishlist(product);
  }, [product, toggleWishlist]);

  // Zoom functionality
  const handleMouseMove = useCallback((e) => {
    if (!zoomImage) return;

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  }, [zoomImage]);

  const toggleZoom = useCallback(() => {
    setZoomImage(prev => !prev);
  }, []);

  // Image slider navigation
  const nextImage = useCallback(() => {
    setSelectedImage(prev => {
      const nextIndex = (prev + 1) % productImages.length;
      return nextIndex;
    });
  }, [productImages.length]);

  const prevImage = useCallback(() => {
    setSelectedImage(prev => {
      const prevIndex = (prev - 1 + productImages.length) % productImages.length;
      return prevIndex;
    });
  }, [productImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'Escape' && zoomImage) {
        setZoomImage(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevImage, nextImage, zoomImage]);

  // Touch/swipe functionality for mobile
  const handleTouchStart = useCallback((e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - imageContainerRef.current.offsetLeft);
    setScrollLeft(imageContainerRef.current.scrollLeft);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.touches[0].pageX - imageContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    imageContainerRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleTouchEnd = useCallback((e) => {
    setIsDragging(false);
    const container = imageContainerRef.current;
    const scrollAmount = container.scrollLeft;
    const containerWidth = container.offsetWidth;

    // Determine if we should change image based on scroll amount
    if (Math.abs(scrollAmount) > containerWidth * 0.2) {
      if (scrollAmount > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
  }, [nextImage, prevImage]);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    if (!product) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/product/${product._id}`);
      const data = await response.json();

      if (data.success) {
        setReviews(data.data.reviews);
        setRatingSummary(data.data.ratingSummary);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [product]);

  useEffect(() => {
    if (product) {
      const recent = JSON.parse(localStorage.getItem('recentlyViewed')) || [];

      const updated = [
        product,
        ...recent.filter((p) => p._id !== product._id),
      ].slice(0, 10);

      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    }
  }, [product]);

  // Get product category name
  const productCategory = useMemo(() => {
    if (!product || !categories.length) return null;

    if (Array.isArray(product.category)) {
      const firstCategoryId = product.category[0]?.$oid || product.category[0]?._id || product.category[0];
      return categories.find(cat => cat._id === firstCategoryId);
    }

    const categoryId = typeof product.category === 'string' ? product.category : product.category?._id;
    return categories.find(cat => cat._id === categoryId);
  }, [product, categories]);

  // Discount calculation
  const discountInfo = useMemo(() => {
    if (!product) return null;

    if (product.discountPrice && product.discountPrice < product.price) {
      const discountAmount = product.price - product.discountPrice;
      const discountPercentage = Math.round((discountAmount / product.price) * 100);
      return { discountAmount, discountPercentage };
    }
    return null;
  }, [product]);

  // Handle quantity changes
  const increaseQuantity = useCallback(() => {
    setQuantity(prev => prev + 1);
  }, []);

  const decreaseQuantity = useCallback(() => {
    setQuantity(prev => prev > 1 ? prev - 1 : 1);
  }, []);

  // Share product
  const shareProduct = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      setShowShareModal(true);
    }
  }, [product]);

  // Copy link to clipboard
  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareModal(false);
    } catch (err) {
      console.log('Failed to copy:', err);
    }
  }, []);

  // Mark review as helpful
  const markHelpful = useCallback(async (reviewId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${reviewId}/helpful`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchReviews(); // Refresh reviews
      }
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  }, [fetchReviews]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (product) {
      fetchReviews();
    }
  }, [product, fetchReviews]);

  // Show skeleton loader while loading
  if (loading) {
    return <SkeletonLoader />;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <FiShoppingBag size={32} className="text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Product Not Found
                </h3>
                <p className="text-gray-600 mb-6">
                  The product you're looking for doesn't exist or has been removed.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => router.back()}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={() => router.push('/products')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Browse Products
                  </button>
                </div>
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

      <main className="flex-1 bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors"
              >
                <FiArrowLeft size={16} />
                <span>Back</span>
              </button>
              <span>/</span>
              <a href="/" className="hover:text-green-600 transition-colors">Home</a>
              <span>/</span>
              {productCategory && (
                <>
                  <a
                    href={`/category/${productCategory.slug}`}
                    className="hover:text-green-600 transition-colors"
                  >
                    {productCategory.name}
                  </a>
                  <span>/</span>
                </>
              )}
              <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* Product Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 mx-auto max-w-8xl  px-4 sm:px-6 lg:px-16 gap-12">
              {/* Product Images */}
              <div className="space-y-4">
                {/* Main Image with Zoom and Navigation */}
                <div className="bg-white rounded-xl  shadow-sm border border-[#00a63d] p-6">
                  <div
                    className="relative aspect-square overflow-hidden rounded-xl cursor-zoom-in"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setZoomImage(false)}
                    onClick={toggleZoom}
                    ref={imageContainerRef}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {imageLoading && (
                      <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl"></div>
                    )}

                    {/* Main Product Image */}
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${productImages[selectedImage]}`}
                      alt={product.name}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'
                        } ${zoomImage ? 'scale-150' : 'scale-100'}`}
                      style={{
                        transformOrigin: zoomImage ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center'
                      }}
                      onLoad={() => setImageLoading(false)}
                      onError={(e) => {
                        e.target.src = '/api/placeholder/600/600';
                        setImageLoading(false);
                      }}
                    />

                    {/* Zoom Overlay */}
                    {zoomImage && (
                      <div className="absolute inset-0 bg-opacity-10 pointer-events-none"></div>
                    )}

                    {/* Navigation Arrows */}
                    {productImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all hover:scale-110"
                        >
                          <FiChevronLeft size={20} className="text-gray-700" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all hover:scale-110"
                        >
                          <FiChevronRightIcon size={20} className="text-gray-700" />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    {productImages.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                        {selectedImage + 1} / {productImages.length}
                      </div>
                    )}

                    {/* Zoom Indicator */}
                    {!zoomImage && (
                      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        Click to zoom
                      </div>
                    )}

                    {/* Stock Status */}
                    {product.stock < 10 && product.stock > 0 && (
                      <div className="absolute top-4 right-4 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Only {product.stock} left
                      </div>
                    )}

                    {product.stock === 0 && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Out of Stock
                      </div>
                    )}
                  </div>
                </div>

                {/* Thumbnail Images with Horizontal Scroll */}
                {productImages.length > 1 && (
                  <div
                    className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide"
                    ref={thumbnailContainerRef}
                  >
                    {productImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${selectedImage === index
                            ? 'border-green-500 ring-2 ring-green-200'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}${image}`}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {/* Category & SKU */}
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {productCategory && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      {productCategory.name}
                    </span>
                  )}
                  {product.sku && (
                    <span>SKU: {product.sku}</span>
                  )}
                </div>

                {/* Product Title */}
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        size={18}
                        className={`${star <= (ratingSummary?.averageRating || product.rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {ratingSummary?.averageRating || product.rating || 0} • {ratingSummary?.totalReviews || 0} reviews
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-green-600">
                    ₹{product.discountPrice || product.price}
                  </span>
                  {discountInfo && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        ₹{product.price}
                      </span>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        Save ₹{discountInfo.discountAmount}
                      </span>
                    </>
                  )}
                </div>

                {/* Short Description */}
                {product.shortDescription && (
                  <div
                    className="text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                  />
                )}

                {/* Pack Size */}
                {product.pack && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-900 mb-1">Pack Size</h4>
                    <p className="text-blue-700">{product.pack}</p>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                        className="p-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiMinus size={16} />
                      </button>
                      <span className="px-4 py-2 text-lg font-semibold min-w-12 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={increaseQuantity}
                        disabled={product.stock === 0 || quantity >= (product.stock || 99)}
                        className="p-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.stock || 99} available
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 bg-green-600 text-white py-4 px-6 rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <FiShoppingBag size={20} />
                    <span>Add to Cart</span>
                  </button> */}

                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 px-6 py-3 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${addedToCart
                      ? 'bg-green-700 text-white'
                      : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                  >
                    {addedToCart ? (
                      <>
                        <FiCheck size={20} className="animate-pulse" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <span>Add to Cart</span>
                    )}
                  </button>

                  <div className="flex space-x-2">
                    <button
                      onClick={handleToggleWishlist}
                      className={`p-4 border rounded-xl transition-all ${isWishlisted
                          ? 'border-red-500 bg-red-50 text-red-600'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                        }`}
                    >
                      <FiHeart
                        size={20}
                        className={isWishlisted ? 'fill-current' : ''}
                      />
                    </button>

                    <button
                      onClick={shareProduct}
                      className="p-4 border border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 transition-colors"
                    >
                      <FiShare2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <FiTruck className="text-green-600" size={20} />
                    <div>
                      <div className="font-semibold text-gray-900">Free Shipping</div>
                      <div className="text-sm text-gray-600">Above ₹499</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FiShield className="text-green-600" size={20} />
                    <div>
                      <div className="font-semibold text-gray-900">Quality Guarantee</div>
                      <div className="text-sm text-gray-600">1 Year Warranty</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FiRefreshCw className="text-green-600" size={20} />
                    <div>
                      <div className="font-semibold text-gray-900">Easy Returns</div>
                      <div className="text-sm text-gray-600">30 Days Policy</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details Tabs */}
            <div className="mt-16 mx-auto max-w-8xl  px-4 sm:px-6 lg:px-16">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  {[
                    { id: 'description', label: 'Description' },
                    { id: 'additional', label: 'Additional Info' },
                    { id: 'reviews', label: `Reviews (${ratingSummary?.totalReviews || 0})` },
                    // { id: 'shipping', label: 'Shipping & Returns' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="py-8">
                {activeTab === 'description' && (
                  <div className="prose prose-lg max-w-none">
                    {product.description ? (
                      <div dangerouslySetInnerHTML={{ __html: product.description }} />
                    ) : (
                      <p className="text-gray-600">No description available for this product.</p>
                    )}
                  </div>
                )}

                {activeTab === 'additional' && (
                  <div className="prose prose-lg max-w-none">
                    {product.additionalInformation ? (
                      <div dangerouslySetInnerHTML={{ __html: product.additionalInformation }} />
                    ) : (
                      <p className="text-gray-600">No additional information available for this product.</p>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <ReviewsSection
                    reviews={reviews}
                    ratingSummary={ratingSummary}
                    product={product}
                    user={user}
                    onReviewSubmit={() => {
                      fetchReviews();
                      setShowReviewModal(false);
                    }}
                    onHelpfulClick={markHelpful}
                    onWriteReview={() => setShowReviewModal(true)}
                  />
                )}

                {activeTab === 'shipping' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Shipping Information</h4>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-center space-x-2">
                            <FiCheck className="text-green-500" size={16} />
                            <span>Free shipping on orders above ₹499</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <FiCheck className="text-green-500" size={16} />
                            <span>Standard delivery: 3-5 business days</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <FiCheck className="text-green-500" size={16} />
                            <span>Express delivery available</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <FiCheck className="text-green-500" size={16} />
                            <span>Cash on delivery available</span>
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Return Policy</h4>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-center space-x-2">
                            <FiCheck className="text-green-500" size={16} />
                            <span>30-day return policy</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <FiCheck className="text-green-500" size={16} />
                            <span>Easy return process</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <FiCheck className="text-green-500" size={16} />
                            <span>Full refund guaranteed</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <FiCheck className="text-green-500" size={16} />
                            <span>No questions asked returns</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <section className="mt-16 max-w-8xl  px-4 sm:px-6 lg:px-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
                  <button
                    onClick={() => router.push('/products')}
                    className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-1"
                  >
                    <span>View All</span>
                    <FiChevronRight size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  {relatedProducts.map((relatedProduct) => (
                    <RelatedProductCard
                      key={relatedProduct._id}
                      product={relatedProduct}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          onClose={() => setShowShareModal(false)}
          onCopyLink={copyLink}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          product={product}
          user={user}
          onClose={() => setShowReviewModal(false)}
          onSubmit={() => {
            fetchReviews();
            setShowReviewModal(false);
          }}
        />
      )}

      <Footer />
    </div>
  );
}

// Reviews Section Component (memoized to prevent re-renders)
const ReviewsSection = React.memo(({ reviews, ratingSummary, product, user, onReviewSubmit, onHelpfulClick, onWriteReview }) => {
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState(null);

  const filteredReviews = useMemo(() =>
    reviews.filter(review =>
      !filterRating || review.rating === filterRating
    ).sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'most_helpful':
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    }), [reviews, filterRating, sortBy]
  );

  return (
    <div className="space-y-8">
      {/* Review Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-[#00a63d] p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 mx-auto max-w-8xl  px-4 sm:px-6 lg:px-16 gap-8">
          {/* Rating Overview */}
          <div className="text-center lg:text-left">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {ratingSummary?.averageRating || 0}
            </div>
            <div className="flex items-center justify-center lg:justify-start space-x-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  size={20}
                  className={`${star <= (ratingSummary?.averageRating || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                    }`}
                />
              ))}
            </div>
            <p className="text-gray-600">
              Based on {ratingSummary?.totalReviews || 0} reviews
            </p>

            {/* Write Review Button */}
            <button
              onClick={onWriteReview}
              className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2 mx-auto lg:mx-0"
            >
              <FiEdit size={16} />
              <span>Write a Review</span>
            </button>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingSummary?.ratingCounts?.[rating] || 0;
              const total = ratingSummary?.totalReviews || 1;
              const percentage = (count / total) * 100;

              return (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm text-gray-600 w-4">{rating}</span>
                    <FiStar size={14} className="text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews Filter and Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterRating(null)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${filterRating === null
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              All
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setFilterRating(rating)}
                className={`px-3 py-1 rounded-full text-sm transition-colors flex items-center space-x-1 ${filterRating === rating
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                <span>{rating}</span>
                <FiStar size={12} className="fill-current" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="most_helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FiStar size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600 mb-6">Be the first to review this product!</p>
            <button
              onClick={onWriteReview}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Write First Review
            </button>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onHelpfulClick={onHelpfulClick}
            />
          ))
        )}
      </div>
    </div>
  );
});

// Review Card Component (memoized)
const ReviewCard = React.memo(({ review, onHelpfulClick }) => {
  const [showFullReview, setShowFullReview] = useState(false);

  const isLongReview = review.comment.length > 300;
  const displayComment = showFullReview ? review.comment : review.comment.slice(0, 300) + (isLongReview ? '...' : '');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 font-semibold text-sm">
              {review.user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {review.user?.name || 'Anonymous User'}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    size={14}
                    className={`${star <= review.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                      }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {review.verifiedPurchase && (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
            Verified Purchase
          </span>
        )}
      </div>

      <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>

      <p className="text-gray-600 leading-relaxed mb-4">
        {displayComment}
        {isLongReview && (
          <button
            onClick={() => setShowFullReview(!showFullReview)}
            className="text-green-600 hover:text-green-700 font-medium ml-1"
          >
            {showFullReview ? 'Show less' : 'Read more'}
          </button>
        )}
      </p>

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex space-x-2 mb-4">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
            />
          ))}
        </div>
      )}

      {/* Admin Response */}
      {review.adminResponse && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-semibold text-blue-900">Admin Response</span>
            <span className="text-sm text-blue-600">
              {new Date(review.adminResponse.respondedAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-blue-700">{review.adminResponse.comment}</p>
        </div>
      )}

      {/* Helpful Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={() => onHelpfulClick(review._id)}
          className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
        >
          <FiThumbsUp size={16} />
          <span>Helpful ({review.helpful})</span>
        </button>
      </div>
    </div>
  );
});

// Review Modal Component (memoized)
const ReviewModal = React.memo(({ product, user, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!title.trim() || !comment.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id,
          rating,
          title: title.trim(),
          comment: comment.trim(),
          images
        })
      });

      const data = await response.json();

      if (data.success) {
        onSubmit();
        // Reset form
        setRating(0);
        setTitle('');
        setComment('');
        setImages([]);
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Submit review error:', error);
      alert('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // Here you would typically upload images to your server
    // For now, we'll just use object URLs
    const newImages = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0  bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-2xl max-w-2xl border-2 border-gray-400 w-full max-h-[90vh] overflow-y-auto overflow-hidden z-50">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Write a Review</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${product.thumbImg}`}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <h4 className="font-semibold text-gray-900">{product.name}</h4>
              <p className="text-green-600 font-semibold">
                ₹{product.discountPrice || product.price}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Overall Rating *
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <FiStar
                    size={32}
                    className={`${star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                      }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Review Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Review Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Your Review *
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details of your experience with this product"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Photos (Optional)
            </label>
            <div className="flex flex-wrap gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Review ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-green-500 transition-colors">
                <FiCamera size={24} className="text-gray-400" />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

// Share Modal Component (memoized)
const ShareModal = React.memo(({ onClose, onCopyLink }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 z-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Product</h3>
        <div className="space-y-3">
          <button
            onClick={onCopyLink}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Copy Link
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
});

// Related Product Card Component (memoized)
const RelatedProductCard = React.memo(({ product }) => {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleProductClick = useCallback(() => {
    router.push(`/product/${product.slug}`);
  }, [router, product.slug]);

  return (
    <div
      onClick={handleProductClick}
      className="bg-white rounded-md shadow-md  transition-all duration-300 border border-[#00a63d] overflow-hidden group hover:border-[#00a63d] cursor-pointer"
    >
      <div className="relative overflow-hidden">
        <div className={`w-full aspect-square bg-gray-100 ${!imageLoaded ? 'animate-pulse' : ''}`}>
          {!imageError ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${product.thumbImg}`}
              className={`w-full h-full object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                } group-hover:scale-110`}
              alt={product.name}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <FiShoppingBag size={32} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
            {discountPercentage}% OFF
          </div>
        )} */}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-700 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-green-600">
              ₹{product.discountPrice || product.price}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.price}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 text-yellow-400">
            <FiStar size={14} className="fill-current" />
            <span className="text-sm text-gray-600">{product.rating || 4.5}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

// Add this CSS for hiding scrollbars
const styles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

// Add styles to head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style")
  styleSheet.innerText = styles
  document.head.appendChild(styleSheet)
}
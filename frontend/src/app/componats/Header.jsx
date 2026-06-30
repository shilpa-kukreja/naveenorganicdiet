// "use client";
// import React, { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
// import {
//     Search,
//     User,
//     Heart,
//     ShoppingCart,
//     X,
//     ChevronDown,
//     Phone,
//     MapPin,
//     Tag,
//     Star,
// } from 'lucide-react';
// import Link from 'next/link';
// import { AppContext } from "@/app/context/AppContext";
// import { useRouter } from 'next/navigation';
// import OrderSummary from './OrderSummary';

// function Header() {
//     const router = useRouter();
//     const { categories, products, getCartCount,
//         cartItems,
//         setCartItems,
//         removeFromCart,
//         updateCartItemQuantity,
//         wishlist,
//         addToCart,
//         isInWishlist,
//         toggleWishlist,
//         getwhichlistcount,
//         calculateCartTotal, } = useContext(AppContext);
//     const [isCartOpen, setIsCartOpen] = useState(false);
//     const [isWishlistOpen, setIsWishlistOpen] = useState(false);
//     const [isCategoryHovered, setIsCategoryHovered] = useState(false);
//     const [isScrolled, setIsScrolled] = useState(false);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [searchResults, setSearchResults] = useState([]);
//     const [user, setUser] = useState(null);
//     const [isLoggedIn, setIsLoggedIn] = useState(false);
//     const [showSearchResults, setShowSearchResults] = useState(false);
//     const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
//     const userMenuRef = useRef(null);

//     // console.log("cartItems", cartItems);
//     // console.log("whichlist", wishlist);

//     // Memoized categories for dropdown
//     const categoryGroups = useMemo(() => {
//         if (!categories.length) return [];

//         // Group categories by type or create default groups
//         const beverageCategories = categories.filter(cat =>
//             cat.name.toLowerCase().includes('drink') ||
//             cat.name.toLowerCase().includes('juice') ||
//             cat.name.toLowerCase().includes('beverage')
//         );

//         const dessertCategories = categories.filter(cat =>
//             cat.name.toLowerCase().includes('dessert') ||
//             cat.name.toLowerCase().includes('sweet') ||
//             cat.name.toLowerCase().includes('snack')
//         );

//         const freshCategories = categories.filter(cat =>
//             cat.name.toLowerCase().includes('fresh') ||
//             cat.name.toLowerCase().includes('fruit') ||
//             cat.name.toLowerCase().includes('vegetable')
//         );

//         const otherCategories = categories.filter(cat =>
//             !beverageCategories.includes(cat) &&
//             !dessertCategories.includes(cat) &&
//             !freshCategories.includes(cat)
//         );

//         return [
//             {
//                 title: "Beverages",
//                 categories: beverageCategories.slice(0, 4)
//             },
//             {
//                 title: "Desserts & Snacks",
//                 categories: dessertCategories.slice(0, 4)
//             },
//             {
//                 title: "Fresh Produce",
//                 categories: freshCategories.slice(0, 4)
//             },
//             {
//                 title: "Other Categories",
//                 categories: otherCategories.slice(0, 4)
//             }
//         ];
//     }, [categories]);

//     const navigationItems = [
//         { tab: 'Home', link: '/' },
//         { tab: 'Shop', link: '/all-products' },
//         { tab: 'About', link: '/about-us' },
//         { tab: 'Contact', link: '/contact' }
//     ];

//     // Handle scroll effect
//     useEffect(() => {
//         const handleScroll = () => {
//             setIsScrolled(window.scrollY > 50);
//         };
//         window.addEventListener('scroll', handleScroll);
//         return () => window.removeEventListener('scroll', handleScroll);
//     }, []);

//     // Handle logout
//     const handleLogout = () => {
//         localStorage.removeItem("token");
//         setIsLoggedIn(false);
//         setUser(null);
//         setIsUserMenuOpen(false);
//         router.push("/login");
//     };

//     // Detect login + fetch user
//     useEffect(() => {
//         const token = localStorage.getItem("token");
//         setIsLoggedIn(!!token);

//         if (token) {
//             fetch("http://localhost:5000/api/users/getuser", {
//                 headers: { Authorization: `Bearer ${token}` }
//             })
//                 .then(res => res.json())
//                 .then(data => {
//                     if (data.success) setUser(data.user);
//                 })
//                 .catch(err => console.error("User fetch failed:", err));
//         }
//     }, []);

//     // Handle click outside for dropdowns
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
//                 setIsUserMenuOpen(false);
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, [isUserMenuOpen]);

//     // Search functionality
//     const performSearch = useCallback((query) => {
//         if (!query.trim() || !products.length) {
//             setSearchResults([]);
//             setShowSearchResults(false);
//             return;
//         }

//         const results = products.filter(product =>
//             product.name?.toLowerCase().includes(query.toLowerCase()) ||
//             product.description?.toLowerCase().includes(query.toLowerCase()) ||
//             product.category?.name?.toLowerCase().includes(query.toLowerCase()) ||
//             product.sku?.toLowerCase().includes(query.toLowerCase())
//         ).slice(0, 8); // Limit to 8 results

//         setSearchResults(results);
//         setShowSearchResults(true);
//     }, [products]);

//     // Debounced search
//     useEffect(() => {
//         const timeoutId = setTimeout(() => {
//             performSearch(searchQuery);
//         }, 300);

//         return () => clearTimeout(timeoutId);
//     }, [searchQuery, performSearch]);

//     // Close drawers when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (isCartOpen && !event.target.closest('.cart-drawer')) {
//                 setIsCartOpen(false);
//             }
//             if (isWishlistOpen && !event.target.closest('.wishlist-drawer')) {
//                 setIsWishlistOpen(false);
//             }
//             if (showSearchResults && !event.target.closest('.search-container')) {
//                 setShowSearchResults(false);
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [isCartOpen, isWishlistOpen, showSearchResults]);

//     // Handle search submission
//     const handleSearchSubmit = (e) => {
//         e.preventDefault();
//         if (searchQuery.trim()) {
//             router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
//             setShowSearchResults(false);
//         }
//     };

//     // Handle product click from search results
//     const handleProductClick = (productSlug) => {
//         router.push(`/product/${productSlug}`);
//         setShowSearchResults(false);
//         setSearchQuery('');
//     };

//     // Handle category click
//     const handleCategoryClick = (categorySlug) => {
//         router.push(`/category/${categorySlug}`);
//         setIsCategoryHovered(false);
//     };

//     return (
//         <div className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-white shadow-sm'}`}>
//             {/* Top Bar */}
//             <div className="bg-gradient-to-r from-green-900 to-green-800 text-white py-2 text-sm">
//                 <div className="container mx-auto px-4">
//                     <div className="flex justify-between items-center">
//                         <div className="flex items-center space-x-6">
//                             <div className="flex items-center space-x-2">
//                                 <MapPin size={14} />
//                                 <span>Mark Street, New York</span>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                                 <Phone size={14} />
//                                 <span>+1 (985) 825-6666</span>
//                             </div>
//                         </div>

//                         <div className="flex items-center space-x-4">
//                             <div className="flex items-center space-x-2 bg-green-700 px-3 py-1 rounded-full">
//                                 <Tag size={14} />
//                                 <span className="text-xs font-medium">Weekly Discount Up to 30%!</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Main Header */}
//             <div className=''>
//                 <div className="container mx-auto py-2">
//                     <div className="flex items-center justify-between">
//                         {/* Logo */}
//                         <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
//                             <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-800 rounded-lg flex items-center justify-center">
//                                 <span className="text-white font-bold text-lg">M</span>
//                             </div>
//                             <div>
//                                 <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
//                                     MarketPlace
//                                 </h1>
//                                 <p className="text-xs text-gray-500">Premium Shopping</p>
//                             </div>
//                         </Link>

//                         {/* Search Bar */}
//                         <div className="flex-1 max-w-2xl mx-8 search-container">
//                             <form onSubmit={handleSearchSubmit} className="relative">
//                                 <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
//                                     <Search size={20} />
//                                 </div>
//                                 <input
//                                     type="text"
//                                     value={searchQuery}
//                                     onChange={(e) => setSearchQuery(e.target.value)}
//                                     placeholder="Search for products, brands and categories..."
//                                     className="w-full pl-12 pr-32 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
//                                 />
//                                 <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
//                                     <div className="w-px h-6 bg-gray-300"></div>
//                                     <button
//                                         type="submit"
//                                         className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
//                                     >
//                                         Search
//                                     </button>
//                                 </div>

//                                 {/* Search Results Dropdown */}
//                                 {showSearchResults && searchResults.length > 0 && (
//                                     <div className="absolute top-full left-0 right-0 bg-white shadow-2xl rounded-xl mt-2 border border-gray-200 max-h-96 overflow-y-auto z-50">
//                                         <div className="p-4">
//                                             <h3 className="font-semibold text-gray-900 mb-3">Search Results</h3>
//                                             <div className="space-y-2">
//                                                 {searchResults.map((product) => (
//                                                     <div
//                                                         key={product._id}
//                                                         onClick={() => handleProductClick(product.slug)}
//                                                         className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
//                                                     >
//                                                         <img
//                                                             src={`http://localhost:5000${product.thumbImg}`}
//                                                             alt={product.name}
//                                                             className="w-12 h-12 object-cover rounded-md"
//                                                             onError={(e) => {
//                                                                 e.target.src = '/api/placeholder/60/60';
//                                                             }}
//                                                         />
//                                                         <div className="flex-1 min-w-0">
//                                                             <p className="font-medium text-gray-900 truncate">
//                                                                 {product.name}
//                                                             </p>
//                                                             <p className="text-sm text-green-600 font-semibold">
//                                                                 ₹{product.discountPrice || product.price}
//                                                             </p>
//                                                         </div>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* No Results Found */}
//                                 {showSearchResults && searchQuery && searchResults.length === 0 && (
//                                     <div className="absolute top-full left-0 right-0 bg-white shadow-2xl rounded-xl mt-2 border border-gray-200 z-50">
//                                         <div className="p-6 text-center">
//                                             <Search size={48} className="text-gray-300 mx-auto mb-3" />
//                                             <p className="text-gray-600">No products found for "{searchQuery}"</p>
//                                             <p className="text-sm text-gray-500 mt-1">Try different keywords</p>
//                                         </div>
//                                     </div>
//                                 )}
//                             </form>
//                         </div>

//                         {/* Action Icons */}
//                         <div className="flex items-center space-x-6">
//                             {/* User Account */}
//                             <div className="relative" ref={userMenuRef}>
//                                 {isLoggedIn ? (
//                                     <>
//                                         <button
//                                             onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
//                                             className="flex flex-col items-center space-y-1 text-gray-700 hover:text-green-600 transition-colors duration-200 group"
//                                             aria-label="User Menu"
//                                         >
//                                             <div className="p-2 rounded-full bg-gray-100 group-hover:bg-green-100 transition-colors duration-200">
//                                                 <User size={20} />
//                                             </div>
//                                             <span className="text-xs font-medium">Account</span>
//                                         </button>

//                                         {isUserMenuOpen && (
//                                             <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100 animate-fadeIn">
//                                                 {/* User Info */}
//                                                 <div className="px-4 py-3 border-b border-gray-100">
//                                                     <p className="text-sm font-medium text-gray-900 truncate">
//                                                         {user?.username || "User"}
//                                                     </p>
//                                                     <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
//                                                 </div>

//                                                 {/* Dashboard */}
//                                                 <Link
//                                                     href="/dashboard"
//                                                     className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 transition-colors duration-150"
//                                                     onClick={() => setIsUserMenuOpen(false)}
//                                                 >
//                                                     <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                                                     </svg>
//                                                     My Dashboard
//                                                 </Link>

//                                                 {/* My Orders */}
//                                                 <Link
//                                                     href="/orders"
//                                                     className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 transition-colors duration-150"
//                                                     onClick={() => setIsUserMenuOpen(false)}
//                                                 >
//                                                     <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
//                                                     </svg>
//                                                     My Orders
//                                                 </Link>

//                                                 {/* Referral Dashboard */}
//                                                 <Link
//                                                     href="/referral-dashboard"
//                                                     className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 transition-colors duration-150"
//                                                     onClick={() => setIsUserMenuOpen(false)}
//                                                 >
//                                                     <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                                                     </svg>
//                                                     Referral Dashboard
//                                                 </Link>

//                                                 <div className="border-t border-gray-100 my-1"></div>

//                                                 {/* Logout */}
//                                                 <button
//                                                     onClick={handleLogout}
//                                                     className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
//                                                 >
//                                                     <svg className="h-5 w-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                                                     </svg>
//                                                     Logout
//                                                 </button>
//                                             </div>
//                                         )}
//                                     </>
//                                 ) : (
//                                     <Link href="/login">
//                                         <button
//                                             aria-label="Login"
//                                             className="flex flex-col items-center space-y-1 text-gray-700 hover:text-green-600 transition-colors duration-200 group"
//                                         >
//                                             <div className="p-2 rounded-full bg-gray-100 group-hover:bg-green-100 transition-colors duration-200">
//                                                 <User size={20} />
//                                             </div>
//                                             <span className="text-xs font-medium">Sign In</span>
//                                         </button>
//                                     </Link>
//                                 )}
//                             </div>

//                             {/* Wishlist */}
//                             <button
//                                 onClick={() => setIsWishlistOpen(true)}
//                                 className="flex flex-col items-center space-y-1 text-gray-700 hover:text-red-600 transition-colors duration-200 group relative"
//                             >
//                                 <div className="p-2 rounded-full bg-gray-100 group-hover:bg-red-100 transition-colors duration-200">
//                                     <Heart size={20} />
//                                 </div>
//                                 <span className="text-xs font-medium">Wishlist</span>

//                                 <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-medium">
//                                     {getwhichlistcount()}
//                                 </span>
//                             </button>

//                             {/* Cart */}
//                             <button
//                                 onClick={() => setIsCartOpen(true)}
//                                 className="flex flex-col items-center space-y-1 text-gray-700 hover:text-green-600 transition-colors duration-200 group relative"
//                             >
//                                 <div className="p-2 rounded-full bg-gray-100 group-hover:bg-green-100 transition-colors duration-200">
//                                     <ShoppingCart size={20} />
//                                 </div>
//                                 <span className="text-xs font-medium">Cart</span>

//                                 <span className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-medium">
//                                     {getCartCount()}
//                                 </span>
//                             </button>
//                         </div>

//                     </div>
//                 </div>
//                 <hr className='border-gray-300' />
//                 <div className="container mx-auto">
//                     {/* Navigation */}
//                     <nav className="py-2">
//                         <div className="flex items-center justify-between">
//                             <div className="flex items-center space-x-8">
//                                 {/* Categories Dropdown */}
//                                 {categories.length > 0 && (
//                                     <div className="relative"
//                                         onMouseEnter={() => setIsCategoryHovered(true)}
//                                         onMouseLeave={() => setIsCategoryHovered(false)}
//                                     >
//                                         {/* Button */}
//                                         <button className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition   font-semibold shadow-md">
//                                             <span>All Categories</span>
//                                             <ChevronDown size={16} />
//                                         </button>

//                                         {/* Dropdown */}
//                                         {isCategoryHovered && (
//                                             <div className="absolute top-full left-0 mt-1 bg-white shadow-xl rounded-md  py-3 min-w-[300px] z-50 border border-[#00a63d] animate-fadeIn">
//                                                 <div className="grid grid-cols-1 gap-4 px-6">

//                                                     {categoryGroups.map((group, index) => (
//                                                         <div key={index}>
//                                                             <ul className="space-y-2">
//                                                                 {group.categories.map((category) => (
//                                                                     <li key={category._id}>
//                                                                         <button
//                                                                             onClick={() => handleCategoryClick(category.slug)}
//                                                                             className="w-full border border-green-500 rounded-md shadow-md  cursor-pointer text-left px-3 py-2 rounded-lg 
//                              text-gray-700 hover:text-green-700  font-medium
//                              hover:bg-green-50 transition-all duration-200"
//                                                                         >
//                                                                             {category.name}
//                                                                         </button>
//                                                                     </li>
//                                                                 ))}
//                                                             </ul>
//                                                         </div>
//                                                     ))}

//                                                 </div>
//                                             </div>
//                                         )}

//                                     </div>

//                                 )}

//                                 {/* Navigation Links */}
//                                 <div className="flex items-center space-x-8">
//                                     {navigationItems.map((item) => (
//                                         <Link
//                                             key={item.tab}
//                                             href={item.link}
//                                             className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 relative group"
//                                         >
//                                             {item.tab}
//                                             <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full"></span>
//                                         </Link>
//                                     ))}
//                                 </div>
//                             </div>

//                             {/* Support Info */}
//                             <div className="flex items-center space-x-2 text-sm text-gray-600">
//                                 <Star className="w-4 h-4 text-yellow-400 fill-current" />
//                                 <span>24/7 Customer Support</span>
//                             </div>
//                         </div>
//                     </nav>
//                 </div>
//             </div>

//             {/* Cart Drawer */}
//             {isCartOpen && (
//                 <div className="fixed inset-0 z-50">
//                     <div className="absolute inset-0 bg-black opacity-50" onClick={() => setIsCartOpen(false)}></div>
//                     <div className="cart-drawer absolute right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300">
//                         <CartDrawer onClose={() => setIsCartOpen(false)} />
//                     </div>
//                 </div>
//             )}

//             {/* Wishlist Drawer */}
//             {isWishlistOpen && (
//                 <div className="fixed inset-0 z-50">
//                     <div className="absolute inset-0 bg-black opacity-50" onClick={() => setIsWishlistOpen(false)}></div>
//                     <div className="wishlist-drawer absolute right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300">
//                         <WishlistDrawer onClose={() => setIsWishlistOpen(false)} />
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// // Separate Cart Drawer Component
// const CartDrawer = ({ onClose }) => {
//     const {
//         cartItems,
//         removeFromCart,
//         updateCartItemQuantity,
//         calculateCartTotal,
//         getCartCount
//     } = useContext(AppContext);
//     const router = useRouter();

//     const handleQuantityChange = (itemId, newQuantity) => {
//         if (newQuantity < 1) return;
//         updateCartItemQuantity(itemId, newQuantity);
//     };

//     const handleRemoveItem = (itemId) => {
//         removeFromCart(itemId);
//     };

//     const handleCheckout = () => {
//         onClose();
//         router.push('/checkout');
//     };

//     const handleViewCart = () => {
//         onClose();
//         router.push('/cart');
//     };

//     const subtotal = calculateCartTotal();
//     const shipping = subtotal > 0 ? 5.00 : 0; // Example shipping cost
//     const tax = subtotal * 0.08; // Example tax 8%
//     const total = subtotal + shipping + tax;

//     return (
//         <div className="flex flex-col h-full">
//             {/* Header */}
//             <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
//                 <div className="flex items-center space-x-2">
//                     <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
//                     {cartItems.length > 0 && (
//                         <span className="bg-green-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-medium">
//                             {getCartCount()}
//                         </span>
//                     )}
//                 </div>
//                 <button
//                     onClick={onClose}
//                     className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
//                 >
//                     <X size={20} />
//                 </button>
//             </div>

//             {/* Cart Items */}
//             <div className="flex-1 overflow-y-auto">
//                 {cartItems.length === 0 ? (
//                     // Empty Cart State
//                     <div className="flex flex-col items-center justify-center p-6 h-full">
//                         <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
//                             <ShoppingCart size={32} className="text-gray-400" />
//                         </div>
//                         <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
//                         <p className="text-gray-500 text-center mb-6">
//                             Looks like you haven't added anything to your cart yet.
//                         </p>
//                         <button
//                             onClick={onClose}
//                             className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
//                         >
//                             Continue Shopping
//                         </button>
//                     </div>
//                 ) : (
//                     // Cart Items List
//                     <div className="p-4 space-y-4">
//                         {cartItems.map((item,index) => (
//                             <div
//                                 key={item._id ?? item.id ?? item.slug ?? index}
//                                 className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
//                             >
//                                 {/* Product Image */}
//                                 <div className="flex-shrink-0">
//                                     <img
//                                         src={item.image || item.thumbImg || '/api/placeholder/60/60'}
//                                         alt={item.name}
//                                         className="w-16 h-16 object-cover rounded-lg"
//                                         onError={(e) => {
//                                             e.target.src = '/api/placeholder/60/60';
//                                         }}
//                                     />
//                                 </div>

//                                 {/* Product Details */}
//                                 <div className="flex-1 min-w-0">
//                                     <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
//                                         {item.name}
//                                     </h4>
//                                     <p className="text-green-600 font-semibold text-sm">
//                                         ₹{item.price || item.discountPrice}
//                                     </p>

//                                     {/* Quantity Controls */}
//                                     <div className="flex items-center justify-between mt-2">
//                                         <div className="flex items-center space-x-2">
//                                             <button
//                                                 onClick={() => handleQuantityChange(item.id, item.quantity - 1)}

//                                                 disabled={item.quantity <= 1}
//                                                 className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                                             >
//                                                 <span className="text-sm">-</span>
//                                             </button>
//                                             <span className="w-8 text-center text-sm font-medium">
//                                                 {item.quantity}
//                                             </span>
//                                             <button
//                                                 onClick={() => handleQuantityChange( item.id, item.quantity + 1)}
//                                                 className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
//                                             >
//                                                 <span className="text-sm">+</span>
//                                             </button>
//                                         </div>

//                                         {/* Remove Button */}
//                                         <button
//                                             onClick={() => handleRemoveItem(item.id)}

//                                             className="text-red-500 hover:text-red-700 p-1 transition-colors"
//                                         >
//                                             <X size={16} />
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>

//             {/* Footer - Only show when cart has items */}
//             {cartItems.length > 0 && (
//                 <OrderSummary subtotal={calculateCartTotal()} onClose={onClose} />
//             )}
//         </div>
//     );
// };

// // Updated Wishlist Drawer Component with Add to Cart functionality
// const WishlistDrawer = ({ onClose }) => {
//     const {
//         wishlist,
//         toggleWishlist,
//         addToCart,
//         getwhichlistcount
//     } = useContext(AppContext);
//     const router = useRouter();

//     const handleAddToCart = (product) => {
//         addToCart(product, product.discountPrice || product.price, 1);
//         // Optional: Show a success message or notification
//     };

//     const handleRemoveFromWishlist = (productId) => {
//         toggleWishlist(productId);
//     };

//     const handleProductClick = (productSlug) => {
//         onClose();
//         router.push(`/product/${productSlug}`);
//     };

//     const handleViewAllWishlist = () => {
//         onClose();
//         router.push('/wishlist');
//     };

//     return (
//         <div className="flex flex-col h-full">
//             {/* Header */}
//             <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
//                 <div className="flex items-center space-x-2">
//                     <h2 className="text-xl font-bold text-gray-900">Your Wishlist</h2>
//                     {wishlist.length > 0 && (
//                         <span className="bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-medium">
//                             {getwhichlistcount()}
//                         </span>
//                     )}
//                 </div>
//                 <button
//                     onClick={onClose}
//                     className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
//                 >
//                     <X size={20} />
//                 </button>
//             </div>

//             {/* Wishlist Items */}
//             <div className="flex-1 overflow-y-auto">
//                 {wishlist.length === 0 ? (
//                     // Empty Wishlist State
//                     <div className="flex flex-col items-center justify-center p-6 h-full">
//                         <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-4">
//                             <Heart size={32} className="text-red-400" />
//                         </div>
//                         <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
//                         <p className="text-gray-500 text-center mb-6">
//                             Save your favorite items here for later.
//                         </p>
//                         <button
//                             onClick={onClose}
//                             className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
//                         >
//                             Start Shopping
//                         </button>
//                     </div>
//                 ) : (
//                     // Wishlist Items List
//                     <div className="p-4 space-y-4">
//                         {wishlist.map((product, index) => (
//                             <div
//                                 key={product._id ?? product.id ?? product.slug ?? index}
//                                 className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
//                             >
//                                 {/* Product Image */}
//                                 <div className="flex-shrink-0">
//                                     <img
//                                         src={`http://localhost:5000${product.thumbImg}`}
//                                         alt={product.name}
//                                         className="w-16 h-16 object-cover rounded-lg"
//                                         onError={(e) => {
//                                             e.target.src = '/api/placeholder/60/60';
//                                         }}
//                                         onClick={() => handleProductClick(product.slug)}
//                                         style={{ cursor: 'pointer' }}
//                                     />
//                                 </div>

//                                 {/* Product Details */}
//                                 <div className="flex-1 min-w-0">
//                                     <h4
//                                         className="font-medium text-gray-900 text-sm line-clamp-2 mb-1 cursor-pointer hover:text-green-600"
//                                         onClick={() => handleProductClick(product.slug)}
//                                     >
//                                         {product.name}
//                                     </h4>
//                                     <p className="text-green-600 font-semibold text-sm mb-2">
//                                         ₹{product.discountPrice || product.price}
//                                     </p>

//                                     {/* Action Buttons */}
//                                     <div className="flex items-center justify-between mt-2">
//                                         <button
//                                             onClick={() => handleAddToCart(product)}
//                                             className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700 transition-colors duration-200 font-medium flex items-center"
//                                         >
//                                             <ShoppingCart size={12} className="mr-1" />
//                                             Add to Cart
//                                         </button>

//                                         {/* Remove from Wishlist Button */}
//                                         <button
//                                             onClick={() => handleRemoveFromWishlist(product._id)}
//                                             className="text-red-500 hover:text-red-700 p-1 transition-colors"
//                                             title="Remove from wishlist"
//                                         >
//                                             <X size={16} />
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>

//             {/* Footer - Only show when wishlist has items */}
//             {wishlist.length > 0 && (
//                 <div className="border-t border-gray-200 p-6 space-y-4 bg-white">
//                     {/* Summary */}
//                     <div className="summary-section">
//                         <div className="flex justify-between items-center mb-4">
//                             <span className="text-sm text-gray-600">
//                                 {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in wishlist
//                             </span>
//                         </div>
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="action-buttons space-y-3">
//                         {/* <button
//                             onClick={handleViewAllWishlist}
//                             className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
//                         >
//                             View All Wishlist
//                         </button> */}
//                         <button
//                             onClick={onClose}
//                             className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium flex items-center justify-center"
//                         >
//                             Continue Shopping
//                             <ShoppingCart size={16} className="ml-2" />
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Header;


// "use client";
// import React, { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
// import {
//     Search,
//     User,
//     Heart,
//     ShoppingCart,
//     X,
//     ChevronDown,
//     Phone,
//     MapPin,
//     Tag,
//     Star,
//     Menu,
//     ChevronRight,
//     Home,
//     ShoppingBag,
//     Info,
//     Mail,
//     LogOut,
//     Package,
//     Gift,
//     Settings,
//     ChevronUp,
    
// } from 'lucide-react';
// import { FiCheck } from 'react-icons/fi';
// import Link from 'next/link';
// import { AppContext } from "@/app/context/AppContext";
// import { useRouter } from 'next/navigation';
// import OrderSummary from './OrderSummary';
// import GoogleTranslate from './GoogleTranslate';

// function Header() {
//     const router = useRouter();
//     const { categories, products, getCartCount,
//         cartItems,
//         removeFromCart,
//         updateCartItemQuantity,
//         wishlist,
//         addToCart,
//         toggleWishlist,
//         getwhichlistcount,
//         calculateCartTotal, } = useContext(AppContext);
//     const [isCartOpen, setIsCartOpen] = useState(false);
//     const [isWishlistOpen, setIsWishlistOpen] = useState(false);
//     const [isCategoryHovered, setIsCategoryHovered] = useState(false);
//     const [isScrolled, setIsScrolled] = useState(false);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [searchResults, setSearchResults] = useState([]);
//     const [user, setUser] = useState(null);
//     const [isLoggedIn, setIsLoggedIn] = useState(false);
//     const [showSearchResults, setShowSearchResults] = useState(false);
//     const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
//     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//     const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
//     const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
//     const userMenuRef = useRef(null);
//     const mobileUserMenuRef = useRef(null);
//     const mobileMenuRef = useRef(null);
//     const searchRef = useRef(null);

//     // Memoized categories for dropdown
//     const categoryGroups = useMemo(() => {
//         if (!categories.length) return [];

//         const beverageCategories = categories.filter(cat =>
//             cat.name.toLowerCase().includes('drink') ||
//             cat.name.toLowerCase().includes('juice') ||
//             cat.name.toLowerCase().includes('beverage')
//         );

//         const dessertCategories = categories.filter(cat =>
//             cat.name.toLowerCase().includes('dessert') ||
//             cat.name.toLowerCase().includes('sweet') ||
//             cat.name.toLowerCase().includes('snack')
//         );

//         const freshCategories = categories.filter(cat =>
//             cat.name.toLowerCase().includes('fresh') ||
//             cat.name.toLowerCase().includes('fruit') ||
//             cat.name.toLowerCase().includes('vegetable')
//         );

//         const otherCategories = categories.filter(cat =>
//             !beverageCategories.includes(cat) &&
//             !dessertCategories.includes(cat) &&
//             !freshCategories.includes(cat)
//         );

//         return [
//             {
//                 title: "Beverages",
//                 categories: beverageCategories.slice(0, 4)
//             },
//             {
//                 title: "Desserts & Snacks",
//                 categories: dessertCategories.slice(0, 4)
//             },
//             {
//                 title: "Fresh Produce",
//                 categories: freshCategories.slice(0, 4)
//             },
//             {
//                 title: "Other Categories",
//                 categories: otherCategories.slice(0, 4)
//             }
//         ];
//     }, [categories]);

//     const navigationItems = [
//         { tab: 'Home', link: '/', icon: Home },
//         { tab: 'Shop', link: '/all-products', icon: ShoppingBag },
//         { tab: 'About', link: '/about-us', icon: Info },
//         { tab: 'Contact', link: '/contact', icon: Mail }
//     ];

//     // Handle scroll effect
//     useEffect(() => {
//         const handleScroll = () => {
//             setIsScrolled(window.scrollY > 50);
//         };
//         window.addEventListener('scroll', handleScroll);
//         return () => window.removeEventListener('scroll', handleScroll);
//     }, []);

//     // Handle logout
//     const handleLogout = () => {
//         localStorage.removeItem("token");
//         setIsLoggedIn(false);
//         setUser(null);
//         setIsUserMenuOpen(false);
//         setIsMobileUserMenuOpen(false);
//         setIsMobileMenuOpen(false);
//         router.push("/login");
//     };

//     // Detect login + fetch user
//     useEffect(() => {
//         const token = localStorage.getItem("token");
//         setIsLoggedIn(!!token);

//         if (token) {
//             fetch("http://localhost:5000/api/users/getuser", {
//                 headers: { Authorization: `Bearer ${token}` }
//             })
//                 .then(res => res.json())
//                 .then(data => {
//                     if (data.success) setUser(data.user);
//                 })
//                 .catch(err => console.error("User fetch failed:", err));
//         }
//     }, []);

//     // Handle click outside for dropdowns
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             // Close desktop user menu
//             if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
//                 setIsUserMenuOpen(false);
//             }

//             // Close mobile user menu
//             if (isMobileUserMenuOpen && mobileUserMenuRef.current && !mobileUserMenuRef.current.contains(event.target)) {
//                 setIsMobileUserMenuOpen(false);
//             }

//             // Close mobile menu
//             if (isMobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
//                 setIsMobileMenuOpen(false);
//             }

//             // Close mobile search
//             if (isMobileSearchOpen && searchRef.current && !searchRef.current.contains(event.target)) {
//                 setIsMobileSearchOpen(false);
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, [isUserMenuOpen, isMobileUserMenuOpen, isMobileMenuOpen, isMobileSearchOpen]);

//     // Close drawers when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (isCartOpen && !event.target.closest('.cart-drawer')) {
//                 setIsCartOpen(false);
//             }
//             if (isWishlistOpen && !event.target.closest('.wishlist-drawer')) {
//                 setIsWishlistOpen(false);
//             }
//             if (showSearchResults && !event.target.closest('.search-container')) {
//                 setShowSearchResults(false);
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [isCartOpen, isWishlistOpen, showSearchResults]);

//     // Search functionality
//     const performSearch = useCallback((query) => {
//         if (!query.trim() || !products.length) {
//             setSearchResults([]);
//             setShowSearchResults(false);
//             return;
//         }

//         const results = products.filter(product =>
//             product.name?.toLowerCase().includes(query.toLowerCase()) ||
//             product.description?.toLowerCase().includes(query.toLowerCase()) ||
//             product.category?.name?.toLowerCase().includes(query.toLowerCase()) ||
//             product.sku?.toLowerCase().includes(query.toLowerCase())
//         ).slice(0, 8);

//         setSearchResults(results);
//         setShowSearchResults(true);
//     }, [products]);

//     // Debounced search
//     useEffect(() => {
//         const timeoutId = setTimeout(() => {
//             performSearch(searchQuery);
//         }, 300);

//         return () => clearTimeout(timeoutId);
//     }, [searchQuery, performSearch]);

//     // Handle search submission
//     const handleSearchSubmit = (e) => {
//         e.preventDefault();
//         if (searchQuery.trim()) {
//             router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
//             setShowSearchResults(false);
//             setIsMobileSearchOpen(false);
//         }
//     };

//     // Handle product click from search results
//     const handleProductClick = (productSlug) => {
//         router.push(`/product/${productSlug}`);
//         setShowSearchResults(false);
//         setSearchQuery('');
//         setIsMobileSearchOpen(false);
//     };

//     // Handle category click
//     const handleCategoryClick = (categorySlug) => {
//         router.push(`/category/${categorySlug}`);
//         setIsCategoryHovered(false);
//         setIsMobileMenuOpen(false);
//     };

//     // Prevent body scroll when mobile menu is open
//     useEffect(() => {
//         if (isMobileMenuOpen || isCartOpen || isWishlistOpen || isMobileUserMenuOpen) {
//             document.body.style.overflow = 'hidden';
//         } else {
//             document.body.style.overflow = 'auto';
//         }
//         return () => {
//             document.body.style.overflow = 'auto';
//         };
//     }, [isMobileMenuOpen, isCartOpen, isWishlistOpen, isMobileUserMenuOpen]);

//     // Mobile search toggle
//     const toggleMobileSearch = () => {
//         setIsMobileSearchOpen(!isMobileSearchOpen);
//         if (!isMobileSearchOpen) {
//             setTimeout(() => {
//                 document.querySelector('.mobile-search-input')?.focus();
//             }, 100);
//         }
//     };

//     // Toggle mobile user menu
//     const toggleMobileUserMenu = () => {
//         setIsMobileUserMenuOpen(!isMobileUserMenuOpen);
//     };

//     return (
//         <div className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-white shadow-sm'}`}>
//             {/* Top Bar - Hidden on mobile */}
          
// <div className="hidden lg:block bg-gradient-to-r from-green-900 to-green-800 text-white py-2 text-sm">
//   <div className="container mx-auto px-4">
//     <div className="flex justify-between items-center">
//       <div className="flex items-center space-x-6">
//         <div className="flex items-center space-x-2">
//           <MapPin size={14} />
//           <span>Mark Street, New York</span>
//         </div>
//         <div className="flex items-center space-x-2">
//           <Phone size={14} />
//           <span>+1 (985) 825-6666</span>
//         </div>
//       </div>

//       <div className="flex items-center space-x-4">
//         <div>
//           {/* Use the enhanced component */}
//           <GoogleTranslate />
//         </div> 
//         <div className="flex items-center space-x-2 bg-green-700 px-3 py-1 rounded-full">
//           <Tag size={14} />
//           <span className="text-xs font-medium">Weekly Discount Up to 30%!</span>
//         </div>
//       </div>
//     </div>
//   </div>
// </div>

//             {/* Main Header */}
//             <div className="container mx-auto px-4 py-3">
//                 <div className="flex items-center justify-between">
//                     {/* Mobile Menu Button */}
//                     <div className="lg:hidden">
//                         <button
//                             onClick={() => setIsMobileMenuOpen(true)}
//                             className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
//                             aria-label="Open menu"
//                         >
//                             <Menu size={24} className="text-gray-700" />
//                         </button>
//                     </div>

//                     {/* Logo */}
//                     <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
//                         <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-800 rounded-lg flex items-center justify-center">
//                             <span className="text-white font-bold text-lg">M</span>
//                         </div>
//                         <div className="hidden sm:block">
//                             <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
//                                 MarketPlace
//                             </h1>
//                             <p className="text-xs text-gray-500 hidden sm:block">Premium Shopping</p>
//                         </div>
//                     </Link>

//                     {/* Desktop Search - Hidden on mobile */}
//                     <div className="hidden lg:flex flex-1 max-w-2xl mx-8 search-container">
//                         <form onSubmit={handleSearchSubmit} className="relative w-full">
//                             <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
//                                 <Search size={20} />
//                             </div>
//                             <input
//                                 type="text"
//                                 value={searchQuery}
//                                 onChange={(e) => setSearchQuery(e.target.value)}
//                                 placeholder="Search for products, brands and categories..."
//                                 className="w-full pl-12 pr-32 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
//                             />
//                             <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
//                                 <div className="w-px h-6 bg-gray-300"></div>
//                                 <button
//                                     type="submit"
//                                     className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
//                                 >
//                                     Search
//                                 </button>
//                             </div>

//                             {/* Search Results Dropdown */}
//                             {showSearchResults && searchResults.length > 0 && (
//                                 <div className="absolute top-full left-0 right-0 bg-white shadow-2xl rounded-xl mt-2 border border-gray-200 max-h-96 overflow-y-auto z-50">
//                                     <div className="p-4">
//                                         <h3 className="font-semibold text-gray-900 mb-3">Search Results</h3>
//                                         <div className="space-y-2">
//                                             {searchResults.map((product) => (
//                                                 <div
//                                                     key={product._id}
//                                                     onClick={() => handleProductClick(product.slug)}
//                                                     className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
//                                                 >
//                                                     <img
//                                                         src={`http://localhost:5000${product.thumbImg}`}
//                                                         alt={product.name}
//                                                         className="w-12 h-12 object-cover rounded-md"
//                                                         onError={(e) => {
//                                                             e.target.src = '/api/placeholder/60/60';
//                                                         }}
//                                                     />
//                                                     <div className="flex-1 min-w-0">
//                                                         <p className="font-medium text-gray-900 truncate">
//                                                             {product.name}
//                                                         </p>
//                                                         <p className="text-sm text-green-600 font-semibold">
//                                                             ₹{product.discountPrice || product.price}
//                                                         </p>
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* No Results Found */}
//                             {showSearchResults && searchQuery && searchResults.length === 0 && (
//                                 <div className="absolute top-full left-0 right-0 bg-white shadow-2xl rounded-xl mt-2 border border-gray-200 z-50">
//                                     <div className="p-6 text-center">
//                                         <Search size={48} className="text-gray-300 mx-auto mb-3" />
//                                         <p className="text-gray-600">No products found for "{searchQuery}"</p>
//                                         <p className="text-sm text-gray-500 mt-1">Try different keywords</p>
//                                     </div>
//                                 </div>
//                             )}
//                         </form>
//                     </div>

//                     {/* Action Icons */}
//                     <div className="flex items-center space-x-2 sm:space-x-4">
//                         {/* Mobile Search Button */}
//                         <button
//                             onClick={toggleMobileSearch}
//                             className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
//                             aria-label="Search"
//                         >
//                             <Search size={22} className="text-gray-700" />
//                         </button>

//                         {/* User Account - Desktop */}
//                         <div className="relative hidden lg:block" ref={userMenuRef}>
//                             {isLoggedIn ? (
//                                 <>
//                                     <button
//                                         onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
//                                         className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-600 transition-all duration-200 group relative"
//                                         aria-label="User Menu"
//                                     >
//                                         <User size={20} />
//                                         <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
//                                     </button>

//                                     {isUserMenuOpen && (
//                                         <div className="absolute left-1/2 transform -translate-x-1/2 mt-3 w-64 bg-white rounded-xl shadow-2xl py-3 z-50 border border-gray-100 animate-fadeIn">
//                                             {/* User Info */}
//                                             <div className="px-4 py-3 border-b border-gray-100">
//                                                 <div className="flex items-center space-x-3">
//                                                     <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-semibold">
//                                                         {user?.username?.charAt(0).toUpperCase() || 'U'}
//                                                     </div>
//                                                     <div className="flex-1 min-w-0">
//                                                         <p className="text-sm font-semibold text-gray-900 truncate">
//                                                             {user?.username || "User"}
//                                                         </p>
//                                                         <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             {/* Menu Items */}
//                                             <div className="py-2">
//                                                 <Link
//                                                     href="/dashboard"
//                                                     className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-150 group"
//                                                     onClick={() => setIsUserMenuOpen(false)}
//                                                 >
//                                                     <div className="w-8 h-8 flex items-center justify-center mr-3">
//                                                         <Settings size={16} className="text-gray-400 group-hover:text-green-600" />
//                                                     </div>
//                                                     <span className="font-medium">Dashboard</span>
//                                                 </Link>

//                                                 <Link
//                                                     href="/orders"
//                                                     className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-150 group"
//                                                     onClick={() => setIsUserMenuOpen(false)}
//                                                 >
//                                                     <div className="w-8 h-8 flex items-center justify-center mr-3">
//                                                         <Package size={16} className="text-gray-400 group-hover:text-green-600" />
//                                                     </div>
//                                                     <span className="font-medium">My Orders</span>
//                                                 </Link>

//                                                 {/* <Link
//                                                     href="/wishlist"
//                                                     className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-150 group"
//                                                     onClick={() => setIsUserMenuOpen(false)}
//                                                 >
//                                                     <div className="w-8 h-8 flex items-center justify-center mr-3">
//                                                         <Heart size={16} className="text-gray-400 group-hover:text-red-500" />
//                                                     </div>
//                                                     <span className="font-medium">Wishlist</span>
//                                                 </Link> */}

//                                                 <Link
//                                                     href="/referral-dashboard"
//                                                     className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-150 group"
//                                                     onClick={() => setIsUserMenuOpen(false)}
//                                                 >
//                                                     <div className="w-8 h-8 flex items-center justify-center mr-3">
//                                                         <Gift size={16} className="text-gray-400 group-hover:text-green-600" />
//                                                     </div>
//                                                     <span className="font-medium">Referral Program</span>
//                                                 </Link>
//                                             </div>

//                                             <div className="border-t border-gray-100 my-1"></div>

//                                             {/* Logout */}
//                                             <button
//                                                 onClick={handleLogout}
//                                                 className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 group"
//                                             >
//                                                 <div className="w-8 h-8 flex items-center justify-center mr-3">
//                                                     <LogOut size={16} className="text-red-400 group-hover:text-red-600" />
//                                                 </div>
//                                                 <span className="font-medium">Logout</span>
//                                             </button>
//                                         </div>
//                                     )}
//                                 </>
//                             ) : (
//                                 <Link href="/login">
//                                     <button
//                                         aria-label="Login"
//                                         className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-600 transition-all duration-200 group"
//                                     >
//                                         <User size={20} />
//                                         <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white group-hover:bg-green-500 transition-colors"></div>
//                                     </button>
//                                 </Link>
//                             )}
//                         </div>

//                         {/* Wishlist */}
//                         <button
//                             onClick={() => setIsWishlistOpen(true)}
//                             className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 transition-all duration-200 group relative"
//                         >
//                             <Heart size={20} />
//                             {getwhichlistcount() > 0 && (
//                                 <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full min-w-5 h-5 text-xs flex items-center justify-center font-medium px-1">
//                                     {getwhichlistcount()}
//                                 </span>
//                             )}
//                         </button>

//                         {/* Cart */}
//                         <button
//                             onClick={() => setIsCartOpen(true)}
//                             className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-600 transition-all duration-200 group relative"
//                         >
//                             <ShoppingCart size={20} />
//                             {getCartCount() > 0 && (
//                                 <span className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full min-w-5 h-5 text-xs flex items-center justify-center font-medium px-1">
//                                     {getCartCount()}
//                                 </span>
//                             )}
//                         </button>

//                         {/* User Account - Mobile (now opens dropdown on click) */}
//                         <div className="lg:hidden relative" ref={mobileUserMenuRef}>
//                             {isLoggedIn ? (
//                                 <>
//                                     <button
//                                         onClick={toggleMobileUserMenu}
//                                         className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-600 transition-all duration-200 group relative"
//                                         aria-label="User Menu"
//                                     >
//                                         <User size={20} />
//                                         <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
//                                     </button>

//                                     {/* Mobile User Dropdown Menu */}
//                                     {isMobileUserMenuOpen && (
//                                         <div className="fixed inset-x-0 top-16 z-50 bg-white shadow-2xl rounded-b-2xl border-t border-gray-200 animate-slideDown">
//                                             {/* User Info */}
//                                             <div className="p-4 border-b border-gray-100">
//                                                 <div className="flex items-center space-x-3">
//                                                     <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
//                                                         {user?.username?.charAt(0).toUpperCase() || 'U'}
//                                                     </div>
//                                                     <div className="flex-1 min-w-0">
//                                                         <p className="text-sm font-semibold text-gray-900 truncate">
//                                                             {user?.username || "User"}
//                                                         </p>
//                                                         <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             {/* Menu Items */}
//                                             <div className="py-2">
//                                                 <Link
//                                                     href="/dashboard"
//                                                     className="flex items-center px-4 py-4 text-sm text-gray-700 hover:bg-green-50 active:bg-green-100 transition-colors duration-150 group border-b border-gray-100"
//                                                     onClick={() => setIsMobileUserMenuOpen(false)}
//                                                 >
//                                                     <div className="w-10 h-10 flex items-center justify-center mr-3 bg-gray-100 rounded-lg">
//                                                         <Settings size={18} className="text-gray-600" />
//                                                     </div>
//                                                     <span className="font-medium">Dashboard</span>
//                                                 </Link>

//                                                 <Link
//                                                     href="/orders"
//                                                     className="flex items-center px-4 py-4 text-sm text-gray-700 hover:bg-green-50 active:bg-green-100 transition-colors duration-150 group border-b border-gray-100"
//                                                     onClick={() => setIsMobileUserMenuOpen(false)}
//                                                 >
//                                                     <div className="w-10 h-10 flex items-center justify-center mr-3 bg-gray-100 rounded-lg">
//                                                         <Package size={18} className="text-gray-600" />
//                                                     </div>
//                                                     <span className="font-medium">My Orders</span>
//                                                 </Link>

//                                                 {/* <Link
//                                                     href="/wishlist"
//                                                     className="flex items-center px-4 py-4 text-sm text-gray-700 hover:bg-green-50 active:bg-green-100 transition-colors duration-150 group border-b border-gray-100"
//                                                     onClick={() => setIsMobileUserMenuOpen(false)}
//                                                 >
//                                                     <div className="w-10 h-10 flex items-center justify-center mr-3 bg-gray-100 rounded-lg">
//                                                         <Heart size={18} className="text-gray-600" />
//                                                     </div>
//                                                     <span className="font-medium">Wishlist</span>
//                                                 </Link> */}

//                                                 <Link
//                                                     href="/referral-dashboard"
//                                                     className="flex items-center px-4 py-4 text-sm text-gray-700 hover:bg-green-50 active:bg-green-100 transition-colors duration-150 group"
//                                                     onClick={() => setIsMobileUserMenuOpen(false)}
//                                                 >
//                                                     <div className="w-10 h-10 flex items-center justify-center mr-3 bg-gray-100 rounded-lg">
//                                                         <Gift size={18} className="text-gray-600" />
//                                                     </div>
//                                                     <span className="font-medium">Referral Program</span>
//                                                 </Link>
//                                             </div>

//                                             <div className="border-t border-gray-200 my-2"></div>

//                                             {/* Logout Button */}
//                                             <button
//                                                 onClick={handleLogout}
//                                                 className="flex items-center w-full text-left px-4 py-4 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors duration-150 group"
//                                             >
//                                                 <div className="w-10 h-10 flex items-center justify-center mr-3 bg-red-50 rounded-lg">
//                                                     <LogOut size={18} className="text-red-500" />
//                                                 </div>
//                                                 <span className="font-medium">Logout</span>
//                                             </button>

//                                             {/* Close Button */}
//                                             <div className="p-4 border-t border-gray-200">
//                                                 <button
//                                                     onClick={() => setIsMobileUserMenuOpen(false)}
//                                                     className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
//                                                 >
//                                                     <X size={18} className="mr-2" />
//                                                     Close
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     )}
//                                 </>
//                             ) : (
//                                 <Link href="/login">
//                                     <button
//                                         className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-600 transition-all duration-200 group"
//                                         aria-label="Login"
//                                     >
//                                         <User size={20} />
//                                     </button>
//                                 </Link>
//                             )}
//                         </div>
//                     </div>
//                 </div>

//                 {/* Desktop Navigation */}
//               <div className="hidden lg:block">
//     <hr className="border-gray-200 my-2" />
//     <nav className="py-2">
//         <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-8">
//                 {/* Categories Dropdown */}
//                 {categories.length > 0 && (
//                     <div className="relative"
//                         onMouseEnter={() => setIsCategoryHovered(true)}
//                         onMouseLeave={() => setIsCategoryHovered(false)}
//                     >
//                         <button className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl">
//                             <span>All Categories</span>
//                             <ChevronDown size={16} className="transition-transform duration-200 group-hover:rotate-180" />
//                         </button>

//                         {isCategoryHovered && (
//                             <div className="absolute top-full left-0 mt-2 bg-white shadow-2xl rounded-xl py-4 min-w-[280px] z-50 border border-gray-100 animate-fadeIn">
//                                 <div className="px-4">
//                                     <h3 className="text-sm font-semibold text-gray-900 mb-3 px-2">
//                                         Browse Categories
//                                     </h3>
//                                     <ul className="space-y-1">
//                                         {categoryGroups.flatMap(group => group.categories).map((category) => (
//                                             <li key={category._id}>
//                                                 <button
//                                                     onClick={() => handleCategoryClick(category.slug)}
//                                                     className="w-full text-left px-3 py-3 rounded-lg text-sm font-medium text-gray-800 hover:text-green-700 hover:bg-green-50 transition-all duration-200 flex items-center justify-between group"
//                                                 >
//                                                     <div className="flex items-center space-x-3">
//                                                         {category.icon && (
//                                                             <span className="text-gray-400 group-hover:text-green-600 transition-colors">
//                                                                 {category.icon}
//                                                             </span>
//                                                         )}
//                                                         <span className="font-medium">{category.name}</span>
//                                                     </div>
//                                                     <ChevronRight size={14} className="text-gray-300 group-hover:text-green-600 transition-all transform group-hover:translate-x-1" />
//                                                 </button>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {/* Navigation Links */}
//                 <div className="flex items-center space-x-8">
//                     {navigationItems.map((item) => (
//                         <Link
//                             key={item.tab}
//                             href={item.link}
//                             className="text-gray-800 hover:text-green-600 font-medium transition-colors duration-200 relative group py-2"
//                         >
//                             {item.tab}
//                             <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-600 to-emerald-500 transition-all duration-300 group-hover:w-full rounded-full"></span>
//                         </Link>
//                     ))}
//                 </div>
//             </div>

//             {/* Support Info */}
//             {/* <div className="flex items-center space-x-3 text-sm text-gray-700 bg-gray-50 px-5 py-2.5 rounded-full border border-gray-100 hover:bg-white hover:shadow-sm transition-all duration-200">
//                 <div className="relative">
//                     <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                     <Headphones className="w-5 h-5 text-green-600" />
//                 </div>
//                 <div>
//                     <span className="font-medium text-gray-900">24/7 Support</span>
//                     <span className="text-gray-500 text-xs ml-2">Quick Response</span>
//                 </div>
//             </div> */}
//         </div>
//     </nav>
// </div>
//             </div>

//             {/* Mobile Search Overlay */}
//             {isMobileSearchOpen && (
//                 <div className="fixed inset-0 z-50 bg-white lg:hidden">
//                     <div className="p-4 border-b border-gray-200">
//                         <div className="flex items-center justify-between mb-4">
//                             <h2 className="text-lg font-semibold">Search</h2>
//                             <button
//                                 onClick={() => setIsMobileSearchOpen(false)}
//                                 className="p-2 hover:bg-gray-100 rounded-lg"
//                             >
//                                 <X size={24} />
//                             </button>
//                         </div>
//                         <form onSubmit={handleSearchSubmit} className="relative" ref={searchRef}>
//                             <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
//                                 <Search size={20} />
//                             </div>
//                             <input
//                                 type="text"
//                                 value={searchQuery}
//                                 onChange={(e) => setSearchQuery(e.target.value)}
//                                 placeholder="Search products..."
//                                 className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mobile-search-input"
//                                 autoFocus
//                             />
//                             <button
//                                 type="submit"
//                                 className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 text-white p-2 rounded-lg"
//                             >
//                                 <Search size={20} />
//                             </button>
//                         </form>

//                         {/* Mobile Search Results */}
//                         {showSearchResults && searchResults.length > 0 && (
//                             <div className="mt-4 max-h-96 overflow-y-auto">
//                                 <h3 className="font-semibold text-gray-900 mb-3">Results</h3>
//                                 <div className="space-y-2">
//                                     {searchResults.map((product) => (
//                                         <div
//                                             key={product._id}
//                                             onClick={() => handleProductClick(product.slug)}
//                                             className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
//                                         >
//                                             <img
//                                                 src={`http://localhost:5000${product.thumbImg}`}
//                                                 alt={product.name}
//                                                 className="w-12 h-12 object-cover rounded-md"
//                                                 onError={(e) => {
//                                                     e.target.src = '/api/placeholder/60/60';
//                                                 }}
//                                             />
//                                             <div className="flex-1 min-w-0">
//                                                 <p className="font-medium text-gray-900 truncate">
//                                                     {product.name}
//                                                 </p>
//                                                 <p className="text-sm text-green-600 font-semibold">
//                                                     ₹{product.discountPrice || product.price}
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}

//             {/* Mobile Menu Overlay */}
//             {isMobileMenuOpen && (
//                 <div className="fixed inset-0 z-50 bg-white lg:hidden">
//                     <div className="flex flex-col h-full" ref={mobileMenuRef}>
//                         {/* Header */}
//                         <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-800 text-white">
//                             <div className="flex items-center space-x-3">
//                                 <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
//                                     <span className="font-bold text-green-700 text-lg">M</span>
//                                 </div>
//                                 <div>
//                                     <span className="font-bold text-lg">MarketPlace</span>
//                                     <p className="text-xs opacity-90">Premium Shopping</p>
//                                 </div>
//                             </div>
//                             <button
//                                 onClick={() => setIsMobileMenuOpen(false)}
//                                 className="p-2 hover:bg-green-700 rounded-lg transition-colors"
//                             >
//                                 <X size={24} className="text-white" />
//                             </button>
//                         </div>

//                         {/* User Info in Mobile Menu */}
//                         <div className="p-4 border-b border-gray-200 bg-gray-50">
//                             {isLoggedIn ? (
//                                 <div className="flex items-center space-x-3">
//                                     <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
//                                         {user?.username?.charAt(0).toUpperCase() || 'U'}
//                                     </div>
//                                     <div className="flex-1">
//                                         <p className="font-semibold text-gray-900">{user?.username || "User"}</p>
//                                         <p className="text-sm text-gray-500">{user?.email || ""}</p>
//                                     </div>
//                                     <button
//                                         onClick={handleLogout}
//                                         className="text-red-600 text-sm font-medium bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
//                                     >
//                                         Logout
//                                     </button>
//                                 </div>
//                             ) : (
//                                 <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
//                                     <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md">
//                                         Sign In / Register
//                                     </button>
//                                 </Link>
//                             )}
//                         </div>

//                         {/* Navigation */}
//                         <div className="flex-1 overflow-y-auto">
//                             <div className="p-4 space-y-1">
//                                 {navigationItems.map((item) => (
//                                     <Link
//                                         key={item.tab}
//                                         href={item.link}
//                                         onClick={() => setIsMobileMenuOpen(false)}
//                                         className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors active:bg-gray-100"
//                                     >
//                                         <div className="flex items-center space-x-4">
//                                             <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
//                                                 <item.icon size={20} className="text-gray-600" />
//                                             </div>
//                                             <span className="font-semibold text-gray-900">{item.tab}</span>
//                                         </div>
//                                         <ChevronRight size={18} className="text-gray-400" />
//                                     </Link>
//                                 ))}
//                             </div>

//                             {/* Categories Section */}
//                             {categories.length > 0 && (
//                                 <div className="border-t border-gray-200 pt-4">
//                                     <h3 className="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
//                                     <div className="space-y-1">
//                                         {categoryGroups.map((group) =>
//                                             group.categories.map((category) => (
//                                                 <button
//                                                     key={category._id}
//                                                     onClick={() => handleCategoryClick(category.slug)}
//                                                     className="w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100 flex items-center justify-between"
//                                                 >
//                                                     <span className="font-medium text-gray-900">{category.name}</span>
//                                                     <ChevronRight size={16} className="text-gray-400" />
//                                                 </button>
//                                             ))
//                                         )}
//                                     </div>
//                                 </div>
//                             )}

//                             {/* User Menu Items (Mobile Menu) */}
//                             {isLoggedIn && (
//                                 <div className="border-t border-gray-200 pt-4">
//                                     <h3 className="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Account</h3>
//                                     <div className="space-y-1">
//                                         <Link
//                                             href="/dashboard"
//                                             onClick={() => setIsMobileMenuOpen(false)}
//                                             className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100"
//                                         >
//                                             <span className="font-medium text-gray-900">Dashboard</span>
//                                             <ChevronRight size={16} className="text-gray-400" />
//                                         </Link>
//                                         <Link
//                                             href="/orders"
//                                             onClick={() => setIsMobileMenuOpen(false)}
//                                             className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100"
//                                         >
//                                             <span className="font-medium text-gray-900">My Orders</span>
//                                             <ChevronRight size={16} className="text-gray-400" />
//                                         </Link>
//                                         {/* <Link
//                                             href="/wishlist"
//                                             onClick={() => setIsMobileMenuOpen(false)}
//                                             className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100"
//                                         >
//                                             <span className="font-medium text-gray-900">Wishlist</span>
//                                             <ChevronRight size={16} className="text-gray-400" />
//                                         </Link> */}
//                                         <Link
//                                             href="/referral-dashboard"
//                                             onClick={() => setIsMobileMenuOpen(false)}
//                                             className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100"
//                                         >
//                                             <span className="font-medium text-gray-900">Referral Program</span>
//                                             <ChevronRight size={16} className="text-gray-400" />
//                                         </Link>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Footer */}
//                         <div className="border-t border-gray-200 p-4 bg-gray-50">
//                             <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-4">
//                                 <Star className="w-4 h-4 text-yellow-400 fill-current" />
//                                 <span>24/7 Customer Support</span>
//                             </div>
//                             <div className="text-center text-sm text-gray-500">
//                                 <p>© 2024 MarketPlace. All rights reserved.</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Cart Drawer */}
//             {isCartOpen && (
//                 <div className="fixed inset-0 z-50">
//                     <div className="absolute inset-0  bg-opacity-50" onClick={() => setIsCartOpen(false)}></div>
//                     <div className="cart-drawer absolute right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300">
//                         <CartDrawer onClose={() => setIsCartOpen(false)} />
//                     </div>
//                 </div>
//             )}

//             {/* Wishlist Drawer */}
//             {isWishlistOpen && (
//                 <div className="fixed inset-0 z-50">
//                     <div className="absolute inset-0  bg-opacity-50" onClick={() => setIsWishlistOpen(false)}></div>
//                     <div className="wishlist-drawer absolute right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300">
//                         <WishlistDrawer onClose={() => setIsWishlistOpen(false)} />
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// // Cart Drawer Component
// const CartDrawer = ({ onClose }) => {
//     const {
//         cartItems,
//         removeFromCart,
//         updateCartItemQuantity,
//         calculateCartTotal,
//         getCartCount
//     } = useContext(AppContext);
//     const router = useRouter();

//     const handleQuantityChange = (itemId, newQuantity) => {
//         if (newQuantity < 1) return;
//         updateCartItemQuantity(itemId, newQuantity);
//     };

//     const handleRemoveItem = (itemId) => {
//         removeFromCart(itemId);
//     };

//     const handleCheckout = () => {
//         onClose();
//         router.push('/checkout');
//     };

//     const handleViewCart = () => {
//         onClose();
//         router.push('/cart');
//     };

//     return (
//         <div className="flex flex-col h-full">
//             <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
//                 <div className="flex items-center space-x-2">
//                     <ShoppingCart size={20} className="text-green-600" />
//                     <h2 className="text-lg sm:text-xl font-bold text-gray-900">Shopping Cart</h2>
//                     {cartItems.length > 0 && (
//                         <span className="bg-green-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-medium">
//                             {getCartCount()}
//                         </span>
//                     )}
//                 </div>
//                 <button
//                     onClick={onClose}
//                     className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
//                 >
//                     <X size={20} />
//                 </button>
//             </div>

//             <div className="flex-1 overflow-y-auto">
//                 {cartItems.length === 0 ? (
//                     <div className="flex flex-col items-center justify-center p-6 h-full">
//                         <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
//                             <ShoppingCart size={28} className="text-gray-400" />
//                         </div>
//                         <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
//                         <p className="text-gray-500 text-center mb-6">
//                             Looks like you haven't added anything to your cart yet.
//                         </p>
//                         <button
//                             onClick={onClose}
//                             className="bg-green-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
//                         >
//                             Continue Shopping
//                         </button>
//                     </div>
//                 ) : (
//                     <div className="p-4 space-y-4">
//                         {cartItems.map((item, index) => (
//                             <div
//                                 key={item._id ?? item.id ?? item.slug ?? index}
//                                 className="flex items-center space-x-3 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
//                             >
//                                 <div className="flex-shrink-0">
//                                     <img
//                                         src={item.image || item.thumbImg || '/api/placeholder/60/60'}
//                                         alt={item.name}
//                                         className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg"
//                                         onError={(e) => {
//                                             e.target.src = '/api/placeholder/60/60';
//                                         }}
//                                     />
//                                 </div>

//                                 <div className="flex-1 min-w-0">
//                                     <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
//                                         {item.name}
//                                     </h4>
//                                     <p className="text-green-600 font-semibold text-sm">
//                                         ₹{item.price || item.discountPrice}
//                                     </p>

//                                     <div className="flex items-center justify-between mt-2">
//                                         <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
//                                             <button
//                                                 onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
//                                                 disabled={item.quantity <= 1}
//                                                 className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                                             >
//                                                 <span className="text-sm font-medium">-</span>
//                                             </button>
//                                             <span className="w-8 text-center text-sm font-medium">
//                                                 {item.quantity}
//                                             </span>
//                                             <button
//                                                 onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
//                                                 className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors"
//                                             >
//                                                 <span className="text-sm font-medium">+</span>
//                                             </button>
//                                         </div>

//                                         <button
//                                             onClick={() => handleRemoveItem(item.id)}
//                                             className="text-gray-400 hover:text-red-500 p-1 transition-colors"
//                                             title="Remove item"
//                                         >
//                                             <X size={18} />
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>

//             {cartItems.length > 0 && (
//                 <OrderSummary subtotal={calculateCartTotal()} onClose={onClose} />
//             )}
//         </div>
//     );
// };

// // Wishlist Drawer Component
// const WishlistDrawer = ({ onClose }) => {
//     const {
//         wishlist,
//         toggleWishlist,
//         addToCart,
//         getwhichlistcount
//     } = useContext(AppContext);
//     const router = useRouter();
//     const [addedToCart, setAddToCart] = useState(false);

//     const handleAddToCart = (product) => {
//         addToCart(product, product.discountPrice || product.price, 1);
//         setAddToCart(true);
//         setTimeout(() => {
//             setAddToCart(false);
//         }, 2000);
//     };

//     const handleRemoveFromWishlist = (productId) => {
//         toggleWishlist(productId);
//     };

//     const handleProductClick = (productSlug) => {
//         onClose();
//         router.push(`/product/${productSlug}`);
//     };

//     return (
//         <div className="flex flex-col h-full">
//             <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
//                 <div className="flex items-center space-x-2">
//                     <Heart size={20} className="text-red-500" />
//                     <h2 className="text-lg sm:text-xl font-bold text-gray-900">Your Wishlist</h2>
//                     {wishlist.length > 0 && (
//                         <span className="bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-medium">
//                             {getwhichlistcount()}
//                         </span>
//                     )}
//                 </div>
//                 <button
//                     onClick={onClose}
//                     className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
//                 >
//                     <X size={20} />
//                 </button>
//             </div>

//             <div className="flex-1 overflow-y-auto">
//                 {wishlist.length === 0 ? (
//                     <div className="flex flex-col items-center justify-center p-6 h-full">
//                         <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-50 rounded-full flex items-center justify-center mb-4">
//                             <Heart size={28} className="text-red-400" />
//                         </div>
//                         <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
//                         <p className="text-gray-500 text-center mb-6">
//                             Save your favorite items here for later.
//                         </p>
//                         <button
//                             onClick={onClose}
//                             className="bg-green-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
//                         >
//                             Start Shopping
//                         </button>
//                     </div>
//                 ) : (
//                     <div className="p-4 space-y-4">
//                         {wishlist.map((product, index) => (
//                             <div
//                                 key={product._id ?? product.id ?? product.slug ?? index}
//                                 className="flex items-center space-x-3 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
//                             >
//                                 <div className="flex-shrink-0">
//                                     <img
//                                         src={`http://localhost:5000${product.thumbImg}`}
//                                         alt={product.name}
//                                         className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg"
//                                         onError={(e) => {
//                                             e.target.src = '/api/placeholder/60/60';
//                                         }}
//                                         onClick={() => handleProductClick(product.slug)}
//                                         style={{ cursor: 'pointer' }}
//                                     />
//                                 </div>

//                                 <div className="flex-1 min-w-0">
//                                     <h4
//                                         className="font-medium text-gray-900 text-sm line-clamp-2 mb-1 cursor-pointer hover:text-green-600 transition-colors"
//                                         onClick={() => handleProductClick(product.slug)}
//                                     >
//                                         {product.name}
//                                     </h4>
//                                     <p className="text-green-600 font-semibold text-sm mb-2">
//                                         ₹{product.discountPrice || product.price}
//                                     </p>

//                                     <div className="flex items-center justify-between mt-2">
//                                         {/* <button
//                                             onClick={() => handleAddToCart(product)}
//                                             className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors duration-200 flex items-center space-x-1"
//                                         >
//                                             <ShoppingCart size={12} />
//                                             <span>Add to Cart</span>
//                                         </button> */}
//                                         <button
//                                             onClick={handleAddToCart}
//                                             className={`flex-1 px-4  py-1 rounded-lg transition-all duration-300 font-medium   flex items-center justify-center gap-2 ${addedToCart
//                                                 ? 'bg-green-700 text-white'
//                                                 : 'bg-green-600 text-white hover:bg-green-700'
//                                                 }`}
//                                         >
//                                             {addedToCart ? (
//                                                 <>
//                                                     <FiCheck size={20} className="animate-pulse" />
//                                                     <span>Added to Cart</span>
//                                                 </>
//                                             ) : (
//                                                 <span>Add to Cart</span>
//                                             )}
//                                         </button>

//                                         <button
//                                             onClick={() => handleRemoveFromWishlist(product._id)}
//                                             className="text-gray-400 hover:text-red-500 p-1 transition-colors"
//                                             title="Remove from wishlist"
//                                         >
//                                             <X size={18} />
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>

//             {wishlist.length > 0 && (
//                 <div className="border-t border-gray-200 p-4 sm:p-6 space-y-4 bg-white">
//                     <div className="summary-section">
//                         <div className="flex justify-between items-center mb-4">
//                             <span className="text-sm text-gray-600">
//                                 {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in wishlist
//                             </span>
//                         </div>
//                     </div>

//                     <div className="action-buttons space-y-3">
//                         <button
//                             onClick={onClose}
//                             className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
//                         >
//                             <span>Continue Shopping</span>
//                             <ShoppingCart size={16} />
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Header;

"use client";
import React, { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import {
    Search,
    User,
    Heart,
    ShoppingCart,
    X,
    ChevronDown,
    Phone,
    MapPin,
    Tag,
    Star,
    Menu,
    ChevronRight,
    Home,
    ShoppingBag,
    Info,
    Mail,
    LogOut,
    Package,
    Gift,
    Settings,
    ChevronUp,
    
} from 'lucide-react';
import { FiCheck } from 'react-icons/fi';
import Link from 'next/link';
import { AppContext } from "@/app/context/AppContext";
import { useRouter } from 'next/navigation';
import OrderSummary from './OrderSummary';
import GoogleTranslate from './GoogleTranslate';

function Header() {
    const router = useRouter();
    const { categories, products, getCartCount,
        cartItems,
        removeFromCart,
        updateCartItemQuantity,
        wishlist,
        addToCart,
        toggleWishlist,
        getwhichlistcount,
        calculateCartTotal, } = useContext(AppContext);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [isCategoryHovered, setIsCategoryHovered] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
    const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false);
    const userMenuRef = useRef(null);
    const mobileUserMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const searchRef = useRef(null);
    const desktopSearchRef = useRef(null);

    // Memoized categories for dropdown
    const categoryGroups = useMemo(() => {
        if (!categories.length) return [];

        const beverageCategories = categories.filter(cat =>
            cat.name.toLowerCase().includes('drink') ||
            cat.name.toLowerCase().includes('juice') ||
            cat.name.toLowerCase().includes('beverage')
        );

        const dessertCategories = categories.filter(cat =>
            cat.name.toLowerCase().includes('dessert') ||
            cat.name.toLowerCase().includes('sweet') ||
            cat.name.toLowerCase().includes('snack')
        );

        const freshCategories = categories.filter(cat =>
            cat.name.toLowerCase().includes('fresh') ||
            cat.name.toLowerCase().includes('fruit') ||
            cat.name.toLowerCase().includes('vegetable')
        );

        const otherCategories = categories.filter(cat =>
            !beverageCategories.includes(cat) &&
            !dessertCategories.includes(cat) &&
            !freshCategories.includes(cat)
        );

        return [
            {
                title: "Beverages",
                categories: beverageCategories.slice(0, 4)
            },
            {
                title: "Desserts & Snacks",
                categories: dessertCategories.slice(0, 4)
            },
            {
                title: "Fresh Produce",
                categories: freshCategories.slice(0, 4)
            },
            {
                title: "Other Categories",
                categories: otherCategories.slice(0, 4)
            }
        ];
    }, [categories]);

    const navigationItems = [
        { tab: 'Home', link: '/', icon: Home },
        { tab: 'Shop', link: '/all-products', icon: ShoppingBag },
        { tab: 'About', link: '/about-us', icon: Info },
        { tab: 'Contact', link: '/contact', icon: Mail }
    ];

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUser(null);
        setIsUserMenuOpen(false);
        setIsMobileUserMenuOpen(false);
        setIsMobileMenuOpen(false);
        router.push("/login");
    };

    // Detect login + fetch user
    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);

        if (token) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/getuser`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) setUser(data.user);
                })
                .catch(err => console.error("User fetch failed:", err));
        }
    }, []);

    // Handle click outside for dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close desktop user menu
            if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }

            // Close mobile user menu
            if (isMobileUserMenuOpen && mobileUserMenuRef.current && !mobileUserMenuRef.current.contains(event.target)) {
                setIsMobileUserMenuOpen(false);
            }

            // Close mobile menu
            if (isMobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }

            // Close mobile search
            if (isMobileSearchOpen && searchRef.current && !searchRef.current.contains(event.target)) {
                setIsMobileSearchOpen(false);
            }

            // Close desktop search drawer
            if (isDesktopSearchOpen && desktopSearchRef.current && !desktopSearchRef.current.contains(event.target)) {
                setIsDesktopSearchOpen(false);
                setSearchQuery('');
                setSearchResults([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isUserMenuOpen, isMobileUserMenuOpen, isMobileMenuOpen, isMobileSearchOpen, isDesktopSearchOpen]);

    // Close drawers when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isCartOpen && !event.target.closest('.cart-drawer')) {
                setIsCartOpen(false);
            }
            if (isWishlistOpen && !event.target.closest('.wishlist-drawer')) {
                setIsWishlistOpen(false);
            }
            if (showSearchResults && !event.target.closest('.search-container')) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isCartOpen, isWishlistOpen, showSearchResults]);

    // Search functionality
    const performSearch = useCallback((query) => {
        if (!query.trim() || !products.length) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        const results = products.filter(product =>
            product.name?.toLowerCase().includes(query.toLowerCase()) ||
            product.description?.toLowerCase().includes(query.toLowerCase()) ||
            product.category?.name?.toLowerCase().includes(query.toLowerCase()) ||
            product.sku?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8);

        setSearchResults(results);
        setShowSearchResults(true);
    }, [products]);

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            performSearch(searchQuery);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, performSearch]);

    // Handle search submission
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            setShowSearchResults(false);
            setIsMobileSearchOpen(false);
            setIsDesktopSearchOpen(false);
            setSearchQuery('');
        }
    };

    // Handle product click from search results
    const handleProductClick = (productSlug) => {
        router.push(`/product/${productSlug}`);
        setShowSearchResults(false);
        setSearchQuery('');
        setIsMobileSearchOpen(false);
        setIsDesktopSearchOpen(false);
    };

    // Handle category click
    const handleCategoryClick = (categorySlug) => {
        router.push(`/category/${categorySlug}`);
        setIsCategoryHovered(false);
        setIsMobileMenuOpen(false);
    };

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen || isCartOpen || isWishlistOpen || isMobileUserMenuOpen || isDesktopSearchOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMobileMenuOpen, isCartOpen, isWishlistOpen, isMobileUserMenuOpen, isDesktopSearchOpen]);

    // Mobile search toggle
    const toggleMobileSearch = () => {
        setIsMobileSearchOpen(!isMobileSearchOpen);
        if (!isMobileSearchOpen) {
            setTimeout(() => {
                document.querySelector('.mobile-search-input')?.focus();
            }, 100);
        }
    };

    // Desktop search toggle
    const toggleDesktopSearch = () => {
        setIsDesktopSearchOpen(!isDesktopSearchOpen);
        if (!isDesktopSearchOpen) {
            setTimeout(() => {
                document.querySelector('.desktop-search-input')?.focus();
            }, 100);
        }
    };

    // Toggle mobile user menu
    const toggleMobileUserMenu = () => {
        setIsMobileUserMenuOpen(!isMobileUserMenuOpen);
    };

    return (
        <div className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-white shadow-sm'}`}>
            {/* Top Bar - Hidden on mobile */}
            <div className="hidden lg:block bg-[#D4AF37] text-white px-4 py-2 text-sm">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <MapPin size={14} />
                                <span>Mark Street, New York</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Phone size={14} />
                                <span>+1 (985) 825-6666</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div>
                                <GoogleTranslate />
                            </div> 
                            <div className="flex items-center space-x-2 bg-[#E6C56A] px-3 py-1 rounded-full">
                                <Tag size={14} />
                                <span className="text-xs font-medium">Weekly Discount Up to 30%!</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Header - Desktop (2 Rows) */}
            <div className="container mx-auto px-4 py-3">
                {/* Row 1: Logo, Search, Action Icons (Mobile) - This remains for mobile */}
                <div className="flex items-center justify-between lg:hidden">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu size={24} className="text-gray-700" />
                    </button>

                    {/* Logo - Mobile */}
                    <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
                        {/* <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-800 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">M</span>
                        </div> */}
                        <div className="hidden sm:block">
                          <img src="https://organicdiet.co.in/wp-content/uploads/2025/08/Organic-Diet-PNg1-1.png" alt="MarketPlace" className="h-5 object-contain" />
                            {/* <p className="text-xs text-gray-500 hidden sm:block">Premium Shopping</p> */}
                        </div>
                    </Link>

                    {/* Mobile Action Icons */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={toggleMobileSearch}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label="Search"
                        >
                            <Search size={22} className="text-gray-700" />
                        </button>

                        {/* Mobile User Account */}
                        <div className="relative" ref={mobileUserMenuRef}>
                            {isLoggedIn ? (
                                <>
                                    <button
                                        onClick={toggleMobileUserMenu}
                                        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-600 transition-all duration-200 group relative"
                                        aria-label="User Menu"
                                    >
                                        <User size={20} />
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                    </button>

                                    {/* Mobile User Dropdown Menu */}
                                    {isMobileUserMenuOpen && (
                                        <div className="fixed inset-x-0 top-16 z-50 bg-white shadow-2xl rounded-b-2xl border-t border-gray-200 animate-slideDown">
                                            {/* User Info */}
                                            <div className="p-4 border-b border-gray-100">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                                            {user?.username || "User"}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="py-2">
                                                <Link
                                                    href="/dashboard"
                                                    className="flex items-center px-4 py-4 text-sm text-gray-700 hover:bg-green-50 active:bg-green-100 transition-colors duration-150 group border-b border-gray-100"
                                                    onClick={() => setIsMobileUserMenuOpen(false)}
                                                >
                                                    <div className="w-10 h-10 flex items-center justify-center mr-3 bg-gray-100 rounded-lg">
                                                        <Settings size={18} className="text-gray-600" />
                                                    </div>
                                                    <span className="font-medium">Dashboard</span>
                                                </Link>

                                                <Link
                                                    href="/orders"
                                                    className="flex items-center px-4 py-4 text-sm text-gray-700 hover:bg-green-50 active:bg-green-100 transition-colors duration-150 group border-b border-gray-100"
                                                    onClick={() => setIsMobileUserMenuOpen(false)}
                                                >
                                                    <div className="w-10 h-10 flex items-center justify-center mr-3 bg-gray-100 rounded-lg">
                                                        <Package size={18} className="text-gray-600" />
                                                    </div>
                                                    <span className="font-medium">My Orders</span>
                                                </Link>

                                                <Link
                                                    href="/referral-dashboard"
                                                    className="flex items-center px-4 py-4 text-sm text-gray-700 hover:bg-green-50 active:bg-green-100 transition-colors duration-150 group"
                                                    onClick={() => setIsMobileUserMenuOpen(false)}
                                                >
                                                    <div className="w-10 h-10 flex items-center justify-center mr-3 bg-gray-100 rounded-lg">
                                                        <Gift size={18} className="text-gray-600" />
                                                    </div>
                                                    <span className="font-medium">Referral Program</span>
                                                </Link>
                                            </div>

                                            <div className="border-t border-gray-200 my-2"></div>

                                            {/* Logout Button */}
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full text-left px-4 py-4 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors duration-150 group"
                                            >
                                                <div className="w-10 h-10 flex items-center justify-center mr-3 bg-red-50 rounded-lg">
                                                    <LogOut size={18} className="text-red-500" />
                                                </div>
                                                <span className="font-medium">Logout</span>
                                            </button>

                                            {/* Close Button */}
                                            <div className="p-4 border-t border-gray-200">
                                                <button
                                                    onClick={() => setIsMobileUserMenuOpen(false)}
                                                    className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
                                                >
                                                    <X size={18} className="mr-2" />
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link href="/login">
                                    <button
                                        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-600 transition-all duration-200 group"
                                        aria-label="Login"
                                    >
                                        <User size={20} />
                                    </button>
                                </Link>
                            )}
                        </div>

                        {/* Wishlist - Mobile */}
                        <button
                            onClick={() => setIsWishlistOpen(true)}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 transition-all duration-200 group relative"
                        >
                            <Heart size={20} />
                            {getwhichlistcount() > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full min-w-5 h-5 text-xs flex items-center justify-center font-medium px-1">
                                    {getwhichlistcount()}
                                </span>
                            )}
                        </button>

                        {/* Cart - Mobile */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-600 transition-all duration-200 group relative"
                        >
                            <ShoppingCart size={20} />
                            {getCartCount() > 0 && (
                                <span className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full min-w-5 h-5 text-xs flex items-center justify-center font-medium px-1">
                                    {getCartCount()}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Desktop Layout - 2 Rows */}
                <div className="hidden lg:block px-5">
                    {/* Row 1: Logo and Action Icons */}
                    <div className="flex items-center justify-between ">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
                            {/* <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-800 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">M</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                                    MarketPlace
                                </h1>
                                <p className="text-xs text-gray-500">Premium Shopping</p>
                            </div> */}
                            <img src="https://www.organicdiet.in/wp-content/uploads/2025/08/Organic-Diet-PNg1-1.png" alt="Logo" className="w-16 h-16" />
                        </Link>

                        <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-8">
                            {/* Categories Dropdown */}
                            {categories.length > 0 && (
                                <div className="relative"
                                    onMouseEnter={() => setIsCategoryHovered(true)}
                                    onMouseLeave={() => setIsCategoryHovered(false)}
                                >
                                    <button className="flex items-center gap-2 bg-[#D4AF37] text-white px-6 py-3 rounded-xl hover:bg-[#D4AF37] transition-all duration-200 font-semibold shadow-lg hover:shadow-xl">
                                        <span>All Categories</span>
                                        <ChevronDown size={16} className="transition-transform duration-200 group-hover:rotate-180" />
                                    </button>

                                    {isCategoryHovered && (
                                        <div className="absolute top-full left-0 mt-2 bg-white shadow-2xl rounded-xl py-4 min-w-[280px] z-50 border border-gray-100 animate-fadeIn">
                                            <div className="px-4">
                                                <h3 className="text-sm font-semibold text-gray-900 mb-3 px-2">
                                                    Browse Categories
                                                </h3>
                                                <ul className="space-y-1">
                                                    {categoryGroups.flatMap(group => group.categories).map((category) => (
                                                        <li key={category._id}>
                                                            <button
                                                                onClick={() => handleCategoryClick(category.slug)}
                                                                className="w-full text-left px-3 py-3 rounded-lg text-sm font-medium text-gray-800 hover:text-green-700 hover:bg-green-50 transition-all duration-200 flex items-center justify-between group"
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    {category.icon && (
                                                                        <span className="text-gray-400 group-hover:text-green-600 transition-colors">
                                                                            {category.icon}
                                                                        </span>
                                                                    )}
                                                                    <span className="font-medium">{category.name}</span>
                                                                </div>
                                                                <ChevronRight size={14} className="text-gray-300 group-hover:text-green-600 transition-all transform group-hover:translate-x-1" />
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Navigation Links */}
                            <div className="flex items-center space-x-8">
                                {navigationItems.map((item) => (
                                    <Link
                                        key={item.tab}
                                        href={item.link}
                                        className="text-gray-800 hover:text-green-600 font-medium transition-colors duration-200 relative group py-2"
                                    >
                                        {item.tab}
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-600 to-emerald-500 transition-all duration-300 group-hover:w-full rounded-full"></span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Empty div for spacing - balances the layout */}
                        <div className="w-[200px]"></div>
                    </div>

                        {/* Desktop Action Icons */}
                        <div className="flex items-center space-x-3">
                            {/* Desktop Search Icon */}
                            <button
                                onClick={toggleDesktopSearch}
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-600 transition-all duration-200"
                                aria-label="Search"
                            >
                                <Search size={20} />
                            </button>

                            {/* User Account - Desktop */}
                            <div className="relative" ref={userMenuRef}>
                                {isLoggedIn ? (
                                    <>
                                        <button
                                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-600 transition-all duration-200 group relative"
                                            aria-label="User Menu"
                                        >
                                            <User size={20} />
                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                        </button>

                                        {isUserMenuOpen && (
                                            <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl py-3 z-50 border border-gray-100 animate-fadeIn">
                                                {/* User Info */}
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-semibold">
                                                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                                {user?.username || "User"}
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Menu Items */}
                                                <div className="py-2">
                                                    <Link
                                                        href="/dashboard"
                                                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-150 group"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        <div className="w-8 h-8 flex items-center justify-center mr-3">
                                                            <Settings size={16} className="text-gray-400 group-hover:text-green-600" />
                                                        </div>
                                                        <span className="font-medium">Dashboard</span>
                                                    </Link>

                                                    <Link
                                                        href="/orders"
                                                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-150 group"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        <div className="w-8 h-8 flex items-center justify-center mr-3">
                                                            <Package size={16} className="text-gray-400 group-hover:text-green-600" />
                                                        </div>
                                                        <span className="font-medium">My Orders</span>
                                                    </Link>

                                                    <Link
                                                        href="/referral-dashboard"
                                                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-150 group"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        <div className="w-8 h-8 flex items-center justify-center mr-3">
                                                            <Gift size={16} className="text-gray-400 group-hover:text-green-600" />
                                                        </div>
                                                        <span className="font-medium">Referral Program</span>
                                                    </Link>
                                                </div>

                                                <div className="border-t border-gray-100 my-1"></div>

                                                {/* Logout */}
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 group"
                                                >
                                                    <div className="w-8 h-8 flex items-center justify-center mr-3">
                                                        <LogOut size={16} className="text-red-400 group-hover:text-red-600" />
                                                    </div>
                                                    <span className="font-medium">Logout</span>
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link href="/login">
                                        <button
                                            aria-label="Login"
                                            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-600 transition-all duration-200 group"
                                        >
                                            <User size={20} />
                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white group-hover:bg-green-500 transition-colors"></div>
                                        </button>
                                    </Link>
                                )}
                            </div>

                            {/* Wishlist - Desktop */}
                            <button
                                onClick={() => setIsWishlistOpen(true)}
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 transition-all duration-200 group relative"
                            >
                                <Heart size={20} />
                                {getwhichlistcount() > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full min-w-5 h-5 text-xs flex items-center justify-center font-medium px-1">
                                        {getwhichlistcount()}
                                    </span>
                                )}
                            </button>

                            {/* Cart - Desktop */}
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-600 transition-all duration-200 group relative"
                            >
                                <ShoppingCart size={20} />
                                {getCartCount() > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full min-w-5 h-5 text-xs flex items-center justify-center font-medium px-1">
                                        {getCartCount()}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Row 2: Navigation with Categories, Nav Links, and Spacing */}
                    
                </div>
            </div>

            {/* Desktop Search Drawer */}
           {isDesktopSearchOpen && (
    <div className="fixed inset-0 z-50 hidden lg:block">
        <div className="absolute inset-0  bg-opacity-50" onClick={() => setIsDesktopSearchOpen(false)}></div>
        <div 
            ref={desktopSearchRef}
            className="absolute right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 overflow-y-auto"
        >
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <div className="flex items-center space-x-2">
                        <Search size={20} className="text-green-600" />
                        {/* <h2 className="text-lg sm:text-xl font-bold text-gray-900">Search Products</h2> */}
                    </div>
                    <button
                        onClick={() => setIsDesktopSearchOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search Input */}
                <div className="p-4 border-b border-gray-200">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent desktop-search-input"
                            autoFocus
                        />
                    </form>
                </div>

                {/* Search Results */}
                <div className="flex-1 overflow-y-auto p-4">
                    {showSearchResults ? (
                        <>
                            {searchResults.length > 0 ? (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                        Products ({searchResults.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {searchResults.map((product) => (
                                            <div
                                                key={product._id}
                                                onClick={() => handleProductClick(product.slug)}
                                                className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                                            >
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}${product.thumbImg}`}
                                                        alt={product.name}
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                        onError={(e) => {
                                                            e.target.src = '/api/placeholder/60/60';
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                                                        {product.name}
                                                    </h4>
                                                    <div className="flex items-center space-x-2">
                                                        {product.discountPrice ? (
                                                            <>
                                                                <p className="text-green-600 font-semibold text-sm">
                                                                    ₹{product.discountPrice}
                                                                </p>
                                                                <p className="text-gray-400 text-xs line-through">
                                                                    ₹{product.price}
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <p className="text-green-600 font-semibold text-sm">
                                                                ₹{product.price}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* View All Results Link */}
                                    {searchResults.length > 0 && (
                                        <button
                                            onClick={handleSearchSubmit}
                                            className="w-full mt-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
                                        >
                                            <span>View All Results</span>
                                            <ChevronRight size={16} />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <Search size={28} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                                    <p className="text-gray-500 text-center text-sm">
                                        We couldn't find any products matching<br />
                                        <span className="font-medium">"{searchQuery}"</span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-4">Try checking your spelling or using different keywords</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                                <Search size={28} className="text-green-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Products</h3>
                            <p className="text-gray-500 text-sm max-w-xs">
                                Search for healthy foods, sauces, spreads and more...
                            </p>
                            
                           
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
)}

            {/* Mobile Search Overlay */}
            {isMobileSearchOpen && (
                <div className="fixed inset-0 z-50 bg-white lg:hidden">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Search</h2>
                            <button
                                onClick={() => setIsMobileSearchOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSearchSubmit} className="relative" ref={searchRef}>
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products..."
                                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mobile-search-input"
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 text-white p-2 rounded-lg"
                            >
                                <Search size={20} />
                            </button>
                        </form>

                        {/* Mobile Search Results */}
                        {showSearchResults && searchResults.length > 0 && (
                            <div className="mt-4 max-h-96 overflow-y-auto">
                                <h3 className="font-semibold text-gray-900 mb-3">Results</h3>
                                <div className="space-y-2">
                                    {searchResults.map((product) => (
                                        <div
                                            key={product._id}
                                            onClick={() => handleProductClick(product.slug)}
                                            className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_URL}${product.thumbImg}`}
                                                alt={product.name}
                                                className="w-12 h-12 object-cover rounded-md"
                                                onError={(e) => {
                                                    e.target.src = '/api/placeholder/60/60';
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">
                                                    {product.name}
                                                </p>
                                                <p className="text-sm text-green-600 font-semibold">
                                                    ₹{product.discountPrice || product.price}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-white lg:hidden">
                    <div className="flex flex-col h-full" ref={mobileMenuRef}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-800 text-white">
                            <div className="flex items-center space-x-3">
                                {/* <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                    <span className="font-bold text-green-700 text-lg">M</span>
                                </div> */}
                                <div>
                                    <span className="font-bold text-lg">Organic Diet</span>
                                    <p className="text-xs opacity-90">Premium Shopping</p>
                                   
                                </div>
                                 
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 hover:bg-green-700 rounded-lg transition-colors"
                            >
                                <X size={24} className="text-white" />
                            </button>
                        </div>

                        {/* User Info in Mobile Menu */}
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            {isLoggedIn ? (
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{user?.username || "User"}</p>
                                        <p className="text-sm text-gray-500">{user?.email || ""}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="text-red-600 text-sm font-medium bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                    <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md">
                                        Sign In / Register
                                    </button>
                                </Link>
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-4 space-y-1">
                                {navigationItems.map((item) => (
                                    <Link
                                        key={item.tab}
                                        href={item.link}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors active:bg-gray-100"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <item.icon size={20} className="text-gray-600" />
                                            </div>
                                            <span className="font-semibold text-gray-900">{item.tab}</span>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-400" />
                                    </Link>
                                ))}
                            </div>

                            {/* Categories Section */}
                            {categories.length > 0 && (
                                <div className="border-t border-gray-200 pt-4">
                                    <h3 className="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
                                    <div className="space-y-1">
                                        {categoryGroups.map((group) =>
                                            group.categories.map((category) => (
                                                <button
                                                    key={category._id}
                                                    onClick={() => handleCategoryClick(category.slug)}
                                                    className="w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100 flex items-center justify-between"
                                                >
                                                    <span className="font-medium text-gray-900">{category.name}</span>
                                                    <ChevronRight size={16} className="text-gray-400" />
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* User Menu Items (Mobile Menu) */}
                            {isLoggedIn && (
                                <div className="border-t border-gray-200 pt-4">
                                    <h3 className="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Account</h3>
                                    <div className="space-y-1">
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100"
                                        >
                                            <span className="font-medium text-gray-900">Dashboard</span>
                                            <ChevronRight size={16} className="text-gray-400" />
                                        </Link>
                                        <Link
                                            href="/orders"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100"
                                        >
                                            <span className="font-medium text-gray-900">My Orders</span>
                                            <ChevronRight size={16} className="text-gray-400" />
                                        </Link>
                                        <Link
                                            href="/referral-dashboard"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100"
                                        >
                                            <span className="font-medium text-gray-900">Referral Program</span>
                                            <ChevronRight size={16} className="text-gray-400" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-4">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span>24/7 Customer Support</span>
                            </div>
                            <div className="text-center text-sm text-gray-500">
                                <p>© 2024 MarketPlace. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cart Drawer */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0  bg-opacity-50" onClick={() => setIsCartOpen(false)}></div>
                    <div className="cart-drawer absolute right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300">
                        <CartDrawer onClose={() => setIsCartOpen(false)} />
                    </div>
                </div>
            )}

            {/* Wishlist Drawer */}
            {isWishlistOpen && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0  bg-opacity-50" onClick={() => setIsWishlistOpen(false)}></div>
                    <div className="wishlist-drawer absolute right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300">
                        <WishlistDrawer onClose={() => setIsWishlistOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}

// Cart Drawer Component
const CartDrawer = ({ onClose }) => {
    const {
        cartItems,
        removeFromCart,
        updateCartItemQuantity,
        calculateCartTotal,
        getCartCount
    } = useContext(AppContext);
    const router = useRouter();

    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        updateCartItemQuantity(itemId, newQuantity);
    };

    const handleRemoveItem = (itemId) => {
        removeFromCart(itemId);
    };

    const handleCheckout = () => {
        onClose();
        router.push('/checkout');
    };

    const handleViewCart = () => {
        onClose();
        router.push('/cart');
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="flex items-center space-x-2">
                    <ShoppingCart size={20} className="text-green-600" />
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Shopping Cart</h2>
                    {cartItems.length > 0 && (
                        <span className="bg-green-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-medium">
                            {getCartCount()}
                        </span>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 h-full">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <ShoppingCart size={28} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                        <p className="text-gray-500 text-center mb-6">
                            Looks like you haven't added anything to your cart yet.
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-green-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="p-4 space-y-4">
                        {cartItems.map((item, index) => (
                            <div
                                key={item._id ?? item.id ?? item.slug ?? index}
                                className="flex items-center space-x-3 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
                            >
                                <div className="flex-shrink-0">
                                    <img
                                        src={item.image || item.thumbImg || '/api/placeholder/60/60'}
                                        alt={item.name}
                                        className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg"
                                        onError={(e) => {
                                            e.target.src = '/api/placeholder/60/60';
                                        }}
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                                        {item.name}
                                    </h4>
                                    <p className="text-green-600 font-semibold text-sm">
                                        ₹{item.price || item.discountPrice}
                                    </p>

                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <span className="text-sm font-medium">-</span>
                                            </button>
                                            <span className="w-8 text-center text-sm font-medium">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors"
                                            >
                                                <span className="text-sm font-medium">+</span>
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                                            title="Remove item"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {cartItems.length > 0 && (
                <OrderSummary subtotal={calculateCartTotal()} onClose={onClose} />
            )}
        </div>
    );
};

// Wishlist Drawer Component
const WishlistDrawer = ({ onClose }) => {
    const {
        wishlist,
        toggleWishlist,
        addToCart,
        getwhichlistcount
    } = useContext(AppContext);
    const router = useRouter();
    const [addedToCart, setAddToCart] = useState(false);

    const handleAddToCart = (product) => {
        addToCart(product, product.discountPrice || product.price, 1);
        setAddToCart(true);
        setTimeout(() => {
            setAddToCart(false);
        }, 2000);
    };

    const handleRemoveFromWishlist = (productId) => {
        toggleWishlist(productId);
    };

    const handleProductClick = (productSlug) => {
        onClose();
        router.push(`/product/${productSlug}`);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="flex items-center space-x-2">
                    <Heart size={20} className="text-red-500" />
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Your Wishlist</h2>
                    {wishlist.length > 0 && (
                        <span className="bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-medium">
                            {getwhichlistcount()}
                        </span>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {wishlist.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 h-full">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-50 rounded-full flex items-center justify-center mb-4">
                            <Heart size={28} className="text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                        <p className="text-gray-500 text-center mb-6">
                            Save your favorite items here for later.
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-green-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="p-4 space-y-4">
                        {wishlist.map((product, index) => (
                            <div
                                key={product._id ?? product.id ?? product.slug ?? index}
                                className="flex items-center space-x-3 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
                            >
                                <div className="flex-shrink-0">
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}${product.thumbImg}`}
                                        alt={product.name}
                                        className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg"
                                        onError={(e) => {
                                            e.target.src = '/api/placeholder/60/60';
                                        }}
                                        onClick={() => handleProductClick(product.slug)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4
                                        className="font-medium text-gray-900 text-sm line-clamp-2 mb-1 cursor-pointer hover:text-green-600 transition-colors"
                                        onClick={() => handleProductClick(product.slug)}
                                    >
                                        {product.name}
                                    </h4>
                                    <p className="text-green-600 font-semibold text-sm mb-2">
                                        ₹{product.discountPrice || product.price}
                                    </p>

                                    <div className="flex items-center justify-between mt-2">
                                        <button
                                            onClick={handleAddToCart}
                                            className={`flex-1 px-4 py-1 rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2 ${
                                                addedToCart
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

                                        <button
                                            onClick={() => handleRemoveFromWishlist(product._id)}
                                            className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                                            title="Remove from wishlist"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {wishlist.length > 0 && (
                <div className="border-t border-gray-200 p-4 sm:p-6 space-y-4 bg-white">
                    <div className="summary-section">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-600">
                                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in wishlist
                            </span>
                        </div>
                    </div>

                    <div className="action-buttons space-y-3">
                        <button
                            onClick={onClose}
                            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
                        >
                            <span>Continue Shopping</span>
                            <ShoppingCart size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Header;
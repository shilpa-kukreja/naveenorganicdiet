"use client";

import Footer from "@/app/componats/Footer";
import Header from "@/app/componats/Header";
import { AppContext } from "@/app/context/AppContext";
import Link from "next/link";
import { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { 
  FiGrid, 
  FiList, 
  FiFilter, 
  FiShoppingBag, 
  FiSearch, 
  FiArrowUp, 
  FiX, 
  FiHeart, 
  FiCheck, 
  FiChevronDown,
  FiChevronUp,
  FiStar,
  FiPackage,
  FiTag
} from "react-icons/fi";
import { FaFilter } from "react-icons/fa";

export default function AllProductsPage() {
  const { 
    categories, 
    products,
    addToCart,
    toggleWishlist,
    isInWishlist 
  } = useContext(AppContext);
  
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [visibleProducts, setVisibleProducts] = useState(12);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // All products
  const allProducts = useMemo(() => {
    return products || [];
  }, [products]);

  // Filter by search query
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => {
        if (Array.isArray(product.category)) {
          return product.category.some(cat => {
            const categoryId = cat.$oid || cat._id || cat;
            return selectedCategories.includes(categoryId);
          });
        }

        const singleCategoryId =
          typeof product.category === 'string' ? product.category :
            product.category?.$oid || product.category?._id;

        return selectedCategories.includes(singleCategoryId);
      });
    }

    // Price range filter
    filtered = filtered.filter(product => {
      const price = product.discountPrice || product.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    return filtered;
  }, [allProducts, searchQuery, selectedCategories, priceRange]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const productsToSort = [...filteredProducts];

    switch (sortBy) {
      case 'price-low':
        return productsToSort.sort((a, b) =>
          (a.discountPrice || a.price || 0) - (b.discountPrice || b.price || 0)
        );
      case 'price-high':
        return productsToSort.sort((a, b) =>
          (b.discountPrice || b.price || 0) - (a.discountPrice || a.price || 0)
        );
      case 'name':
        return productsToSort.sort((a, b) =>
          (a.name || '').localeCompare(b.name || '')
        );
      case 'newest':
        return productsToSort.sort((a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
      case 'popular':
        return productsToSort.sort((a, b) =>
          (b.rating || 0) - (a.rating || 0)
        );
      default:
        return productsToSort;
    }
  }, [filteredProducts, sortBy]);

  // Products to display
  const displayProducts = useMemo(() => {
    return sortedProducts.slice(0, visibleProducts);
  }, [sortedProducts, visibleProducts]);

  // Category filter handlers
  const handleCategoryToggle = useCallback((categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedCategories([]);
    setPriceRange([0, 10000]);
    setSearchQuery('');
  }, []);

  // Get category name by ID
  const getCategoryName = useCallback((categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category?.name || 'Unknown Category';
  }, [categories]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop + 100
      >= document.documentElement.offsetHeight) {
      if (visibleProducts < sortedProducts.length) {
        setVisibleProducts(prev => Math.min(prev + (isMobile ? 8 : 12), sortedProducts.length));
      }
    }

    setShowScrollTop(window.pageYOffset > 400);
  }, [visibleProducts, sortedProducts.length, isMobile]);

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Reset visible products when filters change
  useEffect(() => {
    setVisibleProducts(isMobile ? 8 : 12);
  }, [searchQuery, selectedCategories, priceRange, sortBy, isMobile]);

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 max-w-7xl mx-auto">
        <section className="py-4 sm:py-6 md:py-8">
          <div className="container mx-auto px-3 sm:px-4">
            {/* Header Skeleton */}
            <div className="mb-6 sm:mb-8">
              <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm mb-3 sm:mb-4">
                <div className="h-3 sm:h-4 w-10 sm:w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 sm:h-4 w-3 sm:w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 sm:h-4 w-20 sm:w-32 bg-gray-300 rounded animate-pulse"></div>
              </nav>

              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div>
                  <div className="h-7 sm:h-9 md:h-10 w-40 sm:w-56 md:w-64 bg-gray-300 rounded animate-pulse mb-2"></div>
                  <div className="h-4 sm:h-5 md:h-6 w-48 sm:w-72 md:w-96 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-10 sm:h-12 w-full lg:w-64 xl:w-80 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
              {/* Mobile Filter Button Skeleton */}
              <div className="lg:hidden flex justify-between items-center mb-4">
                <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>

              {/* Desktop Filters Skeleton */}
              <div className="hidden lg:block lg:w-72 xl:w-80 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 sticky top-24">
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-6"></div>
                  <div className="space-y-6">
                    {[1, 2, 3].map((item) => (
                      <div key={item}>
                        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-3"></div>
                        <div className="space-y-2">
                          {[1, 2, 3, 4].map((subItem) => (
                            <div key={subItem} className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Products Section Skeleton */}
              <div className="flex-1">
                {/* Controls Skeleton */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                      <div className="h-5 w-10 sm:w-12 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="h-4 sm:h-5 w-32 sm:w-48 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                      <div className="h-4 sm:h-5 w-12 sm:w-16 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-9 w-32 sm:w-40 bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Products Grid Skeleton */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div key={item} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                      <div className="w-full aspect-square bg-gray-200"></div>
                      <div className="p-3 sm:p-4">
                        <div className="h-4 sm:h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 sm:h-4 w-1/2 bg-gray-200 rounded mb-3"></div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-300 rounded"></div>
                          <div className="h-4 sm:h-5 w-10 sm:w-16 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-10 sm:h-12 bg-gray-300 rounded-lg"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  const activeFilterCount = selectedCategories.length + (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50  max-w-8xl  px-4 sm:px-6 lg:px-16 mx-auto">
        <section className="py-4 sm:py-6 md:py-8">
          <div className="container mx-auto px-3 sm:px-4">
            {/* Header Section */}
            <div className="mb-6 sm:mb-8">
              <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                <Link href="/" className="hover:text-green-600 transition-colors">Home</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">All Products</span>
              </nav>

              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                    All Products
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base md:text-lg">
                    Discover {sortedProducts.length} premium product{sortedProducts.length !== 1 ? 's' : ''} in our collection
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

            {/* Mobile Filter Button */}
            <div className="lg:hidden flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FaFilter size={14} className="sm:size-16" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 border border-gray-300 rounded-l-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <FiGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 border border-gray-300 rounded-r-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <FiList size={16} />
                  </button>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-gray-600">
                {Math.min(visibleProducts, displayProducts.length)}/{sortedProducts.length}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
              {/* Desktop Filters Sidebar */}
              <div className="hidden lg:block lg:w-72 xl:w-80 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 sticky top-24">
                  {/* Filters Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Active Filters */}
                  {activeFilterCount > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Active Filters</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCategories.map(categoryId => (
                          <span
                            key={categoryId}
                            className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                          >
                            {getCategoryName(categoryId)}
                            <button
                              onClick={() => handleCategoryToggle(categoryId)}
                              className="hover:text-green-900"
                            >
                              <FiX size={14} />
                            </button>
                          </span>
                        ))}
                        {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                            ₹{priceRange[0]} - ₹{priceRange[1]}
                            <button
                              onClick={() => setPriceRange([0, 10000])}
                              className="hover:text-blue-900"
                            >
                              <FiX size={14} />
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Categories Filter */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Categories</h4>
                      <span className="text-xs text-gray-500">{categories.length}</span>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {categories.map(category => (
                        <label key={category._id} className="flex items-center space-x-3 cursor-pointer group p-1 hover:bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category._id)}
                            onChange={() => handleCategoryToggle(category._id)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                            {category.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">₹{priceRange[0]}</span>
                        <span className="text-sm text-gray-600">₹{priceRange[1]}</span>
                      </div>
                      <div className="relative">
                        <input
                          type="range"
                          min="0"
                          max="10000"
                          step="100"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div 
                          className="absolute top-0 left-0 h-2 bg-green-500 rounded-lg"
                          style={{ width: `${(priceRange[1] / 10000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Links</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedCategories([])}
                        className="flex items-center w-full text-left text-sm text-gray-600 hover:text-green-600 transition-colors py-2 px-2 hover:bg-gray-50 rounded-lg"
                      >
                        <FiPackage size={16} className="mr-3" />
                        All Products
                      </button>
                      <button
                        onClick={() => setSortBy('price-low')}
                        className="flex items-center w-full text-left text-sm text-gray-600 hover:text-green-600 transition-colors py-2 px-2 hover:bg-gray-50 rounded-lg"
                      >
                        <FiTag size={16} className="mr-3" />
                        Budget Friendly
                      </button>
                      <button
                        onClick={() => setSortBy('newest')}
                        className="flex items-center w-full text-left text-sm text-gray-600 hover:text-green-600 transition-colors py-2 px-2 hover:bg-gray-50 rounded-lg"
                      >
                        <FiStar size={16} className="mr-3" />
                        New Arrivals
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Section */}
              <div className="flex-1">
                {/* Desktop Controls Bar */}
                <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-3">
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
                        {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} applied)`}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <span className="text-sm font-medium text-gray-700">Sort by:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white min-w-[140px] sm:min-w-[160px]"
                      >
                        <option value="newest">Newest First</option>
                        <option value="name">Name A-Z</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="popular">Most Popular</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Mobile Sort Dropdown */}
                <div className="lg:hidden mb-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="name">Sort: Name A-Z</option>
                    <option value="price-low">Sort: Price Low to High</option>
                    <option value="price-high">Sort: Price High to Low</option>
                    <option value="popular">Sort: Most Popular</option>
                  </select>
                </div>

                {/* Products Grid/List */}
                {displayProducts.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 md:p-12 max-w-2xl mx-auto">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <FiFilter size={24} className="sm:size-28 md:size-32 text-gray-400" />
                      </div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                        No Products Found
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                        {searchQuery || activeFilterCount > 0
                          ? `No products match your current filters. Try adjusting your search or filters.`
                          : `There are no products available in our store yet.`
                        }
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                        <button
                          onClick={clearAllFilters}
                          className="bg-gray-200 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
                        >
                          Clear Filters
                        </button>
                        <Link
                          href="/"
                          className="bg-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm sm:text-base text-center"
                        >
                          Continue Shopping
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={
                      viewMode === 'grid'
                        ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
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
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0  bg-opacity-50 z-50 lg:hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl max-h-[85vh] overflow-y-auto animate-slideUp">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Active Filters */}
              {activeFilterCount > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Active Filters</h4>
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map(categoryId => (
                      <span
                        key={categoryId}
                        className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                      >
                        {getCategoryName(categoryId)}
                        <button
                          onClick={() => handleCategoryToggle(categoryId)}
                          className="hover:text-green-900"
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    ))}
                    {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        ₹{priceRange[0]} - ₹{priceRange[1]}
                        <button
                          onClick={() => setPriceRange([0, 10000])}
                          className="hover:text-blue-900"
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Categories Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Categories</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {categories.map(category => (
                    <label key={category._id} className="flex items-center space-x-3 cursor-pointer group p-2 hover:bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category._id)}
                        onChange={() => handleCategoryToggle(category._id)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">₹{priceRange[0]}</span>
                    <span className="text-sm text-gray-600">₹{priceRange[1]}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div 
                      className="absolute top-0 left-0 h-2 bg-green-500 rounded-lg"
                      style={{ width: `${(priceRange[1] / 10000) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

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

// ProductCard Component
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
    addToCart(product, product.discountPrice || product.price || 0, 1);
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
            <div className={`w-full md:w-48 lg:w-56 h-48 sm:h-56 md:h-56 bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden ${!imageLoaded ? 'animate-pulse' : ''}`}>
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
            {hasDiscount && (
              <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                SALE
              </span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-1 sm:gap-2">
              <Link href={`/product/${product.slug}`}>
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2">
                  {product.name}
                </h2>
              </Link>
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
                ₹{product.discountPrice || product.price || 0}
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
                className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all duration-300 font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base ${
                  addedToCart
                    ? 'bg-green-700 text-white'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {addedToCart ? (
                  <>
                    <FiCheck size={16} className="sm:size-18 animate-pulse" />
                    <span>Added</span>
                  </>
                ) : (
                  <span>Add to Cart</span>
                )}
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`p-2.5 sm:p-3 border rounded-lg transition-colors flex items-center justify-center ${
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
          <div className={`w-full aspect-square bg-gray-100 ${!imageLoaded ? 'animate-pulse' : ''}`}>
            {!imageError ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${product.thumbImg}`}
                className={`w-full h-full object-cover transition-all duration-500 ${
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

          {/* Discount Badge */}
          {/* {hasDiscount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              SALE
            </span>
          )} */}

          {/* Stock Badge */}
          {product.stock < 10 && product.stock > 0 && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
              Low Stock
            </span>
          )}

          {/* Wishlist Button */}
          <button 
            onClick={handleToggleWishlist}
            className={`absolute top-5 left-2 p-1.5 sm:p-2 rounded-full transition-colors ${
              isWishlisted 
                ? 'bg-red-500 text-white shadow-sm' 
                : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
            }`}
          >
            <FiHeart size={12} className="sm:size-6" />
          </button>
        </div>
      </Link>

      <div className="p-3 sm:p-4">
        <Link href={`/product/${product.slug}`}>
          <h2 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-green-700 transition-colors">
            {product.name}
          </h2>
        </Link>

        {product.pack && (
          <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">Pack: {product.pack}</p>
        )}

        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <span className="text-base sm:text-lg md:text-xl font-bold text-green-600">
              ₹{product.discountPrice || product.price || 0}
            </span>
            {hasDiscount && (
              <span className="text-xs sm:text-sm text-gray-500 line-through">
                ₹{product.price}
              </span>
            )}
          </div>

          {product.sku && (
            <span className="hidden sm:inline text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
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
                <FiCheck size={14} className="sm:size-16 animate-pulse" />
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
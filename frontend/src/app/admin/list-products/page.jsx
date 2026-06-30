"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import * as XLSX from "xlsx";
import { useAuth } from "../lib/auth-context";

export default function ListProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const itemsPerPage = 8;
    const {isAdmin} = useAuth();

    const router = useRouter();

    // ✅ Fetch products
    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/product/products`);
            if (res.data?.products) {
                setProducts(res.data.products);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch products");
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Fetch categories
    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/category/get`);
            if (res.data) {
                setCategories(res.data || []);
            }
        } catch (err) {
            console.error("Error fetching categories", err);
        }
    };

    // ✅ Get product price based on product type
    const getProductPrice = (product) => {
        if (product.productType === "variable" && product.variant && product.variant.length > 0) {
            // For variable products, show price range or first variant price
            const prices = product.variant.map(v => v.price).filter(p => p > 0);
            if (prices.length === 0) return "N/A";
            if (prices.length === 1) return `₹${prices[0]}`;
            return `₹${Math.min(...prices)} - ₹${Math.max(...prices)}`;
        } else {
            // For simple products
            return product.price ? `₹${product.price}` : "N/A";
        }
    };

    // ✅ Get product stock based on product type
    const getProductStock = (product) => {
        if (product.productType === "variable" && product.variant && product.variant.length > 0) {
            // For variable products, sum all variant stock
            const totalStock = product.variant.reduce((sum, variant) => sum + (variant.stock || 0), 0);
            return totalStock;
        } else {
            // For simple products
            return product.stock || 0;
        }
    };

    const exportToExcel = () => {
        setIsExporting(true);
        try {
            const dataToExport = filteredProducts.map(product => ({
                Name: product.name,
                Slug: product.slug,
                SKU: product.sku,
                "Product Type": product.productType || "simple",
                "Short Description": product.shortDescription || "N/A",
                Description: product.description || "N/A",
                "Additional Information": product.additionalInformation || "N/A",
                "Thumbnail Image": product.thumbImg ? `${process.env.NEXT_PUBLIC_API_URL}${product.thumbImg}` : "N/A",
                "Gallery Images": product.galleryImg && product.galleryImg.length > 0 
                    ? product.galleryImg.map(img => `${process.env.NEXT_PUBLIC_API_URL}${img}`).join(", ") 
                    : "N/A",
                Price: getProductPrice(product).replace('₹', ''),
                Stock: getProductStock(product),
                Category: product.category?.length
                    ? product.category.map(catId => {
                        const cat = categories.find(c => c._id === catId);
                        return cat ? cat.name : "";
                    }).join(", ")
                    : "—",
                Status: getProductStock(product) > 0 ? "In Stock" : "Out of Stock",
                "Product Type": product.productType || "simple",
                "Created Date": product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "Unknown",
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

            XLSX.writeFile(workbook, `Products_Export_${new Date().toISOString().split("T")[0]}.xlsx`);

            toast.success("Products exported to Excel successfully");
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            toast.error("Failed to export data");
        } finally {
            setIsExporting(false);
        }
    };

    // ✅ Delete handler
    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/product/` + id);
            toast.success("Product deleted successfully");
            fetchProducts();
        } catch (err) {
            console.error("Error deleting product", err);
            toast.error("Failed to delete product");
        }
    };

    // ✅ Edit handler
    const handleEdit = (productId) => {
        router.push(`/admin/add-product?id=${productId}`);
    };

    // ✅ Add new product handler
    const handleAddNew = () => {
        router.push("/admin/add-product");
    };

    // ✅ Filtering
    const filteredProducts = products.filter((product) =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productType?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ✅ Pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filteredProducts.slice(
        startIdx,
        startIdx + itemsPerPage
    );

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    return (
        <div>
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Product Inventory</h2>
                        <p className="text-gray-600 mt-1">
                            {products.length} products in total
                        </p>
                    </div>
                    <div className="flex space-x-3 mt-4 md:mt-0">
                        <button
                            onClick={exportToExcel}
                            disabled={isExporting}
                            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16h16V4M4 4l8 8m0 0l8-8m-8 8v12" />
                            </svg>
                            {isExporting ? "Exporting..." : "Export Excel"}
                        </button>
                        <button
                            onClick={handleAddNew}
                            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New Product
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="rounded-full bg-blue-100 p-3 mr-4">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Total Products</p>
                                <p className="text-2xl font-bold text-gray-800">{products.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="rounded-full bg-green-100 p-3 mr-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">In Stock</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {products.filter(p => getProductStock(p) > 0).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="rounded-full bg-amber-100 p-3 mr-4">
                                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Out of Stock</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {products.filter(p => getProductStock(p) <= 0).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="rounded-full bg-purple-100 p-3 mr-4">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 11.955 0 0112 2.944a11.955 11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Variable Products</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {products.filter(p => p.productType === "variable").length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="relative w-full md:w-2/5 mb-4 md:mb-0">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, SKU, or product type..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div className="flex space-x-3">
                            <button className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 flex items-center transition-colors">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filters
                            </button>
                            <button
                                onClick={fetchProducts}
                                className="px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-200 flex items-center transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-gray-600 text-lg">Loading products...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                            {/* <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th> */}
                                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="p-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {paginatedProducts.length > 0 ? (
                                            paginatedProducts.map((product) => {
                                                const productStock = getProductStock(product);
                                                const productPrice = getProductPrice(product);
                                                
                                                return (
                                                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="p-4">
                                                            <div className="flex items-center">
                                                                <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border border-gray-200">
                                                                    <img
                                                                        src={
                                                                            product.thumbImg
                                                                                ? `${process.env.NEXT_PUBLIC_API_URL}${product.thumbImg}`
                                                                                : "/placeholder.jpg"
                                                                        }
                                                                        alt={product.name}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</div>
                                                                    <div className="text-sm text-gray-500">SKU: {product.sku || "N/A"}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                product.productType === 'variable' 
                                                                    ? 'bg-purple-100 text-purple-800' 
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {product.productType || 'simple'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-sm text-gray-900 font-medium">
                                                            {productPrice}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="text-sm text-gray-900 font-medium">{productStock}</div>
                                                            {productStock > 0 && productStock < 10 && (
                                                                <div className="text-xs text-amber-600 font-medium">Low stock</div>
                                                            )}
                                                            {product.productType === "variable" && product.variant && product.variant.length > 1 && (
                                                                <div className="text-xs text-blue-600 font-medium">{product.variant.length} variants</div>
                                                            )}
                                                        </td>
                                                        {/* <td className="p-4">
                                                            <div className="text-sm text-gray-900">
                                                                {product.category && product.category.length > 0 ? (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {product.category.map((catId) => {
                                                                            const category = categories.find(c => c._id === catId);
                                                                            if (!category) return null;

                                                                            return (
                                                                                <span
                                                                                    key={catId}
                                                                                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100"
                                                                                >
                                                                                    {category.name}
                                                                                </span>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : (
                                                                    "—"
                                                                )}
                                                            </div>
                                                        </td> */}
                                                        <td className="p-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${productStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                {productStock > 0 ? 'In Stock' : 'Out of Stock'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <div className="flex justify-end space-x-2">
                                                                <button
                                                                    onClick={() => handleEdit(product._id)}
                                                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md p-2 transition-colors"
                                                                    title="Edit product"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                </button>
                                                                  {isAdmin() && (
                                                                <button
                                                                    onClick={() => handleDelete(product._id, product.name)}
                                                                    className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded-md p-2 transition-colors"
                                                                    title="Delete product"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                                  )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="7"
                                                    className="text-center p-8 text-gray-500"
                                                >
                                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p className="mt-4 text-lg font-medium">No products found</p>
                                                    <p className="mt-2 text-sm">Try adjusting your search or filter to find what you're looking for.</p>
                                                    <button
                                                        onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
                                                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                                    >
                                                        Clear Search
                                                    </button>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {filteredProducts.length > 0 && (
                                <div className="px-5 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                                    <div className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{startIdx + 1}</span> to <span className="font-medium">{Math.min(startIdx + itemsPerPage, filteredProducts.length)}</span> of <span className="font-medium">{filteredProducts.length}</span> results
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage((prev) => prev - 1)}
                                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === 1
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                                }`}
                                        >
                                            Previous
                                        </button>
                                        <div className="hidden md:flex space-x-1">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === pageNum
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                                <span className="px-2 py-2 text-sm text-gray-500">...</span>
                                            )}
                                        </div>
                                        <button
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage((prev) => prev + 1)}
                                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === totalPages
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                                }`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
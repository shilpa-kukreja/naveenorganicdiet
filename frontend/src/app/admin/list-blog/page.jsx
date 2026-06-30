"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ListBlog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const router = useRouter();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/blogs`);
        
        if (response.data && Array.isArray(response.data)) {
          setBlogs(response.data);
        } else {
          setBlogs([]);
          setError("Invalid data format received from server");
        }
      } catch (error) {
        console.error("Error fetching blogs", error);
        setError("Failed to load blogs. Please try again later.");
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting and filtering
  const sortedAndFilteredBlogs = () => {
    let filteredBlogs = blogs;
    
    // Apply search filter
    if (searchTerm) {
      filteredBlogs = blogs.filter(blog => 
        blog.blogName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (blog.blogDescription && blog.blogDescription.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filteredBlogs = [...filteredBlogs].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredBlogs;
  };

  const handleEdit = (blog) => {
    router.push(`/admin/add-blogs?id=${blog._id}`); 
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blog/${id}`
      );
      // alert(response.data.message || "Blog deleted successfully");
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting blog", error);
      alert("Failed to delete blog. Please try again.");
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    try {
      const dataToExport = blogs.map(blog => ({
        Name: blog.blogName,
        Description: blog.blogDescription || "No description",
        Date: new Date(blog.createdAt || Date.now()).toLocaleDateString(),
        Image: `${process.env.NEXT_PUBLIC_API_URL}${blog.blogImg}`
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Blogs");
      XLSX.writeFile(workbook, "blogs_export.xlsx");
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const openDeleteConfirm = (id, name) => {
    setDeleteConfirm({ id, name });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm(null);
  };

  const displayedBlogs = sortedAndFilteredBlogs();

  return (
    <div> 
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Blog Management</h1>
                  <p className="text-indigo-100 mt-1">Manage all your blog content in one place</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <Link href="/admin/add-blogs">
                    <button className="bg-white text-indigo-700 hover:bg-indigo-50 font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      New Blog Post
                    </button>
                  </Link>
                  <button
                    onClick={handleExport}
                    disabled={isExporting || blogs.length === 0}
                    className={`font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center ${
                      isExporting || blogs.length === 0 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    {isExporting ? "Exporting..." : "Export Excel"}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {/* Search and Filters */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search blogs..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Messages */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                  <span className="ml-3 text-gray-600">Loading blogs...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {displayedBlogs && displayedBlogs.length > 0 ? (
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('blogName')}
                            >
                              <div className="flex items-center">
                                Blog Name
                                {sortConfig.key === 'blogName' && (
                                  <svg className={`w-4 h-4 ml-1 ${sortConfig.direction === 'ascending' ? '' : 'transform rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                                  </svg>
                                )}
                              </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Image
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('createdAt')}
                            >
                              <div className="flex items-center">
                                Date
                                {sortConfig.key === 'createdAt' && (
                                  <svg className={`w-4 h-4 ml-1 ${sortConfig.direction === 'ascending' ? '' : 'transform rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                                  </svg>
                                )}
                              </div>
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {displayedBlogs.map((blog) => (
                            <tr
                              key={blog._id}
                              className="transition-all duration-150 hover:bg-gray-50"
                            >
                              <td className="px-6 py-4">
                                <div className="text-sm font-semibold text-gray-900">{blog.blogName}</div>
                                {/* <div className="text-sm text-gray-500 line-clamp-2 mt-1 max-w-xs">
                                  {blog.blogDescription || "No description available"}
                                </div> */}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border border-gray-200">
                                  <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${blog.blogImg}`}
                                    alt={blog.blogName}
                                    className="h-16 w-16 object-cover"
                                    // onError={(e) => {
                                    //   e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNGM0YzRjMiLz48cGF0aCBkPSJNMzIgMzZMMzYgNDBMMjggNDBMMzIgMzZaIiBmaWxsPSIjQkRCREJEIi8+PHBhdGggZD0iTTI0IDMyTDI4IDM2TDIwIDM2TDI0IDMyWiIgZmlsbD0iI0JEQkRCRCIvPjxwYXRoIGQ9Ik00MCAzMkw0NCAzNkwzNiAzNkw0MCAzMloiIGZpbGw9IiNCREJEQkQiLz48cGF0aCBkPSJNMzYgMjhMNDAgMzJMMzIgMzJMMzYgMjhaIiBmaWxsPSIjQkRCREJEIi8+PHBhdGggZD0iTTI4IDI4TDMyIDMyTDI0IDMyTDI4IDI4WiIgZmlsbD0iI0JEQkRCRCIvPjxwYXRoIGQ9Ik0zMiAyNEwzNiAyOEwyOCAyOEwzMiAyNFoiIGZpbGw9IiNCREJEQkQiLz48L3N2Zz4=";
                                    // }}
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(blog.createdAt || Date.now()).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <button 
                                    onClick={() => handleEdit(blog)} 
                                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-md py-2 px-3 transition duration-200 flex items-center"
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => openDeleteConfirm(blog._id, blog.blogName)}
                                    className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded-md py-2 px-3 transition duration-200 flex items-center"
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No blogs found</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by creating a new blog post.</p>
                      <div className="mt-6">
                        <Link href="/admin/add-blogs">
                          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            New Blog
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={closeDeleteConfirm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm.id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
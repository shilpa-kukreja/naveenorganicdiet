// pages/blog/index.js (Blog listing page)
"use client"
import React, { useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { AppContext } from '../context/AppContext';
import Header from '../componats/Header';
import Footer from '../componats/Footer';
import Breadcrumb from '../componats/Breadcrumb';

const BlogPage = () => {

 const {blogs}=useContext(AppContext)

   const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]+>/g, "");
  };

  return (
    <>
      <Head>
        <title>Blog | Organic Diet</title>
        <meta name="description" content="Discover the latest trends, styling tips, and inspiration from our experts" />
      </Head>
      <Header/>
      
      <div className="min-h-screen bg-gray-50 pb-16">
        <div className=" mx-auto ">
            <div>
                 <Breadcrumb pageType="other" />
            </div>
          <div className="text-center pt-4 mb-12 px-10">
            <h1 className="text-2xl md:text-4xl  font-bold text-gray-900 mb-4">Our Blog</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover the latest trends, styling tips, and inspiration from our experts
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 sm:gap-8 gap-2 sm:px-10 px-2">
            {blogs.map((blog) => (
              <article key={blog._id} className="bg-white rounded-md overflow-hidden  border border-[#00a63d] shadow-md hover:shadow-xl transition-all duration-300">
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={`http://localhost:5000${blog.blogImg}`}
                    alt={blog.blogName}
                    className="object-cover h-full transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-[#00a63d] sm:px-3 px-2 py-1 rounded-md shadow-sm">
                    <span className="text-xs font-medium text-white">{blog.blogDate}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h2 className="text-xl  font-bold text-gray-900 mb-3 line-clamp-2 capitalize hover:text-[#00a63d] transition-colors">
                    {blog.blogName}
                  </h2>
                  <p className="text-gray-600 mb-4 hidden sm:block  line-clamp-3">
                    {stripHtml(blog.blogDetail.substring(0, 110))}...
                  </p>

                   <p className="text-gray-600 mb-4 block sm:hidden  line-clamp-3">
                    {stripHtml(blog.blogDetail.substring(0, 50))}...
                  </p>
                  <Link 
                    href={`/blog/${blog.blogSlug}`}
                      className="inline-flex items-center text-[#00a63d] font-medium hover:text-[#00a63d] transition-colors group"
                  >
                    Read More
                    <svg 
                      className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
};


 

export default BlogPage;
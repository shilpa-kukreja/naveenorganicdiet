"use client";
import Image from "next/image";
import Link from "next/link";
import { AppContext } from "@/app/context/AppContext";
import Header from "@/app/componats/Header";
import Footer from "@/app/componats/Footer";
import { useContext, useState } from "react";
import { useParams } from "next/navigation";

export default function BlogDetailPage() {
    const params = useParams();
    const { slug } = params;
    const { blogs } = useContext(AppContext);
    const [copied, setCopied] = useState(false);
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
    
    const blogData = blogs.find((b) => b.blogSlug === slug);
    const latestBlogs = blogs.slice(0, 4);

    if (!blogData) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
                <Header />
                <div className="flex-grow flex items-center justify-center px-4">
                    <div className="text-center p-12 bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Blog Post Not Found</h1>
                        <p className="text-gray-600 mb-8 leading-relaxed">The blog post you're looking for doesn't exist or has been moved.</p>
                        <Link 
                            href="/blog" 
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Return to Blog
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const handleShare = async (platform) => {
        const url = `${window.location.origin}/blog/${blogData.blogSlug}`;
        const title = blogData.blogName;
        const text = blogData.blogDetail.substring(0, 100) + '...';

        switch (platform) {
            case 'copy':
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                break;
            default:
                if (navigator.share) {
                    navigator.share({ title, text, url });
                }
        }
    };
     

 const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]+>/g, "");
  };
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />
            
            {/* Enhanced Hero Section with Background Image */}
            <section className="relative py-20 lg:py-28 overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900">
                    <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
                        style={{
                            backgroundImage: 'url("https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")'
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
                </div>
                
                <div className="container mx-auto px-4 max-w-6xl relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        {/* Enhanced Breadcrumb */}
                        <nav className="flex justify-center items-center text-sm text-gray-300 mb-8">
                            <Link href="/" className="hover:text-amber-300 transition-colors duration-200 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Home
                            </Link>
                            <svg className="w-4 h-4 mx-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <Link href="/blog" className="hover:text-amber-300 transition-colors duration-200">
                                Blog
                            </Link>
                            <svg className="w-4 h-4 mx-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-amber-300 font-medium truncate max-w-xs">
                                {blogData.blogName}
                            </span>
                        </nav>
                        
                        {/* Enhanced Title */}
                        <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent drop-shadow-lg">
                            {blogData.blogName}
                        </h1>
                        
                        {/* Enhanced Meta Information */}
                        <div className="flex flex-wrap items-center justify-center gap-6 text-gray-300 mb-8">
                            <div className="flex items-center gap-3 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
                                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                                <span className="font-medium">{formatDate(blogData.blogDate)}</span>
                            </div>
                            <div className="flex items-center gap-3 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
                                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                                <span className="font-medium">5 min read</span>
                            </div>
                        </div>

                        {/* Scroll Indicator */}
                        <div className="animate-bounce mt-8">
                            <svg className="w-6 h-6 mx-auto text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="flex-grow py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-white">
                <div className="container mx-auto px-4 max-w-8xl">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                        {/* Main Article Content */}
                        <article className="">
                            {/* Enhanced Featured Image */}
                            <div className="relative h-80 lg:h-96 rounded-3xl overflow-hidden mb-12 shadow-2xl border border-gray-200 group">
                                <img
                                    src={`http://localhost:5000${blogData.blogImg}`}
                                    alt={blogData.blogName}
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                {/* <div className="absolute bottom-6 left-6 right-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4">
                                        <p className="text-sm font-medium">Featured Image</p>
                                    </div>
                                </div> */}
                            </div>

                            {/* Enhanced Blog Content */}
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                                <div className="p-8 lg:p-12">
                                    <div className="prose prose-lg max-w-none">
                                        <div className="text-gray-800 leading-relaxed space-y-8">
                                            {blogData.blogDetail.split('\n').map((paragraph, index) => (
                                                <p key={index} className="text-xl text-gray-800 leading-9 font-light tracking-wide">
                                                     {stripHtml(paragraph)}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                    

                                    {/* Enhanced Action Section */}
                                    <div className="mt-16 pt-12 border-t border-gray-200">
                                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-[#00a63d]">
                                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-12 h-12 bg-[#00a63d] rounded-xl flex items-center justify-center shadow-lg">
                                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-2xl font-bold text-gray-900">Enjoyed this article?</h3>
                                                            <p className="text-gray-600 mt-1">Share your thoughts with the community</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                                    {/* Social Sharing Buttons */}
                                                    <div className="flex items-center gap-3">
                                                        {[
                                                            {
                                                                platform: 'twitter',
                                                                icon: (
                                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.033 10.033 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                                                    </svg>
                                                                ),
                                                                color: 'hover:bg-blue-500 hover:text-white'
                                                            },
                                                            {
                                                                platform: 'linkedin',
                                                                icon: (
                                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                                                    </svg>
                                                                ),
                                                                color: 'hover:bg-blue-700 hover:text-white'
                                                            },
                                                            {
                                                                platform: 'facebook',
                                                                icon: (
                                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                                                    </svg>
                                                                ),
                                                                color: 'hover:bg-blue-600 hover:text-white'
                                                            }
                                                        ].map(({ platform, icon, color }) => (
                                                            <button
                                                                key={platform}
                                                                onClick={() => handleShare(platform)}
                                                                className={`
                                                                    w-12 h-12 flex items-center justify-center 
                                                                    bg-white text-gray-600 rounded-xl 
                                                                    border border-gray-200 shadow-sm
                                                                    transition-all duration-300 ease-out
                                                                    hover:shadow-lg hover:scale-105
                                                                    ${color}
                                                                    group relative
                                                                `}
                                                                aria-label={`Share on ${platform}`}
                                                            >
                                                                {icon}
                                                                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                                                    Share on {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {/* Enhanced Copy Link Button */}
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => handleShare('copy')}
                                                            className={`
                                                                flex items-center gap-3 px-6 py-3 
                                                                font-semibold rounded-xl 
                                                                transition-all duration-300 ease-out
                                                                shadow-md hover:shadow-lg
                                                                transform hover:scale-105
                                                                min-w-[140px] justify-center
                                                                ${copied 
                                                                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                                                                    : 'bg-[#00a63d] hover:bg-[#00a63d] text-white'
                                                                }
                                                            `}
                                                        >
                                                            {copied ? (
                                                                <>
                                                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                    <span className="font-medium">Copied!</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                    </svg>
                                                                    <span className="font-medium">Copy Link</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Back to Blog Button */}
                                        <div className="flex justify-center mt-8">
                                            <Link
                                                href="/blog"
                                                className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all duration-300 shadow-lg hover:shadow-xl group"
                                            >
                                                <svg className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                Back to All Articles
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>

                        {/* Enhanced Sidebar */}
                        <aside className="lg:w-4/5">
                            <div className="space-y-8 sticky top-24">
                                {/* Latest Posts */}
                                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                                    <div className="p-8">
                                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
                                            <div className="w-2 h-8 bg-[#00a63d] rounded-full"></div>
                                            <h2 className="text-2xl font-bold text-gray-900">Latest Articles</h2>
                                        </div>
                                        <div className="space-y-6">
                                            {latestBlogs.map((latestBlog) => (
                                                <Link 
                                                    href={`/blog/${latestBlog.blogSlug}`}
                                                    key={latestBlog.id}
                                                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 hover:shadow-md transition-all duration-300 group border border-transparent hover:border-gray-200"
                                                >
                                                    <div className="relative w-20 h-20 flex-shrink-0">
                                                        <img
                                                            src={`http://localhost:5000${latestBlog.blogImg}`}
                                                            alt={latestBlog.blogName}
                                                            className="object-cover rounded-xl border border-[#00a63d] shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-amber-700 transition-colors leading-tight mb-2">
                                                            {latestBlog.blogName}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 font-medium">{formatDate(latestBlog.blogDate)}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                              
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
// import React from 'react'

// function HomeVideo() {
//   return (
//     <div className='py-12 bg-gray-50'>
//             <div className="container mx-auto">
//                 <h2></h2>
//                 <div className='flex flex-row gap-2'>
//                     <div className='basis-1/3'>
//                         <video src="https://www.shutterstock.com/shutterstock/videos/3755613917/preview/stock-footage-mix-of-macadamia-pine-cashew-hazelnut-peanut-pistachio-nuts-in-a-wooden-box-with-several.webm" loop autoPlay muted></video>
//                     </div>
//                     <div className='basis-2/3'>
//                         <video src="https://organicdiet.co.in/wp-content/uploads/2025/08/spice-grinding.mp4" loop autoPlay muted className='mb-3'></video>
//                         <video src="https://organicdiet.co.in/wp-content/uploads/2025/08/ghee-making-video.mp4" loop autoPlay muted></video>
//                     </div>
//                 </div>

//             </div>
//     </div>
//   )
// }

// export default HomeVideo



"use client";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function HomeVideo() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const videoRefs = useRef({});

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/get`);
      const sortedVideos = response.data.videos?.sort((a, b) => a.order - b.order) || [];
      setVideos(sortedVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoHover = (videoId, isHovering) => {
    setHoveredVideo(isHovering ? videoId : null);
    if (videoRefs.current[videoId]) {
      if (isHovering) {
        videoRefs.current[videoId].play();
      } else {
        videoRefs.current[videoId].pause();
        videoRefs.current[videoId].currentTime = 0;
      }
    }
  };

  if (loading) {
    return (
      <div className='py-16 bg-gradient-to-br from-gray-50 to-gray-100'>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className='flex flex-col lg:flex-row gap-8'>
            <div className='lg:basis-1/3 animate-pulse'>
              <div className='bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl h-96 w-full shadow-xl'></div>
            </div>
            <div className='lg:basis-2/3 space-y-8'>
              {[1, 2].map((i) => (
                <div key={i} className='animate-pulse'>
                  <div className='bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl h-64 w-full shadow-xl'></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='py-16 bg-gradient-to-br from-gray-50 to-gray-100'>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-red-50 text-red-600 px-6 py-4 rounded-2xl shadow-lg border border-red-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  const leftVideo = videos[0];
  const rightVideos = videos.slice(1, 3);

  return (
    <div className='py-16 bg-gray-200'>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Featured Videos
          </h2>
          <div className="w-24 h-1 bg-[#D4AF37] mx-auto mt-4 rounded-full"></div>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Discover our curated collection of premium video content
          </p>
        </div>

        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Left Featured Video */}
          <div className='lg:basis-1/3 group'>
            {leftVideo && (
              <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                <video
                  ref={el => videoRefs.current[leftVideo._id] = el}
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${leftVideo.video}`}
                  loop
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                  title={leftVideo.title}
                />
                
                {/* Overlay Gradient */}
                {/* <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div> */}
                
                {/* Featured Badge */}
                {/* <div className="absolute top-4 left-4 bg-gradient-to-r from-[#00a63d] to-[#008c32] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                  FEATURED
                </div> */}
                
                {/* Play Button Overlay */}
                {/* <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-[#00a63d] ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div> */}

                {/* Video Info */}
                {/* {leftVideo.title && (
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/90 to-transparent">
                    <h3 className="text-white font-bold text-xl mb-2">{leftVideo.title}</h3>
                    {leftVideo.description && (
                      <p className="text-gray-200 text-sm line-clamp-2">{leftVideo.description}</p>
                    )}
                  </div>
                )} */}
              </div>
            )}
          </div>

          {/* Right Videos Stack */}
          <div className='lg:basis-2/3 space-y-8'>
            {rightVideos.map((video, index) => (
              <div 
                key={video._id} 
                className="group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
                onMouseEnter={() => handleVideoHover(video._id, true)}
                onMouseLeave={() => handleVideoHover(video._id, false)}
              >
                <div className="relative aspect-video">
                  <video
                    ref={el => videoRefs.current[video._id] = el}
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${video.video}`}
                    muted
                    playsInline
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                    // title={video.title}
                  />
                  
                  {/* Overlay Gradient */}
                  {/* <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div> */}
                  
                  {/* Video Number Badge */}
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                    {index + 2}
                  </div>
                  
                  {/* Play/Pause Indicator */}
                  {/* <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                      {hoveredVideo === video._id ? (
                        <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <svg className="w-7 h-7 text-[#00a63d] ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </div>
                  </div> */}

                  {/* Video Info */}
                  {/* {video.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/90 to-transparent">
                      <h3 className="text-white font-semibold text-lg mb-1">{video.title}</h3>
                      {video.description && (
                        <p className="text-gray-200 text-sm line-clamp-1">{video.description}</p>
                      )}
                    </div>
                  )} */}
                </div>
              </div>
            ))}
            
            {/* Premium Placeholders if needed */}
            {rightVideos.length < 2 && Array.from({ length: 2 - rightVideos.length }).map((_, index) => (
              <div key={`placeholder-${index}`} className="group">
                <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-500 font-medium">Coming Soon</span>
                    <p className="text-gray-400 text-sm mt-1">Video {index + 2}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .group {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .group:nth-child(1) { animation-delay: 0.1s; }
        .group:nth-child(2) { animation-delay: 0.2s; }
        .group:nth-child(3) { animation-delay: 0.3s; }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #00a63d, #008c32);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #008c32;
        }
        
        /* Video Container Styles */
        video {
          object-fit: cover;
        }
        
        /* Line Clamp Utility */
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default HomeVideo;
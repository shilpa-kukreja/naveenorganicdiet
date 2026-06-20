// components/Testimonials.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const Testimonial = () => {
  const [isMounted, setIsMounted] = useState(false);

 const [testimonials, setTestimonials] = useState([]);

useEffect(() => {
  const fetchTestimonials = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/testimonials/all");
      const data = await res.json();
      console.log("Fetched testimonials:", data);

      if (data.success) {
        setTestimonials(data.testimonials);
      }
    } catch (err) {
      console.log("Error fetching testimonials:", err);
    }
  };

  fetchTestimonials();
}, []);




  useEffect(() => {
    setIsMounted(true);
  }, []);

  // const testimonials = [
  //   {
  //     id: 1,
  //     name: "Mr. Karime Jackerty",
  //     position: "CTO, Green",
  //     rating: 5,
  //     content: "When an unknown printer took a galley offer type are ending scrambled it to make follow type area follow wing specimen area book.",
  //     avatar: "KJ"
  //   },
  //   {
  //     id: 2,
  //     name: "Lisa K. Berg",
  //     position: "CEO, Green",
  //     rating: 5,
  //     content: "When an unknown printer took a galley offer type are ending scrambled it to make follow type area follow wing specimen area book.",
  //     avatar: "LB"
  //   },
  //   {
  //     id: 3,
  //     name: "Richard A. Whalen",
  //     position: "CEO, Marketing",
  //     rating: 5,
  //     content: "When an unknown printer took a galley offer type are ending scrambled it to make follow type area follow wing specimen area book.",
  //     avatar: "RW"
  //   },
  //   {
  //     id: 4,
  //     name: "Sarah Johnson",
  //     position: "Director, Tech Corp",
  //     rating: 5,
  //     content: "When an unknown printer took a galley offer type are ending scrambled it to make follow type area follow wing specimen area book.",
  //     avatar: "SJ"
  //   },
  //   {
  //     id: 5,
  //     name: "Michael Chen",
  //     position: "Product Manager, Innovate",
  //     rating: 5,
  //     content: "When an unknown printer took a galley offer type are ending scrambled it to make follow type area follow wing specimen area book.",
  //     avatar: "MC"
  //   },
  //   {
  //     id: 6,
  //     name: "Emma Davis",
  //     position: "Founder, Creative Labs",
  //     rating: 5,
  //     content: "When an unknown printer took a galley offer type are ending scrambled it to make follow type area follow wing specimen area book.",
  //     avatar: "ED"
  //   }
  // ];

  const renderStars = (rating) => {
    return Array.from({ length: rating }, (_, index) => (
      <svg key={index} className="w-5 h-5 text-[#D4AF37] fill-current" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    ));
  };

  // Don't render Swiper on server to avoid hydration mismatch
  if (!isMounted) {
    return (
      <section className="py-12 bg-gradient-to-br from-slate-50 via-white to-[#D4AF37] relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          {/* Static header that matches the client */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#D4AF37] border border-[#D4AF37] mb-6">
              <span className="w-2 h-2 bg-[#D4AF37] rounded-full mr-2"></span>
              <span className="text-sm font-medium text-white uppercase tracking-wider">Testimonials</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              We Are Trusted By <span className="text-[#D4AF37]">Clients</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              When an unknown printer took a galley of type and scrambled make specimen book it has survived five centuries.
            </p>
          </div>

          {/* Static testimonial grid for SSR */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
            {testimonials.slice(0, 3).map((testimonial) => (
              <div key={testimonial.id} className="bg-white/80 rounded-3xl shadow-lg p-8 border border-[#D4AF37]">
                <div className="flex mb-6">
                  {renderStars(testimonial.rating)}
                </div>
                <div className="text-amber-100 mb-6">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
                  </svg>
                </div>
                <blockquote className="text-gray-700 text-lg leading-relaxed mb-8 font-medium">
                  {testimonial.content}
                </blockquote>
                <div className="flex items-center pt-6 border-t border-amber-50">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37] to-[#D4AF37] rounded-2xl flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                      {testimonial.avatar}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {testimonial.name}
                    </h4>
                    <p className="text-[#D4AF37] font-medium text-sm">
                      {testimonial.position}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-8 mt-16 pt-8 border-t border-amber-100">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">500+</div>
              <div className="text-gray-600 text-sm">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">4.9/5</div>
              <div className="text-gray-600 text-sm">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">98%</div>
              <div className="text-gray-600 text-sm">Would Recommend</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 mx-auto max-w-8xl  px-4 sm:px-6 lg:px-16 via-white to-amber-50 relative overflow-hidden">
      {/* Background Decorations - Only render on client */}
      {/* {isMounted && (
        <>
          <div className="absolute top-0 left-0 w-72 h-72 bg-[#00a63d] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#00a63d] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#00a63d] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </>
      )} */}
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-100 border border-[#D4AF37] mb-6">
            <span className="w-2 h-2 bg-[#D4AF37] rounded-full mr-2"></span>
            <span className="text-sm font-medium text-[#D4AF37] uppercase tracking-wider">Testimonials</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            We Are Trusted By <span className="text-[#D4AF37]">Clients</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            When an unknown printer took a galley of type and scrambled make specimen book it has survived five centuries.
          </p>
        </div>

        {/* Swiper Slider - Only render on client */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={{
              nextEl: '.custom-next',
              prevEl: '.custom-prev',
            }}
            pagination={{
              clickable: true,
              el: '.custom-pagination',
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="!pb-16"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl p-8 h-full transition-all duration-500 border border-[#D4AF37] hover:border-[#D4AF37] hover:scale-100 hover:bg-white">
                  {/* Rating */}
                  <div className="flex mb-6">
                    {renderStars(testimonial.rating)}
                  </div>

                  {/* Quote Icon */}
                  <div className="text-[#D4AF37] group-hover:text-[#D4AF37] mb-6 transition-colors duration-300">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
                    </svg>
                  </div>

                  {/* Testimonial Content */}
                  <blockquote className="text-gray-700 text-lg leading-relaxed mb-4 font-medium">
                    {testimonial.content}
                  </blockquote>

                  {/* Client Info */}
                  <div className="flex items-center pt-4 border-t border-amber-50 group-hover:border-amber-100 transition-colors duration-300">
                    <div className="relative">

                      {/* <div className="w-14 h-14 bg-gradient-to-br from-[#00a63d] to-[#00a63d] rounded-2xl flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {testimonial.avatar}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div> */}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">
                        {testimonial.name}
                      </h4>
                      <p className="text-[#D4AF37] font-medium text-sm">
                        {testimonial.position}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation & Pagination */}
          <div className="flex flex-col items-center mt-4 space-y-3">
            {/* Pagination */}
            <div className="custom-pagination flex justify-center space-x-2 !relative !w-auto"></div>
            
            {/* Navigation Buttons */}
            {/* <div className="flex items-center space-x-4">
              <button className="custom-prev group w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center hover:bg-[#00a63d] hover:shadow-xl transition-all duration-300 border border-[#00a63d]">
                <svg className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              

              <div className="w-12 h-12 bg-[#00a63d] rounded-2xl flex items-center justify-center text-white font-semibold text-sm">
                {testimonials.length}
              </div>
              
              <button className="custom-next group w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center hover:bg-[#00a63d] hover:shadow-xl transition-all duration-300 border border-[#00a63d]">
                <svg className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div> */}
          </div>
        </div>

        {/* Trust Badges */}
        {/* <div className="flex flex-wrap justify-center items-center gap-8 mt-16 pt-8 border-t border-[#00a63d]">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#00a63d]">500+</div>
            <div className="text-gray-600 text-sm">Happy Clients</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#00a63d]">4.9/5</div>
            <div className="text-gray-600 text-sm">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#00a63d]">98%</div>
            <div className="text-gray-600 text-sm">Would Recommend</div>
          </div>
        </div> */}
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: #00a63d;
          opacity: 0.5;
        }
        
        .swiper-pagination-bullet-active {
          background: #00a63d;
          opacity: 1;
          transform: scale(1.2);
        }
        
        .swiper-slide {
          height: auto;
        }
      `}</style>
    </section>
  );
};

export default Testimonial;
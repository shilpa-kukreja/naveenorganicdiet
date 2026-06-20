"use client";
import React from 'react';
import { Shield, Truck, Clock, HeadphonesIcon, Award, RefreshCw } from 'lucide-react';

function WhyChoose() {
  const features = [
    {
      icon: <Shield className="w-8 h-8 mb-3" />,
      title: "Secure Payment",
      description: "100% secure payment methods with SSL encryption",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Truck className="w-8 h-8 mb-3" />,
      title: "Fast Delivery",
      description: "Free shipping on orders over $50. Delivery in 2-3 days",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Clock className="w-8 h-8 mb-3" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support for all your needs",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Award className="w-8 h-8 mb-3" />,
      title: "Quality Guarantee",
      description: "30-day money-back guarantee on all products",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: <RefreshCw className="w-8 h-8 mb-3" />,
      title: "Easy Returns",
      description: "Hassle-free returns within 30 days of purchase",
      color: "from-red-500 to-rose-500"
    },
    {
      icon: <HeadphonesIcon className="w-8 h-8 mb-3" />,
      title: "Expert Advice",
      description: "Get professional guidance from our product experts",
      color: "from-indigo-500 to-blue-500"
    }
  ];

  return (
    <section className="py-16 mx-auto max-w-8xl  px-4 sm:px-6 lg:px-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose <span className="text-[#D4AF37]">Us</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We are committed to providing the best shopping experience with premium quality products and exceptional customer service.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#D4AF37] transform hover:-translate-y-2 flex flex-col items-center justify-center"
            >
     
              
            {feature.icon}

              {/* Content */}
              <h3 className="text-lg font-bold text-gray-900 mb-3  transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-center">
                {feature.description}
              </p>

            </div>
          ))}
        </div>

      </div>

      {/* Background Decorative Elements */}
      {/* <div className="absolute left-0 top-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute right-0 bottom-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div> */}
    </section>
  );
}

export default WhyChoose;
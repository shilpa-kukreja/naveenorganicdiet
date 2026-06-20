// components/FeaturesBanner.jsx
import React from 'react';

const FeaturesBanner = () => {
  const features = [
    {
      title: "Free Shipping",
      description: "Orders $50 or more",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      )
    },
    {
      title: "Save Money",
      description: "At lowest price",
      icon: (
        <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    {
      title: "100% Return Policy",
      description: "Any Time Return Product",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    {
      title: "Best Deal Offer",
      description: "Grab Your Gear and Go",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "Support 24/7",
      description: "Contact us 24 hours a day",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <section className="bg-gradient-to-r from-gray-900 to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex justify-center items-center text-center group gap-3">
              {/* Icon Container */}
              <div className="w-14 h-14 bg-[#00a63d] rounded-full flex items-center justify-center  group-hover:bg-[#007a2f] transition-colors duration-300">
                <div className="text-white">
                  {feature.icon}
                </div>
              </div>
              <div>
                     {/* Title */}
                    <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-[#00a63d] transition-colors duration-300">
                        {feature.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-300 text-sm leading-tight group-hover:text-white transition-colors duration-300">
                        {feature.description}
                    </p>
              </div>
             
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBanner;
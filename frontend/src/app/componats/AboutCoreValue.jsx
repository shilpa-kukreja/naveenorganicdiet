// 'use client';

// import React from 'react';

// const sections = [
//   {
//     id: 'mission',
//     title: "Our Mission",
//     description:
//       "Our Mission is to lead globally in organic food, promoting sustainability and healthier lifestyles. We offer pure, chemical-free products that combine quality and nutrition, reviving the ancient tradition of natural diets to nourish people and protect the planet.",
//     bgColor: "bg-amber-50",
//     borderColor: "border-amber-500",
//     iconBg: "bg-amber-100",
//     iconText: "🎯",
//   },
//   {
//     id: 'vision',
//     title: "Our Vision",
//     description:
//       "Our Vision is to build a healthier global community by delivering authentic organic products and encouraging better food habits — with a constant commitment to organic choices for a sustainable future.",
//     bgColor: "bg-green-50",
//     borderColor: "border-green-500",
//     iconBg: "bg-green-100",
//     iconText: "👁️",
//   },
//   {
//     id: 'values',
//     title: "Values",
//     description:
//       "Our Commitment is to meet strict global quality standards with products that are safe, nutritious, and authentic. We care for farmers, employees, and consumers alike, fostering holistic wellbeing with respect and devotion to Mother Nature.",
//     bgColor: "bg-blue-50",
//     borderColor: "border-blue-500",
//     iconBg: "bg-blue-100",
//     iconText: "❤️",
//   },
//   {
//     id: 'work',
//     title: "How We Work",
//     description:
//       "Our Promise is to deliver only what we commit — every product passes strict quality checks before shipment. With best practices in production, strong R&D support, and close ties to farmers in Haryana, we ensure authenticity, purity, and consumer satisfaction.",
//     bgColor: "bg-purple-50",
//     borderColor: "border-purple-500",
//     iconBg: "bg-purple-100",
//     iconText: "⚙️",
//   },
// ];

// function AboutCoreValue() {
//   return (
//     <section className="py-20 bg-white">
//       <div className="container mx-auto px-4">
//         {/* Heading */}
//         <div className="text-center mb-16">
//           <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
//             Our Commitment
//           </h1>
//           <p className="text-gray-600 text-lg max-w-2xl mx-auto">
//             Dedicated to organic excellence and sustainable practices
//           </p>
//         </div>

//         {/* Core Values Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
//           {sections.map((section) => (
//             <div
//               key={section.id}
//               className={`${section.bgColor} p-6 rounded-xl border-l-4 ${section.borderColor} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
//             >
//               <div className="mb-4">
//                 <div
//                   className={`w-full h-32 ${section.iconBg} rounded-lg mb-3 flex items-center justify-center`}
//                 >
//                   <span className="text-4xl" role="img" aria-label={section.title}>
//                     {section.iconText}
//                   </span>
//                 </div>
//                 <h2 className="text-xl font-bold text-gray-900 text-center">
//                   {section.title}
//                 </h2>
//               </div>

//               <p className="text-gray-700 leading-relaxed text-sm">
//                 {section.description}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// export default AboutCoreValue;





'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AboutCoreValue() {
  const [coreValues, setCoreValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageTitle, setPageTitle] = useState({
    mainTitle: "Our Commitment",
    subtitle: "Dedicated to organic excellence and sustainable practices"
  });

  useEffect(() => {
    fetchCoreValues();
  }, []);

  const fetchCoreValues = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/about-core-values/active`);
      if (response.data.success) {
        setCoreValues(response.data.coreValues || []);
      }
    } catch (error) {
      console.error('Error fetching core values:', error);
      setError('Failed to load core values');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-300 rounded mb-4 max-w-md mx-auto"></div>
              <div className="h-6 bg-gray-300 rounded max-w-lg mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 p-6 rounded-xl h-64"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-600 bg-red-50 p-4 rounded-lg max-w-md mx-auto">
            {error}
          </div>
        </div>
      </section>
    );
  }

  if (coreValues.length === 0) {
    return null; // Don't render anything if no active core values
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {pageTitle.mainTitle}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {pageTitle.subtitle}
          </p>
        </div>

        {/* Core Values Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {coreValues.map((value) => (
            <div
              key={value._id}
              className={`${value.bgColor} p-6 rounded-xl border-l-4 ${value.borderColor} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
            >
              <div className="mb-4">
                <div
                  className={`w-full h-32 ${value.iconBg} rounded-lg mb-3 flex items-center justify-center`}
                >
                  <span className="text-4xl" role="img" aria-label={value.title}>
                    {value.icon}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 text-center">
                  {value.title}
                </h2>
              </div>

              <p className="text-gray-700 leading-relaxed text-sm">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutCoreValue;

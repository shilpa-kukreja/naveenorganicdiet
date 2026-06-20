"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CircleCheck } from 'lucide-react';

function AboutSec() {
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAboutSection();
  }, []);

  const fetchAboutSection = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/about/active');
      if (response.data.success) {
        setSection(response.data.section);
      }
    } catch (error) {
      console.error('Error fetching about section:', error);
      setError('Failed to load about section');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='py-12'>
        <div className="container mx-auto px-4">
          <div className='flex flex-col lg:flex-row gap-8 items-center'>
            <div className='lg:basis-1/2'>
              <div className="animate-pulse">
                <div className="h-10 bg-gray-300 rounded mb-5 w-3/4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-300 rounded w-4/6"></div>
                </div>
                <div className="mt-6 space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className='lg:basis-2/3'>
              <div className="animate-pulse bg-gray-300 rounded-xl h-96 w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='py-12'>
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-600 bg-red-50 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!section) {
    return null; // Don't render anything if no active section
  }

  return (
    <div className='py-12  max-w-8xl  px-4 sm:px-6 lg:px-16'>
      <div className="container mx-auto px-4">
        <div className='flex flex-col lg:flex-row gap-8 items-center'>
          <div className='lg:basis-1/2'>
            <h1 className='text-3xl lg:text-4xl font-bold mb-5'>{section.title}</h1>
            <div 
              className='mb-4 text-lg text-gray-600'
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
            {section.points && section.points.length > 0 && (
              <ul className="space-y-2">
                {section.points.map((point, index) => (
                  <li key={index} className="font-medium flex items-start">
                    <CircleCheck className='w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0' />
                    <span>{point.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className='lg:basis-2/3'>
            <img 
              src={`http://localhost:5000${section.image}`} 
              className='w-full rounded-xl border border-gray-300 shadow-lg' 
              alt={section.title} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutSec;
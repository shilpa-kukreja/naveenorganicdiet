'use client';
import Link from 'next/link';

import { useState } from 'react';
import Header from '../componats/Header';
import Footer from '../componats/Footer';

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('');

  const sections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'data-collection', title: 'Data Collection' },
    { id: 'data-usage', title: 'Data Usage' },
    { id: 'data-protection', title: 'Data Protection' },
    { id: 'cookies', title: 'Cookies' },
    { id: 'rights', title: 'Your Rights' },
    { id: 'changes', title: 'Policy Changes' },
    { id: 'contact', title: 'Contact Us' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-green-700 to-green-900 py-16 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex mb-8" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-2">
                <li className="inline-flex items-center">
                  <Link href="/" className="inline-flex items-center text-sm font-medium text-green-100 hover:text-white">
                    <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                      <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                    </svg>
                    Home
                  </Link>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <svg className="w-3 h-3 text-green-300 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                    </svg>
                    <span className="ml-1 text-sm font-medium text-white md:ml-2">Privacy Policy</span>
                  </div>
                </li>
              </ol>
            </nav>

            <header className="text-center mb-4">
              <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
              <p className="text-lg text-green-100 max-w-3xl mx-auto">
                Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
              </p>
              <div className="mt-6 flex justify-center">
                <div className="bg-green-800/30 backdrop-blur-sm rounded-full px-4 py-2 text-sm inline-flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.2 6.5 10.266a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd"></path>
                  </svg>
                  Last updated: September 2025
                </div>
              </div>
            </header>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Table of Contents */}
            <div className="lg:w-1/4">
              <div className="sticky top-24 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                  </svg>
                  On this page
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className={`block py-2 px-3 rounded-lg text-sm transition-all ${activeSection === section.id ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                      onClick={() => setActiveSection(section.id)}
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Introduction */}
                <section id="introduction" className="p-8 border-b border-gray-100">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="bg-green-100 p-2 rounded-lg mr-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    Introduction
                  </h2>
                  <div className="ml-14">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      At Syuta, we are committed to protecting your privacy and ensuring the security of your personal details. This Privacy Policy outlines how we collect, use, and safeguard your data when you interact with our website, explore our collections, or make a purchase.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      By using our website and services, you agree to the practices described in this policy. We encourage you to read this document carefully to understand how we handle your information.
                    </p>
                  </div>
                </section>

                {/* Data Collection */}
                <section id="data-collection" className="p-8 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                      </svg>
                    </div>
                    Information We Collect
                  </h2>
                  <div className="ml-14">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We collect information you share with us directly, as well as data automatically captured during your use of our website and services.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                          Personal Information
                        </h3>
                        <ul className="text-gray-700 space-y-2 text-sm">
                          <li className="flex items-start">
                            <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Name, email address, and phone number
                          </li>
                          <li className="flex items-start">
                            <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Shipping and billing addresses
                          </li>
                          <li className="flex items-start">
                            <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                             Securely processed payment details
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
                          </svg>
                          Usage Data
                        </h3>
                        <ul className="text-gray-700 space-y-2 text-sm">
                          <li className="flex items-start">
                            <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            IP address and browser type
                          </li>
                          <li className="flex items-start">
                            <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Pages visited and time spent on site
                          </li>
                          <li className="flex items-start">
                            <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Device details and operating system
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500">
                      We only collect information necessary to provide our services and improve your shopping experience.
                    </p>
                  </div>
                </section>

                {/* Data Usage */}
                <section id="data-usage" className="p-8 border-b border-gray-100">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="bg-purple-100 p-2 rounded-lg mr-4">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
                      </svg>
                    </div>
                    How We Use Your Information
                  </h2>
                  <div className="ml-14">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      We use the information we collect for various purposes, including:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-5 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-3">Service Provision</h3>
                        <ul className="text-gray-700 space-y-2 text-sm">
                          <li className="flex items-start">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            Processing orders and transactions
                          </li>
                          <li className="flex items-start">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            Providing customer support
                          </li>
                          <li className="flex items-start">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            Sending order confirmations and delivery updates
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 p-5 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-3">Communication</h3>
                        <ul className="text-gray-700 space-y-2 text-sm">
                          <li className="flex items-start">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            Responding to inquiries and requests
                          </li>
                          <li className="flex items-start">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            Sharing promotional offers and product updates (with your consent)
                          </li>
                          <li className="flex items-start">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            Sending important policy or service notifications
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 p-5 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-3">Improvement & Analytics</h3>
                        <ul className="text-gray-700 space-y-2 text-sm">
                          <li className="flex items-start">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            Analyzing website usage patterns
                          </li>
                          <li className="flex items-start">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            Enhancing our collections and services
                          </li>
                          <li className="flex items-start">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            Improving overall customer experience
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 p-5 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-3">Security & Legal</h3>
                        <ul className="text-gray-700 space-y-2 text-sm">
                          <li className="flex items-start">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            Preventing fraudulent transactions
                          </li>
                          <li className="flex items-start">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            Complying with legal obligations
                          </li>
                          <li className="flex items-start">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            Protecting our rights, customers, and property
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* More sections would follow the same pattern */}
                
                {/* Contact Section */}
                <section id="contact" className="p-8 bg-green-50">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="bg-green-200 p-2 rounded-lg mr-4">
                      <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    Contact Us
                  </h2>
                  <div className="ml-14">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      If you have any questions about this Privacy Policy or how we handle your data, please contact us:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-5 rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Contact Information</h3>
                        <ul className="space-y-3">
                          <li className="flex items-start">
                            <svg className="w-5 h-5 text-gray-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                            <a href="mailto:pydlifesciences@gmail.com" className="text-blue-600 hover:underline">pydlifesciences@gmail.com</a>
                          </li>
                          <li className="flex items-start">
                            <svg className="w-5 h-5 text-gray-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            <a href="tel:+919868866869" className="text-blue-600 hover:underline">+91 9868866869</a>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-white p-5 rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Registered Address</h3>
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-gray-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          <div>
                            <p className="text-gray-700">B-2/104B, SAFDARJUNG ENCLAVE</p>
                            <p className="text-gray-700">New Delhi-110029</p>
                            <p className="text-gray-700">India</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
              
              {/* Last updated */}
              <div className="mt-8 text-center text-sm text-gray-500">
                This privacy policy was last updated on January 15, 2023.
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
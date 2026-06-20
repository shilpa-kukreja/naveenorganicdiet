'use client';
import Link from 'next/link';
import Header from '../componats/Header';
import Footer from '../componats/Footer';


export default function ShippingPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header/>
      <main className="flex-grow border-t border-gray-400 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
              <li className="inline-flex items-center">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                  <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                  </svg>
                  Home
                </Link>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Shipping Policy</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Shipping Policy</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our commitment is to deliver your Syuta bags with care, efficiency, and reliability. Please review the details below to understand how we handle shipping and delivery.
            </p>
          </header>

          {/* Policy Sections */}
          <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200 overflow-hidden">
            <section className="p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                Shipping Locations
              </h2>
              <div className="ml-9 pl-1">
                <p className="text-gray-700 leading-relaxed">We currently ship across India. For international shipping inquiries, please reach out to our support team at <a href="mailto:devagroupon@gmail.com" className="text-blue-600 hover:underline font-medium">devagroupon@gmail.com</a>.  We are working towards expanding our global reach soon.</p>
              </div>
            </section>

            <section className="p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Order Processing & Delivery
              </h2>
              <div className="ml-9 pl-1 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Processing Time</h3>
                  <p className="text-gray-700">Orders are processed within 1–2 business days (excluding Sundays and public holidays).Once dispatched, you will receive an order confirmation email with tracking details.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Delivery Estimates</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <li className="bg-gray-50 p-4 rounded-lg">
                      <div className="font-medium text-gray-800">Metro Cities</div>
                      <div className="text-green-600 font-medium">2–4 business days</div>
                    </li>
                    <li className="bg-gray-50 p-4 rounded-lg">
                      <div className="font-medium text-gray-800">Tier 2 & 3 Cities</div>
                      <div className="text-green-600 font-medium">3–6 business days</div>
                    </li>
                    <li className="bg-gray-50 p-4 rounded-lg">
                      <div className="font-medium text-gray-800">Remote Areas</div>
                      <div className="text-green-600 font-medium">7–10 business days</div>
                    </li>
                  </ul>
                  <p className="mt-4 text-sm text-gray-500"> Please note: Delivery times may vary due to weather, festivals, or courier delays.</p>
                </div>
              </div>
            </section>

            <section className="p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                Shipping Charges
              </h2>
              <div className="ml-9 pl-1">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Value</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipping Fee</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Above ₹499</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">FREE</td>
                        <td className="px-4 py-3 text-sm text-gray-500">Prepaid orders only</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Below ₹499</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">₹49</td>
                        <td className="px-4 py-3 text-sm text-gray-500">Applies to all orders</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">COD Orders</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Variable</td>
                        <td className="px-4 py-3 text-sm text-gray-500">Additional handling charges may apply</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-sm text-gray-500">All applicable charges will be clearly shown during checkout.</p>
              </div>
            </section>

            <section className="p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                Delivery Issues & Resolution
              </h2>
              <div className="ml-9 pl-1 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Problem Resolution</h3>
                  <p className="text-gray-700"> If your package is delayed, damaged, or lost in transit, please contact us within 48 hours of delivery with your order ID and valid proof (photos/documents). Our team will coordinate with our logistics partners to resolve the issue promptly through a refund or replacement.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Undelivered Packages</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      One re-delivery attempt will be made for unsuccessful deliveries.
                    </li>
                    <li className="flex items-start">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                       Unclaimed orders will be returned to our warehouse.
                    </li>
                    <li className="flex items-start">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Refunds (if applicable) will be processed after deducting logistics costs.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="p-6 md:p-8 bg-gray-50">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Contact Our Shipping Team
              </h2>
              <div className="ml-9 pl-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Contact Information</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <svg className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        <a href="mailto:pydlifesciences@gmail.com" className="text-blue-600 hover:underline">devagroupon@gmail.com</a>
                      </li>
                      <li className="flex items-start">
                        <svg className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        <a href="tel:+919868866869" className="text-blue-600 hover:underline">+91 9868866869</a>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Registered Address</h3>
                    <div className="flex items-start">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
        </div>
      </main>
      <Footer/>
    </div>
  );
}
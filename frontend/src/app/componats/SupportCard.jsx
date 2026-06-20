'use client';
import React from "react";
import { FiMessageSquare, FiPhone, FiMail, FiHelpCircle } from "react-icons/fi";

export default function SupportCard({ orderId, status }) {
  const isDelayed = status === "IN_TRANSIT" && !orderId.includes("DEV");
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FiHelpCircle className="text-blue-600" size={24} />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Need Help?</h3>
      </div>
      
      {isDelayed && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-1">
              <FiHelpCircle className="text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-yellow-800">Delivery Update</p>
              <p className="text-yellow-700 text-sm mt-1">
                Your package might experience slight delays due to unforeseen circumstances. 
                We're working with the carrier to ensure timely delivery.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiMessageSquare className="text-green-600" />
            </div>
            <h4 className="font-semibold">Live Chat</h4>
          </div>
          <p className="text-gray-600 text-sm mb-3">
            Chat with our support team for instant help
          </p>
          <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
            Start Chat
          </button>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiPhone className="text-blue-600" />
            </div>
            <h4 className="font-semibold">Call Support</h4>
          </div>
          <p className="text-gray-600 text-sm mb-3">
            Available 24/7 for urgent inquiries
          </p>
          <a 
            href="tel:+18001234567"
            className="block w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-center"
          >
            +1 (800) 123-4567
          </a>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiMail className="text-purple-600" />
            </div>
            <h4 className="font-semibold">Email Support</h4>
          </div>
          <p className="text-gray-600 text-sm mb-3">
            Send us an email with your order details
          </p>
          <a 
            href="mailto:support@example.com"
            className="block w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition text-center"
          >
            Email Us
          </a>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-gray-600 text-sm">
          Reference Order ID: <span className="font-mono font-semibold">{orderId}</span>
        </p>
      </div>
    </div>
  );
}
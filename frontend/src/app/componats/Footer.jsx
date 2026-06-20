"use client";
import axios from 'axios';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiMail, FiPhone, FiMapPin, FiDownload, FiSmartphone } from 'react-icons/fi';
import { FaGooglePlay, FaApple, FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [activeSection, setActiveSection] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setMsg("Please enter a valid email address");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/subscriber/subscriber", { email });
      setMsg(res.data.message);
      setEmail("");
      
      // Clear success message after 5 seconds
      setTimeout(() => setMsg(""), 5000);
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.message);
      } else {
        setMsg("Something went wrong. Please try again.");
      }
      
      // Clear error message after 5 seconds
      setTimeout(() => setMsg(""), 5000);
    }
  };

  const toggleSection = (section) => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          
          {/* Column 1: Brand & Contact */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-[#D4AF37] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">OD</span>
              </div>
              <h1 className="text-2xl font-bold text-white">OrganicDiet</h1>
            </div>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Your trusted source for premium organic products. We deliver health and wellness right to your doorstep.
            </p>
            
            {/* Contact Information */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <FiMapPin className="text-[#D4AF37] mt-1 flex-shrink-0" size={16} />
                <span className="text-gray-400 text-sm">23/A Organic Road, Green City, Health District 10001</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiPhone className="text-[#D4AF37] flex-shrink-0" size={16} />
                <span className="text-gray-400 text-sm">+91 8888-256-868</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiMail className="text-[#D4AF37] flex-shrink-0" size={16} />
                <span className="text-gray-400 text-sm">support@organicdiet.com</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="pt-4">
              <h4 className="text-white font-medium mb-3">Follow Us</h4>
              <div className="flex space-x-3">
                {[
                  { icon: FaFacebook, label: "Facebook" },
                  { icon: FaTwitter, label: "Twitter" },
                  { icon: FaInstagram, label: "Instagram" },
                  { icon: FaYoutube, label: "YouTube" },
                  { icon: FaLinkedin, label: "LinkedIn" }
                ].map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#D4AF37] transition-colors duration-200"
                    aria-label={social.label}
                  >
                    <social.icon size={14} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links (Accordion on Mobile) */}
          <div className="space-y-4 sm:space-y-6">
            <div 
              className="flex items-center justify-between cursor-pointer md:cursor-default"
              onClick={() => isMobile && toggleSection('quickLinks')}
            >
              <h3 className="text-lg font-semibold text-white">Quick Links</h3>
              {isMobile && (
                <span className="text-gray-400">
                  {activeSection === 'quickLinks' ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                </span>
              )}
            </div>
            
            {(activeSection === 'quickLinks' || !isMobile) && (
              <ul className="space-y-2 sm:space-y-3 animate-fadeIn">
                {[
                  { href: "/", label: "Home" },
                  { href: "/all-products", label: "Shop" },
                  { href: "/about-us", label: "About Us" },
                  { href: "/contact", label: "Contact" },
                  { href: "/blogs", label: "Blog" },
                  { href: "/track-order", label: "Track Order" },
                  // { href: "/faq", label: "FAQ" },
                  { href: "/testimonials", label: "Testimonials" }
                ].map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="flex items-center text-gray-400 hover:text-[#D4AF37] transition-colors duration-200 group text-sm sm:text-base"
                    >
                      <span className="w-1.5 h-1.5 bg-gray-700 rounded-full mr-3 group-hover:bg-[#D4AF37] transition-colors"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Column 3: Support (Accordion on Mobile) */}
          <div className="space-y-4 sm:space-y-6">
            <div 
              className="flex items-center justify-between cursor-pointer md:cursor-default"
              onClick={() => isMobile && toggleSection('support')}
            >
              <h3 className="text-lg font-semibold text-white">Support</h3>
              {isMobile && (
                <span className="text-gray-400">
                  {activeSection === 'support' ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                </span>
              )}
            </div>
            
            {(activeSection === 'support' || !isMobile) && (
              <ul className="space-y-2 sm:space-y-3 animate-fadeIn">
                {[
                  { href: "/login", label: "Login / Register" },
                  { href: "/privacy-policy", label: "Privacy Policy" },
                  { href: "/terms-refund-policy", label: "Terms & Conditions" },
                  { href: "/return-refund-policy", label: "Refund Policy" },
                  { href: "/shipping-policy", label: "Shipping Policy" },
                  { href: "/cancellation-policy", label: "Cancellation Policy" },
                  { href: "/contact", label: "Contact Support" },
                  { href: "/wholesale", label: "Wholesale Inquiry" }
                ].map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="flex items-center text-gray-400 hover:text-[#D4AF37] transition-colors duration-200 group text-sm sm:text-base"
                    >
                      <span className="w-1.5 h-1.5 bg-gray-700 rounded-full mr-3 group-hover:bg-[#D4AF37] transition-colors"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Column 4: Newsletter & App */}
          <div className="space-y-6 sm:space-y-8">
            {/* Newsletter */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Stay Updated</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Subscribe to our newsletter for exclusive offers, health tips, and new product announcements.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#D4AF37] hover:bg-[#B8860B] text-white px-4 py-1.5 rounded-md transition-colors duration-200 text-sm font-medium"
                  >
                    Subscribe
                  </button>
                </div>
                
                {msg && (
                  <div className={`p-3 rounded-lg text-sm ${msg.includes("success") || msg.includes("subscribed") ? 'bg-[#D4AF37]/30 text-[#D4AF37]' : 'bg-red-900/30 text-red-400'}`}>
                    {msg}
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  By subscribing, you agree to our Privacy Policy and consent to receive updates.
                </p>
              </form>
            </div>

            {/* App Download */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FiSmartphone className="text-[#D4AF37]" size={20} />
                <div>
                  <h4 className="font-semibold text-white">Get Our Mobile App</h4>
                  <p className="text-[#D4AF37] text-sm font-medium">
                    15% discount on first purchase
                  </p>
                </div>
              </div>

              {/* App Store Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href="#"
                  className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-4 py-3 transition-all duration-200 hover:scale-[1.02] group"
                >
                  <div className="flex items-center space-x-3">
                    <FaGooglePlay size={20} className="text-[#D4AF37]" />
                    <div className="text-left">
                      <div className="text-xs text-gray-400">Get it on</div>
                      <div className="text-white font-semibold text-sm">Google Play</div>
                    </div>
                  </div>
                  <FiDownload className="text-gray-500 group-hover:text-[#D4AF37] transition-colors" size={16} />
                </a>

                <a 
                  href="#"
                  className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-4 py-3 transition-all duration-200 hover:scale-[1.02] group"
                >
                  <div className="flex items-center space-x-3">
                    <FaApple size={20} className="text-[#D4AF37]" />
                    <div className="text-left">
                      <div className="text-xs text-gray-400">Download on</div>
                      <div className="text-white font-semibold text-sm">App Store</div>
                    </div>
                  </div>
                  <FiDownload className="text-gray-500 group-hover:text-[#D4AF37] transition-colors" size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Links */}
      <div className="border-t hidden sm:block border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
            {[
              { href: "/return-refund-policy", label: "Return Refund Policy" },
              { href: "/privacy-policy", label: "Privacy Policy" },
              { href: "/terms-refund-policy", label: "Terms & Conditions" },
              { href: "/shipping-policy", label: "Shipping & Delivery" },
              { href: "/cancellation-policy", label: "Cancellation" },
              { href: "/quality-policy", label: "Quality Policy" },
              { href: "/sitemap", label: "Sitemap" }
            ].map((link) => (
              <a 
                key={link.href}
                href={link.href} 
                className="text-gray-400 hover:text-[#D4AF37] transition-colors duration-200 hover:underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright & Payment Methods */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <div className="text-gray-400 text-xs sm:text-sm">
                © {new Date().getFullYear()} OrganicDiet. All Rights Reserved.
              </div>
              <div className="text-gray-500 text-xs mt-1">
                Made with ❤️ for a healthier world
              </div>
            </div>

            {/* Payment Methods */}
            {/* <div className="flex items-center space-x-4">
              <div className="text-gray-400 text-xs hidden sm:block">
                Secure Payment:
              </div>
              <div className="flex items-center space-x-2">
                {['Visa', 'MasterCard', 'PayPal', 'Razorpay', 'UPI'].map((method) => (
                  <div 
                    key={method}
                    className="w-8 h-5 sm:w-10 sm:h-6 bg-gray-800 rounded flex items-center justify-center text-gray-500 text-xs font-medium"
                  >
                    {method}
                  </div>
                ))}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

// Add CSS for fade animation
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;

// Add styles to head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default Footer;
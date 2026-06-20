"use client";
import React from 'react'
import { MapPin, Phone, Mail , CheckCircle } from 'lucide-react'

function ContactSec() {
  const [formData, setFormData] = React.useState({
    name: '',
    mobile: '',
    email: '',
    subject: '',
    message: ''
  })

  const [submitting, setSubmitting] = React.useState(false)
  const [submitStatus, setSubmitStatus] = React.useState(null)


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);

    const data = {
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      subject: formData.subject,
      message: formData.message
    }
    try {
      const response = await fetch('http://localhost:5000/api/contact/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          mobile: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }

  }

  return (
    <div className=" bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-md shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Sidebar Section */}
            <div className="bg-gradient-to-br from-[#3bb264] to-[#2cd46a] p-8 lg:p-12 text-white">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                How Can We Help You?
              </h2>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                When an unknown printer took a galley of type and scrambled it to make type specimen book.
                It has survived not only five area fact types remaining essentially unchanged.
              </p>

              <div className="space-y-6">
                {/* Address */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-6 h-6 mt-1">
                    <MapPin className="w-6 h-6 text-blue-200" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Address</h4>
                    <p className="text-blue-100">Avamileaug Drive, Kensington London, UK</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-6 h-6 mt-1">
                    <Phone className="w-6 h-6 text-blue-200" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Phone</h4>
                    <p className="text-blue-100">+48-500-130-0001</p>
                    <p className="text-blue-100">+48-500-130-0002</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-6 h-6 mt-1">
                    <Mail className="w-6 h-6 text-blue-200" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">E-mail</h4>
                    <p className="text-blue-100">info1@gmail.com</p>
                    <p className="text-blue-100">info2@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>


            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div
                className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-emerald-800">Message sent successfully!</p>
                  <p className="text-sm text-emerald-700">We'll get back to you soon.</p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div
                
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
              >
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <div>
                  <p className="font-medium text-red-800">Failed to send message</p>
                  <p className="text-sm text-red-700">Please try again or contact us directly.</p>
                </div>
              </div>
            )}

            {/* Form Section */}
            <div className="p-8 lg:p-12">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a63d] focus:border-transparent transition-all duration-200"
                      placeholder="Your Name"
                      disabled={submitting}
                    />
                  </div>

                  {/* Mobile */}
                  <div className="space-y-2">
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                      Mobile *
                    </label>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a63d] focus:border-transparent transition-all duration-200"
                      placeholder="Your Mobile Number"
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a63d] focus:border-transparent transition-all duration-200"
                    placeholder="Your Email Address"
                    disabled={submitting}
                  />
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a63d] focus:border-transparent transition-all duration-200"
                    placeholder="Subject"
                    disabled={submitting}
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a63d] focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Your Message"
                    disabled={submitting}
                  ></textarea>
                </div>

                {/* Submit Button */}
                {submitting ?(
                  <>
                  <button
                    type="button"
                    className="w-full bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg cursor-not-allowed"
                    disabled
                  >
                    Sending...
                  </button>
                  </>
                ):(
                  <>
                <button
                  type="submit"
                  className="w-full bg-[#00a63d] hover:bg-[#00a63d] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-blue-200"
                >
                  Send Message
                </button>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactSec
// 'use client';
// import React, { useState, useEffect, useRef } from 'react';
// import Link from 'next/link';
// import { IoMdPhonePortrait, IoMdLock } from 'react-icons/io';
// import { RiShieldCheckLine, RiTimeLine } from 'react-icons/ri';
// import { FaWhatsapp } from 'react-icons/fa';
// import { useSearchParams, useRouter } from "next/navigation";
// import Header from '../componats/Header';
// import Footer from '../componats/Footer';


// const Login = () => {
//   const [step, setStep] = useState(1);
//   const [loginMethod, setLoginMethod] = useState('sms');
//   const [formData, setFormData] = useState({
//     mobile: '',
//     otp: '',
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [countdown, setCountdown] = useState(0);
//   const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
//   const [staticOtp, setStaticOtp] = useState('');
//   const otpInputs = useRef([]);
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const from = searchParams.get("from");

//   const urlParams = new URLSearchParams(window.location.search);
//   const referralCode = urlParams.get("ref");

//   // Reset states when method changes
//   useEffect(() => {
//     if (step === 1) {
//       setError('');
//       setSuccess('');
//       setOtpValues(['', '', '', '', '', '']);
//       setFormData(prev => ({ ...prev, otp: '' }));
//     }
//   }, [loginMethod, step]);

//   const handleChange = (e) => {
//     const value = e.target.value.replace(/\D/g, '');
//     setFormData({ ...formData, [e.target.name]: value });
//   };

//   const handleOtpChange = (index, value) => {
//     const numericValue = value.replace(/\D/g, '');
    
//     if (numericValue.length <= 1) {
//       const newOtpValues = [...otpValues];
//       newOtpValues[index] = numericValue;
//       setOtpValues(newOtpValues);
//       setFormData({ ...formData, otp: newOtpValues.join('') });
      
//       if (numericValue && index < 5) {
//         otpInputs.current[index + 1].focus();
//       }
//     }
//   };

//   const handleOtpKeyDown = (index, e) => {
//     if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
//       otpInputs.current[index - 1].focus();
//     }
//   };

//   const handleOtpPaste = (e) => {
//     e.preventDefault();
//     const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '');
//     if (pastedData.length === 6) {
//       const newOtpValues = pastedData.split('');
//       setOtpValues(newOtpValues);
//       setFormData({ ...formData, otp: newOtpValues.join('') });
//       otpInputs.current[5].focus();
//     }
//   };

//   useEffect(() => {
//     let timer;
//     if (countdown > 0) {
//       timer = setTimeout(() => setCountdown(countdown - 1), 1000);
//     }
//     return () => clearTimeout(timer);
//   }, [countdown]);

//   // Send OTP based on method
//   const sendOtp = async (e) => {
//     e.preventDefault();
//     if (!formData.mobile || formData.mobile.length !== 10) {
//       setError('Please enter a valid 10-digit phone number');
//       return;
//     }
    
//     setIsLoading(true);
//     setError('');
//     setSuccess('');
    
//     try {
//       const endpoint = loginMethod === 'whatsapp' 
//         ? 'http://localhost:5000/api/users/whatsapp-loginotp'
//         : 'http://localhost:5000/api/users/loginotp';

//       console.log(`Sending ${loginMethod} OTP to: ${formData.mobile}`);
      
//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ number: formData.mobile }),
//       });

//       const data = await response.json();
//       console.log('OTP Response:', data);

//       if (data.success) {
//         setStep(2);
//         setCountdown(30);
        
//         if (loginMethod === 'whatsapp') {
//           setStaticOtp(data.otp);
//           setSuccess(`WhatsApp OTP sent! Use code: ${data.otp}`);
//         } else if (data.otp) {
//           // If SMS fails but OTP is returned for testing
//           setStaticOtp(data.otp);
//           setSuccess(`OTP generated! Use code: ${data.otp}`);
//         } else {
//           setSuccess('OTP sent successfully to your mobile');
//         }
//       } else {
//         setError(data.error || data.message || 'Failed to send OTP');
//       }
//     } catch (error) {
//       console.error('OTP Send Error:', error);
//       setError('Network error. Please check your connection and try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Resend OTP
//   const resendOtp = async () => {
//     if (countdown > 0) return;
    
//     setIsLoading(true);
//     setError('');
//     try {
//       const endpoint = loginMethod === 'whatsapp' 
//         ? 'http://localhost:5000/api/users/whatsapp-loginotp'
//         : 'http://localhost:5000/api/users/loginotp';

//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ number: formData.mobile }),
//       });

//       const data = await response.json();

//       if (data.success) {
//         setCountdown(30);
        
//         if (loginMethod === 'whatsapp') {
//           setStaticOtp(data.otp);
//           setSuccess(`WhatsApp OTP resent! Use code: ${data.otp}`);
//         } else if (data.otp) {
//           setStaticOtp(data.otp);
//           setSuccess(`OTP regenerated! Use code: ${data.otp}`);
//         } else {
//           setSuccess('OTP resent successfully');
//         }
//       } else {
//         setError(data.message || 'Failed to resend OTP');
//       }
//     } catch (error) {
//       console.error(error);
//       setError('Error resending OTP. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Verify OTP
//   const verifyOtp = async (e) => {
//     e.preventDefault();
//     if (formData.otp.length !== 6) {
//       setError('Please enter a valid 6-digit OTP');
//       return;
//     }
    
//     setIsLoading(true);
//     setError('');
//     try {
//       const response = await fetch('http://localhost:5000/api/users/verify-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           number: formData.mobile,
//           otp: formData.otp,
//           channel: loginMethod,
//           referralCode
//         }),
//       });

//       const data = await response.json();
//       console.log('Verify OTP Response:', data);
      
//       if (response.ok && data.success) {
//         localStorage.setItem('token', data.token);
        
//         setSuccess('Login successful! Redirecting...');
        
//         setTimeout(() => {
//           if (from === "checkout") {
//             router.push("/frontend/cart");
//           } else {
//             router.push("/");
//           }
//         }, 1000);
        
//       } else {
//         setError(data.message || 'Invalid OTP. Please try again.');
//       }
//     } catch (error) {
//       console.error(error);
//       setError('Error verifying OTP. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gray-50">
//       <Header/>

//       <main className="flex-grow flex items-center border-t border-gray-400 justify-center py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-4xl w-full bg-white rounded-lg shadow-md overflow-hidden md:flex">
//           <div className="sm:w-1/2 w-full bg-white rounded-lg flex flex-col items-center justify-center shadow-md overflow-hidden">
//             <div className="px-6 py-8 w-full">
//               {/* Progress indicator */}
//               <div className="flex justify-center mb-6">
//                 <div className="flex items-center">
//                   <div className={`flex flex-col items-center ${step >= 1 ? 'text-brown-600' : 'text-gray-400'}`}>
//                     <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-brown-600 bg-brown-100' : 'border-gray-300'}`}>
//                       {step > 1 ? (
//                         <RiShieldCheckLine className="w-4 h-4 text-brown-600" />
//                       ) : (
//                         <span className="text-sm font-medium">1</span>
//                       )}
//                     </div>
//                     <span className="text-xs mt-1">Enter Phone</span>
//                   </div>
//                   <div className={`w-16 h-1 mx-2 ${step >= 2 ? 'bg-brown-600' : 'bg-gray-300'}`}></div>
//                   <div className={`flex flex-col items-center ${step >= 2 ? 'text-brown-600' : 'text-gray-400'}`}>
//                     <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-brown-600 bg-brown-100' : 'border-gray-300'}`}>
//                       <span className="text-sm font-medium">2</span>
//                     </div>
//                     <span className="text-xs mt-1">Verify OTP</span>
//                   </div>
//                 </div>
//               </div>

//               <h2 className="text-center text-2xl font-bold text-gray-800 mb-2">
//                 {step === 1 ? 'Login to Your Account' : 'Verify Your Number'}
//               </h2>
//               <p className="text-center text-sm text-gray-600 mb-6">
//                 {step === 1 
//                   ? 'Enter your mobile number to receive an OTP' 
//                   : `Enter the 6-digit code sent via ${loginMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'} to ${formData.mobile}`
//                 }
//               </p>

//               {error && (
//                 <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center">
//                   <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                   </svg>
//                   {error}
//                 </div>
//               )}

//               {success && (
//                 <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm flex items-center">
//                   <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                   </svg>
//                   {success}
//                 </div>
//               )}

//               {/* STEP 1 - Mobile Number Input */}
//               {step === 1 && (
//                 <form onSubmit={sendOtp} className="space-y-5">
//                   {/* Login Method Selection */}
//                   <div className="flex space-x-4 mb-4">
//                     <button
//                       type="button"
//                       onClick={() => setLoginMethod('sms')}
//                       className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
//                         loginMethod === 'sms' 
//                           ? 'border-brown-600 bg-brown-50 text-brown-700' 
//                           : 'border-gray-300 text-gray-600 hover:border-gray-400'
//                       }`}
//                     >
//                       <div className="flex items-center justify-center space-x-2">
//                         <IoMdPhonePortrait size={18} />
//                         <span>SMS OTP</span>
//                       </div>
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setLoginMethod('whatsapp')}
//                       className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
//                         loginMethod === 'whatsapp' 
//                           ? 'border-green-600 bg-green-50 text-green-700' 
//                           : 'border-gray-300 text-gray-600 hover:border-gray-400'
//                       }`}
//                     >
//                       <div className="flex items-center justify-center space-x-2">
//                         <FaWhatsapp size={18} />
//                         <span>WhatsApp OTP</span>
//                       </div>
//                     </button>
//                   </div>

//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
//                       <IoMdPhonePortrait size={18} />
//                     </div>
//                     <input
//                       type="tel"
//                       name="mobile"
//                       value={formData.mobile}
//                       onChange={handleChange}
//                       required
//                       maxLength={10}
//                       placeholder="Enter your 10-digit mobile number"
//                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none transition-colors"
//                     />
//                   </div>

//                   <button
//                     type="submit"
//                     disabled={isLoading}
//                     className={`w-full ${
//                       loginMethod === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' : 'bg-[#7a1113] hover:bg-brown-700'
//                     } text-white py-3 rounded-lg transition-colors flex items-center justify-center ${
//                       isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
//                     }`}
//                   >
//                     {isLoading ? (
//                       <>
//                         <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                         Sending OTP...
//                       </>
//                     ) : loginMethod === 'whatsapp' ? 'Send WhatsApp OTP' : 'Send SMS OTP'}
//                   </button>
//                 </form>
//               )}

//               {/* STEP 2 - OTP Verification */}
//               {step === 2 && (
//                 <form onSubmit={verifyOtp} className="space-y-5">
//                   {/* Static OTP Display for testing */}
//                   {(loginMethod === 'whatsapp' || staticOtp) && (
//                     <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                       <div className="flex items-center justify-center space-x-2 text-blue-700">
//                         <span className="font-semibold">Test OTP: {staticOtp}</span>
//                       </div>
//                       <p className="text-sm text-blue-600 text-center mt-2">
//                         Use this code to verify your number
//                       </p>
//                     </div>
//                   )}

//                   <div className="space-y-4">
//                     <p className="text-sm text-gray-600 text-center">
//                       Enter the 6-digit verification code
//                     </p>
                    
//                     <div className="flex justify-center space-x-2">
//                       {otpValues.map((value, index) => (
//                         <input
//                           key={index}
//                           type="text"
//                           inputMode="numeric"
//                           pattern="[0-9]*"
//                           maxLength={1}
//                           value={value}
//                           onChange={(e) => handleOtpChange(index, e.target.value)}
//                           onKeyDown={(e) => handleOtpKeyDown(index, e)}
//                           onPaste={index === 0 ? handleOtpPaste : undefined}
//                           ref={(el) => (otpInputs.current[index] = el)}
//                           className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none"
//                         />
//                       ))}
//                     </div>
                    
//                     <div className="flex items-center justify-center text-sm text-gray-600">
//                       <RiTimeLine className="mr-1" />
//                       {countdown > 0 ? (
//                         <span>Resend OTP in {countdown} seconds</span>
//                       ) : (
//                         <button
//                           type="button"
//                           onClick={resendOtp}
//                           disabled={isLoading}
//                           className="text-brown-600 hover:text-brown-700 font-medium disabled:opacity-50"
//                         >
//                           Resend OTP
//                         </button>
//                       )}
//                     </div>
//                   </div>

//                   <button
//                     type="submit"
//                     disabled={isLoading || formData.otp.length !== 6}
//                     className={`w-full ${
//                       loginMethod === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' : 'bg-[#7a1113] hover:bg-brown-700'
//                     } text-white py-3 rounded-lg transition-colors flex items-center justify-center ${
//                       (isLoading || formData.otp.length !== 6) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
//                     }`}
//                   >
//                     {isLoading ? (
//                       <>
//                         <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                         Verifying...
//                       </>
//                     ) : (
//                       <>
//                         <IoMdLock className="mr-2" />
//                         Verify & Login
//                       </>
//                     )}
//                   </button>
                  
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setStep(1);
//                       setError('');
//                       setSuccess('');
//                     }}
//                     disabled={isLoading}
//                     className="w-full text-center text-brown-600 hover:text-brown-700 text-sm font-medium disabled:opacity-50"
//                   >
//                     Change Phone Number
//                   </button>
//                 </form>
//               )}

//               <div className="mt-6 text-center text-sm">
//                 <p className="text-gray-600">
//                   {step === 1 ? "Don't have an account? " : "New to Miraggio? "}
//                   <Link
//                     href="/frontend/signin"
//                     className="text-brown-600 hover:text-brown-700 font-medium"
//                   >
//                     Sign up
//                   </Link>
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className='hidden md:block w-1/2'>
//             <img
//               src="/banner/login.webp"
//               alt="Sign up banner"
//               className="object-cover w-full h-full"
//             />
//           </div>
//         </div>
//       </main>

//      <Footer/>
//     </div>
//   );
// };

// export default Login;



'use client';
import React, { useState, useEffect, useRef,Suspense } from 'react';
import Link from 'next/link';
import { IoMdPhonePortrait, IoMdLock,IoMdGift } from 'react-icons/io';
import { RiShieldCheckLine, RiTimeLine } from 'react-icons/ri';
import { FaWhatsapp } from 'react-icons/fa';
import { useSearchParams, useRouter } from "next/navigation";
import Header from '../componats/Header';
import Footer from '../componats/Footer';

const LoginContent = () => {
  const [step, setStep] = useState(1);
  const [loginMethod, setLoginMethod] = useState('sms');
  const [formData, setFormData] = useState({
    mobile: '',
    otp: '',
    referralCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [staticOtp, setStaticOtp] = useState('');
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [hasReferralCode, setHasReferralCode] = useState(false);
  const otpInputs = useRef([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const from = searchParams.get("from");

  // Get referral code from URL
  const referralCode = searchParams.get("ref");

  // Auto-fill referral code from URL if present
  useEffect(() => {
    if (referralCode) {
      setFormData(prev => ({ ...prev, referralCode }));
      setHasReferralCode(true);
      setShowReferralInput(true);
    }
  }, [referralCode]);

  // Reset states when method changes
  useEffect(() => {
    if (step === 1) {
      setError('');
      setSuccess('');
      setOtpValues(['', '', '', '', '', '']);
      setFormData(prev => ({ ...prev, otp: '' }));
    }
  }, [loginMethod, step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'mobile') {
      const numericValue = value.replace(/\D/g, '');
      setFormData({ ...formData, [name]: numericValue });
    } else if (name === 'referralCode') {
      // Convert to uppercase and remove spaces
      const formattedValue = value.toUpperCase().replace(/\s/g, '');
      setFormData({ ...formData, [name]: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleOtpChange = (index, value) => {
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue.length <= 1) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = numericValue;
      setOtpValues(newOtpValues);
      setFormData({ ...formData, otp: newOtpValues.join('') });
      
      if (numericValue && index < 5) {
        otpInputs.current[index + 1].focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '');
    if (pastedData.length === 6) {
      const newOtpValues = pastedData.split('');
      setOtpValues(newOtpValues);
      setFormData({ ...formData, otp: newOtpValues.join('') });
      otpInputs.current[5].focus();
    }
  };

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Toggle referral code input
  const toggleReferralInput = () => {
    setShowReferralInput(!showReferralInput);
    if (!showReferralInput) {
      setFormData(prev => ({ ...prev, referralCode: '' }));
    } else {
      setFormData(prev => ({ ...prev, referralCode: '' }));
    }
  };

  // Apply referral code
  const applyReferralCode = () => {
    if (!formData.referralCode.trim()) {
      setError('Please enter a referral code');
      return;
    }
    
    if (formData.referralCode.length < 4) {
      setError('Referral code must be at least 4 characters');
      return;
    }
    
    setHasReferralCode(true);
    setSuccess(`Referral code "${formData.referralCode}" applied successfully!`);
  };

  // Remove referral code
  const removeReferralCode = () => {
    setFormData(prev => ({ ...prev, referralCode: '' }));
    setHasReferralCode(false);
    setSuccess('');
  };

  // Send OTP based on method
  const sendOtp = async (e) => {
    e.preventDefault();
    if (!formData.mobile || formData.mobile.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const endpoint = loginMethod === 'whatsapp' 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/users/whatsapp-loginotp`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/users/loginotp`;

      console.log(`Sending ${loginMethod} OTP to: ${formData.mobile}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: formData.mobile }),
      });

      const data = await response.json();
      console.log('OTP Response:', data);

      if (data.success) {
        setStep(2);
        setCountdown(30);
        
        if (loginMethod === 'whatsapp') {
          setStaticOtp(data.otp);
          setSuccess(`WhatsApp OTP sent! Use code: ${data.otp}`);
        } else if (data.otp) {
          // If SMS fails but OTP is returned for testing
          setStaticOtp(data.otp);
          setSuccess(`OTP generated! Use code: ${data.otp}`);
        } else {
          setSuccess('OTP sent successfully to your mobile');
        }
      } else {
        setError(data.error || data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('OTP Send Error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    setError('');
    try {
      const endpoint = loginMethod === 'whatsapp' 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/users/whatsapp-loginotp`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/users/loginotp`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: formData.mobile }),
      });

      const data = await response.json();

      if (data.success) {
        setCountdown(30);
        
        if (loginMethod === 'whatsapp') {
          setStaticOtp(data.otp);
          setSuccess(`WhatsApp OTP resent! Use code: ${data.otp}`);
        } else if (data.otp) {
          setStaticOtp(data.otp);
          setSuccess(`OTP regenerated! Use code: ${data.otp}`);
        } else {
          setSuccess('OTP resent successfully');
        }
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error(error);
      setError('Error resending OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const verifyOtp = async (e) => {
    e.preventDefault();
    if (formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: formData.mobile,
          otp: formData.otp,
          channel: loginMethod,
          referralCode: formData.referralCode || referralCode // Send referral code if exists
        }),
      });

      const data = await response.json();
      console.log('Verify OTP Response:', data);
      
      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        
        let successMessage = 'Login successful! Redirecting...';
        if (data.hasReferral) {
          successMessage += ' Referral applied successfully!';
        }
        setSuccess(successMessage);
        
        setTimeout(() => {
          if (from === "checkout") {
            router.push("/");
          } else {
            router.push("/");
          }
        }, 1000);
        
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error(error);
      setError('Error verifying OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header/>

      <main className="flex-grow flex items-center border-t border-gray-400 justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full bg-white rounded-lg shadow-md overflow-hidden md:flex">
          <div className="sm:w-1/2 w-full bg-white rounded-lg flex flex-col items-center justify-center shadow-md overflow-hidden">
            <div className="px-6 py-8 w-full">
              {/* Progress indicator */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center">
                  <div className={`flex flex-col items-center ${step >= 1 ? 'text-brown-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-brown-600 bg-brown-100' : 'border-gray-300'}`}>
                      {step > 1 ? (
                        <RiShieldCheckLine className="w-4 h-4 text-brown-600" />
                      ) : (
                        <span className="text-sm font-medium">1</span>
                      )}
                    </div>
                    <span className="text-xs mt-1">Enter Phone</span>
                  </div>
                  <div className={`w-16 h-1 mx-2 ${step >= 2 ? 'bg-brown-600' : 'bg-gray-300'}`}></div>
                  <div className={`flex flex-col items-center ${step >= 2 ? 'text-brown-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-brown-600 bg-brown-100' : 'border-gray-300'}`}>
                      <span className="text-sm font-medium">2</span>
                    </div>
                    <span className="text-xs mt-1">Verify OTP</span>
                  </div>
                </div>
              </div>

              <h2 className="text-center text-2xl font-bold text-gray-800 mb-2">
                {step === 1 ? 'Login to Your Account' : 'Verify Your Number'}
              </h2>
              <p className="text-center text-sm text-gray-600 mb-6">
                {step === 1 
                  ? 'Enter your mobile number to receive an OTP' 
                  : `Enter the 6-digit code sent via ${loginMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'} to ${formData.mobile}`
                }
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {success}
                </div>
              )}

              {/* STEP 1 - Mobile Number Input */}
              {step === 1 && (
                <form onSubmit={sendOtp} className="space-y-5">
                  {/* Login Method Selection */}
                  <div className="flex space-x-4 mb-4">
                    <button
                      type="button"
                      onClick={() => setLoginMethod('sms')}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                        loginMethod === 'sms' 
                          ? 'border-brown-600 bg-brown-50 text-brown-700' 
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <IoMdPhonePortrait size={18} />
                        <span>SMS OTP</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginMethod('whatsapp')}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                        loginMethod === 'whatsapp' 
                          ? 'border-green-600 bg-green-50 text-green-700' 
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <FaWhatsapp size={18} />
                        <span>WhatsApp OTP</span>
                      </div>
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <IoMdPhonePortrait size={18} />
                    </div>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                      maxLength={10}
                      placeholder="Enter your 10-digit mobile number"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none transition-colors"
                    />
                  </div>

                  {/* Referral Code Section */}
                  <div className="space-y-3">
                    {!referralCode && !showReferralInput && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Have a referral code?</span>
                        <button
                          type="button"
                          onClick={toggleReferralInput}
                          className="text-sm text-brown-600 hover:text-brown-700 font-medium flex items-center gap-1"
                        >
                          <IoMdGift />
                          Apply Referral Code
                        </button>
                      </div>
                    )}

                    {(referralCode || showReferralInput) && (
                      <div className="space-y-3 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <IoMdGift/>
                            Referral Code
                          </label>
                          {!referralCode && (
                            <button
                              type="button"
                              onClick={toggleReferralInput}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            name="referralCode"
                            value={formData.referralCode}
                            onChange={handleChange}
                            placeholder="Enter referral code (e.g., REF123)"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none transition-colors uppercase"
                            readOnly={!!referralCode} // Make readonly if from URL
                          />
                          {!hasReferralCode && formData.referralCode && !referralCode && (
                            <button
                              type="button"
                              onClick={applyReferralCode}
                              className="px-4 py-3 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors"
                            >
                              Apply
                            </button>
                          )}
                        </div>
                        
                        {hasReferralCode && formData.referralCode && (
                          <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                            <div className="flex items-center gap-2 text-green-700">
                              <IoMdGift />
                              <span className="text-sm">
                                Referral code <span className="font-bold">{formData.referralCode}</span> applied
                              </span>
                            </div>
                            {!referralCode && (
                              <button
                                type="button"
                                onClick={removeReferralCode}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500">
                          Applying a referral code gives you and your friend special benefits
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full ${
                      loginMethod === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' : 'bg-[#00a63d] hover:bg-brown-700'
                    } text-white py-3 rounded-lg transition-colors flex items-center justify-center ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending OTP...
                      </>
                    ) : loginMethod === 'whatsapp' ? 'Send WhatsApp OTP' : 'Send SMS OTP'}
                  </button>
                </form>
              )}

              {/* STEP 2 - OTP Verification */}
              {step === 2 && (
                <form onSubmit={verifyOtp} className="space-y-5">
                  {/* Static OTP Display for testing */}
                  {(loginMethod === 'whatsapp' || staticOtp) && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-center space-x-2 text-blue-700">
                        <span className="font-semibold">Test OTP: {staticOtp}</span>
                      </div>
                      <p className="text-sm text-blue-600 text-center mt-2">
                        Use this code to verify your number
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 text-center">
                      Enter the 6-digit verification code
                    </p>
                    
                    <div className="flex justify-center space-x-2">
                      {otpValues.map((value, index) => (
                        <input
                          key={index}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={value}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={index === 0 ? handleOtpPaste : undefined}
                          ref={(el) => (otpInputs.current[index] = el)}
                          className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none"
                        />
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <RiTimeLine className="mr-1" />
                      {countdown > 0 ? (
                        <span>Resend OTP in {countdown} seconds</span>
                      ) : (
                        <button
                          type="button"
                          onClick={resendOtp}
                          disabled={isLoading}
                          className="text-brown-600 hover:text-brown-700 font-medium disabled:opacity-50"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Display referral code if applied */}
                  {formData.referralCode && (
                    <div className="p-3 bg-brown-50 border border-brown-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-brown-700">
                          <IoMdGift />
                          <span className="text-sm">
                            Referral code <span className="font-bold">{formData.referralCode}</span> will be applied
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || formData.otp.length !== 6}
                    className={`w-full ${
                      loginMethod === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' : 'bg-[#00a63d] hover:bg-brown-700'
                    } text-white py-3 rounded-lg transition-colors flex items-center justify-center ${
                      (isLoading || formData.otp.length !== 6) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <IoMdLock className="mr-2" />
                        {formData.referralCode ? 'Verify with Referral' : 'Verify & Login'}
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError('');
                      setSuccess('');
                    }}
                    disabled={isLoading}
                    className="w-full text-center text-brown-600 hover:text-brown-700 text-sm font-medium disabled:opacity-50"
                  >
                    Change Phone Number
                  </button>
                </form>
              )}

              <div className="mt-6 text-center text-sm">
                <p className="text-gray-600">
                  {step === 1 ? "Don't have an account? " : "New to Miraggio? "}
                  <Link
                    href="/frontend/signin"
                    className="text-brown-600 hover:text-brown-700 font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
          <div className='hidden md:block w-1/2'>
            <img
              src="/banner/login.webp"
              alt="Sign up banner"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </main>

     <Footer/>
    </div>
  );
};

const Login = () => (
  <Suspense
    fallback={
      
        <div className="max-w-7xl mx-auto p-6 flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto" />
            <p className="mt-3 text-gray-600">Loading...</p>
          </div>
        </div>
  
    }
  >
    <LoginContent />
  </Suspense>
);

export default Login;
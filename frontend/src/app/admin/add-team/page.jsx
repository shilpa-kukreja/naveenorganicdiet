// 'use client';

// import { useState } from 'react';

// import { useRouter } from 'next/navigation';
// import axios from 'axios';
// import {
//   User,
//   Mail,
//   Lock,
//   Phone,
//   Shield,
//   ArrowLeft,
//   Save,
//   Eye,
//   EyeOff
// } from 'lucide-react';
// import { useAuth } from '../lib/auth-context';

// export default function AddTeamMember() {
//   const { user } = useAuth();
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     phone: '',
//     role: 'team_member',
//     isAdmin: false
//   });

//   // Redirect if not admin
//   if (user && !user.isAdmin) {
//     router.push('/admin');
//     return null;
//   }

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const generateRandomPassword = () => {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
//     let password = '';
//     for (let i = 0; i < 12; i++) {
//       password += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     setFormData(prev => ({ ...prev, password }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       const token = localStorage.getItem('admin-token');
//       const response = await axios.post(
//         'http://localhost:5000/api/admin',
//         formData,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         }
//       );

//       if (response.data.success) {
//         alert('Team member added successfully! Welcome email sent.');
//         router.push('/admin/list-team');
//       }
//     } catch (error) {
//       console.error('Error adding team member:', error);
//       alert(error.response?.data?.message || 'Failed to add team member');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="mb-6">
//         <button
//           onClick={() => router.back()}
//           className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
//         >
//           <ArrowLeft className="w-4 h-4 mr-2" />
//           Back
//         </button>
        
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Add Team Member</h1>
//             <p className="text-gray-600">Create a new team member account</p>
//           </div>
//         </div>
//       </div>

//       {/* Form */}
//       <div className="max-w-7xl">
//         <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Full Name */}
//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Full Name *
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <User className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   type="text"
//                   name="name"
//                   required
//                   value={formData.name}
//                   onChange={handleChange}
//                   className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="Enter full name"
//                 />
//               </div>
//             </div>

//             {/* Email */}
//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address *
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Mail className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   type="email"
//                   name="email"
//                   required
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="Enter email address"
//                 />
//               </div>
//             </div>

//             {/* Phone */}
//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Phone Number
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Phone className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   type="tel"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleChange}
//                   className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="Enter phone number"
//                 />
//               </div>
//             </div>

//             {/* Password */}
//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Password *
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   name="password"
//                   required
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="Enter password"
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-5 w-5 text-gray-400" />
//                   ) : (
//                     <Eye className="h-5 w-5 text-gray-400" />
//                   )}
//                 </button>
//               </div>
//               <button
//                 type="button"
//                 onClick={generateRandomPassword}
//                 className="mt-2 text-sm text-blue-600 hover:text-blue-500"
//               >
//                 Generate strong password
//               </button>
//             </div>

//             {/* Role */}
//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Role
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Shield className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <select
//                   name="role"
//                   value={formData.role}
//                   onChange={handleChange}
//                   className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <option value="team_member">Team Member</option>
//                   <option value="admin">Administrator</option>
//                 </select>
//               </div>
//             </div>

//             {/* Admin Access */}
//             <div className="md:col-span-2">
//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   name="isAdmin"
//                   checked={formData.isAdmin}
//                   onChange={handleChange}
//                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                 />
//                 <span className="ml-2 text-sm text-gray-600">
//                   Grant administrator privileges
//                 </span>
//               </label>
//               <p className="text-xs text-gray-500 mt-1">
//                   Administrators have full access to all features including team management.
//                 </p>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <div className="mt-8 flex justify-end space-x-4">
//             <button
//               type="button"
//               onClick={() => router.back()}
//               className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition duration-200"
//             >
//               {isLoading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                   Adding...
//                 </>
//               ) : (
//                 <>
//                   <Save className="w-4 h-4 mr-2" />
//                   Add Team Member
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }



'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  User,
  Mail,
  Lock,
  Phone,
  Shield,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Key,
  Briefcase,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import toast, { Toaster } from 'react-hot-toast';

export default function AddTeamMember() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'team_member',
    isAdmin: false
  });

  // Redirect if not admin
  if (user && !user.isAdmin) {
    router.push('/admin');
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
    toast.success('Strong password generated!');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a name');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter an email');
      return false;
    }
    if (!formData.password) {
      toast.error('Please enter a password');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    const loadingToast = toast.loading('Adding team member...');

    try {
      const token = localStorage.getItem('admin-token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.dismiss(loadingToast);
        toast.success('Team member added successfully! Welcome email sent.', {
          duration: 4000,
          icon: '✅'
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          role: 'team_member',
          isAdmin: false
        });
        
        // Redirect after delay
        setTimeout(() => {
          router.push('/admin/list-team');
        }, 1500);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error adding team member:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to add team member';
      toast.error(errorMessage, {
        duration: 5000,
        icon: '❌'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10B981',
            },
          },
          error: {
            style: {
              background: '#EF4444',
            },
          },
        }}
      />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="group flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Add Team Member
                  </h1>
                </div>
                <p className="text-gray-600 text-lg">Create a new account for your team member</p>
              </div>
              <div className="hidden md:block p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Member Information</h2>
            <p className="text-gray-600 mt-1">Fill in the details below to create a new team member account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl 
                                 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                 transition-all duration-200 hover:border-gray-400 bg-white
                                 shadow-sm focus:shadow-blue-100"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl 
                                 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                 transition-all duration-200 hover:border-gray-400 bg-white
                                 shadow-sm focus:shadow-blue-100"
                        placeholder="john.doe@company.com"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl 
                                 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                 transition-all duration-200 hover:border-gray-400 bg-white
                                 shadow-sm focus:shadow-blue-100"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Security Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <Key className="w-5 h-5 text-green-600" />
                  Account Security
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl 
                                 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                 transition-all duration-200 hover:border-gray-400 bg-white
                                 shadow-sm focus:shadow-blue-100"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        )}
                      </button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 
                                 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 
                                 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200
                                 shadow-sm hover:shadow"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Generate Strong Password
                      </button>
                      <div className="flex items-center text-sm text-gray-500">
                        <div className={`h-2 w-2 rounded-full mr-2 ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        At least 8 characters
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role & Permissions Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  Role & Permissions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Role */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Role
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                      </div>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl 
                                 focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                                 transition-all duration-200 hover:border-gray-400 bg-white
                                 shadow-sm focus:shadow-purple-100 appearance-none cursor-pointer"
                      >
                        <option value="team_member">Team Member</option>
                        <option value="admin">Administrator</option>
                        <option value="manager">Manager</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <div className="w-2 h-2 border-r border-b border-gray-400 transform rotate-45"></div>
                      </div>
                    </div>
                  </div>

                  {/* Admin Access */}
                  <div className="md:col-span-2">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                      <label className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            name="isAdmin"
                            checked={formData.isAdmin}
                            onChange={handleChange}
                            className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded-lg cursor-pointer"
                          />
                        </div>
                        <div className="ml-4">
                          <span className="text-lg font-semibold text-gray-800">
                            Grant Administrator Privileges
                          </span>
                          <p className="text-gray-600 mt-2">
                            Administrators have full access to all system features including team management, 
                            settings, and analytics. Use this option carefully.
                          </p>
                          {formData.isAdmin && (
                            <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                              <p className="text-sm text-purple-700 font-medium">
                                ⚠️ This user will have full system access
                              </p>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-4">
              <div className="text-sm text-gray-500">
                Fields marked with * are required
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-8 py-3.5 border-2 border-gray-300 rounded-xl text-gray-700 
                           hover:bg-gray-50 hover:border-gray-400 transition-all duration-200
                           font-medium shadow-sm hover:shadow focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 
                           text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 
                           focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 
                           transition-all duration-200 font-medium shadow-lg hover:shadow-xl 
                           disabled:cursor-not-allowed group"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Creating Account...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                      Add Team Member
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Form Tips */}
        {/* <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Tips for adding team members
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Use the password generator for strong, secure passwords
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Send the credentials to the team member via secure channel
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Assign roles based on required access levels
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Review all information before submitting
            </li>
          </ul>
        </div> */}
      </div>
    </div>
  );
}
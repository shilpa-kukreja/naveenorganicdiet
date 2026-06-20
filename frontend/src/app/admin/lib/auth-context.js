// 'use client';

// import axios from 'axios';
// import React, { createContext, useContext, useEffect, useState } from 'react';

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(undefined); // undefined for initial loading state
//   const [isLoading, setIsLoading] = useState(true);

//   const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const token = localStorage.getItem('admin-token');
//         if (token) {
//           // Mock token verification - replace with actual API call
//           const userData = await verifyToken(token);
//           setUser(userData);
//         } else {
//           setUser(null);
//         }
//       } catch (error) {
//         localStorage.removeItem('admin-token');
//         setUser(null);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     checkAuth();
//   }, []);

//   // const login = async (email, password) => {
//   //   try {

//   //     const admin = await axios.post("http://localhost:5000/api/admin/login", {
//   //       email,
//   //       password
//   //     });

//   //     // console.log(admin);
//   //     // Mock login - replace with actual API
//   //     if (email === 'admin@gmail.com' && password === 'admin123') {
//   //       const userData = {
//   //         id: '1',
//   //         email: 'admin@gmail.com',
//   //         name: 'Admin User',
//   //         role: 'admin',
//   //       };
//   //       const token = 'mock-jwt-token';
//   //       localStorage.setItem('admin-token', token);
//   //       setUser(userData);
//   //       return true;
//   //     }
//   //     return false;
//   //   } catch (error) {
//   //     return false;
//   //   }
//   // };


// const login = async (email, password) => {
//   try {
//     const res = await axios.post("http://localhost:5000/api/admin/login", {
//       email,
//       password,
//     });

//     if (res.data?.data?.token) {
//       // Save token
//       localStorage.setItem("admin-token", res.data.data.token);

//       // Save logged-in admin user
//       setUser(res.data.data.user);

//       return true;
//     }

//     return false;
//   } catch (error) {
//     console.error("Login error:", error.response?.data || error.message);
//     return false;
//   }
// };


//   const logout = () => {
//     localStorage.removeItem('admin-token');
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, isLoading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }

// // Mock function
// async function verifyToken(token) {
//   return {
//     id: '1',
//     email: 'admin@example.com',
//     name: 'Admin User',
//     role: 'admin',
//   };
// }


'use client';

import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('admin-token');
        if (token) {
          // Verify token with backend
          const response = await axios.get(`${BACKEND_URL}/api/admin/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.data.success) {
            setUser(response.data.data);
          } else {
            localStorage.removeItem('admin-token');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('admin-token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/login`, {
        email,
        password,
      });

      console.log('Login response:', res.data);

      if (res.data.success && res.data.data?.token) {
        // Save token
        localStorage.setItem("admin-token", res.data.data.token);
        // Save logged-in user
        setUser(res.data.data.user);
        return { 
          success: true, 
          message: 'Login successful',
          user: res.data.data.user 
        };
      } else {
        return { 
          success: false, 
          message: res.data.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin-token');
    setUser(null);
  };

  // Helper functions for role checking
  const isAdmin = () => user?.role === 'admin' || user?.isAdmin;
  const isTeamMember = () => user?.role === 'team_member';
  const hasAdminAccess = () => isAdmin() || isTeamMember();

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAdmin,
    isTeamMember,
    hasAdminAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
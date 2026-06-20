// app/admin/layout.jsx
'use client';


import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import { useAuth } from './lib/auth-context';


export default function AdminLayout({ children }) {
  const { user, isLoading, hasAdminAccess } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !hasAdminAccess()) {
      router.push('/admin/login');
    }
  }, [user, isLoading, hasAdminAccess, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAdminAccess()) {

    return (
       
          <>
            {children}
       
        </>
    ); 
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
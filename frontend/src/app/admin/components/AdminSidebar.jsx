// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useState } from "react";
// import { useAuth } from "../lib/auth-context";

// // All Lucide icons
// import {
//   LayoutDashboard,
//   Users,
//   Package,
//   ShoppingCart,
//   BarChart3,
//   MessageSquare,
//   Settings,
//   ChevronLeft,
//   ChevronRight,
//   Plus,
//   FileText,
//   Bell,
//   Zap,
//   User,
//   Mail,
//   LogOut,
//   Activity,
//   Crown,
// } from "lucide-react";

// // -----------------------------------------------
// // Reusable Sidebar Item Component
// // -----------------------------------------------
// function SidebarItem({ href, label, icon: Icon, badge, isActive, collapsed }) {
//   return (
//     <Link
//       href={href}
//       className={`group relative flex items-center rounded-xl transition-all duration-200 ${
//         isActive
//           ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20"
//           : "text-gray-300 hover:bg-gray-800 hover:text-white"
//       } ${collapsed ? "justify-center p-3" : "px-4 py-3"}`}
//     >
//       <Icon
//         className={`${
//           collapsed ? "w-5 h-5" : "w-5 h-5 mr-3"
//         } transition-transform duration-200 group-hover:scale-110 ${
//           isActive ? "text-white" : "text-gray-400"
//         }`}
//       />

//       {!collapsed && (
//         <>
//           <span className="font-medium flex-1">{label}</span>
//           {badge && (
//             <span
//               className={`px-2 py-1 text-xs rounded-full font-semibold ${
//                 isActive ? "bg-white text-blue-700" : "bg-blue-500 text-white"
//               }`}
//             >
//               {badge}
//             </span>
//           )}
//         </>
//       )}

//       {/* Collapsed Tooltip */}
//       {collapsed && (
//         <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-xl border border-gray-700 z-50">
//           {label}
//         </div>
//       )}
//     </Link>
//   );
// }

// // -----------------------------------------------
// // Main Sidebar Component
// // -----------------------------------------------
// export default function AdminSidebar() {
//   const pathname = usePathname();
//   const { user } = useAuth();
//   const [collapsed, setCollapsed] = useState(false);

//   const menuItems = [
//     { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
//     { href: "/admin/admin-users", label: "Admin Users", icon: Users, badge: "12" },
//     { href: "/admin/add-product", label: "Add Product", icon: Plus },
//     { href: "/admin/list-products", label: "List Products", icon: FileText },
//     { href: "/admin/add-categories", label: "Add Categories", icon: Crown },
//     { href: "/admin/list-categories", label: "List Categories", icon: Activity },
//     { href: "/admin/products", label: "Products", icon: Package, badge: "5" },
//     { href: "/admin/orders", label: "Orders", icon: ShoppingCart, badge: "23" },
//     { href: "/admin/add-blogs", label: "Blogs", icon: MessageSquare },
//     { href: "/admin/list-blog", label: "List Blogs", icon: MessageSquare },
//     { href: "/admin/add-coupon", label: "Add Coupon", icon: MessageSquare },
//     { href: "/admin/list-coupon", label: "List Coupons", icon: MessageSquare },
//     { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
//     { href: "/admin/messages", label: "Messages", icon: Mail, badge: "3" },
//     { href: "/admin/settings", label: "Settings", icon: Settings },
//     { href: "/admin/contact", label: "Contact", icon: Mail },
//     { href: "/admin/all-subscribers", label: "Subscribers", icon: User },
//   ];

//   return (
//     <div
//       className={`bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col transition-all duration-300 ${
//         collapsed ? "w-20" : "w-64"
//       } relative shadow-xl`}
//     >
//       {/* HEADER */}
//       <div className="p-4 border-b border-gray-700 flex items-center justify-between">
//         {!collapsed && (
//           <div className="flex items-center space-x-3">
//             <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
//               <Crown className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold">AdminPro</h1>
//               {user && (
//                 <p className="text-xs text-gray-300 flex items-center mt-1">
//                   <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
//                   Active Session
//                 </p>
//               )}
//             </div>
//           </div>
//         )}

//         <button
//           onClick={() => setCollapsed(!collapsed)}
//           className="p-2 rounded-lg bg-gray-800 border border-gray-600 hover:bg-gray-700"
//         >
//           {collapsed ? (
//             <ChevronRight className="w-4 h-4" />
//           ) : (
//             <ChevronLeft className="w-4 h-4" />
//           )}
//         </button>
//       </div>

//       {/* NAVIGATION */}
//       <nav className="flex-1 px-3 py-5 space-y-2 overflow-hidden overflow-y-auto scrollbar-hide ">
//         {!collapsed && (
//           <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-2 flex items-center">
//             <Activity className="w-3 h-3 mr-2" /> Navigation
//           </h3>
//         )}

//         {menuItems.map((item) => (
//           <SidebarItem
//             key={item.href}
//             href={item.href}
//             label={item.label}
//             icon={item.icon}
//             badge={item.badge}
//             collapsed={collapsed}
//             isActive={pathname === item.href}
//           />
//         ))}
//       </nav>

//       {/* FOOTER */}
//       <div className="p-4 border-t border-gray-700">
//         {!collapsed ? (
//           <>
//             <div className="flex items-center space-x-3 mb-4 bg-gray-700 p-3 rounded-xl hover:bg-gray-600 transition cursor-pointer">
//               <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg">
//                 <User className="w-5 h-5" />
//               </div>
//               <div className="flex-1">
//                 <p className="text-sm font-semibold">{user?.name}</p>
//                 <p className="text-xs text-gray-300 flex items-center">
//                   <Mail className="w-3 h-3 mr-1" />
//                   {user?.email}
//                 </p>
//               </div>
//             </div>

//             <button className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl border border-gray-600 hover:border-red-500/40 hover:bg-red-500/10 text-gray-300 hover:text-white transition">
//               <LogOut className="w-4 h-4" />
//               <span>Sign Out</span>
//             </button>
//           </>
//         ) : (
//           <div className="flex flex-col items-center space-y-3">
//             <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
//               <User className="w-5 h-5 text-white" />
//             </div>

//             <button className="p-2 text-gray-400 hover:text-white hover:bg-red-500/10 rounded-lg border border-gray-600 hover:border-red-500/30 transition">
//               <LogOut className="w-4 h-4" />
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../lib/auth-context";

// Icons
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileText,
  User,
  Mail,
  LogOut,
  Activity,
  Crown,
  UserPlus,
  List,
  
} from "lucide-react";

function SidebarItem({ href, label, icon: Icon, badge, isActive, collapsed }) {
  return (
    <Link
      href={href}
      className={`group relative flex items-center rounded-xl transition-all duration-200 ${
        isActive
          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20"
          : "text-gray-300 hover:bg-gray-800 hover:text-white"
      } ${collapsed ? "justify-center p-3" : "px-4 py-3"}`}
    >
      <Icon
        className={`${
          collapsed ? "w-5 h-5" : "w-5 h-5 mr-3"
        } transition-transform duration-200 group-hover:scale-110 ${
          isActive ? "text-white" : "text-gray-400"
        }`}
      />

      {!collapsed && (
        <>
          <span className="font-medium flex-1">{label}</span>
          {badge && (
            <span
              className={`px-2 py-1 text-xs rounded-full font-semibold ${
                isActive ? "bg-white text-blue-700" : "bg-blue-500 text-white"
              }`}
            >
              {badge}
            </span>
          )}
        </>
      )}

      {collapsed && (
        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-xl border border-gray-700 z-50">
          {label}
        </div>
      )}
    </Link>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Admin only menu items
  const adminMenuItems = [
    { href: "/admin/admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/add-team", label: "Add Team Member", icon: UserPlus },
    { href: "/admin/list-team", label: "List Team Members", icon: List },
    { href: "/admin/admin-users", label: "Admin Users", icon: Users, },
    { href: "/admin/add-product", label: "Add Product", icon: Plus },
    { href: "/admin/list-products", label: "List Products", icon: FileText },
    { href: "/admin/add-categories", label: "Add Categories", icon: Crown },
    { href: "/admin/list-categories", label: "List Categories", icon: Activity },
    // { href: "/admin/products", label: "Products", icon: Package, badge: "5" },
    { href: "/admin/all-orders", label: "Orders", icon: ShoppingCart,  },
    { href: "/admin/add-blogs", label: "Blogs", icon: MessageSquare },
    { href: "/admin/list-blog", label: "List Blogs", icon: MessageSquare },
    { href: "/admin/all-referrals", label: "Referrals", icon: MessageSquare,  },
    { href: "/admin/payout-dashboard", label: "Payout Requests", icon: MessageSquare,  },
    { href: "/admin/referral-settings", label: "Referral Settings", icon: MessageSquare,  },
    { href: "/admin/add-coupon", label: "Add Coupon", icon: MessageSquare },
    { href: "/admin/list-coupon", label: "List Coupons", icon: MessageSquare },
    { href: "/admin/list-testimonial", label: "Testimonials", icon: MessageSquare },
    { href : "/admin/add-testimonial", label: "Add Testimonial", icon: Plus },
    { href: "/admin/MainBannerList", label: "Main Banners", icon: MessageSquare },
    { href: "/admin/add-additionalbanner", label: "Additional Banners", icon: MessageSquare },
    { href: "/admin/add-promotionalbanner", label: "Promotional Banners", icon: MessageSquare },
    { href: "/admin/add-video", label: "Videos", icon: MessageSquare },
    { href: "/admin/add-aboutSection", label: "About Sections", icon: MessageSquare },
    { href: "/admin/add-about-core-values", label: "Core Values", icon: MessageSquare },
    { href: "/admin/add-banner", label: "Add Banners", icon: MessageSquare },
    { href:  "/admin/list-reviews", label: "Reviews", icon: MessageSquare },
    { href: "/admin/adminorderanalytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/emailcampaign", label: "Email Campaign", icon: Mail },
    { href: "/admin/savedcampaigns", label: "Saved Campaigns", icon: Mail },
     { href: "/admin/campaignanalytics", label: "Campaign Analytics", icon: Mail },
     { href : "/admin/abandoned-carts", label: "Abandoned Carts", icon: MessageSquare },
     { href: "/admin/admin-return", label: "Return Requests", icon: MessageSquare,  },
    // { href: "/admin/messages", label: "Messages", icon: Mail, badge: "3" },
    // { href: "/admin/settings", label: "Settings", icon: Settings },
    { href: "/admin/contact", label: "Contact", icon: Mail },
    { href: "/admin/all-subscribers", label: "Subscribers", icon: User },
  ];

  // Team member menu items
  const teamMenuItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/list-products", label: "Products", icon: Package },
    { href: "/admin/all-orders", label: "Orders", icon: ShoppingCart },
  ];

  // Determine which menu items to show based on user role
  const menuItems = user?.isAdmin ? adminMenuItems : teamMenuItems;

  const handleLogout = () => {
    logout();
  };

  return (
    <div
      className={`bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      } relative shadow-xl`}
    >
      {/* HEADER */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                {user?.isAdmin ? 'AdminPro' : 'Team Portal'}
              </h1>
              <p className="text-xs text-gray-300 flex items-center mt-1">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                {user?.isAdmin ? 'Admin' : 'Team Member'}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg bg-gray-800 border border-gray-600 hover:bg-gray-700"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-5 space-y-2 overflow-hidden overflow-y-auto scrollbar-hide">
        {!collapsed && (
          <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-2 flex items-center">
            <Activity className="w-3 h-3 mr-2" /> 
            {user?.isAdmin ? 'Admin Navigation' : 'Team Navigation'}
          </h3>
        )}

        {menuItems.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            badge={item.badge}
            collapsed={collapsed}
            isActive={pathname === item.href}
          />
        ))}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-gray-700">
        {!collapsed ? (
          <>
            <div className="flex items-center space-x-3 mb-4 bg-gray-700 p-3 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-gray-300 flex items-center">
                  <Mail className="w-3 h-3 mr-1" />
                  {user?.email}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {user?.isAdmin ? 'Administrator' : 'Team Member'}
                </p>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl border border-gray-600 hover:border-red-500/40 hover:bg-red-500/10 text-gray-300 hover:text-white transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>

            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white hover:bg-red-500/10 rounded-lg border border-gray-600 hover:border-red-500/30 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

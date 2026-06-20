'use client';


import { useRouter } from 'next/navigation';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3,
  TrendingUp,
  Eye,
  DollarSign
} from 'lucide-react';
import { useAuth } from './lib/auth-context';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Stats for both admin and team members
  const stats = [
    {
      title: 'Total Products',
      value: '1,234',
      icon: Package,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Total Orders',
      value: '567',
      icon: ShoppingCart,
      color: 'green',
      change: '+8%'
    },
    {
      title: 'Total Views',
      value: '45.6K',
      icon: Eye,
      color: 'purple',
      change: '+23%'
    },
    {
      title: 'Revenue',
      value: '$12,467',
      icon: DollarSign,
      color: 'orange',
      change: '+15%'
    }
  ];

  return (
    <div className="p-6  flex flex-col justify-center items-center">
      {/* Welcome Message */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {user.isAdmin 
            ? 'Here\'s what\'s happening with your store today.' 
            : 'Here are your assigned tasks and recent activities.'
          }
        </p>
      </div>

      {/* Role Badge */}
      <div className="mb-8">
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
          user.isAdmin 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {user.isAdmin ? 'Administrator' : 'Team Member'}
        </span>
      </div>

      {/* Stats Grid */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div> */}

      {/* Role-specific Content */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {user.isAdmin ? (
              <>
                <button
                  onClick={() => router.push('/admin/add-team')}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
                >
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-blue-600 mr-3" />
                    <span>Add Team Member</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
                <button
                  onClick={() => router.push('/admin/list-team')}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
                >
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-green-600 mr-3" />
                    <span>Manage Team</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/admin/products')}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
                >
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-blue-600 mr-3" />
                    <span>View Products</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
                <button
                  onClick={() => router.push('/admin/orders')}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
                >
                  <div className="flex items-center">
                    <ShoppingCart className="w-5 h-5 text-green-600 mr-3" />
                    <span>Manage Orders</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
              </>
            )}
          </div>
        </div>

       
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.isAdmin ? 'New team member added' : 'Product inventory updated'}
                </p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.isAdmin ? 'System settings updated' : 'Order #1234 completed'}
                </p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.isAdmin ? 'Monthly report generated' : 'New customer inquiry'}
                </p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}
// components/CampaignAnalytics.jsx
"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  Mail, Eye, MousePointer, Users, Clock, Globe, Smartphone,
  Calendar, TrendingUp, Download, RefreshCw, AlertCircle
} from 'lucide-react';

const CampaignAnalytics = ({ campaignId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    fetchAnalytics();
  }, [campaignId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/email-campaign/analytics/${campaignId}`, {
        params: { hours: timeRange === '24h' ? 24 : 168 }
      });
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8 text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <p>No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Mail className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Sent</p>
              <p className="text-2xl font-bold">{analytics.overview.totalSent}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Open Rate</p>
              <p className="text-2xl font-bold">{analytics.overview.openRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <MousePointer className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Click Rate</p>
              <p className="text-2xl font-bold">{analytics.overview.clickRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">CTR</p>
              <p className="text-2xl font-bold">{analytics.overview.ctr}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Opens by Hour */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Opens by Hour
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.timeline.opensByHour}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Click Distribution */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold mb-4 flex items-center">
            <MousePointer className="w-5 h-5 mr-2" />
            Top Clicked Links
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={analytics.clicks.byUrl.slice(0, 5)} 
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="url" width={150} />
              <Tooltip />
              <Bar dataKey="totalClicks" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold mb-4 flex items-center">
            <Smartphone className="w-5 h-5 mr-2" />
            Device Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.devices}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.devices.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Location Distribution */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Top Locations
          </h3>
          <div className="space-y-2">
            {analytics.locations.slice(0, 5).map((loc, index) => (
              <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50">
                <span className="truncate">{loc.location}</span>
                <span className="font-semibold">{loc.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Recent Activity
          </h3>
          <button
            onClick={fetchAnalytics}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Opened</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Clicks</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Device</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.logs.slice(0, 10).map((log, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">{log.email}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      log.status === 'opened' || log.status === 'clicked' 
                        ? 'bg-green-100 text-green-800' 
                        : log.status === 'sent'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {log.openedAt ? new Date(log.openedAt).toLocaleTimeString() : '-'}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {log.totalClicks || 0}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {log.openedDevice || '-'}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {log.openedLocation || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CampaignAnalytics;
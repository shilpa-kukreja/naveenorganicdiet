"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Mail, Eye, MousePointer, Users, Clock, Globe, Smartphone,
  Calendar, TrendingUp, Download, RefreshCw, AlertCircle, ExternalLink
} from 'lucide-react';
import { useParams } from 'next/navigation';

const CampaignAnalytics = ( ) => {

  const campaignId =  useParams().campaignId;
  // const [campaignId, setCampaignId] = useState('695e25020269d3786f5580f5');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    if (campaignId) {
      fetchAnalytics();
    }
  }, [campaignId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching analytics for campaign:', campaignId);
      
      const hours = timeRange === '24h' ? 24 : 168;
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tracking/analytics/${campaignId}?hours=${hours}`,
        {
          timeout: 15000,
          headers: {
            'Cache-Control': 'no-cache'
          }
        }
      );
      
      console.log('Analytics data received:', data);
      
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        setError(data.message || 'Failed to load analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      
      // Provide more specific error messages
      if (error.code === 'ECONNREFUSED') {
        setError('Cannot connect to the server. Make sure backend is running on port 5000.');
      } else if (error.code === 'ECONNABORTED') {
        setError('Request timeout. Please try again.');
      } else if (error.response?.status === 404) {
        setError('Campaign not found. Please check the campaign ID.');
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to load analytics');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <p className="text-gray-600">Loading analytics data...</p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Loading
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Analytics</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!analytics || !analytics.overview) {
    return (
      <div className="text-center p-8">
        <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Analytics Data Available</h3>
        <p className="text-gray-600 mb-4">No tracking data found for this campaign. Send some emails first.</p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center mx-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Check Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Campaign Analytics</h2>
          <p className="text-gray-600">Tracking data for the last {timeRange === '24h' ? '24 hours' : '7 days'}</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Mail className="w-6 h-6" />}
          title="Total Sent"
          value={analytics.overview.totalSent || 0}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        
        <StatCard
          icon={<Eye className="w-6 h-6" />}
          title="Open Rate"
          value={`${analytics.overview.openRate || 0}%`}
          subtitle={`${analytics.overview.opened || 0} opens`}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        
        <StatCard
          icon={<MousePointer className="w-6 h-6" />}
          title="Click Rate"
          value={`${analytics.overview.clickRate || 0}%`}
          subtitle={`${analytics.overview.clicked || 0} clicks`}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="CTR"
          value={`${analytics.overview.ctr || 0}%`}
          subtitle="Click to Open Rate"
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Unique Opens" value={analytics.overview.opened || 0} />
        <MetricCard title="Unique Clicks" value={analytics.overview.clicked || 0} />
        <MetricCard title="Total Clicks" value={analytics.clicks?.totalClicks || 0} />
        <MetricCard title="Bounced" value={analytics.overview.bounced || 0} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Opens by Hour */}
        <ChartCard
          title="Opens by Hour"
          icon={<Clock className="w-5 h-5" />}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.timeline?.opensByHour || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="hour" 
                tick={{ fill: '#6b7280' }}
              />
              <YAxis tick={{ fill: '#6b7280' }} />
              <Tooltip 
                labelFormatter={(hour) => `${hour}:00`}
                formatter={(value) => [`${value} opens`, 'Opens']}
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="count" 
                name="Opens" 
                fill="#4F46E5" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Clicked Links */}
        <ChartCard
          title="Top Clicked Links"
          icon={<ExternalLink className="w-5 h-5" />}
        >
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {analytics.clicks?.byUrl?.length > 0 ? (
              analytics.clicks.byUrl.map((link, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm truncate flex-1 mr-2">
                      {link.url}
                    </span>
                    <span className="font-bold text-green-600 whitespace-nowrap">
                      {link.totalClicks} clicks
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {link.uniqueClicks} unique
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No clicks yet
              </div>
            )}
          </div>
        </ChartCard>

        {/* Device Breakdown */}
        <ChartCard
          title="Device Breakdown"
          icon={<Smartphone className="w-5 h-5" />}
        >
          <ResponsiveContainer width="100%" height={300}>
            {analytics.devices?.length > 0 ? (
              <PieChart>
                <Pie
                  data={analytics.devices}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ device, count }) => `${device}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.devices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} users`, 'Count']}
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No device data available</p>
              </div>
            )}
          </ResponsiveContainer>
        </ChartCard>

        {/* Location Distribution */}
        <ChartCard
          title="Top Locations"
          icon={<Globe className="w-5 h-5" />}
        >
          <div className="space-y-3">
            {analytics.locations?.length > 0 ? (
              analytics.locations.slice(0, 8).map((loc, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3`} 
                         style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="truncate">{loc.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{loc.count}</span>
                    <span className="text-xs text-gray-500">
                      ({((loc.count / (analytics.overview.opened || 1)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No location data
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Recent Activity Table */}
      <ChartCard
        title="Recent Activity"
        icon={<Users className="w-5 h-5" />}
        fullWidth
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opens
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clicks
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.logs?.length > 0 ? (
                analytics.logs.slice(0, 15).map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {log.email}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {log.openedCount || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {log.totalClicks || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {log.openedDevice ? 
                        log.openedDevice.substring(0, 30) + (log.openedDevice.length > 30 ? '...' : '') 
                        : '-'
                      }
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {log.openedAt ? 
                        new Date(log.openedAt).toLocaleString() : 
                        (log.createdAt ? new Date(log.createdAt).toLocaleString() : '-')
                      }
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No activity data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
};

// Helper Components
const StatCard = ({ icon, title, value, subtitle, color, bgColor }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
    <div className="flex items-center mb-3">
      <div className={`p-2 rounded-lg ${bgColor} ${color} mr-3`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const MetricCard = ({ title, value }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border text-center hover:shadow-md transition-shadow">
    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
    <p className="text-xl font-bold text-gray-900">{value}</p>
  </div>
);

const ChartCard = ({ title, icon, children, fullWidth = false }) => (
  <div className={`bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition-shadow ${fullWidth ? 'col-span-1 lg:col-span-2' : ''}`}>
    <h3 className="font-semibold text-lg mb-4 flex items-center">
      <span className={`p-1.5 rounded-lg bg-gray-100 text-gray-700 mr-3`}>
        {icon}
      </span>
      {title}
    </h3>
    {children}
  </div>
);

const StatusBadge = ({ status }) => {
  const statusConfig = {
    sent: { color: 'bg-blue-100 text-blue-800', label: 'Sent' },
    delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
    opened: { color: 'bg-green-100 text-green-800', label: 'Opened' },
    clicked: { color: 'bg-purple-100 text-purple-800', label: 'Clicked' },
    bounced: { color: 'bg-red-100 text-red-800', label: 'Bounced' },
    failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
    unsubscribed: { color: 'bg-gray-100 text-gray-800', label: 'Unsubscribed' }
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status || 'Unknown' };

  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

export default CampaignAnalytics;
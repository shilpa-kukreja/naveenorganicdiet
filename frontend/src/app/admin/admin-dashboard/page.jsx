// components/AdminDashboard.jsx
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Paper, Typography, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, Chip, Avatar, LinearProgress,
  IconButton, MenuItem, Select, FormControl, InputLabel,
  ButtonGroup, Button, Stack, Divider, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Tabs, Tab, FormGroup, FormControlLabel, Checkbox,
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  Badge, alpha, useTheme, useMediaQuery,
  CardHeader, CardActions
} from '@mui/material';
import {
  TrendingUp, TrendingDown, ShoppingCart, People,
  AttachMoney, Inventory, RateReview, LocalOffer,
  AccessTime, CheckCircle, Cancel, Pending,
  Refresh, DateRange, FilterList, Download,
  ArrowUpward, ArrowDownward, Equalizer,
  BarChart, PieChart as PieChartIcon, Visibility, Edit,
  Dashboard, Menu as MenuIcon, Notifications,
  Settings, AccountCircle, Logout,
  Category, Star, Paid, Timeline,
  Email, Phone, LocationOn, CalendarToday
} from '@mui/icons-material';
import {
  LineChart, Line, BarChart as ReBarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip,
  Legend, ResponsiveContainer, AreaChart, Area,
  ComposedChart, Scatter, RadialBarChart, RadialBar,
  Treemap
} from 'recharts';
import axios from 'axios';
import { format, subDays, subMonths, subYears, startOfDay, parseISO, differenceInDays } from 'date-fns';
import { useRouter } from 'next/navigation';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B', '#4ECDC4', '#45B7D1'];
const PERIOD_FILTERS = [
  { label: 'Today', value: 'today', icon: <CalendarToday fontSize="small" /> },
  { label: 'Last 7 Days', value: '7days', icon: <Timeline fontSize="small" /> },
  { label: 'Last 30 Days', value: '30days', icon: <DateRange fontSize="small" /> },
  { label: 'Last 3 Months', value: '3months', icon: <TrendingUp fontSize="small" /> },
  { label: 'Last 6 Months', value: '6months', icon: <BarChart fontSize="small" /> },
  { label: 'Last Year', value: 'year', icon: <Timeline fontSize="small" /> },
  { label: 'All Time', value: 'all', icon: <AccessTime fontSize="small" /> }
];

// Sample order status data for fallback
const SAMPLE_ORDER_STATUS = [
  { _id: 'pending', count: 5, totalAmount: 2500 },
  { _id: 'processing', count: 3, totalAmount: 1800 },
  { _id: 'shipped', count: 8, totalAmount: 5200 },
  { _id: 'delivered', count: 12, totalAmount: 7800 },
  { _id: 'cancelled', count: 2, totalAmount: 1200 }
];

const AdminDashboard = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('30days');
  const [refreshing, setRefreshing] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [viewOrderDialog, setViewOrderDialog] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [notifications] = useState([
    { id: 1, message: 'New order received', time: '5 min ago', type: 'success' },
    { id: 2, message: 'Low stock alert for Product X', time: '1 hour ago', type: 'warning' },
    { id: 3, message: 'Payment failed for order #12345', time: '2 hours ago', type: 'error' }
  ]);
  
  const [exportDataTypes, setExportDataTypes] = useState({
    summary: true,
    charts: true,
    orders: true,
    products: true
  });

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/stats`,
        { params: { period } }
      );
      setStats(response.data.data);
      setError('');
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardStats();
  };

  const handleExportData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/export`,
        { 
          params: { 
            period,
            format: exportFormat
          },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard-export-${period}-${Date.now()}.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setExportDialogOpen(false);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleViewOrder = (order) => {
    setViewOrderDialog(order);
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const StatCard = ({ title, value, icon, change, subtitle, color = 'primary', onClick }) => (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'all 0.3s ease',
        background: `linear-gradient(135deg, ${theme.palette[color].light}15 0%, ${theme.palette[color].light}05 100%)`,
        border: `1px solid ${theme.palette[color].light}30`,
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 12px 24px ${alpha(theme.palette[color].main, 0.2)}`,
          cursor: onClick ? 'pointer' : 'default'
        }
      }}
      onClick={onClick}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            <Typography color="textSecondary" variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 800, mt: 1, mb: 0.5 }}>
              {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontWeight: 500 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{
            p: 1.5,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
            color: 'white',
            boxShadow: `0 4px 12px ${alpha(theme.palette[color].main, 0.3)}`
          }}>
            {React.cloneElement(icon, { sx: { fontSize: 28 } })}
          </Box>
        </Stack>
        {change !== undefined && (
          <Stack direction="row" alignItems="center" spacing={0.5} mt={2}>
            <Box sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 20,
              bgcolor: change > 0 ? 'success.light' : change < 0 ? 'error.light' : 'grey.100',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}>
              {change > 0 ? (
                <ArrowUpward fontSize="small" sx={{ color: 'success.main' }} />
              ) : change < 0 ? (
                <ArrowDownward fontSize="small" sx={{ color: 'error.main' }} />
              ) : (
                <Equalizer fontSize="small" sx={{ color: 'grey.500' }} />
              )}
              <Typography
                variant="caption"
                sx={{ 
                  fontWeight: 700,
                  color: change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'grey.700'
                }}
              >
                {change > 0 ? '+' : ''}{change}%
              </Typography>
            </Box>
            <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
              vs previous period
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );

  const renderChart = () => {
    if (!stats?.charts?.revenueChart || stats.charts.revenueChart.length === 0) {
      return (
        <Box height={400} display="flex" alignItems="center" justifyContent="center" flexDirection="column" gap={2}>
          <BarChart sx={{ fontSize: 48, color: 'grey.300' }} />
          <Typography color="textSecondary" variant="body1">
            No chart data available for this period
          </Typography>
          <Button variant="outlined" onClick={handleRefresh}>
            Refresh Data
          </Button>
        </Box>
      );
    }

    return (
      <Box height={400}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={stats.charts.revenueChart} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={50}
              tickMargin={10}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip 
              formatter={(value, name) => {
                if (name === 'revenue') return [`₹${value.toLocaleString('en-IN')}`, 'Revenue'];
                return [value, name];
              }}
              contentStyle={{ 
                borderRadius: 12, 
                border: 'none', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                padding: '12px 16px'
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconSize={10}
              iconType="circle"
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              fill="url(#colorRevenue)"
              strokeWidth={3}
              name="Revenue"
              dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Bar
              yAxisId="right"
              dataKey="orders"
              fill="#82ca9d"
              name="Orders"
              barSize={24}
              radius={[4, 4, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  const renderOrderStatusChart = () => {
    // Get order status data from stats or use sample data
    const orderStatusData = stats?.breakdowns?.orderStatus || SAMPLE_ORDER_STATUS;
    
    if (!orderStatusData || orderStatusData.length === 0) {
      return (
        <Box height={300} display="flex" alignItems="center" justifyContent="center" flexDirection="column" gap={2}>
          <PieChartIcon sx={{ fontSize: 48, color: 'grey.300' }} />
          <Typography color="textSecondary" variant="body2" align="center">
            No order status data available
          </Typography>
        </Box>
      );
    }

    // Transform data for PieChart
    const pieChartData = orderStatusData.map(item => ({
      name: item._id?.charAt(0).toUpperCase() + item._id?.slice(1) || 'Unknown',
      value: item.count || 0,
      amount: item.totalAmount || 0
    }));

    return (
      <Box height={300}>
        <ResponsiveContainer width="100%" height="100%">
          <RePieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
              nameKey="name"
            >
              {pieChartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <ChartTooltip 
              formatter={(value, name, props) => [
                value,
                props.payload.name,
                `₹${props.payload.amount?.toLocaleString('en-IN') || '0'}`
              ]}
              labelFormatter={(label) => `Status: ${label}`}
            />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              wrapperStyle={{ 
                paddingLeft: 20,
                fontSize: '12px'
              }}
              formatter={(value, entry, index) => (
                <span style={{ color: '#333', fontSize: '12px' }}>
                  {pieChartData[index]?.name}
                </span>
              )}
            />
          </RePieChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  const renderOrderStatusList = () => {
    const orderStatusData = stats?.breakdowns?.orderStatus || SAMPLE_ORDER_STATUS;
    
    if (!orderStatusData || orderStatusData.length === 0) {
      return (
        <Typography variant="body2" color="textSecondary" align="center">
          No order status data
        </Typography>
      );
    }

    return (
      <Stack spacing={1}>
        {orderStatusData.map((status, index) => (
          <Box key={status._id || index} sx={{ mb: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: COLORS[index % COLORS.length]
                  }}
                />
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {status._id || 'Unknown'}
                </Typography>
              </Stack>
              <Stack direction="column" alignItems="flex-end">
                <Typography variant="body2" fontWeight={600}>
                  {status.count || 0}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  ₹{status.totalAmount?.toLocaleString('en-IN') || '0'}
                </Typography>
              </Stack>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={(status.count / orderStatusData.reduce((sum, s) => sum + (s.count || 0), 0)) * 100} 
              sx={{ 
                mt: 0.5,
                height: 4,
                borderRadius: 2,
                bgcolor: 'grey.100'
              }}
            />
          </Box>
        ))}
      </Stack>
    );
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <Stack spacing={3} alignItems="center">
          <CircularProgress size={60} thickness={4} sx={{ color: 'white' }} />
          <Typography variant="h6" color="white" fontWeight={600}>
            Loading Dashboard...
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.8)">
            Fetching your analytics data
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mt: 2,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(244, 67, 54, 0.1)'
          }} 
          action={
            <Stack direction="row" spacing={1}>
              <Button color="inherit" size="small" onClick={fetchDashboardStats}>
                Retry
              </Button>
              <Button color="inherit" size="small" onClick={() => setError('')}>
                Dismiss
              </Button>
            </Stack>
          }
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Failed to load dashboard
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!stats) return null;

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)',
      position: 'relative'
    }}>
      {/* Floating Header */}
      <Paper 
        elevation={0}
        sx={{
          
          top: 0,
          zIndex: 1100,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          p: 2,
          mb: 3
        }}
      >
        <Grid className="floating-header" container justifyContent="space-between"  alignItems="center" spacing={2}>
          <Grid item xs={6} md={3}>
            <Stack direction="row" alignItems="center" spacing={2}>
              {/* <IconButton onClick={() => setSidebarOpen(!sidebarOpen)}>
                <MenuIcon />
              </IconButton> */}
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Dashboard
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {format(new Date(), 'EEEE, MMMM dd, yyyy')}
                </Typography>
              </Box>
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} justifyContent="center">
              {PERIOD_FILTERS.map((filter) => (
                <Chip
                  key={filter.value}
                  icon={filter.icon}
                  label={filter.label}
                  onClick={() => handlePeriodChange(filter.value)}
                  variant={period === filter.value ? "filled" : "outlined"}
                  color={period === filter.value ? "primary" : "default"}
                  size="small"
                  sx={{
                    fontWeight: period === filter.value ? 600 : 400,
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </Stack>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
              <Tooltip title="Notifications">
                {/* <IconButton>
                  <Badge badgeContent={3} color="error">
                    <Notifications />
                  </Badge>
                </IconButton> */}
              </Tooltip>
              <Tooltip title="Refresh Data">
                <IconButton onClick={handleRefresh} disabled={refreshing}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Data">
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={() => setExportDialogOpen(true)}
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)'
                    }
                  }}
                >
                  Export
                </Button>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '100%', overflowX: 'hidden' }}>
        {/* Summary Cards Grid */}
        <Grid className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Revenue"
              value={`₹${stats.summary.totalRevenue?.toLocaleString('en-IN') || '0'}`}
              icon={<AttachMoney />}
              change={parseFloat(stats.summary.revenueGrowth || 0)}
              subtitle={`₹${stats.summary.periodRevenue?.toLocaleString('en-IN') || '0'} this period`}
              color="primary"
              onClick={() => console.log('Revenue card clicked')}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Orders"
              value={stats.summary.totalOrders || 0}
              icon={<ShoppingCart />}
              change={parseFloat(stats.summary.periodGrowth || 0)}
              subtitle={`${stats.summary.periodOrders || 0} this period`}
              color="secondary"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={stats.summary.totalUsers || 0}
              icon={<People />}
              subtitle={`${stats.summary.newUsersPeriod || 0} new this period`}
              color="success"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg. Order Value"
              value={`₹${stats.summary.avgOrderValue || '0'}`}
              icon={<TrendingUp />}
              subtitle={`${stats.details.products?.active || 0} active products`}
              color="warning"
            />
          </Grid>
        </Grid>

        {/* Charts Row */}
        <Grid className=" grid grid-cols-1 md:grid-cols-2 gap-6 "   spacing={3} mb={4}>
          <Grid item xs={12} lg={3}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 4,
                background: 'white',
                border: `1px solid ${theme.palette.divider}`,
                height: '100%'
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                Top Products
              </Typography>
              
              <Stack spacing={2}>
                {stats.recent?.topProducts && stats.recent.topProducts.length > 0 ? (
                  stats.recent.topProducts.slice(0, 5).map((product, index) => (
                    <Card 
                      key={product.productId || index}
                      variant="outlined"
                      sx={{ 
                        p: 2,
                        '&:hover': { 
                          borderColor: 'primary.main',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                          src={product.productImage ? `${process.env.NEXT_PUBLIC_API_URL}${product.productImage}` : ''}
                          sx={{ 
                            width: 56, 
                            height: 56, 
                            borderRadius: 2,
                            bgcolor: COLORS[index % COLORS.length] + '20',
                            color: COLORS[index % COLORS.length]
                          }}
                          variant="rounded"
                        >
                          {!product.productImage && (product.productName?.charAt(0) || '#')}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                            {index < 3 && (
                              <Chip 
                                label={`#${index + 1}`}
                                size="small"
                                sx={{ 
                                  bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : '#CD7F32',
                                  color: 'white',
                                  fontWeight: 700,
                                  fontSize: '0.7rem'
                                }}
                              />
                            )}
                            <Typography variant="subtitle2" fontWeight={600} noWrap>
                              {product.productName || 'Unknown Product'}
                            </Typography>
                          </Stack>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="textSecondary">
                                Sold: {product.totalQuantity || 0}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="textSecondary" align="right">
                                ₹{product.totalRevenue?.toLocaleString('en-IN') || '0'}
                              </Typography>
                            </Grid>
                          </Grid>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(100, (product.totalQuantity || 0) / 10)} 
                            sx={{ 
                              mt: 1,
                              height: 4,
                              borderRadius: 2,
                              bgcolor: 'grey.100'
                            }}
                          />
                        </Box>
                      </Stack>
                    </Card>
                  ))
                ) : (
                  <Box textAlign="center" py={4}>
                    <Inventory sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                    <Typography color="textSecondary" variant="body1">
                      No product data available
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>
          
           <Grid item xs={12} lg={9}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 4,
                background: 'white',
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Recent Orders
                </Typography>
                <Button 
                  variant="text" 
                  size="small"
                  endIcon={<ArrowUpward fontSize="small" />}
                  sx={{ fontWeight: 600 }}
                  onClick={() => window.open('/admin/orders', '_blank')}
                >
                  View All
                </Button>
              </Stack>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Order Details</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recent?.orders && stats.recent.orders.length > 0 ? (
                      stats.recent.orders.map((order) => (
                        <TableRow 
                          key={order.id}
                          sx={{ 
                            '&:hover': { 
                              bgcolor: 'action.hover',
                              transform: 'scale(1.002)',
                              transition: 'all 0.2s ease'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={600} color="primary.main">
                                {order.id?.substring(0, 12) || 'N/A'}...
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                                <Typography variant="caption" color="textSecondary">
                                  {order.customer || 'Unknown'}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  •
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {order.date ? format(parseISO(order.date), 'MMM dd') : 'N/A'}
                                </Typography>
                              </Stack>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1" fontWeight={700} color="primary.main">
                              ₹{order.amount?.toLocaleString('en-IN') || '0'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={order.status || 'Pending'}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                bgcolor: order.status === 'delivered' ? 'success.light' :
                                        order.status === 'pending' ? 'warning.light' :
                                        order.status === 'cancelled' ? 'error.light' : 'grey.100',
                                color: order.status === 'delivered' ? 'success.dark' :
                                      order.status === 'pending' ? 'warning.dark' :
                                      order.status === 'cancelled' ? 'error.dark' : 'grey.800'
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="View Order Details">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleViewOrder(order)}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {/* <Tooltip title="Edit Order">
                              <IconButton size="small" color="secondary">
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip> */}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                          <Box textAlign="center">
                            <ShoppingCart sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                            <Typography color="textSecondary" variant="body1" gutterBottom>
                              No orders found for this period
                            </Typography>
                            <Button variant="outlined" size="small" onClick={() => window.open('/admin/orders', '_blank')}>
                              View All Orders
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          
        </Grid>

        {/* Orders and Products Row */}
        <Grid className="grid grid-cols-1 md:grid-cols-1 gap-6" spacing={3}>
         <Grid item xs={12} lg={12}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 4,
                background: 'white',
                border: `1px solid ${theme.palette.divider}`,
                height: '100%'
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Order Status Distribution
                </Typography>
                <Tooltip title="Order Status Breakdown">
                  <PieChartIcon fontSize="small" color="action" />
                </Tooltip>
              </Stack>
              
              {/* Render either chart or list view based on data availability */}
              {stats?.breakdowns?.orderStatus && stats.breakdowns.orderStatus.length > 0 ? (
                renderOrderStatusChart()
              ) : (
                renderOrderStatusList()
              )}
              
              <Stack spacing={2} mt={3}>
                <Box>
                  <Typography variant="caption" color="textSecondary" fontWeight={600}>
                    Conversion Rate
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mt={0.5}>
                    <LinearProgress 
                      variant="determinate" 
                      value={parseFloat(stats.summary.conversionRate || 0)} 
                      sx={{ flex: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" fontWeight={700} color="primary.main">
                      {stats.summary.conversionRate || '0'}%
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Pending Reviews
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="warning.main">
                      {stats.details.reviews?.pending || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Pending Payouts
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="error.main">
                      {stats.details.payouts?.pending || 0}
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            </Paper>
          </Grid>

          
        </Grid>


        <Grid item xs={12} lg={12}  my={5}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 4,
                background: 'white',
                border: `1px solid ${theme.palette.divider}`,
                height: '100%'
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Revenue & Orders Trend
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats.period?.label || period} • Updated just now
                  </Typography>
                </Box>
                <Chip 
                  label={stats.period?.label || period} 
                  size="small" 
                  icon={<DateRange />}
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
              {renderChart()}
            </Paper>
          </Grid>
      </Box>

      {/* Export Dialog */}
      <Dialog 
        open={exportDialogOpen} 
        onClose={() => setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Export Dashboard Data
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={exportFormat}
                label="Export Format"
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <MenuItem value="csv">CSV (Spreadsheet)</MenuItem>
                <MenuItem value="json">JSON (Raw Data)</MenuItem>
                <MenuItem value="excel">Excel (Coming Soon)</MenuItem>
              </Select>
            </FormControl>
            
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Include Data Types
              </Typography>
              <FormGroup>
                <FormControlLabel 
                  control={
                    <Checkbox 
                      checked={exportDataTypes.summary} 
                      onChange={(e) => setExportDataTypes({...exportDataTypes, summary: e.target.checked})}
                      size="small"
                    />
                  } 
                  label="Summary Statistics" 
                />
                <FormControlLabel 
                  control={
                    <Checkbox 
                      checked={exportDataTypes.charts} 
                      onChange={(e) => setExportDataTypes({...exportDataTypes, charts: e.target.checked})}
                      size="small"
                    />
                  } 
                  label="Chart Data" 
                />
                <FormControlLabel 
                  control={
                    <Checkbox 
                      checked={exportDataTypes.orders} 
                      onChange={(e) => setExportDataTypes({...exportDataTypes, orders: e.target.checked})}
                      size="small"
                    />
                  } 
                  label="Recent Orders" 
                />
                <FormControlLabel 
                  control={
                    <Checkbox 
                      checked={exportDataTypes.products} 
                      onChange={(e) => setExportDataTypes({...exportDataTypes, products: e.target.checked})}
                      size="small"
                    />
                  } 
                  label="Top Products" 
                />
              </FormGroup>
            </Box>
            
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="caption">
                Data will be exported for the current period: <strong>{stats.period?.label || period}</strong>
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setExportDialogOpen(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleExportData} 
            variant="contained" 
            color="primary"
            startIcon={<Download />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            Download Export
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order View Dialog */}
      {viewOrderDialog && (
        <Dialog 
          open={!!viewOrderDialog} 
          onClose={() => setViewOrderDialog(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            Order Details: {viewOrderDialog.id?.substring(0, 12)}...
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Order Information
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">Order ID</Typography>
                    <Typography variant="body1" fontWeight={600}>{viewOrderDialog.id}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">Date</Typography>
                    <Typography variant="body1">
                      {viewOrderDialog.date ? format(parseISO(viewOrderDialog.date), 'PPP p') : 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">Status</Typography>
                    <Chip
                      label={viewOrderDialog.status || 'Pending'}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        bgcolor: viewOrderDialog.status === 'delivered' ? 'success.light' :
                                viewOrderDialog.status === 'pending' ? 'warning.light' :
                                viewOrderDialog.status === 'cancelled' ? 'error.light' : 'grey.100',
                        color: viewOrderDialog.status === 'delivered' ? 'success.dark' :
                              viewOrderDialog.status === 'pending' ? 'warning.dark' :
                              viewOrderDialog.status === 'cancelled' ? 'error.dark' : 'grey.800'
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">Payment Method</Typography>
                    <Typography variant="body1" fontWeight={600}>{viewOrderDialog.paymentMethod || 'N/A'}</Typography>
                  </Box>
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Customer Information
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">Customer</Typography>
                    <Typography variant="body1" fontWeight={600}>{viewOrderDialog.customer || 'Unknown'}</Typography>
                  </Box>
                  {viewOrderDialog.email && (
                    <Box>
                      <Typography variant="caption" color="textSecondary">Email</Typography>
                      <Typography variant="body1">{viewOrderDialog.email}</Typography>
                    </Box>
                  )}
                  {viewOrderDialog.phone && (
                    <Box>
                      <Typography variant="caption" color="textSecondary">Phone</Typography>
                      <Typography variant="body1">{viewOrderDialog.phone}</Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="caption" color="textSecondary">Amount</Typography>
                    <Typography variant="h6" color="primary.main" fontWeight={700}>
                      ₹{viewOrderDialog.amount?.toLocaleString('en-IN') || '0'}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setViewOrderDialog(null)} variant="outlined">
              Close
            </Button>
            {/* <Button variant="contained" color="primary">
              Edit Order
            </Button>
            <Button variant="contained" color="secondary">
              Print Invoice
            </Button> */}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default AdminDashboard;
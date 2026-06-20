// Utility functions for tracking

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusColor = (status) => {
  const colors = {
    'ordered': 'text-blue-600',
    'processed': 'text-purple-600',
    'picked-up': 'text-yellow-600',
    'in-transit': 'text-indigo-600',
    'out-for-delivery': 'text-green-600',
    'delivered': 'text-green-700',
    'cancelled': 'text-red-600',
    'returned': 'text-gray-600'
  };
  return colors[status] || 'text-gray-600';
};

export const getStatusIcon = (status) => {
  // Icon mapping logic
  return null;
};

export const calculateProgress = (currentIndex, totalSteps) => {
  if (currentIndex < 0) return 0;
  return Math.round(((currentIndex + 1) / totalSteps) * 100);
};

export const validateTrackingNumber = (trackingNumber) => {
  // Basic validation for tracking numbers
  if (!trackingNumber) return false;
  
  // Check length and format
  const trimmed = trackingNumber.trim();
  if (trimmed.length < 8 || trimmed.length > 40) return false;
  
  // Allow alphanumeric and common separators
  const validPattern = /^[A-Z0-9\s\-\.\/]+$/i;
  return validPattern.test(trimmed);
};

export const getEstimatedDeliveryRange = (orderDate, status) => {
  const order = new Date(orderDate);
  const now = new Date();
  
  if (status === 'delivered') {
    return 'Delivered';
  }
  
  // Calculate estimated delivery based on status
  const daysSinceOrder = Math.floor((now - order) / (1000 * 60 * 60 * 24));
  
  if (status === 'in-transit') {
    const estimated = new Date(order);
    estimated.setDate(estimated.getDate() + 3);
    return formatDate(estimated);
  }
  
  if (status === 'out-for-delivery') {
    return 'Today';
  }
  
  // Default: 3-7 business days
  const minDate = new Date(order);
  minDate.setDate(minDate.getDate() + 3);
  const maxDate = new Date(order);
  maxDate.setDate(maxDate.getDate() + 7);
  
  return `${formatDate(minDate)} - ${formatDate(maxDate)}`;
};
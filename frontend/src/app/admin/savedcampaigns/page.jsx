"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Mail,
  Send,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  BarChart,
  CheckCircle,
  XCircle,
  Clock,
  Folder,
  Search,
  Download,
  Copy,
  RefreshCw,
  AlertCircle,
  FileText,
  Sparkles,
  Gift,
  Bell,
  Zap,
  X,
  Palette,
  Image as ImageIcon,
  Type,
  Layout
} from "lucide-react";

const SavedCampaigns = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [sendingCampaignId, setSendingCampaignId] = useState(null);
  const [previewCampaign, setPreviewCampaign] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    draft: 0,
    scheduled: 0,
    failed: 0
  });

  // Add getAuthToken function
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  };

  // Fetch saved campaigns
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/email-campaign/campaigns`
      );

      if (data.success) {
        setCampaigns(data.campaigns);
        setFilteredCampaigns(data.campaigns);
        setStats(data.stats);
        console.log("Fetched campaigns from API:", data.campaigns);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      
      // Fallback to localStorage if API fails
      const saved = localStorage.getItem('saved_email_campaigns');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCampaigns(parsed);
        setFilteredCampaigns(parsed);
        
        // Calculate stats from localStorage
        const stats = {
          total: parsed.length,
          sent: parsed.filter(c => c.status === 'sent').length,
          draft: parsed.filter(c => c.status === 'draft').length,
          scheduled: parsed.filter(c => c.status === 'scheduled').length,
          failed: parsed.filter(c => c.status === 'failed').length
        };
        setStats(stats);
      } else {
        setCampaigns([]);
        setFilteredCampaigns([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Apply search and filter
  useEffect(() => {
    let result = campaigns;
    
    // Apply search
    if (searchTerm) {
      result = result.filter(campaign =>
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== "all") {
      result = result.filter(campaign => campaign.status === filterStatus);
    }
    
    setFilteredCampaigns(result);
  }, [searchTerm, filterStatus, campaigns]);

  const handleEdit = (campaignId) => {
    router.push(`/admin/campaignanalytics/${campaignId}`);
  };

  // Send campaign
  const sendCampaign = async (campaignId, campaignName) => {
    if (!window.confirm(`Send campaign "${campaignName}" to all selected recipients?`)) {
      return;
    }

    try {
      setSendingCampaignId(campaignId);
      
      const campaign = campaigns.find(c => c._id === campaignId);
      if (!campaign) {
        toast.error("Campaign not found");
        return;
      }

      // Send the campaign
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/email-campaign/send-bulk`, {
        campaignId: campaign._id,
        customSubject: campaign.subject,
        customContent: campaign.content,
        userFilter: campaign.segment === "custom" ? "selected" : "segment",
        selectedUserIds: campaign.selectedUsers || [],
        segment: campaign.segment
      });

      toast.success(`✅ Campaign sent! ${data.results.sent} sent, ${data.results.failed} failed`);
      
      // Refresh campaigns list
      fetchCampaigns();
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send campaign");
      console.error(error);
    } finally {
      setSendingCampaignId(null);
    }
  };

  // Send to all users
  const sendToAllUsers = async (campaignId, campaignName) => {
    if (!window.confirm(`Send campaign "${campaignName}" to ALL users? This will override segment settings.`)) {
      return;
    }

    try {
      setSendingCampaignId(campaignId);
      
      const campaign = campaigns.find(c => c._id === campaignId);
      if (!campaign) {
        toast.error("Campaign not found");
        return;
      }

      // Send to all users
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/email-campaign/send-bulk`, {
        campaignId: campaign._id,
        customSubject: campaign.subject,
        customContent: campaign.content,
        userFilter: 'selected',
        selectedUserIds: [],
        segment: 'all'
      });

      toast.success(`✅ Sent to ALL users! ${data.results.sent} sent, ${data.results.failed} failed`);
      
      // Refresh campaigns list
      fetchCampaigns();
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send campaign");
      console.error(error);
    } finally {
      setSendingCampaignId(null);
    }
  };

  // Delete campaign
  const deleteCampaign = async (campaignId, campaignName) => {
    if (!window.confirm(`Delete campaign "${campaignName}"?`)) {
      return;
    }

    try {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/email-campaign/campaigns/${campaignId}`
      );

      if (data.success) {
        toast.success("Campaign deleted successfully");
        fetchCampaigns(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast.error("Failed to delete campaign");
    }
  };

  // Duplicate campaign
  const duplicateCampaign = async (campaignId) => {
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/email-campaign/campaigns/${campaignId}/duplicate`
      );

      if (data.success) {
        toast.success("Campaign duplicated successfully");
        fetchCampaigns(); // Refresh the list
      }
    } catch (error) {
      console.error("Error duplicating campaign:", error);
      toast.error("Failed to duplicate campaign");
    }
  };

  // Preview campaign
  const previewCampaignTheme = (campaign) => {
    setPreviewCampaign(campaign);
  };

  // Get theme preview HTML
  const getThemePreview = (campaign) => {
    const theme = campaign.theme || {};
    const content = campaign.content || "";
    
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: ${theme.headerBg || '#4f46e5'}; color: ${theme.headerText || '#ffffff'}; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${campaign.name || 'Campaign'}</h1>
          <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">${campaign.subject || ''}</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px; background: ${theme.contentBg || '#ffffff'}; color: ${theme.contentText || '#374151'};">
          ${content}
          
          <!-- Theme Info -->
          <div style="margin-top: 30px; padding: 15px; background: #f9fafb; border-radius: 8px; border-left: 4px solid ${theme.primaryColor || '#4f46e5'};">
            <h3 style="margin: 0 0 10px; font-size: 16px; color: #111827;">Theme Settings Preview</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 12px;">
              <div style="display: flex; align-items: center;">
                <div style="width: 12px; height: 12px; background: ${theme.primaryColor || '#4f46e5'}; margin-right: 5px;"></div>
                <span>Primary: ${theme.primaryColor || '#4f46e5'}</span>
              </div>
              <div style="display: flex; align-items: center;">
                <div style="width: 12px; height: 12px; background: ${theme.secondaryColor || '#8b5cf6'}; margin-right: 5px;"></div>
                <span>Secondary: ${theme.secondaryColor || '#8b5cf6'}</span>
              </div>
              <div style="display: flex; align-items: center;">
                <div style="width: 12px; height: 12px; background: ${theme.headerBg || '#4f46e5'}; margin-right: 5px;"></div>
                <span>Header: ${theme.headerBg || '#4f46e5'}</span>
              </div>
              <div style="display: flex; align-items: center;">
                <div style="width: 12px; height: 12px; background: ${theme.contentBg || '#ffffff'}; border: 1px solid #d1d5db; margin-right: 5px;"></div>
                <span>Content: ${theme.contentBg || '#ffffff'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: ${theme.footerBg || '#f3f4f6'}; color: ${theme.footerText || '#6b7280'}; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">This is a preview of your email campaign theme</p>
          <p style="margin: 10px 0 0; font-size: 11px;">Template: ${campaign.template || 'custom'}</p>
        </div>
      </div>
    `;
  };

  // Toggle campaign selection
  const toggleCampaignSelection = (campaignId) => {
    setSelectedCampaigns(prev =>
      prev.includes(campaignId)
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  // Select all campaigns
  const selectAllCampaigns = () => {
    if (selectedCampaigns.length === filteredCampaigns.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(filteredCampaigns.map(c => c._id));
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get template icon
  const getTemplateIcon = (templateId) => {
    switch(templateId) {
      case 'welcome': return <Sparkles className="w-4 h-4 text-blue-500" />;
      case 'promotion': return <Gift className="w-4 h-4 text-red-500" />;
      case 'newsletter': return <Bell className="w-4 h-4 text-green-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get theme preview
  const getThemePreviewCard = (campaign) => {
    const theme = campaign.theme || {};
    
    return (
      <div className="flex items-center space-x-2">
        <div 
          className="w-4 h-4 rounded-full border"
          style={{ backgroundColor: theme.primaryColor || '#4f46e5' }}
          title={`Primary: ${theme.primaryColor || '#4f46e5'}`}
        />
        <div 
          className="w-4 h-4 rounded-full border"
          style={{ backgroundColor: theme.secondaryColor || '#8b5cf6' }}
          title={`Secondary: ${theme.secondaryColor || '#8b5cf6'}`}
        />
        <div 
          className="w-4 h-4 rounded-full border"
          style={{ backgroundColor: theme.headerBg || '#4f46e5' }}
          title={`Header: ${theme.headerBg || '#4f46e5'}`}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      
      {/* Preview Modal */}
      {previewCampaign && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Palette className="w-5 h-5 mr-2 text-indigo-500" />
                  Theme Preview: {previewCampaign.name}
                </h2>
                <p className="text-gray-600 text-sm mt-1">Preview of email theme and content</p>
              </div>
              <button
                onClick={() => setPreviewCampaign(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Theme Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Palette className="w-4 h-4 mr-2" />
                      Theme Settings
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Template</p>
                        <p className="font-medium">{previewCampaign.template || 'Custom'}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500">Primary Color</p>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: previewCampaign.theme?.primaryColor || '#4f46e5' }}
                          />
                          <span>{previewCampaign.theme?.primaryColor || '#4f46e5'}</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500">Secondary Color</p>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: previewCampaign.theme?.secondaryColor || '#8b5cf6' }}
                          />
                          <span>{previewCampaign.theme?.secondaryColor || '#8b5cf6'}</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500">Font Family</p>
                        <p className="font-medium">{previewCampaign.theme?.fontFamily || 'Segoe UI, sans-serif'}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500">Content Width</p>
                        <p className="font-medium">{previewCampaign.theme?.contentWidth || '600px'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Email Preview */}
                <div className="lg:col-span-2">
                  <div className="border rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-gray-100 p-3 border-b flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <span className="text-xs text-gray-600">Email Preview</span>
                    </div>
                    
                    <div className="p-2 bg-gray-50">
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: getThemePreview(previewCampaign) 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Raw Content Preview */}
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Content Preview
                </h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-auto max-h-60">
                  <pre className="whitespace-pre-wrap">
                    {previewCampaign.content || 'No content available'}
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end space-x-3">
              <button
                onClick={() => setPreviewCampaign(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  router.push(`/email-campaign?edit=${previewCampaign._id}`);
                  setPreviewCampaign(null);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Campaign
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Folder className="w-6 h-6 mr-2 text-indigo-500" />
                Saved Email Campaigns
              </h1>
              <p className="text-gray-600 mt-2">Manage and send your saved email campaigns</p>
            </div>
            <div className="flex items-center mt-4 md:mt-0 space-x-3">
              <button
                onClick={() => router.push('/email-campaign')}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition flex items-center"
              >
                <Mail className="w-5 h-5 mr-2" />
                Create New
              </button>
              <button
                onClick={fetchCampaigns}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition flex items-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
              <p className="text-xs text-indigo-600">Total Campaigns</p>
              <h3 className="text-lg font-bold text-gray-900">{stats.total}</h3>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <p className="text-xs text-green-600">Sent</p>
              <h3 className="text-lg font-bold text-gray-900">{stats.sent}</h3>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-600">Drafts</p>
              <h3 className="text-lg font-bold text-gray-900">{stats.draft}</h3>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-600">Scheduled</p>
              <h3 className="text-lg font-bold text-gray-900">{stats.scheduled}</h3>
            </div>
            
            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
              <p className="text-xs text-red-600">Failed</p>
              <h3 className="text-lg font-bold text-gray-900">{stats.failed}</h3>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search campaigns by name or subject..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="scheduled">Scheduled</option>
                <option value="failed">Failed</option>
              </select>
              
              <button
                onClick={selectAllCampaigns}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition flex items-center"
              >
                {selectedCampaigns.length === filteredCampaigns.length ? "Deselect All" : "Select All"}
              </button>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredCampaigns.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredCampaigns.map((campaign) => (
                <div
                  key={campaign._id}
                  className={`p-6 hover:bg-gray-50 transition ${selectedCampaigns.includes(campaign._id) ? 'bg-indigo-50' : ''}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    {/* Left side: Campaign Info */}
                    <div className="flex-1">
                      <div className="flex items-start mb-3">
                        <input
                          type="checkbox"
                          checked={selectedCampaigns.includes(campaign._id)}
                          onChange={() => toggleCampaignSelection(campaign._id)}
                          className="mt-1 mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            {getTemplateIcon(campaign.template)}
                            <h3 className="text-lg font-semibold text-gray-900 ml-2">{campaign.name}</h3>
                            <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                              {campaign.status === 'sent' ? 'Sent' : 
                               campaign.status === 'draft' ? 'Draft' : 
                               campaign.status === 'scheduled' ? 'Scheduled' : 'Failed'}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-2">{campaign.subject}</p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(campaign.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                            
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {campaign.recipientCount || 'Multiple'} recipients
                            </div>
                            
                            {campaign.theme && (
                              <div className="flex items-center">
                                <Palette className="w-4 h-4 mr-1" />
                                Custom Theme
                              </div>
                            )}
                            
                            {campaign.sentAt && (
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                Sent: {new Date(campaign.sentAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right side: Actions */}
                    <div className="flex space-x-2 mt-4 lg:mt-0">
                      {/* Preview Button */}
                      <button
                        onClick={() => previewCampaignTheme(campaign)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center"
                        title="Preview Theme"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      
                      {/* Theme Preview Colors */}
                      {campaign.theme && (
                        <div className="hidden sm:flex items-center space-x-1 px-2">
                          {getThemePreviewCard(campaign)}
                        </div>
                      )}
                      
                      <button
                        onClick={() => duplicateCampaign(campaign._id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                        title="Duplicate"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                      
                      {/* Send Buttons */}
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => sendCampaign(campaign._id, campaign.name)}
                          disabled={campaign.status === 'sent' || sendingCampaignId === campaign._id}
                          className={`px-3 py-1 rounded-lg transition flex items-center ${
                            campaign.status === 'sent'
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {sendingCampaignId === campaign._id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white mr-2"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-1" />
                              Send
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => sendToAllUsers(campaign._id, campaign.name)}
                          disabled={sendingCampaignId === campaign._id}
                          className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition flex items-center text-sm"
                        >
                          <Users className="w-4 h-4 mr-1" />
                          Send to All
                        </button>
                      </div>
                      
                      <button
                        onClick={() => deleteCampaign(campaign._id, campaign.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(campaign._id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Segment and Theme Info */}
                  <div className="mt-4 pl-9">
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Segment:</span> 
                        {campaign.segment === 'all' && ' All Users'}
                        {campaign.segment === 'verified' && ' Verified Users'}
                        {campaign.segment === 'unverified' && ' Unverified Users'}
                        {campaign.segment === 'recent' && ' Recent Users (30d)'}
                        {campaign.segment === 'withAddress' && ' Users with Address'}
                        {campaign.segment === 'noAddress' && ' Users without Address'}
                        {campaign.segment === 'custom' && ' Custom Selection'}
                      </div>
                      
                      {campaign.theme && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Theme:</span>
                          <div className="flex items-center space-x-1">
                            <div 
                              className="w-3 h-3 rounded-full border"
                              style={{ backgroundColor: campaign.theme.primaryColor || '#4f46e5' }}
                              title={`Primary: ${campaign.theme.primaryColor || '#4f46e5'}`}
                            />
                            <div 
                              className="w-3 h-3 rounded-full border"
                              style={{ backgroundColor: campaign.theme.secondaryColor || '#8b5cf6' }}
                              title={`Secondary: ${campaign.theme.secondaryColor || '#8b5cf6'}`}
                            />
                          </div>
                          <button
                            onClick={() => previewCampaignTheme(campaign)}
                            className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Sent Stats */}
                    {(campaign.sentCount > 0 || campaign.failedCount > 0) && (
                      <div className="flex flex-wrap gap-3 mt-2 text-xs">
                        {campaign.sentCount > 0 && (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {campaign.sentCount} sent
                          </div>
                        )}
                        {campaign.failedCount > 0 && (
                          <div className="flex items-center text-red-600">
                            <XCircle className="w-3 h-3 mr-1" />
                            {campaign.failedCount} failed
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved campaigns found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try changing your search or filter criteria'
                  : 'Create your first email campaign to get started'}
              </p>
              <button
                onClick={() => router.push('/email-campaign')}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center mx-auto"
              >
                <Mail className="w-5 h-5 mr-2" />
                Create New Campaign
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedCampaigns;
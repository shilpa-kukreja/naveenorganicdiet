"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation"; // ADD THIS IMPORT
import EmailEditor from 'react-email-editor';
import {
  Mail,
  Users,
  Send,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  BarChart,
  Bell,
  Gift,
  Sparkles,
  Zap,
  X,
  User,
  MapPin,
  Coins,
  FileCode,
  Copy,
  Check,
  Save,
  Layout,
  Folder
} from "lucide-react";

const EmailCampaign = () => {
  const router = useRouter(); // ADD THIS
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [campaignStats, setCampaignStats] = useState(null);
  const [copiedVariable, setCopiedVariable] = useState(null);
  const [savedCampaigns, setSavedCampaigns] = useState([]);

  // react-email-editor ref
  const emailEditorRef = useRef(null);

  // Campaign form state
  const [campaign, setCampaign] = useState({
    name: "",
    subject: "",
    template: "custom",
    content: "",
    segment: "all",
    schedule: "now",
    scheduledDate: "",
    scheduledTime: ""
  });

  // Editor state
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [design, setDesign] = useState(null);
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  // Stats for dashboard
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    unverifiedUsers: 0,
    recentUsers: 0,
    usersWithAddress: 0,
    usersWithoutAddress: 0
  });

  // Available variables for merge tags
  const variables = [
    { key: "name", label: "User Name", value: "{{user.name}}", description: "Full name from address or username" },
    { key: "username", label: "Username", value: "{{user.username}}", description: "Registered username" },
    { key: "email", label: "User Email", value: "{{user.email}}", description: "Primary email address" },
    { key: "firstname", label: "First Name", value: "{{user.firstname}}", description: "First name only" },
    { key: "phone", label: "Phone Number", value: "{{user.phone}}", description: "User's phone number" },
    { key: "couponCode", label: "Coupon Code", value: "{{user.couponCode}}", description: "Personal coupon code" },
    { key: "referralCode", label: "Referral Code", value: "{{user.referralCode}}", description: "Referral code" },
    { key: "walletCoins", label: "Wallet Coins", value: "{{user.walletCoins}}", description: "Reward coins balance" },
    { key: "date", label: "Current Date", value: "{{current.date}}", description: "Today's date" },
    { key: "store", label: "Store Name", value: "{{store.name}}", description: "Organic Diet" }
  ];

  // Sample designs for templates
  const sampleDesigns = {
    welcome: {
      body: {
        rows: [
          {
            columns: [
              {
                backgroundColor: "#48bb78",
                width: "100%",
                padding: "40px 20px",
                textAlign: "center",
                children: [
                  {
                    type: "text",
                    content: "<h1 style='color: white; margin: 0;'>Welcome to Organic Diet! 🌿</h1>",
                    fontSize: "28px"
                  },
                  {
                    type: "text",
                    content: "<p style='color: white; opacity: 0.9; margin-top: 10px;'>Your journey to healthier living starts here</p>",
                    fontSize: "16px"
                  }
                ]
              }
            ]
          },
          {
            columns: [
              {
                width: "100%",
                padding: "40px 20px",
                children: [
                  {
                    type: "text",
                    content: "<p>Dear {{user.name}},</p><p>We're thrilled to welcome you to the Organic Diet family! Start shopping healthy today.</p>",
                    fontSize: "16px",
                    lineHeight: "1.6"
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    promotion: {
      body: {
        rows: [
          {
            columns: [
              {
                backgroundColor: "#ed8936",
                width: "100%",
                padding: "40px 20px",
                textAlign: "center",
                children: [
                  {
                    type: "text",
                    content: "<h1 style='color: white; margin: 0;'>FLASH SALE! ⚡</h1>",
                    fontSize: "32px"
                  },
                  {
                    type: "text",
                    content: "<p style='color: white; background: #c53030; display: inline-block; padding: 5px 15px; border-radius: 20px; margin-top: 10px;'>EXCLUSIVE FOR {{user.firstname}}</p>",
                    fontSize: "14px"
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  };

  // Add getAuthToken function
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  };

  // Fetch initial data
  useEffect(() => {
    fetchUsers();
    fetchTemplates();
    fetchCampaignStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:5000/api/users/getalluser");
      setUsers(data.users || []);

      // Update stats
      const verified = data.users.filter(user => user.verifiedAt).length;
      const unverified = data.users.length - verified;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recent = data.users.filter(user => new Date(user.createdAt) > thirtyDaysAgo).length;
      const withAddress = data.users.filter(user => user.address && user.address.length > 0).length;

      setStats({
        totalUsers: data.users.length,
        verifiedUsers: verified,
        unverifiedUsers: unverified,
        recentUsers: recent,
        usersWithAddress: withAddress,
        usersWithoutAddress: data.users.length - withAddress
      });
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/email-campaign/templates");
      setTemplates(data.templates || []);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      // Fallback templates
      setTemplates([
        { id: "welcome", name: "Welcome Email", subject: "🎉 Welcome to Organic Diet", description: "Welcome new users" },
        { id: "promotion", name: "Promotion Email", subject: "🌟 Exclusive Offer", description: "Special offers" },
        { id: "newsletter", name: "Newsletter", subject: "📰 Weekly Digest", description: "Weekly updates" }
      ]);
    }
  };

  const fetchCampaignStats = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/email-campaign/stats");
      setCampaignStats(data.stats);
    } catch (error) {
      console.error("Failed to fetch campaign stats");
    }
  };

  // Handle template selection
  const handleTemplateSelect = async (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCampaign(prev => ({
        ...prev,
        template: templateId,
        subject: template.subject
      }));

      // Load sample design for the template
      if (templateId !== "custom" && sampleDesigns[templateId]) {
        emailEditorRef.current?.editor?.loadDesign(sampleDesigns[templateId]);
        toast.success(`"${template.name}" template loaded`);
      }
    }
  };

  // Toggle user selection
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Select all users
  const selectAllUsers = () => {
    setSelectedUsers(users.map(user => user._id));
    toast.success(`Selected all ${users.length} users`);
  };

  // Clear all selections
  const clearAllUsers = () => {
    setSelectedUsers([]);
    toast.success("Selection cleared");
  };

  // Get selected segment users
  const getSegmentUsers = () => {
    switch (campaign.segment) {
      case "verified":
        return users.filter(user => user.verifiedAt);
      case "unverified":
        return users.filter(user => !user.verifiedAt);
      case "recent":
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return users.filter(user => new Date(user.createdAt) > thirtyDaysAgo);
      case "withAddress":
        return users.filter(user => user.address && user.address.length > 0);
      case "noAddress":
        return users.filter(user => !user.address || user.address.length === 0);
      case "custom":
        return users.filter(user => selectedUsers.includes(user._id));
      default:
        return users;
    }
  };

  // Get recipient count
  const getRecipientCount = () => {
    return getSegmentUsers().length;
  };

  // Get recipient emails preview
  const getRecipientEmails = () => {
    const segmentUsers = getSegmentUsers();
    return segmentUsers.slice(0, 5).map(user =>
      user.address?.[0]?.email || user.email
    ).join(", ");
  };

  // Copy variable to clipboard
  const copyVariable = async (variable) => {
    try {
      await navigator.clipboard.writeText(variable);
      setCopiedVariable(variable);
      toast.success("Variable copied to clipboard");
      setTimeout(() => setCopiedVariable(null), 2000);
    } catch (err) {
      toast.error("Failed to copy variable");
    }
  };

  // Save campaign to database
  const saveCampaignToDB = async () => {
    if (!campaign.name.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }

    if (!campaign.subject.trim()) {
      toast.error("Please enter email subject");
      return;
    }

    try {
      setIsSaving(true);

      // Export HTML from editor
      emailEditorRef.current?.editor?.exportHtml(async (data) => {
        const { html } = data;

        const campaignData = {
          name: campaign.name,
          subject: campaign.subject,
          content: html,
          template: campaign.template,
          segment: campaign.segment,
          selectedUsers: selectedUsers,
          recipientCount: getRecipientCount(),
          tags: [],
          notes: "",
          scheduledFor: campaign.schedule === 'later' ?
            `${campaign.scheduledDate}T${campaign.scheduledTime}:00` :
            null
        };

        // Save to database
        const { data: response } = await axios.post(
          "http://localhost:5000/api/email-campaign/campaigns",
          campaignData
        );

        if (response.success) {
          toast.success(`Campaign "${campaign.name}" saved successfully!`);
          
          // Reset form
          setCampaign({
            name: "",
            subject: "",
            template: "custom",
            content: "",
            segment: "all",
            schedule: "now",
            scheduledDate: "",
            scheduledTime: ""
          });
          
          // Clear editor
          emailEditorRef.current?.editor?.loadDesign({});
          
          // Optionally navigate to saved campaigns page
          if (window.confirm("Go to saved campaigns page?")) {
            router.push('/admin/savedcampaigns');
          }
        }
      });

    } catch (error) {
      console.error("Error saving campaign:", error);
      toast.error(error.response?.data?.message || "Failed to save campaign");
    } finally {
      setIsSaving(false);
    }
  };

  // Export HTML
  const exportHtml = () => {
    emailEditorRef.current?.editor?.exportHtml((data) => {
      const { design, html } = data;
      setHtmlContent(html);
      setShowHtmlEditor(true);
      toast.success("HTML exported!");
    });
  };

  // Load design
  const loadDesign = () => {
    if (design) {
      emailEditorRef.current?.editor?.loadDesign(design);
      toast.success("Design loaded!");
    }
  };

  // Send test email
  const sendTestEmail = async () => {
    if (!campaign.subject) {
      toast.error("Please enter subject");
      return;
    }

    try {
      setIsSending(true);

      // Export HTML from editor
      emailEditorRef.current?.editor?.exportHtml(async (data) => {
        const { html } = data;

        const { data: response } = await axios.post("http://localhost:5000/api/email-campaign/send-test", {
          templateId: campaign.template !== "custom" ? campaign.template : null,
          customSubject: campaign.subject,
          customContent: html
        });

        toast.success(`Test email sent to ${response.sentTo || 'admin email'}!`);
      });

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send test email");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  // Send campaign
  const sendCampaign = async () => {
    if (!campaign.subject) {
      toast.error("Please enter subject");
      return;
    }

    if (getRecipientCount() === 0) {
      toast.error("No recipients selected");
      return;
    }

    if (!window.confirm(`Send campaign to ${getRecipientCount()} recipients?`)) {
      return;
    }

    try {
      setIsSending(true);

      // Export HTML from editor
      emailEditorRef.current?.editor?.exportHtml(async (data) => {
        const { html } = data;

        const { data: response } = await axios.post("http://localhost:5000/api/email-campaign/send-bulk", {
          templateId: campaign.template !== "custom" ? campaign.template : null,
          customSubject: campaign.subject,
          customContent: html,
          userFilter: campaign.segment === "custom" ? "selected" : "segment",
          selectedUserIds: selectedUsers,
          segment: campaign.segment
        });

        toast.success(`✅ Campaign completed! ${response.results.sent} sent, ${response.results.failed} failed`);

        // Reset form
        setCampaign({
          name: "",
          subject: "",
          template: "custom",
          content: "",
          segment: "all",
          schedule: "now",
          scheduledDate: "",
          scheduledTime: ""
        });
        setSelectedUsers([]);

        // Refresh stats
        fetchCampaignStats();
      });

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send campaign");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  // Load sample content based on template
  const loadSampleTemplate = (templateType) => {
    if (sampleDesigns[templateType]) {
      emailEditorRef.current?.editor?.loadDesign(sampleDesigns[templateType]);
      toast.success(`"${templateType}" template loaded`);
    }
  };

  // Editor ready callback
  const onEditorReady = () => {
    setEditorLoaded(true);
    console.log("Email Editor is ready!");
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

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📧 Email Campaign Manager</h1>
              <p className="text-gray-600 mt-2">Drag & drop email builder with react-email-editor</p>
            </div>
            <div className="flex items-center mt-4 md:mt-0 space-x-3">
              <button
                onClick={fetchUsers}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition flex items-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh
              </button>

              <button
                onClick={() => router.push('/admin/savedcampaigns')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center"
              >
                <Folder className="w-5 h-5 mr-2" />
                Saved Campaigns
              </button>

              <button
                onClick={exportHtml}
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition flex items-center"
              >
                <Eye className="w-5 h-5 mr-2" />
                Export HTML
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-600">Total Users</p>
              <h3 className="text-lg font-bold text-gray-900">{stats.totalUsers}</h3>
            </div>

            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <p className="text-xs text-green-600">Verified</p>
              <h3 className="text-lg font-bold text-gray-900">{stats.verifiedUsers}</h3>
            </div>

            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
              <p className="text-xs text-amber-600">With Address</p>
              <h3 className="text-lg font-bold text-gray-900">{stats.usersWithAddress}</h3>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
              <p className="text-xs text-purple-600">Recent (30d)</p>
              <h3 className="text-lg font-bold text-gray-900">{stats.recentUsers}</h3>
            </div>

            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
              <p className="text-xs text-red-600">Without Address</p>
              <h3 className="text-lg font-bold text-gray-900">{stats.usersWithoutAddress}</h3>
            </div>

            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
              <p className="text-xs text-indigo-600">Ready to Send</p>
              <h3 className="text-lg font-bold text-gray-900">{getRecipientCount()}</h3>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Campaign Editor */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Send className="w-5 h-5 mr-2 text-blue-500" />
                Create Campaign
              </h2>

              {/* Campaign Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={campaign.name}
                  onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                  placeholder="e.g., December Welcome Campaign"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Email Subject */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Subject *
                </label>
                <input
                  type="text"
                  value={campaign.subject}
                  onChange={(e) => setCampaign({ ...campaign, subject: e.target.value })}
                  placeholder="Enter compelling subject line..."
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">Use variables like {"{{user.name}}"} for personalization</p>
              </div>

              {/* Templates */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Template
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleTemplateSelect("custom")}
                    className={`p-4 rounded-lg border flex flex-col items-center justify-center ${campaign.template === "custom"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                      }`}
                  >
                    <Layout className="w-6 h-6 mb-2 text-gray-600" />
                    <span className="text-sm font-medium">Custom</span>
                  </button>

                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => {
                        handleTemplateSelect(template.id);
                        loadSampleTemplate(template.id);
                      }}
                      className={`p-4 rounded-lg border flex flex-col items-center justify-center ${campaign.template === template.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                        }`}
                    >
                      {template.id === "welcome" && <Sparkles className="w-6 h-6 mb-2 text-blue-500" />}
                      {template.id === "promotion" && <Gift className="w-6 h-6 mb-2 text-red-500" />}
                      {template.id === "newsletter" && <Bell className="w-6 h-6 mb-2 text-green-500" />}
                      <span className="text-sm font-medium">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Variables Panel */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700 flex items-center">
                    <FileCode className="w-4 h-4 mr-2" />
                    Available Merge Variables
                  </h3>
                  <span className="text-xs text-gray-500">Click to copy</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {variables.map(v => (
                    <button
                      key={v.key}
                      onClick={() => copyVariable(v.value)}
                      className="group relative"
                      title={v.description}
                    >
                      <div className="bg-white border border-gray-200 rounded-lg p-2 text-center hover:border-green-300 hover:bg-green-50 transition">
                        <div className="text-xs text-gray-500 mb-1">{v.label}</div>
                        <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded truncate">
                          {v.value}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyVariable(v.value);
                        }}
                        className="absolute -top-1 -right-1 bg-gray-800 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        {copiedVariable === v.value ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Editor */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Content Editor
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={saveCampaignToDB}
                      disabled={isSaving}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Save Campaign
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* React Email Editor */}
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  {!editorLoaded && (
                    <div className="flex items-center justify-center h-96 bg-gray-50">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading email editor...</p>
                      </div>
                    </div>
                  )}

                  <EmailEditor
                    ref={emailEditorRef}
                    onLoad={onEditorReady}
                    options={{
                      appearance: {
                        theme: 'modern_dark',
                        panels: {
                          tools: {
                            dock: 'right'
                          }
                        }
                      },
                      tools: {
                        button: {
                          enabled: true
                        },
                        heading: {
                          enabled: true
                        },
                        image: {
                          enabled: true,
                          position: 1
                        },
                        social: {
                          enabled: true
                        },
                        divider: {
                          enabled: true
                        },
                        menu: {
                          enabled: true
                        }
                      },
                      features: {
                        preview: true,
                        imageEditor: true,
                        undoRedo: true,
                        textEditor: {
                          spellChecker: true,
                          tables: true,
                          cleanPaste: true,
                          emojis: true
                        }
                      }
                    }}
                    minHeight="600px"
                  />
                </div>

                <div className="mt-3 text-sm text-gray-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Drag and drop elements to create your email. Merge variables will be replaced with actual user data.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Audience & Actions */}
          <div className="space-y-8">
            {/* Audience Selection */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-500" />
                Select Audience
              </h2>

              {/* Segment Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Segment
                </label>
                <select
                  value={campaign.segment}
                  onChange={(e) => setCampaign({ ...campaign, segment: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Users ({stats.totalUsers})</option>
                  <option value="verified">Verified Users ({stats.verifiedUsers})</option>
                  <option value="unverified">Unverified Users ({stats.unverifiedUsers})</option>
                  <option value="recent">Recent (Last 30 days) ({stats.recentUsers})</option>
                  <option value="withAddress">With Address ({stats.usersWithAddress})</option>
                  <option value="noAddress">Without Address ({stats.usersWithoutAddress})</option>
                  <option value="custom">Custom Selection</option>
                </select>
              </div>

              {/* Custom Selection */}
              {campaign.segment === "custom" && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Select Users ({selectedUsers.length} selected)
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={selectAllUsers}
                        className="text-sm text-green-600 hover:text-green-800"
                      >
                        Select All
                      </button>
                      <button
                        onClick={clearAllUsers}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    {users.slice(0, 10).map(user => (
                      <div
                        key={user._id}
                        onClick={() => toggleUserSelection(user._id)}
                        className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${selectedUsers.includes(user._id) ? "bg-green-50 border-green-200" : ""
                          }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${selectedUsers.includes(user._id) ? "bg-green-500" : "bg-gray-200"
                            }`}></div>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[150px]">
                              {user.address?.[0]?.email || user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {user.address?.[0] && (
                            <MapPin className="w-3 h-3 text-blue-500" title="Has address" />
                          )}
                          {user.verifiedAt && (
                            <CheckCircle className="w-3 h-3 text-green-500" title="Verified" />
                          )}
                          {user.walletCoins > 0 && (
                            <Coins className="w-3 h-3 text-amber-500" title={`${user.walletCoins} coins`} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recipient Summary */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h3 className="text-sm font-medium text-green-800 mb-2">Recipient Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-green-700">Total Recipients:</span>
                    <span className="font-bold text-green-900">{getRecipientCount()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Segment:</span>
                    <span className="font-medium text-green-800">
                      {campaign.segment === "all" && "All Users"}
                      {campaign.segment === "verified" && "Verified Users"}
                      {campaign.segment === "unverified" && "Unverified Users"}
                      {campaign.segment === "recent" && "Recent Users (30d)"}
                      {campaign.segment === "withAddress" && "Users with Address"}
                      {campaign.segment === "noAddress" && "Users without Address"}
                      {campaign.segment === "custom" && "Custom Selection"}
                    </span>
                  </div>
                  {getRecipientCount() > 0 && (
                    <div className="text-xs text-green-600 mt-2">
                      <div className="font-medium">Sample recipients:</div>
                      <div className="truncate">{getRecipientEmails()}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Send className="w-5 h-5 mr-2 text-purple-500" />
                Send Campaign
              </h2>

              <div className="space-y-3">
                <button
                  onClick={sendTestEmail}
                  disabled={isSending || !editorLoaded}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Sending Test...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Send Test Email
                    </>
                  )}
                </button>

                <button
                  onClick={sendCampaign}
                  disabled={isSending || getRecipientCount() === 0 || !editorLoaded}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg hover:opacity-90 transition flex items-center justify-center disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Sending Campaign...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send to {getRecipientCount()} Users
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    onClick={() => {
                      setCampaign({
                        name: "",
                        subject: "",
                        template: "custom",
                        content: "",
                        segment: "all",
                        schedule: "now",
                        scheduledDate: "",
                        scheduledTime: ""
                      });
                      setSelectedUsers([]);
                      emailEditorRef.current?.editor?.loadDesign({});
                      toast.success("Form reset");
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Reset Form
                  </button>
                </div>
              </div>

              {/* Important Notes */}
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="text-sm font-medium text-amber-800 mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Important Information
                </h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Drag & drop elements from the right panel</li>
                  <li>• Use merge variables for personalization</li>
                  <li>• Test email goes to admin address</li>
                  <li>• Save campaigns for future use</li>
                  <li>• Large campaigns may take 5-10 minutes</li>
                </ul>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-amber-500" />
                Quick Templates
              </h2>

              <div className="space-y-3">
                <button
                  onClick={() => loadSampleTemplate('welcome')}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
                >
                  <div className="font-medium">Load Welcome Template</div>
                  <div className="text-sm text-gray-500">Beautiful welcome email design</div>
                </button>

                <button
                  onClick={() => loadSampleTemplate('promotion')}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition"
                >
                  <div className="font-medium">Load Promotion Template</div>
                  <div className="text-sm text-gray-500">Flash sale with eye-catching design</div>
                </button>

                <button
                  onClick={exportHtml}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition"
                >
                  <div className="font-medium">Export HTML</div>
                  <div className="text-sm text-gray-500">Get HTML code for your design</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HTML Editor Modal */}
      {showHtmlEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">HTML Code</h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(htmlContent);
                    toast.success("HTML copied to clipboard");
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy HTML
                </button>
                <button
                  onClick={() => setShowHtmlEditor(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-auto bg-gray-900 h-[70vh]">
              <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                {htmlContent}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailCampaign;
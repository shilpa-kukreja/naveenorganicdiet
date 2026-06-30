"use client";

import axios from "axios";
import { RefreshCw } from "lucide-react";

// Temporary test button component
const TestAPIButton = ({ campaignId }) => {
  const testAPI = async () => {
    try {
      console.log("Testing API connection...");

      const debugRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tracking/debug/${campaignId}`
      );
      console.log("Debug API response:", debugRes.data);

      const analyticsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tracking/analytics/${campaignId}`
      );
      console.log("Analytics API response:", analyticsRes.data);

      alert("API test successful! Check console for details.");
    } catch (error) {
      console.error("API test failed:", error);
      alert(
        `API test failed: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  return (
    <button
      onClick={testAPI}
      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      <RefreshCw className="w-4 h-4 mr-2" />
      Test API Connection
    </button>
  );
};

// ✅ DEFAULT EXPORT PAGE COMPONENT (REQUIRED)
export default function Page() {
  const campaignId = "695e25020269d3786f5580f5"; // replace with real ID

  return (
    <div className="mb-4 p-4">
      <TestAPIButton campaignId={campaignId} />
    </div>
  );
}

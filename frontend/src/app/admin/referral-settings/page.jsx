// "use client";
// import { useEffect, useState } from "react";
// import axios from "axios";


// export default function ReferralSettings() {
//   const [settings, setSettings] = useState({
//     userDiscountPercent: 5,
//     referrerCommissionPercent: 5,
//     adminCommissionPercent: 10
//   });
//   const [loading, setLoading] = useState(false);
//   const [fetchLoading, setFetchLoading] = useState(true);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     fetchSettings();
//   }, []);

//   const fetchSettings = async () => {
//     try {
//       setFetchLoading(true);
//       const { data } = await axios.get("http://localhost:5000/api/users/referral-config");
//       if (data.success && data.config) {
//         setSettings(data.config);
//       }
//     } catch (error) {
//       console.error("Error fetching settings:", error);
//       setMessage("Error loading settings");
//     } finally {
//       setFetchLoading(false);
//     }
//   };
//   console.log(settings)

//   const saveSettings = async () => {
//     setLoading(true);
//     setMessage("");
//     try {
//       const response = await axios.put("http://localhost:5000/api/users/referral-config", settings);
      
//       if (response.data.success) {
//         setMessage("Settings Updated Successfully ✅");
//         setTimeout(() => setMessage(""), 3000);
//       } else {
//         setMessage(response.data.message || "Error updating settings");
//       }
//     } catch (error) {
//       const errorMessage = error.response?.data?.message || "Error updating settings";
//       setMessage(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   console.log(settings)

//   const totalPercent = settings.userDiscountPercent + settings.referrerCommissionPercent ;

//   return (
//     <div className="flex min-h-screen bg-gray-50">
     
      
//       <div className="flex-1 p-8">
//         <div className="w-full mx-auto">
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//             <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
//               <h1 className="text-2xl font-bold text-white">Referral Commission Settings</h1>
//               <p className="text-blue-100 mt-1">
//                 Configure referral program percentages - These settings will apply to all new orders
//               </p>
//             </div>

//             <div className="p-6">
//               {message && (
//                 <div className={`mb-6 p-4 rounded-lg ${
//                   message.includes("Error") || message.includes("Error") 
//                     ? "bg-red-50 text-red-700 border border-red-200" 
//                     : "bg-green-50 text-green-700 border border-green-200"
//                 }`}>
//                   {message}
//                 </div>
//               )}

//               {fetchLoading ? (
//                 <div className="text-center py-8">
//                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//                   <p className="mt-4 text-gray-600">Loading settings...</p>
//                 </div>
//               ) : (
//                 <>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//                     <div className="setting-card bg-blue-50 p-4 rounded-lg border border-blue-200">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         User Discount %
//                       </label>
//                       <input
//                         type="number"
//                         min="0"
//                         max="50"
//                         step="0.5"
//                         value={settings.userDiscountPercent}
//                         onChange={(e) => setSettings({ ...settings, userDiscountPercent: Number(e.target.value) })}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//                       />
//                       <p className="text-xs text-gray-500 mt-2">
//                         Discount given to referred users on their first order
//                       </p>
//                       <p className="text-sm text-blue-600 font-medium mt-1">
//                         Example: ₹1000 order → ₹{1000 * settings.userDiscountPercent / 100} discount
//                       </p>
//                     </div>

//                     <div className="setting-card bg-green-50 p-4 rounded-lg border border-green-200">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Referrer Commission %
//                       </label>
//                       <input
//                         type="number"
//                         min="0"
//                         max="50"
//                         step="0.5"
//                         value={settings.referrerCommissionPercent}
//                         onChange={(e) => setSettings({ ...settings, referrerCommissionPercent: Number(e.target.value) })}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//                       />
//                       <p className="text-xs text-gray-500 mt-2">
//                         Commission earned by referrers when their referral places an order
//                       </p>
//                       <p className="text-sm text-green-600 font-medium mt-1">
//                         Example: ₹1000 order → ₹{1000 * settings.referrerCommissionPercent / 100} commission
//                       </p>
//                     </div>

//                     {/* <div className="setting-card bg-purple-50 p-4 rounded-lg border border-purple-200">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Admin Commission %
//                       </label>
//                       <input
//                         type="number"
//                         min="0"
//                         max="50"
//                         step="0.5"
//                         value={settings.adminCommissionPercent}
//                         onChange={(e) => setSettings({ ...settings, adminCommissionPercent: Number(e.target.value) })}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//                       />
//                       <p className="text-xs text-gray-500 mt-2">
//                         Platform commission on referred orders
//                       </p>
//                       <p className="text-sm text-purple-600 font-medium mt-1">
//                         Example: ₹1000 order → ₹{1000 * settings.adminCommissionPercent / 100} platform fee
//                       </p>
//                     </div> */}
//                   </div>

//                   <div className={`p-4 rounded-lg mb-6 ${
//                     totalPercent > 100 
//                       ? "bg-red-50 border border-red-200 text-red-700" 
//                       : totalPercent <= 80
//                       ? "bg-green-50 border border-green-200 text-green-700"
//                       : "bg-yellow-50 border border-yellow-200 text-yellow-700"
//                   }`}>
//                     <h3 className="font-semibold mb-2">Commission Structure Summary</h3>
//                     <p className="text-sm">
//                       <strong>Total Percentage: {totalPercent}%</strong>
//                       {totalPercent > 100 && (
//                         <span className="block mt-1">⚠️ Total exceeds 100% - This is not sustainable</span>
//                       )}
//                       {totalPercent <= 80 && (
//                         <span className="block mt-1">✅ Healthy margin maintained</span>
//                       )}
//                       {totalPercent > 80 && totalPercent <= 100 && (
//                         <span className="block mt-1">⚠️ Consider reducing percentages for better margins</span>
//                       )}
//                     </p>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <button 
//                       onClick={fetchSettings}
//                       className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition"
//                     >
//                       Reload Settings
//                     </button>
                    
//                     <button 
//                       onClick={saveSettings} 
//                       disabled={loading || totalPercent > 100}
//                       className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {loading ? (
//                         <>
//                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
//                           Saving...
//                         </>
//                       ) : (
//                         "Save Changes"
//                       )}
//                     </button>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ReferralSettings() {
  const [settings, setSettings] = useState({
    userDiscountPercent: 5,
    referrerCommissionPercent: 5,
    maxDirectDiscountPercent: 20,
    maxTotalDiscountPercent: 30,
    firstOrderCoinPercent: 100, // New field
    subsequentOrderCoinPercent: 1 // New field
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setFetchLoading(true);
      const { data } = await axios.get("http://localhost:5000/api/users/referral-config");
      if (data.success && data.config) {
        setSettings(data.config);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage("Error loading settings");
    } finally {
      setFetchLoading(false);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.put("http://localhost:5000/api/users/referral-config", settings);
      
      if (response.data.success) {
        setMessage("Settings Updated Successfully ✅");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(response.data.message || "Error updating settings");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error updating settings";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const totalPercent = settings.userDiscountPercent + settings.referrerCommissionPercent;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <div className="w-full mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <h1 className="text-2xl font-bold text-white">Referral Commission Settings</h1>
              <p className="text-blue-100 mt-1">
                Configure referral program percentages - These settings will apply to all new orders
              </p>
            </div>

            <div className="p-6">
              {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                  message.includes("Error") || message.includes("Error") 
                    ? "bg-red-50 text-red-700 border border-red-200" 
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}>
                  {message}
                </div>
              )}

              {fetchLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading settings...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Existing Discount Settings */}
                    {/* <div className="setting-card bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        User Discount %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        value={settings.userDiscountPercent}
                        onChange={(e) => setSettings({ ...settings, userDiscountPercent: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Discount given to referred users on their first order
                      </p>
                      <p className="text-sm text-blue-600 font-medium mt-1">
                        Example: ₹1000 order → ₹{1000 * settings.userDiscountPercent / 100} discount
                      </p>
                    </div>

                    <div className="setting-card bg-green-50 p-4 rounded-lg border border-green-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Referrer Commission %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        value={settings.referrerCommissionPercent}
                        onChange={(e) => setSettings({ ...settings, referrerCommissionPercent: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Commission earned by referrers when their referral places an order
                      </p>
                      <p className="text-sm text-green-600 font-medium mt-1">
                        Example: ₹1000 order → ₹{1000 * settings.referrerCommissionPercent / 100} commission
                      </p>
                    </div> */}

                    {/* Coin Reward Settings */}
                    <div className="setting-card bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Order Coin Reward %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={settings.firstOrderCoinPercent}
                        onChange={(e) => setSettings({ ...settings, firstOrderCoinPercent: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        % of order amount given as coins for first referral order
                      </p>
                      <p className="text-sm text-purple-600 font-medium mt-1">
                        Example: ₹1000 order → {settings.firstOrderCoinPercent}% = ₹{1000 * settings.firstOrderCoinPercent / 100} coins
                      </p>
                    </div>

                    <div className="setting-card bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subsequent Orders Coin Reward %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={settings.subsequentOrderCoinPercent}
                        onChange={(e) => setSettings({ ...settings, subsequentOrderCoinPercent: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        % of order amount given as coins for 2nd+ referral orders
                      </p>
                      <p className="text-sm text-orange-600 font-medium mt-1">
                        Example: ₹1000 order → {settings.subsequentOrderCoinPercent}% = ₹{1000 * settings.subsequentOrderCoinPercent / 100} coins
                      </p>
                    </div>

                    {/* Discount Limit Settings */}
                    {/* <div className="setting-card bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Direct Discount %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        value={settings.maxDirectDiscountPercent}
                        onChange={(e) => setSettings({ ...settings, maxDirectDiscountPercent: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Maximum discount allowed for direct referrals
                      </p>
                    </div>

                    <div className="setting-card bg-red-50 p-4 rounded-lg border border-red-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Total Discount %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        value={settings.maxTotalDiscountPercent}
                        onChange={(e) => setSettings({ ...settings, maxTotalDiscountPercent: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Maximum total discount allowed (including all types)
                      </p>
                    </div> */}
                  </div>

                  <div className={`p-4 rounded-lg mb-6 ${
                    totalPercent > 100 
                      ? "bg-red-50 border border-red-200 text-red-700" 
                      : totalPercent <= 80
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-yellow-50 border border-yellow-200 text-yellow-700"
                  }`}>
                    <h3 className="font-semibold mb-2">Commission Structure Summary</h3>
                    <p className="text-sm">
                      <strong>Total Discount %: {totalPercent}%</strong>
                      <br />
                      <strong>Coin Rewards:</strong> First Order: {settings.firstOrderCoinPercent}%, Subsequent: {settings.subsequentOrderCoinPercent}%
                      {totalPercent > 100 && (
                        <span className="block mt-1">⚠️ Total exceeds 100% - This is not sustainable</span>
                      )}
                      {totalPercent <= 80 && (
                        <span className="block mt-1">✅ Healthy margin maintained</span>
                      )}
                      {totalPercent > 80 && totalPercent <= 100 && (
                        <span className="block mt-1">⚠️ Consider reducing percentages for better margins</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <button 
                      onClick={fetchSettings}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition"
                    >
                      Reload Settings
                    </button>
                    
                    <button 
                      onClick={saveSettings} 
                      disabled={loading || totalPercent > 100}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}







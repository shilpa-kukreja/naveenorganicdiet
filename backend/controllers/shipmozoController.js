import axios from "axios";
import orderModel from "../models/orderModel.js";






export const pushOrderToShipmozo = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orderModel.findOne({ orderid: orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const product_detail = order.items.map(item => ({
      name: item.name,
      sku_number: item.productId.toString(),
      quantity: item.quantity,
      discount: "",
      hsn: "",
      unit_price: item.price,
      product_category: "Other"
    }));

    const payload = {
      order_id: order.orderid,
      order_date: new Date(order.createdAt).toISOString().split("T")[0],
      order_type: "ESSENTIALS",

      consignee_name: order.address.fullName,
      consignee_phone: Number(order.address.phone),
      consignee_alternate_phone: "", // MUST be empty or different
      consignee_email: order.address.email,

      consignee_address_line_one: order.address.address1,
      consignee_address_line_two: order.address.address2 || "",
      consignee_pin_code: Number(order.address.postalCode),
      consignee_city: order.address.city,
      consignee_state: order.address.state,

      product_detail,

      payment_type: order.payment ? "PREPAID" : "COD",
      cod_amount: order.payment ? "" : order.amount,

      weight: 500,
      length: 10,
      width: 10,
      height: 10,

      warehouse_id: process.env.SHIPMOZO_WAREHOUSE_ID
    };

    const response = await axios.post(
      "https://shipping-api.com/app/api/v1/push-order",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "public-key": process.env.SHIPMOZO_PUBLIC_KEY,
          "private-key": process.env.SHIPMOZO_PRIVATE_KEY
        }
      }
    );

    // ✅ SAVE SHIPMOZO DATA
    if (response.data.result === "1") {
      await orderModel.updateOne(
        { orderid: orderId },
        {
          shipmozo: {
            orderId: response.data.data.order_id,
            referenceId: response.data.data.refrence_id,
            awb: response.data.data.awb_number,
          }
        }
      );
    }

    return res.json({
      success: true,
      shipmozo: response.data.data
    });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: "Shipmozo push failed" });
  }
};

// export const pushOrderToShipmozo = async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     // Validate orderId
//     if (!orderId || orderId.trim() === '') {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Order ID is required" 
//       });
//     }

//     // Find order
//     const order = await orderModel.findOne({ orderid: orderId });
//     if (!order) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Order not found",
//         code: "ORDER_NOT_FOUND"
//       });
//     }

//     // Check if already pushed (optional - remove if you want to allow re-push)
//     if (order.shipmozo?.orderId) {
//       return res.status(400).json({
//         success: false,
//         message: "Order already pushed to shipping service",
//         code: "ALREADY_PUSHED",
//         data: {
//           shipmozo: order.shipmozo,
//           orderId: order.orderid
//         }
//       });
//     }

//     // Prepare product details
//     const product_detail = order.items.map(item => ({
//       name: item.name || "Product",
//       sku_number: item.productId?.toString() || item.sku || `SKU-${Date.now()}`,
//       quantity: item.quantity || 1,
//       discount: "",
//       hsn: item.hsn || "",
//       unit_price: item.price || 0,
//       product_category: item.category || "Other",
//       weight: item.weight || 0.5,
//       dimensions: item.dimensions || "10x10x10"
//     }));

//     // Calculate total weight
//     const totalWeight = order.items.reduce((sum, item) => {
//       return sum + ((item.weight || 0.5) * (item.quantity || 1));
//     }, 0) || 500;

//     // Prepare payload
//     const payload = {
//       order_id: order.orderid,
//       order_date: new Date(order.createdAt || Date.now()).toISOString().split("T")[0],
//       order_type: "ESSENTIALS",

//       consignee_name: order.address?.fullName || "Customer",
//       consignee_phone: Number(order.address?.phone) || 0,
//       consignee_alternate_phone: "", // MUST be empty or different
//       consignee_email: order.address?.email || "",

//       consignee_address_line_one: order.address?.address1 || "Address not provided",
//       consignee_address_line_two: order.address?.address2 || "",
//       consignee_pin_code: Number(order.address?.postalCode) || 0,
//       consignee_city: order.address?.city || "",
//       consignee_state: order.address?.state || "",

//       product_detail,

//       payment_type: order.payment ? "PREPAID" : "COD",
//       cod_amount: order.payment ? "" : order.amount,

//       weight: totalWeight, // Minimum 100g
//       length: 10,
//       width: 10,
//       height: 10,

//       warehouse_id: process.env.SHIPMOZO_WAREHOUSE_ID || "40025",
      
//       Additional optional fields
//       pickup_address: process.env.WAREHOUSE_PICKUP_ADDRESS || "",
//       pickup_pincode: process.env.WAREHOUSE_PICKUP_PINCODE || "",
//       pickup_city: process.env.WAREHOUSE_PICKUP_CITY || "",
//       pickup_state: process.env.WAREHOUSE_PICKUP_STATE || "",
//       is_returnable: true,
//       return_window_days: 7,
//       declared_value: order.amount || 0
//     };

//     console.log("🚀 Pushing order to Shipmozo:", {
//       orderId: payload.order_id,
//       products: product_detail.length,
//       weight: payload.weight
//     });

//     // Make API call to Shipmozo
//     const response = await axios.post(
//       "https://shipping-api.com/app/api/v1/push-order",
//       payload,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "public-key": process.env.SHIPMOZO_PUBLIC_KEY.trim(),
//           "private-key": process.env.SHIPMOZO_PRIVATE_KEY.trim(),
//         },
//         timeout: 30000 // 30 second timeout
//       }
//     );

//     console.log("✅ Shipmozo Response:", response.data);

//     // ✅ SAVE SHIPMOZO DATA COMPLETELY
//     if (response.data.result === "1") {
//       const shipmozoData = {
//         orderId: response.data.data.order_id,
//         referenceId: response.data.data.refrence_id,
//         awb: response.data.data.awb_number || `SM${Date.now()}`,
//         courier: response.data.data.courier || "Shipmozo",
//         trackingUrl: response.data.data.tracking_url || "",
//         estimatedDelivery: response.data.data.estimated_delivery || null,
//         expectedDeliveryDate: response.data.data.expected_delivery_date || null,
//         labelUrl: response.data.data.label_url || "",
//         manifestUrl: response.data.data.manifest_url || "",
//         pushedAt: new Date(),
//         apiResponse: response.data.data, // Store full response for reference
//         lastUpdated: new Date()
//       };

//       // Update order with comprehensive Shipmozo data
//       await orderModel.updateOne(
//         { orderid: orderId },
//         {
//           $set: {
//             shipmozo: shipmozoData,
//             shippingStatus: "PROCESSING",
//             shipmentStatus: "PROCESSING",
//             lastUpdated: new Date(),
            
//             // Also save tracking info for immediate access
//             trackingNumber: shipmozoData.awb,
//             courier: shipmozoData.courier
//           },
//           $push: {
//             shipmentHistory: {
//               status: "PROCESSING",
//               date: new Date(),
//               location: "Warehouse",
//               remark: "Order pushed to Shipmozo for shipping",
//               description: "Order registered with shipping partner"
//             }
//           }
//         }
//       );

//       console.log("💾 Shipmozo data saved for order:", orderId);

//       // Return success response with all saved data
//       return res.json({
//         success: true,
//         message: "Order successfully pushed to Shipmozo",
//         data: {
//           orderId: order.orderid,
//           shipmozo: shipmozoData,
//           trackingInfo: {
//             awb: shipmozoData.awb,
//             courier: shipmozoData.courier,
//             trackingUrl: shipmozoData.trackingUrl,
//             estimatedDelivery: shipmozoData.estimatedDelivery
//           },
//           timestamp: new Date()
//         }
//       });
//     } else {
//       // Handle Shipmozo API error
//       throw new Error(response.data.message || "Shipmozo push failed");
//     }

//   } catch (error) {
//     console.error("❌ Shipmozo push error:", {
//       message: error.message,
//       response: error.response?.data,
//       orderId: req.params.orderId,
//       timestamp: new Date().toISOString()
//     });

//     // Log error in database
//     try {
//       await orderModel.updateOne(
//         { orderid: req.params.orderId },
//         {
//           $push: {
//             shippingErrors: {
//               error: error.message,
//               response: error.response?.data,
//               timestamp: new Date()
//             }
//           }
//         }
//       );
//     } catch (dbError) {
//       console.error("Failed to log error in DB:", dbError);
//     }

//     const statusCode = error.response?.status || 500;
//     const errorMessage = error.response?.data?.message || 
//                         error.message || 
//                         "Shipmozo push failed";

//     res.status(statusCode).json({ 
//       success: false, 
//       message: errorMessage,
//       code: error.response?.data?.code || "SHIPMOZO_PUSH_ERROR",
//       details: process.env.NODE_ENV === 'development' ? {
//         error: error.message,
//         apiResponse: error.response?.data
//       } : undefined
//     });
//   }
// };

// export const trackShipmozoOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     // 1️⃣ Find order in DB
//     const order = await orderModel.findOne({ orderid: orderId });

//     if (!order || !order.shipmozo?.referenceId) {
//       return res.status(404).json({
//         success: false,
//         message: "Shipmozo reference ID not found"
//       });
//     }

//     // 2️⃣ Call Shipmozo Tracking API (CORRECT PARAM)
//     const response = await axios.post(
//       "https://shipping-api.com/app/api/v1/track-order",
//       {
//         reference_id: order.shipmozo.referenceId
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "public-key": process.env.SHIPMOZO_PUBLIC_KEY,
//           "private-key": process.env.SHIPMOZO_PRIVATE_KEY
//         }
//       }
//     );

//     const trackingData = response.data;

//     // 3️⃣ Update DB
//     await orderModel.updateOne(
//       { orderid: orderId },
//       {
//         shipmentStatus:
//           trackingData?.data?.current_status || "PENDING",
//         shipmentHistory:
//           trackingData?.data?.tracking || []
//       }
//     );

//     // 4️⃣ Response
//     res.json({
//       success: true,
//       tracking: trackingData.data
//     });

//   } catch (error) {
//     console.error("Shipmozo Tracking Error:",
//       error?.response?.data || error.message
//     );

//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch tracking status"
//     });
//   }
// };




//   try {
//     const { orderId } = req.params;
    
//     // Input validation
//     if (!orderId || orderId.trim() === '') {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Order ID is required" 
//       });
//     }

//     const order = await orderModel.findOne({ orderid: orderId });

//     if (!order) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Order not found",
//         code: "ORDER_NOT_FOUND"
//       });
//     }

//     // Check if already pushed to Shipmozo
//     if (order.shipmozo?.orderId && !IS_DEV) {
//       return res.status(400).json({
//         success: false,
//         message: "Order already pushed to shipping service",
//         code: "ALREADY_PUSHED"
//       });
//     }

//     const product_detail = order.items.map(item => ({
//       name: item.name,
//       sku_number: item.productId.toString(),
//       quantity: item.quantity,
//       discount: "",
//       hsn: "",
//       unit_price: item.price,
//       product_category: "Other",
//       weight: item.weight || 0.5,
//       dimensions: item.dimensions || "10x10x10"
//     }));

//     const payload = {
//       order_id: order.orderid,
//       order_date: new Date(order.createdAt).toISOString().split("T")[0],
//       order_type: "ESSENTIALS",
//       consignee_name: order.address.fullName,
//       consignee_phone: Number(order.address.phone),
//       consignee_alternate_phone: "",
//       consignee_email: order.address.email,
//       consignee_address_line_one: order.address.address1,
//       consignee_address_line_two: order.address.address2 || "",
//       consignee_pin_code: Number(order.address.postalCode),
//       consignee_city: order.address.city,
//       consignee_state: order.address.state,
//       product_detail,
//       payment_type: order.payment ? "PREPAID" : "COD",
//       cod_amount: order.payment ? "" : order.amount,
//       weight: order.totalWeight || 500,
//       length: 10,
//       width: 10,
//       height: 10,
//       warehouse_id: process.env.SHIPMOZO_WAREHOUSE_ID,
//       pickup_address: process.env.WAREHOUSE_PICKUP_ADDRESS || "",
//       pickup_pincode: process.env.WAREHOUSE_PICKUP_PINCODE || "",
//       pickup_city: process.env.WAREHOUSE_PICKUP_CITY || "",
//       pickup_state: process.env.WAREHOUSE_PICKUP_STATE || "",
//       is_returnable: true,
//       return_window_days: 7
//     };

//     // DEV Mode → Skip real API
//     if (IS_DEV) {
//       console.log("⚡ DEV Mode → Mock Shipmozo push", { orderId: payload.order_id });
      
//       const mockResponse = {
//         result: "1",
//         data: {
//           order_id: "DEV" + Date.now(),
//           refrence_id: order.orderid,
//           awb_number: "DEV" + Math.random().toString(36).substr(2, 9).toUpperCase(),
//           message: "Order successfully pushed to shipping",
//           estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
//         }
//       };

//       await orderModel.updateOne(
//         { orderid: orderId },
//         { 
//           shipmozo: { 
//             orderId: mockResponse.data.order_id, 
//             referenceId: order.orderid,
//             awb: mockResponse.data.awb_number,
//             pushedAt: new Date(),
//             estimatedDelivery: mockResponse.data.estimated_delivery
//           },
//           shippingStatus: "PROCESSING"
//         }
//       );
      
//       return res.json({ 
//         success: true, 
//         message: "Order pushed successfully (DEV MODE)",
//         data: mockResponse.data 
//       });
//     }

//     // PRODUCTION: Make actual API call
//     const response = await axios.post(
//       `${process.env.SHIPMOZO_BASE_URL || "https://shipping-api.com"}/app/api/v1/push-order`,
//       payload,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "public-key": process.env.SHIPMOZO_PUBLIC_KEY.trim(),
//           "private-key": process.env.SHIPMOZO_PRIVATE_KEY.trim(),
//           "x-api-version": "1.0"
//         },
//         timeout: 30000 // 30 second timeout
//       }
//     );

//     if (response.data.result === "1") {
//       await orderModel.updateOne(
//         { orderid: orderId },
//         {
//           shipmozo: {
//             orderId: response.data.data.order_id,
//             referenceId: response.data.data.refrence_id,
//             awb: response.data.data.awb_number,
//             pushedAt: new Date(),
//             estimatedDelivery: response.data.data.estimated_delivery,
//             courierName: response.data.data.courier_name
//           },
//           shippingStatus: "PROCESSING"
//         }
//       );
      
//       // Clear tracking cache for this order
//       trackingCache.delete(orderId);
//     }

//     res.json({ 
//       success: true, 
//       message: "Order pushed successfully",
//       data: response.data.data 
//     });
//   } catch (err) {
//     console.error("❌ Shipmozo push error:", {
//       message: err.message,
//       response: err.response?.data,
//       orderId: req.params.orderId
//     });
    
//     const statusCode = err.response?.status || 500;
//     const errorMessage = err.response?.data?.message || "Shipmozo push failed";
    
//     res.status(statusCode).json({ 
//       success: false, 
//       message: errorMessage,
//       code: err.response?.data?.code || "SHIPMOZO_PUSH_ERROR",
//       details: IS_DEV ? err.message : undefined
//     });
//   }
// };



export const trackShipmozoOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // 1️⃣ Find order in DB
    const order = await orderModel.findOne({ orderid: orderId });

    if (!order || !order.shipmozo?.awb) {
      return res.status(404).json({
        success: false,
        message: "Shipping not initiated or AWB not generated"
      });
    }

    // 2️⃣ Call Shipmozo Tracking API with correct parameters
    const response = await axios.get(
      "https://shipping-api.com/app/api/v1/track-order",
      {
        params: {
          awb_number: order.shipmozo.awb,
          order_id: order.shipmozo.orderId || orderId
        },
        headers: {
          "Content-Type": "application/json",
          "public-key": process.env.SHIPMOZO_PUBLIC_KEY,
          "private-key": process.env.SHIPMOZO_PRIVATE_KEY
        }
      }
    );

    const trackingData = response.data;

    // 3️⃣ Update DB with proper status mapping
    let mappedStatus = "PENDING";
    const shipmozoStatus = trackingData?.data?.current_status?.toLowerCase() || "";
    
    // Map Shipmozo statuses to your system
    const statusMap = {
      'pickup pending': 'PROCESSING',
      'picked up': 'PICKED_UP',
      'in transit': 'IN_TRANSIT',
      'out for delivery': 'OUT_FOR_DELIVERY',
      'delivered': 'DELIVERED',
      'undelivered': 'UNDELIVERED',
      'returned': 'RETURNED'
    };

    if (shipmozoStatus in statusMap) {
      mappedStatus = statusMap[shipmozoStatus];
    }

    // 4️⃣ Format scan details properly
    const scanHistory = (trackingData?.data?.scan_detail || []).map(scan => ({
      status: scan.status,
      date: scan.date || new Date().toISOString(),
      location: scan.location || "",
      remark: scan.remarks || "",
      description: scan.description || `Package ${scan.status}`
    }));

    // 5️⃣ Update order
    await orderModel.updateOne(
      { orderid: orderId },
      {
        shipmentStatus: mappedStatus,
        shipmentHistory: scanHistory,
        "shipmozo.lastUpdated": new Date(),
        "shipmozo.currentStatus": trackingData?.data?.current_status,
        "shipmozo.expectedDelivery": trackingData?.data?.expected_delivery_date
      }
    );

    // 6️⃣ Format response for frontend
    const formattedResponse = {
      success: true,
      tracking: {
        awb_number: trackingData.data?.awb_number || order.shipmozo.awb,
        order_id: trackingData.data?.order_id || orderId,
        reference_id: trackingData.data?.reference_id || order.shipmozo.referenceId,
        courier: trackingData.data?.courier || "Shipmozo",
        expected_delivery_date: trackingData.data?.expected_delivery_date || null,
        current_status: trackingData.data?.current_status || "Pending",
        scan_detail: scanHistory,
        // Add UI-friendly fields
        status: mappedStatus.toLowerCase(),
        statusLabel: mappedStatus.replace('_', ' '),
        progress: calculateProgressFromStatus(mappedStatus)
      }
    };

    res.json(formattedResponse);

  } catch (error) {
    console.error("Shipmozo Tracking Error:", {
      message: error.message,
      response: error.response?.data,
      orderId
    });

    // Try to return cached data if API fails
    const order = await orderModel.findOne({ orderid: orderId });
    if (order && order.shipmentHistory?.length > 0) {
      return res.json({
        success: true,
        cached: true,
        tracking: {
          awb_number: order.shipmozo?.awb || "",
          order_id: orderId,
          current_status: order.shipmentStatus || "PENDING",
          scan_detail: order.shipmentHistory || [],
          status: (order.shipmentStatus || "PENDING").toLowerCase(),
          statusLabel: (order.shipmentStatus || "PENDING").replace('_', ' '),
          message: "Using cached data - API temporarily unavailable"
        }
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch tracking status",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function
const calculateProgressFromStatus = (status) => {
  const statusProgress = {
    'PROCESSING': 20,
    'PICKED_UP': 40,
    'IN_TRANSIT': 60,
    'OUT_FOR_DELIVERY': 80,
    'DELIVERED': 100,
    'UNDELIVERED': 100,
    'RETURNED': 100,
    'PENDING': 10
  };
  return statusProgress[status] || 0;
};
export const trackMultipleOrders = async (req, res) => {
  try {
    const { orderIds } = req.body;
    
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order IDs array is required",
        code: "INVALID_INPUT"
      });
    }

    if (orderIds.length > 20) {
      return res.status(400).json({
        success: false,
        message: "Maximum 20 orders per request",
        code: "TOO_MANY_ORDERS"
      });
    }

    console.log(`📍 Batch tracking ${orderIds.length} orders`);

    const trackingResults = [];
    
    // Fetch all orders first
    const orders = await orderModel.find({ orderid: { $in: orderIds } });
    
    for (const orderId of orderIds) {
      try {
        const order = orders.find(o => o.orderid === orderId);
        
        if (!order) {
          trackingResults.push({
            orderId,
            success: false,
            error: "Order not found"
          });
          continue;
        }

        if (!order.shipmozo?.awb) {
          trackingResults.push({
            orderId,
            success: false,
            error: "Shipping not initiated"
          });
          continue;
        }

        // Check cache first
        const cacheKey = `track_${orderId}`;
        const cachedData = trackingCache.get(cacheKey);
        
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL)) {
          trackingResults.push({
            orderId,
            success: true,
            tracking: cachedData.data,
            cached: true
          });
        } else {
          // Call Shipmozo API for real-time tracking
          try {
            const shipmozoBaseURL = process.env.SHIPMOZO_BASE_URL || "https://api.shipmozo.com";
            const publicKey = process.env.SHIPMOZO_PUBLIC_KEY?.trim();
            const privateKey = process.env.SHIPMOZO_PRIVATE_KEY?.trim();

            const response = await axios.get(
              `${shipmozoBaseURL}/app/api/v1/track-order`,
              {
                params: { 
                  awb_number: order.shipmozo.awb,
                  order_id: order.shipmozo.orderId || order.orderid
                },
                headers: {
                  "public-key": publicKey,
                  "private-key": privateKey,
                  "x-api-version": "1.0"
                },
                timeout: 10000
              }
            );

            const trackingData = response.data.data || response.data;
            
            // Cache the response
            trackingCache.set(cacheKey, {
              data: trackingData,
              timestamp: Date.now()
            });

            trackingResults.push({
              orderId,
              success: true,
              tracking: trackingData,
              cached: false
            });
          } catch (apiError) {
            console.error(`❌ Tracking error for order ${orderId}:`, apiError.message);
            trackingResults.push({
              orderId,
              success: false,
              error: "Failed to fetch tracking info",
              awb: order.shipmozo.awb
            });
          }
        }
      } catch (error) {
        console.error(`❌ Error processing order ${orderId}:`, error.message);
        trackingResults.push({
          orderId,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      results: trackingResults,
      count: trackingResults.length,
      environment: IS_DEV ? "DEV" : "PROD"
    });
  } catch (err) {
    console.error("🚨 Multiple orders tracking error:", err);
    res.status(500).json({
      success: false,
      message: "Batch tracking failed",
      code: "BATCH_TRACKING_ERROR",
      environment: IS_DEV ? "DEV" : "PROD"
    });
  }
};
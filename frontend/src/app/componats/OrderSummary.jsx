"use client";
import React, { useContext, useState, useEffect, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import {
  FiChevronDown,
  FiPlus,
  FiX,
  FiUser,
  FiPhone,
  FiHome,
  FiBriefcase,
  FiCreditCard,
  FiDollarSign,
  FiCheck,
  FiMapPin,
  FiTruck,
  FiInfo,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { MdOutlineEmail, MdLocationOn } from "react-icons/md";
import { useRouter } from "next/navigation";
import axios from "axios";
import { IoWalletOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { FiChevronUp, FiTag } from "react-icons/fi"; // Add these icons
import PaymentLoader from "./PaymentLoader";

let razorpayScriptPromise = null;
function loadRazorpayScript() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
  return razorpayScriptPromise;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const OrderSummary = ({ subtotal = 0 }) => {
  const router = useRouter();
  const { cartItems = [], clearCart = () => { }, user = null } = useContext(AppContext) || {};

  // Checkout UI state
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState("address"); // address | add-address | payment
  const [paymentMethod, setPaymentMethod] = useState("cod"); // 'cod' or 'online'
  const [editAddressId, setEditAddressId] = useState(null);
  const [isCouponDrawerOpen, setIsCouponDrawerOpen] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [useWalletCoins, setUseWalletCoins] = useState(false);
  const [walletDiscount, setWalletDiscount] = useState(0);
  const [walletCoins, setWalletCoins] = useState(0);
  const [walletError, setWalletError] = useState("");

  console.log("cartItems", cartItems);


  // Addresses
  const [userAddresses, setUserAddresses] = useState([]);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  // New address form state
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    addressType: "Home",
  });

  // Coupon & discount
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [discount, setDiscount] = useState(0);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [coupons, setCoupons] = useState([]); // list of available coupons
  const [loading, setLoading] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);



  // submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // computed values
  // Calculate totals
  const taxAmount = Math.floor(subtotal * 0.02);
  const grossTotal = subtotal + taxAmount;

  // Calculate final total AFTER wallet discount
  const totalBeforeWallet = grossTotal - (Number(discount) || 0);
  const total = Math.max(0, totalBeforeWallet - walletDiscount);

  useEffect(() => {
    try {
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (storedToken) {
        const decoded = jwtDecode(storedToken);
        const uid = decoded?._id || decoded?.id || null;
        setToken(storedToken);
        setUserId(uid);
      }
    } catch (err) {
      console.error("Invalid token", err);
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      setToken(null);
      setUserId(null);
    }
  }, []);

  // Add this function to handle coupon selection
  const handleCouponSelect = (coupon) => {
    setCouponCode(coupon.couponCode);
    setDiscount(coupon.discountValue);
    setIsCouponDrawerOpen(false);
    handleApplyCoupon(coupon.couponCode);
    toast.success(`Coupon applied: ₹${coupon.discountValue} off`);
  };

  // useEffect - fetch addresses when component mounts
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    axios
      .get(`${API_BASE}/api/users/getaddress`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        const addresses = res?.data?.address || res?.data?.user?.address || [];
        setUserAddresses(addresses);
        if (!addresses.length) {
          setIsFirstTimeUser(true);
          setCheckoutStep("add-address");
        } else {
          setIsFirstTimeUser(false);
        }
      })
      .catch((err) => {
        console.warn("Get address error:", err?.response?.data || err?.message);
        // assume first time user if fetch fails
        setIsFirstTimeUser(true);
        setUserAddresses([]);
        setCheckoutStep("add-address");
      });
  }, []);



  // Fetch wallet coins on component mount
  useEffect(() => {
    const fetchWalletCoins = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/api/users/wallet`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.data.success) {
          setWalletCoins(res.data.walletCoins || 0);
        }
      } catch (error) {
        console.error("Error fetching wallet coins:", error);
      }
    };

    if (token) fetchWalletCoins();
  }, [token]);

  // Handle checkbox change
  const handleWalletCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setUseWalletCoins(isChecked);
    setWalletError("");

    if (isChecked) {
      // Checkbox checked - now validate and calculate
      if (walletCoins <= 0) {
        setWalletError("You don't have any coins in your wallet");
        setWalletDiscount(0);
        return;
      }

      // Calculate 10% of order total
      const tenPercentOfOrder = Math.floor(subtotal * 0.1);

      // Calculate 10% of available coins
      const tenPercentOfCoins = Math.floor(walletCoins * 0.1);

      // Get minimum of both
      const calculatedDiscount = Math.min(tenPercentOfOrder, tenPercentOfCoins);

      // Check if user has enough coins for this discount
      if (calculatedDiscount <= walletCoins) {
        setWalletDiscount(calculatedDiscount);
        toast.success(`₹${calculatedDiscount} wallet discount applied!`);
      } else {
        setWalletError(`Insufficient coins. You need at least ${calculatedDiscount} coins`);
        setUseWalletCoins(false);
        setWalletDiscount(0);
      }
    } else {
      // Checkbox unchecked
      setWalletDiscount(0);
    }
  };
  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };


  const deleteAddress = async (addressId) => {
    if (!addressId) return;
    const token = localStorage.getItem("token");

    try {
      const res = await axios.delete(`${API_BASE}/api/users/deleteaddress/${addressId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res?.data?.success) {
        const updatedAddresses = res?.data?.address || [];
        setUserAddresses(updatedAddresses);

        if (selectedAddress?._id === addressId) {
          setSelectedAddress(updatedAddresses[0] || null);
        }

        toast.success("Address deleted successfully");

        if (!updatedAddresses.length) {
          setIsFirstTimeUser(true);
          setCheckoutStep("add-address");
        }
      } else {
        throw new Error(res?.data?.message || "Failed to delete address");
      }
    } catch (err) {
      console.error("Delete address error:", {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      });
      toast.error(err?.response?.data?.message || "Failed to delete address");
    }
  };






  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const payload = {
      fullName: newAddress.fullName,
      email: newAddress.email,
      phone: newAddress.phoneNumber,
      address1: newAddress.addressLine1,
      address2: newAddress.addressLine2,
      addresstype: newAddress.addressType,
      city: newAddress.city,
      state: newAddress.state,
      postalCode: newAddress.pincode,
      landmark: newAddress.landmark,
    };

    try {
      const res = editAddressId
        ? await axios.put(`${API_BASE}/api/users/editaddress/${editAddressId}`, payload, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        : await axios.post(`${API_BASE}/api/users/addaddress`, payload, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

      if (res?.data?.success) {
        const updatedAddresses = res?.data?.user?.address || res?.data?.address || [];
        setUserAddresses(updatedAddresses);
        setSelectedAddress(updatedAddresses[updatedAddresses.length - 1]);
        toast.success(editAddressId ? "Address updated successfully!" : "Address added successfully!");
        setCheckoutStep("address");
        setIsFirstTimeUser(false);
        setNewAddress({ fullName: "", email: "", phoneNumber: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "", landmark: "", addressType: "Home" });
        setEditAddressId(null);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save address");
    }
  };


  const handleCheckout = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login?from=checkout");
      return;
    }
    setIsCheckoutModalOpen(true);
    // ensure correct step
    if (!userAddresses.length) setCheckoutStep("add-address");
    else setCheckoutStep("address");
  };

  const handleApplyCoupon = async (coupon) => {
    setCouponError("");
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/api/coupon/apply`, {
        couponCode: couponCode.trim(),
        totalAmount: subtotal,
      });
      if (res?.data?.success) {
        const amt = Number(res.data.discount) || 0;
        setDiscount(amt);
        setCouponError("");
        toast.success(`Coupon applied: ₹${amt} off`);
      } else {
        setDiscount(0);
        setCouponError(res?.data?.message || "Invalid coupon");
      }
    } catch (err) {
      console.error("Coupon error details:", err?.response?.data || err?.message);
      setDiscount(0);
      setCouponError(err?.response?.data?.message || "Error validating coupon");
    }
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/api/coupon/active`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      console.log("API Response:", data);


      // normalize response to an array
      let coupons = [];
      if (Array.isArray(data.coupons)) {
        coupons = data.coupons;
      } else if (data.coupon) {
        coupons = [data.coupon];
      } else if (data.coupons && typeof data.coupons === "object") {
        // fallback if backend accidentally returned an object
        coupons = [data.coupons];
      } else {
        coupons = [];
      }

      setCoupons(coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  console.log("Available coupons:", coupons);





  useEffect(() => {
    if (token) {
      fetchCoupons();
    }
  }, [token]);

  console.log("Available coupons:", coupons);


  const pushOrderToShipmozo = async (orderId) => {
    try {
      console.log("📦 Calling Shipmozo API with orderId:", orderId);
      console.log("🌐 API Base URL:", API_BASE);

      const res = await axios.post(
        `${API_BASE}/api/shipmozo/push-order/${orderId}`, // ✅ FIXED URL
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 10000
        }
      );

      console.log("✅ Shipmozo API Response:", res.data);
      return res.data;

    } catch (error) {
      console.error("❌ Shipmozo API Error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });

      // ❗IMPORTANT: throw so caller knows it failed
      throw new Error(
        error.response?.data?.message || "Shipmozo order push failed"
      );
    }
  };

  console.log("pushOrderToShipmozo function:", pushOrderToShipmozo);







  const handleRazorpay = useCallback(
    async (orderPayload) => {
      const ready = await loadRazorpayScript();
      if (!ready || typeof window === "undefined" || !window.Razorpay) {
        toast.error("Unable to load Razorpay checkout. Try again.");
        return;
      }
      try {
        setLoadingPayment(true); // 🚀 Start loader

        const res = await axios.post(`${API_BASE}/api/order/razorpay`, orderPayload, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        console.log("Razorpay backend response:", res.data);
        if (!res?.data?.success || !res?.data?.order?.id) {
          console.error("Failed to create Razorpay order:", res?.data);
          toast.error("Failed to create Razorpay order. Try again.");
          setLoadingPayment(false);
          return;
        }

        const order = res.data.order;
        const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (!key) {
          console.error("Missing NEXT_PUBLIC_RAZORPAY_KEY_ID");
          toast.error("Payment configuration error");
          setLoadingPayment(false);
          return;
        }

        const options = {
          key,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "Organic Diet",
          description: "Order Payment",
          order_id: order.id,
          // Update the handler function in your frontend code
          // handler: async (response) => {
          //   try {
          //     const verifyRes = await axios.post(`${API_BASE}/api/order/verify`, {
          //       ...response,
          //       orderId: order.id,
          //     }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });

          //     console.log("Verification response:", verifyRes.data);

          //     if (verifyRes?.data?.success) {

          //       router.push(`/order-success/${order.id}`);
          //       clearCart();
          //     } else {
          //       toast.error(verifyRes?.data?.message || "Payment verification failed!");
          //       setLoadingPayment(false); // ❌ stop loader

          //       // Show more detailed error if available
          //       if (verifyRes.data.paymentStatus) {
          //         toast.error(`Payment status: ${verifyRes.data.paymentStatus}`);
          //       }
          //     }
          //   } catch (e) {
          //     console.error("Verification error:", e);
          //     toast.error(e.response?.data?.message || "Payment verification error. Contact support.");
          //     setLoadingPayment(false);
          //   }
          // },
          handler: async (response) => {
            try {
              const verifyRes = await axios.post(
                `${API_BASE}/api/order/verify`,
                {
                  ...response,
                  orderId: order.id, // razorpay order id
                },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
              );

              if (verifyRes?.data?.success) {
                const dbOrderId = verifyRes.data.order.orderid; // ✅ WEBSITE ORDER ID

                await pushOrderToShipmozo(dbOrderId); // ✅ ACTUALLY CALL IT

                toast.success("Payment successful!");
                router.push(`/order-success/${dbOrderId}`);
                clearCart();
              } else {
                toast.error("Payment verification failed");
                setLoadingPayment(false);
              }
            } catch (err) {
              console.error(err);
              toast.error("Payment verification error");
              setLoadingPayment(false);
            }
          },

          prefill: {
            name: selectedAddress?.fullName || user?.name || "",
            email: selectedAddress?.email || user?.email || "",
            contact: selectedAddress?.phone || "",
          },
          theme: { color: "#00a63d" },
          modal: {
            ondismiss: function () {
              toast("Payment cancelled.");
              setLoadingPayment(false);
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (error) {
        console.error("Razorpay error:", error?.response?.data || error?.message);
        toast.error("Error processing payment. Try again.");
        setLoadingPayment(false);
      }
    },
    [selectedAddress, user, clearCart, router]
  );




  // Validate before placing order
  const validateBeforePlace = () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address.");
      return false;
    }
    if (!cartItems.length) {
      toast.error("Your cart is empty.");
      return false;
    }
    return true;
  };

  // Place order - handles COD and online
  const handlePlaceOrder = async () => {
    if (!validateBeforePlace()) return;
    setIsSubmitting(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;


    const orderPayload = {
      userId: userId || user?._id || null,
      items: cartItems.map((item) => ({
        productId: item._id || item.id,
        name: item.name,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        pack: item.pack || "",
        image: item.image || "/default-product-image.jpg",
      })),
      amount: subtotal, // Original amount before any discount
      address: {
        fullName: selectedAddress.fullName,
        email: selectedAddress.email,
        phone: selectedAddress.phone,
        address1: selectedAddress.address1,
        address2: selectedAddress.address2,
        city: selectedAddress.city,
        state: selectedAddress.state,
        postalCode: selectedAddress.postalCode,
        landmark: selectedAddress.landmark,
        addresstype: selectedAddress.addresstype,
      },
      couponCode: couponCode.trim() || "",
      discount: Number(discount) || 0,
      useWalletCoins: useWalletCoins, // Send checkbox status
      walletDiscount: walletDiscount, // Send calculated discount
      paymentMethod: paymentMethod === "cod" ? "COD" : "RAZORPAY",
    };


    try {
      // if (paymentMethod === "cod") {
      //   const res = await axios.post(`${API_BASE}/api/order/cod`, orderPayload, {
      //     headers: token ? { Authorization: `Bearer ${token}` } : {},
      //   });
      //   if (res?.data?.success) {

      //     const orderId =
      //       res?.data?.order?._id ||
      //       res?.data?.order?.id ||
      //       res?.data?.orderId ||
      //       res?.data?.orderid;
      //     if (orderId) {
      //       toast.success("Order placed successfully!");
      //       router.push(`/order-success/${orderId}`);
      //       clearCart();
      //     } else {
      //       // fallback if backend doesn't return id consistently
      //       toast.success("Order placed successfully!");
      //       router.push(`/order-confirmation`);
      //     }
      //   } else {
      //     throw new Error(res?.data?.message || "Failed to place order");
      //   }
      // } 
      if (paymentMethod === "cod") {
        const res = await axios.post(
          `${API_BASE}/api/order/cod`,
          orderPayload,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );

        if (res?.data?.success) {

          const dbOrderId = res.data.orderid; // ✅ WEBSITE ORDER ID


          if (!dbOrderId) {
            console.error("Invalid COD response:", res.data);
            toast.error("Order placed but order ID missing");
            return;
          }

          try {
            await pushOrderToShipmozo(dbOrderId);
          } catch (err) {
            toast.error("Order placed but shipping failed. Contact support.");
          }



          toast.success("Order placed successfully!");
          router.push(`/order-success/${dbOrderId}`);
          clearCart();
        } else {
          throw new Error("Order failed");
        }
      }

      else {
        // online payment -> create razorpay order via backend and open checkout
        await handleRazorpay(orderPayload);
      }
    } catch (err) {
      console.error("Order error:", err?.response?.data || err?.message);
      toast.error(err?.response?.data?.message || "Something went wrong. Try again!");
    } finally {
      setIsSubmitting(false);
      setIsCheckoutModalOpen(false);
    }
  };

  const getAddressIcon = (type) => {
    switch (type) {
      case "Home":
        return <FiHome className="text-blue-500" />;
      case "Work":
        return <FiBriefcase className="text-green-500" />;
      default:
        return <MdLocationOn className="text-purple-500" />;
    }
  };

  const getAddressTypeText = (type) => {
    switch (type) {
      case "Home":
        return "Home";
      case "Work":
        return "Work";
      default:
        return "Other";
    }
  };

  // Step indicator component
  const StepIndicator = () => (
    <div className=" justify-center mb-2 hidden">
      <div className="flex items-center">
        <div
          className={`flex flex-col items-center ${checkoutStep === "address" || checkoutStep === "add-address" ? "text-blue-600" : "text-gray-400"
            }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${checkoutStep === "address" || checkoutStep === "add-address" ? "bg-blue-100 border-2 border-blue-600" : "bg-gray-100"
              }`}
          >
            {checkoutStep === "payment" ? <FiCheck className="w-4 h-4 " /> : <FiMapPin className="w-4 h-4" />}
          </div>
          <span className="text-xs mt-1 font-medium">Address</span>
        </div>
        <div className={`w-8 h-1  mx-2 ${checkoutStep === "payment" ? "bg-blue-600" : "bg-gray-300"}`}></div>
        <div className={`flex flex-col  items-center ${checkoutStep === "payment" ? "text-blue-600" : "text-gray-400"}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${checkoutStep === "payment" ? "bg-blue-100 border-2 border-blue-600" : "bg-gray-100"}`}>
            <FiCreditCard className="w-4 h-4" />
          </div>
          <span className="text-xs mt-1 font-medium">Payment</span>
        </div>
      </div>
    </div>
  );

  return (

    <>
      {loadingPayment && <PaymentLoader />}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-6 border border-[#00a63d]">
        <div className="p-6 ">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-3 border-b">Order Summary</h2>

          <div className="space-y-3 mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
              <span className="font-medium">₹{subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (2%)</span>
              <span className="font-medium">₹{taxAmount.toLocaleString()}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-700">
                <span className="text-gray-600">Coupon Discount</span>
                <span className="font-medium">-₹{Number(discount).toLocaleString()}</span>
              </div>
            )}

            {/* ✅ Wallet Discount Row */}
            {useWalletCoins && walletDiscount > 0 && (
              <div className="flex justify-between text-sm text-amber-700">
                <div className="flex items-center gap-1">
                  <IoWalletOutline className="text-sm" />
                  <span className="text-gray-600">Wallet Coins Discount</span>
                </div>
                <span className="font-medium">-₹{walletDiscount.toLocaleString()}</span>
              </div>
            )}

            <div className="border-t border-gray-200 pt-3 mt-2 flex justify-between text-base font-semibold">
              <span>Total Amount</span>
              <span className="text-[#00a63d]">₹{total.toLocaleString()}</span>
            </div>

            {/* Wallet Info Summary */}
            {useWalletCoins && walletDiscount > 0 && (
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <div className="flex justify-between">
                  <span>Coins to be used:</span>
                  <span className="font-medium">{walletDiscount} coins</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Remaining coins after order:</span>
                  <span className="font-medium">{walletCoins - walletDiscount} coins</span>
                </div>
              </div>
            )}
          </div>

          <motion.button whileHover={{ scale: 1.00 }} whileTap={{ scale: 0.98 }} onClick={handleCheckout} className="w-full py-3 bg-[#00a63d] hover:bg-[#00a63d] text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md">
            <FiCreditCard className="text-sm" />
            Proceed to Checkout
          </motion.button>

          {/* <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
            <FiTruck className="mr-1" />
            <span>Free delivery on orders above ₹499</span>
          </div> */}
        </div>
      </motion.div>

      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center shadow-lg bg-black/40 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 ">
              <h2 className="text-xl font-semibold text-gray-800">{checkoutStep === "address" ? "Select Delivery Address" : checkoutStep === "add-address" ? "Add Delivery Address" : "Payment Method"}</h2>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="px-4 pt-3 flex-1 bg-gray-100  flex flex-col overflow-y-scroll scrollbar-hide">
              <StepIndicator />


              <div className="flex-1 overflow-y-auto  scrollbar-hide pr-2">
                {checkoutStep === "address" ? (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {userAddresses.length ? (
                          userAddresses.map((address) => (
                            <motion.div key={address._id || `${address.postalCode}-${address.phone}`} whileHover={{ scale: 1.00 }} className={`p-4 bg-white border rounded-lg cursor-pointer transition-all ${selectedAddress?._id === address._id ? "border-[#00a63d] bg-blue-50" : "border-gray-200 hover:border-blue-300"}`} onClick={() => setSelectedAddress(address)}>
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className={`p-1.5 rounded-full ${selectedAddress?._id === address._id ? "bg-blue-100" : "bg-gray-100"}`}>{getAddressIcon(address.addresstype)}</div>
                                  <span className="font-medium text-gray-800 text-sm capitalize">{getAddressTypeText(address.addresstype)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div>
                                    {selectedAddress?._id === address._id && (
                                      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={(e) => { e.stopPropagation(); setCheckoutStep("payment"); }} className="text-white bg-[#00a63d] hover:bg-[#00a63d] px-3 py-1.5 rounded text-xs font-medium transition-colors">
                                        Deliver Here
                                      </motion.button>
                                    )}
                                  </div>
                                  <div>
                                    {selectedAddress?._id === address._id && (
                                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white bg-green-400 hover:bg-green-700 px-3 py-1.5 rounded text-xs font-medium transition-colors">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setCheckoutStep("add-address");
                                            setEditAddressId(address._id);
                                            setNewAddress({
                                              fullName: address.fullName,
                                              email: address.email,
                                              phoneNumber: address.phone,
                                              addressLine1: address.address1,
                                              addressLine2: address.address2,
                                              city: address.city,
                                              state: address.state,
                                              pincode: address.postalCode,
                                              landmark: address.landmark,
                                              addressType: address.addresstype || "Home",
                                            });
                                          }}
                                          className="hover:text-white transition-colors"
                                        >
                                          Edit
                                        </button>

                                      </motion.div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex relative justify-between items-start">
                                <div className="text-gray-700 text-xs">
                                  <div className="font-medium">{address.fullName}</div>
                                  <div className="mt-1">{address.address1}{address.address2 ? `, ${address.address2}` : ""}</div>
                                  <div>{address.city}, {address.state} - {address.postalCode}</div>
                                  <div className="mt-2 flex items-center">
                                    <FiPhone className="mr-1.5 text-gray-500 text-xs" />
                                    {address.phone}
                                  </div>
                                  {address.landmark && (
                                    <div className="mt-1 flex items-center">
                                      <FiMapPin className="mr-1.5 text-gray-500 text-xs" />
                                      Landmark: {address.landmark}
                                    </div>
                                  )}
                                </div>
                                <div className=" absolute bottom-0 right-0">
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center"
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteAddress(address._id);
                                      }}
                                      className="text-red-500 px-3 py-1.5 rounded-md text-xs border border-gray-400 font-medium transition-colors flex items-center gap-1 shadow-md"
                                    >
                                      <FiX className="text-sm" /> Delete
                                    </button>
                                  </motion.div>
                                </div>

                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center text-sm text-gray-500">No saved addresses. Please add one.</div>
                        )}
                      </div>


                    </div>



                  </>

                ) : checkoutStep === "add-address" ? (
                  <motion.form initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} onSubmit={handleSaveAddress} className="space-y-4">
                    {isFirstTimeUser && (
                      <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2 mb-2">
                        <FiInfo className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-blue-700 text-xs">Please add your delivery address to continue with your order.</p>
                      </div>
                    )}

                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Add Delivery Address</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <FiUser className="absolute left-3 top-9 text-gray-400 text-sm" />
                        <input type="text" name="fullName" value={newAddress.fullName} onChange={handleNewAddressChange} placeholder="Full Name" required className="pl-10 block bg-white w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" />
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <MdOutlineEmail className="absolute left-3 top-9 text-gray-400 text-sm" />
                        <input type="email" name="email" value={newAddress.email} onChange={handleNewAddressChange} placeholder="Email" required className="pl-10 block w-full bg-white  border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" />
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <FiPhone className="absolute left-3 top-9 text-gray-400 text-sm" />
                        <input type="tel" name="phoneNumber" value={newAddress.phoneNumber} onChange={handleNewAddressChange} placeholder="Phone Number" required maxLength={10} className="pl-10 block bg-white  w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" />
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                        <select name="addressType" value={newAddress.addressType} onChange={handleNewAddressChange} className="pl-10 block bg-white  w-full border border-gray-300 rounded-lg py-2.5 px-3 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm">
                          <option value="Home">Home</option>
                          <option value="Work">Work</option>
                          <option value="Other">Other</option>
                        </select>
                        <FiHome className="absolute left-3 top-9 text-gray-400 text-sm" />
                        <FiChevronDown className="absolute right-3 top-9 text-gray-400 pointer-events-none text-sm" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                        <input type="text" name="addressLine1" value={newAddress.addressLine1} onChange={handleNewAddressChange} placeholder="Address Line 1" required className="block w-full bg-white  border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                        <input type="text" name="addressLine2" value={newAddress.addressLine2} onChange={handleNewAddressChange} placeholder="Address Line 2" className="block w-full bg-white   border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input type="text" name="city" value={newAddress.city} onChange={handleNewAddressChange} placeholder="City" required className="block w-full border bg-white  border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                        <input type="text" name="state" value={newAddress.state} onChange={handleNewAddressChange} placeholder="State" required className="block w-full bg-white  border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                        <input type="text" name="pincode" value={newAddress.pincode} onChange={handleNewAddressChange} placeholder="Pincode" required maxLength={6} className="block w-full bg-white  border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                        <input type="text" name="landmark" value={newAddress.landmark} onChange={handleNewAddressChange} placeholder="Landmark" className="block w-full border bg-white  border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mb-3 pt-4">
                      {!isFirstTimeUser && (
                        <motion.button whileHover={{ scale: 1.00 }} whileTap={{ scale: 0.97 }} type="button" onClick={() => setCheckoutStep("address")} className="px-5 py-2.5 border bg-white  border-gray-300 rounded-lg text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors">
                          Cancel
                        </motion.button>
                      )}
                      <motion.button whileHover={{ scale: 1.00 }} whileTap={{ scale: 0.97 }} type="submit" className="px-5 py-2.5 bg-[#00a63d] text-white rounded-lg font-medium text-sm hover:bg-[#00a63d] transition-colors">
                        {isFirstTimeUser ? "Continue to Payment" : "Save Address"}
                      </motion.button>
                    </div>
                  </motion.form>
                ) : checkoutStep === "payment" ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} exit={{ opacity: 0 }} className="space-y-5">
                    <div className="border rounded-lg p-4 bg-white ">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800 text-sm">Delivery Address</h3>
                        <button onClick={() => setCheckoutStep("address")} className="text-blue-600 text-xs font-medium hover:text-blue-800 transition-colors">
                          Change
                        </button>
                      </div>
                      <div className="text-gray-700 text-xs">
                        <div className="font-medium">{selectedAddress?.fullName}</div>
                        <div className="mt-1">{selectedAddress?.address1}{selectedAddress?.address2 ? `, ${selectedAddress?.address2}` : ""}</div>
                        <div>{selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.postalCode}</div>
                        <div className="mt-2 flex items-center">
                          <FiPhone className="mr-1.5 text-gray-500" />
                          {selectedAddress?.phone}
                        </div>
                      </div>
                    </div>


                    <div className="mb-6">
                      <label className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        Apply Coupon Code
                      </label>
                      <div className="flex gap-0 rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-opacity-50">
                        <input
                          value={couponCode || ''} // Ensure it's always a string
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter your coupon code"
                          className="flex-1 border border-gray-300 px-4 py-3 text-gray-700 bg-white focus:ring-0 focus:outline-none placeholder-gray-400"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          className="px-6 py-3 text-sm font-semibold text-white bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-md"
                        >
                          Apply
                        </button>
                      </div>

                      {/* View All Coupons Button */}
                      <button
                        onClick={() => setIsCouponDrawerOpen(true)}
                        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                      >
                        <FiTag className="text-indigo-500" />
                        View All Available Coupons
                        <FiChevronDown className="text-gray-500" />
                      </button>

                      {/* Coupon Status Messages */}
                      {couponCode && !couponError && discount > 0 && (
                        <div className="flex items-center mt-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-xs text-green-600 font-medium">Coupon applied! You saved ₹{Number(discount).toLocaleString()}</p>
                        </div>
                      )}
                      {couponError && (
                        <div className="flex items-center mt-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-xs text-red-600 font-medium">{couponError}</p>
                        </div>
                      )}
                    </div>


                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-800 text-sm">Select Payment Method</h3>

                      <motion.div whileHover={{ scale: 1.00 }} className={`p-4 bg-white border rounded-lg cursor-pointer ${paymentMethod === "cod" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`} onClick={() => setPaymentMethod("cod")}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${paymentMethod === "cod" ? "bg-blue-100" : "bg-gray-100"}`}>
                            <FiDollarSign className={`text-sm ${paymentMethod === "cod" ? "text-blue-600" : "text-gray-600"}`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm">Cash on Delivery</div>
                            <div className="text-gray-600 text-xs">Pay when you receive your order</div>
                          </div>
                          {paymentMethod === "cod" && (
                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                              <FiCheck className="text-white text-xs" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                      {/* Wallet Coins Checkbox - ONLY SHOW IF USER HAS COINS */}
                      {walletCoins > 0 && checkoutStep === "payment" && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-amber-200 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-amber-100 rounded-lg">
                                <IoWalletOutline className="text-amber-600 text-lg" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-800">Wallet Coins</h3>
                                <p className="text-xs text-gray-600">Use your coins for instant discount</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-amber-700 text-lg">{walletCoins}</div>
                              <div className="text-xs text-gray-500">Coins Available</div>
                            </div>
                          </div>

                          {/* Checkbox */}
                          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center h-5">
                              <input
                                type="checkbox"
                                id="useWalletCoins"
                                checked={useWalletCoins}
                                onChange={handleWalletCheckboxChange}
                                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                              />
                            </div>
                            <div className="flex-1">
                              <label htmlFor="useWalletCoins" className="text-sm font-medium text-gray-700 cursor-pointer">
                                <div className="font-semibold">Use Wallet Coins for 10% Discount</div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Get automatic 10% discount (minimum of 10% order value or 10% of your coins)
                                </p>
                              </label>
                            </div>
                          </div>

                          {/* Discount Calculation Display */}
                          {useWalletCoins && walletDiscount > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <IoCheckmarkCircleOutline className="text-green-600" />
                                  <div>
                                    <p className="text-sm font-medium text-green-800">Wallet Discount Applied!</p>
                                    <p className="text-xs text-green-600">
                                      Using {walletDiscount} coins (1 coin = ₹1)
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-green-700">-₹{walletDiscount}</p>
                                  <p className="text-xs text-green-600">
                                    {walletCoins - walletDiscount} coins remaining
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {/* Error Message */}
                          {walletError && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <IoCloseCircle className="text-red-500" />
                                <p className="text-sm text-red-700">{walletError}</p>
                              </div>
                            </div>
                          )}

                          {/* Info Box */}
                          {/* <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <div className="flex items-start gap-2">
                              <IoInformationCircleOutline className="text-blue-500 mt-0.5" />
                              <div>
                                <p className="text-xs text-blue-700 font-medium">How it works:</p>
                                <ul className="text-xs text-blue-600 mt-1 space-y-1">
                                  <li>• 10% discount = minimum of (10% order value) or (10% of your coins)</li>
                                  <li>• 1 Coin = ₹1 value</li>
                                  <li>• Discount applied after all other discounts</li>
                                  <li>• Coins will be deducted from wallet after order confirmation</li>
                                </ul>
                              </div>
                            </div>
                          </div> */}
                        </div>
                      )}

                      <motion.div whileHover={{ scale: 1.00 }} className={`p-4 bg-white border rounded-lg cursor-pointer ${paymentMethod === "online" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`} onClick={() => setPaymentMethod("online")}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${paymentMethod === "online" ? "bg-blue-100" : "bg-gray-100"}`}>
                            <FiCreditCard className={`text-sm ${paymentMethod === "online" ? "text-blue-600" : "text-gray-600"}`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm">Online Payment</div>
                            <div className="text-gray-600 text-xs">Pay securely with UPI, Card or Wallet</div>
                          </div>
                          {paymentMethod === "online" && (
                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                              <FiCheck className="text-white text-xs" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </div>

                    <div className="border-t pt-4  mt-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Item Total</span>
                          <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Fee</span>
                          <span className="text-green-600 text-xs">FREE</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax</span>
                          <span>₹{taxAmount.toLocaleString()}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Referral Discount</span>
                            <span className="font-medium text-green-600">-₹{Number(discount).toLocaleString()}</span>
                          </div>
                        )}

                        {/* {discount > 0 && (
                          <div className="flex justify-between text-green-700">
                            <span className="text-gray-600">Referral Discount</span>
                            <span>-₹{Number(discount).toLocaleString()}</span>
                          </div>
                        )} */}
                        <div className="flex justify-between font-semibold pt-3 border-t">
                          <span>Total Amount</span>
                          <span className="text-blue-600">₹{total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </div>
            </div>


            {checkoutStep === "payment" && (
              <div className="flex items-center w-[100%] bg-white  justify-between gap-4 p-3 border-t  border-gray-300">
                {/* Total Amount with shimmer effect */}
                <div className="w-[25%]">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative flex-1 py-2  text-center bg-black text-white font-bold rounded-lg text-lg shadow-md overflow-hidden shimmer-wrapper"
                  >
                    <span className="relative z-10 text-sm">
                      ₹{total.toLocaleString()}
                    </span>
                    {/* shimmer overlay */}
                    <div className="shimmer"></div>
                  </motion.div>
                </div>
                {/* Place Order / Pay Now Button */}
                <div className="w-[75%]">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="flex-1 py-3 w-full  bg-[#00a63d] hover:bg-[#00a63d] text-white font-medium rounded-lg transition-all duration-200 text-sm shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {paymentMethod === "cod"
                      ? isSubmitting
                        ? "Placing..."
                        : "Place Order"
                      : isSubmitting
                        ? "Processing..."
                        : "Pay Now"}
                  </motion.button>
                </div>
              </div>
            )}

            {checkoutStep == "address" && (
              <div className=" w-[100%] bg-white   gap-4 p-3 border-t  border-gray-300">
                <motion.button whileHover={{ scale: 0.98 }} whileTap={{ scale: 0.99 }} onClick={() => setCheckoutStep("add-address")} className="w-full sticky bottom-0  px-4 py-3 border bg-white border-dashed border-gray-300 rounded-lg text-[#00a63d] font-medium flex items-center justify-center hover:border-blue-400 transition-colors text-sm">
                  <FiPlus className="mr-2" /> Add New Address
                </motion.button>
              </div>
            )

            }


            {/* Coupons Drawer */}
            {isCouponDrawerOpen && (
              <div className="absolute bottom-0 inset-0 z-50  overflow-hidden  rounded-2xl  flex items-end justify-center ">
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="bg-gray-100 rounded-2xl shadow-2xl  shadow-gray-50 w-full max-w-md h-[70%] border-t border-gray-300 flex flex-col"
                >
                  {/* Drawer Header */}
                  <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Available Coupons</h2>
                    <button
                      onClick={() => setIsCouponDrawerOpen(false)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Coupons List */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {couponLoading ? (
                      <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    ) : coupons.length > 0 ? (
                      <div className="space-y-4">

                        {coupons.map((coupon) => (
                          <motion.div
                            key={coupon._id}
                            whileHover={{ scale: 1.01 }}
                            className={`p-4 border rounded-lg bg-white cursor-pointer transition-all ${couponCode === coupon.code ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-blue-300"
                              }`}
                            onClick={() => {

                              setCouponCode(`${coupon.couponCode}`);
                              setDiscount(coupon.discountValue);
                              setIsCouponDrawerOpen(false);


                              toast.success(`Coupon applied: ₹${coupon.discountValue} off`);
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-full">
                                  <FiTag className="text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-800">{coupon.couponCode}</h3>
                                  <p className="text-sm text-gray-600 mt-1">{coupon.description}</p>
                                  <div className="flex items-center mt-2">
                                    <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      Min. order: ₹{coupon.minPurchaseAmount}
                                    </span>
                                    {coupon.maxDiscountAmount && (
                                      <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded ml-2">
                                        Max. discount: ₹{coupon.maxDiscountAmount}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-[#00a63d]">
                                  ₹{coupon.discount} OFF
                                </div>
                                {couponCode === coupon.code && (
                                  <div className="text-xs text-green-600 font-medium mt-1 flex items-center">
                                    <FiCheck className="mr-1" /> Applied
                                  </div>
                                )}
                              </div>
                            </div>
                            {coupon.validUntil && (
                              <div className="text-xs text-gray-500 mt-3">
                                Valid until: {new Date(coupon.validUntil).toLocaleDateString()}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                        <FiTag className="h-12 w-12 mb-3 opacity-50" />
                        <p className="text-lg font-medium">No coupons available</p>
                        <p className="text-sm mt-1">Check back later for new offers</p>
                      </div>
                    )}
                  </div>

                  {/* Drawer Footer */}
                  <div className="p-4 border-t border-gray-200">
                    <button
                      onClick={() => setIsCouponDrawerOpen(false)}
                      className="w-full py-3 bg-[#00a63d] text-white font-medium rounded-lg transition-all duration-200 hover:bg-[#00a63d] text-sm"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </div>
            )}


          </motion.div>
        </div>
      )}

    </>
  );
};

export default OrderSummary;

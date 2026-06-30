// // components/ReturnOrderModal.jsx
// import { useState, useEffect } from 'react';
// import { X, AlertCircle, Check, Package } from 'lucide-react';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// const ReturnOrderModal = ({ isOpen, onClose, orderId, onReturnRequested }) => {
//   const [orderDetails, setOrderDetails] = useState(null);
//   const [reason, setReason] = useState('');
//   const [additionalNotes, setAdditionalNotes] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [fetchingOrder, setFetchingOrder] = useState(false);
//   const [returnType, setReturnType] = useState('refund');
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [returnQuantities, setReturnQuantities] = useState({});

//   const returnReasons = [
//     'Received wrong item',
//     'Item damaged or defective',
//     'Item not as described',
//     'Changed my mind',
//     'Received extra item',
//     'Quality not as expected',
//     'Size/fit issues',
//     'Color difference',
//     'Late delivery',
//     'Other'
//   ];

//   // Fetch order details when modal opens
//   useEffect(() => {
//     if (isOpen && orderId) {
//       fetchOrderDetails();
//     }
//   }, [isOpen, orderId]);

//   const fetchOrderDetails = async () => {
//     setFetchingOrder(true);
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(
//         `http://localhost:5000/api/order/single-order/${orderId}`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         }
//       );
      
//       if (response.data.success) {
//         setOrderDetails(response.data.order);
//         // Initialize selected items with all items unchecked
//         const initialQuantities = {};
//         response.data.order.items.forEach(item => {
//           initialQuantities[item._id] = 1; // Default to 1 quantity
//         });
//         setReturnQuantities(initialQuantities);
//       }
//     } catch (error) {
//       toast.error('Failed to fetch order details');
//       console.error('Error fetching order:', error);
//     } finally {
//       setFetchingOrder(false);
//     }
//   };

//   const handleItemSelect = (itemId) => {
//     if (selectedItems.includes(itemId)) {
//       setSelectedItems(selectedItems.filter(id => id !== itemId));
//     } else {
//       setSelectedItems([...selectedItems, itemId]);
//     }
//   };

//   const handleQuantityChange = (itemId, quantity) => {
//     const maxQuantity = orderDetails.items.find(item => item._id === itemId)?.quantity || 1;
//     const validQuantity = Math.max(1, Math.min(quantity, maxQuantity));
//     setReturnQuantities({
//       ...returnQuantities,
//       [itemId]: validQuantity
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!reason.trim()) {
//       toast.error('Please select a return reason');
//       return;
//     }

//     if (selectedItems.length === 0) {
//       toast.error('Please select at least one item to return');
//       return;
//     }

//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
      
//       // Prepare return items with quantities
//       const returnItems = selectedItems.map(itemId => {
//         const item = orderDetails.items.find(i => i._id === itemId);
//         return {
//           itemId: item._id,
//           name: item.name,
//           quantity: returnQuantities[itemId],
//           price: item.price,
//           image: item.image,
//           totalAmount: item.price * returnQuantities[itemId]
//         };
//       });

//       // Calculate total return amount
//       const totalReturnAmount = returnItems.reduce((total, item) => total + item.totalAmount, 0);

//       const response = await axios.post(
//         'http://localhost:5000/api/order/request-return',
//         {
//           orderId: orderId,
//           reason: reason,
//           additionalNotes: additionalNotes,
//           returnType: returnType,
//           returnItems: returnItems,
//           totalReturnAmount: totalReturnAmount
//         },
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       if (response.data.success) {
//         toast.success('Return request submitted successfully!');
//         onReturnRequested();
//         onClose();
//         resetForm();
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to submit return request');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setReason('');
//     setAdditionalNotes('');
//     setReturnType('refund');
//     setSelectedItems([]);
//     setReturnQuantities({});
//     setOrderDetails(null);
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
//         {/* Background overlay */}
//         {/* <div className="fixed inset-0 transition-opacity" ></div> */}

//         <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

//         {/* Modal panel */}
//         <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold text-gray-900">
//               Request Return for Order #{orderId}
//             </h3>
//             <button
//               onClick={onClose}
//               className="p-1 text-gray-400 rounded-full hover:text-gray-500 focus:outline-none"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           {fetchingOrder ? (
//             <div className="py-8 text-center">
//               <div className="inline-block w-8 h-8 border-2 border-[#00a63d] border-t-transparent rounded-full animate-spin"></div>
//               <p className="mt-2 text-gray-600">Loading order details...</p>
//             </div>
//           ) : orderDetails ? (
//             <form onSubmit={handleSubmit}>
//               <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
//                 {/* Order Summary */}
//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <h4 className="font-medium text-gray-900 mb-3 flex items-center">
//                     <Package className="w-5 h-5 mr-2 text-blue-600" />
//                     Order Summary
//                   </h4>
//                   <div className="text-sm text-gray-600">
//                     <p>Total Items: {orderDetails.items.length}</p>
//                     <p>Order Amount: ₹{orderDetails.amount}</p>
//                     <p>Order Date: {new Date(orderDetails.createdAt).toLocaleDateString()}</p>
//                   </div>
//                 </div>

//                 {/* Select Items to Return */}
//                 <div>
//                   <h4 className="font-medium text-gray-900 mb-3">
//                     Select Items to Return *
//                   </h4>
//                   <div className="space-y-3">
//                     {orderDetails.items.map((item) => (
//                       <div key={item._id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
//                         <div className="flex items-start flex-1">
//                           <input
//                             type="checkbox"
//                             id={`item-${item._id}`}
//                             checked={selectedItems.includes(item._id)}
//                             onChange={() => handleItemSelect(item._id)}
//                             className="mt-1 w-4 h-4 text-[#00a63d] border-gray-300 rounded focus:ring-[#00a63d]"
//                           />
//                           <div className="ml-3 flex-1">
//                             <div className="flex items-start">
//                               <img
//                                 src={item.image}
//                                 alt={item.name}
//                                 className="w-16 h-16 object-cover rounded-md border border-gray-200"
//                               />
//                               <div className="ml-3 flex-1">
//                                 <label htmlFor={`item-${item._id}`} className="font-medium text-gray-900 cursor-pointer">
//                                   {item.name}
//                                 </label>
//                                 <p className="text-sm text-gray-500 mt-1">
//                                   Price: ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
//                                 </p>
//                               </div>
//                             </div>
                            
//                             {selectedItems.includes(item._id) && (
//                               <div className="mt-3 ml-9">
//                                 <div className="flex items-center space-x-4">
//                                   <label className="text-sm font-medium text-gray-700">Quantity to Return:</label>
//                                   <div className="flex items-center space-x-2">
//                                     <button
//                                       type="button"
//                                       onClick={() => handleQuantityChange(item._id, returnQuantities[item._id] - 1)}
//                                       disabled={returnQuantities[item._id] <= 1}
//                                       className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
//                                     >
//                                       -
//                                     </button>
//                                     <span className="w-12 text-center">{returnQuantities[item._id]}</span>
//                                     <button
//                                       type="button"
//                                       onClick={() => handleQuantityChange(item._id, returnQuantities[item._id] + 1)}
//                                       disabled={returnQuantities[item._id] >= item.quantity}
//                                       className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
//                                     >
//                                       +
//                                     </button>
//                                     <span className="text-sm text-gray-500">/ {item.quantity} available</span>
//                                   </div>
//                                 </div>
//                                 <p className="text-sm font-medium text-green-600 mt-2">
//                                   Return Amount: ₹{item.price * returnQuantities[item._id]}
//                                 </p>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
                  
//                   {selectedItems.length > 0 && (
//                     <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
//                       <p className="font-medium text-green-800">
//                         Total Selected: {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}
//                       </p>
//                       <p className="text-green-700 mt-1">
//                         Estimated Return Amount: ₹{selectedItems.reduce((total, itemId) => {
//                           const item = orderDetails.items.find(i => i._id === itemId);
//                           return total + (item.price * returnQuantities[itemId]);
//                         }, 0)}
//                       </p>
//                     </div>
//                   )}
//                 </div>

//                 {/* Return Type Selection */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Return Type
//                   </label>
//                   <div className="flex space-x-4">
//                     <label className="flex items-center">
//                       <input
//                         type="radio"
//                         value="refund"
//                         checked={returnType === 'refund'}
//                         onChange={(e) => setReturnType(e.target.value)}
//                         className="w-4 h-4 text-[#00a63d] border-gray-300 focus:ring-[#00a63d]"
//                       />
//                       <span className="ml-2 text-sm text-gray-700">Refund</span>
//                     </label>
//                     <label className="flex items-center">
//                       <input
//                         type="radio"
//                         value="exchange"
//                         checked={returnType === 'exchange'}
//                         onChange={(e) => setReturnType(e.target.value)}
//                         className="w-4 h-4 text-[#00a63d] border-gray-300 focus:ring-[#00a63d]"
//                       />
//                       <span className="ml-2 text-sm text-gray-700">Exchange</span>
//                     </label>
//                   </div>
//                 </div>

//                 {/* Return Reason */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Select Reason for Return *
//                   </label>
//                   <select
//                     value={reason}
//                     onChange={(e) => setReason(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a63d] focus:border-transparent"
//                     required
//                   >
//                     <option value="">Select a reason</option>
//                     {returnReasons.map((item, index) => (
//                       <option key={index} value={item}>{item}</option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Additional Notes */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Additional Notes (Optional)
//                   </label>
//                   <textarea
//                     value={additionalNotes}
//                     onChange={(e) => setAdditionalNotes(e.target.value)}
//                     rows="3"
//                     placeholder="Please provide any additional details about your return..."
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a63d] focus:border-transparent"
//                   />
//                 </div>

//                 {/* Warning Note */}
//                 {/* <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
//                   <div className="flex">
//                     <AlertCircle className="flex-shrink-0 w-5 h-5 text-yellow-400" />
//                     <div className="ml-3">
//                       <h3 className="text-sm font-medium text-yellow-800">
//                         Important Information
//                       </h3>
//                       <div className="mt-2 text-sm text-yellow-700">
//                         <ul className="pl-5 list-disc">
//                           <li>Return requests must be submitted within 7 days of delivery</li>
//                           <li>Items must be unused and in original packaging</li>
//                           <li>Return shipping may be deducted from refund</li>
//                           <li>Refund processing takes 5-7 business days</li>
//                           <li>For exchanges, replacement items will be shipped after return pickup</li>
//                         </ul>
//                       </div>
//                     </div>
//                   </div>
//                 </div> */}
//               </div>

//               {/* Action Buttons */}
//               <div className="flex justify-end mt-6 space-x-3">
//                 <button
//                   type="button"
//                   onClick={onClose}
//                   className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={loading || selectedItems.length === 0}
//                   className="px-4 py-2 text-sm font-medium text-white bg-[#00a63d] border border-transparent rounded-md hover:bg-[#00a63d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a63d] disabled:opacity-50"
//                 >
//                   {loading ? (
//                     <>
//                       <div className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                       Submitting...
//                     </>
//                   ) : (
//                     <>
//                       <Check className="inline w-4 h-4 mr-1" />
//                       Submit Return Request
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           ) : (
//             <div className="py-8 text-center text-red-600">
//               <p>Unable to load order details. Please try again.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReturnOrderModal;



import { useState, useEffect } from 'react';
import { X, AlertCircle, Check, Package, IndianRupee, CreditCard, Building2, User, Phone, Smartphone } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ReturnOrderModal = ({ isOpen, onClose, orderId, onReturnRequested }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [reason, setReason] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingOrder, setFetchingOrder] = useState(false);
  const [returnType, setReturnType] = useState('refund');
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnQuantities, setReturnQuantities] = useState({});
  
  // Payment details states
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: ''
  });

  const returnReasons = [
    'Received wrong item',
    'Item damaged or defective',
    'Item not as described',
    'Changed my mind',
    'Received extra item',
    'Quality not as expected',
    'Size/fit issues',
    'Color difference',
    'Late delivery',
    'Other'
  ];

  // Fetch order details when modal opens
  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetails = async () => {
    setFetchingOrder(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/order/single-order/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        const order = response.data.order;
        setOrderDetails(order);
        setPaymentMethod(order.paymentMethod || '');
        
        // Check if COD payment method and refund type, show bank details
        if (order.paymentMethod === 'COD' && returnType === 'refund') {
          setShowBankDetails(true);
        }
        
        // Initialize selected items with all items unchecked
        const initialQuantities = {};
        order.items.forEach(item => {
          initialQuantities[item._id] = 1; // Default to 1 quantity
        });
        setReturnQuantities(initialQuantities);
      }
    } catch (error) {
      toast.error('Failed to fetch order details');
      console.error('Error fetching order:', error);
    } finally {
      setFetchingOrder(false);
    }
  };

  // Handle return type change
  const handleReturnTypeChange = (type) => {
    setReturnType(type);
    
    // Show bank details only for COD + Refund
    if (paymentMethod === 'COD' && type === 'refund') {
      setShowBankDetails(true);
    } else {
      setShowBankDetails(false);
    }
  };

  const handleItemSelect = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleQuantityChange = (itemId, quantity) => {
    const maxQuantity = orderDetails.items.find(item => item._id === itemId)?.quantity || 1;
    const validQuantity = Math.max(1, Math.min(quantity, maxQuantity));
    setReturnQuantities({
      ...returnQuantities,
      [itemId]: validQuantity
    });
  };

  const handleBankDetailChange = (field, value) => {
    setBankDetails({
      ...bankDetails,
      [field]: value
    });
  };

  const validateBankDetails = () => {
    if (!showBankDetails) return true;
    
    // Basic validation for COD refunds
    if (!bankDetails.accountHolderName.trim()) {
      toast.error('Please enter account holder name');
      return false;
    }
    
    if (!bankDetails.accountNumber.trim() || bankDetails.accountNumber.length < 9) {
      toast.error('Please enter valid account number (minimum 9 digits)');
      return false;
    }
    
    if (!bankDetails.ifscCode.trim() || bankDetails.ifscCode.length !== 11) {
      toast.error('Please enter valid IFSC code (11 characters)');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast.error('Please select a return reason');
      return;
    }

    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to return');
      return;
    }

    // Validate bank details for COD refunds
    if (paymentMethod === 'COD' && returnType === 'refund') {
      if (!validateBankDetails()) {
        return;
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Prepare return items with quantities
      const returnItems = selectedItems.map(itemId => {
        const item = orderDetails.items.find(i => i._id === itemId);
        return {
          itemId: item._id,
          name: item.name,
          quantity: returnQuantities[itemId],
          price: item.price,
          image: item.image,
          totalAmount: item.price * returnQuantities[itemId]
        };
      });

      // Calculate total return amount
      const totalReturnAmount = returnItems.reduce((total, item) => total + item.totalAmount, 0);

      // Prepare request payload
      const payload = {
        orderId: orderId,
        reason: reason,
        additionalNotes: additionalNotes,
        returnType: returnType,
        returnItems: returnItems,
        totalReturnAmount: totalReturnAmount
      };

      // Add payment details for COD refunds
      if (paymentMethod === 'COD' && returnType === 'refund') {
        payload.paymentDetails = {
          accountHolderName: bankDetails.accountHolderName,
          accountNumber: bankDetails.accountNumber,
          ifscCode: bankDetails.ifscCode.toUpperCase(),
          bankName: bankDetails.bankName,
          upiId: bankDetails.upiId
        };
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/order/request-return`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('Return request submitted successfully!');
        onReturnRequested();
        onClose();
        resetForm();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit return request');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setReason('');
    setAdditionalNotes('');
    setReturnType('refund');
    setSelectedItems([]);
    setReturnQuantities({});
    setOrderDetails(null);
    setShowBankDetails(false);
    setBankDetails({
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      upiId: ''
    });
  };

  const calculateTotalReturn = () => {
    if (!orderDetails || selectedItems.length === 0) return 0;
    
    return selectedItems.reduce((total, itemId) => {
      const item = orderDetails.items.find(i => i._id === itemId);
      return total + (item.price * returnQuantities[itemId]);
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        {/* Modal panel */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Request Return for Order #{orderId}
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 rounded-full hover:text-gray-500 focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {fetchingOrder ? (
            <div className="py-8 text-center">
              <div className="inline-block w-8 h-8 border-2 border-[#00a63d] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600">Loading order details...</p>
            </div>
          ) : orderDetails ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {/* Order Summary with Payment Method */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Package className="w-5 h-5 mr-2 text-blue-600" />
                        Order Summary
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Total Items: {orderDetails.items.length}</p>
                        <p>Order Amount: ₹{orderDetails.amount}</p>
                        <p>Order Date: {new Date(orderDetails.createdAt).toLocaleDateString()}</p>
                        <div className="flex items-center mt-1">
                          <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                          <span className={`font-medium ${paymentMethod === 'COD' ? 'text-orange-600' : 'text-green-600'}`}>
                            Payment: {paymentMethod}
                            {paymentMethod === 'COD' && ' (Cash on Delivery)'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {paymentMethod === 'COD' && returnType === 'refund' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-xs">
                        <div className="flex items-start">
                          <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Bank Details Required</p>
                            <p className="text-xs text-yellow-700 mt-1">
                              For COD orders, please provide bank details for refund
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Select Items to Return */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Select Items to Return *
                  </h4>
                  <div className="space-y-3">
                    {orderDetails.items.map((item) => (
                      <div key={item._id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-start flex-1">
                          <input
                            type="checkbox"
                            id={`item-${item._id}`}
                            checked={selectedItems.includes(item._id)}
                            onChange={() => handleItemSelect(item._id)}
                            className="mt-1 w-4 h-4 text-[#00a63d] border-gray-300 rounded focus:ring-[#00a63d]"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-start">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-md border border-gray-200"
                              />
                              <div className="ml-3 flex-1">
                                <label htmlFor={`item-${item._id}`} className="font-medium text-gray-900 cursor-pointer">
                                  {item.name}
                                </label>
                                <p className="text-sm text-gray-500 mt-1">
                                  Price: ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                                </p>
                              </div>
                            </div>
                            
                            {selectedItems.includes(item._id) && (
                              <div className="mt-3 ml-9">
                                <div className="flex items-center space-x-4">
                                  <label className="text-sm font-medium text-gray-700">Quantity to Return:</label>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => handleQuantityChange(item._id, returnQuantities[item._id] - 1)}
                                      disabled={returnQuantities[item._id] <= 1}
                                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      -
                                    </button>
                                    <span className="w-12 text-center">{returnQuantities[item._id]}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleQuantityChange(item._id, returnQuantities[item._id] + 1)}
                                      disabled={returnQuantities[item._id] >= item.quantity}
                                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      +
                                    </button>
                                    <span className="text-sm text-gray-500">/ {item.quantity} available</span>
                                  </div>
                                </div>
                                <p className="text-sm font-medium text-green-600 mt-2">
                                  Return Amount: ₹{item.price * returnQuantities[item._id]}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedItems.length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="font-medium text-green-800">
                        Total Selected: {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-green-700 mt-1">
                        Estimated Return Amount: ₹{calculateTotalReturn()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Return Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Type *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleReturnTypeChange('refund')}
                      className={`p-4 border rounded-lg text-center transition-colors ${
                        returnType === "refund"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <IndianRupee className="w-6 h-6 mb-2" />
                        <p className="font-medium">Get Refund</p>
                        <p className="text-sm mt-1">₹{calculateTotalReturn()}</p>
                        {paymentMethod === 'COD' && returnType === 'refund' && (
                          <p className="text-xs text-yellow-600 mt-1">Bank details required</p>
                        )}
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleReturnTypeChange('exchange')}
                      className={`p-4 border rounded-lg text-center transition-colors ${
                        returnType === "exchange"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <Package className="w-6 h-6 mb-2" />
                        <p className="font-medium">Exchange Item</p>
                        <p className="text-sm mt-1">Replace with different item</p>
                      </div>
                    </button>
                  </div>
                  
                  {/* Refund Method Info */}
                  {returnType === 'refund' && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-1">
                        Refund Information:
                      </p>
                      <p className="text-sm text-blue-700">
                        {paymentMethod === 'COD' ? (
                          <>
                            <span className="font-medium">Bank Transfer:</span> Refund will be processed to your bank account within 3-5 business days
                          </>
                        ) : (
                          <>
                            <span className="font-medium">Original Payment Method:</span> Refund will be credited back to your original payment source within 5-7 business days
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bank Details for COD Refunds */}
                {showBankDetails && returnType === 'refund' && (
                  <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                    <div className="flex items-start mb-4">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Bank Account Details Required</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Please provide your bank details for refund processing. All details are securely encrypted.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <User className="inline w-4 h-4 mr-1" />
                            Account Holder Name *
                          </label>
                          <input
                            type="text"
                            value={bankDetails.accountHolderName}
                            onChange={(e) => handleBankDetailChange('accountHolderName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="Enter full name as in bank account"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Number *
                          </label>
                          <input
                            type="text"
                            value={bankDetails.accountNumber}
                            onChange={(e) => handleBankDetailChange('accountNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="Enter bank account number"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            IFSC Code *
                          </label>
                          <input
                            type="text"
                            value={bankDetails.ifscCode}
                            onChange={(e) => handleBankDetailChange('ifscCode', e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="e.g., SBIN0001234"
                            required
                            maxLength="11"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Building2 className="inline w-4 h-4 mr-1" />
                            Bank Name
                          </label>
                          <input
                            type="text"
                            value={bankDetails.bankName}
                            onChange={(e) => handleBankDetailChange('bankName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="Optional"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Smartphone className="inline w-4 h-4 mr-1" />
                          UPI ID (Alternative)
                        </label>
                        <input
                          type="text"
                          value={bankDetails.upiId}
                          onChange={(e) => handleBankDetailChange('upiId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          placeholder="e.g., username@upi"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          If provided, refund will be processed via UPI (faster)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Return Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Reason for Return *
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a63d] focus:border-transparent"
                    required
                  >
                    <option value="">Select a reason</option>
                    {returnReasons.map((item, index) => (
                      <option key={index} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    rows="3"
                    placeholder="Please provide any additional details about your return..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a63d] focus:border-transparent"
                  />
                </div>

                {/* Important Information */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <div className="flex">
                    <AlertCircle className="flex-shrink-0 w-5 h-5 text-gray-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-800">
                        Important Information
                      </h3>
                      <div className="mt-2 text-sm text-gray-700">
                        <ul className="pl-5 list-disc space-y-1">
                          <li>Return requests must be submitted within 7 days of delivery</li>
                          <li>Items must be unused and in original packaging</li>
                          <li>Return shipping is free of charge</li>
                          {paymentMethod === 'COD' ? (
                            <li>For COD orders, refund will be processed via bank transfer (3-5 business days)</li>
                          ) : (
                            <li>Refund will be processed to original payment method (5-7 business days)</li>
                          )}
                          {returnType === 'exchange' && (
                            <li>For exchanges, replacement items will be shipped after return pickup</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || selectedItems.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#00a63d] border border-transparent rounded-md hover:bg-[#00a63d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a63d] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="inline w-4 h-4 mr-1" />
                      Submit Return Request
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="py-8 text-center text-red-600">
              <p>Unable to load order details. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnOrderModal;
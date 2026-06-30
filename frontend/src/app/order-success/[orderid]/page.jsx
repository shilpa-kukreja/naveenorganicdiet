"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { CheckCircle, ShoppingBag, Home, Clock, MapPin, CreditCard, Download, FileText, Mail } from "lucide-react";


 import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Header from "@/app/componats/Header";
import Footer from "@/app/componats/Footer";

export default function OrderSuccessPage() {
  const { orderid } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const invoiceRef = useRef();
  //  const { cartItems = [], clearCart = () => { }, user = null } = useContext(AppContext) || {};

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (orderid) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/api/order/single-order/${orderid}`,
           {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
        )
        .then((res) => {
          if (res.data.success) setOrder(res.data.order);
          // clearCart(); // Clear cart on successful order fetch
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [orderid]);

 





const downloadInvoice = () => {
  setDownloading(true);
  try {
    const pdf = new jsPDF();

    // ===== Header =====
    pdf.setFontSize(18);
    pdf.setTextColor(40, 116, 240);
    pdf.text("My Shop", 14, 20);

    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text("123 Business Street, Ghaziabad, India", 14, 28);
    pdf.text("support@myshop.com | +91 9876543210", 14, 34);

    // Invoice Title & Info
    pdf.setFontSize(16);
    pdf.setTextColor(0);
    pdf.text("INVOICE", 170, 20, { align: "right" });

    pdf.setFontSize(11);
    pdf.text(`Order ID: ${order.orderid}`, 170, 30, { align: "right" });
    pdf.text(
      `Date: ${new Date(order.createdAt).toLocaleDateString()}`,
      170,
      36,
      { align: "right" }
    );

    // ===== Customer Info =====
    pdf.setFontSize(12);
    pdf.setTextColor(0);
    pdf.text("Bill To:", 14, 50);

    pdf.setFontSize(11);
    pdf.setTextColor(60);
    const { firstName, lastName, address1, address2, city, country, postalCode, phone, email } =
      order.address;

    pdf.text(`${firstName} ${lastName}`, 14, 58);
    pdf.text(address1, 14, 64);
    if (address2) pdf.text(address2, 14, 70);
    pdf.text(`${city}, ${country} - ${postalCode}`, 14, 76);
    pdf.text(`Phone: ${phone}`, 14, 82);
    pdf.text(`Email: ${email}`, 14, 88);

    // ===== Items Table with Images =====
    const tableData = [];
    for (const item of order.items) {
      const total = item.price * item.quantity;
      tableData.push([
        { content: item.name, styles: { halign: "left" } },
        `₹${item.price.toFixed(2)}`,
        item.quantity.toString(),
        `₹${total.toFixed(2)}`,
      ]);
    }

    autoTable(pdf, {
      head: [["Item", "Price", "Qty", "Total"]],
      body: tableData,
      startY: 100,
      styles: { fontSize: 11, lineColor: [220, 220, 220], lineWidth: 0.2 },
      headStyles: {
        fillColor: [40, 116, 240],
        textColor: [255, 255, 255],
        fontSize: 12,
        halign: "center",
      },
      bodyStyles: { halign: "center" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: { 0: { halign: "left" } },
    });

    // ===== Totals Section =====
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const finalY = pdf.lastAutoTable.finalY + 10;

    pdf.setFontSize(12);
    pdf.text("Subtotal:", 140, finalY);
    pdf.text(`₹${subtotal.toFixed(2)}`, 190, finalY, { align: "right" });

    pdf.text("Shipping:", 140, finalY + 7);
    pdf.text("Free", 190, finalY + 7, { align: "right" });

    pdf.text("Tax:", 140, finalY + 14);
    pdf.text("₹0.00", 190, finalY + 14, { align: "right" });

    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.text("Grand Total:", 140, finalY + 25);
    pdf.text(`₹${subtotal.toFixed(2)}`, 190, finalY + 25, { align: "right" });

    // ===== Footer =====
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(120);
    pdf.text(
      "Thank you for your purchase! For support, contact support@myshop.com",
      14,
      290
    );

    pdf.save(`invoice-${order.orderid}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
  } finally {
    setDownloading(false);
  }
};




  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7a1113] mb-4"></div>
        <p className="text-gray-600 text-lg">Loading your order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 text-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <p className="text-red-500 text-xl font-semibold mb-4">Order not found!</p>
          <p className="text-gray-600 mb-6">We couldn't locate your order details. Please check your order ID or try again later.</p>
          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-3 bg-[#7a1113] text-white rounded-xl shadow hover:bg-[#7a1113] transition flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <Header />
      
      <div className="container border-t border-gray-300 mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Thank you for your purchase, {order.address.fullName}. Your order #{order.orderid} has been confirmed and will be shipped soon.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <button
              onClick={downloadInvoice}
              disabled={downloading}
              className="px-6 py-3 bg-[#00a63d] text-white rounded-xl shadow hover:bg-[#007a2d] transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download Invoice
                </>
              )}
            </button>
            
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-white text-[#00a63d] border border-[#00a63d] rounded-xl hover:bg-blue-50 transition flex items-center justify-center gap-2"
            >
              <Home size={18} />
              Continue Shopping
            </button>
            
            <button
              onClick={() => router.push("/frontend/orders")}
              className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              Order History
            </button>
          </div>
        </div>

        {/* Invoice section for download */}
        <div className="hidden">
          <div ref={invoiceRef} className="invoice-pdf p-8 max-w-4xl mx-auto">

          
            <div className="flex justify-between items-start mb-8 border-b pb-6">
              <div>
                <h1 className="text-3xl font-bold text-[#00a63d]">INVOICE</h1>
                <p className="text-gray-500">Order #: {order.orderid}</p>
                <p className="text-gray-500">Date: {formatDate(order.createdAt || new Date())}</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-semibold">Your Company Name</h2>
                <p className="text-gray-600">123 Business Street</p>
                <p className="text-gray-600">City, State 10001</p>
                <p className="text-gray-600">contact@yourcompany.com</p>
              </div>
            </div>
            
            <div className="flex justify-between mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
                <p>{order.address.fullName} </p>
                <p>{order.address.address1}</p>
                {order.address.address2 && <p>{order.address.address2}</p>}
                <p>{order.address.city}, {order.address.country} {order.address.postalCode}</p>
                <p>{order.address.phone}</p>
                <p>{order.address.email}</p>
              </div>
              
              <div className="text-right">
                <h3 className="text-lg font-semibold mb-2">Order Details:</h3>
                <p><span className="font-medium">Status:</span> {order.status}</p>
                <p><span className="font-medium">Payment Method:</span> {order.paymentMethod}</p>
                <p><span className="font-medium">Payment Status:</span> {order.payment ? "Paid" : "Pending"}</p>
              </div>
            </div>
            
            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3">Item</th>
                  <th className="text-right py-3">Price</th>
                  <th className="text-right py-3">Quantity</th>
                  <th className="text-right py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={item._id} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className="py-4">
                      <div className="flex items-center">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded mr-4" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="text-right py-4">₹{item.price}</td>
                    <td className="text-right py-4">{item.quantity}</td>
                    <td className="text-right py-4">₹{item.quantity * item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span>Subtotal:</span>
                  <span>₹{order.amount}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Discount:</span>
                  <span>₹{order.discount || 0}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Tax:</span>
                  <span>₹0</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-200 font-semibold text-lg">
                  <span>Total:</span>
                  <span>₹{order.amount}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500">
              <p>Thank you for your business!</p>
              <p>If you have any questions, please contact us at support@yourcompany.com</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <ShoppingBag size={20} />
                Order Summary
              </h2>
              <button
                onClick={downloadInvoice}
                disabled={downloading}
                className="sm:px-4 sm:py-2 px-3 py-1 bg-[#00a63d] text-white rounded-lg text-sm hover:bg-[#007a2d] transition flex items-center gap-2 disabled:opacity-70"
              >
                <Download size={16} />
                {downloading ? "Generating..." : "Invoice"}
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Items</h3>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 rounded-lg object-cover border"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-800">
                        ₹{item.quantity * item.price}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">₹{order.amount + order.discount}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Discount:</span>
                  <span>₹{order.discount || 0}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-800">Free</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-800">₹0</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t mt-4">
                  <span className="text-lg font-semibold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-[#00a63d]">₹{order.amount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details & Shipping */}
          <div className="space-y-6">
            {/* Order Status Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Clock size={20} />
                  Order Status
                </h2>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <span className="text-sm text-gray-500">Order ID</span>
                  <p className="font-medium text-gray-800">{order.orderid}</p>
                </div>
                <div className="mb-4">
                  <span className="text-sm text-gray-500">Order Date</span>
                  <p className="font-medium text-gray-800">{formatDate(order.createdAt || new Date())}</p>
                </div>
                <div className="mb-4">
                  <span className="text-sm text-gray-500">Status</span>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800">
                    {order.status}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Payment</span>
                  <div className="flex items-center gap-2 mt-1">
                    <CreditCard size={16} className="text-gray-500" />
                    <span className="font-medium text-gray-800">
                      {order.paymentMethod} {order.payment ? "(Paid)" : "(Pending)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin size={20} />
                  Shipping Address
                </h2>
              </div>
              <div className="p-6">
                <p className="font-medium text-gray-800 mb-2">
                  {order.address.firstName} {order.address.lastName}
                </p>
                <p className="text-gray-600">{order.address.address1}</p>
                {order.address.address2 && (
                  <p className="text-gray-600">{order.address.address2}</p>
                )}
                <p className="text-gray-600">
                  {order.address.city}, {order.address.country} - {order.address.postalCode}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-600">Phone: {order.address.phone}</p>
                  <p className="text-gray-600">Email: {order.address.email}</p>
                </div>
              </div>
            </div>

            {/* Support Card */}
            {/* <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Need Help?</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">If you have any questions about your order, our customer service team is here to help.</p>
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Mail size={16} />
                  <span>support@yourcompany.com</span>
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                  Contact Support
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
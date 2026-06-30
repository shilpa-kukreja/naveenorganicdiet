"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiSearch,
  FiTrash2,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiPhone,
  FiUser,
  FiCalendar,
  FiX,
  FiMessageSquare,
  FiFilter,
  FiDownload,
  FiFileText,
  FiRefreshCw
} from "react-icons/fi";
import "react-toastify/dist/ReactToastify.css";

import * as XLSX from "xlsx";

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [contactsPerPage] = useState(10);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      console.log("Fetching contacts from API...");
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/contacts`);
      console.log("API Response:", response);
      console.log("Response data:", response.data);
      
      // Handle different possible response structures
      let contactsData = [];
      
      if (Array.isArray(response.data)) {
        // If response.data is directly an array
        contactsData = response.data;
      } else if (response.data && Array.isArray(response.data.contacts)) {
        // If response.data has a contacts property that's an array
        contactsData = response.data.contacts;
      } else if (response.data && Array.isArray(response.data.messages)) {
        // If response.data has a messages property that's an array
        contactsData = response.data.messages;
      } else {
        // Fallback - try to use response.data as is
        contactsData = Array.isArray(response.data) ? response.data : [];
      }
      
      console.log("Processed contacts data:", contactsData);
      setContacts(contactsData);
      
    } catch (error) {
      console.error("Error fetching contacts:", error);
      console.error("Error response:", error.response);
      toast.error("Failed to fetch contacts");
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact message?")) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/contact/${id}`);
        toast.success("Contact message deleted successfully");
        fetchContacts();
      } catch (error) {
        console.error("Error deleting contact:", error);
        toast.error("Failed to delete contact message");
      }
    }
  };

  const openMessageModal = (contact) => {
    setSelectedMessage(contact);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
  };

  const exportToExcel = () => {
    setIsExporting(true);
    try {
      const excelData = filteredContacts.map(contact => ({
        'Full Name': getContactName(contact),
        'Email': getContactEmail(contact),
        'Phone': getContactPhone(contact),
        'Subject': getContactSubject(contact),
        'Message': getContactMessage(contact),
        'Date': getContactDate(contact).toLocaleDateString(),
        'Time': getContactDate(contact).toLocaleTimeString()
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Contact Messages");
      
      const maxWidth = excelData.reduce((w, r) => Math.max(w, r.Message?.length || 0), 10);
      worksheet['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: maxWidth }, { wch: 12 }, { wch: 12 }];
      
      XLSX.writeFile(workbook, `contact-messages-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Contacts exported successfully");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export contacts");
    } finally {
      setIsExporting(false);
    }
  };

  // Safe data access functions
  const getContactName = (contact) => {
    return contact?.name || contact?.firstName || 'Unknown';
  };

  const getContactEmail = (contact) => {
    return contact?.email || 'No email provided';
  };

  const getContactPhone = (contact) => {
    return contact?.phone || contact?.number || 'No phone provided';
  };

  const getContactSubject = (contact) => {
    return contact?.subject || 'No subject';
  };

  const getContactMessage = (contact) => {
    return contact?.message || 'No message';
  };

  const getContactDate = (contact) => {
    return contact?.createdAt ? new Date(contact.createdAt) : new Date();
  };

  // Filter and sort contacts
  const filteredContacts = contacts
    .filter((contact) => {
      if (!contact) return false;
      
      const searchLower = searchTerm.toLowerCase();
      const name = getContactName(contact).toLowerCase();
      const email = getContactEmail(contact).toLowerCase();
      const phone = getContactPhone(contact).toLowerCase();
      const subject = getContactSubject(contact).toLowerCase();
      const message = getContactMessage(contact).toLowerCase();

      return (
        name.includes(searchLower) ||
        email.includes(searchLower) ||
        phone.includes(searchLower) ||
        subject.includes(searchLower) ||
        message.includes(searchLower)
      );
    })
    .sort((a, b) => {
      const dateA = getContactDate(a);
      const dateB = getContactDate(b);
      
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

  // Pagination logic
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);
  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Stats calculations
  const getThisMonthCount = () => {
    const now = new Date();
    return contacts.filter(contact => {
      const contactDate = getContactDate(contact);
      return contactDate.getMonth() === now.getMonth() && 
             contactDate.getFullYear() === now.getFullYear();
    }).length;
  };

  const getTodayCount = () => {
    const today = new Date();
    return contacts.filter(contact => {
      const contactDate = getContactDate(contact);
      return contactDate.toDateString() === today.toDateString();
    }).length;
  };

  if (loading) {
    return (
      <div>
        <div className="flex flex-col justify-center items-center min-h-96 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading contact messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Messages</h1>
            <p className="text-gray-600">Manage and review all customer inquiries and messages</p>
          </div>
          <button
            onClick={fetchContacts}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FiRefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Debug Info:</strong> Loaded {contacts.length} contacts | 
              Filtered: {filteredContacts.length} | 
              API Response logged to console
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-50 mr-4">
                <FiMessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50 mr-4">
                <FiCalendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{getThisMonthCount()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-amber-50 mr-4">
                <FiMail className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">{getTodayCount()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-50 mr-4">
                <FiUser className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or message..."
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full transition-colors"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white min-w-[160px]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <FiFilter className="h-4 w-4" />
                </div>
              </div>
            </div>
            
            <button
              onClick={exportToExcel}
              disabled={isExporting || filteredContacts.length === 0}
              className={`flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium ${
                (isExporting || filteredContacts.length === 0) ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <FiDownload className="h-4 w-4" />
                  Export Excel
                </>
              )}
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Message Preview
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentContacts.length > 0 ? (
                  currentContacts.map((contact) => (
                    <tr key={contact._id?.$oid || contact._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="font-semibold text-gray-900">
                              {getContactName(contact)}
                            </div>
                            <div className="flex flex-col space-y-1 mt-1">
                              <div className="flex items-center text-sm text-gray-600">
                                <FiMail className="h-3 w-3 mr-2" />
                                {getContactEmail(contact)}
                              </div>
                              {getContactPhone(contact) !== 'No phone provided' && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <FiPhone className="h-3 w-3 mr-2" />
                                  {getContactPhone(contact)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getContactSubject(contact)}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <button
                          onClick={() => openMessageModal(contact)}
                          className="text-left hover:text-blue-700 transition-colors group"
                        >
                          <div className="line-clamp-2 text-sm text-gray-700 group-hover:text-gray-900">
                            {getContactMessage(contact).substring(0, 100)}
                            {getContactMessage(contact).length > 100 ? "..." : ""}
                          </div>
                          <div className="text-xs text-blue-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to view full message
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getContactDate(contact).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getContactDate(contact).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openMessageModal(contact)}
                            className="p-2 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition-colors"
                            title="View Message"
                          >
                            <FiEye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(contact._id?.$oid || contact._id)}
                            className="p-2 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Message"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FiFileText className="h-12 w-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium text-gray-500 mb-1">
                          {searchTerm ? "No matching contacts found" : "No contact messages yet"}
                        </p>
                        <p className="text-sm text-gray-400">
                          {searchTerm ? "Try adjusting your search terms" : "All contact form submissions will appear here"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredContacts.length > contactsPerPage && (
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{indexOfFirstContact + 1}</span> to{" "}
                <span className="font-semibold">{Math.min(indexOfLastContact, filteredContacts.length)}</span> of{" "}
                <span className="font-semibold">{filteredContacts.length}</span> messages
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <FiChevronLeft className="h-5 w-5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                  .map((number, index, array) => (
                    <React.Fragment key={number}>
                      {index > 0 && number - array[index - 1] > 1 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => paginate(number)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === number
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-white hover:shadow-sm"
                        }`}
                      >
                        {number}
                      </button>
                    </React.Fragment>
                  ))}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Message Modal */}
        {isModalOpen && selectedMessage && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Message Details</h2>
                  <p className="text-sm text-gray-600 mt-1">{getContactName(selectedMessage)} • {getContactEmail(selectedMessage)}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Subject</label>
                      <p className="mt-1 text-gray-900 font-medium">{getContactSubject(selectedMessage)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-gray-900">{getContactPhone(selectedMessage)}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Message</label>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {getContactMessage(selectedMessage)}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Received on {getContactDate(selectedMessage).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  Close
                </button>
                <a
                  href={`mailto:${getContactEmail(selectedMessage)}?subject=Re: ${getContactSubject(selectedMessage)}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  Reply via Email
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
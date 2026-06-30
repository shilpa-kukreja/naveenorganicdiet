'use client';
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  FiMail,
  FiTrash2,
  FiUsers,
  FiDownload,
  FiSearch,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
  FiUser,
} from "react-icons/fi";

const SubscriptionManagement = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  const subscribersPerPage = 10;

  // Fetch Subscribers
  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriber/subscribers`);
      setSubscribers(response.data);
    } catch (error) {
      console.error("Failed to fetch subscribers", error);
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  // DELETE single
  const handleUnsubscribe = async (email) => {
    try {
      setActionLoading(true);
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriber/subscribers/${email}`);
      toast.success("Subscriber removed successfully");

      setSubscribers((prev) => prev.filter((sub) => sub.email !== email));
      setDeleteConfirm(null);

    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to remove subscriber");
    } finally {
      setActionLoading(false);
    }
  };

  // DELETE bulk
  const handleBulkDelete = async () => {
    if (selectedSubscribers.length === 0) return;

    if (!window.confirm(`Remove ${selectedSubscribers.length} selected subscriber(s)?`)) return;

    try {
      setActionLoading(true);

      await Promise.all(
        selectedSubscribers.map((email) =>
          axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriber/subscribers/${email}`)
        )
      );

      toast.success("Subscribers removed successfully");

      setSubscribers((prev) => prev.filter((sub) => !selectedSubscribers.includes(sub.email)));
      setSelectedSubscribers([]);

    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error("Failed to delete some subscribers");

    } finally {
      setActionLoading(false);
    }
  };

  // Search filter
  const filteredSubscribers = useMemo(() =>
    subscribers.filter((sub) =>
      sub.email.toLowerCase().includes(searchTerm.toLowerCase())
    ), [subscribers, searchTerm]
  );

  // Pagination
  const paginationData = useMemo(() => {
    const indexOfLast = currentPage * subscribersPerPage;
    const indexOfFirst = indexOfLast - subscribersPerPage;

    const current = filteredSubscribers.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredSubscribers.length / subscribersPerPage);

    return { current, totalPages, indexOfFirst, indexOfLast };
  }, [currentPage, filteredSubscribers]);

  const { current, totalPages, indexOfFirst, indexOfLast } = paginationData;

  // CSV Export
  const exportSubscribers = () => {
    const headers = ["Email", "Created Date"];

    const csv =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      subscribers
        .map((sub) =>
          `"${sub.email}","${new Date(sub.createdAt).toLocaleDateString()}"`
        )
        .join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `subscribers-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Exported successfully");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Newsletter Subscribers</h1>
        <p className="text-gray-600 mt-1">Manage your email subscription list</p>

        <div className="mt-4 p-4 bg-white border rounded-lg flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <FiUsers className="text-blue-600 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Subscribers</p>
            <p className="text-2xl font-bold">{subscribers.length}</p>
          </div>
        </div>
      </div>

      {/* SEARCH + ACTIONS */}
      <div className="max-w-6xl mx-auto bg-white p-6 border rounded-xl shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

          <div className="relative w-full max-w-md">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search email..."
              className="pl-10 pr-4 py-3 border rounded-lg w-full"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="flex gap-3">
            {selectedSubscribers.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 flex items-center"
              >
                <FiTrash2 className="mr-2" /> Delete Selected ({selectedSubscribers.length})
              </button>
            )}

            <button
              onClick={exportSubscribers}
              className="px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center"
            >
              <FiDownload className="mr-2" /> Export CSV
            </button>
          </div>

        </div>
      </div>

      {/* TABLE */}
      <div className="max-w-6xl mx-auto bg-white border rounded-xl shadow-sm overflow-hidden">

        {filteredSubscribers.length > 0 ? (
          <>
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedSubscribers.length === filteredSubscribers.length}
                      onChange={() =>
                        setSelectedSubscribers(
                          selectedSubscribers.length === filteredSubscribers.length
                            ? []
                            : filteredSubscribers.map((s) => s.email)
                        )
                      }
                    />
                  </th>
                  <th className="text-left p-4">Subscriber</th>
                  <th className="text-left p-4">Created Date</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {current.map((sub) => (
                  <tr key={sub.email} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.includes(sub.email)}
                        onChange={() =>
                          setSelectedSubscribers((prev) =>
                            prev.includes(sub.email)
                              ? prev.filter((e) => e !== sub.email)
                              : [...prev, sub.email]
                          )
                        }
                      />
                    </td>

                    <td className="p-4 flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FiUser className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{sub.email}</p>
                      </div>
                    </td>

                    <td className="p-4">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => setDeleteConfirm(sub)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINATION */}
            {filteredSubscribers.length > subscribersPerPage && (
              <div className="p-4 flex justify-between items-center border-t">
                <div className="text-sm text-gray-600">
                  Showing <strong>{indexOfFirst + 1}</strong> -{" "}
                  <strong>{Math.min(indexOfLast, filteredSubscribers.length)}</strong> of{" "}
                  <strong>{filteredSubscribers.length}</strong>
                </div>

                <div className="flex space-x-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="p-2 rounded bg-gray-100"
                  >
                    <FiChevronLeft />
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-100"}`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="p-2 rounded bg-gray-100"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-16 text-gray-500">
            <FiMail className="w-16 h-16 mx-auto mb-4 opacity-40" />
            <p>No subscribers yet</p>
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <div className="flex items-center mb-3">
              <FiAlertTriangle className="text-red-600 w-6 h-6 mr-2" />
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
            </div>

            <p className="text-gray-600 mb-4">Remove this subscriber?</p>

            <div className="bg-gray-100 p-3 rounded-lg mb-6">
              <p className="font-medium">{deleteConfirm.email}</p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={() => handleUnsubscribe(deleteConfirm.email)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SubscriptionManagement;

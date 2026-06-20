'use client';
import React from "react";
import { FiPackage, FiTruck, FiMapPin, FiInfo } from "react-icons/fi";

export default function ShipmentDetailsCard({ trackingNumber, carrier, scanDetails }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <FiPackage />
        Shipment Details
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-gray-700 mb-4">Shipping Information</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiPackage className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tracking Number</p>
                <p className="font-mono font-semibold">{trackingNumber}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiTruck className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Carrier</p>
                <p className="font-semibold">{carrier}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-700 mb-4">Recent Scans</h4>
          {scanDetails && scanDetails.length > 0 ? (
            <div className="space-y-3">
              {scanDetails.slice(0, 3).map((scan, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <FiInfo className="text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">
                      {scan.status?.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {scan.date} {scan.location ? `• ${scan.location}` : ''}
                    </p>
                    {scan.remark && (
                      <p className="text-sm text-gray-500 mt-1">{scan.remark}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No scan details available</p>
          )}
        </div>
      </div>
    </div>
  );
}
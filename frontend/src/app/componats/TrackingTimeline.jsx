'use client';
import React from "react";
import { FiCheck, FiClock } from "react-icons/fi";

export default function TrackingTimeline({ history, currentStatus }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Tracking History
      </h3>
      <div className="space-y-8">
        {history.map((step, index) => (
          <div key={index} className="flex gap-4">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${step.completed 
                  ? 'bg-green-500 text-white' 
                  : step.active
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-500'
                }
              `}>
                {step.completed ? (
                  <FiCheck size={16} />
                ) : (
                  step.icon && React.createElement(step.icon, { size: 16 })
                )}
              </div>
              {index < history.length - 1 && (
                <div className={`
                  w-0.5 flex-1 mt-2
                  ${step.completed ? 'bg-green-500' : 'bg-gray-200'}
                `} />
              )}
            </div>

            {/* Step details */}
            <div className="flex-1 pb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                <h4 className={`font-semibold ${
                  step.active ? 'text-blue-600' : 
                  step.completed ? 'text-green-600' : 
                  'text-gray-700'
                }`}>
                  {step.title}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FiClock size={14} />
                  {step.date}
                </div>
              </div>
              
              {step.location && (
                <p className="text-gray-600 mb-1 flex items-center gap-2">
                  <FiMapPin size={14} />
                  {step.location}
                </p>
              )}
              
              <p className="text-gray-500">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
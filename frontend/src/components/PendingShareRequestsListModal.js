import React from 'react';
import { format } from 'date-fns';

const PendingShareRequestsListModal = ({ requests, onClose, onViewDetails }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4 flex flex-col" style={{ maxHeight: '90vh' }}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Pending Share Requests</h2>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl">&times;</button>

        {requests.length === 0 ? (
          <div className="text-center text-gray-500">No pending requests.</div>
        ) : (
          <div className="flex-grow overflow-y-auto space-y-4 pr-2">
            {requests.map((request) => (
              <div key={request.id} className="p-4 border rounded-lg shadow-sm bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">Slot: {request.slot?.location || 'N/A'}</p>
                  <p className="text-sm text-gray-600">From: {request.requester?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(request.requestedStartTime), 'MMM dd, hh:mm a')} - {format(new Date(request.requestedEndTime), 'hh:mm a')}
                  </p>
                </div>
                <button
                  onClick={() => onViewDetails(request)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingShareRequestsListModal;
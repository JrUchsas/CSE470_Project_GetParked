
import React, { useState } from 'react';

const SlotModal = ({ slot, user, onClose, onReserve, onCancel, actionLoading }) => {
  const isReserved = slot.status === 'Reserved';
  const isReservedByUser = user && slot.user && slot.user.id === user.id;
  const isAdmin = user && user.role === 'admin';

  // Booking time state
  const [bookingStart, setBookingStart] = useState("");
  const [bookingEnd, setBookingEnd] = useState("");

  const handleReserveClick = () => {
    onReserve(slot, bookingStart, bookingEnd);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50">
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-xs text-center">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold"
        >
          &times;
        </button>
        <div className="flex flex-col items-center gap-1">
          <h3 className="text-xl font-bold mb-1">{slot.location}</h3>
          <p className="mb-3 text-sm text-gray-700">Parking slot at {slot.location}.</p>
          {!isReserved && (
            <div className="w-full flex flex-col gap-2 mb-2">
              <label className="text-xs text-gray-600 text-left">Start Time</label>
              <input
                type="datetime-local"
                className="w-full border rounded px-2 py-1"
                value={bookingStart}
                onChange={e => setBookingStart(e.target.value)}
              />
              <label className="text-xs text-gray-600 text-left">End Time</label>
              <input
                type="datetime-local"
                className="w-full border rounded px-2 py-1"
                value={bookingEnd}
                onChange={e => setBookingEnd(e.target.value)}
              />
            </div>
          )}
          {isReserved && (
            <>
              <p className="mb-2 text-xs text-gray-500">Reserved by: {slot.user?.name || 'Unknown'}</p>
              {slot.bookingStart && slot.bookingEnd && (
                <div className="mb-2 text-xs text-gray-600">
                  <div>Start: {new Date(slot.bookingStart).toLocaleString()}</div>
                  <div>End: {new Date(slot.bookingEnd).toLocaleString()}</div>
                </div>
              )}
            </>
          )}
          <div className="flex gap-2 justify-center mt-2">
            {!isReserved && (
              <button
                onClick={handleReserveClick}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded"
                disabled={actionLoading || !bookingStart || !bookingEnd}
              >
                {actionLoading ? 'Reserving...' : 'Reserve'}
              </button>
            )}
            {(isReservedByUser || isAdmin) && isReserved && (
              <button
                onClick={() => onCancel(slot)}
                className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-1 px-3 rounded"
                disabled={actionLoading}
              >
                {actionLoading ? 'Cancelling...' : 'Cancel Reservation'}
              </button>
            )}
            {isReserved && !isReservedByUser && !isAdmin && (
              <button
                className="bg-gray-300 text-gray-500 font-semibold py-1 px-3 rounded cursor-not-allowed"
                disabled
              >
                Reserved
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotModal;

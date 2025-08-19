import React from 'react';
import '../custom-slotmodal.css'; // Reusing styles for consistency

const CheckOutModal = ({ slot, onClose, onCheckOut }) => {
  return (
    <div className="slot-modal-overlay">
      <div className="slot-modal-card">
        <button
          onClick={onClose}
          className="slot-modal-close"
        >
          &times;
        </button>
        <div className="flex flex-col items-center gap-1">
          <h3 className="text-2xl font-bold mb-2">Slot: {slot.location}</h3>
          <p className="mb-4 text-base text-gray-700">Status: {slot.status}</p>
          {/* You can add more slot details here if needed */}
          <button
            onClick={() => {
              onCheckOut(slot); // Pass the entire slot object
              onClose(); // Close modal after check-out
            }}
            className="slot-modal-btn"
          >
            Check-out
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckOutModal;
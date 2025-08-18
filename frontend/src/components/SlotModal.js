
import React, { useState, useEffect } from 'react';
import { getVehiclesByOwner } from '../services/api';
import ErrorModal from './ErrorModal'; // Import ErrorModal
import '../custom-slotmodal.css'; // Reusing styles for consistency

const formatVehicleType = (type) => {
  if (type === 'suv') {
    return 'SUV';
  }
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const SlotModal = ({ slot, user, onClose, onReserve, onCancel, actionLoading }) => { // Removed setError prop
  const isReserved = slot.status === 'Reserved';
  const isReservedByUser = user && slot.user && slot.user.id === user.id;
  const isAdmin = user && user.role === 'admin';

  // Internal error state for SlotModal
  const [error, setError] = useState(''); // Add internal error state

  // Booking time state
  const [bookingStart, setBookingStart] = useState("");
  const [bookingEnd, setBookingEnd] = useState("");
  const [userVehicles, setUserVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  useEffect(() => {
    const fetchUserVehicles = async () => {
      if (user && user.id) {
        try {
          const vehicles = await getVehiclesByOwner(user.id);
          setUserVehicles(vehicles);
          if (vehicles.length > 0) {
            setSelectedVehicleId(vehicles[0].id); // Select first vehicle by default
          }
        } catch (error) {
          console.error('Failed to fetch user vehicles:', error);
        }
      }
    };
    fetchUserVehicles();
  }, [user]);

  const handleReserveClick = () => {

    const selectedVehicle = userVehicles.find(v => v.id === selectedVehicleId);

    if (!selectedVehicle) {
      setError('Please select a vehicle.');
      return;
    }

    // Type validation
    if (selectedVehicle.type !== slot.type) {
      setError(`Cannot park ${formatVehicleType(selectedVehicle.type)} vehicle in a ${formatVehicleType(slot.type)} slot.
                Please choose a ${formatVehicleType(selectedVehicle.type)} vehicle slot for parking.`);
      return;
    }

    onReserve(slot, bookingStart, bookingEnd, selectedVehicleId);
  };

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
          <h3 className="text-2xl font-bold mb-2">{slot.location}</h3>
          <p className="mb-4 text-base text-gray-700">Parking slot at {slot.location}.</p>
          {!isReserved && (
            <div className="w-full flex flex-col gap-4 mb-4">
              <label className="slot-modal-label">Choose Vehicle</label>
              <select
                className="slot-modal-input"
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                required
              >
                {userVehicles.length > 0 ? (
                  userVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.licensePlate} ({vehicle.model} - {formatVehicleType(vehicle.type)})
                    </option>
                  ))
                ) : (
                  <option value="">No vehicles registered</option>
                )}
              </select>
              <label className="slot-modal-label">Start Time</label>
              <input
                type="datetime-local"
                className="slot-modal-input"
                value={bookingStart}
                onChange={e => setBookingStart(e.target.value)}
              />
              <label className="slot-modal-label">End Time</label>
              <input
                type="datetime-local"
                className="slot-modal-input"
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
                className="slot-modal-btn"
                disabled={actionLoading || !bookingStart || !bookingEnd || !selectedVehicleId}
              >
                {actionLoading ? 'Reserving...' : 'Reserve'}
              </button>
            )}
            {(isReservedByUser || isAdmin) && isReserved && (
              <button
                onClick={() => onCancel(slot)}
                className="slot-modal-btn" style={{ backgroundColor: '#ccc', marginTop: '10px' }}
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
      {error && (
        <ErrorModal
          errorMessage={error}
          onClose={() => setError('')}
        />
      )}
    </div>
  );
};

export default SlotModal;

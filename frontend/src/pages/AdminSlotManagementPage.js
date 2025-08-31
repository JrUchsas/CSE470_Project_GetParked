import React, { useState, useEffect } from 'react';
import { getSlots, updateSlot, deleteSlot } from '../services/api';
import EditSlotModal from '../components/EditSlotModal';
import { getVehicleIcon, formatVehicleType } from '../components/VehicleIcons';
import '../styles/custom-admin.css';

const AdminSlotManagementPage = () => {
  const [slots, setSlots] = useState([]);
  const [editingSlot, setEditingSlot] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSlots = async () => {
    try {
        const data = await getSlots();
        setSlots(data);
    } catch (err) {
        setError('Could not fetch slots.');
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleEdit = (slot) => {
    setEditingSlot(slot);
  };

  const handleUpdateSlot = async (updatedSlot) => {
    setActionLoading(true);
    setError('');
    try {
      await updateSlot(updatedSlot.id, {
        location: updatedSlot.location,
        type: updatedSlot.type,
        bookingStart: updatedSlot.bookingStart ? new Date(updatedSlot.bookingStart).toISOString() : null,
        bookingEnd: updatedSlot.bookingEnd ? new Date(updatedSlot.bookingEnd).toISOString() : null,
      });
      setEditingSlot(null);
      fetchSlots();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (window.confirm('Are you sure you want to delete this slot?')) {
      setActionLoading(true);
      try {
        await deleteSlot(id);
        setEditingSlot(null);
        fetchSlots();
      } catch (err) {
        setError('Could not delete slot.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  return (
    <div className="modern-homepage-container">
      {/* Header Section */}
      <div className="homepage-header">
        <div className="header-content">
          <h1 className="homepage-title">
            <span className="title-icon">🅿️</span>
            Manage Parking Slots
          </h1>
          <p className="homepage-subtitle">
            View, edit, and delete parking slot configurations
          </p>
        </div>
      </div>

      {error && (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Error</h3>
          <p className="error-message">{error}</p>
        </div>
      )}

      <div className="admin-card"> {/* Re-using admin-card for consistent styling */}
        <div className="overflow-x-auto w-full">
          <table className="admin-table min-w-full bg-white rounded-lg overflow-hidden shadow text-center mx-auto">
            <thead>
              <tr>
                <th>Location</th>
                <th>Type</th>
                <th>Status</th>
                <th>Booking Time</th>
                <th>Booked By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id}>
                  <td className="py-4 px-6 align-middle">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-3 h-3 rounded-full inline-block mr-2 align-middle ${
                          slot.status === 'Available' ? 'bg-green-500' :
                          slot.status === 'Occupied' ? 'bg-red-500' : 'bg-yellow-400'
                        }`}></div>
                        <span className='text-lg'>🅿️</span>
                        <span className="block font-semibold text-gray-800">{slot.location}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-700">
                    <div className="flex items-center justify-center gap-2">
                      {slot.type && (
                        <span className="w-5 h-5 inline-flex items-center justify-center flex-shrink-0">
                          {getVehicleIcon(slot.type, 'w-full h-full')}
                        </span>
                      )}
                      {slot.type ? formatVehicleType(slot.type) : ''}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                      slot.status === 'Available' ? 'bg-green-100 text-green-700' :
                      slot.status === 'Occupied' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {slot.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {slot.bookingStart && slot.bookingEnd ? (
                      <div className="text-sm space-y-1">
                        <div className="font-medium text-gray-700">
                          Start: {new Date(slot.bookingStart).toLocaleString()}
                        </div>
                        <div className="font-medium text-gray-700">
                          End: {new Date(slot.bookingEnd).toLocaleString()}
                        </div>
                        <div className="text-blue-700 font-semibold text-center mt-2">
                          Duration: {(() => {
                            const start = new Date(slot.bookingStart);
                            const end = new Date(slot.bookingEnd);
                            const diffMs = end - start;
                            if (diffMs <= 0) return 'Invalid';
                            const hours = Math.floor(diffMs / (1000 * 60 * 60));
                            const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                            return `${hours}h ${mins}m`;
                          })()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm font-medium">No booking</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {slot.user && (slot.status === 'Reserved' || slot.status === 'Occupied') ? (
                      <div className="flex flex-col">
                        <span className={`font-medium ${slot.status === 'Reserved' ? 'text-green-700' : 'text-red-700'}`}>
                          {slot.user.name}
                          {slot.status === 'Occupied' && (
                            <span className="text-xs text-gray-500 ml-1">(Currently Parked)</span>
                          )}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm font-medium">No user</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(slot)}
                        className="admin-btn update"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="admin-btn delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingSlot && (
        <EditSlotModal
          slot={editingSlot}
          onClose={() => setEditingSlot(null)}
          onUpdate={handleUpdateSlot}
          onDelete={handleDeleteSlot}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default AdminSlotManagementPage;
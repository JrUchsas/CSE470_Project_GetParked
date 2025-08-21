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
    <div className="admin-dashboard-container"> {/* Re-using admin-dashboard-container for consistent padding/width */}
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Manage Parking Slots</h2>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
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
                <tr key={slot.id} style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  borderRadius: '0.75rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                }}>
                  <td className="h-full align-middle" style={{ padding: '1rem' }}>
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      <div className="flex items-center justify-center gap-2 w-full">
                        <div className={`w-3 h-3 rounded-full inline-block mr-2 align-middle ${
                          slot.status === 'Available' ? 'bg-green-500' :
                          slot.status === 'Occupied' ? 'bg-red-500' : 'bg-yellow-400'
                        }`} style={{
                          boxShadow: slot.status === 'Available' ? '0 2px 4px rgba(34, 197, 94, 0.3)' :
                                    slot.status === 'Occupied' ? '0 2px 4px rgba(239, 68, 68, 0.3)' :
                                    '0 2px 4px rgba(251, 191, 36, 0.3)'
                        }}></div>
                        <span className='text-lg'>🅿️</span>
                        <span className="block w-full text-center font-semibold text-gray-800">{slot.location}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '500', color: '#374151' }}>
                    <div className="flex items-center justify-center gap-2">
                      {slot.type && (
                        <span style={{
                          width: '1.2em',
                          height: '1.2em',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {getVehicleIcon(slot.type, 'w-full h-full')}
                        </span>
                      )}
                      {slot.type ? formatVehicleType(slot.type) : ''}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                      slot.status === 'Available' ? 'bg-green-100 text-green-700' :
                      slot.status === 'Occupied' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`} style={{
                      background: slot.status === 'Available' ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' :
                                 slot.status === 'Occupied' ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' :
                                 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                    }}>
                      {slot.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {slot.bookingStart && slot.bookingEnd ? (
                      <div className="text-sm space-y-1">
                        <div className="font-medium text-gray-700">
                          <svg style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.25rem', color: '#3b82f6' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                          </svg>
                          Start: {new Date(slot.bookingStart).toLocaleString()}
                        </div>
                        <div className="font-medium text-gray-700">
                          <svg style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.25rem', color: '#3b82f6' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                          </svg>
                          End: {new Date(slot.bookingEnd).toLocaleString()}
                        </div>
                        <div className="text-blue-700 font-semibold text-center mt-2" style={{
                          fontSize: '0.875rem'
                        }}>
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
                  <td style={{ padding: '1rem' }}>
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
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEdit(slot)}
                        className="slot-modal-btn primary"
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.875rem',
                          width: 'auto'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="slot-modal-btn danger"
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.875rem',
                          width: 'auto'
                        }}
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
import React, { useState, useEffect } from 'react';
import { getSlots, createSlot, updateSlot, deleteSlot, getAllVehicles, updateVehicle, deleteVehicle } from '../services/api';
import EditSlotModal from '../components/EditSlotModal';
import CreateSlotModal from '../components/CreateSlotModal';
import VehicleForm from '../components/VehicleForm';
import { getVehicleIcon, formatVehicleType } from '../components/VehicleIcons';

import '../custom-admin.css';

const AdminDashboard = () => {
  const [slots, setSlots] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const [vehicles, setVehicles] = useState([]);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const fetchSlots = async () => {
    try {
        const data = await getSlots();
        setSlots(data);
    } catch (err) {
        setError('Could not fetch slots.');
    }
  };

  const fetchVehicles = async () => {
    try {
      const data = await getAllVehicles();
      setVehicles(data);
    } catch (err) {
      setError('Could not fetch vehicles.');
    }
  };

  const handleCreateSlotClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateSlot = async ({ location, type }) => {
    console.log('Attempting to create slot with:', { location, type });
    setError('');
    try {
      await createSlot({ location, type });
      console.log('Slot created successfully!');
      fetchSlots();
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error creating slot:', err);
      setError(err.response?.data?.message || 'An error occurred.');
    }
  };

  useEffect(() => {
    fetchSlots();
    fetchVehicles();
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
        type: updatedSlot.type, // Include type in the update
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this slot?')) {
      await deleteSlot(id);
      fetchSlots(); // Refresh list
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
  };

  const handleUpdateVehicle = async (updatedVehicle) => {
    setActionLoading(true);
    setError('');
    try {
      await updateVehicle(updatedVehicle.id, updatedVehicle);
      setEditingVehicle(null);
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      setActionLoading(true);
      try {
        await deleteVehicle(id);
        fetchVehicles();
      } catch (err) {
        setError('Could not delete vehicle.');
      } finally {
        setActionLoading(false);
      }
    }
  };



  return (
    <div className="admin-dashboard-container grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-center items-center justify-center mx-auto">
      <div className="md:col-span-1 admin-card flex flex-col items-center mx-auto">
        <h3 className="text-2xl font-bold mb-4 mx-auto">Slot Management</h3>
        <button
          onClick={handleCreateSlotClick}
          className="slot-modal-btn primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            width: 'auto',
            padding: '0.875rem 1.5rem'
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '1.2rem', height: '1.2rem' }}>
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create New Slot
        </button>
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

      <div className="md:col-span-2 admin-card flex flex-col items-center mx-auto">
        <h3 className="text-2xl font-bold mb-4 mx-auto">Manage Existing Slots</h3>

        <div className="overflow-x-auto w-full mx-auto">
          <table className="admin-table min-w-full bg-white rounded-lg overflow-hidden shadow text-center mx-auto">
            <thead>
              <tr>
                <th style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', color: '#1e293b', fontWeight: '600' }}>Location</th>
                <th style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', color: '#1e293b', fontWeight: '600' }}>Type</th>
                <th style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', color: '#1e293b', fontWeight: '600' }}>Status</th>
                <th style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', color: '#1e293b', fontWeight: '600' }}>Booking Time</th>
                <th style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', color: '#1e293b', fontWeight: '600' }}>Booked By</th>
                <th style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', color: '#1e293b', fontWeight: '600' }}>Actions</th>
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
                    {slot.user && slot.status === 'Reserved' ? (
                      <span className="font-medium text-green-700">{slot.user.name}</span>
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
                        onClick={() => handleDelete(slot.id)}
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

      <div className="md:col-span-3 admin-card flex flex-col items-center mx-auto">
        <h3 className="text-2xl font-bold mb-4 mx-auto">Manage Existing Vehicles</h3>
        <div className="overflow-x-auto w-full mx-auto">
          <table className="admin-table min-w-full bg-white rounded-lg overflow-hidden shadow text-center mx-auto">
            <thead>
              <tr>
                <th>License Plate</th>
                <th>Model</th>
                <th>Type</th>
                <th>Color</th>
                <th>Owner</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>{vehicle.licensePlate}</td>
                  <td>{vehicle.model}</td>
                  <td>
                    <div className="flex items-center justify-center gap-2">
                      {vehicle.type && (
                        <span style={{
                          width: '1.2em',
                          height: '1.2em',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {getVehicleIcon(vehicle.type, 'w-full h-full')}
                        </span>
                      )}
                      {vehicle.type ? formatVehicleType(vehicle.type) : ''}
                    </div>
                  </td>
                  <td>{vehicle.color}</td>
                  <td>{vehicle.owner ? vehicle.owner.name : 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEditVehicle(vehicle)}
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
                        onClick={() => handleDeleteVehicle(vehicle.id)}
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

      {editingVehicle && (
        <div className="slot-modal-overlay" onClick={() => setEditingVehicle(null)}>
          <div className="slot-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setEditingVehicle(null)}
              className="slot-modal-close"
              aria-label="Close modal"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="slot-modal-content">
              <VehicleForm
                vehicle={editingVehicle}
                onSave={() => {
                  setEditingVehicle(null);
                  fetchVehicles();
                }}
                onCancel={() => setEditingVehicle(null)}
                ownerId={editingVehicle.ownerId}
              />
            </div>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <CreateSlotModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreateSlot={handleCreateSlot}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
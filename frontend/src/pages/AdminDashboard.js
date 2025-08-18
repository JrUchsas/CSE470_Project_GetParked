import React, { useState, useEffect } from 'react';
import { getSlots, createSlot, updateSlot, deleteSlot, getAllVehicles, updateVehicle, deleteVehicle } from '../services/api';
import EditSlotModal from '../components/EditSlotModal';
import CreateSlotModal from '../components/CreateSlotModal';
import { VehicleForm } from './VehiclePage'; // Reusing VehicleForm from VehiclePage
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
          className="admin-btn update"
        >
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
                  <td className="h-full align-middle">
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      <div className="flex items-center justify-center gap-2 w-full">
                        <span className={`w-3 h-3 rounded-full inline-block mr-2 align-middle ${slot.status === 'Available' ? 'bg-green-500' : slot.status === 'Occupied' ? 'bg-red-500' : 'bg-yellow-400'}`}></span>
                        <span className='text-lg'>🅿️</span>
                        <span className="block w-full text-center font-semibold text-gray-800">{slot.location}</span>
                      </div>
                    </div>
                  </td>
                  <td>{slot.type === 'suv' ? 'SUV' : (slot.type ? slot.type.charAt(0).toUpperCase() + slot.type.slice(1) : '')}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${slot.status === 'Available' ? 'bg-green-100 text-green-700' : slot.status === 'Occupied' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{slot.status}</span>
                  </td>
                  <td className="text-xs">
                    {slot.bookingStart && slot.bookingEnd ? (
                      <>
                        {new Date(slot.bookingStart).toLocaleString()}<br/>to<br/>{new Date(slot.bookingEnd).toLocaleString()}
                        <br/>
                        <span className="text-blue-700 font-semibold">
                          Duration: {(() => {
                            const start = new Date(slot.bookingStart);
                            const end = new Date(slot.bookingEnd);
                            const diffMs = end - start;
                            if (diffMs <= 0) return 'Invalid';
                            const hours = Math.floor(diffMs / (1000 * 60 * 60));
                            const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                            return `${hours}h ${mins}m`;
                          })()}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="text-xs">
                    {slot.user && slot.status === 'Reserved' ? (
                      <span>{slot.user.name}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleEdit(slot)} className="text-blue-600 hover:underline mr-4 font-medium">Edit</button>
                    <button onClick={() => handleDelete(slot.id)} className="text-red-600 hover:underline font-medium">Delete</button>
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
                  <td>{vehicle.type === 'suv' ? 'SUV' : (vehicle.type ? vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1) : '')}</td>
                  <td>{vehicle.color}</td>
                  <td>{vehicle.owner ? vehicle.owner.name : 'N/A'}</td>
                  <td>
                    <button onClick={() => handleEditVehicle(vehicle)} className="text-blue-600 hover:underline mr-4 font-medium">Edit</button>
                    <button onClick={() => handleDeleteVehicle(vehicle.id)} className="text-red-600 hover:underline font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingVehicle && (
        <VehicleForm
          vehicle={editingVehicle}
          onClose={() => {
            setEditingVehicle(null);
            fetchVehicles(); // Re-fetch vehicles after closing the modal
          }}
          ownerId={editingVehicle.ownerId} // Pass ownerId for update
          onUpdate={handleUpdateVehicle}
        />
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
import React, { useState, useEffect } from 'react';
import { getSlots, createSlot, updateSlot, deleteSlot } from '../services/api';
import EditSlotModal from '../components/EditSlotModal';
import '../custom-admin.css';

const AdminDashboard = () => {
  const [slots, setSlots] = useState([]);
  const [location, setLocation] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) return;
    setError('');
    try {
      await createSlot({ location });
      setLocation('');
      fetchSlots();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    }
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
  };

  const handleUpdateSlot = async (updatedSlot) => {
    setActionLoading(true);
    setError('');
    try {
      await updateSlot(updatedSlot.id, {
        location: updatedSlot.location,
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



  return (
    <div className="admin-dashboard-container grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-center items-center justify-center mx-auto">
      <div className="md:col-span-1 admin-card flex flex-col items-center mx-auto">
        <h3 className="text-2xl font-bold mb-4 mx-auto">Create New Slot</h3>
        <form onSubmit={handleSubmit} className="w-full max-w-xs mx-auto flex flex-col items-center text-center">
          <label htmlFor="location" className="block text-gray-700 font-medium mb-1 flex items-center gap-2 justify-center text-center">
            <span role="img" aria-label="slot">🅿️</span> Slot Location (e.g., A-01)
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition mb-2 text-center mx-auto"
            placeholder="Enter location"
          />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <button
            type="submit"
            className="admin-btn update w-full mt-2 mx-auto"
          >
            Create Slot
          </button>
        </form>
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
    </div>
  );
};

export default AdminDashboard;
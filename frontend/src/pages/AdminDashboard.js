import React, { useState, useEffect } from 'react';
import { getSlots, createSlot, updateSlot, deleteSlot } from '../services/api';

const AdminDashboard = () => {
  const [slots, setSlots] = useState([]);
  const [location, setLocation] = useState('');
  const [editingSlot, setEditingSlot] = useState(null);
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
        if (editingSlot) {
            await updateSlot(editingSlot._id, { location });
        } else {
            await createSlot({ location });
        }
        setLocation('');
        setEditingSlot(null);
        fetchSlots(); // Refresh list
    } catch (err) {
        setError(err.response?.data?.message || 'An error occurred.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this slot?')) {
      await deleteSlot(id);
      fetchSlots(); // Refresh list
    }
  };

  const handleEdit = (slot) => {
      setEditingSlot(slot);
      setLocation(slot.location);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-center items-center justify-center mx-auto">
      <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-lg flex flex-col items-center mx-auto">
        <h3 className="text-2xl font-bold mb-4 mx-auto">{editingSlot ? "Edit Slot" : "Create New Slot"}</h3>
        <form onSubmit={handleSubmit} className="w-full text-center mx-auto">
          <div className="mb-4">
            <label htmlFor="location" className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
              <span role="img" aria-label="slot">🅿️</span> Slot Location (e.g., A-01)
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="Enter location"
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            {editingSlot ? "Update Slot" : "Create Slot"}
          </button>
          {editingSlot && (
              <button
                type="button"
                onClick={() => { setEditingSlot(null); setLocation(''); setError(''); }}
                className="w-full mt-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                Cancel Edit
              </button>
          )}
        </form>
      </div>

      <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-lg flex flex-col items-center mx-auto">
        <h3 className="text-2xl font-bold mb-4 mx-auto">Manage Existing Slots</h3>
        <div className="overflow-x-auto w-full mx-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow text-center mx-auto">
            <thead className="bg-blue-100">
              <tr>
                <th className="py-2 px-4 text-left font-semibold">Location</th>
                <th className="py-2 px-4 text-left font-semibold">Status</th>
                <th className="py-2 px-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot._id} className="border-b hover:bg-blue-50 transition">
                  <td className="py-2 px-4 flex items-center gap-2"><span className='text-lg'>🅿️</span> {slot.location}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${slot.status === 'Available' ? 'bg-green-100 text-green-700' : slot.status === 'Occupied' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{slot.status}</span>
                  </td>
                  <td className="py-2 px-4">
                    <button onClick={() => handleEdit(slot)} className="text-blue-600 hover:underline mr-4 font-medium">Edit</button>
                    <button onClick={() => handleDelete(slot._id)} className="text-red-600 hover:underline font-medium">Delete</button>
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
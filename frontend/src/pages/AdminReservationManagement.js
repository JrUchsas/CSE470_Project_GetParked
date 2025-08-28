import React, { useState, useEffect } from 'react';
import { getAllReservationHistory, updateReservation, deleteReservation } from '../services/api';
import EditReservationModal from '../components/EditReservationModal';

import '../styles/custom-admin.css';

const AdminReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [editingReservation, setEditingReservation] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await getAllReservationHistory();
      setReservations(data);
      setError('');
    } catch (err) {
      setError('Failed to load reservation data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  

  const handleCloseModal = () => {
    setSelectedReservation(null);
  };

  const handleEdit = (reservation) => {
    setEditingReservation(reservation);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      try {
        await deleteReservation(id);
        fetchReservations(); // Refresh list
      } catch (error) {
        alert('Failed to delete reservation.');
      }
    }
  };

  const handleUpdate = async (updatedReservation) => {
    try {
      await updateReservation(updatedReservation.id, updatedReservation);
      setIsEditModalOpen(false);
      setEditingReservation(null);
      fetchReservations(); // Refresh list
    } catch (error) {
      alert('Failed to update reservation.');
    }
  };

  

  const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString();

  return (
    <div className="admin-container">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Manage Reservations</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      
      <div className="admin-card">
        <div className="overflow-x-auto w-full">
          <table className="admin-table min-w-full bg-white rounded-lg overflow-hidden shadow text-center mx-auto">
            <thead>
              <tr>
                <th>User</th>
                <th>Vehicle</th>
                <th>Slot</th>
                <th>Booking Period</th>
                <th>Status</th>
                <th>Violation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center p-4">Loading...</td></tr>
              ) : reservations.map((res) => (
                <tr key={res.id}>
                  <td>{res.user?.name || 'N/A'}</td>
                  <td>{res.vehiclePlate}</td>
                  <td>{res.slotLocation}</td>
                  <td>{formatDateTime(res.reservedStart)} to {formatDateTime(res.reservedEnd)}</td>
                  <td>
                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${res.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {res.paymentStatus}
                    </span>
                  </td>
                  <td>
                    {res.violationType ? (
                      <span className="text-red-600 font-semibold">
                        {res.violationType} (${res.penaltyFee})
                      </span>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2 justify-center whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(res)}
                        className="admin-btn update"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(res.id)}
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

      {isEditModalOpen && editingReservation && (
        <>
          <EditReservationModal
            reservation={editingReservation}
            onClose={() => setIsEditModalOpen(false)}
            onUpdate={handleUpdate}
          />
        </>
      )}
    </div>
  );
};

export default AdminReservationManagement;
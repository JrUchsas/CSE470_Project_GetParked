import React, { useState, useEffect } from 'react';
import { getAllReservationHistory, reportViolation } from '../services/api';
import ReportViolationModal from '../components/ReportViolationModal';
import '../styles/custom-admin.css';

const AdminReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await getAllReservationHistory();
      setReservations(data);
      setError('');
    } catch (err) {
      setError('Failed to load reservation data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleReportClick = (reservation) => {
    setSelectedReservation(reservation);
  };

  const handleCloseModal = () => {
    setSelectedReservation(null);
  };

  const handleReportSubmit = async (id, violationData) => {
    await reportViolation(id, violationData);
    fetchReservations(); // Refresh data after reporting
  };

  const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString();

  return (
    <div className="admin-dashboard-container">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Manage Reservations</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      
      <div className="admin-card">
        <div className="overflow-x-auto w-full">
          <table className="admin-table min-w-full bg-white">
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
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${res.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
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
                    <button 
                      onClick={() => handleReportClick(res)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                      disabled={!!res.violationType} // Disable if violation already exists
                    >
                      {res.violationType ? 'Reported' : 'Report'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReservation && (
        <ReportViolationModal 
          reservation={selectedReservation}
          onClose={handleCloseModal}
          onReport={handleReportSubmit}
        />
      )}
    </div>
  );
};

export default AdminReservationManagement;

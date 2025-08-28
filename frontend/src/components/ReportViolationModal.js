import React, { useState } from 'react';

const ReportViolationModal = ({ reservation, onClose, onReport }) => {
  const [violationType, setViolationType] = useState('Improper Parking');
  const [penaltyFee, setPenaltyFee] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!penaltyFee || isNaN(penaltyFee) || penaltyFee <= 0) {
      setError('Please enter a valid, positive penalty fee.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onReport(reservation.id, {
        violationType,
        penaltyFee: parseInt(penaltyFee, 10),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report violation.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Report Violation</h2>
        <p className="mb-2 text-gray-600">Reservation ID: <span className="font-mono">{reservation.id}</span></p>
        <p className="mb-6 text-gray-600">Vehicle: <span className="font-semibold">{reservation.vehiclePlate}</span></p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="violationType" className="block text-sm font-medium text-gray-700 mb-1">Violation Type</label>
            <select
              id="violationType"
              value={violationType}
              onChange={(e) => setViolationType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option>Improper Parking</option>
              <option>Overstay</option>
              <option>Unauthorized Area</option>
              <option>Other</option>
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="penaltyFee" className="block text-sm font-medium text-gray-700 mb-1">Penalty Fee ($)</label>
            <input
              id="penaltyFee"
              type="number"
              value={penaltyFee}
              onChange={(e) => setPenaltyFee(e.target.value)}
              placeholder="e.g., 50"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400"
              disabled={loading}
            >
              {loading ? 'Reporting...' : 'Report Violation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportViolationModal;

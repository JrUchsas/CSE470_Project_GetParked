import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateSlotModal from '../components/CreateSlotModal';
import AdminStatistics from '../components/AdminStatistics';
import '../styles/custom-admin.css';
import { createSlot } from '../services/api'; // <--- ADD THIS IMPORT

const AdminDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateSlotClick = () => {
    setIsCreateModalOpen(true);
  };

  // MODIFY THIS FUNCTION
  const handleCreateSlot = async (slotData) => { // Change parameter to slotData
    try {
      
      await createSlot(slotData); // <--- CALL THE ACTUAL API FUNCTION
      
      setIsCreateModalOpen(false);
      // You might want to trigger a refresh of the slot list here if there's one
      // For now, we'll just close the modal.
    } catch (error) {
      console.error('Error creating slot:', error);
      setError('Failed to create slot. Please check console for details.'); // Display error to user
    }
  };

  return (
    <div className="admin-container"> {/* Changed class name */}
      <div className="homepage-header"> {/* Added header */}
        <div className="header-content">
          <h1 className="homepage-title">
            <span className="title-icon">⚙️</span> Admin Dashboard
          </h1>
          <p className="homepage-subtitle">Manage your parking system with ease.</p>
        </div>
      </div>

      <AdminStatistics />

      {error && (
        <div className="error-container"> {/* Changed class name */}
          <div className="error-icon">❌</div>
          <h3 className="error-title">Error!</h3>
          <p className="error-message">{error}</p>
        </div>
      )}

      <div className="admin-dashboard-grid">
        {/* Create Slot Tile */}
        <div className="admin-dashboard-tile" onClick={handleCreateSlotClick}>
          <span className="tile-icon">➕</span>
          <h3 className="tile-title">Create Slot</h3>
          <p className="tile-description">Add a new parking slot to the system.</p>
        </div>

        {/* Manage Existing Slots Tile */}
        <div className="admin-dashboard-tile" onClick={() => navigate('/admin/manage-slots')}>
          <span className="tile-icon">🅿️</span>
          <h3 className="tile-title">Manage Existing Slots</h3>
          <p className="tile-description">View, edit, or delete parking slots.</p>
        </div>

        {/* Manage Reservations Tile */}
        <div className="admin-dashboard-tile" onClick={() => navigate('/admin/manage-reservations')}>
          <span className="tile-icon">📅</span>
          <h3 className="tile-title">Manage Reservations</h3>
          <p className="tile-description">View all reservations and report violations.</p>
        </div>

        {/* Manage Users Tile */}
        <div className="admin-dashboard-tile" onClick={() => navigate('/admin/manage-users')}>
          <span className="tile-icon">👥</span>
          <h3 className="tile-title">Manage Users</h3>
          <p className="tile-description">View and manage user accounts.</p>
        </div>

        {/* Manage Registered Vehicles Tile */}
        <div className="admin-dashboard-tile" onClick={() => navigate('/admin/vehicles')}>
          <span className="tile-icon">🚗</span>
          <h3 className="tile-title">Manage Registered Vehicles</h3>
          <p className="tile-description">View and manage all registered vehicles.</p>
        </div>

        {/* User Feedback Tile */}
        <div className="admin-dashboard-tile" onClick={() => navigate('/admin/feedback')}>
          <span className="tile-icon">⭐</span>
          <h3 className="tile-title">User Feedback</h3>
          <p className="tile-description">View and analyze user ratings and comments.</p>
        </div>

        {/* Booking Statistics Tile */}
        <div className="admin-dashboard-tile" onClick={() => navigate('/admin/booking-statistics')}>
          <span className="tile-icon">📊</span>
          <h3 className="tile-title">Booking Statistics</h3>
          <p className="tile-description">View monthly booking trends and calendar.</p>
        </div>

        {/* Payment History Tile */}
        <div className="admin-dashboard-tile" onClick={() => navigate('/admin/payment-history')}>
          <span className="tile-icon">💰</span>
          <h3 className="tile-title">Payment History</h3>
          <p className="tile-description">View payment invoices and revenue statistics.</p>
        </div>
      </div>

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
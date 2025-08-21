import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateSlotModal from '../components/CreateSlotModal';
import '../styles/custom-admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateSlotClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateSlot = async ({ location, type }) => {
    console.log('Creating slot:', { location, type });
    return new Promise(resolve => setTimeout(() => {
      console.log('Slot created (simulated)');
      setIsCreateModalOpen(false);
      resolve();
    }, 500));
  };

  return (
    <div className="admin-dashboard-container">
      {error && (
        <div className="md:col-span-3 mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
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
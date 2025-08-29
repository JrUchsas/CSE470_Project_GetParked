import React, { useState, useEffect } from 'react';
import { getAllVehicles, deleteVehicle } from '../services/api'; // Added deleteVehicle
import VehicleForm from '../components/VehicleForm'; // Added VehicleForm
import { getVehicleIcon, formatVehicleType } from '../components/VehicleIcons';

const AdminVehicleViewPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [editingVehicle, setEditingVehicle] = useState(null); // Added state

  const fetchAllVehicles = async () => {
    try {
      const response = await getAllVehicles();
      setVehicles(response || []);
    } catch (error) {
      console.error('Failed to fetch all vehicles', error);
      setVehicles([]);
    }
  };

  useEffect(() => {
    fetchAllVehicles();
  }, []);

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
  };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle(id);
        fetchAllVehicles(); // Refresh list
      } catch (err) {
        console.error('Could not delete vehicle:', err);
        alert('Failed to delete vehicle.');
      }
    }
  };

  return (
    <div className="modern-homepage-container">
      {/* Header Section */}
      <div className="homepage-header">
        <div className="header-content">
          <h1 className="homepage-title">
            <span className="title-icon">🚗</span>
            Manage Registered Vehicles
          </h1>
          <p className="homepage-subtitle">
            View and manage all registered vehicles in the system
          </p>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🤷‍♂️</div>
          <h3 className="empty-title">No vehicles registered yet.</h3>
          <p className="empty-description">There are no vehicles currently registered in the system.</p>
        </div>
      ) : (
        <div className="admin-card"> {/* Re-using admin-card for consistent styling */}
          <div className="overflow-x-auto w-full">
            <table className="admin-table min-w-full bg-white mx-auto"><thead><tr>
                  <th>License Plate</th><th>Model</th><th>Type</th><th>Color</th><th>Owner Name</th><th>Owner Email</th><th>Actions</th> {/* Added Actions column */}</tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.licensePlate}</td>
                    <td>{vehicle.model}</td>
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        {vehicle.type && (
                          <span className="w-5 h-5 inline-flex items-center justify-center flex-shrink-0">
                            {getVehicleIcon(vehicle.type, 'w-full h-full')}
                          </span>
                        )}
                        {vehicle.type ? formatVehicleType(vehicle.type) : ''}
                      </div>
                    </td>
                    <td>{vehicle.color}</td>
                    <td>{vehicle.owner ? vehicle.owner.name : 'N/A'}</td>
                    <td>{vehicle.owner ? vehicle.owner.email : 'N/A'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEditVehicle(vehicle)}
                          className="admin-btn update"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteVehicle(vehicle.id)}
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
      )}

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
                  fetchAllVehicles();
                }}
                onCancel={() => setEditingVehicle(null)}
                ownerId={editingVehicle.ownerId}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVehicleViewPage;
import React, { useState, useEffect, useCallback } from 'react';
import { getVehiclesByOwner, deleteVehicle } from '../services/api';
import VehicleForm from '../components/VehicleForm';
import { getVehicleIcon, formatVehicleType } from '../components/VehicleIcons';

const VehiclePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
    }
  }, []);

  const fetchVehicles = useCallback(async () => {
    if (!user) return;
    try {
      const response = await getVehiclesByOwner(user.id);
      setVehicles(response || []);
    } catch (error) {
      // Error handling for vehicle fetching
      setVehicles([]); // Ensure vehicles is an empty array on error
    }
  }, [user]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteVehicle(id);
      fetchVehicles();
    } catch (error) {
      // Error handling for vehicle deletion
    }
  };

  const handleModalClose = () => {
    setSelectedVehicle(null);
    setIsModalOpen(false);
    fetchVehicles();
  };

  const handleSave = () => {
    setIsModalOpen(false);
    fetchVehicles();
  }

  return (
    <div className="flex flex-col w-full mx-auto">
      <h1 className="text-2xl font-bold mb-4 mx-auto">My Vehicles</h1>

      {/* Modern Add Vehicle Button */}
      <div className="mb-6 flex justify-center">
        <button
          onClick={() => setIsModalOpen(true)}
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
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.6-1.6-1.6L18 10.5l-2-3c-.3-.5-.8-.5-1.3-.5H9.3c-.5 0-1 0-1.3.5l-2 3-2.4 1.4C2.7 11.4 2 12.1 2 13v3c0 .6.4 1 1 1h2"/>
            <circle cx="7" cy="17" r="2"/>
            <circle cx="17" cy="17" r="2"/>
            <line x1="12" y1="8" x2="12" y2="14"/>
            <line x1="9" y1="11" x2="15" y2="11"/>
          </svg>
          Add Vehicle
        </button>
      </div>

      <div className="overflow-x-auto w-full mx-auto">
        <table className="admin-table min-w-full bg-white rounded-lg overflow-hidden shadow text-center mx-auto">
          <thead>
            <tr>
              <th className="py-2 px-4">License Plate</th>
              <th className="py-2 px-4">Model</th>
              <th className="py-2 px-4">Type</th>
              <th className="py-2 px-4">Color</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td className="py-2 px-4">{vehicle.licensePlate || ''}</td>
                <td className="py-2 px-4">{vehicle.model || ''}</td>
                <td className="py-2 px-4">
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
                <td className="py-2 px-4">{vehicle.color || ''}</td>
                <td className="py-2 px-4">
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleEdit(vehicle)}
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
                      onClick={() => handleDelete(vehicle.id)}
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
      {isModalOpen && (
        <div className="slot-modal-overlay" onClick={handleModalClose}>
          <div className="slot-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleModalClose}
              className="slot-modal-close"
              aria-label="Close modal"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="slot-modal-content">
              <VehicleForm vehicle={selectedVehicle} onSave={handleSave} onCancel={handleModalClose} ownerId={user.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclePage;

import React, { useState, useEffect } from 'react';
import { getVehiclesByOwner, deleteVehicle } from '../services/api';
import VehicleForm from '../components/VehicleForm';

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

  const fetchVehicles = async () => {
    if (!user) return;
    try {
      const response = await getVehiclesByOwner(user.id);
      setVehicles(response || []);
    } catch (error) {
      console.error('Failed to fetch vehicles', error);
      setVehicles([]); // Ensure vehicles is an empty array on error
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [user]);

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteVehicle(id);
      fetchVehicles();
    } catch (error) {
      console.error('Failed to delete vehicle', error);
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
      <button onClick={() => setIsModalOpen(true)} className="admin-btn update">Add Vehicle</button>
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
                <td className="py-2 px-4">{vehicle.type === 'suv' ? 'SUV' : (vehicle.type ? vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1) : '')}</td>
                <td className="py-2 px-4">{vehicle.color || ''}</td>
                <td className="py-2 px-4">
                  <button onClick={() => handleEdit(vehicle)} className="text-blue-600 hover:underline mr-4 font-medium">Edit</button>
                  <button onClick={() => handleDelete(vehicle.id)} className="text-red-600 hover:underline font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="vehicle-modal-overlay">
          <div className="vehicle-modal-card">
            <button onClick={handleModalClose} className="vehicle-modal-close">
              &times;
            </button>
            <VehicleForm vehicle={selectedVehicle} onSave={handleSave} onCancel={handleModalClose} ownerId={user.id} />
            </div>
        </div>
      )}
    </div>
  );
};

export default VehiclePage;

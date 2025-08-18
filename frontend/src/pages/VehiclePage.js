import React, { useState, useEffect } from 'react';
import { getVehiclesByOwner, createVehicle, updateVehicle, deleteVehicle } from '../services/api';

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

  return (
    <div>
      <h1>My Vehicles</h1>
      <button onClick={() => setIsModalOpen(true)}>Add Vehicle</button>
      <table>
        
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id}>
              <td>{vehicle.licensePlate}</td>
              
              <td>{vehicle.model}</td>
              <td>{vehicle.type}</td>
              <td>{vehicle.color}</td>
              <td>
                <button onClick={() => handleEdit(vehicle)}>Edit</button>
                <button onClick={() => handleDelete(vehicle.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && (
        <VehicleForm vehicle={selectedVehicle} onClose={handleModalClose} ownerId={user.id} />
      )}
    </div>
  );
};

const VehicleForm = ({ vehicle, onClose, ownerId }) => {
  const [formData, setFormData] = useState({
    licensePlate: vehicle ? vehicle.licensePlate : '',
    model: vehicle ? vehicle.model : '',
    color: vehicle ? vehicle.color : '',
    type: vehicle ? vehicle.type : 'car', // Default to 'car'
    ownerId: ownerId,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (vehicle) {
        await updateVehicle(vehicle.id, formData);
      } else {
        await createVehicle(formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save vehicle', error);
    }
  };

  return (
    <div className="slot-modal-overlay">
      <div className="slot-modal-card">
        <button onClick={onClose} className="slot-modal-close">
          &times;
        </button>
        <h2>{vehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="licensePlate"
            placeholder="License Plate"
            value={formData.licensePlate}
            onChange={handleChange}
            required
            className="slot-modal-input"
          />
          
          <input
            type="text"
            name="model"
            placeholder="Model"
            value={formData.model}
            onChange={handleChange}
            required
            className="slot-modal-input"
          />
          <input
            type="text"
            name="color"
            placeholder="Color"
            value={formData.color}
            onChange={handleChange}
            required
            className="slot-modal-input"
          />
          <label htmlFor="type">Type:</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="slot-modal-input"
          >
            <option value="car">Car</option>
            <option value="bike">Bike</option>
            <option value="suv">SUV</option>
            <option value="van">Van</option>
            <option value="minibus">Minibus</option>
          </select>
          <button type="submit">{vehicle ? 'Update' : 'Create'}</button>
          <button onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default VehiclePage;

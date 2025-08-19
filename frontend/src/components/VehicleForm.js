import React, { useState, useEffect } from 'react';
import { createVehicle, updateVehicle } from '../services/api';

const VehicleForm = ({ vehicle, ownerId, onSave, onCancel }) => {
  const [licensePlate, setLicensePlate] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (vehicle) {
      setLicensePlate(vehicle.licensePlate);
      setModel(vehicle.model);
      setColor(vehicle.color);
      setType(vehicle.type);
    } else {
      setLicensePlate('');
      setModel('');
      setColor('');
      setType('');
    }
  }, [vehicle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const vehicleData = { licensePlate, model, color, type, ownerId };
      if (vehicle) {
        await updateVehicle(vehicle.id, vehicleData);
      } else {
        await createVehicle(vehicleData);
      }
      onSave();
    } catch (err) {
      setError('Failed to save vehicle. Please check your input.');
      console.error('Error saving vehicle:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-4">
        {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
      </h2>
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label htmlFor="licensePlate" className="slot-modal-label">License Plate</label>
        <input
          type="text"
          id="licensePlate"
          className="slot-modal-input"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="model" className="slot-modal-label">Model</label>
        <input
          type="text"
          id="model"
          className="slot-modal-input"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="color" className="slot-modal-label">Color</label>
        <input
          type="text"
          id="color"
          className="slot-modal-input"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="type" className="slot-modal-label">Type</label>
        <select
          id="type"
          className="slot-modal-input"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        >
          <option value="">Select Type</option>
          <option value="car">Car</option>
          <option value="bike">Bike</option>
          <option value="suv">SUV</option>
          <option value="van">Van</option>
          <option value="minibus">Minibus</option>
        </select>
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="slot-modal-btn" style={{ backgroundColor: '#ccc', marginTop: '10px' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="slot-modal-btn"
        >
          {vehicle ? 'Update Vehicle' : 'Add Vehicle'}
        </button>
      </div>
    </form>
  );
};

export default VehicleForm;

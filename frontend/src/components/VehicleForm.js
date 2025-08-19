import React, { useState, useEffect } from 'react';
import { createVehicle, updateVehicle } from '../services/api';
import { getVehicleIcon, formatVehicleType, CarIcon } from './VehicleIcons';

const EditIcon = () => (
  <svg className="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const PlusIcon = () => (
  <svg className="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

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
    <>
      {/* Header Section */}
      <div className="slot-modal-header">
        <div className="slot-modal-icon-wrapper">
          {vehicle ? <EditIcon /> : <PlusIcon />}
        </div>
        <h3 className="slot-modal-title">
          {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        </h3>
        <p className="slot-modal-subtitle">
          {vehicle ? 'Update vehicle information' : 'Register a new vehicle'}
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="slot-modal-details">
          <div className="reservation-info" style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: '1px solid #fecaca'
          }}>
            <p style={{
              textAlign: 'center',
              color: '#7f1d1d',
              fontSize: '0.9rem',
              margin: '0',
              fontWeight: '500'
            }}>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="slot-modal-form">
        <div className="form-group">
          <label htmlFor="licensePlate" className="slot-modal-label">
            <svg style={{ width: '1.2rem', height: '1.2rem', color: '#6b7280' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            License Plate
          </label>
          <input
            type="text"
            id="licensePlate"
            className="slot-modal-input"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            placeholder="e.g., ABC-123, XYZ-789"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="model" className="slot-modal-label">
            <CarIcon />
            Vehicle Model
          </label>
          <input
            type="text"
            id="model"
            className="slot-modal-input"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g., Honda Civic, Toyota Camry"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="color" className="slot-modal-label">
            <svg style={{ width: '1.2rem', height: '1.2rem', color: '#6b7280' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
            </svg>
            Color
          </label>
          <input
            type="text"
            id="color"
            className="slot-modal-input"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="e.g., Red, Blue, White"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="type" className="slot-modal-label">
            {getVehicleIcon(type || 'car', 'slot-icon')}
            Vehicle Type
          </label>
          <select
            id="type"
            className="slot-modal-input"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="">Select Vehicle Type</option>
            <option value="car">Car</option>
            <option value="bike">Bike</option>
            <option value="suv">SUV</option>
            <option value="van">Van</option>
            <option value="minibus">Minibus</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="slot-modal-actions">
          <div className="action-buttons-group">
            <button
              type="submit"
              className="slot-modal-btn primary"
            >
              {vehicle ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="slot-modal-btn disabled"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default VehicleForm;

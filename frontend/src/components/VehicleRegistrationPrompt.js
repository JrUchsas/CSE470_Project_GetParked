import React from 'react';
import { useNavigate } from 'react-router-dom';

const VehicleRegistrationPrompt = ({ onClose }) => {
  const navigate = useNavigate();
  const handleRegisterClick = () => {
    navigate('/vehicles');
    onClose();
  };

  return (
    <div className="slot-modal-overlay">
      <div className="slot-modal-card">
        <button onClick={onClose} className="slot-modal-close">
          &times;
        </button>
        <h2>Register Your Vehicle</h2>
        <p>It looks like you don't have any vehicles registered yet. Please register a vehicle to use our parking services.</p>
        <button onClick={handleRegisterClick} className="slot-modal-btn">
          Register Vehicle Now
        </button>
        <button onClick={onClose} className="slot-modal-btn" style={{ backgroundColor: '#ccc', marginTop: '10px' }}>
          Maybe Later
        </button>
      </div>
    </div>
  );
};

export default VehicleRegistrationPrompt;

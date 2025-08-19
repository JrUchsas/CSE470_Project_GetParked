import React from 'react';

// Vehicle Type Icon components using emojis
export const CarIcon = ({ className = "slot-icon" }) => (
  <span className={className}>🚗</span>
);

export const SUVIcon = ({ className = "slot-icon" }) => (
  <span className={className}>🚙</span>
);

export const BikeIcon = ({ className = "slot-icon" }) => (
  <span className={className}>🚴‍♂️</span>
);

export const VanIcon = ({ className = "slot-icon" }) => (
  <span className={className}>🚐</span>
);

export const MinibusIcon = ({ className = "slot-icon" }) => (
  <span className={className}>🚌</span>
);

export const MotorcycleIcon = ({ className = "slot-icon" }) => (
  <span className={className}>🏍️</span>
);

// Function to get the appropriate vehicle icon based on type
export const getVehicleIcon = (type, className = "slot-icon") => {
  switch (type?.toLowerCase()) {
    case 'car':
      return <CarIcon className={className} />;
    case 'suv':
      return <SUVIcon className={className} />;
    case 'bike':
      return <BikeIcon className={className} />;
    case 'motorcycle':
      return <MotorcycleIcon className={className} />;
    case 'van':
      return <VanIcon className={className} />;
    case 'minibus':
      return <MinibusIcon className={className} />;
    default:
      return <CarIcon className={className} />; // Default to car icon
  }
};

// Function to format vehicle type names
export const formatVehicleType = (type) => {
  if (type === 'suv') {
    return 'SUV';
  }
  return type.charAt(0).toUpperCase() + type.slice(1);
};

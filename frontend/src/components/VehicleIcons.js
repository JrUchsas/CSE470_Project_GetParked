import React from 'react';

// Vehicle Type Icon components
export const CarIcon = ({ className = "slot-icon" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.6-1.6-1.6L18 10.5l-2-3c-.3-.5-.8-.5-1.3-.5H9.3c-.5 0-1 0-1.3.5l-2 3-2.4 1.4C2.7 11.4 2 12.1 2 13v3c0 .6.4 1 1 1h2"/>
    <circle cx="7" cy="17" r="2"/>
    <circle cx="17" cy="17" r="2"/>
  </svg>
);

export const SUVIcon = ({ className = "slot-icon" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 17h1.5c.8 0 1.5-.7 1.5-1.5v-4c0-1.1-.9-2-2-2L19 8.5l-2-4c-.4-.8-1.2-.5-1.8-.5H8.8c-.6 0-1.4-.3-1.8.5l-2 4-2 1.5C1.9 9.5 1 10.4 1 11.5v4c0 .8.7 1.5 1.5 1.5H4"/>
    <circle cx="7" cy="17" r="2.5"/>
    <circle cx="17" cy="17" r="2.5"/>
    <rect x="6" y="6" width="12" height="6" rx="1"/>
  </svg>
);

export const BikeIcon = ({ className = "slot-icon" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="5.5" cy="17.5" r="3.5"/>
    <circle cx="18.5" cy="17.5" r="3.5"/>
    <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
    <path d="M9 12h3l2-3h2l1 3-2 3h-3"/>
    <path d="M9 12v5"/>
    <path d="M15 9l-6 3"/>
  </svg>
);

export const VanIcon = ({ className = "slot-icon" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 17h1c.6 0 1-.4 1-1v-6c0-.6-.4-1-1-1h-1l-2-4H5l-2 4v7c0 .6.4 1 1 1h1"/>
    <circle cx="7" cy="17" r="2"/>
    <circle cx="17" cy="17" r="2"/>
    <rect x="3" y="5" width="18" height="8" rx="1"/>
    <path d="M3 9h18"/>
  </svg>
);

export const MinibusIcon = ({ className = "slot-icon" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 17h1c.6 0 1-.4 1-1v-7c0-.6-.4-1-1-1h-1l-1-4H4l-1 4v8c0 .6.4 1 1 1h1"/>
    <circle cx="6" cy="17" r="2"/>
    <circle cx="18" cy="17" r="2"/>
    <rect x="2" y="4" width="20" height="9" rx="1"/>
    <path d="M2 8h20"/>
    <path d="M8 4v4"/>
    <path d="M16 4v4"/>
  </svg>
);

// Function to get the appropriate vehicle icon based on type
export const getVehicleIcon = (type, className = "slot-icon") => {
  switch (type?.toLowerCase()) {
    case 'car':
      return <CarIcon className={className} />;
    case 'suv':
      return <SUVIcon className={className} />;
    case 'bike':
    case 'motorcycle':
      return <BikeIcon className={className} />;
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

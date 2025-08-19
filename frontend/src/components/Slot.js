import React from 'react';
import { getVehicleIcon } from './VehicleIcons';

const Slot = ({ slot }) => {
  const getStatusColor = () => {
    switch (slot.status) {
      case 'Available':
        return 'bg-green-500 border-green-700';
      case 'Occupied':
        return 'bg-red-500 border-red-700';
      case 'Reserved':
        return 'bg-yellow-400 border-yellow-600';
      default:
        return 'bg-gray-400 border-gray-600';
    }
  };

  return (
    <div
      className={`px-3 py-2 rounded-lg text-white text-center font-semibold shadow-lg border-2 ${getStatusColor()} transition-transform transform flex flex-col items-center group hover:scale-105 hover:shadow-xl hover:z-10 cursor-pointer`}
      style={{ transition: 'box-shadow 0.15s, transform 0.15s', minWidth: 0 }}
    >
      <span className="text-base tracking-wide group-hover:underline whitespace-nowrap flex items-center justify-center w-full text-center">
        <span className="text-sm mr-2" style={{ filter: 'brightness(0) invert(1)' }}>
          {getVehicleIcon(slot.type, 'w-3 h-3')}
        </span>
        {slot.location}
      </span>

    </div>
  );
};

export default Slot;
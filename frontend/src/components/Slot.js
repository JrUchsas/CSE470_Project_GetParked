import React from 'react';

const Slot = ({ slot }) => {
  const getStatusColor = () => {
    switch (slot.status) {
      case 'Available':
        return 'bg-green-500 border-green-700';
      case 'Occupied':
        return 'bg-red-500 border-red-700';
      case 'Reserved':
        return 'bg-yellow-500 border-yellow-700';
      default:
        return 'bg-gray-400 border-gray-600';
    }
  };

  return (
    <div className={`p-4 rounded-xl text-white text-center font-bold shadow-xl border-b-4 ${getStatusColor()} transition-transform transform hover:scale-105 flex flex-col items-center gap-2`}>
      <span className="text-3xl">🅿️</span>
      <p className="text-lg tracking-wide">{slot.location}</p>
      <p className="text-xs uppercase tracking-wider bg-white/20 px-2 py-1 rounded-full mt-1">{slot.status}</p>
    </div>
  );
};

export default Slot;
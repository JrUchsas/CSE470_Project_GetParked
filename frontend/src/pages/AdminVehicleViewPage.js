import React, { useState, useEffect } from 'react';
import { getAllVehicles } from '../services/api';

const AdminVehicleViewPage = () => {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchAllVehicles = async () => {
      try {
        const response = await getAllVehicles();
        setVehicles(response || []);
      } catch (error) {
        console.error('Failed to fetch all vehicles', error);
        setVehicles([]);
      }
    };

    fetchAllVehicles();
  }, []);

  return (
    <div>
      <h1>All Registered Vehicles</h1>
      {vehicles.length === 0 ? (
        <p>No vehicles registered yet.</p>
      ) : (
        <div className="overflow-x-auto w-full mx-auto">
          <table className="admin-table min-w-full bg-white rounded-lg overflow-hidden shadow text-center mx-auto">
            <thead>
              <tr>
                <th>License Plate</th>
                <th>Model</th>
                <th>Type</th>
                <th>Color</th>
                <th>Owner Name</th>
                <th>Owner Email</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td className="py-2 px-4">{vehicle.licensePlate}</td>
                  <td className="py-2 px-4">{vehicle.model}</td>
                  <td className="py-2 px-4">{vehicle.type}</td>
                  <td className="py-2 px-4">{vehicle.color}</td>
                  <td className="py-2 px-4">{vehicle.owner ? vehicle.owner.name : 'N/A'}</td>
                  <td className="py-2 px-4">{vehicle.owner ? vehicle.owner.email : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminVehicleViewPage;

import React from 'react';

function PlanetInfoPanel({ planetData, onClose }) {
  if (!planetData) return null; // Don't render if no planet data is passed

  return (
    <div className="planet-info-panel">
      <h2>{planetData.name}</h2>
      <p>{planetData.fact}</p>
      <p>Diameter: {planetData.diameter}</p>
      <p>Distance: {planetData.distance}</p>
      <p>Orbital Period: {planetData.orbitalPeriod}</p>
      <p>Moons: {planetData.moons}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

export default PlanetInfoPanel;

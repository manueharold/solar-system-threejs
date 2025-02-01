// PlanetInfoPanel.js

import React, { useState } from 'react';

const PlanetInfoPanel = ({ planetData, onClose }) => {
  return (
    <div id="planetInfoPanel" className={`planet-info-panel ${planetData ? 'active' : ''}`}>
      {planetData ? (
        <>
          <h3 id="planetName">{planetData.name}</h3>
          <p id="planetDescription">{planetData.fact}</p>
          <p id="planetDiameter">Diameter: {planetData.diameter}</p>
          <p id="planetDistance">Distance: {planetData.distance}</p>
          <p id="planetOrbitalPeriod">Orbital Period: {planetData.orbitalPeriod}</p>
          <p id="planetMoons">Moons: {planetData.moons}</p>
          <button id="closeInfoPanel" onClick={onClose}>Close</button>
        </>
      ) : null}
    </div>
  );
};

export default PlanetInfoPanel;

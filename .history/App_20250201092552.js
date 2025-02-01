import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import PlanetInfoPanel from './PlanetInfoPanel';
import Search from './Search';
import { planetData } from './planetData';

const App = () => {
  const [currentPlanet, setCurrentPlanet] = useState(null);

  const showPlanetInfo = (planetName) => {
    setCurrentPlanet(planetData[planetName.toLowerCase()]);
  };

  const hidePlanetInfo = () => {
    setCurrentPlanet(null);
  };

  return (
    <div>
      <Search onSearch={showPlanetInfo} />
      <PlanetInfoPanel planetData={currentPlanet} onClose={hidePlanetInfo} />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

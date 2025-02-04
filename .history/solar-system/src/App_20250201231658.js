import React, { useState } from 'react';
import ModeToggle from './ModeToggle';
import PlanetInfo from './PlanetInfo';
import SearchBar from './SearchBar';

function App() {
    const [selectedPlanet, setSelectedPlanet] = useState(null);

    const handlePlanetSelect = (planetName) => {
        setSelectedPlanet(planetName);
    };

    return (
        <div className="App">
            <ModeToggle scene={scene} camera={camera} controls={controls} />
            <SearchBar onPlanetSelect={handlePlanetSelect} />
            {selectedPlanet && <PlanetInfo planetName={selectedPlanet} />}
        </div>
    );
}

export default App;

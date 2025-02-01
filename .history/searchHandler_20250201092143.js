import React, { useState } from 'react';
import PlanetInfoPanel from './PlanetInfoPanel';
import { moveToPlanet } from './loadPlanets.js';  // Assuming this function remains unchanged

function PlanetSearch({ planetsList, camera, controls, scene }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlanet, setActivePlanet] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const planetData = {
    sun: { 
      name: "Sun",
      fact: "The Sun generates so much energy that, in just one second, it could power the entire Earth for 500,000 years!",
      diameter: "1,391,000 km",
      distance: "0 km (center of solar system)",
      orbitalPeriod: "N/A",
      moons: "0"
    },
    mercury: { 
      name: "Mercury",
      fact: "A day on Mercury lasts longer than a year—one full day-night cycle takes 176 Earth days!",
      diameter: "4,880 km",
      distance: "57.9 million km",
      orbitalPeriod: "88 days",
      moons: "0"
    },
    // Add more planet data here...
  };

  const handleSearchInput = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    if (query) {
      const filteredSuggestions = planetsList.filter(planet => planet.toLowerCase().startsWith(query));
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectPlanet = (planet) => {
    setSearchQuery('');
    setSuggestions([]);
    setActivePlanet(planetData[planet.toLowerCase()]);
    moveToPlanet(planet, camera, controls, scene);  // Moving camera to the planet
  };

  const handleClosePlanetInfo = () => {
    setActivePlanet(null);  // Hides the planet info panel
  };

  return (
    <div className="planet-search">
      <input 
        type="text"
        value={searchQuery}
        onChange={handleSearchInput}
        placeholder="Search for a planet"
        className="search-input"
      />

      <ul className="suggestions-list">
        {suggestions.map((planet, index) => (
          <li key={index} className="suggestion-item" onClick={() => handleSelectPlanet(planet)}>
            {planet}
          </li>
        ))}
      </ul>

      <PlanetInfoPanel planetData={activePlanet} onClose={handleClosePlanetInfo} />
    </div>
  );
}

export default PlanetSearch;

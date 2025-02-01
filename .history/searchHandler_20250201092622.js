// Search.js

import React, { useState } from 'react';

const Search = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const planetsList = ["Sun", "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Moon"];

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setQuery(query);
    setSuggestions(planetsList.filter(planet => planet.toLowerCase().startsWith(query)));
  };

  const handleSelectPlanet = (planetName) => {
    onSearch(planetName);
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div>
      <input 
        type="text" 
        value={query} 
        onChange={handleSearch} 
        placeholder="Search for a planet..." 
      />
      {suggestions.length > 0 && (
        <ul id="searchSuggestions">
          {suggestions.map((planet, index) => (
            <li 
              key={index} 
              className="suggestion" 
              onClick={() => handleSelectPlanet(planet)}
            >
              {planet}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Search;

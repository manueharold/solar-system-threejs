import React, { useState } from 'react';
import styles from './SearchBar.module.css';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Add logic for search suggestions here
  };

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        id="searchInput"
        className={styles.searchBar}
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search a planet..."
      />
      <ul id="searchSuggestions" className={styles.searchSuggestions}>
        {/* Search suggestions will go here */}
      </ul>
    </div>
  );
};

export default SearchBar;

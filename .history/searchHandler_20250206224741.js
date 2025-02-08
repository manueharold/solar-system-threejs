import { moveToPlanet } from './loadPlanets.js';
import { showAllPlanets } from './comparePlanets.js'; // Restore planet visibility
// Import our new orbit control functions
import { pauseOrbitForPlanet, resumeOrbitForPlanet } from './loadOrbitPlanets.js';

// Global variable to track which planet is currently paused
let currentPausedPlanet = null;

// ================================
// SEARCH FUNCTIONALITY
// ================================
export function setupSearchFunctionality(scene, camera, controls) {
  const searchPanel = document.getElementById("searchPanel");
  const searchInput = document.getElementById("searchInput");
  const searchSuggestions = document.getElementById("searchSuggestions");
  const searchToggle = document.getElementById("toggleSearch");
  const planetsList = ["Sun", "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Moon"];

  let activeIndex = -1; // Active suggestion index

  // 🎛️ Toggle Search Panel Visibility
  searchToggle.addEventListener("click", () => {
    if (searchPanel.classList.contains('visible')) {
      gsap.to(searchPanel, {
        duration: 0.5,
        opacity: 0,
        onComplete: () => {
          searchPanel.classList.remove('visible');
          searchPanel.style.display = 'none';
          showAllPlanets(scene); // Restore visibility
        }
      });
    } else {
      searchPanel.style.display = 'block';
      gsap.to(searchPanel, {
        duration: 0.5,
        opacity: 1,
        onComplete: () => {
          searchPanel.classList.add('visible');
          searchInput.focus();
        }
      });
    }
  });

  // 🔍 Handle search input
  const handleSearch = () => {
    const query = searchInput.value.toLowerCase();
    searchSuggestions.innerHTML = "";
    searchSuggestions.style.display = query ? "block" : "none";
    activeIndex = -1;

    planetsList.filter(planet => planet.toLowerCase().startsWith(query))
      .forEach((planet, index) => {
        const li = document.createElement("li");
        li.textContent = planet;
        li.classList.add("text-white", "px-4", "py-2", "rounded-lg", "hover:bg-gray-700", "cursor-pointer", "transition");
        li.dataset.index = index;
        li.onclick = () => selectPlanet(planet);
        searchSuggestions.appendChild(li);
      });
  };

  // 🎯 Select a planet
  const selectPlanet = (planet) => {
    // Clear search UI
    searchInput.value = "";
    searchSuggestions.innerHTML = "";
    searchSuggestions.style.display = "none";

    gsap.to(searchPanel, {
      duration: 0.5,
      opacity: 0,
      onComplete: () => {
        searchPanel.classList.remove('visible');
        searchPanel.style.display = 'none';
        showAllPlanets(scene); // Restore visibility
      }
    });

    const planetName = planet.toLowerCase();

    // If there is already a planet paused (and it’s not the same as the current selection),
    // resume its orbit.
    if (currentPausedPlanet && currentPausedPlanet !== planetName) {
      resumeOrbitForPlanet(currentPausedPlanet);
    }

    // Set the new current paused planet and pause its orbit
    currentPausedPlanet = planetName;
    pauseOrbitForPlanet(planetName);

    // Move to the selected planet.
    // Note: Do not resume the orbit on move completion so that the planet remains paused
    // until another planet is selected.
    moveToPlanet(planetName, camera, controls, scene)
      .catch((err) => {
        console.error("Error moving to planet:", err);
        // In case of error, resume orbiting to avoid leaving the planet paused
        resumeOrbitForPlanet(planetName);
      });
  };

  // ⌨️ Keyboard navigation
  searchInput.addEventListener("keydown", (event) => {
    const items = searchSuggestions.querySelectorAll("li");

    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeIndex = (activeIndex + 1) % items.length;
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      activeIndex = (activeIndex - 1 + items.length) % items.length;
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      items[activeIndex].click();
    }

    items.forEach((item, index) => {
      item.style.background = index === activeIndex ? "#333" : "";
    });
  });

  // 🔄 Trigger search
  searchInput.addEventListener("input", handleSearch);
}

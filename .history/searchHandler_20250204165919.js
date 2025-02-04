import { moveToPlanet } from './loadPlanets.js';

// ================================
// SEARCH FUNCTIONALITY
// ================================
export function setupSearchFunctionality(scene, camera, controls) {
  const searchPanel = document.getElementById("searchPanel");
  const searchInput = document.getElementById("searchInput");
  const searchSuggestions = document.getElementById("searchSuggestions");
  const searchToggle = document.getElementById("toggleSearch");
  const planetsList = ["Sun", "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Moon"];
  
  let activeIndex = -1; // Track active suggestion index

  // Toggle the search panel (only affects the search UI; does not change planet visibility)
  searchToggle.addEventListener("click", () => {
    if (searchPanel.classList.contains("visible")) {
      // Fade out the search panel
      gsap.to(searchPanel, {
        duration: 0.5,
        opacity: 0,
        onComplete: () => {
          searchPanel.classList.remove("visible");
          searchPanel.style.display = "none";
          // Do not alter scene planet visibility here.
        }
      });
    } else {
      // Show the search panel with a fade-in effect
      searchPanel.style.display = "block";
      gsap.to(searchPanel, {
        duration: 0.5,
        opacity: 1,
        onComplete: () => {
          searchPanel.classList.add("visible");
          searchInput.focus();
        }
      });
    }
  });

  // Handle search input changes.
  const handleSearch = () => {
    const query = searchInput.value.toLowerCase();
    // Clear previous suggestions.
    searchSuggestions.innerHTML = "";
    searchSuggestions.style.display = query ? "block" : "none";
    activeIndex = -1;

    planetsList
      .filter(planet => planet.toLowerCase().startsWith(query))
      .forEach((planet, index) => {
        const li = document.createElement("li");
        li.textContent = planet;
        li.classList.add(
          "text-white",
          "px-4",
          "py-2",
          "rounded-lg",
          "hover:bg-gray-700",
          "cursor-pointer",
          "transition"
        );
        li.dataset.index = index;
        li.onclick = () => selectPlanet(planet);
        searchSuggestions.appendChild(li);
      });
  };

  // When a planet is selected from the search suggestions.
  const selectPlanet = (planet) => {
    // Clear the input and suggestions.
    searchInput.value = "";
    searchSuggestions.innerHTML = "";
    searchSuggestions.style.display = "none";
    // Fade out and hide the search panel.
    gsap.to(searchPanel, {
      duration: 0.5,
      opacity: 0,
      onComplete: () => {
        searchPanel.classList.remove("visible");
        searchPanel.style.display = "none";
        // Do not change scene planet visibility here.
      }
    });
    console.log(`Selecting planet: ${planet}`);
    // Call moveToPlanet (case-insensitive).
    moveToPlanet(planet.toLowerCase(), camera, controls, scene);
  };

  // Keyboard navigation for search suggestions.
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
    // Highlight the active suggestion.
    items.forEach((item, index) => {
      item.style.background = index === activeIndex ? "#333" : "";
    });
  });

  // Listen for input changes.
  searchInput.addEventListener("input", handleSearch);
}

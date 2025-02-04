import { moveToPlanet } from './loadPlanets.js';
import { showAllPlanets } from './comparePlanets.js';  // Import the helper to restore planet visibility

// ================================
// SEARCH FUNCTIONALITY
// ================================
export function setupSearchFunctionality(scene, camera, controls) {
    const searchPanel = document.getElementById("searchPanel"); // The search panel element
    const searchInput = document.getElementById("searchInput");
    const searchSuggestions = document.getElementById("searchSuggestions");
    const searchToggle = document.getElementById("toggleSearch"); // The search icon button
    const planetsList = ["Sun", "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Moon"];
    
    let activeIndex = -1; // Track active suggestion index

    // 🎛️ Toggle Search Panel Visibility when clicking the search icon
    searchToggle.addEventListener("click", () => {
        // If the panel is already visible, fade it out; otherwise, show it.
        if (searchPanel.classList.contains('visible')) {
            // Fade out using GSAP
            gsap.to(searchPanel, {
                duration: 0.5,
                opacity: 0,
                onComplete: () => {
                    searchPanel.classList.remove('visible');
                    searchPanel.style.display = 'none';
                    // Restore all planets' visibility if they were hidden
                    showAllPlanets(scene);
                }
            });
        } else {
            // Show the search panel with a fade-in effect
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

    // 🔍 Handle search input changes
    const handleSearch = () => {
        const query = searchInput.value.toLowerCase();
        // Clear previous suggestions
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

    // 🎯 Handle selection of a planet from the suggestions
    const selectPlanet = (planet) => {
        // Clear the input and suggestions
        searchInput.value = "";
        searchSuggestions.innerHTML = "";
        searchSuggestions.style.display = "none";
        // Fade out and hide the search panel
        gsap.to(searchPanel, {
            duration: 0.5,
            opacity: 0,
            onComplete: () => {
                searchPanel.classList.remove('visible');
                searchPanel.style.display = 'none';
                // Restore visibility of all planets (in case any were hidden during comparison)
                showAllPlanets(scene);
            }
        });
        console.log(`Selecting planet: ${planet}`);
        // Call moveToPlanet (ensure case-insensitivity)
        moveToPlanet(planet.toLowerCase(), camera, controls, scene);
    };

    // ⌨️ Handle keyboard navigation within the search suggestions
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

        // Highlight the selected item
        items.forEach((item, index) => {
            item.style.background = index === activeIndex ? "#333" : "";
        });
    });

    // 🔄 Trigger search handling when the input value changes
    searchInput.addEventListener("input", handleSearch);
}

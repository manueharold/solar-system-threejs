import { moveToPlanet } from './loadPlanets.js';

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
        // Ensure it's visible
        searchPanel.style.display = 'block'; 

        // Add a small delay to trigger the transition
        setTimeout(() => {
            searchPanel.classList.add('visible'); // Add animation class to make it visible with effects
            searchInput.focus(); // Focus the input field when the panel is visible
        }, 10); // Small delay to trigger the transition
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
        searchInput.value = "";
        searchSuggestions.style.display = "none";
        // Hide the search panel after selection
        searchPanel.classList.remove('visible');
        searchPanel.style.display = 'none'; // Hide the search panel
        console.log(`Selecting planet: ${planet}`);
        // Call your moveToPlanet function (ensure case-insensitivity)
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
        } else if (event.key === "Enter" && activeIndex !== -1) {
            event.preventDefault();
            items[activeIndex].click();
        }

        // Highlight the currently active suggestion
        items.forEach((item, index) => {
            item.classList.toggle("bg-gray-700", index === activeIndex);
        });
    });

    // Listen for input changes to update suggestions
    searchInput.addEventListener("input", handleSearch);

    // Close the search panel when clicking outside of it
    document.body.addEventListener('click', (e) => {
        if (!searchPanel.contains(e.target) && e.target !== searchToggle) {
            searchPanel.classList.remove('visible');
            searchPanel.style.display = 'none'; // Hide the panel when clicking outside
        }
    });

    // Prevent closing when clicking inside the search panel
    searchPanel.addEventListener('click', (e) => {
        e.stopPropagation(); // This prevents the click event from propagating to the body or other elements
    });
}

import { moveToPlanet } from './loadPlanets.js';

// ================================
// SEARCH FUNCTIONALITY
// ================================
export function setupSearchFunctionality(scene, camera, controls) {
    const searchInput = document.getElementById("searchInput");
    const searchSuggestions = document.getElementById("searchSuggestions");
    const planetsList = ["Sun", "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Moon"];
    
    let activeIndex = -1; // Track active suggestion index

    // 🔍 Handle search input changes
    const handleSearch = () => {
        const query = searchInput.value.toLowerCase();
        searchSuggestions.innerHTML = "";
        searchSuggestions.style.display = query ? "block" : "none";
        activeIndex = -1;

        planetsList
            .filter(planet => planet.toLowerCase().startsWith(query))
            .forEach((planet, index) => {
                const li = document.createElement("li");
                li.textContent = planet;
                li.classList.add("text-white", "px-4", "py-2", "rounded-lg", "hover:bg-gray-700", "cursor-pointer", "transition");
                li.dataset.index = index;

                li.onclick = () => selectPlanet(planet);

                searchSuggestions.appendChild(li);
            });
    };

    // 🎯 Move to selected planet
    const selectPlanet = (planet) => {
        searchInput.value = "";
        searchSuggestions.style.display = "none";
        moveToPlanet(planet.toLowerCase(), camera, controls, scene);
    };

    // ⌨️ Handle keyboard navigation
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

        // Highlight the selected suggestion
        items.forEach((item, index) => {
            item.classList.toggle("bg-gray-700", index === activeIndex);
        });
    });

    // 📢 Event Listener for Input Changes
    searchInput.addEventListener("input", handleSearch);
}
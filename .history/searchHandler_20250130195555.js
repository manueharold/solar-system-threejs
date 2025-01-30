import { moveToPlanet } from './loadPlanets.js';

export function handleSearchInput(searchInput, searchSuggestions, planetsList, camera, controls, scene) {
    // 🌎 Handle live search suggestions
    const handleSearch = () => {
        const query = searchInput.value.toLowerCase();
        searchSuggestions.innerHTML = "";
        searchSuggestions.style.display = query ? "block" : "none";

        planetsList
            .filter(planet => planet.toLowerCase().includes(query))
            .forEach(planet => {
                const li = document.createElement("li");
                li.textContent = planet;
                li.classList.add("text-white", "px-4", "py-2", "rounded-lg", "hover:bg-gray-700", "cursor-pointer", "transition");
                li.onclick = () => {
                    searchInput.value = planet;
                    searchSuggestions.style.display = "none";
                    moveToPlanet(planet.toLowerCase(), camera, controls, scene);
                };
                searchSuggestions.appendChild(li);
            });
    };

    // Event listeners for search input and key press
    searchInput.addEventListener("input", handleSearch);
    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            const planetName = searchInput.value.trim().toLowerCase();
            if (planetName) moveToPlanet(planetName, camera, controls, scene);
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.style.display = "none";
        }
    });
}

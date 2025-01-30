import { moveToPlanet } from './loadPlanets.js';

export function handleSearchInput(searchInput, searchSuggestions, planetsList, camera, controls, scene) {
    // 🌎 Handle live search suggestions
    const handleSearch = () => {
        const query = searchInput.value.toLowerCase().trim();
        searchSuggestions.innerHTML = "";
    
        if (!query) {
            searchSuggestions.style.display = "none"; // ✅ Hide dropdown if input is empty
            return;
        }
    
        const filteredPlanets = planetsList.filter(planet => planet.toLowerCase().includes(query));
    
        if (filteredPlanets.length === 0) {
            searchSuggestions.style.display = "none"; // ✅ Hide if no matches
            return;
        }
    
        searchSuggestions.style.display = "block"; // Show only when there's a match
    
        filteredPlanets.forEach(planet => {
            const li = document.createElement("li");
            li.textContent = planet;
            li.classList.add("text-white", "px-4", "py-2", "rounded-lg", "hover:bg-gray-700", "cursor-pointer", "transition");
            li.onclick = () => {
                moveToPlanet(planet.toLowerCase(), camera, controls, scene);
                searchInput.value = ""; // ✅ Clear input field
                searchSuggestions.style.display = "none"; // ✅ Hide suggestions
            };
            searchSuggestions.appendChild(li);
        });
    };
    // Event listeners for search input and key press
    searchInput.addEventListener("input", handleSearch);
    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            const planetName = searchInput.value.trim().toLowerCase();
            if (planetName) {
                moveToPlanet(planetName, camera, controls, scene);
                searchInput.value = ""; // ✅ Clear input field after pressing Enter
                searchSuggestions.style.display = "none";
            }
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.style.display = "none";
        }
    });
}

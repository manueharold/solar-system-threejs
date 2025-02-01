import { moveToPlanet } from './loadPlanets.js';

export function handleSearchInput(searchInput, searchSuggestions, planetsList, camera, controls, scene) {
    let activeIndex = -1; // Track active suggestion

    const handleSearch = () => {
        const query = searchInput.value.toLowerCase();
        searchSuggestions.innerHTML = "";
        searchSuggestions.style.display = query ? "block" : "none";
        activeIndex = -1;
    
        planetsList
            .filter(planet => planet.toLowerCase().startsWith(query)) // Change to startsWith
            .forEach((planet, index) => {
                const li = document.createElement("li");
                li.textContent = planet;
                li.classList.add("text-white", "px-4", "py-2", "rounded-lg", "hover:bg-gray-700", "cursor-pointer", "transition");
                li.dataset.index = index; // Store index
    
                li.onclick = () => selectPlanet(planet);
    
                searchSuggestions.appendChild(li);
            });
    };
    

    const selectPlanet = (planet) => {
        searchInput.value = "";
        searchSuggestions.style.display = "none";
        moveToPlanet(planet.toLowerCase(), camera, controls, scene);
    };

    // Handle keyboard navigation
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

        items.forEach((item, index) => {
            item.classList.toggle("bg-gray-700", index === activeIndex);
        });
    });

    searchInput.addEventListener("input", handleSearch);
}

import { moveToPlanet } from './loadPlanets.js';
import { handleSearchInput } from './searchHandler.js';

export function setupSearchFunctionality(scene, camera, controls) {
    document.addEventListener("DOMContentLoaded", () => {
        const searchInput = document.getElementById("searchInput");
        const searchSuggestions = document.getElementById("searchSuggestions");
        const planetsList = ["Sun", "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Moon"];

        handleSearchInput(searchInput, searchSuggestions, planetsList, camera, controls, scene);
    });


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

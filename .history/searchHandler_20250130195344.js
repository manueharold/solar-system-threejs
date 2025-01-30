import { moveToPlanet } from './loadPlanets.js';

export function handleSearchInput(inputElement, suggestionsElement, planetsList, camera, controls, scene) {
    inputElement.addEventListener("input", () => {
        const query = inputElement.value.toLowerCase().trim();
        suggestionsElement.innerHTML = "";

        const filteredPlanets = planetsList.filter(planet => planet.toLowerCase().includes(query));

        filteredPlanets.forEach(planet => {
            const li = document.createElement("li");
            li.textContent = planet;  // ✅ Display planet name in suggestions
            li.addEventListener("click", () => {
                moveToPlanet(planet.toLowerCase(), camera, controls, scene);
                inputElement.value = "";
                suggestionsElement.style.display = "none";
            });

            suggestionsElement.appendChild(li);
        });

        suggestionsElement.style.display = filteredPlanets.length > 0 ? "block" : "none";
    });

    // ✅ Add Enter key support
    inputElement.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const query = inputElement.value.toLowerCase().trim();
            if (planetsList.includes(query)) {
                moveToPlanet(query, camera, controls, scene);
                inputElement.value = ""; // Clear input after search
                suggestionsElement.style.display = "none"; // Hide suggestions
            }
        }
    });
}

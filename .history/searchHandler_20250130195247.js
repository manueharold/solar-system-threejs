
import { moveToPlanet } from './loadPlanets.js';

export function handleSearchInput(inputElement, suggestionsElement, planetsList, camera, controls, scene) {
    inputElement.addEventListener("input", () => {
        const query = inputElement.value.toLowerCase();
        suggestionsElement.innerHTML = "";
        
        const filteredPlanets = planetsList.filter(planet => planet.toLowerCase().includes(query));
        
        filteredPlanets.forEach(planet => {
            const li = document.createElement("li");
            li.addEventListener("click", () => {
                moveToPlanet(planet.toLowerCase(), camera, controls, scene);
                inputElement.value = "";
            });

            suggestionsElement.appendChild(li);
        });

        suggestionsElement.style.display = filteredPlanets.length > 0 ? "block" : "none";
    });
}

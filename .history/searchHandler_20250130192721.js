
import { moveToPlanet } from './loadPlanets.js';

export function handleSearchInput(inputElement, suggestionsElement, planetsList, camera, controls, scene) {
    inputElement.addEventListener("input", () => {
        const query = inputElement.value.toLowerCase();
        suggestionsElement.innerHTML = "";
        
        if (query === "") {
            suggestionsElement.style.display = "none";
            return;
        }

        const filteredPlanets = planetsList.filter(planet => planet.toLowerCase().includes(query));
        
        filteredPlanets.forEach(planet => {
            const li = document.createElement("li");
            li.innerHTML = `<img src="./images/${planet.toLowerCase()}.jpg" alt="${planet}"> ${planet}`;
            li.addEventListener("click", () => {
                moveToPlanet(planet.toLowerCase(), camera, controls, scene);
                inputElement.value = "";
                suggestionsElement.style.display = "none";
            });

            suggestionsElement.appendChild(li);
        });

        suggestionsElement.style.display = filteredPlanets.length > 0 ? "block" : "none";
    });
}

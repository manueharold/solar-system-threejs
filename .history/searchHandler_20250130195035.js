import { moveToPlanet } from './loadPlanets.js';

export function handleSearchInput(inputElement, planetsList, camera, controls, scene) {
    inputElement.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const query = inputElement.value.trim().toLowerCase();
            if (planetsList.includes(query)) {
                moveToPlanet(query, camera, controls, scene);
            }
            inputElement.value = ""; // Clear input after search
        }
    });
}

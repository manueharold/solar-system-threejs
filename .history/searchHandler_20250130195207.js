import { moveToPlanet } from './loadPlanets.js';

export function handleSearchInput(inputElement, planetsList, camera, controls, scene) {
    inputElement.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const query = inputElement.value.trim().toLowerCase();
            console.log(`🔍 Searching for: ${query}`);

            if (planetsList.map(p => p.toLowerCase()).includes(query)) {
                moveToPlanet(query, camera, controls, scene);
                inputElement.value = ""; // ✅ Clear input after search
            } else {
                console.warn(`⚠️ Planet "${query}" not found!`);
            }
        }
    });
}

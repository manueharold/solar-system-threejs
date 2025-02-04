import { loadOrbitModeModel } from './loadOrbitPlanets.js/index.js';
import { loadDefaultPlanets } from './loadDefaultPlanets.js';

// ================================
// MODE TOGGLING
// ================================
let orbitModeActive = false;

export function setupModeToggles(scene, camera, controls) {
    const spaceshipButton = document.getElementById('toggleSpaceshipMode');
    const orbitButton = document.getElementById('toggleOrbitMode');

    // 🛸 Spaceship Mode Toggle (if needed)
    spaceshipButton.addEventListener('click', () => {
        console.log('Spaceship Mode activated!');
        // Add spaceship mode functionality here if needed
    });

    // 🔄 Orbit / Original Mode Toggle
    orbitButton.addEventListener('click', () => {
        if (!orbitModeActive) {
            // 🌌 Switch to Orbit Mode
            orbitModeActive = true;
            orbitButton.innerText = "Original Mode";
            loadOrbitModeModel(scene, camera, controls);
        } else {
            // 🌍 Switch back to Default Mode
            orbitModeActive = false;
            orbitButton.innerText = "Orbit Mode";
            loadDefaultPlanets(scene, camera, controls);
        }
    });
}

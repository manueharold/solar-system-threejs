import { loadOrbitPlanets } from './loadOrbitPlanets.js';
import { loadDefaultPlanets } from './loadDefaultPlanets.js';

let orbitModeActive = false;

export function setupModeToggles(scene, camera, controls) {
    const spaceshipButton = document.getElementById('toggleSpaceshipMode');
    const orbitButton = document.getElementById('toggleOrbitMode');

    spaceshipButton.addEventListener('click', () => {
        console.log('Spaceship Mode activated!');
        // Add spaceship mode functionality here if needed
    });

    orbitButton.addEventListener('click', () => {
        if (!orbitModeActive) {
            // Switch to Orbit Mode
            orbitModeActive = true;
            orbitButton.innerHTML = `
                <i class="fa-solid fa-earth-americas"></i>
                <span class="icon-label">Original Mode</span>
            `;
            loadOrbitPlanets(scene, camera, controls);
        } else {
            // Switch back to Default Mode
            orbitModeActive = false;
            orbitButton.innerHTML = `
                <i class="fa-solid fa-earth-americas"></i>
                <span class="icon-label">Orbit Mode</span>
            `;
            loadDefaultPlanets(scene, camera, controls);
        }
    });
}
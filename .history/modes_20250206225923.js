// setupModeToggles.js
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
            // Switch back to Default (Original) Mode

            // Remove orbit-specific objects.
            // Remove the orbit mode model if present.
            const orbitModel = scene.getObjectByName("orbitModeModel");
            if (orbitModel) {
                scene.remove(orbitModel);
                console.log("Orbit mode model removed.");
            }
            // Remove any orbit lines (if you marked them with userData.isOrbitLine).
            scene.traverse((child) => {
                if (child.userData && child.userData.isOrbitLine) {
                    scene.remove(child);
                }
            });

            orbitModeActive = false;
            orbitButton.innerHTML = `
                <i class="fa-solid fa-earth-americas"></i>
                <span class="icon-label">Orbit Mode</span>
            `;
            loadDefaultPlanets(scene, camera, controls);
        }
    });
}

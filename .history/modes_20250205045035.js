import { planetData } from './loadPlanets.js'; 
import { loadDefaultPlanets } from './loadDefaultPlanets.js';
import { loadOrbitPlanets } from './loadOrbitPlanets.js';

export function setupModeToggles(scene, camera, controls, toggleOrbitAnimation) {
    const spaceshipButton = document.getElementById('toggleSpaceshipMode');
    const orbitButton = document.getElementById('toggleOrbitMode');

    let orbitModeActive = false; // Scoped within this function

    spaceshipButton.addEventListener('click', () => {
        console.log('Spaceship Mode activated!');
        // Add spaceship mode functionality here if needed
    });

    orbitButton.addEventListener('click', () => {
        if (!orbitModeActive) {
            // ✅ Switch to Orbit Mode
            orbitModeActive = true;
            orbitButton.innerHTML = `
                <i class="fa-solid fa-earth-americas"></i>
                <span class="icon-label">Original Mode</span>
            `;
            loadOrbitPlanets(scene, camera, controls);
        } else {
            // ✅ Switch back to Default Mode (Original Mode)
            orbitModeActive = false;
            orbitButton.innerHTML = `
                <i class="fa-solid fa-earth-americas"></i>
                <span class="icon-label">Orbit Mode</span>
            `;
            loadDefaultPlanets(scene, camera, controls);

            // Ensure Earth is loaded before trying to focus camera on it
            const earth = scene.getObjectByName('earth');
            if (earth) {
                const earthPosition = earth.position.clone();
                camera.position.set(earthPosition.x + 5000, 3000, earthPosition.z + 5000);  // Adjusted for close-up view
                camera.lookAt(earthPosition);  // Focus camera on Earth
                controls.target.copy(earthPosition); // Update the controls target to Earth position
            } else {
                console.warn('Earth not found in scene. Camera positioning might be incorrect.');
            }
        }

        // ✅ Toggle animation in main.js
        toggleOrbitAnimation(orbitModeActive);
    });
}

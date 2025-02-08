import { loadOrbitPlanets } from './loadOrbitPlanets.js';
import { loadDefaultPlanets } from './loadDefaultPlanets.js';
import { planetData } from './loadPlanets.js'; 


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
            
            // In Orbit Mode, we can adjust the camera focus based on the orbit
            // Assuming the camera needs to be adjusted to orbit
        } else {
            // ✅ Switch back to Default Mode (Original Mode)
            orbitModeActive = false;
            orbitButton.innerHTML = `
                <i class="fa-solid fa-earth-americas"></i>
                <span class="icon-label">Orbit Mode</span>
            `;
            loadDefaultPlanets(scene, camera, controls);

            // Reset the camera position to focus on Earth (or your desired planet)
            const earthPosition = new THREE.Vector3(planetData.earth.distance, 0, 0);
            camera.position.set(earthPosition.x + 5000, 3000, earthPosition.z + 5000);  // Adjusted for close-up view
            camera.lookAt(earthPosition);  // Focus camera on Earth
            controls.target.copy(earthPosition); // Update the controls target to Earth position
        }

        // ✅ Toggle animation in main.js
        toggleOrbitAnimation(orbitModeActive);
    });
}


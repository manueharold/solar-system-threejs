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
            // Hide default planets and load orbit model
            const defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
            if (defaultPlanetsGroup) {
                defaultPlanetsGroup.visible = false;
            }

            const planetNames = ['earth', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon'];
            scene.traverse((child) => {
                if (child.name && planetNames.includes(child.name)) {
                    child.visible = false;
                }
            });

            loadOrbitPlanets(scene, camera, controls);
        } else {
            // ✅ Switch back to Default Mode (Original Mode)
            orbitModeActive = false;
            orbitButton.innerHTML = `
                <i class="fa-solid fa-earth-americas"></i>
                <span class="icon-label">Orbit Mode</span>
            `;
            
            // Remove orbit model if it exists
            const orbitModeModel = scene.getObjectByName('orbitModeModel');
            if (orbitModeModel) {
                scene.remove(orbitModeModel);
                console.log("Removed orbit mode model.");
            }

            // Restore default planets visibility
            const defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
            if (defaultPlanetsGroup) {
                defaultPlanetsGroup.visible = true;
                console.log("Restored default planets group.");
            }

            const planetNames = ['earth', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon'];
            scene.traverse((child) => {
                if (child.name && planetNames.includes(child.name)) {
                    child.visible = true;
                }
            });

            loadDefaultPlanets(scene, camera, controls);

            // Reset the camera to focus on Earth
            const earthPosition = new THREE.Vector3(planetData.earth.distance, 0, 0);
            camera.position.set(earthPosition.x + 5000, 3000, earthPosition.z + 5000);  // Adjusted for close-up view
            camera.lookAt(earthPosition);  // Focus camera on Earth
            controls.target.copy(earthPosition); // Update the controls target to Earth position
        }

        // ✅ Toggle animation in main.js
        toggleOrbitAnimation(orbitModeActive);
    });
}

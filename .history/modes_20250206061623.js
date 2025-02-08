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
            // ... (Orbit Mode activation code)
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
            // Hide individual planets
            const planetNames = ['earth', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon'];
            scene.traverse((child) => {
                if (child.name && planetNames.includes(child.name)) {
                    child.visible = false;
                }
            });
            loadOrbitPlanets(scene, camera, controls);
        } else {
            // Switching back to Original Mode
            orbitModeActive = false;
            orbitButton.innerHTML = `
                <i class="fa-solid fa-earth-americas"></i>
                <span class="icon-label">Orbit Mode</span>
            `;
            
            // Remove the orbit model if it exists
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
                
                // **** NEW: Reset texture rotation for each planet mesh ****
                defaultPlanetsGroup.traverse(child => {
                    if (child.isMesh && child.material && child.material.map) {
                        // Reset the texture rotation and set its center
                        child.material.map.rotation = 0;
                        child.material.map.center.set(0.5, 0.5);
                    }
                });
            }
            
            // Make sure all individual planet objects are visible too
            const planetNames = ['earth', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon'];
            scene.traverse((child) => {
                if (child.name && planetNames.includes(child.name)) {
                    child.visible = true;
                }
            });
            
            // Re-load the default planets if needed
            loadDefaultPlanets(scene, camera, controls);
            
            // Reset the camera to focus on Earth
            const earthPosition = new THREE.Vector3(planetData.earth.distance, 0, 0);
            camera.position.set(earthPosition.x + 5000, 3000, earthPosition.z + 5000);
            camera.lookAt(earthPosition);
            controls.target.copy(earthPosition);
        }
        
        // Toggle the orbit animation state in main.js
        toggleOrbitAnimation(orbitModeActive);
    });
}

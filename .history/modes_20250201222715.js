// modes.js
export function setupModeToggles(defaultGroup, orbitGroup, camera, controls) {
    const spaceshipButton = document.getElementById('toggleSpaceshipMode');
    const orbitButton = document.getElementById('toggleOrbitMode');
    let orbitModeActive = false;
    
    spaceshipButton.addEventListener('click', () => {
        console.log('Spaceship Mode activated!');
        // Add spaceship mode functionality here if needed
    });

    orbitButton.addEventListener('click', () => {
        if (!orbitModeActive) {
            orbitModeActive = true;
            orbitButton.innerText = "Original Mode";
            
            // Hide default planets, show orbit group
            defaultGroup.visible = false;
            orbitGroup.visible = true;
            
            // Load the orbit model only if it hasn't been loaded already
            if (orbitGroup.children.length === 0) {
                // Ensure loadOrbitModeModel accepts orbitGroup as its first parameter.
                loadOrbitModeModel(orbitGroup, camera, controls);
            }
        } else {
            orbitModeActive = false;
            orbitButton.innerText = "Orbit Mode";
            
            // Hide orbit group, show default planets
            orbitGroup.visible = false;
            defaultGroup.visible = true;
        }
    });
}

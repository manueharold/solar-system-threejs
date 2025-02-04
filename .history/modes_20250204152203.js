import { startOrbitMode, stopOrbitMode } from './orbitMode.js';

let orbitModeActive = false;

export function setupModeToggles(scene, camera, controls, planets) {
    const spaceshipButton = document.getElementById('toggleSpaceshipMode');
    const orbitButton = document.getElementById('toggleOrbitMode');

    spaceshipButton.addEventListener('click', () => {
        console.log('Spaceship Mode activated!');
        // Add spaceship mode functionality here if needed
    });

    orbitButton.addEventListener('click', () => {
        orbitModeActive = !orbitModeActive;

        if (orbitModeActive) {
            orbitButton.innerHTML = `
                <i class="fa-solid fa-earth-americas"></i>
                <span class="icon-label">Original Mode</span>
            `;
            startOrbitMode(planets);  // Start orbital animation
        } else {
            orbitButton.innerHTML = `
                <i class="fa-solid fa-earth-americas"></i>
                <span class="icon-label">Orbit Mode</span>
            `;
            stopOrbitMode(planets);   // Stop orbital animation and reset positions
        }
    });
}

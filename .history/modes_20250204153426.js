// modes.js
import { startOrbitMode, stopOrbitMode } from './orbitMode.js';

export function setupModeToggles(planets, camera) {
  const orbitButton = document.getElementById('toggleOrbitMode');
  let orbitModeActive = false;

  orbitButton.addEventListener('click', () => {
    orbitModeActive = !orbitModeActive;
    if (orbitModeActive) {
      orbitButton.innerHTML = `
        <i class="fa-solid fa-earth-americas"></i>
        <span class="icon-label">Original Mode</span>
      `;
      // Pass both planets and camera to startOrbitMode
      startOrbitMode(planets, camera);
    } else {
      orbitButton.innerHTML = `
        <i class="fa-solid fa-earth-americas"></i>
        <span class="icon-label">Orbit Mode</span>
      `;
      stopOrbitMode(planets, camera);
    }
  });
}

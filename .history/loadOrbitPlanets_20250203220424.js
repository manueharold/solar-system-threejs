// loadOrbitPlanets.js

import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";

/**
 * Set up orbit parameters on the already-loaded planet models in the scene.
 * We retrieve planets by name rather than using a local planets object.
 */
export function loadOrbitPlanets(scene, camera, controls) {
  // Hide the default planets group (if it exists)
  const defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
  if (defaultPlanetsGroup) {
    defaultPlanetsGroup.visible = false;
    console.log("Hid default planets group.");
  }

  // List of planet names that should orbit the Sun (exclude the Moon)
  const planetNames = [
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
  ];

  // Set (or check) orbit parameters for each planet.
  planetNames.forEach((name) => {
    const planet = scene.getObjectByName(name);
    if (planet) {
      // If orbitDistance is not set, assume the planet's current x position is its orbit radius.
      if (planet.userData.orbitDistance === undefined) {
        planet.userData.orbitDistance = Math.abs(planet.position.x);
      }
      // If orbitSpeed is not set, provide a default value.
      if (planet.userData.orbitSpeed === undefined) {
        // Adjust this value per your taste or set individual values in loadPlanets.js
        planet.userData.orbitSpeed = 0.00005;
      }
    } else {
      console.warn(`Planet "${name}" not found in scene.`);
    }
  });

  // Update the camera controls so the target is the Sun.
  const sun = scene.getObjectByName("sun");
  if (sun) {
    controls.target.copy(sun.position);
  }

  console.log("✅ Planets are now set for orbit mode.");
}

/**
 * Call this function in your render loop when orbit mode is active.
 * It updates the position of each planet along its orbit.
 *
 * @param {number} deltaTime - The elapsed time since the last frame.
 * @param {THREE.Scene} scene - The current scene containing the planet objects.
 */
export function updateOrbitModeAnimation(deltaTime, scene) {
  const planetNames = [
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
  ];
  planetNames.forEach((name) => {
    const planet = scene.getObjectByName(name);
    if (planet) {
      const radius = planet.userData.orbitDistance;
      const speed = planet.userData.orbitSpeed;
      // Calculate the current angle using the system time.
      const angle = speed * Date.now();
      // Update the position to a new point on the circular orbit.
      planet.position.x = radius * Math.cos(angle);
      planet.position.z = radius * Math.sin(angle);
    }
  });
}

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
        loadPlanets(scene); // Revert to default planets (or whatever is appropriate for default mode)
      }
    });
  }
  

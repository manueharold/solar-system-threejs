import { loadOrbitPlanets } from "./loadOrbitPlanets.js";
import { loadDefaultPlanets } from "./loadDefaultPlanets.js";

// Track the current Orbit Mode status.
let orbitModeActive = false;

// HTML templates for the Orbit toggle button.
const ORBIT_MODE_HTML = `
  <i class="fa-solid fa-earth-americas"></i>
  <span class="icon-label">Orbit Mode</span>
`;
const ORIGINAL_MODE_HTML = `
  <i class="fa-solid fa-earth-americas"></i>
  <span class="icon-label">Original Mode</span>
`;

// Get reference to the Orbit Mode toggle button.
const orbitButton = document.getElementById("toggleOrbitMode");
// Get reference to the Compare Planets button.
const comparePlanetsButton = document.getElementById("comparePlanetsButton");

/**
 * Removes orbit-specific objects from the scene.
 * This includes the orbit mode model and any objects marked as orbit lines.
 * @param {THREE.Scene} scene - The Three.js scene.
 */
function removeOrbitObjects(scene) {
  // Remove the orbit mode model if it exists.
  const orbitModel = scene.getObjectByName("orbitModeModel");
  if (orbitModel) {
    scene.remove(orbitModel);
    console.log("Orbit mode model removed.");
  }
  // Remove any orbit lines marked via userData.
  scene.traverse((child) => {
    if (child.userData && child.userData.isOrbitLine) {
      scene.remove(child);
    }
  });
}

/**
 * Sets up event listeners to toggle Orbit Mode.
 * @param {THREE.Scene} scene - The Three.js scene.
 * @param {THREE.Camera} camera - The camera used in the scene.
 * @param {Object} controls - The camera controls.
 */
export function setupModeToggles(scene, camera, controls) {
  // Set up Orbit Mode toggle event listener.
  orbitButton.addEventListener("click", () => {
    if (!orbitModeActive) {
      // Activate Orbit Mode.
      orbitModeActive = true;
      // Set a global flag so that other modules (like comparePlanets.js) know Orbit Mode is active.
      window.orbitModeEnabled = true;
      orbitButton.innerHTML = ORIGINAL_MODE_HTML;
      loadOrbitPlanets(scene, camera, controls);
      // Disable the Compare Planets button.
      if (comparePlanetsButton) {
        comparePlanetsButton.disabled = true;
        comparePlanetsButton.title = "You cannot use Compare Planets when in Orbit Mode.";
      }
    } else {
      // Deactivate Orbit Mode and revert to Default Mode.
      removeOrbitObjects(scene);
      orbitModeActive = false;
      window.orbitModeEnabled = false;
      orbitButton.innerHTML = ORBIT_MODE_HTML;
      loadDefaultPlanets(scene, camera, controls);
      // Re-enable the Compare Planets button.
      if (comparePlanetsButton) {
        comparePlanetsButton.disabled = false;
        comparePlanetsButton.title = "";
      }
    }
  });

  // (Optional) In case the disabled button still gets clicked (some browsers might allow this),
  // add an event listener to show an error notification.
  if (comparePlanetsButton) {
    comparePlanetsButton.addEventListener("click", (event) => {
      if (window.orbitModeEnabled) {
        event.preventDefault();
        alert("You cannot use Compare Planets when in Orbit Mode.");
      }
    });
  }
}

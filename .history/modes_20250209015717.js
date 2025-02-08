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

// Get references to the mode toggle buttons.
const spaceshipButton = document.getElementById("toggleSpaceshipMode");
const orbitButton = document.getElementById("toggleOrbitMode");

/**
 * Spaceship Mode active handler.
 * This function runs when Spaceship Mode is activated.
 */
function spaceshipModeHandler(event) {
  console.log("Spaceship Mode activated!");
  // Add additional Spaceship Mode functionality here.
}

/**
 * Spaceship Mode disabled handler.
 * This function runs when the user clicks the Spaceship Mode button while Orbit Mode is active.
 */
function disabledSpaceshipModeHandler(event) {
  event.preventDefault();
  event.stopImmediatePropagation(); // Prevent any further event listeners from firing.
  alert("Error: Spaceship Mode is disabled while Orbit Mode is active.");
}

// Initially attach the active Spaceship Mode handler.
spaceshipButton.addEventListener("click", spaceshipModeHandler);

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
 * Sets up event listeners to toggle between Spaceship Mode and Orbit Mode.
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
      orbitButton.innerHTML = ORIGINAL_MODE_HTML;

      // Disable Spaceship Mode functionality:
      // Remove the normal (bubble‑phase) handler and add the disabled handler in the capturing phase.
      spaceshipButton.removeEventListener("click", spaceshipModeHandler);
      spaceshipButton.addEventListener("click", disabledSpaceshipModeHandler, true);
      spaceshipButton.classList.add("disabled");

      loadOrbitPlanets(scene, camera, controls);
    } else {
      // Deactivate Orbit Mode and revert to Default Mode.
      removeOrbitObjects(scene);
      orbitModeActive = false;
      orbitButton.innerHTML = ORBIT_MODE_HTML;

      // Re-enable Spaceship Mode functionality:
      // Remove the capturing disabled handler and reattach the normal handler.
      spaceshipButton.removeEventListener("click", disabledSpaceshipModeHandler, true);
      spaceshipButton.addEventListener("click", spaceshipModeHandler);
      spaceshipButton.classList.remove("disabled");

      loadDefaultPlanets(scene, camera, controls);
    }
  });
}

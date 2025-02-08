// setupModeToggles.js
import { loadOrbitPlanets } from "./loadOrbitPlanets.js";
import { loadDefaultPlanets } from "./loadDefaultPlanets.js";

// Track the current orbit mode status.
let orbitModeActive = false;

// HTML templates for the orbit toggle button.
const ORBIT_MODE_HTML = `
  <i class="fa-solid fa-earth-americas"></i>
  <span class="icon-label">Orbit Mode</span>
`;
const ORIGINAL_MODE_HTML = `
  <i class="fa-solid fa-earth-americas"></i>
  <span class="icon-label">Original Mode</span>
`;

// Function to display an error message
function showError(message) {
  let errorBox = document.getElementById("errorMessage");
  if (!errorBox) {
    errorBox = document.createElement("div");
    errorBox.id = "errorMessage";
    errorBox.style.position = "fixed";
    errorBox.style.top = "20px";
    errorBox.style.left = "50%";
    errorBox.style.transform = "translateX(-50%)";
    errorBox.style.background = "rgba(255, 0, 0, 0.8)";
    errorBox.style.color = "white";
    errorBox.style.padding = "10px 20px";
    errorBox.style.borderRadius = "5px";
    errorBox.style.fontSize = "14px";
    errorBox.style.zIndex = "1000";
    document.body.appendChild(errorBox);
  }
  errorBox.textContent = message;
  errorBox.style.display = "block";

  setTimeout(() => {
    errorBox.style.display = "none";
  }, 3000);
}

/**
 * Removes orbit-specific objects from the scene.
 * This includes the orbit mode model and any objects marked as orbit lines.
 * @param {THREE.Scene} scene - The Three.js scene.
 */
function removeOrbitObjects(scene) {
  const orbitModel = scene.getObjectByName("orbitModeModel");
  if (orbitModel) {
    scene.remove(orbitModel);
    console.log("Orbit mode model removed.");
  }
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
  const spaceshipButton = document.getElementById("toggleSpaceshipMode");
  const orbitButton = document.getElementById("toggleOrbitMode");

  // Set up Spaceship Mode event listener.
  spaceshipButton.addEventListener("click", () => {
    if (orbitModeActive) {
      showError("You cannot use Spaceship Mode while in Orbit Mode");
      console.error("You cannot use Spaceship Mode while in Orbit Mode");
      return;
    }
    console.log("Spaceship Mode activated!");
  });

  // Set up Orbit Mode toggle event listener.
  orbitButton.addEventListener("click", () => {
    if (!orbitModeActive) {
      orbitModeActive = true;
      orbitButton.innerHTML = ORIGINAL_MODE_HTML;
      loadOrbitPlanets(scene, camera, controls);
      spaceshipButton.disabled = true;
    } else {
      removeOrbitObjects(scene);
      orbitModeActive = false;
      orbitButton.innerHTML = ORBIT_MODE_HTML;
      loadDefaultPlanets(scene, camera, controls);
      spaceshipButton.disabled = false;
    }
  });
}

import { initScene } from './initScene.js';
import { initLights } from './initLights.js';
import { initSkybox } from './initSkybox.js';
import { loadPlanets } from './loadPlanets.js';
import { initControls } from './initControls.js';
import { handleResize, handleMouseEvents } from './handleEvents.js';
import { initSpaceshipMode } from './spaceshipHandler.js';
import { setupModeToggles } from './modes.js';
import { setupSearchFunctionality } from './searchHandler.js';
import { showPlanetInfo, hidePlanetInfo } from './planetInfo.js';
import { comparePlanets, hideNonComparedPlanets, showAllPlanets } from './comparePlanets.js';
import { updateOrbitModeAnimation } from './loadOrbitPlanets.js';
import { loadOrbitPlanets } from './loadOrbitPlanets.js';

document.addEventListener('DOMContentLoaded', () => {
  // ================================
  // INITIALIZATION
  // ================================
  const { scene, camera, renderer } = initScene();
  let orbitModeActive = true; // Default orbit mode state

  const controls = initControls(camera, renderer);
  const spaceshipControls = initSpaceshipMode(camera, controls);

  // Configure renderer and add to DOM
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.zIndex = "1"; // Ensure canvas is behind UI elements
  document.body.appendChild(renderer.domElement);

  // ================================
  // ENVIRONMENT SETUP
  // ================================
  initLights(scene);
  initSkybox(scene);
  loadPlanets(scene);
  handleResize(camera, renderer);
  handleMouseEvents(scene, camera);

  // ================================
  // FEATURE SETUP
  // ================================
  // Pass a callback to toggle orbit mode state
  setupModeToggles(scene, camera, controls, (isActive) => {
    orbitModeActive = isActive;
  });
  setupSearchFunctionality(scene, camera, controls);

  // ================================
  // POPULATE DROPDOWNS (Planet Selection)
  // ================================
  const planetData = {
    mercury: { name: "Mercury" },
    venus: { name: "Venus" },
    earth: { name: "Earth" },
    mars: { name: "Mars" },
    jupiter: { name: "Jupiter" },
    saturn: { name: "Saturn" },
    uranus: { name: "Uranus" },
    neptune: { name: "Neptune" },
    moon: { name: "Moon" },
    sun: { name: "Sun" }
  };

  const planetSelect1 = document.getElementById('planetSelect1');
  const planetSelect2 = document.getElementById('planetSelect2');

  function populateDropdowns() {
    Object.keys(planetData).forEach(key => {
      const option1 = document.createElement("option");
      const option2 = document.createElement("option");
      option1.value = key;
      option2.value = key;
      option1.textContent = planetData[key].name;
      option2.textContent = planetData[key].name;
      planetSelect1.appendChild(option1);
      planetSelect2.appendChild(option2);
    });
  }
  populateDropdowns();

  // ================================
  // COMPARE PANEL SETUP
  // ================================
  const compareButton = document.getElementById('confirmCompareButton');
  const toggleCompareButton = document.getElementById('toggleCompare');
  const comparePanel = document.getElementById('comparePanel');
  const closeComparePanel = document.getElementById('closeComparePanel');

  // Open compare panel
  toggleCompareButton.addEventListener('click', () => {
    if (comparePanel) {
      comparePanel.style.display = 'block';
    }
  });

  // Close compare panel
  if (closeComparePanel) {
    closeComparePanel.addEventListener('click', () => {
      comparePanel.style.display = 'none';
    });
  }

  // Notification for comparing planets
  const compareNotification = document.createElement('div');
  compareNotification.style.position = 'fixed';
  compareNotification.style.top = '20px';
  compareNotification.style.left = '50%';
  compareNotification.style.transform = 'translateX(-50%)';
  compareNotification.style.padding = '10px 20px';
  compareNotification.style.fontSize = '16px';
  compareNotification.style.borderRadius = '5px';
  compareNotification.style.zIndex = '1000';
  compareNotification.style.display = 'none';
  document.body.appendChild(compareNotification);

  function showCompareNotification(message, isError = false) {
    compareNotification.textContent = message;
    compareNotification.style.backgroundColor = isError ? '#ff4d4d' : '#4CAF50';
    compareNotification.style.color = 'white';
    compareNotification.style.display = 'block';
    setTimeout(() => {
      compareNotification.style.display = 'none';
    }, 3000);
  }

  compareButton.addEventListener('click', () => {
    const planet1 = planetSelect1.value;
    const planet2 = planetSelect2.value;

    if (!planet1 || !planet2) {
      showCompareNotification("Please select two planets to compare.", true);
      return;
    }
    if (planet1 === planet2) {
      showCompareNotification("Error: Please select two different planets!", true);
      return;
    }

    showCompareNotification("Comparing planets...");
    showAllPlanets(scene);
    hideNonComparedPlanets(scene, [planet1.toLowerCase(), planet2.toLowerCase()]);
    comparePlanets(planet1, planet2, scene, camera, controls);

    if (comparePanel) {
      comparePanel.style.display = 'none';
    }
  });

  // ================================
  // ANIMATION LOOP
  // ================================
const clock = new THREE.Clock();  // Create a clock to track elapsed time

function animate() {
requestAnimationFrame(animate);

const deltaTime = clock.getDelta();  // Time elapsed since the last frame (in seconds)

updateOrbitModeAnimation(deltaTime);  // Update the planet orbits
renderer.render(scene, camera);       // Render the scene
}

animate();  // Start the animation loop
});

function showSpaceshipNotification() {
  const notification = document.getElementById("spaceshipNotification");
  notification.classList.add("visible");

  // Hide notification after 3 seconds
  setTimeout(() => {
      notification.classList.remove("visible");
  }, 3000);
}

document.getElementById("toggleSpaceshipMode").addEventListener("click", () => {
  showSpaceshipNotification();
});


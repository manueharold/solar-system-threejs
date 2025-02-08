import { initScene } from './initScene.js';
import { initLights } from './initLights.js';
import { initSkybox } from './initSkybox.js';
import { loadPlanets } from './loadPlanets.js';
import { initControls } from './initControls.js';
import { handleResize, handleMouseEvents } from './handleEvents.js';
import { initSpaceshipMode } from './spaceshipHandler.js';
import { startAnimation } from './animation.js';
import { setupModeToggles } from './modes.js';
import { setupSearchFunctionality } from './searchHandler.js';
import { showPlanetInfo, hidePlanetInfo } from './planetInfo.js';
import { comparePlanets, hideNonComparedPlanets, showAllPlanets } from './comparePlanets.js';
import { updateOrbitModeAnimation } from './loadOrbitPlanets.js';
import { loadOrbitPlanets } from './loadOrbitPlanets.js';

// Wrap everything in DOMContentLoaded to ensure the DOM is ready.
document.addEventListener('DOMContentLoaded', () => {
  // ================================
  // INITIALIZATION
  // ================================

  // 🎥 Setup Scene, Camera, and Renderer
  const { scene, camera, renderer } = initScene();
  let orbitModeActive = false;

  const controls = initControls(camera, renderer);
  const spaceshipControls = initSpaceshipMode(camera, controls);

  // Get references to the UI elements
  const planetSelect1 = document.getElementById('planetSelect1');
  const planetSelect2 = document.getElementById('planetSelect2');
  const compareButton = document.getElementById('confirmCompareButton');
  const toggleCompareButton = document.getElementById('toggleCompare');
  const searchButton = document.getElementById('toggleSearch');
  const searchPanel = document.getElementById('searchPanel');
  // (Optional) Get reference to the compare panel (make sure IDs are unique in your HTML)
  const comparePanel = document.getElementById('comparePanel');
  const closeComparePanel = document.getElementById('closeComparePanel');

  // Set renderer size and styling
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.zIndex = "1"; // Ensures canvas is behind UI elements

  // 🔆 Setup Lights and Skybox
  initLights(scene);
  initSkybox(scene);

  // 🌍 Load Default Planets on Startup
  loadPlanets(scene);

  // 📏 Handle Window Resize and Mouse Events
  handleResize(camera, renderer);
  handleMouseEvents(scene, camera);

  // ================================
  // FEATURE SETUP
  // ================================
  
export function setupModeToggles(scene, camera, controls) {
  const orbitModeButton = document.getElementById('orbitModeButton'); // Make sure this matches your button's ID

  orbitModeButton.addEventListener('click', () => {
    loadOrbitPlanets(scene, camera, controls);
    orbitModeActive = true; // ✅ Activate orbit mode
  });
}

  setupSearchFunctionality(scene, camera, controls);

  // ------------------------------
  // Populate the dropdowns for planet selection
  // ------------------------------
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

  // ------------------------------
  // Compare Panel Logic
  // ------------------------------

  // Open compare panel when toolbar "Compare Planets" button is clicked
  toggleCompareButton.addEventListener('click', () => {
    if (comparePanel) {
      comparePanel.style.display = 'block';
    }
  });

  // Optional: close compare panel when its close button is clicked
  if (closeComparePanel) {
    closeComparePanel.addEventListener('click', () => {
      comparePanel.style.display = 'none';
    });
  }

  // Create a popup notification for comparing planets (and errors)
  const compareNotification = document.createElement('div');
  compareNotification.style.position = 'fixed';
  compareNotification.style.top = '20px';
  compareNotification.style.left = '50%';
  compareNotification.style.transform = 'translateX(-50%)';
  compareNotification.style.padding = '10px 20px';
  compareNotification.style.fontSize = '16px';
  compareNotification.style.borderRadius = '5px';
  compareNotification.style.zIndex = '1000';
  compareNotification.style.display = 'none'; // Hidden initially
  document.body.appendChild(compareNotification);

  // Function to show notification (green for success, red for error)
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

    // Restore all planets first
    showAllPlanets(scene);

    // Then hide all except the selected ones.
    hideNonComparedPlanets(scene, [planet1.toLowerCase(), planet2.toLowerCase()]);

    comparePlanets(planet1, planet2, scene, camera, controls);

    if (comparePanel) {
      comparePanel.style.display = 'none';
    }
});




  // ================================
  // ANIMATION LOOP
  // ================================
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();

    if (orbitModeActive) {
      updateOrbitModeAnimation(deltaTime, scene);
    }
    renderer.render(scene, camera);
    controls.update();
  }
  animate();
});

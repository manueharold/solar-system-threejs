import { initScene } from './initScene.js';
import { initLights } from './initLights.js';
import { initSkybox } from './initSkybox.js';
import { loadPlanets } from './loadPlanets.js';
import { initControls } from './initControls.js';
import { handleResize, handleMouseEvents } from './handleEvents.js';
import { setupModeToggles } from './modes.js';
import { setupSearchFunctionality } from './searchHandler.js';
import { showPlanetInfo, hidePlanetInfo } from './planetInfo.js';
import { comparePlanets, hideNonComparedPlanets, showAllPlanets } from './comparePlanets.js';
import { updateOrbitModeAnimation, loadOrbitPlanets } from './loadOrbitPlanets.js';
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

document.addEventListener('DOMContentLoaded', () => {
  // INITIALIZATION
  const { scene, camera, renderer } = initScene();
  let orbitModeActive = true; // Default orbit mode state

  const controls = initControls(camera, renderer);
  controls.minDistance = 10000;
  controls.maxDistance = 20000;

  // Configure renderer and add to DOM
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.zIndex = "1"; // Ensure canvas is behind UI elements
  document.body.appendChild(renderer.domElement);

  // ENVIRONMENT SETUP
  initLights(scene);
  initSkybox(scene);
  loadPlanets(scene); // Loads planets and handles the loading bar UI.
  handleResize(camera, renderer);
  handleMouseEvents(scene, camera);

  // FEATURE SETUP
  setupModeToggles(scene, camera, controls, (isActive) => {
    orbitModeActive = isActive;
  });
  setupSearchFunctionality(scene, camera, controls);

  // Populate dropdowns for planet selection.
  const planetData = {
    mercury: { name: "Mercury" },
    venus: { name: "Venus" },
    earth: { name: "Earth" },
    mars: { name: "Mars" },
    jupiter: { name: "Jupiter" },
    saturn: { name: "Saturn" },
    uranus: { name: "Uranus" },
    neptune: { name: "Neptune" },
    moon: { name: "Moon" }
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

  // COMPARE PANEL SETUP
  const compareButton = document.getElementById('confirmCompareButton');
  const toggleCompareButton = document.getElementById('toggleCompare');
  const comparePanel = document.getElementById('comparePanel');
  const closeComparePanel = document.getElementById('closeComparePanel');

  toggleCompareButton.addEventListener('click', () => {
    if (window.orbitModeEnabled) {
      showCompareNotification("You cannot use Compare Planets when in Orbit Mode.", true);
      return;
    }
    if (comparePanel) {
      comparePanel.style.display = 'block';
    }
  });

  if (closeComparePanel) {
    closeComparePanel.addEventListener('click', () => {
      comparePanel.style.display = 'none';
    });
  }

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

  // ANIMATION LOOP (for Orbit Mode animations)
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();
    updateOrbitModeAnimation(deltaTime);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
});

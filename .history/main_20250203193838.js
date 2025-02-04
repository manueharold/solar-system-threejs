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
import { comparePlanets } from './comparePlanets.js'; 

// ================================
// INITIALIZATION
// ================================

// 🎥 Setup Scene, Camera, and Renderer
const { scene, camera, renderer } = initScene();

const controls = initControls(camera, renderer);
const spaceshipControls = initSpaceshipMode(camera, controls);

// Get references to the UI elements
const planetSelect1 = document.getElementById('planetSelect1');
const planetSelect2 = document.getElementById('planetSelect2');
const compareButton  = document.getElementById('compareButton');
const searchButton = document.getElementById('toggleSearch');
const searchPanel = document.getElementById('searchPanel');


renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = "absolute";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.zIndex = "1";  // Ensures canvas is behind UI elements

// 🔆 Setup Lights and Skybox
initLights(scene);
initSkybox(scene);

// 🌍 Load Default Planets on Startup
loadPlanets(scene);

// 📏 Handle Window Resize and Mouse Events
handleResize(camera, renderer);
handleMouseEvents(scene, camera);

// 🚀 Start Animation Loop
startAnimation(scene, camera, renderer, controls);

// ================================
// FEATURE SETUP
// ================================
setupModeToggles(scene, camera, controls);
setupSearchFunctionality(scene, camera, controls);

// Attach a click event listener to the compare button
compareButton.addEventListener('click', () => {
    const planet1 = planetSelect1.value;
    const planet2 = planetSelect2.value;
  
    if (planet1 === planet2) {
      console.warn("Please select two different planets to compare.");
      return;
    }
    
    // Call the comparePlanets function with the selected planets
    comparePlanets(planet1, planet2, scene, camera, controls);
});

// Toggle search panel visibility when the search icon is clicked
searchButton.addEventListener('click', () => {
  // Ensure it's visible
  searchPanel.style.display = 'block'; 

  // Add a small delay to trigger the transition
  setTimeout(() => {
    searchPanel.classList.add('visible'); // Add animation class to make it visible with effects
    searchInput.focus(); // Focus the input field when the panel is visible
  }, 10); // Small delay to trigger the transition
});

// Hide the search panel once the search is complete
function completeSearch() {
  searchPanel.style.display = 'none'; // Hide the panel after the search is complete
}

// Prevent closing when clicking inside the search panel
searchPanel.addEventListener('click', (e) => {
  e.stopPropagation(); // This prevents the click event from propagating to the body or other elements
});

// Close the search panel when clicking outside of it
document.body.addEventListener('click', closeSearchPanel);


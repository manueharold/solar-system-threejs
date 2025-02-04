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
  
    // Log to console or display a message if both planets are the same
    if (planet1 === planet2) {
      console.warn("Please select two different planets to compare.");
      return;
    }
    
    // Call the comparePlanets function with the selected planets
    comparePlanets(planet1, planet2, scene, camera, controls);
  });


import { initScene } from './initScene.js';
import { initLights } from './initLights.js';
import { initSkybox } from './initSkybox.js';
import { loadEarthModel } from './loadEarthModel.js';
import { loadVenusModel } from './loadVenusModel.js';
import { loadMercuryModel } from './loadMercuryModel.js';
import { loadMarsModel } from './loadMarsModel.js';
import { loadJupiterModel } from './loadJupiterModel.js';
import { loadSaturnModel } from './loadSaturnModel.js';
import { loadUranusModel } from './loadUranusModel.js';
import { loadNeptuneModel } from './loadNeptuneModel.js';
import { loadSunModel } from './loadSunModel.js';
import { initControls } from './initControls.js';
import { setupPlanetClick } from "./handlePlanetClick.js";
import { handleResize, handleMouseEvents } from './handleEvents.js';
import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Initialize scene, camera, and renderer
const { scene, camera, renderer } = initScene();

// Setup lights
initLights(scene);

// Setup skybox
initSkybox(scene);

// Load models
loadEarthModel(scene, renderer, camera);   // Earth
loadVenusModel(scene, renderer, camera);   // Venus
loadMercuryModel(scene, renderer, camera); // Mercury
loadMarsModel(scene, renderer, camera);    // Mars
loadJupiterModel(scene, renderer, camera); // Jupiter
loadSaturnModel(scene, renderer, camera);  // Saturn
loadUranusModel(scene, renderer, camera);  // Uranus
loadNeptuneModel(scene, renderer, camera); // Neptune
loadSunModel(scene, renderer, camera);      // Sun

// Set up OrbitControls
const controls = initControls(camera, renderer);

// Event handlers
handleResize(camera, renderer);
handleMouseEvents(scene, camera);

// Function to handle planet selection and send data to React
function onPlanetSelect(planetData) {
    window.dispatchEvent(new CustomEvent("planetSelected", { detail: planetData }));
}

// Call the function after setting up the scene
setupPlanetClick(scene, camera, onPlanetSelect);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update controls for smoother interaction
    renderer.render(scene, camera); // Render the scene
}
animate();

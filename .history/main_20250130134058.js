import { initScene } from './initScene.js';
import { initLights } from './initLights.js';
import { initSkybox } from './initSkybox.js';
import { loadPlanets } from './loadPlanets.js';
import { createSearchButton } from './loadPlanets.js'; 
import { initControls } from './initControls.js';
import { handleResize, handleMouseEvents } from './handleEvents.js';
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// Initialize scene, camera, and renderer
const { scene, camera, renderer } = initScene();

// Setup lights
initLights(scene);

// Setup skybox
initSkybox(scene);

// Load all the planet models
loadPlanets(scene);

// Create search button
createSearchButton(scene, camera); // This function creates the search button and input

// Set up OrbitControls (not used directly for planet search, but part of your scene)
const controls = initControls(camera, renderer);

// Event handlers for resizing and mouse interactions
handleResize(camera, renderer);
handleMouseEvents(scene, camera);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update controls for smooth movement
    renderer.render(scene, camera);
}
animate();

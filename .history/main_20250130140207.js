import { initScene } from './initScene.js';
import { initLights } from './initLights.js';
import { initSkybox } from './initSkybox.js';
import { loadPlanets, createSearchButton } from './loadPlanets.js'; 
import { initControls } from './initControls.js';
import { handleResize, handleMouseEvents } from './handleEvents.js';
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import TWEEN from "https://cdn.skypack.dev/@tweenjs/tween.js";

// Initialize scene, camera, and renderer
const { scene, camera, renderer } = initScene();

// Setup lights
initLights(scene);

// Setup skybox
initSkybox(scene);

// Load all the planet models
loadPlanets(scene);

// Create search button (allows searching for planets)
createSearchButton(scene, camera);

// Set up OrbitControls for user interaction
const controls = initControls(camera, renderer);

// Event handlers for resizing and mouse interactions
handleResize(camera, renderer);
handleMouseEvents(scene, camera);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update controls for smooth movement
    TWEEN.update();    // ✅ Ensure TWEEN animations are updated
    renderer.render(scene, camera);
}
animate();
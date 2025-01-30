import { initScene } from './initScene.js';
import { initLights } from './initLights.js';
import { initSkybox } from './initSkybox.js';
import { loadPlanets, setupPlanetClick } from './loadPlanets.js'; 
import { initControls } from './initControls.js';
import { handleResize, handleMouseEvents } from './handleEvents.js';
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import * as TWEEN from 'https://cdn.skypack.dev/@tweenjs/tween.js'; // Import TWEEN for smooth animation

// Initialize scene, camera, and renderer
const { scene, camera, renderer } = initScene();

// Setup lights
initLights(scene);

// Setup skybox
initSkybox(scene);

// Load all the planet models and get the planets array
const planets = loadPlanets(scene);

// Setup raycasting and zoom-in on click functionality
setupPlanetClick(scene, camera, renderer, planets);

// Add the "Orbit Scene" button
const button = document.createElement("button");
button.innerText = "Orbit Scene";
document.body.appendChild(button);

// Event listener to switch to orbit scene
button.addEventListener("click", () => {
    switchToOrbitScene(scene, camera, renderer);
});

// Set up OrbitControls
const controls = initControls(camera, renderer);

// Event handlers
handleResize(camera, renderer);
handleMouseEvents(scene, camera);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    TWEEN.update(); // Ensure TWEEN animations update each frame
}
animate();

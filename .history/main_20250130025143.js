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
import { handleResize, handleMouseEvents } from './handleEvents.js';
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Initialize scene, camera, and renderer
const { scene, camera, renderer } = initScene();

// Setup lights and skybox
initLights(scene);
initSkybox(scene);

// Function to clear all objects in the scene
function clearScene() {
    scene.children.forEach(child => {
        scene.remove(child); // Remove all models
    });
}

// Load default solar system models
function loadDefaultSystem() {
    clearScene();

    loadEarthModel(scene, renderer, camera);   // Earth
    loadVenusModel(scene, renderer, camera);   // Venus
    loadMercuryModel(scene, renderer, camera); // Mercury
    loadMarsModel(scene, renderer, camera);    // Mars
    loadJupiterModel(scene, renderer, camera); // Jupiter
    loadSaturnModel(scene, renderer, camera);  // Saturn
    loadUranusModel(scene, renderer, camera);  // Uranus
    loadNeptuneModel(scene, renderer, camera); // Neptune
    loadSunModel(scene, renderer, camera);     // Sun
}

// Load new solar system model (from GLB)
function loadNewSystem() {
    clearScene();

    const loader = new GLTFLoader();
    loader.load('./3d_models/new_solar_system.glb', (gltf) => {
        const newSolarSystem = gltf.scene;
        scene.add(newSolarSystem);
        
        // Optionally, scale and position the new model as needed
    }, undefined, (error) => {
        console.error('Error loading new solar system model:', error);
    });
}

// Set up OrbitControls
const controls = initControls(camera, renderer);

// Event handlers for buttons to switch between solar systems
document.getElementById('loadNewSystem').addEventListener('click', () => {
    loadNewSystem(); // Load the new solar system
});

document.getElementById('loadDefaultSystem').addEventListener('click', () => {
    loadDefaultSystem(); // Load the default solar system
});

// Initial load of the default solar system
loadDefaultSystem();

// Handle resizing and mouse events
handleResize(camera, renderer);
handleMouseEvents(scene, camera);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

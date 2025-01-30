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
import { switchToOrbitScene } from './switchToOrbitScene.js';
import { handleResize, handleMouseEvents } from './handleEvents.js';
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
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
loadSunModel(scene, renderer, camera);     // Sun

// Create Orbit Scene Button
const button = document.createElement("button");
button.innerText = "Orbit Scene";
document.body.appendChild(button);

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
}
animate();

// Function to transition to the orbit scene
function switchToOrbitScene(scene, camera, renderer) {
    // Remove all existing models in the scene
    scene.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
            scene.remove(child); // Remove planets, sun, and other meshes
        }
    });

    // Load and add the new solar system orbit model
    const loader = new GLTFLoader();
    loader.load('./3d_models/solarSystem.glb', (gltf) => {
        const solarSystemOrbit = gltf.scene;
        scene.add(solarSystemOrbit);

        // The model should already have its own rotation animations, no need to add manual rotation
    }, undefined, (error) => {
        console.error('Error loading Solar System Orbit model:', error);
    });
}

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

// Setup lights
initLights(scene);

// Setup skybox
initSkybox(scene);

// Load models and pass each planet to initControls
const earth = loadEarthModel(scene, renderer, camera);
const venus = loadVenusModel(scene, renderer, camera);
const mercury = loadMercuryModel(scene, renderer, camera);
const mars = loadMarsModel(scene, renderer, camera);
const jupiter = loadJupiterModel(scene, renderer, camera);
const saturn = loadSaturnModel(scene, renderer, camera);
const uranus = loadUranusModel(scene, renderer, camera);
const neptune = loadNeptuneModel(scene, renderer, camera);
const sun = loadSunModel(scene, renderer, camera);

// Set up OrbitControls for each planet (assuming each planet is returned as a mesh)
initControls(camera, renderer, scene, earth);  // Earth
initControls(camera, renderer, scene, venus);  // Venus
initControls(camera, renderer, scene, mercury); // Mercury
initControls(camera, renderer, scene, mars);    // Mars
initControls(camera, renderer, scene, jupiter); // Jupiter
initControls(camera, renderer, scene, saturn);  // Saturn
initControls(camera, renderer, scene, uranus);  // Uranus
initControls(camera, renderer, scene, neptune); // Neptune
initControls(camera, renderer, scene, sun);     // Sun

// Event handlers
handleResize(camera, renderer);
handleMouseEvents(scene, camera);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

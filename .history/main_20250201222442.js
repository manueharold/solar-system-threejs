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
// ================================
// INITIALIZATION
// ================================

// 🎥 Setup Scene, Camera, and Renderer
const { scene, camera, renderer } = initScene();

// Create groups for the two modes
const defaultPlanetsGroup = new THREE.Group();
defaultPlanetsGroup.name = "defaultPlanetsGroup";
scene.add(defaultPlanetsGroup);

const orbitModeGroup = new THREE.Group();
orbitModeGroup.name = "orbitModeGroup";
scene.add(orbitModeGroup);

// Initially, only the default planets are visible
defaultPlanetsGroup.visible = true;
orbitModeGroup.visible = false;




const controls = initControls(camera, renderer);
const spaceshipControls = initSpaceshipMode(camera, controls);



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
setupPlanetInfoPanel();

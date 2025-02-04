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
// const { scene, camera, renderer } = initScene();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
const { planets, rotationSpeeds, moonOrbitPaused } = loadPlanets(scene);

// Lighting setup
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(10, 10, 10).normalize();
scene.add(sunLight);

const ambientLight = new THREE.AmbientLight(0x404040); 
scene.add(ambientLight);

camera.position.z = 15000;

function animate() {
    requestAnimationFrame(animate);

    // Update planet and moon movements
    for (const planetName in planets) {
        const planet = planets[planetName];
        if (rotationSpeeds[planetName]) {
            planet.rotation.y += rotationSpeeds[planetName];
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();


// const controls = initControls(camera, renderer);
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


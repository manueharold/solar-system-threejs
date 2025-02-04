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
import { updateOrbitModeAnimation } from './loadOrbitPlanets.js'; 

// ================================
// INITIALIZATION
// ================================

// 🎥 Setup Scene, Camera, and Renderer
const { scene, camera, renderer } = initScene();

let orbitModeActive = false;

const controls = initControls(camera, renderer);
const spaceshipControls = initSpaceshipMode(camera, controls);

// Get references to the UI elements
const comparePanel = document.getElementById('comparePanel');
const planetSelect1 = document.getElementById('planetSelect1');
const planetSelect2 = document.getElementById('planetSelect2');
const compareButton = document.getElementById('toggleCompare'); // Button to open panel
const confirmCompareButton = document.getElementById('confirmCompareButton'); // Compare button inside panel
const closeComparePanel = document.getElementById('closeComparePanel'); // Close panel button

// Set renderer size and styling
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = "absolute";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.zIndex = "1"; // Ensures canvas is behind UI elements

// 🔆 Setup Lights and Skybox
initLights(scene);
initSkybox(scene);

// 🌍 Load Default Planets on Startup
loadPlanets(scene);

// 📏 Handle Window Resize and Mouse Events
handleResize(camera, renderer);
handleMouseEvents(scene, camera);

// ================================
// FEATURE SETUP
// ================================

setupModeToggles(scene, camera, controls);
setupSearchFunctionality(scene, camera, controls);

// ================================
// COMPARE PLANETS FEATURE
// ================================

// Open Compare Panel
compareButton.addEventListener('click', () => {
    comparePanel.style.display = 'block';
});

// Close Compare Panel
closeComparePanel.addEventListener('click', () => {
    comparePanel.style.display = 'none';
});

// Compare Planets when clicking the confirm button inside the panel
confirmCompareButton.addEventListener('click', () => {
    const planet1 = planetSelect1.value;
    const planet2 = planetSelect2.value;

    if (planet1 === planet2) {
        alert("Please select two different planets to compare.");
        return;
    }

    console.log(`Comparing planets: ${planet1} vs ${planet2}`);

    // Call the compare function
    comparePlanets(planet1, planet2, scene, camera, controls);

    // Hide panel after comparison
    comparePanel.style.display = 'none';
});

// ================================
// ANIMATION LOOP
// ================================

// Animation clock for deltaTime
const clock = new THREE.Clock();

// Main animate function
function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta(); // Get the time delta for smooth animation

    // Call the orbit mode animation update if enabled
    if (orbitModeActive) {
        updateOrbitModeAnimation(deltaTime, scene);
    }

    // Render the scene with the camera
    renderer.render(scene, camera);

    // Update controls for camera movement
    controls.update();
}

// Start the animation loop
animate();

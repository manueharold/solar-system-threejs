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
const planetSelect1 = document.getElementById('planetSelect1');
const planetSelect2 = document.getElementById('planetSelect2');
const compareButton = document.getElementById('compareButton');
const searchButton = document.getElementById('toggleSearch');
const searchPanel = document.getElementById('searchPanel');

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

// Create a popup notification for comparing planets
const compareNotification = document.createElement('div');
compareNotification.style.position = 'fixed';
compareNotification.style.top = '20px';
compareNotification.style.left = '50%';
compareNotification.style.transform = 'translateX(-50%)';
compareNotification.style.backgroundColor = '#4CAF50';
compareNotification.style.color = 'white';
compareNotification.style.padding = '10px 20px';
compareNotification.style.fontSize = '16px';
compareNotification.style.borderRadius = '5px';
compareNotification.style.zIndex = '1000';
compareNotification.style.display = 'none'; // Hidden initially
document.body.appendChild(compareNotification);

// Function to show notification
function showCompareNotification() {
    compareNotification.textContent = "You can now compare planets!";
    compareNotification.style.display = 'block';
    setTimeout(() => {
        compareNotification.style.display = 'none';
    }, 3000);
}

// Attach a click event listener to the compare button
compareButton.addEventListener('click', () => {
    const planet1 = planetSelect1.value;
    const planet2 = planetSelect2.value;

    if (planet1 === planet2) {
        console.warn("Please select two different planets to compare.");
        return;
    }

    // Show the compare planets notification
    showCompareNotification();

    // Call the comparePlanets function with the selected planets
    comparePlanets(planet1, planet2, scene, camera, controls);
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

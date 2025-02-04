import { initScene } from './initScene.js';
import { initLights } from './initLights.js';
import { initSkybox } from './initSkybox.js';
import { loadPlanets, planets } from './loadPlanets.js';
import { initControls } from './initControls.js';
import { handleResize, handleMouseEvents } from './handleEvents.js';
import { initSpaceshipMode } from './spaceshipHandler.js';
import { setupModeToggles } from './modes.js';
import { setupSearchFunctionality } from './searchHandler.js';
import { comparePlanets } from './comparePlanets.js';
import { updateOrbitPositions } from './orbitMode.js'; // Importing the orbit update function

// ================================
// INITIALIZATION
// ================================

// 🎥 Setup Scene, Camera, and Renderer
const { scene, camera, renderer } = initScene();

const controls = initControls(camera, renderer);
initSpaceshipMode(camera, controls);

updateOrbitPositions(deltaTime, planets);


// Get references to the UI elements
const planetSelect1 = document.getElementById('planetSelect1');
const planetSelect2 = document.getElementById('planetSelect2');
const compareButton = document.getElementById('compareButton');

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
setupModeToggles(scene, camera, controls, planets);

// 📏 Handle Window Resize and Mouse Events
handleResize(camera, renderer);
handleMouseEvents(scene, camera);

// ================================
// FEATURE SETUP
// ================================

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
    const deltaTime = clock.getDelta();

    updateOrbitPositions(deltaTime, planets); // 🌍 Update planet orbits if in orbit mode

    renderer.render(scene, camera);
    controls.update();
}

// Start the animation loop
animate();

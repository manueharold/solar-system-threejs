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
const compareButton = document.getElementById('confirmCompareButton');
const closeComparePanel = document.getElementById('closeComparePanel');
const comparisonResults = document.getElementById('comparisonResults');
const comparisonText = document.getElementById('comparisonText');
const closeComparisonResults = document.getElementById('closeComparisonResults');

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

// 🌎 Populate planet select dropdowns dynamically
const planetData = {
    mercury: { name: "Mercury", diameter: "4,880 km", distance: "57.9M km", moons: "0", orbitalPeriod: "88 days" },
    venus: { name: "Venus", diameter: "12,104 km", distance: "108.2M km", moons: "0", orbitalPeriod: "225 days" },
    earth: { name: "Earth", diameter: "12,742 km", distance: "149.6M km", moons: "1", orbitalPeriod: "365 days" },
    mars: { name: "Mars", diameter: "6,779 km", distance: "227.9M km", moons: "2", orbitalPeriod: "687 days" },
    jupiter: { name: "Jupiter", diameter: "139,820 km", distance: "778.5M km", moons: "79", orbitalPeriod: "12 years" },
    saturn: { name: "Saturn", diameter: "116,460 km", distance: "1.4B km", moons: "83", orbitalPeriod: "29 years" },
    uranus: { name: "Uranus", diameter: "50,724 km", distance: "2.9B km", moons: "27", orbitalPeriod: "84 years" },
    neptune: { name: "Neptune", diameter: "49,244 km", distance: "4.5B km", moons: "14", orbitalPeriod: "165 years" },
    moon: { name: "Moon", diameter: "3,474 km", distance: "384,400 km", moons: "0", orbitalPeriod: "27 days" },
    sun: { name: "Sun", diameter: "1.39M km", distance: "0 km", moons: "0", orbitalPeriod: "—" }
};

// Populate dropdowns
function populateDropdowns() {
    Object.keys(planetData).forEach(key => {
        let option1 = document.createElement("option");
        let option2 = document.createElement("option");
        option1.value = key;
        option2.value = key;
        option1.textContent = planetData[key].name;
        option2.textContent = planetData[key].name;
        planetSelect1.appendChild(option1);
        planetSelect2.appendChild(option2);
    });
}
populateDropdowns();

// 🛎️ Compare Planets Notification
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
    compareNotification.textContent = "Comparing planets...";
    compareNotification.style.display = 'block';
    setTimeout(() => {
        compareNotification.style.display = 'none';
    }, 2000);
}

// 🆚 Compare Planets Button Click
compareButton.addEventListener('click', () => {
    const planet1 = planetSelect1.value;
    const planet2 = planetSelect2.value;

    if (!planet1 || !planet2) {
        console.warn("Please select two planets to compare.");
        return;
    }

    if (planet1 === planet2) {
        alert("Please select two different planets!");
        return;
    }

    // Show notification
    showCompareNotification();

    // Get planet details
    const p1 = planetData[planet1];
    const p2 = planetData[planet2];

    // Format the comparison results
    comparisonText.innerHTML = `
        <p><strong>${p1.name}</strong> vs <strong>${p2.name}</strong></p>
        <p><strong>Diameter:</strong> ${p1.diameter} vs ${p2.diameter}</p>
        <p><strong>Distance from Sun:</strong> ${p1.distance} vs ${p2.distance}</p>
        <p><strong>Moons:</strong> ${p1.moons} vs ${p2.moons}</p>
        <p><strong>Orbital Period:</strong> ${p1.orbitalPeriod} vs ${p2.orbitalPeriod}</p>
    `;

    // Show the comparison panel
    comparisonResults.style.display = 'block';
});

// 🛑 Close Comparison Results
closeComparisonResults.addEventListener('click', () => {
    comparisonResults.style.display = 'none';
});

// ❌ Close Compare Panel
closeComparePanel.addEventListener('click', () => {
    document.getElementById('comparePanel').style.display = 'none';
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

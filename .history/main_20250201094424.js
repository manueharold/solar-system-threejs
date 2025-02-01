// ================================
// IMPORTS
// ================================
import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { initScene } from './initScene.js';
import { initLights } from './initLights.js';
import { initSkybox } from './initSkybox.js';
import { loadPlanets, moveToPlanet } from './loadPlanets.js';
import { initControls } from './initControls.js';
import { handleResize, handleMouseEvents } from './handleEvents.js';
import { handleSearchInput } from './searchHandler.js';
import { initSpaceshipMode } from './spaceshipHandler.js';
import { loadOrbitModeModel, updateOrbitModeAnimation } from './loadOrbitModeModel.js';
import { loadDefaultPlanets } from './loadDefaultPlanets.js';

// ================================
// SCENE, CAMERA, RENDERER & CONTROLS INITIALIZATION
// ================================
const { scene, camera, renderer } = initScene();
const controls = initControls(camera, renderer);
const spaceshipControls = initSpaceshipMode(camera, controls);
const clock = new THREE.Clock();

// ================================
// SETUP ENVIRONMENT
// ================================
initLights(scene);
initSkybox(scene);

// ================================
// LOAD INITIAL MODELS
// ================================
loadPlanets(scene);

// ================================
// HANDLE WINDOW RESIZE & MOUSE EVENTS
// ================================
handleResize(camera, renderer);
handleMouseEvents(scene, camera);

// ================================
// ANIMATION LOOP
// ================================
function animate() {
    requestAnimationFrame(animate);
    
    // Update the orbit mode animation mixer (if orbit mode is active)
    const deltaTime = clock.getDelta();
    updateOrbitModeAnimation(deltaTime);
    
    // Update controls and render the scene
    controls.update();
    renderer.render(scene, camera);
}
animate();

// ================================
// SEARCH FUNCTIONALITY
// ================================
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchSuggestions = document.getElementById("searchSuggestions");
    const planetsList = ["Sun", "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Moon"];
    handleSearchInput(searchInput, searchSuggestions, planetsList, camera, controls, scene);
});

// ================================
// MODE TOGGLING: SPACESHIP & ORBIT/ORIGINAL
// ================================
const spaceshipButton = document.getElementById('toggleSpaceshipMode');
const orbitButton = document.getElementById('toggleOrbitMode');

// (Optional) Spaceship Mode Handler
spaceshipButton.addEventListener('click', () => {
    console.log('Spaceship Mode activated!');
    // Add functionality for spaceship mode here if needed.
});

// Orbit Mode Toggle Handler
let orbitModeActive = false;
orbitButton.addEventListener('click', () => {
    if (!orbitModeActive) {
        // Switch to Orbit Mode
        orbitModeActive = true;
        orbitButton.innerText = "Original Mode";
        loadOrbitModeModel(scene, camera, controls);
    } else {
        // Switch to Default (Original) Mode
        orbitModeActive = false;
        orbitButton.innerText = "Orbit Mode";
        loadDefaultPlanets(scene, camera, controls);
    }
});

// ================================
// PLANET INFO PANEL INTERACTIVITY
// ================================
document.addEventListener("click", (event) => {
    // Open Planet Info Panel if a planet element is clicked
    if (event.target.matches(".planet")) {
        const planetName = event.target.dataset.name; // Each planet should have a data-name attribute
        const planetInfo = getPlanetInfo(planetName);    // Ensure getPlanetInfo() is defined elsewhere

        // Populate the planet info panel
        document.getElementById("planetName").innerText = planetName;
        document.getElementById("planetDiameter").innerText = planetInfo.diameter;
        document.getElementById("planetDistance").innerText = planetInfo.distanceFromSun;
        document.getElementById("planetOrbitalPeriod").innerText = planetInfo.orbitalPeriod;
        document.getElementById("planetMoons").innerText = planetInfo.moons;

        // Display the info panel
        const planetInfoPanel = document.getElementById("planetInfoPanel");
        planetInfoPanel.classList.add("active");
    }

    // Close the panel if the close button is clicked
    if (event.target.id === "closeInfoPanel") {
        const planetInfoPanel = document.getElementById("planetInfoPanel");
        planetInfoPanel.classList.remove("active");
    }
});
